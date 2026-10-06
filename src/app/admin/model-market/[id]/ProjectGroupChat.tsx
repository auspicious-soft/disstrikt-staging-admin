"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import ChatHeader from "@/app/components/ChatHeader";
import ChatMessage from "@/app/components/ChatMessage";
import ChatInput from "@/app/components/ChatInput";
import { toImageUrl } from "@/hooks/useModelMansion";
import {
  type ProjectChatPage,
  useGetModelMarketProjectChat,
  useMarkModelMarketChatRead,
  useSendModelMarketChatMessage,
} from "@/hooks/useModelMarket";
import { formatDate, formatTime } from "../../model-mansion/[id]/format";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";
import { useOptimisticChat } from "@/hooks/useOptimisticChat";
import { uploadChatImage } from "@/lib/chatUpload";
import { useQueryClient } from "@tanstack/react-query";
import { prependToChatCache } from "@/lib/chatCache";
import {
  tickStatus,
  typingLabel,
  usePresenceLookup,
  useSocket,
  useSocketEvent,
  useTypingEmitter,
  useTypingUsers,
} from "@/app/components/SocketContext";

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
// `fill`: take the parent's height (agent Messages page) instead of 500px
const ProjectGroupChat = ({ projectId, fill = false }: { projectId: string; fill?: boolean }) => {
  const { kind, marketApi } = usePanel();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string | null>(null);
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetModelMarketProjectChat(projectId);
  const { mutateAsync: sendRequest } = useSendModelMarketChatMessage(projectId);
  const { mutate: markRead } = useMarkModelMarketChatRead(projectId);

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

  // ---- Live updates over the socket (see backend src/config/socket.ts) ----
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const chatId = latest?.chatId ? String(latest.chatId) : "";
  const typingUsers = useTypingUsers();
  const pendingCount = pending.length;

  // ---- Read ticks: blue only once everyone else in the group has read ----
  const chatQueryKey = [marketApi, "modelMarketProjectChat", projectId];
  const lookupPresence = usePresenceLookup();

  // Moves a member's or agent's read time forward in the cached chat
  const setReadAt = (id: string, at: string) =>
    queryClient.setQueryData<{ pages: ProjectChatPage[]; pageParams: unknown[] }>(
      chatQueryKey,
      (old) => {
        const first = old?.pages?.[0];
        if (!old || !first) return old;
        const later = (current?: string | null) =>
          !current || new Date(at).getTime() > new Date(current).getTime() ? at : current;
        return {
          ...old,
          pages: [
            {
              ...first,
              members: first.members.map((m) =>
                String(m.userId) === id ? { ...m, lastReadAt: later(m.lastReadAt) } : m,
              ),
              agents: first.agents.map((a) =>
                String(a.agentId) === id ? { ...a, lastReadAt: later(a.lastReadAt) } : a,
              ),
            },
            ...old.pages.slice(1),
          ],
        };
      },
    );

  // Everyone but me: the client, the models and the other agents
  const others = [
    ...members.map((m) => ({
      lastReadAt: m.lastReadAt,
      presence: lookupPresence("user", String(m.userId), { online: m.isOnline, lastSeenAt: m.lastSeenAt }),
    })),
    ...agents
      .filter((a) => String(a.agentId) !== myAgentId)
      .map((a) => ({
        lastReadAt: a.lastReadAt,
        presence: lookupPresence("admin", String(a.agentId), { online: a.isOnline, lastSeenAt: a.lastSeenAt }),
      })),
  ];
  const statusFor = (createdAt: string) => tickStatus(createdAt, others);

  useSocketEvent<{ chatId: string; userId: string; lastReadAt: string }>("chat:read", (event) => {
    if (!chatId || String(event?.chatId) !== chatId) return;
    setReadAt(String(event.userId), event.lastReadAt);
  });

  useSocketEvent<{ chatId: string; message: (typeof messages)[number] }>("chat:message", (event) => {
    if (!chatId || String(event?.chatId) !== chatId || !event.message?._id) return;
    const message = event.message;
    const senderKey = String(message.senderId?._id ?? "");
    const isMine = message.senderType === "agent" && !!myAgentId && senderKey === myAgentId;
    // My own message: the send itself adds it (unless it came from another tab)
    if (isMine && pendingCount > 0) return;
    prependToChatCache(queryClient, chatQueryKey, message);
    if (senderKey) {
      typingUsers.update(chatId, senderKey, "", false);
      // Sending means the sender has read everything before it
      setReadAt(senderKey, message.createdAt);
    }
    if (!isMine && kind === "agent" && me?.isMember) markRead();
  });

  useSocketEvent<{ chatId: string; userId: string; isTyping: boolean; senderType?: string; name?: string }>(
    "chat:typing",
    (event) => {
      if (!chatId || String(event?.chatId) !== chatId) return;
      const who = String(event.userId);
      if (event.senderType === "agent" && who === myAgentId) return;
      const name =
        event.senderType === "agent"
          ? `${formatName(event.name || agents.find((a) => String(a.agentId) === who)?.fullName) || "Agent"} (Agent)`
          : formatName(members.find((m) => String(m.userId) === who)?.fullName) || "Someone";
      typingUsers.update(chatId, who, name, Boolean(event.isTyping));
    },
  );

  const { onType, stop: stopTyping } = useTypingEmitter(
    socket && chatId && canSend
      ? (isTyping) => socket.emit("chat:typing", { chatId, isTyping })
      : null,
  );
  const typingText = typingLabel(typingUsers.namesFor(chatId));

  // An agent reading the chat has read what's new
  const unreadCount = me?.unreadCount ?? 0;
  useEffect(() => {
    if (kind === "agent" && me?.isMember && unreadCount > 0) markRead();
  }, [kind, me?.isMember, unreadCount, markRead]);

  const newestId =
    pending[pending.length - 1]?.tempId ?? messages[messages.length - 1]?._id ?? null;
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

  const footerNote =
    kind === "agent"
      ? latest?.chatId
        ? "Read-only: you can post once one of your models has accepted this booking."
        : null
      : "Read-only: admins can view this group chat but not post in it.";

  return (
    <div
      className={`overflow-hidden bg-[#201C1D] ${fill ? "flex h-full flex-col" : "rounded-lg"}`}
    >
      {/* The Messages page shows its own header */}
      {!fill && <ChatHeader name={title} />}

      <div
        ref={scrollRef}
        className={`chat-scroll flex flex-col overflow-y-auto bg-cover bg-center p-5 ${
          fill ? "min-h-0 flex-1" : "h-[500px]"
        }`}
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
        ) : !messages.length && !pending.length ? (
          <p className="m-auto text-xs text-stone-400">No messages yet.</p>
        ) : (
          <div className="mt-auto pb-1">
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
              // Consecutive messages from one sender: name once, tighter spacing
              const senderId = String(item.senderId?._id ?? name);
              const previous = messages[index - 1];
              const firstInRun =
                showDay ||
                !previous ||
                previous.type === "system" ||
                String(previous.senderId?._id ?? "") !== senderId;

              return (
                <Fragment key={item._id}>
                  {showDay && (
                    <div className="my-3 flex justify-center">
                      <span className="rounded-full bg-[#36496A]/90 px-3 py-1 text-[11px] font-medium text-white shadow">
                        {day}
                      </span>
                    </div>
                  )}
                  {item.type === "system" ? (
                    <div className="my-2 flex justify-center">
                      <p className="max-w-[85%] rounded-lg bg-black/40 px-3 py-1 text-center text-[11.5px] text-stone-200">
                        {item.content}
                      </p>
                    </div>
                  ) : (
                    <ChatMessage
                      message={{
                        id: item._id,
                        sender: isMine ? "me" : "other",
                        senderName:
                          isMine || !firstInRun
                            ? undefined
                            : item.senderType === "agent"
                              ? `${name} (Agent)`
                              : name,
                        senderKey: senderId,
                        firstInRun,
                        message: item.content,
                        imageUrl:
                          item.type === "image" ? toImageUrl(item.mediaUrl) : undefined,
                        time: formatTime(item.createdAt),
                        status: isMine ? statusFor(item.createdAt) : undefined,
                      }}
                    />
                  )}
                </Fragment>
              );
            })}

            {pending.map((item, index) => (
              <ChatMessage
                key={item.tempId}
                message={{
                  id: item.tempId,
                  sender: "me",
                  firstInRun:
                    index === 0 &&
                    String(messages[messages.length - 1]?.senderId?._id ?? "") !== myAgentId,
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

      {canSend ? (
        <div className="p-4">
          <ChatInput
            value={text}
            onChange={handleTextChange}
            onSend={handleSend}
            onAttach={handleAttach}
            disabled={isPending || isError}
          />
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
