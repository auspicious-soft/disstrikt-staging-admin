import { axiosInstance } from "@/lib/axios";
import { resolveMediaUrl } from "@/lib/media";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { usePanel } from "@/app/components/PanelContext";


// Best URL for a stored media value (key, full URL or { url, thumbnail }).
// Use <SafeImage> for images so the other buckets and a placeholder are tried.
export const toImageUrl = (value?: unknown) => resolveMediaUrl(value);

// Agent dropdown: admin panel only (agents only ever see their own models)
export const useGetModelMansionAgents = () => {
  const { kind } = usePanel();
  return useQuery({
    queryKey: ["modelMansionAgents"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/model-mansion/agents");
      return data?.data ?? [];
    },
    enabled: kind === "admin",
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetModelMansionModels = ({
  page,
  limit,
  search,
  agent,
  country,
}: {
  page: number;
  limit: number;
  search: string;
  agent: string;
  country: string;
}) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionModels", page, limit, search, agent, country],
    queryFn: async () => {
      const { data } = await axiosInstance.get(BASE, {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(agent ? { agent } : {}),
          ...(country ? { country } : {}),
        },
      });
      return data?.data;
    },
    placeholderData: (previous) => previous,
  });
};

export const useGetModelMansionDetails = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionDetails", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}`);
      return data?.data;
    },
    enabled: !!id,
  });
};

export const useGetModelMansionAchievements = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionAchievements", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/achievements`);
      return data?.data;
    },
    enabled: !!id,
  });
};

export const useGetModelMansionUniversityUnion = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionUniversityUnion", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/university-union`);
      return data?.data;
    },
    enabled: !!id,
  });
};

export const useGetModelMansionBookings = ({
  id,
  page,
  limit,
  modelStatus,
}: {
  id: string;
  page: number;
  limit: number;
  modelStatus: string;
}) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionBookings", id, page, limit, modelStatus],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/bookings`, {
        params: { page, limit, ...(modelStatus ? { modelStatus } : {}) },
      });
      return data?.data;
    },
    enabled: !!id,
    placeholderData: (previous) => previous,
  });
};

export const useGetModelMansionLikesSaves = (id: string, userMode: string) => {
  const { mansionApi: BASE } = usePanel();
  return useQuery({
    queryKey: [BASE, "modelMansionLikesSaves", id, userMode],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/likes-saves`, {
        params: userMode ? { userMode } : {},
      });
      return data?.data;
    },
    enabled: !!id,
    placeholderData: (previous) => previous,
  });
};

export const useSendModelMansionNotification = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useMutation({
    mutationFn: async (payload: { title: string; description: string }) => {
      const { data } = await axiosInstance.post(
        `${BASE}/${id}/notification`,
        payload,
      );
      return data?.data;
    },
  });
};

// ---- Chat with the model (Chat tab) ----

const CHAT_POLL_MS = 5000;

export type ModelChatMessage = {
  _id: string;
  senderType: "admin" | "user";
  senderAdminId: { _id: string; fullName: string; image?: string } | null;
  type: "text" | "image";
  content: string;
  mediaUrl: string | null;
  createdAt: string;
};

type ModelChatPage = {
  chatId: string | null;
  data: ModelChatMessage[];
  hasMore: boolean;
  nextBefore: string | null;
  unreadCount: number;
  otherLastReadAt: string | null;
};

// Newest-first pages; polled so replies from the model show up without a refresh
export const useGetModelChatMessages = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useInfiniteQuery({
    queryKey: [BASE, "modelChatMessages", id],
    queryFn: async ({ pageParam }) => {
      const { data } = await axiosInstance.get(`${BASE}/${id}/chat/messages`, {
        params: { limit: 30, ...(pageParam ? { before: pageParam } : {}) },
      });
      return data?.data as ModelChatPage;
    },
    initialPageParam: "" as string,
    getNextPageParam: (lastPage) =>
      lastPage?.hasMore && lastPage.nextBefore ? lastPage.nextBefore : undefined,
    enabled: !!id,
    refetchInterval: CHAT_POLL_MS,
  });
};

export const useSendModelChatMessage = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload: { content: string } | { type: "image"; mediaUrl: string; content?: string },
    ) => {
      const { data } = await axiosInstance.post(
        `${BASE}/${id}/chat/messages`,
        payload,
      );
      return data?.data as ModelChatMessage;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [BASE, "modelChatMessages", id] }),
  });
};

export const useMarkModelChatRead = (id: string) => {
  const { mansionApi: BASE } = usePanel();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.post(`${BASE}/${id}/chat/read`);
      return data?.data;
    },
  });
};
