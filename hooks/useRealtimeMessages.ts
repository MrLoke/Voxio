"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SupabaseClient,
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { Message } from "./useMessagesQuery";
import { createClient } from "@/lib/supabase/client";

type UserProfile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

export type EnrichedMessage = Message & {
  users?: UserProfile | null;
  replied_to_message?: {
    username: string;
    content: string;
    attachment_url: string | null;
  } | null;
  client_id?: string | null;
};

const TYPING_TIMEOUT = 3500;
const supabase: SupabaseClient = createClient();

type OnMessageFn = (m: EnrichedMessage) => void;

export const useRealtimeMessages = (
  roomId: string,
  currentUsername: string,
  onNewMessage: OnMessageFn,
  onUpdateMessage: OnMessageFn
) => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentRoomRef = useRef<string | null>(null);

  const onNewMessageRef = useRef<OnMessageFn>(onNewMessage);
  const onUpdateMessageRef = useRef<OnMessageFn>(onUpdateMessage);

  const authTokenRef = useRef<string | null>(null);

  const [typingUsersMap, setTypingUsersMap] = useState<Record<string, number>>(
    {}
  );
  const [sessionLoaded, setSessionLoaded] = useState<boolean>(false);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
  }, [onNewMessage]);

  useEffect(() => {
    onUpdateMessageRef.current = onUpdateMessage;
  }, [onUpdateMessage]);

  useEffect(() => {
    let mounted = true;
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return;
        authTokenRef.current = data.session?.access_token ?? null;
        setSessionLoaded(true);
      })
      .catch((err) => {
        console.warn("Failed to get supabase session for realtime:", err);
        setSessionLoaded(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const enrichMessage = useCallback(
    async (raw: Message): Promise<EnrichedMessage> => {
      try {
        let userPromise = Promise.resolve({ data: null, error: null } as any);

        if (raw.user_id) {
          userPromise = supabase
            .from("users")
            .select("id, username, avatar_url")
            .eq("id", raw.user_id)
            .single();
        }

        let replyPromise = Promise.resolve({ data: null, error: null } as any);

        if (raw.replied_to_id) {
          replyPromise = supabase
            .from("messages")
            .select("username, content, attachment_url")
            .eq("id", raw.replied_to_id)
            .single();
        }

        const [userResult, replyResult] = await Promise.all([
          userPromise,
          replyPromise,
        ]);

        const users =
          userResult.data != null
            ? {
                username: userResult.data.username,
                avatar_url: userResult.data.avatar_url,
              }
            : {
                username: raw.username || "Unknown",
                avatar_url: null,
              };

        const repliedToMessage =
          replyResult.data != null
            ? {
                username: replyResult.data.username || "Unknown",
                content: replyResult.data.content || "",
                attachment_url: replyResult.data.attachment_url || null,
              }
            : null;

        return {
          ...raw,
          users,
          replied_to_message: repliedToMessage,
        } as EnrichedMessage;
      } catch (err) {
        console.error("Error enriching message:", err);
        return {
          ...raw,
          users: { username: raw.username || "Unknown", avatar_url: null },
          replied_to_message: null,
        } as EnrichedMessage;
      }
    },
    []
  );

  const handleInsertPayload = useCallback(
    async (payload: RealtimePostgresChangesPayload<Message> | null) => {
      if (!payload || !payload.new) return;
      const raw = payload.new as Message;
      const enriched = await enrichMessage(raw);
      onNewMessageRef.current(enriched);
    },
    [enrichMessage]
  );

  const handleUpdatePayload = useCallback(
    async (payload: RealtimePostgresChangesPayload<Message> | null) => {
      if (!payload || !payload.new) return;
      const raw = payload.new as Message;
      const enriched = await enrichMessage(raw);
      onUpdateMessageRef.current(enriched);
    },
    [enrichMessage]
  );

  useEffect(() => {
    if (Object.keys(typingUsersMap).length === 0) return;
    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const next: Record<string, number> = {};
      for (const k of Object.keys(typingUsersMap)) {
        if (now - typingUsersMap[k] < TYPING_TIMEOUT) {
          next[k] = typingUsersMap[k];
        } else {
          changed = true;
        }
      }
      if (changed) setTypingUsersMap(next);
    }, 1000);
    return () => clearInterval(interval);
  }, [typingUsersMap]);

  useEffect(() => {
    if (!sessionLoaded || !roomId) return;

    if (channelRef.current && currentRoomRef.current === roomId) {
      return;
    }

    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        /* ignore */
      }
      channelRef.current = null;
      currentRoomRef.current = null;
      queueMicrotask(() => setIsSubscribed(false));
    }

    const options =
      authTokenRef.current != null
        ? {
            config: {
              presence: { key: currentUsername },
              headers: { authorization: `Bearer ${authTokenRef.current}` },
            },
          }
        : undefined;

    const ch = supabase.channel(`room_messages:${roomId}`, options);

    ch.on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      },
      (payload: RealtimePostgresChangesPayload<Message>) => {
        void handleInsertPayload(payload);
      }
    )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload: RealtimePostgresChangesPayload<Message>) => {
          void handleUpdatePayload(payload);
        }
      )
      .on("broadcast", { event: "typing" }, (incoming) => {
        try {
          const payload = incoming.payload ?? incoming;
          const user = payload?.user as string | undefined;
          const isTyping = Boolean(
            payload?.isTyping ?? payload?.is_typing ?? payload?.isTyping
          );
          if (!user || user === currentUsername) return;
          setTypingUsersMap((prev) => {
            const copy = { ...prev };
            if (isTyping) copy[user] = Date.now();
            else delete copy[user];
            return copy;
          });
        } catch {}
      })
      .subscribe((status) => {
        const s = String(status);
        const subscribed = s === "SUBSCRIBED" || s === "CHANNEL_JOINED";
        setIsSubscribed(subscribed);
      });

    channelRef.current = ch;
    currentRoomRef.current = roomId;

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          /* ignore */
        }
        channelRef.current = null;
        currentRoomRef.current = null;
        setIsSubscribed(false);
      }
    };
  }, [
    roomId,
    sessionLoaded,
    currentUsername,
    handleInsertPayload,
    handleUpdatePayload,
  ]);

  const sendTypingEvent = useCallback(
    (isTyping: boolean) => {
      const ch = channelRef.current;
      if (!ch || !isSubscribed) return;
      try {
        ch.send({
          type: "broadcast",
          event: "typing",
          payload: { user: currentUsername, isTyping },
        });
        if (isTyping) {
          setTypingUsersMap((prev) => ({
            ...prev,
            [currentUsername]: Date.now(),
          }));
        } else {
          setTypingUsersMap((prev) => {
            const copy = { ...prev };
            delete copy[currentUsername];
            return copy;
          });
        }
      } catch (err) {
        console.warn("Failed to send typing event", err);
      }
    },
    [currentUsername, isSubscribed]
  );

  const typingUsers = Object.keys(typingUsersMap).filter(
    (u) => u !== currentUsername
  );

  const reconnect = useCallback(() => {
    if (!currentRoomRef.current) return;
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        /* ignore */
      }
      channelRef.current = null;
      setIsSubscribed(false);
    }
  }, []);

  return {
    typingUsers,
    sendTypingEvent,
    isSubscribed,
    reconnect,
  } as const;
};
