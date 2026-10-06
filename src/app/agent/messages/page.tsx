"use client";

import React from "react";
import { ArrowLeft, Camera, Search, Users } from "lucide-react";
import SafeImage from "@/app/components/SafeImage";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";
import ModelChatContent from "@/app/admin/model-mansion/[id]/ModelChatContent";
import ProjectGroupChat from "@/app/admin/model-market/[id]/ProjectGroupChat";
import { AGENT_CHATS_KEY, useAgentChats, type AgentChat } from "@/hooks/useAgentChats";
import { useQueryClient } from "@tanstack/react-query";
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

const chatKey = (chat: AgentChat) => `${chat.type}:${chat.id}`;

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

const previewOf = (chat: AgentChat) => {
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

function ChatAvatar({
  chat,
  size = "h-11 w-11",
  online = false,
}: {
  chat: AgentChat;
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

function AvatarImage({ chat, size }: { chat: AgentChat; size: string }) {
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

export default function MessagesPage() {
  const { data, isPending, isError } = useAgentChats();
  const chats = React.useMemo(() => data?.data ?? [], [data]);

  const [selectedKey, setSelectedKey] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Live: new messages and reads refresh the list; typing shows in the preview.
  // Model threads are keyed by the model's user id, groups by chat id.
  const queryClient = useQueryClient();
  const myId = React.useMemo(() => String(getSession().admin?._id || ""), []);
  const typingUsers = useTypingUsers();
  const refreshList = () => queryClient.invalidateQueries({ queryKey: AGENT_CHATS_KEY });

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
  const presenceOf = (chat: AgentChat): Presence | null =>
    chat.type === "model"
      ? lookupPresence("user", chat.id, { online: chat.isOnline, lastSeenAt: chat.lastSeenAt })
      : null;

  const typingFor = (chat: AgentChat) => {
    const names = typingUsers.namesFor(chatKey(chat));
    if (!names.length) return "";
    return chat.type === "model" && names.length === 1 && names[0] !== "Team member"
      ? "typing..."
      : typingLabel(names);
  };

  // Open the most recent conversation on desktop; phones start on the list
  React.useEffect(() => {
    if (selectedKey || !chats.length) return;
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSelectedKey(chatKey(chats[0]));
    }
  }, [chats, selectedKey]);

  const selectedChat = chats.find((chat) => chatKey(chat) === selectedKey) ?? null;
  const selectedPresence = selectedChat ? presenceOf(selectedChat) : null;

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return `${chat.name} ${chat.participants.join(" ")} ${previewOf(chat)}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <PanelProvider value={AGENT_PANEL}>
      <main className="mx-auto flex h-[calc(100vh-150px)] min-h-[620px] w-full overflow-hidden rounded-lg border border-stone-800 bg-[#211c1e] shadow-2xl shadow-black/30">
        <aside
          className={`min-w-0 flex-col border-r border-[#404040] bg-[#2d2729] md:flex md:max-w-[360px] lg:max-w-[430px] ${
            selectedChat ? "hidden w-full" : "flex w-full"
          }`}
        >
          <div className="px-4 py-3">
            <label className="flex h-9 items-center gap-2 rounded-md border border-stone-700/70 bg-[#252123] px-3 text-stone-500">
              <span className="sr-only">Search</span>
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-stone-200 outline-none placeholder:text-stone-500"
                placeholder="Search"
              />
              <Search className="h-4 w-4" />
            </label>
          </div>

          <div className="chat-scroll min-h-0 flex-1 overflow-y-auto">
            {filteredChats.map((chat) => {
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
                      <span className="truncate text-sm font-semibold">
                        {chat.type === "group" ? chat.name : formatName(chat.name)}
                      </span>
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
                  </span>
                </button>
              );
            })}

            {isPending ? (
              <div className="px-4 py-10 text-center text-sm text-stone-500">
                Loading conversations...
              </div>
            ) : isError ? (
              <div className="px-4 py-10 text-center text-sm text-stone-500">
                Couldn&apos;t load your conversations.
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-stone-500">
                {chats.length
                  ? "No conversations found."
                  : "No conversations yet. Chats with your assigned models and their project groups appear here."}
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
                    {selectedChat.type === "group"
                      ? selectedChat.name
                      : formatName(selectedChat.name)}
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
              Select a conversation to start chatting.
            </div>
          )}
        </section>
      </main>
    </PanelProvider>
  );
}
