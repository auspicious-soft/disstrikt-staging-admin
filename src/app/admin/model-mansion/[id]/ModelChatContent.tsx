"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ChatHeader from "@/app/components/ChatHeader";
import ChatMessage from "@/app/components/ChatMessage";
import ChatInput from "@/app/components/ChatInput";
import {
  toImageUrl,
  useGetModelChatMessages,
  useMarkModelChatRead,
  useSendModelChatMessage,
  type ModelChatMessage,
} from "@/hooks/useModelMansion";
import { formatDate, formatTime } from "./format";
import { formatName } from "@/lib/media";
import { getSession } from "@/lib/auth";
import { useOptimisticChat } from "@/hooks/useOptimisticChat";
import { uploadChatImage } from "@/lib/chatUpload";
import { useQueryClient } from "@tanstack/react-query";
import { prependToChatCache } from "@/lib/chatCache";
import { usePanel } from "@/app/components/PanelContext";
import {
  typingLabel,
  useSocket,
  useSocketEvent,
  useTypingEmitter,
  useTypingUsers,
} from "@/app/components/SocketContext";

const MAX_IMAGE_MB = 10;

type ModelChatPageLike = { otherLastReadAt?: string | null };

const dayLabel = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value);
};

const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error) ? error.response?.data?.message || fallback : fallback;

/**
 * Chat tab: the Disstrikt team's one-to-one thread with this model. The model
 * sees the same thread in the app (/api/user/admin-chat).
 */
