import { createClient } from "./client";

type NewMessageData = {
  content: string;
  username: string;
  userId: string;
  roomId: string;
  attachmentUrl?: string;
};

/**
 * @param {NewMessageData} messageData
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export const storeMessage = async (messageData: NewMessageData) => {
  const supabase = createClient();
  const { error } = await supabase.from("messages").insert([
    {
      content: messageData.content,
      username: messageData.username,
      user_id: messageData.userId,
    },
  ]);

  if (error) {
    console.error("Error sending message:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
};
