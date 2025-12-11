"use client";

import React, { useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { Message } from "@/hooks/useMessagesQuery";

interface ReactionMenuPickerProps {
  message: Message;
  onReactionSelect: (emoji: string, message: Message) => void;
}

export const ReactionMenuPicker: React.FC<ReactionMenuPickerProps> = ({
  message,
  onReactionSelect,
}) => {
  const [open, setOpen] = useState(true);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onReactionSelect(emojiData.emoji, message);
    setOpen(false);
  };

  return (
    <EmojiPicker
      open={open}
      theme={Theme.AUTO}
      onEmojiClick={handleEmojiClick}
      autoFocusSearch={true}
      lazyLoadEmojis={true}
      searchDisabled={false}
      width={300}
      height={350}
    />
  );
};
