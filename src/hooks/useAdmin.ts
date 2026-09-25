import { axiosInstance } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ADMIN_URLS } from "@/constants/apiUrls";

interface GetCelebrationCruiseParams {
  page: number;
  limit: number;
  search?: string;
  activeFilter?: string;
  country?: string;
}
interface GetStudiosParams {
  page: number;
  limit: number;
  debouncedSearch:string;
}
interface GetActivitiesParams {
  page: number;
  limit: number;
  type: string;
  country: string;
  search?: string;
  activity:string;
}
interface GetActivityByIdParams {
  slotId: string;
  type?: string;
}
interface ReviewActivityPayload {
  slotId: string;
  attended: "yes" | "no";
  rating: number;
  images: string[];
  comments: string;
}
interface CancelActivityPayload {
  slotId: string;
  comments: string;
}
interface CreateStudioPayload {
  timeZone: string;
  name: string;
  location: string;
  city: string;
  country: string;
  slots: {
    date: string;
    startTime: string;
    endTime: string;
    slot: number;
  }[];
}
export const CreateEvent = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.post(
        "/admin/celebration-cruise",
        payload,
      );

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
export const useGetEmployeesById = (id: any) => {
  return useQuery({
    queryKey: ["employeById"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(`/admin/employee/${id}`);
      return data?.data ?? data;
    },
  });
};

export const useGetSubscriptions = () => {
  return useQuery({
    queryKey: ["subscriptions"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/price-plan");
      return data?.data ?? data;
    },
  });
};

export const useUpdateSubscriptions = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.put(
        "/admin/price-plan",
        payload,
      );

      return data;
    },
  });
};

export const useUpdateEmployeeById = (id: any) => {
  return useMutation({
    mutationFn: async (paylaod: any) => {
      const { data } = await axiosInstance.put(
        `/admin/employee/${id}`,
        paylaod,
      );

      return data;
    },
  });
};
export const useGetCelebrationCruise = ({
  page,
  limit,
  search = "",
  activeFilter = "",
  country = "",
}: GetCelebrationCruiseParams) => {
  return useQuery({
    queryKey: ["celebrationCruise", page, limit, search, activeFilter, country],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/celebration-cruise?page=${page}&limit=${limit}&search=${search}&country=${country}&status=${activeFilter}`,
      );

      return data.data;
    },
  });
};
export const useGetActivities = ({
  page,
  limit,
  type,
  country,
  search,
  activity,
}: GetActivitiesParams) => {
  return useQuery({
    queryKey: ["activities", page, limit, type, country, search,activity],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/activities", {
        params: { type, page, limit, country, search,activity },
      });

      return data.data;
    },
  });
};

export const useGetActivityById = ({
  slotId,
  type,
}: GetActivityByIdParams) => {
  return useQuery({
    queryKey: ["activityById", slotId, type],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/activitiesById", {
        params: { slotId, ...(type ? { type } : {}) },
      });

      return data?.data ?? data;
    },
    enabled: Boolean(slotId),
  });
};

export const useReviewActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ReviewActivityPayload) => {
      const { data } = await axiosInstance.post(
        "admin/activitiesById",
        payload,
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });
};

export const useCancelActivity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CancelActivityPayload) => {
      const { data } = await axiosInstance.put(
        "admin/activitiesById",
        payload,
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["activities"],
      });
    },
  });
};

export const useGetCelebrationCruiseById = (id: any) => {
  return useQuery({
    queryKey: ["celebrationCruiseById", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/celebration-cruise/${id}`,
      );
      return data.data;
    },
    enabled: !!id,
  });
};
export const CreateJobAdmin = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.post("/admin/jobs", payload);
      return data;
    },
  });
};
export const useGetJobJunction = ({
  page,
  limit,
  search,
  country,
  postedBy,
  status,
  role,
}) => {
  return useQuery({
    queryKey: ["getjobJunction", search, postedBy, status, role,country,page,limit],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `admin/jobs?page=${page}&limit=${limit}&search=${search}&postedBy=${postedBy}&status=${status}&role=${role}&country=${country}`,
      );
      return data;
    },
  });
};
export const useGetJobById = ({id,status,page,limit})=>{
  return useQuery({
    queryKey:["getjobById",id,status,page,limit],
    queryFn:async ()=>{
      const {data}= await axiosInstance.get(`admin/jobsById/${id}?status=${status}&page=${page}&limit=${limit}`);
      return data
    },
    enabled: !!id,
  })
}
export const useUpdateJobAdmin = () => {
   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.put("/admin/jobs", payload);
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["getjobById"],
      });
      void queryClient.invalidateQueries({
        queryKey: ["getjobJunction"],
      });
    },
  });

};
export const useCompleteJobById = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.patch(
        `/admin/jobs/${id}/complete`
      );

      return data;
    },
  });
};

export const useRemoveJobById = (id: string) => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.patch(
        `/admin/jobs/${id}/remove`
      );

      return data;
    },
  });
};
export const useGetAllStudios = ({
  page,
  limit,
  debouncedSearch,
}: GetStudiosParams) => {
  return useQuery({
    queryKey: ["studio", page, limit,debouncedSearch],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/studio", {
        params: {
          page,
          limit,
          search:debouncedSearch
        },
      });

      return data;
    },
    placeholderData: (previousData) => previousData,
  });
};

export const useGetPlatformInfo = () => {
  return useQuery({
    queryKey: ["platform-info"],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/get-platform-info");
      return data?.data ?? data;
    },
  });
};

export const useSavePrivacyPolicy = () => {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await axiosInstance.post(
        "/admin/privacy-policy",
        payload,
      );

      return data;
    },
  });
};

export const useSaveTermsAndCondition = () => {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await axiosInstance.post(
        "/admin/terms-and-conditions",
        payload,
      );

      return data;
    },
  });
};

export const useSaveSupportInfo = () => {
  return useMutation({
    mutationFn: async (payload: unknown) => {
      const { data } = await axiosInstance.post(
        "/admin/contact-us",
        payload,
      );

      return data;
    },
  });
};

export const useDeleteStudioById = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axiosInstance.delete(
        `${"/admin/studio"}?id=${id}`
      );

      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studio"],
      });
    },
  });
};
export const useCreateStudio = () => {
   const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateStudioPayload) => {
      const { data } = await axiosInstance.post(
        "/admin/studio",
        payload
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studio"],
      });
    },
  });
};
export const useGetStudioFeatures = () => {
  return useQuery({
    queryKey: ["studio-features"],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        "/admin/shootFeatures"
      );

      return data;
    },
  });
};
export const useUpdateStudioFeatures = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.post(
        "/admin/shootFeatures",
        payload
      );

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["studio-features"],
      });
    },
  });
};
export const useGetStudioByID = (id?: string) => {
  return useQuery({
    queryKey: ["studio-by-id", id],
    queryFn: async () => {
      const { data } = await axiosInstance.get(
        `/admin/studioById?id=${id}`  
      );
      return data;
    },
    enabled: !!id,
  });
};
export const useUpdateStudio = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await axiosInstance.post(
        "/admin/studio" ,
        payload
      );
      return data;
    },
    onSuccess: (_data, variables: any) => {
      queryClient.invalidateQueries({ queryKey: ["studios"] });
      queryClient.invalidateQueries({
        queryKey: ["studio-by-id", variables?.id],
      });
    },
  });
};
export const useDeleteBookingDate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { data } = await axiosInstance.delete(
        `/admin/studioById?id=${bookingId}`
      );
      return data;
    },
  });
};