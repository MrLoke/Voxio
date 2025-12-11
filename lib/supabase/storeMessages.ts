import { createClient } from "./client";

type StoreMessageArgs = {
  content: string;
  username: string;
  userId: string;
  roomId: string;
  attachmentUrl?: string | null;
  repliedToId?: number | null;
};

/**
 * @param {StoreMessageArgs} messageData
 * @returns {Promise<{ success: boolean, error: string | null }>}
 */
export const storeMessage = async (messageData: StoreMessageArgs) => {
  const supabase = createClient();

  const {
    content,
    username,
    userId,
    roomId,
    attachmentUrl = null,
    repliedToId = null,
  } = messageData;

  const { data, error } = await supabase
    .from("messages")
    .insert([
      {
        content: content,
        username: username,
        user_id: userId,
        room_id: roomId,
        attachment_url: attachmentUrl,
        replied_to_id: repliedToId,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error.message);
    return { success: false, data: null, error: error.message };
  }

  return { success: true, data, error: null };
};
