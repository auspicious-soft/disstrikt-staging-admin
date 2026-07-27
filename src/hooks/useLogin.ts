import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authAxios } from "@/lib/axios";

interface LoginPayload {
  email: string;
  password: string | number;
}

interface ForgetPassword {
  email:string
}

interface AdminData {
  _id: string;
  fullName: string;
  email: string;
  image: string;
  country: string;
  language: string[];
  authType: string;
  role: string;
  roleId: string;
  token: string;
  isBlocked: boolean;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data: AdminData;
}

const loginRequest = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  const { data } = await authAxios.post<LoginResponse>(
    "/admin/login",
    payload
  );

  return data;
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,

    onSuccess: (response) => {
      const admin = response.data;

      if (typeof window !== "undefined") {
        localStorage.setItem("token", admin.token);
        localStorage.setItem("role", admin.role);
        localStorage.setItem("admin", JSON.stringify(admin));
      }

      queryClient.setQueryData(["admin", "me"], admin);
    },
  });
};
export const useForgetPassword = () => {
  return useMutation({
    mutationFn: async (email: ForgetPassword) => {
      const { data } = await authAxios.post("/admin/forget-password", 
        email,
      );

      return data;
    },
  });
};
export const useVerifyOtp = ()=>{
  return useMutation({
    mutationFn:async(payload:any)=>{
      const {data} = await authAxios.post("/admin/verify-otp",payload)

      return data;
    }
  })
}
export const useChangePassword = ()=>{
  return useMutation({
    mutationFn:async(payload:any)=>{
      const {data}= await authAxios.post("/admin/reset-password",payload)
      return data;
    }
  })
}