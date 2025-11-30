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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useMessagesQuery, Message } from "@/hooks/useMessagesQuery";
import { useRealtimeMessages } from "@/hooks/useRealtimeMessages";
import { storeMessage } from "@/lib/supabase/storeMessages";
import { uploadFileAndStoreMessage } from "@/lib/supabase/uploadFile";
import { API_DICEBEAR } from "@/lib/constants";
import { Mic, Paperclip, Send, X } from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Image from "next/image";

interface ProfileData {
  id: string;
  username: string;
  avatar_url: string;
}

interface RealtimeChatProps {
  userId: string;
  currentUsername: string;
  profileData: ProfileData;
  roomId: string;
  roomName: string;
}

// HELPER FUNCTIONS
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

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

const formatTypingText = (users: string[]) => {
  const count = users.length;
  if (count === 0) return "";
  if (count === 1) return `${users[0]} pisze...`;
  if (count === 2) return `${users.join(" i ")} piszą...`;
  return `${users.slice(0, 2).join(", ")} i ${count - 2} inni piszą...`;
};

export const RealtimeChat = ({
  userId,
  currentUsername,
  profileData,
  roomId,
  roomName,
}: RealtimeChatProps) => {
  const { messages, isLoading, error, setMessages } = useMessagesQuery(roomId);
  const getAttachmentType = (
    url: string
  ): "image" | "video" | "audio" | "other" => {
    const extension = url.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(extension))
      return "image";
    if (["mp4", "webm", "ogg", "mov", "quicktime"].includes(extension))
      return "video";
    if (["mp3", "wav", "aac", "flac", "m4a"].includes(extension))
      return "audio";
    return "other";
  };

  const [messageInput, setMessageInput] = useState("");

  // FILES
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // AUDIO
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewMessage = useCallback(
    (newMessage: Message) => {
      setMessages((prevMessages) => {
        const isFinalMessage = !String(newMessage.id).startsWith("temp-");

        if (isFinalMessage) {
          const filteredMessages = prevMessages.filter((msg) => {
            const isOptimisticDuplicate =
              String(msg.id).startsWith("temp-") &&
              msg.user_id === newMessage.user_id &&
              msg.content === newMessage.content &&
              (msg.attachment_url ? true : false) ===
                (newMessage.attachment_url ? true : false);

            const isFinalDuplicate = String(msg.id) === String(newMessage.id);
            return !isOptimisticDuplicate && !isFinalDuplicate;
          });
          return [...filteredMessages, newMessage];
        }

        const withoutDuplicates = prevMessages.filter(
          (msg) => String(msg.id) !== String(newMessage.id)
        );
        return [...withoutDuplicates, newMessage];
      });
    },
    [setMessages]
  );

  const { typingUsers, sendTypingEvent } = useRealtimeMessages(
    roomId,
    currentUsername,
    handleNewMessage
  );

  useEffect(() => {
    if (isAtBottom) {
      const timeoutId = setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [isAtBottom, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!scrollAreaRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const newIsAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    if (newIsAtBottom !== isAtBottom) {
      setIsAtBottom(newIsAtBottom);
    }
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
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
    e.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
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
    }, 2000);
  };

  const handleMicrophoneClick = async () => {
    /* CHECK IF API IS AVAILABLE ON MOBILE BROWSERS

    if (typeof window === "undefined" || !navigator.mediaDevices) {
      console.error(
        "API nagrywania nie jest dostępne w tym środowisku (np. SSR lub starsza przeglądarka)."
      );
      alert(
        "Funkcja nagrywania głosu nie jest wspierana na tym urządzeniu/przeglądarce."
      );
      return;
    }
    */

    if (isRecording) {
      mediaRecorder?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const recorder = new MediaRecorder(stream);

        audioChunksRef.current = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });

          const audioFile = new File(
            [audioBlob],
            `voice_memo_${Date.now()}.webm`,
            {
              type: "audio/webm",
            }
          );

          uploadFileAndStoreMessage({
            file: audioFile,
            currentUsername: currentUsername,
            userId: userId,
            roomId: roomId,
            content: "Voice message", // FIX: Optional description
          });

          stream.getTracks().forEach((track) => track.stop());
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error("Microphone access error:", error);
        alert("Could not access microphone. Please allow access.");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() && !selectedFile) return;

    const content = messageInput;
    const fileToSend = selectedFile;

    setMessageInput("");
    removeSelectedFile();
    sendTypingEvent(false);

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage: Message = {
      id: tempId,
      content: content,
      username: currentUsername,
      user_id: userId,
      created_at: new Date().toISOString(),
      room_id: roomId,
      attachment_url: fileToSend ? previewUrl : null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    let success = false;

    if (fileToSend) {
      const result = await uploadFileAndStoreMessage({
        file: fileToSend,
        currentUsername,
        userId,
        roomId,
        content: content,
      });
      success = result.success;
    } else {
      const result = await storeMessage({
        content: content,
        username: currentUsername,
        userId: userId,
        roomId: roomId,
      });
      success = result.success;
    }

    if (!success) {
      alert("Sending error! Message will be deleted.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  if (isLoading) return <p className="p-4 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <Card className="w-full max-w-lg shadow-xl h-[600px] flex flex-col">
        <CardHeader className="bg-slate-700 gap-0 py-3">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="text-white"># {roomName}</div>
            <div className="flex justify-center items-center text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:cursor-pointer">
              {currentUsername}
              <Avatar className="w-8 h-8 ml-2">
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
          <ScrollArea
            className="h-full w-full p-4"
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            <div className="flex flex-col space-y-4 pb-4">
              {messages.map((msg) => {
                const isMe = msg.username === currentUsername;
                const isOptimistic = String(msg.id).startsWith("temp-");
                const hasAttachment = !!msg.attachment_url;

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
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm relative wrap-break-word ${
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

                      {hasAttachment && (
                        <div className="mb-2 mt-1">
                          {getAttachmentType(msg.attachment_url!) ===
                            "image" && (
                            <div className="relative">
                              <Image
                                src={msg.attachment_url!}
                                alt="Załącznik"
                                // Trick for Next Image when we don't know the dimensions:
                                width={0}
                                height={0}
                                sizes="100vw"
                                // w-full h-auto -> maintains proportions
                                // max-h-[400px] -> preventing the entire screen from being occupied
                                className="w-full h-auto max-h-[400px] rounded-lg object-contain"
                                priority={false}
                              />
                            </div>
                          )}

                          {getAttachmentType(msg.attachment_url!) ===
                            "video" && (
                            <div className="relative w-full min-w-[250px] max-w-[480px] aspect-video rounded-lg overflow-hidden">
                              <video
                                src={msg.attachment_url!}
                                controls={true}
                                className="w-full h-full object-contain"
                                preload="metadata"
                                playsInline
                              />
                            </div>
                          )}

                          {getAttachmentType(msg.attachment_url!) ===
                            "audio" && (
                            <div className="w-full min-w-[250px] max-w-[480px] bg-slate-100/10 rounded p-1">
                              <audio
                                src={msg.attachment_url!}
                                controls={true}
                                className="w-full h-auto"
                                preload="metadata"
                              />
                            </div>
                          )}

                          {getAttachmentType(msg.attachment_url!) ===
                            "other" && (
                            <a
                              href={msg.attachment_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-3 bg-slate-200/20 rounded-lg hover:bg-slate-200/30 transition-colors cursor-pointer"
                            >
                              <Paperclip size={16} className="mr-2" />
                              <span className="truncate max-w-[200px] text-xs underline">
                                {msg.content || "Download file"}
                              </span>
                            </a>
                          )}
                        </div>
                      )}

                      {msg.content && (
                        <p className="leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      )}

                      <p
                        className={`text-[9px] mt-1 text-right ${
                          isMe ? "text-slate-200" : "text-gray-400"
                        }`}
                      >
                        {formatTime(msg.created_at)}
                        {isOptimistic && " • sending..."}
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

              {typingUsers.length > 0 && (
                <div className="flex items-center gap-2 ml-10 text-xs text-slate-400 italic animate-pulse">
                  <span>{formatTypingText(typingUsers)}</span>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-white border-t flex flex-col">
          {selectedFile && previewUrl && (
            <div className="w-full flex items-center gap-4 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 relative">
              <div className="relative group">
                <Image
                  src={previewUrl}
                  alt="Podgląd"
                  className="h-16 w-16 object-cover rounded-md border"
                  width={64}
                  height={64}
                />
                <button
                  onClick={removeSelectedFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                  title="Remove selected file"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="flex w-full items-end gap-2 p-1 relative"
          >
            <button
              type="button"
              onClick={handleMicrophoneClick}
              className={`p-2 rounded-full transition-colors ${
                isRecording
                  ? "bg-red-600 text-white"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              title={
                isRecording ? "Stop nagrywanie" : "Nagraj wiadomość głosową"
              }
            >
              {isRecording ? (
                <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
              ) : (
                <Mic size={20} />
              )}
            </button>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpg, image/png, image/webp, image/avif, audio/*, video/*"
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
                placeholder="Napisz wiadomość..."
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
              disabled={!messageInput.trim() && !selectedFile}
              className="mb-1 bg-slate-600 hover:bg-slate-700 rounded-full w-10 h-10 shrink-0"
            >
              <Send size={18} className="text-slate-50" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
