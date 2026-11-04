import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePanel } from "@/app/components/PanelContext";

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
