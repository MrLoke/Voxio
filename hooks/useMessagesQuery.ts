import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export type Message = {
  id: string;
  created_at: string;
  content: string;
  user_id: string;
  username: string;
};

export const useMessagesQuery = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("messages")
        .select("id, content, username, user_id, created_at")
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { messages, isLoading, error, setMessages };
};
