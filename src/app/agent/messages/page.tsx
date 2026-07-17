"use client";

import {
  Check,
  Paperclip,
  Search,
  SendIcon,
  Smile,
} from "lucide-react";
import React from "react";

const chats = [
  {
    id: "chatgram",
    name: "Chatgram",
    avatar: "",
    initials: "",
    preview: "Chatgram Web was updated.",
    time: "19:48",
    unread: 1,
    tone: "bg-blue-300",
  },
  {
    id: "jessica-drew",
    name: "Jessica Drew",
    avatar: "https://i.pravatar.cc/96?img=47",
    preview: "Ok, see you later",
    time: "18:30",
    unread: 2,
  },
  {
    id: "david-moore",
    name: "David Moore",
    avatar: "https://i.pravatar.cc/96?img=12",
    preview: "You: I don't remember anything",
    time: "18:16",
  },
  {
    id: "greg-james",
    name: "Greg James",
    avatar: "https://i.pravatar.cc/96?img=33",
    preview: "I got a job at SpaceX",
    time: "18:02",
  },
  {
    id: "emily-dorson",
    name: "Emily Dorson",
    avatar: "https://i.pravatar.cc/96?img=5",
    preview: "Table for four, 5PM. Be there.",
    time: "17:42",
  },
  {
    id: "office-chat-early",
    name: "Office Chat",
    avatar: "",
    initials: "",
    preview: "Lewis: All done mate",
    time: "17:06",
    tone: "bg-gradient-to-br from-slate-500 to-orange-300",
  },
  {
    id: "announcements",
    name: "Announcements",
    avatar: "",
    initials: "A",
    preview: "Channel created",
    time: "16:15",
    tone: "bg-green-400",
  },
  {
    id: "little-sister",
    name: "Little Sister",
    avatar: "https://i.pravatar.cc/96?img=44",
    preview: "Tell mom i will be home for tea",
    time: "Wed",
  },
  {
    id: "art-class",
    name: "Art Class",
    avatar: "https://i.pravatar.cc/96?img=60",
    preview: "Emily: Editorial",
    time: "Tue",
  },
  {
    id: "office-chat-late",
    name: "Office Chat",
    avatar: "",
    initials: "",
    preview: "Lewis: All done mate",
    time: "17:08",
    tone: "bg-gradient-to-br from-slate-500 to-orange-300",
  },
];

const threads: Record<
  string,
  {
    from: "them" | "me";
    text: string;
    time: string;
  }[]
> = {
  chatgram: [
    { from: "them", text: "Chatgram Web was updated.", time: "19:48" },
    { from: "me", text: "Thanks, I will check it now.", time: "19:49" },
  ],
  "jessica-drew": [
    { from: "them", text: "Ok, see you later.", time: "18:30" },
    {
      from: "me",
      text: "Perfect, I will send the notes before then.",
      time: "18:31",
    },
  ],
  "david-moore": [
    {
      from: "them",
      text: "Hi, I got a message about auditions.",
      time: "18:12",
    },
    { from: "me", text: "Hi! Thanks for replying.", time: "18:16" },
    {
      from: "me",
      text: "Are you available for a short Zoom audition this week?",
      time: "18:16",
    },
  ],
  "greg-james": [
    { from: "them", text: "I got a job at SpaceX.", time: "18:02" },
    { from: "me", text: "That is huge. Congratulations!", time: "18:04" },
  ],
  "emily-dorson": [
    { from: "them", text: "Table for four, 5PM. Be there.", time: "17:42" },
    { from: "me", text: "Got it. I will be there on time.", time: "17:45" },
  ],
  "office-chat-early": [
    { from: "them", text: "Lewis: All done mate.", time: "17:06" },
    { from: "me", text: "Great, thanks for moving fast.", time: "17:07" },
  ],
  announcements: [
    { from: "them", text: "Channel created.", time: "16:15" },
    { from: "me", text: "Noted.", time: "16:16" },
  ],
  "little-sister": [
    { from: "them", text: "Tell mom i will be home for tea.", time: "Wed" },
    { from: "me", text: "I will let her know.", time: "Wed" },
  ],
  "art-class": [
    { from: "them", text: "Emily: Editorial", time: "Tue" },
    { from: "me", text: "Looks good. Send the final board.", time: "Tue" },
  ],
  "office-chat-late": [
    { from: "them", text: "Lewis: All done mate.", time: "17:08" },
    { from: "me", text: "Nice. Please share the final file.", time: "17:09" },
  ],
};

