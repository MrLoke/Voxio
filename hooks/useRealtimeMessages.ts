import { useEffect, useState, useRef, useCallback } from "react";
import { Message } from "./useMessagesQuery";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const TYPING_TIMEOUT = 3500;

const supabase = createClient();

export function useRealtimeMessages(
  roomId: string,
  currentUsername: string,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [typingUsers, setTypingUsers] = useState<
    Record<string, { lastActive: number }>
  >({});
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        setAuthToken(session.access_token);
        console.log("Sesja użytkownika (JWT) załadowana.");
      } else {
        setAuthToken(null);
        console.log("Brak sesji użytkownika.");
      }
      setSessionLoaded(true);
    });
  }, []);

  const updateTypingStatus = useCallback(
    (user: string, isTyping: boolean) => {
      if (user === currentUsername) return;

      setTypingUsers((prev) => {
        if (isTyping) {
          return { ...prev, [user]: { lastActive: Date.now() } };
        } else {
          const { [user]: _, ...rest } = prev;
          return rest;
        }
      });
    },
    [currentUsername]
  );

  useEffect(() => {
    if (!sessionLoaded) return;

    const channelName = `room:${roomId}`;
    console.log(`Inicjalizacja kanału: ${channelName}`);

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      setIsSubscribed(false);
    }

    const channelOptions = authToken
      ? {
          config: {
            presence: { key: currentUsername },
            headers: { authorization: `Bearer ${authToken}` },
          },
        }
      : undefined;

    channelRef.current = supabase.channel(`public:messages`, channelOptions);

    channelRef.current
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (typeof onNewMessage === "function") {
            onNewMessage(newMessage);
          }
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user, isTyping } = payload.payload;
        updateTypingStatus(user, isTyping);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subskrypcja Realtime pomyślna!");
          setIsSubscribed(true);
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        setIsSubscribed(false);
      }
    };
  }, [
    sessionLoaded,
    authToken,
    onNewMessage,
    currentUsername,
    updateTypingStatus,
    roomId,
  ]);

  useEffect(() => {
    if (Object.keys(typingUsers).length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers((prev) => {
        let shouldUpdate = false;
        const newUsers: Record<string, { lastActive: number }> = {};

        for (const user in prev) {
          if (now - prev[user].lastActive < TYPING_TIMEOUT) {
            newUsers[user] = prev[user];
          } else {
            shouldUpdate = true;
          }
        }
        return shouldUpdate ? newUsers : prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [typingUsers]);

  const sendTypingEvent = (isTyping: boolean) => {
    if (channelRef.current && isSubscribed) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { user: currentUsername, isTyping },
      });
    }
  };

  const activeTypingUsers = Object.keys(typingUsers);

  return { typingUsers: activeTypingUsers, sendTypingEvent };
}
