"use client";

import React, {
  useCallback,
  useRef,
  useEffect,
  useState,
  FormEvent,
  useMemo,
  use,
} from "react";
import Image from "next/image";
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

import { useMessagesQuery, Message, Reaction } from "@/hooks/useMessagesQuery";
import {
  EnrichedMessage,
  useRealtimeMessages,
} from "@/hooks/useRealtimeMessages";
import { storeMessage } from "@/lib/supabase/storeMessages";
import { uploadFileAndStoreMessage } from "@/lib/supabase/uploadFile";
import {
  ArrowDown,
  Mic,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { MdEmojiEmotions } from "react-icons/md";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import PlyrVideoPlayer from "../../PlyrVideoPlayer/PlyrVideoPlayer";
import VoxioAudioPlayer from "../../VoxioAudioPlayer/VoxioAudioPlayer";
import { LinkifiedContent } from "../LinkifiedContent/LinkifiedContent";
import { createClient } from "@/lib/supabase/client";
import { MessageReactions } from "../MessageReactions/MessageReactions";
import { ReactionButton } from "../ReactionButton/ReactionButton";
import { getInitials } from "@/lib/helpers/getInitials";
import { getAttachmentType } from "@/lib/helpers/getAttachmentType";
import { formatTime } from "@/lib/helpers/formatTime";
import { formatTypingText } from "@/lib/helpers/formatTypingText";
import { MessageContextMenu } from "../MessageContextMenu/MessageContextMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReplyPreview from "../ReplyPreview/ReplyPreview";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
}

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
  initialMessages: Message[];
}

