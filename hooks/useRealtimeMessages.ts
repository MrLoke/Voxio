import { useEffect, useState, useRef } from "react";
import { Message } from "./useMessagesQuery";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createClient();

export function useRealtimeMessages(
  currentUsername: string,
  onNewMessage: (message: Message) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
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

  useEffect(() => {
    if (!sessionLoaded) {
      console.log("Oczekiwanie na załadowanie sesji...");
      return;
    }

    // console.log(
    //   `Inicjalizacja kanału Realtime dla ${currentUsername} (Token: ${
    //     authToken ? "Użyto JWT" : "Anon"
    //   })...`
    // );

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
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
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (typeof onNewMessage === "function") {
            onNewMessage(newMessage);
          } else {
            console.error("Błąd: onNewMessage nie jest funkcją!");
          }
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("Subskrypcja Realtime pomyślna!");
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [sessionLoaded, authToken, onNewMessage, currentUsername]);

  const sendTypingEvent = (isTyping: boolean) => {
    if (channelRef.current && isSubscribed) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { user: currentUsername, isTyping },
      });
    }
  };

  return { typingUsers, sendTypingEvent };
}
