import { axiosInstance } from "@/lib/axios";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { usePanel } from "@/app/components/PanelContext";


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
  senderId: { _id: string; fullName: string; image?: string } | null;
  createdAt: string;
};

type ProjectChatPage = {
  chatId: string | null;
  members: { userId: string; fullName: string; image: string | null; role: "owner" | "model" }[];
  data: ProjectChatMessage[];
  hasMore: boolean;
  nextBefore: string | null;
};

// Read-only view of the project's group chat, polled for new messages
export const useGetModelMarketProjectChat = (id: string) => {
  const { marketApi: BASE } = usePanel();
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
    refetchInterval: 10000,
  });
};
