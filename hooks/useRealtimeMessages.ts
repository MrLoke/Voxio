import { useEffect, useState, useRef } from "react";
import { Message } from "./useMessagesQuery";
import { createClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

const supabase = createClient();

export const useRealtimeMessages = (
  onNewMessage: (message: Message) => void,
  currentUsername: string
) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    console.log("🔄 Inicjalizacja kanału Realtime...");

    channelRef.current = supabase.channel("chat_room");

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
          onNewMessage(newMessage);
        }
      )
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user, isTyping } = payload.payload;

        if (user === currentUsername) return;

        setTypingUsers((prev) => {
          if (isTyping && !prev.includes(user)) {
            return [...prev, user];
          } else if (!isTyping && prev.includes(user)) {
            return prev.filter((u) => u !== user);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onNewMessage, currentUsername]);

  const sendTypingEvent = (isTyping: boolean) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { user: currentUsername, isTyping },
      });
    }
  };

  return { typingUsers, sendTypingEvent };
};
