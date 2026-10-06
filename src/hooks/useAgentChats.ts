import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { useSocket } from "@/app/components/SocketContext";

export const AGENT_CHATS_KEY = ["agentChats"];

export type AgentChat = {
  type: "model" | "group";
  // model: the model's user id; group: the chat id
  id: string;
  // group only: booking id used by /agent/model-market/:id/chat/...
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
};

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
