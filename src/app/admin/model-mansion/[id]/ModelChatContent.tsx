"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ChatHeader from "@/app/components/ChatHeader";
import ChatMessage from "@/app/components/ChatMessage";
import ChatInput from "@/app/components/ChatInput";
import { generateSignedUrlToUploadOn } from "@/actions";
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

const MAX_IMAGE_MB = 10;

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
const ModelChatContent = ({ modelId, modelName }: { modelId: string; modelName: string }) => {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
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
  const { mutate: send, isPending: isSending } = useSendModelChatMessage(modelId);
  const { mutate: markRead } = useMarkModelChatRead(modelId);

  const latestPage = data?.pages?.[0];
  const otherLastReadAt = latestPage?.otherLastReadAt
    ? new Date(latestPage.otherLastReadAt).getTime()
    : 0;

  // The logged-in admin/agent: only their own messages go on the right
  const myId = useMemo(() => String(getSession().admin?._id || ""), []);

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
  const newestId = messages[messages.length - 1]?._id ?? null;
  useEffect(() => {
    if (newestId && newestId !== lastMessageId.current) {
      lastMessageId.current = newestId;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [newestId]);

  const busy = isSending || uploading;

  const handleSend = () => {
    const content = text.trim();
    if (!content || busy) return;
    send(
      { content },
      {
        onSuccess: () => setText(""),
        onError: (error) => toast.error(errorMessage(error, "Couldn't send the message")),
      },
    );
  };

  const handleAttach = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Only images can be sent");
      return;
    }
    if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_IMAGE_MB}MB`);
      return;
    }

    setUploading(true);
    try {
      const { signedUrl, key } = await generateSignedUrlToUploadOn(
        `chat-${Date.now()}-${file.name.replace(/\s+/g, "-")}`,
        file.type,
      );
      const upload = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("upload failed");

      const caption = text.trim();
      send(
        { type: "image", mediaUrl: key, ...(caption ? { content: caption } : {}) },
        {
          onSuccess: () => setText(""),
          onError: (error) => toast.error(errorMessage(error, "Couldn't send the photo")),
          onSettled: () => setUploading(false),
        },
      );
    } catch {
      toast.error("Couldn't upload the photo");
      setUploading(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-[#201C1D]">
      <ChatHeader name={modelName} />

      <div
        ref={scrollRef}
        className="flex h-[500px] flex-col overflow-y-auto bg-cover bg-center p-5"
        style={{ backgroundImage: "url('/assets/image.png')" }}
      >
        {isPending ? (
          <p className="m-auto text-xs text-stone-400">Loading messages...</p>
        ) : isError ? (
          <p className="m-auto text-xs text-stone-400">Couldn&apos;t load the chat.</p>
        ) : !messages.length ? (
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
          </div>
        )}
      </div>

      <div className="p-4">
        <ChatInput
          value={text}
          onChange={setText}
          onSend={handleSend}
          onAttach={handleAttach}
          disabled={busy || isPending || isError}
        />
        {uploading && (
          <p className="mt-2 text-right text-[10px] text-stone-400">Uploading photo...</p>
        )}
      </div>
    </div>
  );
};

export default ModelChatContent;
