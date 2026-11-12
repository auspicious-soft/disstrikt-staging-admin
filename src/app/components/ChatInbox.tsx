"use client";

/**
 * Two-pane Messages inbox (conversation list + open chat), shared by the
 * agent panel's Messages page and the admin's University Union → Messages
 * tab. Model threads open in ModelChatContent, group chats in
 * ProjectGroupChat; both follow the surrounding PanelProvider (admins only
 * read, agents reply). The parent loads and filters `chats`; this component
 * refreshes them on socket events through `onRefresh`.
 */
import React from "react";
import { ArrowLeft, Camera, Search, Users } from "lucide-react";
import SafeImage from "@/app/components/SafeImage";
import ModelChatContent from "@/app/admin/model-mansion/[id]/ModelChatContent";
import ProjectGroupChat from "@/app/admin/model-market/[id]/ProjectGroupChat";
import { getSession } from "@/lib/auth";
import {
  presenceLabel,
  typingLabel,
  usePresenceLookup,
  useSocketEvent,
  useTypingUsers,
  type Presence,
} from "@/app/components/SocketContext";
import { formatName } from "@/lib/media";

export type InboxChat = {
  type: "model" | "group";
  // model: the model's user id; group: the chat id
  id: string;
  // group only: id the model-market chat routes open it by
  projectId: string | null;
  name: string;
  image: string | null;
  participants: string[];
  lastMessage: {
    content: string;
    type: string;
    senderName: string | null;
    isMine: boolean;
    createdAt: string;
  } | null;
  lastMessageAt: string | null;
  unreadCount: number;
  // admin inbox only: the model's agent / the group's agents (null = none)
  agentName?: string | null;
  // model only
  isOnline?: boolean;
  lastSeenAt?: string | null;
};

export const chatKey = (chat: InboxChat) => `${chat.type}:${chat.id}`;

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

// 14:05 today, a weekday this week, otherwise the date
const listTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  const days = (now.getTime() - date.getTime()) / 86400000;
  if (days < 7) return date.toLocaleDateString([], { weekday: "short" });
  return date.toLocaleDateString([], { day: "2-digit", month: "short" });
};

export const previewOf = (chat: InboxChat) => {
  const last = chat.lastMessage;
  if (!last) return chat.type === "model" ? "No messages yet" : "";
  const body =
    last.type === "image" ? last.content || "Photo" : last.content || "";
  if (last.type === "system" || !last.senderName) return body;
  if (last.isMine) return `You: ${body}`;
  // Group chats and team replies name the sender; the model's own messages don't
  return chat.type === "group" || last.senderName !== chat.name
    ? `${formatName(last.senderName)}: ${body}`
    : body;
};

const displayName = (chat: InboxChat) =>
  chat.type === "group" ? chat.name : formatName(chat.name);

function ChatAvatar({
  chat,
  size = "h-11 w-11",
  online = false,
}: {
  chat: InboxChat;
  size?: string;
  online?: boolean;
}) {
  return (
    <span className="relative shrink-0">
      <AvatarImage chat={chat} size={size} />
      {online && (
        <span
          aria-label="Online"
          className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#2d2729] bg-green-400"
        />
      )}
    </span>
  );
}

function AvatarImage({ chat, size }: { chat: InboxChat; size: string }) {
  const fallback = (
    <div
      className={`${size} grid shrink-0 place-items-center rounded-full text-sm font-semibold text-white ${
        chat.type === "group" ? "bg-gradient-to-br from-slate-500 to-rose-400" : "bg-stone-600"
      }`}
    >
      {chat.type === "group" ? <Users className="h-5 w-5" /> : initialsOf(formatName(chat.name))}
    </div>
  );
  if (chat.type === "group" || !chat.image) return fallback;
  return (
    <SafeImage
      src={chat.image}
      alt=""
      className={`${size} shrink-0 rounded-full object-cover`}
      placeholder={fallback}
    />
  );
}

type ChatInboxProps = {
  chats: InboxChat[];
  isPending: boolean;
  isError: boolean;
  // Shown when there is nothing at all / nothing matches the filters
  emptyText: string;
  noMatchText?: string;
  isFiltered?: boolean;
  // Own search box above the list (the admin tab uses the page's search)
  search?: { value: string; onChange: (value: string) => void };
  // Reload the list (new messages, reads)
  onRefresh: () => void;
  // Paged lists: load the next page when the end of the list scrolls into view
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  // Admin inbox: show each conversation's agent
  showAgent?: boolean;
  className?: string;
};

