"use client";

import { Fragment, useEffect, useMemo, useRef } from "react";
import ChatHeader from "@/app/components/ChatHeader";
import ChatMessage from "@/app/components/ChatMessage";
import { toImageUrl } from "@/hooks/useModelMansion";
import { useGetModelMarketProjectChat } from "@/hooks/useModelMarket";
import { formatDate, formatTime } from "../../model-mansion/[id]/format";
import { formatName } from "@/lib/media";
import { usePanel } from "@/app/components/PanelContext";

const dayLabel = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return formatDate(value);
};

/**
 * The project's group chat (client + accepted models), read-only for admins:
 * admins can monitor it but aren't members.
 */
const ProjectGroupChat = ({ projectId }: { projectId: string }) => {
  const { kind } = usePanel();
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastMessageId = useRef<string | null>(null);
  const { data, isPending, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetModelMarketProjectChat(projectId);

  const latest = data?.pages?.[0];
  const members = latest?.members ?? [];

  const messages = useMemo(
    () => (data?.pages ?? []).flatMap((page) => page?.data ?? []).reverse(),
    [data],
  );

  const newestId = messages[messages.length - 1]?._id ?? null;
  useEffect(() => {
    if (newestId && newestId !== lastMessageId.current) {
      lastMessageId.current = newestId;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    }
  }, [newestId]);

  const title = members.length
    ? members.map((member) => formatName(member.fullName)).join(", ")
    : "Group Chat";

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
                    // Admins/agents only view this chat and never send in it,
                    // so every message is someone else's: all on the left
                    <ChatMessage
                      message={{
                        id: item._id,
                        sender: "other",
                        senderName: formatName(item.senderId?.fullName) || "Deleted user",
                        message: item.content,
                        imageUrl:
                          item.type === "image" ? toImageUrl(item.mediaUrl) : undefined,
                        time: formatTime(item.createdAt),
                        status: "delivered",
                      }}
                    />
                  )}
                </Fragment>
              );
            })}
          </div>
        )}
      </div>

      <p className="border-t border-stone-700 bg-[#2B2426] px-4 py-3 text-center text-xs text-stone-400">
        Read-only: {kind === "agent" ? "agents" : "admins"} can view this group chat but not post in it.
      </p>
    </div>
  );
};

export default ProjectGroupChat;
