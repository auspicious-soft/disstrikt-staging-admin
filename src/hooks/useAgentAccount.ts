import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const AVAILABILITY_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export type AvailabilityDay = (typeof AVAILABILITY_DAYS)[number];

export type AgentAvailability = {
  timeZone: string;
  slotMinutes: number;
  // Times are "HH:mm" in timeZone
  days: { day: AvailabilityDay; startTime: string; endTime: string }[];
};

export type AgentProfile = {
  _id: string;
  fullName: string;
  email: string;
  image: string | null;
  // false until the agent saves availability once (models can't book before that)
  hasAvailability: boolean;
  availability: AgentAvailability;
};

export const AGENT_PROFILE_KEY = ["agentProfile"];
export const AGENT_CALLS_KEY = ["agentCalls"];

// The API's error message (validation errors are 400 { message })
export const apiErrorMessage = (error: unknown, fallback = "Something went wrong") =>
  (error as any)?.response?.data?.message || fallback;

// Keeps the stored session (name / photo) in step with the saved profile
const syncSession = (profile: AgentProfile) => {
  if (typeof window === "undefined") return;
  try {
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (!admin) return;
    localStorage.setItem(
      "admin",
      JSON.stringify({ ...admin, fullName: profile.fullName, email: profile.email, image: profile.image }),
    );
  } catch {
    // ignore: the session is only a cache
  }
};

/** GET /agent/profile */
export const useAgentProfile = () =>
  useQuery({
    queryKey: AGENT_PROFILE_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/agent/profile");
      return data.data as AgentProfile;
    },
  });

/** PUT /agent/profile: only the fields sent change. */
export const useUpdateAgentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      fullName?: string;
      email?: string;
      image?: string;
      password?: string;
      confirmPassword?: string;
    }) => {
      const { data } = await axiosInstance.put("/agent/profile", payload);
      return data.data as AgentProfile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(AGENT_PROFILE_KEY, profile);
      syncSession(profile);
    },
  });
};

/** PUT /agent/availability */
export const useUpdateAgentAvailability = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (availability: AgentAvailability) => {
      const { data } = await axiosInstance.put("/agent/availability", availability);
      return data.data as AgentProfile;
    },
    onSuccess: (profile) => queryClient.setQueryData(AGENT_PROFILE_KEY, profile),
  });
};

export type AgentCallTab = "requests" | "upcoming" | "past";

export type AgentCall = {
  _id: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED" | "CANCELLED";
  startTime: string;
  endTime: string;
  // In timeZone (the agent's availability zone)
  date: string;
  time: string;
  timeZone: string;
  meetingLink: string | null;
  note: string | null;
  rejectReason: string | null;
  model: { _id: string; fullName: string; email: string; image: string | null } | null;
};

/** GET /agent/calls */
export const useAgentCalls = (params: {
  tab: AgentCallTab;
  search: string;
  page: number;
  limit: number;
}) =>
  useQuery({
    queryKey: [...AGENT_CALLS_KEY, params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/agent/calls", { params });
      return data.data as {
        tab: AgentCallTab;
        timeZone: string;
        calls: AgentCall[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
      };
    },
    placeholderData: (previous) => previous,
    refetchInterval: 60 * 1000,
  });

/** PUT /agent/calls/:id/approve | reject */
export const useRespondToCall = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (
      action:
        | { id: string; type: "approve"; meetingLink: string }
        | { id: string; type: "reject"; reason?: string },
    ) => {
      const { id, type, ...body } = action;
      const { data } = await axiosInstance.put(`/agent/calls/${id}/${type}`, body);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: AGENT_CALLS_KEY }),
  });
};
