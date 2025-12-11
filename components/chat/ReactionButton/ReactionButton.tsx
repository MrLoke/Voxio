"use client";

import React, { useState } from "react";
import { Message } from "@/hooks/useMessagesQuery";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { SmilePlus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ReactionButtonProps {
  msg: Message;
  isMe: boolean;
  currentUsername: string;
  onAddReaction: (messageId: number | string, emoji: string) => Promise<void>;
}

export const ReactionButton = ({
  msg,
  onAddReaction,
  isMe,
  currentUsername,
}: ReactionButtonProps) => {
  const [isEmojiPickerTooltipOpen, setIsEmojiPickerTooltipOpen] =
    useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const handleEmojiSelect = (emojiData: EmojiClickData) => {
    if (String(msg.id).startsWith("temp-")) return;

    onAddReaction(msg.id, emojiData.emoji);
    setIsEmojiPickerOpen(false);
    setIsEmojiPickerTooltipOpen(false);
  };

  return (
    <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
      <Tooltip
        open={isEmojiPickerTooltipOpen}
        disableHoverableContent={isEmojiPickerTooltipOpen}
        onOpenChange={setIsEmojiPickerTooltipOpen}
      >
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`w-6 h-6 rounded-full shadow-md hover:bg-slate-800 p-0 text-slate-200 transition-colors`}
            >
              <SmilePlus size={16} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add reactions</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        side={"bottom"}
        align="center"
        className="w-80 p-0 border-none shadow-xl bg-transparent z-100"
      >
        <EmojiPicker
          theme={Theme.AUTO}
          onEmojiClick={handleEmojiSelect}
          reactionsDefaultOpen={true}
          lazyLoadEmojis={true}
          searchDisabled={false}
          autoFocusSearch={true}
          width={300}
          height={350}
        />
      </PopoverContent>
    </Popover>
  );
};
