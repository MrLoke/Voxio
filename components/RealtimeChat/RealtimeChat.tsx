"use client";

import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  FormEvent,
} from "react";
import TextareaAutosize from "react-textarea-autosize";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // Import Avatarów

import { useMessagesQuery, Message } from "@/hooks/useMessagesQuery";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { storeMessage } from "@/lib/supabase/storeMessages";
import { API_DICEBEAR } from "@/lib/constants";
import { Paperclip, Send } from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string;
}

interface RealtimeChatProps {
  userId: string;
  currentUsername: string;
  profileData: ProfileData;
}

// Move this later
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

// Move this later
const getInitials = (name: string) => {
  return (
    name
      .match(/(\b\S)?/g)
      ?.join("")
      .match(/(^\S|\S$)?/g)
      ?.join("")
      .toUpperCase() || name[0].toUpperCase()
  );
};

export function RealtimeChat({
  userId,
  currentUsername,
  profileData,
}: RealtimeChatProps) {
  const { messages, isLoading, error, setMessages } = useMessagesQuery();
  const [messageInput, setMessageInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      setMessages((prevMessages) => {
        const filtered = prevMessages.filter(
          (msg) =>
            !(
              String(msg.id).startsWith("temp-") &&
              msg.content === newMessage.content &&
              msg.username === newMessage.username
            )
        );

        if (filtered.some((m) => String(m.id) === String(newMessage.id))) {
          return filtered;
        }
        return [...filtered, newMessage];
      });
    },
    [setMessages]
  );

  // Realtime + Typing Indicators
  const { typingUsers, sendTypingEvent } = useRealtimeMessages(
    handleNewMessage,
    currentUsername
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, typingUsers]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as FormEvent);
    }
    // Enter + Shift -> new line
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log("Wybrano plik:", file);
      // Implement the sending logic to Supabase Storage
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setMessageInput(e.target.value);

    sendTypingEvent(true);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingEvent(false);
    }, 5000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const content = messageInput;
    setMessageInput("");
    sendTypingEvent(false);

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      content: content,
      username: currentUsername,
      user_id: userId,
      created_at: new Date().toISOString(),
    };

    // Could you add the flag isOptimistic?: boolean field to the Message type?
    setMessages((prev) => [...prev, optimisticMessage]);

    const { success } = await storeMessage({
      content: content,
      username: currentUsername,
      userId: userId,
    });

    if (!success) {
      alert("Błąd wysyłania! Wiadomość zostanie usunięta.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (isLoading) return <p className="p-4 text-center">Ładowanie...</p>;
  if (error) return <p className="text-red-500 text-center">Błąd: {error}</p>;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-lg shadow-xl h-[600px] flex flex-col">
        <CardHeader className="bg-slate-700 gap-0 py-3">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div>#Test Room `roomId`</div>
            <div className="flex justify-center items-center text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:cursor-pointer">
              {currentUsername}
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={profileData.avatar_url}
                  alt={profileData.username}
                />
                <AvatarFallback className="bg-slate-100 text-slate-600">
                  {getInitials(profileData.username)}
                </AvatarFallback>
              </Avatar>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full w-full p-4">
            <div className="flex flex-col space-y-4 pb-4">
              {messages.map((msg) => {
                const isMe = msg.username === currentUsername;
                const isOptimistic = String(msg.id).startsWith("temp-");

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isMe && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`${API_DICEBEAR}${msg.username}`} />
                        <AvatarFallback>
                          {getInitials(msg.username)}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm relative break-all ${
                        isMe
                          ? "bg-slate-600 text-white rounded-br-none"
                          : "bg-gray-100 text-gray-800 rounded-bl-none border"
                      } ${isOptimistic ? "opacity-70" : "opacity-100"}`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold opacity-70 mb-1 text-slate-600">
                          {msg.username}
                        </p>
                      )}

                      <p className="leading-relaxed break-all">{msg.content}</p>

                      <p
                        className={`text-[9px] mt-1 text-right ${
                          isMe ? "text-slate-200" : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                        {isOptimistic && " • wysyłanie..."}
                      </p>
                    </div>

                    {isMe && (
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={profileData.avatar_url}
                          alt={msg.username}
                        />
                        <AvatarFallback className="bg-slate-100 text-slate-600">
                          {getInitials(msg.username)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}

              {/* ------ Typing Indicator ------ */}
              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 ml-10 text-xs text-gray-400 italic animate-pulse">
                  <span>
                    {typingUsers.join(", ")}{" "}
                    {typingUsers.length === 1 ? "pisze..." : "piszą..."}
                  </span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white border-t">
          <form
            onSubmit={handleSubmit}
            className="flex w-full items-end gap-2 p-1 relative"
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/*"
            />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-slate-600 mb-1"
              onClick={handleFileClick}
            >
              <Paperclip size={20} />
            </Button>

            <div className="flex-1 relative border rounded-xl bg-slate-300 focus-within:ring-2 focus-within:ring-slate-100 transition-all flex items-center">
              <TextareaAutosize
                minRows={1}
                maxRows={4}
                placeholder="Type your message..."
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full rounded-xl bg-slate-300 text-slate-600 border-0 focus:ring-0 resize-none py-3 px-4 text-sm max-h-32 outline-none"
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 bg-slate-300 hover:bg-transparent mr-1"
                  >
                    <MdEmojiEmotions />
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  side="top"
                  align="end"
                  className="w-full p-0 border-none shadow-none bg-transparent"
                >
                  <EmojiPicker
                    theme={Theme.AUTO}
                    onEmojiClick={onEmojiClick}
                    lazyLoadEmojis={true}
                    searchDisabled={false}
                    width={300}
                    height={400}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={!messageInput.trim()}
              className="mb-1 bg-slate-600 hover:bg-slate-700 rounded-full w-10 h-10 shrink-0"
            >
              <Send size={18} className="text-slate-50" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
