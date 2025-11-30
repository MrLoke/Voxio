import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  username: string;
  room_id?: string;
  attachment_url: string | null;
};

export const useMessagesQuery = (roomId: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Błąd pobierania wiadomości:", error.message);
        setError(error.message);
      } else {
        setMessages(data as Message[]);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [roomId]);

  return { messages, isLoading, error, setMessages };
};
