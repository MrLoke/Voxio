export const getAttachmentType = (
  url: string
): "image" | "video" | "audio" | "other" => {
  if (!url) {
    return "other";
  }

  const extension = url.split(".").pop()?.toLowerCase() || "";

  const audioExtensions = ["mp3", "wav", "ogg", "m4a", "flac", "webm"];
  if (audioExtensions.includes(extension)) {
    return "audio";
  }

  const videoExtensions = ["mp4", "mov", "webm", "avi", "mkv", "ts"];
  if (videoExtensions.includes(extension)) {
    return "video";
  }

  const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  if (imageExtensions.includes(extension)) {
    return "image";
  }

  return "other";
};