const doodleBackground = {
  backgroundColor: "#181817",
  backgroundImage:
    "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.035) 0 1px, transparent 1px), radial-gradient(circle at 75% 35%, rgba(255,255,255,0.03) 0 1px, transparent 1px), linear-gradient(135deg, rgba(255,255,255,0.025) 25%, transparent 25%), linear-gradient(45deg, rgba(255,255,255,0.018) 25%, transparent 25%)",
  backgroundPosition: "0 0, 12px 18px, 0 0, 22px 22px",
  backgroundSize: "54px 54px, 72px 72px, 44px 44px, 44px 44px",
};

function Avatar({
  avatar,
  initials,
  tone = "bg-stone-600",
  size = "h-11 w-11",
}: {
  avatar?: string;
  initials?: string;
  tone?: string;
  size?: string;
}) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt=""
        className={`${size} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} ${tone} grid shrink-0 place-items-center rounded-full text-sm font-semibold text-white`}
    >
      {initials}
    </div>
  );
}

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = React.useState("david-moore");
  const [searchQuery, setSearchQuery] = React.useState("");

  const selectedChat =
    chats.find((chat) => chat.id === selectedChatId) ?? chats[0];

  const filteredChats = chats.filter((chat) => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      return true;
    }

    return `${chat.name} ${chat.preview}`.toLowerCase().includes(query);
  });

  const selectedThread = threads[selectedChat.id] ?? [];

  return (
    <main className="mx-auto flex h-[calc(100vh-150px)] min-h-[620px] w-full max-w-7xl overflow-hidden rounded-lg border border-stone-800 bg-[#211c1e] shadow-2xl shadow-black/30">
      <aside className="flex w-full min-w-0 flex-col border-r border-[#404040] bg-[#2d2729] md:max-w-[360px] lg:max-w-[430px]">
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

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
          {filteredChats.map((chat) => {
            const isActive = chat.id === selectedChat.id;

            return (
              <button
                key={chat.id}
                type="button"
                onClick={() => setSelectedChatId(chat.id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                  isActive
                    ? "bg-rose-500 text-white"
                    : "text-stone-200 hover:bg-stone-800/70"
                }`}
              >
                <Avatar
                  avatar={chat.avatar}
                  initials={chat.initials}
                  tone={chat.tone}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold">
                      {chat.name}
                    </span>
                    <span
                      className={`text-[10px] ${
                        isActive ? "text-rose-100" : "text-stone-400"
                      }`}
                    >
                      {chat.time}
                    </span>
                  </span>
                  <span
                    className={`mt-1 flex items-center justify-between gap-2 text-xs ${
                      isActive ? "text-white" : "text-stone-400"
                    }`}
                  >
                    <span className="truncate">{chat.preview}</span>
                    {chat.unread ? (
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-400 text-[11px] font-bold text-white">
                        {chat.unread}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            );
          })}

          {filteredChats.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-stone-500">
              No conversations found.
            </div>
          ) : null}
        </div>
      </aside>

      <section className="hidden min-w-0 flex-1 flex-col md:flex">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-black/20 bg-[#30292c] px-5">
          <Avatar
            avatar={selectedChat.avatar}
            initials={selectedChat.initials}
            tone={selectedChat.tone}
            size="h-10 w-10"
          />
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-white">
              {selectedChat.name}
            </h2>
            <p className="text-xs text-stone-300">Active</p>
          </div>
        </header>

        <div
          className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-6 py-5"
          style={doodleBackground}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-3">
            <div className="self-center rounded-full bg-sky-900/80 px-3 py-1 text-xs font-semibold text-sky-100">
              Today
            </div>

            {selectedThread.map((message) => {
              const isMine = message.from === "me";

              return (
                <div
                  key={`${message.time}-${message.text}`}
                  className={`max-w-[72%] rounded-lg px-3 py-2 text-sm shadow-lg shadow-black/20 ${
                    isMine
                      ? "self-end bg-[#6be66e] text-black"
                      : "self-start bg-[#30292c] text-white"
                  }`}
                >
                  <p>{message.text}</p>
                  <span
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      isMine ? "text-emerald-950/70" : "text-stone-300"
                    }`}
                  >
                    {message.time} <Check className="h-3 w-3" />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <footer className="flex shrink-0 items-center gap-3 bg-[#181817] px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg bg-[#30292c] px-4 py-3 text-stone-400">
            <button type="button" aria-label="Add emoji" className="text-stone-300">
              <Smile className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Attach file" className="text-stone-300">
              <Paperclip className="h-5 w-5" />
            </button>
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-stone-100 outline-none placeholder:text-stone-400"
              placeholder="Message"
            />
            <button type="button" aria-label="Send message" className="text-rose-500 rotate-45">
              <SendIcon className="h-6 w-6 fill-current" />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}
