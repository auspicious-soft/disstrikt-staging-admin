import { axiosInstance } from "@/lib/axios";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePanel } from "@/app/components/PanelContext";
import { useSocket } from "@/app/components/SocketContext";
import { AGENT_CHATS_KEY } from "@/hooks/useAgentChats";
import { prependToChatCache } from "@/lib/chatCache";


export type ProjectStatus =
  | "awaiting_payment"
  | "awaiting_models"
  | "confirmed"
  | "rejected"
  | "cancelled";

// Solid pills in the same style as "Confirmed" (#3DA755)
export const PROJECT_STATUS_BADGE: Record<ProjectStatus, { label: string; className: string }> = {
  awaiting_payment: { label: "Awaiting Payment", className: "bg-[#3A7BD5]" },
  awaiting_models: { label: "Awaiting Models", className: "bg-[#E09F1F]" },
  confirmed: { label: "Confirmed", className: "bg-[#3DA755]" },
  rejected: { label: "Rejected", className: "bg-[#E0414F]" },
  cancelled: { label: "Cancelled", className: "bg-[#6B6B6B]" },
};

// Pill that never wraps, whatever the column width
export const STATUS_PILL_CLASS =
  "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-normal leading-none text-white";

export const useGetModelMarketProjects = ({
  page,
  limit,
  search,
  agent,
  country,
  status,
}: {
  page: number;
  limit: number;
  search: string;
  agent: string;
  country: string;
  status: string;
}) => {
  const { marketApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMarketProjects", page, limit, search, agent, country, status],
    queryFn: async () => {
      const { data } = await axiosInstance.get(BASE, {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(agent ? { agent } : {}),
          ...(country ? { country } : {}),
          ...(status ? { status } : {}),
        },
      });
      return data?.data;
    },
    placeholderData: (previous) => previous,
  });
};

export const useGetModelMarketProject = (id: string) => {
  const { marketApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMarketProject", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}`);
      return data?.data;
    },
    enabled: !!id,
  });
};

export type ProjectChatMessage = {
  _id: string;
  type: "text" | "image" | "system";
  content: string;
  mediaUrl: string | null;
  // For agent messages this is the agent
  senderId: { _id: string; fullName: string; image?: string } | null;
  senderType: "user" | "agent" | "system";
  createdAt: string;
};

type ProjectChatPage = {
  chatId: string | null;
  members: { userId: string; fullName: string; image: string | null; role: "owner" | "model" }[];
  agents: { agentId: string; fullName: string; image: string | null; joinedAt: string }[];
  // Agent panel only
  me?: { agentId?: string; isMember: boolean; canSend: boolean; unreadCount: number };
  data: ProjectChatMessage[];
  hasMore: boolean;
  nextBefore: string | null;
};

// The project's group chat, polled for new messages. Admins read it; the
// agents of the accepted models also post in it.
export const useGetModelMarketProjectChat = (id: string) => {
  const { marketApi: BASE, kind } = usePanel();
  // Live updates come over the socket; polling is the fallback
  const { connected } = useSocket();
  return useInfiniteQuery({
    queryKey: [BASE, "modelMarketProjectChat", id],
    queryFn: async ({ pageParam }) => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/chat/messages`, {
        params: { limit: 30, ...(pageParam ? { before: pageParam } : {}) },
      });
      return data?.data as ProjectChatPage;
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore && lastPage.nextBefore ? lastPage.nextBefore : undefined,
    enabled: !!id,
    refetchInterval: connected ? 30000 : kind === "agent" ? 5000 : 10000,
  });
};

// Agent panel only (/agent/model-market/:id/chat/messages)
export const useSendModelMarketChatMessage = (id: string) => {
  const { marketApi: BASE } = usePanel();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: { content: string } | { type: "image"; mediaUrl: string; content?: string },
    ) => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/chat/messages`, payload);
      return data?.data as ProjectChatMessage;
    },
    // Show the saved message right away instead of refetching the history
    onSuccess: (message) => {
      if (message?._id) {
        prependToChatCache(queryClient, [BASE, "modelMarketProjectChat", id], message);
      }
      // The agent's Messages inbox shows the new last message
      queryClient.invalidateQueries({ queryKey: AGENT_CHATS_KEY });
    },
  });
};

export const useMarkModelMarketChatRead = (id: string) => {
  const { marketApi: BASE } = usePanel();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/chat/read`);
      return data?.data;
    },
    // Clears the unread badge in the agent's Messages inbox
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AGENT_CHATS_KEY }),
  });
};
