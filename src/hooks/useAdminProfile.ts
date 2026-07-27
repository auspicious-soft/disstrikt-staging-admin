import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";

export interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchAdminProfile(): Promise<User> {
  const { data } = await axiosInstance.get<User>("/users/me");
  return data;
}

export function useUserProfile() {
  const hasToken =
    typeof window !== "undefined" && Boolean(localStorage.getItem("token"));

  return useQuery({
    queryKey: ["admin", "me"],
    queryFn: fetchAdminProfile,
    enabled: hasToken,
  });
}