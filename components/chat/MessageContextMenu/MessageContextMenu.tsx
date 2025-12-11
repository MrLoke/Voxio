"use client";

import React from "react";
import { Message } from "@/hooks/useMessagesQuery";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { SmilePlus, Reply, Trash2, Edit2 } from "lucide-react";
import { ReactionMenuPicker } from "../ReactionMenuPicker/ReactionMenuPicker";

interface MessageContextMenuProps {
  message: Message;
  currentUserId: string;
  children: React.ReactNode;
  onReply: (message: Message) => void;
  onEdit: (message: Message) => void;
  onDelete: (messageId: number | string) => void;
  onAddReaction: (emoji: string, message: Message) => void;
}

export const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  message,
  currentUserId,
  children,
  onReply,
  onEdit,
  onDelete,
  onAddReaction,
}) => {
  const isMyMessage = message.user_id === currentUserId;
  const isOptimistic = String(message.id).startsWith("temp-");

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuSub>
          <ContextMenuSubTrigger className="flex items-center gap-2 hover:cursor-pointer">
            <SmilePlus size={16} /> Add reactions
          </ContextMenuSubTrigger>

          <ContextMenuSubContent className="p-0 border-none shadow-xl w-fit">
            <ReactionMenuPicker
              message={message}
              onReactionSelect={onAddReaction}
            />
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem
          onClick={() => onReply(message)}
          className="flex items-center gap-2 hover:cursor-pointer"
        >
          <Reply size={16} /> Reply to message
        </ContextMenuItem>

        {isMyMessage && !isOptimistic && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => onEdit(message)}
              className="flex items-center gap-2 text-amber-500 hover:cursor-pointer"
            >
              <Edit2 size={16} /> Edit message
            </ContextMenuItem>

            <ContextMenuItem
              onClick={() => onDelete(message.id)}
              className="flex items-center gap-2 text-red-500 hover:cursor-pointer"
            >
              <Trash2 size={16} /> Delete message
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
