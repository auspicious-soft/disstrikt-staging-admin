import { axiosInstance } from "@/lib/axios";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePanel } from "@/app/components/PanelContext";
import { useSocket } from "@/app/components/SocketContext";
import type { InboxChat } from "@/app/components/ChatInbox";

export type UnionSubTaskStatus = "LOCKED" | "AVAILABLE" | "IN_REVIEW" | "REJECTED" | "COMPLETED";

export type UnionSubTask = {
  key: string;
  title: string;
  requiresReview: boolean;
  status: UnionSubTaskStatus;
  rows: { question: string; answer: string; isCorrect?: boolean }[];
  score: { correct: number; total: number } | null;
  uploads: string[];
  attempts: number;
  failedAttempts: number;
  submittedAt: string | null;
  completedAt: string | null;
  reviewedBy: { name: string; role: string } | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export type UnionTask = {
  number: number;
  title: string;
  completed: number;
  total: number;
  status: "LOCKED" | "AVAILABLE" | "COMPLETED";
  subTasks: UnionSubTask[];
};

export type UnionProgress = {
  module: { number: number; title: string };
  completed: number;
  total: number;
  percentage: number;
  isComplete: boolean;
  currentKey: string | null;
  currentTitle: string | null;
  pendingKey: string | null;
  lastCompletedAt: string | null;
};

export type UnionModelRow = {
  _id: string;
  fullName: string;
  email: string;
  agent: string | null;
  chapter: string;
  module: string;
  taskTitle: string | null;
  currentKey: string | null;
  currentTitle: string | null;
  pendingKey: string | null;
  lastCompletedAt: string | null;
  completed: number;
  total: number;
  percentage: number;
};

export type UnionCallRow = {
  _id: string;
  status: string;
  date: string;
  time: string;
  note: string | null;
  meetingLink: string | null;
  agent: { _id: string; fullName: string } | null;
  model: { _id: string; fullName: string; email: string } | null;
};

const UNION_MODELS_KEY = "unionModels";
const UNION_CALLS_KEY = "unionCalls";
const STAFF_PROGRESS_KEY = "modelMansionUniversityUnion";

/** GET /admin/university-union */
export const useUnionModels = (params: {
  page: number;
  limit: number;
  search: string;
  agent: string;
  review: boolean;
}) =>
  useQuery({
    queryKey: [UNION_MODELS_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/university-union", {
        params: { ...params, review: params.review || undefined },
      });
      return data?.data as {
        models: UnionModelRow[];
        pagination: { totalPages: number; total: number };
      };
    },
    placeholderData: (previous) => previous,
  });

/** GET /admin/university-union/calls */
export const useUnionCalls = (params: {
  tab: "requests" | "upcoming";
  page: number;
  limit: number;
  search: string;
  agent: string;
}) =>
  useQuery({
    queryKey: [UNION_CALLS_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/university-union/calls", { params });
      return data?.data as {
        calls: UnionCallRow[];
        pagination: { totalPages: number; total: number };
      };
    },
    placeholderData: (previous) => previous,
  });

export const UNION_CHATS_KEY = ["unionChats"];

export type UnionChatType = "all" | "model" | "group";

/**
 * Messages tab: GET /admin/university-union/chats. Model threads and group
 * chats, newest first, filtered on the server by agent ("" | "unassigned" |
 * agent id), search and type; more pages load as the list scrolls.
 */
export const useUnionChats = (params: { search: string; agent: string; type: UnionChatType }) => {
  // The tab refreshes on socket events; polling is the fallback
  const { connected } = useSocket();
  return useInfiniteQuery({
    queryKey: [...UNION_CHATS_KEY, params],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await axiosInstance.get("/admin/university-union/chats", {
        params: {
          page: pageParam,
          limit: 20,
          ...(params.search ? { search: params.search } : {}),
          ...(params.agent ? { agent: params.agent } : {}),
          ...(params.type !== "all" ? { type: params.type } : {}),
        },
      });
      return data?.data as {
        data: InboxChat[];
        counts: { model: number; group: number };
        pagination: { page: number; total: number; totalPages: number; hasMore: boolean };
      };
    },
    getNextPageParam: (last) =>
      last?.pagination?.hasMore ? last.pagination.page + 1 : undefined,
    placeholderData: (previous) => previous,
    refetchInterval: connected ? 30000 : 10000,
    refetchOnWindowFocus: true,
  });
};

/** PUT /admin/university-union/calls/:id/approve | reject */
export const useRespondUnionCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      type,
      meetingLink,
    }: {
      id: string;
      type: "approve" | "reject";
      meetingLink?: string;
    }) => {
      const { data } = await axiosInstance.put(
        `/admin/university-union/calls/${id}/${type}`,
        type === "approve" ? { meetingLink } : {},
      );
      return data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [UNION_CALLS_KEY] }),
  });
};

/** The model attended a Portfolio Bootcamp, which opens 9.3 (admin and agent panels). */
export const useConfirmUnionBootcamp = (modelId: string) => {
  const { mansionApi: BASE } = usePanel();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.put(`${BASE}/${modelId}/university-union/bootcamp-attended`);
      return data?.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BASE, STAFF_PROGRESS_KEY, modelId] }),
  });
};

/** Approve or reject an upload a model is waiting on (admin and agent panels). */
export const useReviewUnionSubTask = (modelId: string) => {
  const { mansionApi: BASE } = usePanel();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      decision,
      note,
    }: {
      key: string;
      decision: "APPROVE" | "REJECT";
      note?: string;
    }) => {
      const { data } = await axiosInstance.put(
        `${BASE}/${modelId}/university-union/sub-tasks/${key}/review`,
        { decision, note },
      );
      return data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BASE, STAFF_PROGRESS_KEY, modelId] });
      queryClient.invalidateQueries({ queryKey: [UNION_MODELS_KEY] });
      queryClient.invalidateQueries({ queryKey: [BASE] });
    },
  });
};
