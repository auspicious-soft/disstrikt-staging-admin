import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type DashboardModel = { _id: string; fullName: string | null; image: string | null } | null;

export type DashboardCall = {
  _id: string;
  status: string;
  startTime: string;
  endTime: string;
  date: string;
  time: string;
  meetingLink: string | null;
  note: string | null;
  model: DashboardModel;
};

export type UnionStep = { key: string | null; title: string | null; taskTitle: string | null };

export type AgentDashboard = {
  generatedAt: string;
  timeZone: string;
  agent: {
    fullName: string | null;
    image: string | null;
    availability: { set: boolean; days: number; timeZone: string | null };
  };
  access: { models: boolean; jobs: boolean; market: boolean };
  calls: {
    requests: number;
    urgentRequests: number;
    upcoming: number;
    today: number;
    heldThisMonth: number;
    nextRequests: DashboardCall[];
    nextCalls: DashboardCall[];
  };
  messages: {
    totalUnread: number;
    unreadChats: number;
    recent: {
      type: "model" | "group";
      id: string;
      projectId: string | null;
      name: string;
      image: string | null;
      unreadCount: number;
      lastMessage: { content: string | null; type: string; senderName: string | null; isMine: boolean } | null;
      lastMessageAt: string | null;
    }[];
  } | null;
  models: {
    total: number;
    joinedThisMonth: number;
    activeThisWeek: number;
    byCountry: { country: string; count: number }[];
    plans: { active: number; expired: number; none: number };
    union: {
      totalSteps: number;
      waitingReview: number;
      notStarted: number;
      inProgress: number;
      finished: number;
      stalled: number;
      stallDays: number;
      averageProgress: number;
      reviewQueue: (UnionStep & { model: DashboardModel; pendingSince: string | null })[];
      needsNudge: (UnionStep & { model: DashboardModel; lastCompletedAt: string; percentage: number })[];
    };
    engagement: {
      likes: number;
      views: number;
      saves: number;
      top: { model: NonNullable<DashboardModel>; likes: number; views: number; saves: number }[];
    };
  } | null;
  jobs: {
    total: number;
    thisMonth: number;
    byStatus: Record<"PENDING" | "SELECTED" | "ACCEPTED" | "REJECTED", number>;
    recent: {
      _id: string;
      jobId: string;
      title: string;
      companyName: string | null;
      startDateTime: string | null;
      status: string;
      model: DashboardModel;
      updatedAt: string;
    }[];
  } | null;
  market: {
    total: number;
    awaitingModel: number;
    accepted: number;
    declined: number;
    upcoming: number;
    acceptedValue: { currency: string; amount: number }[];
    awaitingList: DashboardBooking[];
    upcomingList: DashboardBooking[];
  } | null;
};

export type DashboardBooking = {
  _id: string;
  projectName: string;
  modelStatus: string;
  budget: number;
  currency: string;
  nextDate: string | null;
  createdAt: string;
  model: DashboardModel;
};

export const AGENT_DASHBOARD_KEY = ["agentDashboard"];

/** The agent's home (GET /agent/dashboard), refreshed every minute. */
export const useAgentDashboard = () =>
  useQuery({
    queryKey: AGENT_DASHBOARD_KEY,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/agent/dashboard");
      return (data?.data ?? data) as AgentDashboard;
    },
    refetchInterval: 60 * 1000,
    refetchOnWindowFocus: true,
  });
