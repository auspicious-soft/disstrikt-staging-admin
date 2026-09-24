import {
  Asterisk,
  Bookmark,
  Calendar,
  Check,
  CheckSquare,
  Group,
  Heart,
  XmarkSquare,
} from "iconoir-react";
import { CheckCircle2, Tag, User, X, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { axiosInstance } from "@/lib/axios";
import { useCompleteJobById, useRemoveJobById } from "@/hooks/useAdmin";
import { toast } from "sonner";
import axios from "axios";
import { ConfirmModal } from "./ConfirmModal";

type Job = {
  id: string;
  tag: string;
  title: string;
  image: string;
  applicants: number;
  role: string;
  status: JobStatus;
};
type JobCardProps = {
  job: any;
  href: string;
  isjob: boolean;
};
type JobStatus = "OPEN" | "COMPLETED" | "REMOVED";

type ConfirmAction = "complete" | "remove" | null;

const StatusPill = ({ status }: { status: JobStatus }) => {
  const displayStatus =
    status === "OPEN"
      ? "Completed"
      : status === "COMPLETED"
        ? "Closed"
        : "Removed";

  const isClosed = status === "COMPLETED";

  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-semibold ${
        isClosed ? "text-stone-400" : "text-[#EF476F]"
      }`}
    >
      <CheckSquare className="h-5 w-5 bg-[#2C121B]" />
      {displayStatus}
    </span>
  );
};


export const JobCard = ({ job, href, isjob }: JobCardProps) => {
  const [status, setStatus] = useState<JobStatus>(job?.status || "Pending");
  const [removed, setRemoved] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const { mutate: completeJob, isPending: isCompleting } = useCompleteJobById(
    job?._id,
  );

  const { mutate: removeJob, isPending: isRemoving } = useRemoveJobById(
    job?._id,
  );
  const loading = isCompleting || isRemoving;

  // Open modal instead of firing the mutation directly
  const handleCompleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "OPEN" || loading) return;
    setConfirmAction("complete");
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status !== "OPEN" || loading) return;
    setConfirmAction("remove");
  };

  const handleCancelConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmAction(null);
  };

  // Actual mutation calls, fired only after confirmation
  const confirmComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    completeJob(undefined, {
      onSuccess: () => {
        setStatus("COMPLETED");
        toast.success("Job Status Updated Successfully");
        setConfirmAction(null);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message);
        }
        setConfirmAction(null);
      },
    });
  };

  const confirmRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    removeJob(undefined, {
      onSuccess: () => {
        setStatus("REMOVED");
        setRemoved(true);
        toast.success("Job Removed Successfully");
        setConfirmAction(null);
      },
      onError: (error) => {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message);
        }
        setConfirmAction(null);
      },
    });
  };

  if (removed) return null;

  return (
    <>
      <Link
        href={href}
        className="rounded-[14px] bg-[#111115] p-3 text-stone-100 max-h-[500px]"
      >
        {isjob && (
          <>
            <span className="mb-2 inline-block rounded-[6px] bg-[#EF476F]/15 px-2.5 py-1 border border-[#501C2E] text-xs font-semibold text-[#EF476F]">
              {job.postedBy === "FOUNDER" ? "DISTRIKT" : job.postedBy}
            </span>
            <h3 className="mb-3 text-base font-medium leading-snug">
              {job.title}
            </h3>{" "}
          </>
        )}
        <div className="mb-3 aspect-[4/5] max-h-60 w-full overflow-hidden rounded-[10px] bg-stone-800">
          <img
            src={
              job?.image
                ? job.image.startsWith("http")
                  ? job.image
                  : `${process.env.NEXT_AWS_S3_BASE_URL}${job.image}`
                : ""
            }
            alt={job?.title || "Job image"}
            className="max-h-60 w-full object-cover"
          />
        </div>
        {!isjob && (
          <h3 className="mb-3 text-base font-medium leading-snug">
            {" "}
            {job.name}{" "}
          </h3>
        )}
        {isjob ? (
          <div className="mb-3 flex items-center gap-4 text-xs font-normal text-stone-400">
            <span className="flex items-center gap-1.5">
              <Group className="h-3.5 w-3.5 text-[#EF476F]" />
              {job.applicants} Applicants
            </span>
            <span className="flex items-center gap-1.5">
              <Asterisk className="h-3.5 w-3.5 text-[#EF476F]" />
              {job.userMode}
            </span>{" "}
          </div>
        ) : (
          <div className="mb-3 flex items-center justify-between gap-4 text-xs font-normal text-stone-400">
            <span className="flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-[#EF476F]" />
              {job.likes} Likes
            </span>
            <span className="flex items-center gap-1.5">
              <Bookmark className="h-3.5 w-3.5 text-[#EF476F]" />
              {job.saves} Saves
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#EF476F]" />
              {job.booking} Bookings
            </span>
          </div>
        )}
        {isjob ? (
          <div className="flex items-center justify-between border-t border-[#232327] pt-3">
            <button
              onClick={handleCompleteClick}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-300"
            >
              <StatusPill status={status} />
            </button>
            <button
              onClick={handleRemoveClick}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-300"
            >
              <XmarkSquare className="h-5 w-5" />
              Remove
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 border-t border-[#232327] pt-3">
            <button className="flex items-center gap-1 bg-[#212121] py-2 px-3 rounded-lg text-xs font-medium text-white hover:text-stone-300">
              Share Profile
            </button>
            <button className="flex items-center gap-1 border border-[#212121] py-2 px-3 rounded-lg text-xs font-medium text-white hover:text-stone-300">
              Copy link
            </button>
          </div>
        )}
      </Link>

      <ConfirmModal
        open={confirmAction === "complete"}
        title="Mark job as completed?"
        description="This will update the job status to completed. This action can't be undone from here."
        confirmLabel="Yes, Complete"
        onConfirm={confirmComplete}
        onCancel={handleCancelConfirm}
        loading={isCompleting}
      />

      <ConfirmModal
        open={confirmAction === "remove"}
        title="Remove this job?"
        description="This will remove the job permanently. This action can't be undone."
        confirmLabel="Yes, Remove"
        onConfirm={confirmRemove}
        onCancel={handleCancelConfirm}
        loading={isRemoving}
        danger
      />
    </>
  );
};