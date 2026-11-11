/**
 * Subscription access, add-ons and shoutouts for the admin panel. Every
 * endpoint is founder-only on the backend (checkAdminAuth + FOUNDER role).
 */
import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ADDON_KEYS = ["PORTFOLIO_SHOOT", "CUSTOM_SHOOT", "CATWALK_BOOTCAMP", "SKILL_BOOTCAMP"] as const;
export type AddonKey = (typeof ADDON_KEYS)[number];

export const ADDON_LABELS: Record<AddonKey, string> = {
  PORTFOLIO_SHOOT: "Portfolio Shoot",
  CUSTOM_SHOOT: "Custom Shoot",
  CATWALK_BOOTCAMP: "Catwalk Bootcamp",
  SKILL_BOOTCAMP: "Skill Bootcamp",
};

export type FeatureStatus = "FULL" | "RESTRICTED" | "ADDON" | "BLURRED" | "NOT_YET_AVAILABLE" | "NEXT_UPDATE";

export const STATUS_LABELS: Record<FeatureStatus, string> = {
  FULL: "Full access",
  RESTRICTED: "Restricted",
  ADDON: "Add-on required",
  BLURRED: "Blurred",
  NOT_YET_AVAILABLE: "Not yet available",
  NEXT_UPDATE: "Next update",
};

export const errorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ?? fallback;

export const useSubscriptionUsers = (params: { page: number; limit: number; search: string; userMode: string }) =>
  useQuery({
    queryKey: ["subscription-users", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/getUsers", {
        params: {
          page: params.page,
          limit: params.limit,
          ...(params.search ? { search: params.search } : {}),
          ...(params.userMode ? { userMode: params.userMode } : {}),
        },
      });
      return data?.data;
    },
  });

export const useUserEntitlements = (userId: string) =>
  useQuery({
    queryKey: ["user-entitlements", userId],
    enabled: !!userId,
    queryFn: async () => (await axiosInstance.get(`/admin/users/${userId}/entitlements`)).data?.data,
  });

export const useUserAddons = (userId: string) =>
  useQuery({
    queryKey: ["user-addons", userId],
    enabled: !!userId,
    queryFn: async () => (await axiosInstance.get(`/admin/users/${userId}/addons`)).data?.data ?? [],
  });

const useRefreshUser = (userId: string) => {
  const client = useQueryClient();
  return () => {
    client.invalidateQueries({ queryKey: ["user-addons", userId] });
    client.invalidateQueries({ queryKey: ["user-entitlements", userId] });
  };
};

export const useGrantAddon = (userId: string) => {
  const refresh = useRefreshUser(userId);
  return useMutation({
    mutationFn: async (payload: { addon: AddonKey; quantity: number; startsAt?: string; expiresAt?: string; note?: string }) =>
      (await axiosInstance.post(`/admin/users/${userId}/addons`, payload)).data,
    onSuccess: refresh,
  });
};

export const useRevokeAddon = (userId: string) => {
  const refresh = useRefreshUser(userId);
  return useMutation({
    mutationFn: async (payload: { addonId: string; note?: string }) =>
      (await axiosInstance.delete(`/admin/users/${userId}/addons/${payload.addonId}`, { data: { note: payload.note } })).data,
    onSuccess: refresh,
  });
};

export const useRefundAddon = (userId: string) => {
  const refresh = useRefreshUser(userId);
  return useMutation({
    mutationFn: async (addonId: string) => (await axiosInstance.post(`/admin/users/${userId}/addons/${addonId}/refund`)).data,
    onSuccess: refresh,
  });
};

export const useAddonProducts = () =>
  useQuery({
    queryKey: ["addon-products"],
    queryFn: async () => (await axiosInstance.get("/admin/addon-products")).data?.data ?? [],
  });

export const useUpdateAddonProduct = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ addon, ...payload }: { addon: AddonKey } & Record<string, any>) =>
      (await axiosInstance.put(`/admin/addon-products/${addon}`, payload)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ["addon-products"] }),
  });
};

export const useEntitlementMatrix = () =>
  useQuery({
    queryKey: ["entitlement-matrix"],
    staleTime: 10 * 60 * 1000,
    queryFn: async () => (await axiosInstance.get("/admin/entitlement-matrix")).data?.data,
  });

export const useShoutouts = (params: { page: number; status: string; search: string }) =>
  useQuery({
    queryKey: ["shoutouts", params],
    queryFn: async () =>
      (
        await axiosInstance.get("/admin/shoutouts", {
          params: { page: params.page, limit: 20, status: params.status, ...(params.search ? { search: params.search } : {}) },
        })
      ).data?.data,
  });

export const useReviewShoutout = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string; action: "APPROVE" | "REJECT" | "POST"; note?: string; postUrl?: string }) =>
      (await axiosInstance.patch(`/admin/shoutouts/${id}`, payload)).data,
    onSuccess: () => client.invalidateQueries({ queryKey: ["shoutouts"] }),
  });
};
