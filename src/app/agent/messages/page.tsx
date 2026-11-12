"use client";

import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AGENT_PANEL, PanelProvider } from "@/app/components/PanelContext";
import ChatInbox, { previewOf } from "@/app/components/ChatInbox";
import { AGENT_CHATS_KEY, useAgentChats } from "@/hooks/useAgentChats";

export default function MessagesPage() {
  const { data, isPending, isError } = useAgentChats();
  const chats = React.useMemo(() => data?.data ?? [], [data]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();

  // The agent's inbox is one list, filtered here
  const query = searchQuery.trim().toLowerCase();
  const filteredChats = query
    ? chats.filter((chat) =>
        `${chat.name} ${chat.participants.join(" ")} ${previewOf(chat)}`
          .toLowerCase()
          .includes(query),
      )
    : chats;

  return (
    <PanelProvider value={AGENT_PANEL}>
      <ChatInbox
        chats={filteredChats}
        isPending={isPending}
        isError={isError}
        isFiltered={Boolean(query)}
        emptyText="No conversations yet. Chats with your assigned models and their project groups appear here."
        search={{ value: searchQuery, onChange: setSearchQuery }}
        onRefresh={() => queryClient.invalidateQueries({ queryKey: AGENT_CHATS_KEY })}
      />
    </PanelProvider>
  );
}
