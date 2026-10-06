import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Permissions } from "@/lib/permissions";

export interface MyPermissions {
  role: string | null;
  roleId: string | null;
  permissions: Permissions;
}

/** The logged-in staff account's module access (GET /admin/my-permissions). */
export const useMyPermissions = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return useQuery({
    // Keyed by token so a different login never reuses another account's access
    queryKey: ["myPermissions", token],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/my-permissions");
      return (data?.data ?? data) as MyPermissions;
    },
    enabled: Boolean(token),
    // Pick up a founder's changes quickly
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });
};
