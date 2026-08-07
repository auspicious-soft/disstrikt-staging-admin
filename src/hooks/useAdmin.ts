import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery } from "@tanstack/react-query";

interface GetCelebrationCruiseParams {
  page: number;
  limit: number;
  search?: string;
  activeFilter?: string;
  country?: string;
}

export const CreateEvent = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.post("/admin/celebration-cruise",payload);

      return data;
    },
  });
};
export const useGetEmployeesRoles = () => {
  return useQuery({
    queryKey: ["employeesRoles"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/employee/roles");
      return data?.data ?? data;
    },
  });
};

export const useCreateEmployee = () => {
  return useMutation({
    mutationFn: async (paylaod: any) => {
      const { data } = await axiosInstance.post("/admin/employee", paylaod);

      return data;
    },
  });
};

export const useGetEmployees = ({
  page,
  limit,
  search,
}: {
  page: number;
  limit: number;
  search: string;
}) => {
  return useQuery({
    queryKey: ["employees", page, limit, search],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/employee?page=${page}&limit=${limit}&search=${search}`,
      );
      return data?.data ?? data;
    },
  });
};
export const useGetEmployeesById = (id:any)=>{
  return useQuery({
    queryKey:["employeById"],
    queryFn:async()=>{
      const {data} = await axiosInstance.get(
        `/admin/employee/${id}`,
      );
      return data?.data ?? data;
    }
  })
}
export const useUpdateEmployeeById = (id:any)=>{
  return useMutation({
     mutationFn: async (paylaod: any) => {
      const { data } = await axiosInstance.put(`/admin/employee/${id}`, paylaod);

      return data;
    }
  })
}
export const useGetCelebrationCruise = ({
  page,
  limit,
  search = "",
  activeFilter = "",
  country = "",
}: GetCelebrationCruiseParams) => {
  return useQuery({
    queryKey: [
      "celebrationCruise",
      page,
      limit,
      search,
      activeFilter,
      country,
    ],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/celebration-cruise?page=${page}&limit=${limit}&search=${search}&country=${country}&status=${activeFilter}`
      );

      return data.data;
    },
  });
};