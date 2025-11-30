import { createClient } from "./client";
import { storeMessage } from "./storeMessages";

const supabase = createClient();
const BUCKET_NAME = "chat_attachments";

interface UploadMessageData {
  file: File;
  currentUsername: string;
  userId: string;
  roomId: string;
  content?: string;
}

export const uploadFileAndStoreMessage = async ({
  file,
  currentUsername,
  userId,
  roomId,
  content = "",
}: UploadMessageData) => {
  try {
    const fileExtension = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (uploadError) {
      console.error("Błąd uploadu:", uploadError);
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    const { success, error: storeError } = await storeMessage({
      content: content,
      username: currentUsername,
      userId: userId,
      roomId: roomId,
      attachmentUrl: publicUrl,
    });

    if (!success) {
      await supabase.storage.from(BUCKET_NAME).remove([filePath]);
      return { success: false, error: storeError };
    }

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("Unexpected error while uploading:", err);
    return { success: false, error: "Unexpected system error." };
  }
};
