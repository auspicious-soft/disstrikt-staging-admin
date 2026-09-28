"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ChatHeader from "@/app/components/ChatHeader";
import ChatMessage from "@/app/components/ChatMessage";
import ChatInput from "@/app/components/ChatInput";
import { generateSignedUrlToUploadOn } from "@/actions";
import { toImageUrl } from "@/hooks/useModelMansion";
import {
  useGetModelMarketProjectChat,
  useMarkModelMarketChatRead,
  useSendModelMarketChatMessage,
} from "@/hooks/useModelMarket";
import { formatDate, formatTime } from "../../model-mansion/[id]/format";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";

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
 * The project's group chat: the client, the accepted models and those
 * models' agents. Admins can read it. An agent whose model accepted can post;
 * users see the message in the app with the agent's name.
 */
const ProjectGroupChat = ({ projectId }: { projectId: string }) => {
  const { kind } = usePanel();
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string | null>(null);
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetModelMarketProjectChat(projectId);
  const { mutate: send, isPending: isSending } = useSendModelMarketChatMessage(projectId);
  const { mutate: markRead } = useMarkModelMarketChatRead(projectId);

  const latest = data?.pages?.[0];
  const members = latest?.members ?? [];
  const agents = latest?.agents ?? [];
  const me = latest?.me;
  const canSend = kind === "agent" && Boolean(me?.canSend);
  const myAgentId = me?.agentId ? String(me.agentId) : "";

  const messages = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page?.data ?? []).reverse(),
    [data],
  );

  // An agent reading the chat has read what's new
  const unreadCount = me?.unreadCount ?? 0;
  useEffect(() => {
    if (kind === "agent" && me?.isMember && unreadCount > 0) markRead();
  }, [kind, me?.isMember, unreadCount, markRead]);

  const newestId = messages[messages.length - 1]?._id ?? null;
  useEffect(() => {
    if (newestId && newestId !== lastMessageId.current) {
      lastMessageId.current = newestId;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [newestId]);

  const title = members.length
    ? [
        ...members.map((member) => formatName(member.fullName)),
        ...agents.map((agent) => `${formatName(agent.fullName)} (Agent)`),
      ].join(", ")
    : "Group Chat";

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

  const footerNote =
    kind === "agent"
      ? latest?.chatId
        ? "Read-only: you can post once one of your models has accepted this booking."
        : null
      : "Read-only: admins can view this group chat but not post in it.";

  return (
    <div className="overflow-hidden rounded-lg bg-[#201C1D]">
      <ChatHeader name={title} />

      <div
        ref={scrollRef}
        className="flex h-[500px] flex-col overflow-y-auto bg-cover bg-center p-5"
        style={{ backgroundImage: "url('/assets/image.png')" }}
      >
        {isPending ? (
          <p className="m-auto text-xs text-stone-400">Loading chat...</p>
        ) : isError ? (
          <p className="m-auto text-xs text-stone-400">Couldn&apos;t load the chat.</p>
        ) : !latest?.chatId ? (
          <p className="m-auto text-center text-xs text-stone-400">
            The group chat starts when the first model accepts the booking.
          </p>
        ) : !messages.length ? (
          <p className="m-auto text-xs text-stone-400">No messages yet.</p>
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
              // Right side = the logged-in agent's own messages
              const isMine =
                item.senderType === "agent" &&
                !!myAgentId &&
                String(item.senderId?._id) === myAgentId;
              const name =
                formatName(item.senderId?.fullName) ||
                (item.senderType === "agent" ? "Agent" : "Deleted user");

              return (
                <Fragment key={item._id}>
                  {showDay && (
                    <div className="flex justify-center">
                      <span className="rounded-full bg-[#36496A] px-3 py-1 text-xs text-white">
                        {day}
                      </span>
                    </div>
                  )}
                  {item.type === "system" ? (
                    <p className="text-center text-[11px] text-stone-300">
                      {item.content}
                    </p>
                  ) : (
                    <ChatMessage
                      message={{
                        id: item._id,
                        sender: isMine ? "me" : "other",
                        senderName: isMine
                          ? undefined
                          : item.senderType === "agent"
                            ? `${name} (Agent)`
                            : name,
                        message: item.content,
                        imageUrl:
                          item.type === "image" ? toImageUrl(item.mediaUrl) : undefined,
                        time: formatTime(item.createdAt),
                        status: isMine ? "sent" : "delivered",
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      {canSend ? (
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
      ) : (
        footerNote && (
          <p className="border-t border-stone-700 bg-[#2B2426] px-4 py-3 text-center text-xs text-stone-400">
            {footerNote}
          </p>
        )
      )}
    </div>
  );
};

export default ProjectGroupChat;
