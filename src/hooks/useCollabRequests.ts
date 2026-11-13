import { axiosInstance } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

export type CollabStatus = "pending" | "approved" | "declined" | "cancelled";

export const COLLAB_STATUS_BADGE: Record<CollabStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-[#E09F1F]" },
  approved: { label: "Approved", className: "bg-[#3DA755]" },
  declined: { label: "Declined", className: "bg-[#E0414F]" },
  cancelled: { label: "Cancelled", className: "bg-[#6B6B6B]" },
};

export type CollabRequest = {
  _id: string;
  status: CollabStatus;
  collabTypes: string[];
  personalInfo: {
    fullName: string;
    email: string | null;
    countryCode: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
  };
  socials: {
    instagramHandle: string | null;
    instagramFollowers: number | null;
    tiktokHandle: string | null;
    tiktokFollowers: number | null;
  };
  primaryAudience: string[];
  location: string | null;
  timeZone: string | null;
  slots: { date: string; startTime: string; startDateTime: string }[];
  idea: string;
  preferences: string | null;
  references: string[];
  responseNote: string | null;
  respondedAt: string | null;
  createdAt: string;
  chatId: string | null;
  requester: { _id: string; fullName: string; image: string | null; userMode: string | null; country: string | null } | null;
  studio: { userId: string; studioName: string; fullName: string; logo?: string | null; country: string | null } | null;
};

/** Admin only: GET /admin/dome/collab-requests */
export const useCollabRequests = ({
  page,
  limit,
  search,
  status,
  country,
  enabled = true,
}: {
  page: number;
  limit: number;
  search: string;
  status: string;
  country: string;
  enabled?: boolean;
}) =>
  useQuery({
    queryKey: ["adminCollabRequests", page, limit, search, status, country],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/dome/collab-requests", {
        params: {
          page,
          limit,
          ...(search ? { search } : {}),
          ...(status ? { status } : {}),
          ...(country ? { country } : {}),
        },
      });
      return data?.data as {
        data: CollabRequest[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
        counts: Partial<Record<CollabStatus, number>>;
      };
    },
    placeholderData: (previous) => previous,
    enabled,
  });
