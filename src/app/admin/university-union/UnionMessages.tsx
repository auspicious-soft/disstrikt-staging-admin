"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ADMIN_PANEL, PanelProvider } from "@/app/components/PanelContext";
import ChatInbox from "@/app/components/ChatInbox";
import { UNION_CHATS_KEY, UnionChatType, useUnionChats } from "@/hooks/useUniversityUnion";

/**
 * University Union → Messages: the models' threads with the Disstrikt team
 * and the project / collab group chats, filtered on the server by the page's
 * search and agent filter. Admins read them; the model's agent replies.
 */
export default function UnionMessages({
  search,
  agent,
  type,
}: {
  search: string;
  agent: string;
  type: UnionChatType;
}) {
  const queryClient = useQueryClient();
  const query = useUnionChats({ search: search.trim(), agent, type });
  const chats = React.useMemo(
    () => (query.data?.pages ?? []).flatMap((page) => page?.data ?? []),
    [query.data],
  );

  return (
    <PanelProvider value={ADMIN_PANEL}>
      <ChatInbox
        chats={chats}
        isPending={query.isPending}
        isError={query.isError}
        isFiltered={Boolean(search.trim() || agent)}
        emptyText={
          type === "group"
            ? "No group chats yet."
            : type === "model"
              ? "No model has messaged the team yet."
              : "No conversations yet. Model chats with the team and project group chats appear here."
        }
        noMatchText="No conversations match the search or agent filter."
        onRefresh={() => queryClient.invalidateQueries({ queryKey: UNION_CHATS_KEY })}
        hasMore={Boolean(query.hasNextPage)}
        isLoadingMore={query.isFetchingNextPage}
        onLoadMore={() => {
          if (query.hasNextPage && !query.isFetchingNextPage) query.fetchNextPage();
        }}
        showAgent
        className="h-[calc(100vh-230px)] min-h-[560px]"
      />
    </PanelProvider>
  );
}
