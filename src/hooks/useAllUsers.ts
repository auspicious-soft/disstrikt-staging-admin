import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

// All Users tab: every app account, via GET /api/admin/getUsers
// (search = name or email, userMode = account type, country = header filter)
export const useAllUsers = (params: {
  page: number;
  limit: number;
  search: string;
  userMode: string;
  country: string;
}) =>
  useQuery({
    queryKey: ["all-users", params],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/getUsers", {
        params: {
          page: params.page,
          limit: params.limit,
          ...(params.search ? { search: params.search } : {}),
          ...(params.userMode ? { userMode: params.userMode } : {}),
          ...(params.country ? { country: params.country } : {}),
        },
      });
      return data?.data;
    },
    placeholderData: (previous) => previous,
  });

// Profile of a non-model account (models open in Model Mansion)
export const useUserProfile = (userId: string) =>
  useQuery({
    queryKey: ["user-profile", userId],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/users/${userId}/profile`);
      return data?.data;
    },
    enabled: !!userId,
  });
