import { axiosInstance } from "@/lib/axios";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type Money = { currency: string; amount: number };
export type Series = { key: string; values: number[] };

export type AdminDashboard = {
  generatedAt: string;
  timeZone: string;
  range: { months: number; keys: string[]; labels: string[] };
  kpis: {
    users: { total: number; newThisMonth: number; newLastMonth: number; activeThisWeek: number };
    subscribers: {
      active: number;
      trialing: number;
      canceling: number;
      models: number;
      lapsed: number;
      newThisMonth: number;
    };
    revenue: { thisMonth: Money[]; lastMonth: Money[]; thisYear: Money[] };
    balances: { onHold: Money[]; toTransfer: Money[] };
  };
  attention: {
    unionReviews: number;
    unassignedModels: number;
    callRequests: number;
    shoutouts: number;
    studioAttendance: number;
    unreadChats: number;
    frozenEarnings: number;
  };
  series: {
    revenue: { currency: string; total: number; series: Series[] }[];
    signups: Series[];
    subscriptions: Series[];
    jobs: Series[];
    jobApplications: number[];
    activity: Series[];
  };
  subscribersByPlan: {
    plans: { code: string; count: number }[];
    flex: number;
    commitment: number;
    unknown: number;
  };
  table: { subject: string; month: number; year: number }[];
  usersByRole: { role: string; count: number }[];
  usersByCountry: { country: string; users: number; subscribers: number }[];
};

export type DashboardRange = 3 | 6 | 12;

/** Founder dashboard (GET /admin/dashboard?months=), refreshed every 2 minutes. */
export const useAdminDashboard = (months: DashboardRange) =>
  useQuery({
    queryKey: ["adminDashboard", months],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/dashboard", { params: { months } });
      return (data?.data ?? data) as AdminDashboard;
    },
    // Changing the range keeps the last charts on screen while loading
    placeholderData: keepPreviousData,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
