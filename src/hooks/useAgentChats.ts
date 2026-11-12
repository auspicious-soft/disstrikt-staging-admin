import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/app/components/SocketContext";
import type { InboxChat } from "@/app/components/ChatInbox";

export const AGENT_CHATS_KEY = ["agentChats"];

// Same shape as the shared inbox (agentName is admin-only)
export type AgentChat = InboxChat;

// Agent's Messages inbox (GET /agent/chats), polled for new messages
export const useAgentChats = () => {
  // The Messages page refreshes on socket events; polling is the fallback
  const { connected } = useSocket();
  return useQuery({
    queryKey: AGENT_CHATS_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/agent/chats");
      return data?.data as { data: AgentChat[]; totalUnread: number };
    },
    refetchInterval: connected ? 30000 : 10000,
    refetchOnWindowFocus: true,
  });
};