export default function ChatInbox({
  chats,
  isPending,
  isError,
  emptyText,
  noMatchText = "No conversations found.",
  isFiltered = false,
  search,
  onRefresh,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  showAgent = false,
  className = "h-[calc(100vh-150px)] min-h-[620px]",
}: ChatInboxProps) {
  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);

  // Live: new messages and reads refresh the list; typing shows in the preview.
  // Model threads are keyed by the model's user id, groups by chat id.
  const myId = React.useMemo(() => String(getSession().admin?._id || ""), []);
  const typingUsers = useTypingUsers();
  const refreshRef = React.useRef(onRefresh);
  refreshRef.current = onRefresh;
  const refreshList = () => refreshRef.current();

  useSocketEvent<{ userId: string; message: any }>("admin-chat:message", (event) => {
    typingUsers.update(`model:${event?.userId}`, event?.message?.senderType === "user" ? "user" : String(event?.message?.senderAdminId?._id), "", false);
    refreshList();
  });
  useSocketEvent("admin-chat:read", refreshList);
  useSocketEvent<{ chatId: string; message: any }>("chat:message", (event) => {
    typingUsers.update(`group:${event?.chatId}`, String(event?.message?.senderId?._id), "", false);
    refreshList();
  });
  useSocketEvent<{ userId: string; isTyping: boolean; senderType: string; adminId?: string; name?: string }>(
    "admin-chat:typing",
    (event) => {
      if (event?.senderType === "admin" && String(event.adminId) === myId) return;
      const isModel = event?.senderType === "user";
      typingUsers.update(
        `model:${event?.userId}`,
        isModel ? "user" : String(event?.adminId),
        formatName(event?.name) || (isModel ? "Model" : "Team member"),
        Boolean(event?.isTyping),
      );
    },
  );
  useSocketEvent<{ chatId: string; userId: string; isTyping: boolean; senderType?: string; name?: string }>(
    "chat:typing",
    (event) => {
      if (event?.senderType === "agent" && String(event.userId) === myId) return;
      typingUsers.update(
        `group:${event?.chatId}`,
        String(event?.userId),
        // Users' typing events carry no name; the list just says "typing..."
        formatName(event?.name) || "Someone",
        Boolean(event?.isTyping),
      );
    },
  );
  // Model online / last seen (one-to-one chats only)
  const lookupPresence = usePresenceLookup();
  const presenceOf = (chat: InboxChat): Presence | null =>
    chat.type === "model"
      ? lookupPresence("user", chat.id, { online: chat.isOnline, lastSeenAt: chat.lastSeenAt })
      : null;

  const typingFor = (chat: InboxChat) => {
    const names = typingUsers.namesFor(chatKey(chat));
    if (!names.length) return "";
    return chat.type === "model" && names.length === 1 && names[0] !== "Team member"
      ? "typing..."
      : typingLabel(names);
  };

  // On desktop, open the most recent conversation, and the first match again
  // when the filters hide the open one; phones start on the list
  React.useEffect(() => {
    if (!chats.length) return;
    if (selectedKey && chats.some((chat) => chatKey(chat) === selectedKey)) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSelectedKey(chatKey(chats[0]));
    }
  }, [chats, selectedKey]);

  // Load more when the bottom of the list shows
  const listRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const loadMoreRef = React.useRef(onLoadMore);
  loadMoreRef.current = onLoadMore;
  React.useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore || isLoadingMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) loadMoreRef.current?.();
      },
      { root: listRef.current, rootMargin: "120px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, chats.length]);

  const selectedChat = chats.find((chat) => chatKey(chat) === selectedKey) ?? null;
  const selectedPresence = selectedChat ? presenceOf(selectedChat) : null;

  const agentLine = (chat: InboxChat) =>
    chat.type === "group"
      ? chat.agentName
        ? `Agent: ${chat.agentName}`
        : "No agent in this group"
      : `Agent: ${chat.agentName || "Unassigned"}`;

  return (
    <main
      className={`mx-auto flex w-full overflow-hidden rounded-lg border border-stone-800 bg-[#211c1e] shadow-2xl shadow-black/30 ${className}`}
    >
      <aside
        className={`min-w-0 flex-col border-r border-[#404040] bg-[#2d2729] md:flex md:max-w-[360px] lg:max-w-[430px] ${
          selectedChat ? "hidden w-full" : "flex w-full"
        }`}
      >
        {search && (
          <div className="px-4 py-3">
            <label className="flex h-9 items-center gap-2 rounded-md border border-stone-700/70 bg-[#252123] px-3 text-stone-500">
              <span className="sr-only">Search</span>
              <input
                value={search.value}
                onChange={(event) => search.onChange(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-200 outline-none placeholder:text-stone-500"
                placeholder="Search"
              />
              <Search className="h-4 w-4" />
            </label>
          </div>
        )}

        <div ref={listRef} className="chat-scroll min-h-0 flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const isActive = selectedChat ? chatKey(chat) === chatKey(selectedChat) : false;
            const typing = typingFor(chat);

            return (
              <button
                key={chatKey(chat)}
                type="button"
                onClick={() => setSelectedKey(chatKey(chat))}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  isActive ? "bg-rose-500 text-white" : "text-stone-200 hover:bg-stone-800/70"
                }`}
              >
                <ChatAvatar chat={chat} online={Boolean(presenceOf(chat)?.online)} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold">{displayName(chat)}</span>
                    <span
                      className={`shrink-0 text-[10px] ${
                        isActive ? "text-rose-100" : "text-stone-400"
                      }`}
                    >
                      {listTime(chat.lastMessage?.createdAt ?? chat.lastMessageAt)}
                    </span>
                  </span>
                  <span
                    className={`mt-1 flex items-center justify-between gap-2 text-xs ${
                      isActive ? "text-white" : "text-stone-400"
                    }`}
                  >
                    {typing ? (
                      <span
                        className={`truncate italic ${isActive ? "text-white" : "text-green-400"}`}
                      >
                        {typing}
                      </span>
                    ) : (
                      <span className="flex min-w-0 items-center gap-1">
                        {chat.lastMessage?.type === "image" && (
                          <Camera className="h-3.5 w-3.5 shrink-0" />
                        )}
                        <span className="truncate">
                          {chat.type === "group" ? "Group · " : ""}
                          {previewOf(chat)}
                        </span>
                      </span>
                    )}
                    {chat.unreadCount > 0 ? (
                      <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-green-400 px-1 text-[11px] font-bold text-white">
                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                      </span>
                    ) : null}
                  </span>
                  {showAgent && (
                    <span
                      className={`mt-1 block truncate text-[11px] ${
                        isActive ? "text-rose-100" : "text-stone-500"
                      }`}
                    >
                      {agentLine(chat)}
                    </span>
                  )}
                </span>
              </button>
            );
          })}

          {hasMore && (
            <div ref={sentinelRef} className="px-4 py-3 text-center">
              <button
                type="button"
                onClick={() => onLoadMore?.()}
                disabled={isLoadingMore}
                className="text-xs text-stone-400 hover:text-white disabled:opacity-60"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}

          {isPending ? (
            <div className="px-4 py-10 text-center text-sm text-stone-500">
              Loading conversations...
            </div>
          ) : isError && !chats.length ? (
            <div className="px-4 py-10 text-center text-sm text-stone-500">
              Couldn&apos;t load the conversations.
            </div>
          ) : chats.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-stone-500">
              {isFiltered ? noMatchText : emptyText}
            </div>
          ) : null}
        </div>
      </aside>

      <section
        className={`min-w-0 flex-1 flex-col ${selectedChat ? "flex" : "hidden md:flex"}`}
      >
        {selectedChat ? (
          <>
            <div className="flex shrink-0 items-center gap-3 border-b border-black/20 bg-[#30292c] px-4 py-3 md:px-5">
              <button
                type="button"
                aria-label="Back to conversations"
                onClick={() => setSelectedKey(null)}
                className="text-stone-300 hover:text-white md:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <ChatAvatar
                chat={selectedChat}
                size="h-10 w-10"
                online={Boolean(selectedPresence?.online)}
              />
              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-white">
                  {displayName(selectedChat)}
                </h2>
                {typingFor(selectedChat) ? (
                  <p className="truncate text-xs italic text-green-400">
                    {typingFor(selectedChat)}
                  </p>
                ) : selectedPresence ? (
                  <p
                    className={`truncate text-xs ${
                      selectedPresence.online ? "text-green-400" : "text-stone-300"
                    }`}
                  >
                    {presenceLabel(selectedPresence)}
                    {showAgent && (
                      <span className="text-stone-400"> · {agentLine(selectedChat)}</span>
                    )}
                  </p>
                ) : (
                  <p className="truncate text-xs text-stone-300">
                    {selectedChat.participants.join(", ") || "Project group chat"}
                  </p>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1">
              {selectedChat.type === "model" ? (
                <ModelChatContent
                  key={chatKey(selectedChat)}
                  modelId={selectedChat.id}
                  modelName={formatName(selectedChat.name)}
                  fill
                />
              ) : (
                <ProjectGroupChat
                  key={chatKey(selectedChat)}
                  projectId={selectedChat.projectId as string}
                  fill
                />
              )}
            </div>
          </>
        ) : (
          <div className="m-auto px-6 text-center text-sm text-stone-500">
            {chats.length ? "Select a conversation." : "Conversations appear here."}
          </div>
        )}
      </section>
    </main>
  );
}
