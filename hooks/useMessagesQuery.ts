import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Reaction {
  emoji: string;
  count: number;
  user_ids: string[];
}

type Profile = {
  username: string;
  avatar_url: string | null;
};

export type Message = {
  id: number | string;
  created_at: string;
  content: string;
  user_id: string;
  username: string;
  room_id?: string;
  attachment_url: string | null;
  reactions: Reaction[];
  is_edited?: boolean;
  replied_to_id: number | string | null;
  replied_to_message?: {
    username: string;
    content: string;
    attachment_url: string | null;
  } | null;
  users?: Profile | null;
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
        .select(
          `
            *,
            users!messages_user_id_fkey(username, avatar_url),
            replied_to_message:replied_to_id( 
              username,
              content,
              attachment_url
            )
          `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50); // TODO: change the messages limit

      if (error) {
        console.error("Błąd pobierania wiadomości:", error.message);
        setError(error.message);
      } else {
        console.log("Ładowane wiadomości po odświeżeniu:", data);
        setMessages(data as Message[]);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [roomId]);

  return { messages, isLoading, error, setMessages };
};