// `fill`: take the parent's height (agent Messages page) instead of 500px
const ModelChatContent = ({
  modelId,
  modelName,
  fill = false,
}: {
  modelId: string;
  modelName: string;
  fill?: boolean;
}) => {
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string | null>(null);

  const {
    data,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetModelChatMessages(modelId);
  const { mutateAsync: sendRequest } = useSendModelChatMessage(modelId);
  const { mutate: markRead } = useMarkModelChatRead(modelId);

  const send = useCallback(
    (payload: Parameters<typeof sendRequest>[0]) =>
      sendRequest(payload).catch((error) => {
        toast.error(errorMessage(error, "Couldn't send the message"));
        throw error;
      }),
    [sendRequest],
  );
  // Messages show instantly with a clock, then a tick once saved
  const { pending, sendText, sendImage, retry } = useOptimisticChat({
    send,
    uploadImage: uploadChatImage,
  });

  const latestPage = data?.pages?.[0];
  const otherLastReadAt = latestPage?.otherLastReadAt
    ? new Date(latestPage.otherLastReadAt).getTime()
    : 0;

  // The logged-in admin/agent: only their own messages go on the right
  const myId = useMemo(() => String(getSession().admin?._id || ""), []);

  // ---- Live updates over the socket (see backend src/config/socket.ts) ----
  const queryClient = useQueryClient();
  const { mansionApi } = usePanel();
  const { socket } = useSocket();
  const chatQueryKey = useMemo(() => [mansionApi, "modelChatMessages", modelId], [mansionApi, modelId]);
  const modelUserId = latestPage?.userId ? String(latestPage.userId) : "";
  const typingUsers = useTypingUsers();
  const pendingCount = pending.length;

  useSocketEvent<{ userId: string; message: ModelChatMessage }>("admin-chat:message", (event) => {
    if (!modelUserId || String(event?.userId) !== modelUserId || !event.message?._id) return;
    const message = event.message;
    const senderAdminId = String(message.senderAdminId?._id ?? "");
    // My own message: the send itself adds it (unless it came from another tab)
    if (senderAdminId && senderAdminId === myId && pendingCount > 0) return;
    prependToChatCache(queryClient, chatQueryKey, message);
    typingUsers.update(modelUserId, message.senderType === "user" ? "user" : senderAdminId, "", false);
    if (message.senderType === "user") markRead();
  });

  // The model read the chat: update the read ticks
  useSocketEvent<{ userId: string; readBy: string; lastReadAt: string }>("admin-chat:read", (event) => {
    if (String(event?.userId) !== modelUserId || event.readBy !== "user") return;
    queryClient.setQueryData<{ pages: ModelChatPageLike[]; pageParams: unknown[] }>(
      chatQueryKey,
      (old) =>
        old?.pages?.length
          ? {
              ...old,
              pages: [{ ...old.pages[0], otherLastReadAt: event.lastReadAt }, ...old.pages.slice(1)],
            }
          : old,
    );
  });

  useSocketEvent<{ userId: string; isTyping: boolean; senderType: string; adminId?: string; name?: string }>(
    "admin-chat:typing",
    (event) => {
      if (!modelUserId || String(event?.userId) !== modelUserId) return;
      if (event.senderType === "admin" && String(event.adminId) === myId) return;
      const isModel = event.senderType === "user";
      typingUsers.update(
        modelUserId,
        isModel ? "user" : String(event.adminId),
        isModel ? modelName : formatName(event.name) || "Team member",
        Boolean(event.isTyping),
      );
    },
  );

  // Tell the model (and the rest of the team) while this user types
  const { onType, stop: stopTyping } = useTypingEmitter(
    socket && modelUserId
      ? (isTyping) => socket.emit("admin-chat:typing", { userId: modelUserId, isTyping })
      : null,
  );
  const typingText = typingLabel(typingUsers.namesFor(modelUserId));

  // Pages and messages come newest first; show oldest at the top
  const messages: ModelChatMessage[] = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page?.data ?? []).reverse(),
    [data],
  );

  // Mark as read whenever the model has sent something unread
  const unreadCount = latestPage?.unreadCount ?? 0;
  useEffect(() => {
    if (unreadCount > 0) markRead();
  }, [unreadCount, markRead]);

  // Stick to the bottom when a new message arrives (not when loading older ones)
  const newestId =
    pending[pending.length - 1]?.tempId ?? messages[messages.length - 1]?._id ?? null;
  useEffect(() => {
    if (newestId && newestId !== lastMessageId.current) {
      lastMessageId.current = newestId;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [newestId]);

  const handleSend = () => {
    const content = text.trim();
    if (!content) return;
    setText("");
    stopTyping();
    sendText(content);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    onType(value);
  };

  const handleAttach = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only images can be sent");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_IMAGE_MB}MB`);
      return;
    }
    const caption = text.trim();
    setText("");
    stopTyping();
    sendImage(file, caption);
  };

  return (
    <div
      className={`overflow-hidden bg-[#201C1D] ${fill ? "flex h-full flex-col" : "rounded-lg"}`}
    >
      {/* The Messages page shows its own header */}
      {!fill && <ChatHeader name={modelName} />}

      <div
        ref={scrollRef}
        className={`flex flex-col overflow-y-auto bg-cover bg-center p-5 ${
          fill ? "min-h-0 flex-1" : "h-[500px]"
        }`}
        style={{ backgroundImage: "url('/assets/image.png')" }}
      >
        {isPending ? (
          <p className="m-auto text-xs text-stone-400">Loading messages...</p>
        ) : isError ? (
          <p className="m-auto text-xs text-stone-400">Couldn&apos;t load the chat.</p>
        ) : !messages.length && !pending.length ? (
          <p className="m-auto text-center text-xs text-stone-400">
            No messages yet. Say hello to {modelName}. They&apos;ll get a push
            notification and can reply from the app.
          </p>
        ) : (
          <div className="mt-auto space-y-4">
            {hasNextPage && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="rounded-full bg-black/40 px-3 py-1 text-xs text-stone-200 hover:bg-black/60 disabled:opacity-50"
                >
                  {isFetchingNextPage ? "Loading..." : "Load older messages"}
                </button>
              </div>
            )}

            {messages.map((item, index) => {
              const day = dayLabel(item.createdAt);
              const showDay =
                index === 0 || dayLabel(messages[index - 1].createdAt) !== day;
              // Right side = sent by the viewer. Other team members and the
              // model are on the left, with their name.
              const isMine =
                item.senderType === "admin" &&
                !!myId &&
                String(item.senderAdminId?._id) === myId;

              return (
                <Fragment key={item._id}>
                  {showDay && (
                    <div className="flex justify-center">
                      <span className="rounded-full bg-[#36496A] px-3 py-1 text-xs text-white">
                        {day}
                      </span>
                    </div>
                  )}
                  <ChatMessage
                    message={{
                      id: item._id,
                      sender: isMine ? "me" : "other",
                      message: item.content,
                      time: formatTime(item.createdAt),
                      senderName: isMine
                        ? undefined
                        : item.senderType === "admin"
                          ? formatName(item.senderAdminId?.fullName) || "Disstrikt"
                          : modelName,
                      imageUrl:
                        item.type === "image" ? toImageUrl(item.mediaUrl) : undefined,
                      status:
                        isMine && new Date(item.createdAt).getTime() <= otherLastReadAt
                          ? "read"
                          : "sent",
                    }}
                  />
                </Fragment>
              );
            })}

            {pending.map((item) => (
              <ChatMessage
                key={item.tempId}
                message={{
                  id: item.tempId,
                  sender: "me",
                  message: item.content,
                  imageUrl: item.imageUrl,
                  time: formatTime(item.createdAt),
                  status: item.status,
                  onRetry: () => retry(item.tempId),
                }}
              />
            ))}
          </div>
        )}
      </div>

      {typingText && (
        <p className="px-5 pt-2 text-xs italic text-stone-400" aria-live="polite">
          {typingText}
        </p>
      )}

      <div className="p-4">
        <ChatInput
          value={text}
          onChange={handleTextChange}
          onSend={handleSend}
          onAttach={handleAttach}
          disabled={isPending || isError}
        />
      </div>
    </div>
  );
};

export default ModelChatContent;
