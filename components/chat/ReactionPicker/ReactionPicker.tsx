"use client";

import React, { useState } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import { MdAddReaction } from "react-icons/md";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ReactionPickerProps {
  onEmojiSelect: (emoji: string) => void;
  isMe: boolean;
}

export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  onEmojiSelect,
  isMe,
}) => {
  const [open, setOpen] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center justify-center p-1 rounded-full group-hover:opacity-100 transition-opacity absolute border bg-slate-700 shadow-md z-10 
            ${
              isMe
                ? "-left-2 -bottom-1 text-orange-300 hover:bg-slate-800"
                : "-right-2 -bottom-1 text-orange-300 hover:bg-slate-800"
            }
          `}
          aria-label="Dodaj reakcję"
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        >
          <MdAddReaction size={16} />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0 border-none shadow-xl z-20">
        <EmojiPicker
          open={open}
          theme={Theme.AUTO}
          onEmojiClick={handleEmojiClick}
          lazyLoadEmojis={false}
          autoFocusSearch={false}
          searchDisabled={false}
          width={300}
          height={350}
        />
      </PopoverContent>
    </Popover>
  );
};
