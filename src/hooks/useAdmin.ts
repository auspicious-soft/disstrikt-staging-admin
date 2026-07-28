import { axiosInstance } from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";

export const CreateEvent = () => {
  return useMutation({
    mutationFn: async (paylaod: any) => {
      const { data } = await axiosInstance.post("/admin/celebration-cruise", 
        
      );

      return data;
    },
  });
};