export const ChatRoom = ({
  userId,
  currentUsername,
  profileData,
  roomId,
  roomName,
  initialMessages,
}: RealtimeChatProps) => {
  const { messages, isLoading, error, setMessages } = useMessagesQuery(roomId);

  const [messageInput, setMessageInput] = useState("");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  // FILES
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // AUDIO
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const audioChunksRef = useRef<Blob[]>([]);

  const [newMessagesCount, setNewMessagesCount] = useState(0);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const isInitialLoadRef = useRef(true);

  const supabase = createClient();

  const handleEdit = useCallback((msg: Message) => {
    setEditingMessage(msg);
    setMessageInput(msg.content);

    // Optionally if you have a reference to an input add:
    // inputRef.current?.focus();
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingMessage(null);
    setMessageInput("");
  }, []);

  const handleReply = useCallback(
    (msg: Message) => {
      setReplyingTo(msg);
      setMessageInput("");
      // Optional: Move focus to input
      // inputRef.current?.focus();
    },
    [setMessageInput]
  );

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleDelete = useCallback(
    async (msgId: number | string) => {
      if (String(msgId).startsWith("temp-")) return;

      // Optional: confirm deletion
      // if (!window.confirm("Czy na pewno chcesz usunąć tę wiadomość?")) return;

      setMessages((prev) => prev.filter((msg) => msg.id !== msgId));

      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", msgId);

      if (error) {
        console.error("Błąd usuwania wiadomości:", error);
        // Optional: Restore message on error (would require re-fetching)
        alert("Nie udało się usunąć wiadomości.");
      }
    },
    [supabase, setMessages]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getViewport = () => {
    if (!scrollAreaRef.current) return null;
    return scrollAreaRef.current.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;
  };

  const scrollToBottom = useCallback(() => {
    const viewport = getViewport();
    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: "auto",
        });
      });

      setNewMessagesCount(0);
      setIsAtBottom(true);
    }
  }, [setNewMessagesCount, setIsAtBottom]);

  const handleUpdateMessage = useCallback(
    (updatedMessage: Message) => {
      setMessages((prevMessages) => {
        return prevMessages.map((msg) =>
          String(msg.id) === String(updatedMessage.id) ? updatedMessage : msg
        );
      });
    },
    [setMessages]
  );

  const handleNewMessage = useCallback(
    (newMessage: EnrichedMessage) => {
      const enrichedMessage = newMessage;

      setMessages((prevMessages) => {
        const existingTempIndex = prevMessages.findIndex((msg) => {
          if (
            typeof msg.id === "string" &&
            String(msg.id).startsWith("temp-")
          ) {
            return (
              msg.content === enrichedMessage.content &&
              String(msg.user_id) === String(enrichedMessage.user_id)
            );
          }
          return false;
        });

        if (existingTempIndex > -1) {
          return prevMessages.map((msg, i) =>
            i === existingTempIndex ? enrichedMessage : msg
          );
        }

        const exists = prevMessages.some(
          (msg) => String(msg.id) === String(enrichedMessage.id)
        );
        if (exists) return prevMessages;

        return [...prevMessages, enrichedMessage];
      });
    },
    [setMessages]
  );

  const { typingUsers, sendTypingEvent } = useRealtimeMessages(
    roomId,
    currentUsername,
    handleNewMessage,
    handleUpdateMessage
  );

  useEffect(() => {
    const fetchProfiles = async () => {
      const userIds = [
        ...new Set(messages.map((msg) => msg.user_id).filter((id) => id)),
      ];

      if (userIds.length === 0) return;

      const { data, error } = await supabase
        .from("users")
        .select("id, username, avatar_url")
        .in("id", userIds);

      if (error) {
        console.error("Błąd pobierania profili:", error);
        return;
      }

      if (data) {
        setProfiles(data as UserProfile[]);
      }
    };

    fetchProfiles();
  }, [messages.length, supabase]);

  useEffect(() => {
    const previousLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    if (isInitialLoadRef.current && currentLength > 0) {
      scrollToBottom();
      isInitialLoadRef.current = false;
    }

    const newMessageArrived = currentLength > previousLength;
    const addedMessages = currentLength - previousLength;

    if (newMessageArrived) {
      if (isAtBottom) {
        scrollToBottom();
      } else {
        setNewMessagesCount((prevCount) => prevCount + addedMessages);
      }
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages.length, isAtBottom, scrollToBottom]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`room_delete_channel_${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          queueMicrotask(() => {
            if (payload.eventType === "DELETE") {
              const deletedId = payload.old.id;
              setMessages((prevMessages) =>
                prevMessages.filter(
                  (msg) => String(msg.id) !== String(deletedId)
                )
              );
            }
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, setMessages, handleUpdateMessage]);

  const userMap = useMemo(() => {
    if (!profiles || profiles.length === 0) return {};

    return profiles.reduce((acc, profile) => {
      acc[profile.id] = profile.username;
      return acc;
    }, {} as { [userId: string]: string });
  }, [profiles]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleScroll = useCallback(() => {
    const viewport = getViewport();
    if (!viewport) return;

    const buffer = 100;
    const isNearBottom =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <
      buffer;

    setIsAtBottom(isNearBottom);

    if (isNearBottom) {
      setNewMessagesCount(0);
    }
  }, [getViewport, setIsAtBottom, setNewMessagesCount]);

  useEffect(() => {
    const viewport = getViewport();

    if (viewport) {
      viewport.addEventListener("scroll", handleScroll);

      return () => {
        viewport.removeEventListener("scroll", handleScroll);
      };
    }
  }, [handleScroll]);

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
            content: "",
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

  const handleAddReaction = useCallback(
    async (messageId: number | string, emoji: string) => {
      const reactorId = userId;
      if (!reactorId) return;

      let reactionsToSend: Reaction[] | undefined;

      setMessages((prevMessages) => {
        const msgToUpdate = prevMessages.find(
          (msg) => String(msg.id) === String(messageId)
        );

        if (!msgToUpdate) return prevMessages;

        const currentReactions = msgToUpdate.reactions || [];
        const existingReactionIndex = currentReactions.findIndex(
          (r) => r.emoji === emoji
        );

        let newReactions: Reaction[];

        if (existingReactionIndex > -1) {
          const existingReaction = currentReactions[existingReactionIndex];

          const hasReacted = existingReaction.user_ids
            .map(String)
            .includes(String(reactorId));
          let updatedUserIds;

          if (hasReacted) {
            // Reverse reaction
            updatedUserIds = existingReaction.user_ids.filter(
              (id) => String(id) !== String(reactorId)
            );
          } else {
            // Add reaction
            updatedUserIds = [...existingReaction.user_ids, reactorId];
          }

          if (updatedUserIds.length === 0) {
            newReactions = currentReactions.filter((r) => r.emoji !== emoji);
          } else {
            newReactions = currentReactions.map((r, index) =>
              index === existingReactionIndex
                ? {
                    ...r,
                    user_ids: updatedUserIds,
                    count: updatedUserIds.length,
                  }
                : r
            );
          }
        } else {
          newReactions = [
            ...currentReactions,
            {
              emoji,
              user_ids: [reactorId],
              count: 1,
            },
          ];
        }

        reactionsToSend = newReactions;

        return prevMessages.map((msg) =>
          String(msg.id) === String(messageId)
            ? { ...msg, reactions: newReactions }
            : msg
        );
      });

      if (reactionsToSend) {
        const { error } = await supabase
          .from("messages")
          .update({ reactions: reactionsToSend })
          .eq("id", messageId);

        if (error) {
          console.error("Błąd aktualizacji reakcji:", error);
        }
      }
    },
    [userId, setMessages, supabase]
  );

  const handleMenuAddReaction = useCallback(
    async (emoji: string, message: Message) => {
      handleAddReaction(message.id, emoji);
    },
    [handleAddReaction]
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const textInput = messageInput.trim();

    if (!textInput.trim() && !selectedFile) return;

    if (editingMessage) {
      const msgId = editingMessage.id;
      const updatedContent = textInput;

      if (updatedContent === editingMessage.content) {
        cancelEdit();
        return;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === msgId
            ? { ...msg, content: updatedContent, is_edited: true }
            : msg
        )
      );

      cancelEdit();

      const { error } = await supabase
        .from("messages")
        .update({ content: updatedContent, is_edited: true })
        .eq("id", msgId);

      if (error) {
        console.error("Błąd edycji wiadomości:", error);
        // Optional: add UI rollback logic here
        alert("Błąd podczas zapisywania edycji.");
      }
      return;
    }

    const content = textInput;
    const fileToSend = selectedFile;

    const repliedToId = replyingTo
      ? typeof replyingTo.id === "string"
        ? null
        : replyingTo.id
      : null;

    setReplyingTo(null);
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
      reactions: [],
      users: {
        username: currentUsername,
        avatar_url: profileData.avatar_url,
      },
      is_edited: false,
      replied_to_id: repliedToId,
      replied_to_message: replyingTo
        ? {
            content: replyingTo.content,
            username: replyingTo.users?.username || replyingTo.username,
            user_id: replyingTo.user_id,
          }
        : null,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    scrollToBottom();

    let success = false;

    if (fileToSend) {
      const result = await uploadFileAndStoreMessage({
        file: fileToSend,
        currentUsername,
        userId,
        roomId,
        content: content,
        repliedToId: repliedToId,
      });
      success = result.success;
    } else {
      const result = await storeMessage({
        content: content,
        username: currentUsername,
        userId: userId,
        roomId: roomId,
        repliedToId: repliedToId,
      });
      success = result.success;
    }

    if (!success) {
      alert("Sending error! Message will be deleted.");
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      // if (replyingTo) setReplyingTo(replyingTo);
    }
  };

  if (isLoading) return <p className="p-4 text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="flex justify-end items-center h-screen w-full">
      <Card className="shadow-xl h-screen flex flex-col px-0 py-2 rounded-none">
        <CardHeader className="bg-slate-700 gap-0 py-3">
          <CardTitle className="text-xl font-bold flex items-center justify-between">
            <div className="text-slate-100"># {roomName}</div>
            <div className="flex justify-center items-center text-xs font-normal text-gray-500 bg-gray-100 px-2 py-1 rounded-full hover:cursor-pointer">
              {currentUsername}
              <Avatar className="w-8 h-8 ml-2">
                <AvatarImage
                  src={profileData.avatar_url}
                  alt={profileData.username}
                />
              </Avatar>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full w-full px-4" ref={scrollAreaRef}>
            {newMessagesCount > 0 && !isAtBottom && (
              <div className="sticky top-4 z-10 w-full flex justify-center pointer-events-none">
                <Button
                  onClick={scrollToBottom}
                  className="pointer-events-auto shadow-lg bg-indigo-600 hover:bg-indigo-700 text-slate-100 transition-all duration-300"
                  size="sm"
                >
                  {newMessagesCount === 1 ? "Pojawiła się" : "Pojawiły się"}{" "}
                  {newMessagesCount}{" "}
                  {newMessagesCount === 1
                    ? "nowa wiadomość"
                    : "nowe wiadomości"}
                  <ArrowDown size={16} className="ml-2" />
                </Button>
              </div>
            )}

            <div className="flex flex-col space-y-4 pt-4 pb-4">
              {messages.map((msg) => {
                const senderUsername =
                  msg.users?.username || msg.username || "Unknown";
                const senderAvatarUrl = msg.users?.avatar_url || null;
                const isMe = msg.username === currentUsername;
                const isOptimistic = String(msg.id).startsWith("temp-");
                const hasAttachment = !!msg.attachment_url;
                console.log("senderAvatarUrl", senderAvatarUrl);
                console.log("senderUsername", senderUsername);
                console.log("messages", messages);
                console.log("msg", msg);

                const repliedMessageData =
                  Array.isArray(msg.replied_to_message) &&
                  msg.replied_to_message.length > 0
                    ? msg.replied_to_message[0]
                    : msg.replied_to_message;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col w-full group relative mb-4 items-start`}
                  >
                    <div className="flex items-start gap-3 mb-1 w-full">
                      <Avatar className="w-10 h-10 shrink-0 hover:cursor-pointer hover:shadow-md mt-1">
                        <AvatarImage
                          src={senderAvatarUrl || undefined}
                          alt={senderUsername}
                        />
                        <AvatarFallback>
                          {getInitials(senderUsername)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span
                            className={`font-semibold text-sm hover:underline cursor-pointer ${
                              isMe ? "text-indigo-400" : "text-slate-200"
                            }`}
                          >
                            {senderUsername}
                          </span>
                          <span className="text-[0.7rem] text-slate-500">
                            {formatTime(msg.created_at)}
                          </span>
                          {msg.is_edited && (
                            <span className="text-[0.65rem] text-slate-500 italic">
                              (edited)
                            </span>
                          )}
                        </div>

                        <div className="relative w-fit max-w-[85%] group/bubble">
                          {!isOptimistic && (
                            <div className="absolute -top-5 right-0 z-10 opacity-0 group-hover/bubble:opacity-100 transition-opacity duration-200 flex items-center bg-slate-800 border border-slate-700 rounded-md shadow-sm px-1">
                              <ReactionButton
                                msg={msg}
                                isMe={isMe}
                                currentUsername={currentUsername}
                                onAddReaction={handleAddReaction}
                              />

                              <DropdownMenu>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 rounded-sm text-slate-400 hover:text-slate-200"
                                      >
                                        <MoreHorizontal size={14} />
                                      </Button>
                                    </DropdownMenuTrigger>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Więcej opcji</p>
                                  </TooltipContent>
                                </Tooltip>

                                <DropdownMenuContent align="start" side="right">
                                  <DropdownMenuItem
                                    onClick={() => handleReply(msg)}
                                  >
                                    <Reply size={14} className="mr-2" />{" "}
                                    Odpowiedz
                                  </DropdownMenuItem>
                                  {isMe && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() => handleEdit(msg)}
                                      >
                                        <Pencil size={14} className="mr-2" />{" "}
                                        Edytuj
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() => handleDelete(msg.id)}
                                        className="text-red-500 focus:text-red-500"
                                      >
                                        <Trash2 size={14} className="mr-2" />{" "}
                                        Usuń
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}

                          <MessageContextMenu
                            message={msg}
                            currentUserId={userId}
                            onReply={handleReply}
                            onDelete={handleDelete}
                            onAddReaction={handleMenuAddReaction}
                            onEdit={handleEdit}
                          >
                            <div
                              className={`
                                relative flex flex-col px-3 py-2 rounded-md text-sm shadow-sm
                                ${isOptimistic ? "opacity-70" : "opacity-100"}
                                bg-slate-800 text-slate-100 
                              `}
                            >
                              {repliedMessageData && (
                                <div className="flex items-center gap-2 mb-1 ml-1 opacity-80 hover:opacity-100 transition-opacity cursor-pointer">
                                  <div className="w-8 border-t-2 border-l-2 border-slate-600 rounded-tl-md h-3 -mb-3 mt-1" />

                                  <div className="flex gap-1 text-xs text-slate-400 items-center overflow-hidden">
                                    <Avatar className="w-4 h-4">
                                      <AvatarFallback className="text-[8px]">
                                        @
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="font-bold text-indigo-400 whitespace-nowrap">
                                      @{repliedMessageData.username}
                                    </span>

                                    <span className="truncate italic max-w-[200px]">
                                      {repliedMessageData.content
                                        ? repliedMessageData.content
                                        : repliedMessageData.attachment_url
                                        ? "[Załącznik]"
                                        : ""}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {hasAttachment && (
                                <div className="mb-2 mt-1">
                                  {getAttachmentType(msg.attachment_url!) ===
                                    "image" && (
                                    <Image
                                      src={msg.attachment_url!}
                                      alt="Załącznik"
                                      width={300}
                                      height={200}
                                      className="rounded-md object-contain max-h-[300px] w-auto bg-slate-950/50"
                                    />
                                  )}
                                </div>
                              )}

                              {msg.content && (
                                <div className="leading-relaxed whitespace-pre-wrap wrap-break-word">
                                  <LinkifiedContent text={msg.content} />
                                </div>
                              )}

                              {isOptimistic && (
                                <p className="text-[10px] mt-1 text-slate-500 italic select-none">
                                  sending...
                                </p>
                              )}
                            </div>
                          </MessageContextMenu>

                          <div className="mt-1 ml-1">
                            <MessageReactions
                              messageId={msg.id}
                              reactions={msg.reactions || []}
                              isMe={isMe}
                              currentUsername={currentUsername}
                              currentUserId={userId}
                              onAddReaction={handleAddReaction}
                              userMap={userMap}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {typingUsers.length > 0 && (
                <div className="text-sm text-gray-500 ml-12 animate-pulse">
                  {formatTypingText(typingUsers)}
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <CardFooter className="p-4 bg-slate-700 border-t flex flex-col">
          {selectedFile && previewUrl && (
            <div className="w-full flex items-center gap-4 mb-3 p-2 bg-slate-50 rounded-lg border border-slate-200 relative">
              <div className="relative group shrink-0">
                {selectedFile.type.startsWith("image/") ? (
                  <Image
                    src={previewUrl}
                    alt="Podgląd"
                    className="h-16 w-16 object-cover rounded-md border bg-gray-200"
                    width={64}
                    height={64}
                  />
                ) : selectedFile.type.startsWith("video/") ? (
                  <video
                    src={previewUrl}
                    className="h-16 w-16 object-cover rounded-md border bg-black"
                    muted
                    playsInline
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-md border text-gray-500">
                    <Paperclip size={24} />
                  </div>
                )}
                <button
                  onClick={removeSelectedFile}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors shadow-md z-10"
                  title="Usuń plik"
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

          {replyingTo && (
            <ReplyPreview message={replyingTo} onCancel={handleCancelReply} />
          )}

          <form
            onSubmit={handleSubmit}
            className="flex w-full items-center gap-2 p-1 relative"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  onClick={handleMicrophoneClick}
                  className={`p-2 rounded-full transition-colors ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-slate-300 text-gray-800 hover:bg-slate-400"
                  }`}
                  title={isRecording ? "Stop recording" : ""}
                >
                  {isRecording ? (
                    <div className="h-3 w-3 bg-white rounded-sm" />
                  ) : (
                    <Mic size={20} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Record a voice message</p>
              </TooltipContent>
            </Tooltip>

            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp, image/avif, audio/*, video/*"
            />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  className="p-2 bg-slate-300 text-gray-800 hover:bg-slate-400 rounded-full transition-colors"
                  onClick={handleFileClick}
                >
                  <Paperclip size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add file</p>
              </TooltipContent>
            </Tooltip>

            <div className="flex-1 relative border rounded-xl bg-slate-300 focus-within:ring-2 focus-within:ring-slate-400 transition-all flex items-center">
              <TextareaAutosize
                minRows={1}
                maxRows={4}
                maxLength={400}
                placeholder={
                  replyingTo
                    ? `Odpowiedz na wiadomość od ${replyingTo.username}`
                    : `Type message in #${roomName}`
                }
                value={messageInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 w-full rounded-xl bg-slate-300 text-slate-800 border-0 focus:ring-0 resize-none py-3 px-4 text-sm max-h-32 outline-none placeholder:text-slate-500"
              />

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 bg-slate-300 hover:bg-slate-400 mr-1 rounded-full"
                  >
                    <MdEmojiEmotions size={20} />
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
                    autoFocusSearch={true}
                    lazyLoadEmojis={false}
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
              title="Send a message"
              disabled={!messageInput.trim() && !selectedFile}
              className="bg-slate-800 hover:bg-slate-800 rounded-full w-10 h-10 shrink-0 transition-all disabled:cursor-not-allowed"
            >
              <Send size={18} className="text-slate-50" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};
