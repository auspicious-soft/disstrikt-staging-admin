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
import { CheckCircle2, Tag, User, X } from "lucide-react";
import Link from "next/link";

type JobStatus = "Completed" | "In Progress" | "Pending";

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

const StatusPill = ({ status }: { status: JobStatus }) => {
  const isCompleted = status === "Completed";
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-semibold ${
        isCompleted ? "text-[#EF476F]" : "text-stone-400"
      }`}
    >
      <CheckSquare className="h-5 w-5 bg-[#2C121B]" />
      {status}
    </span>
  );
};

export const JobCard = ({ job, href, isjob }: JobCardProps) => (
  <Link
    href={href}
    className="rounded-[14px] bg-[#111115] p-3 text-stone-100 max-h-[500px]"
  >
    {isjob && (
      <>
        <span className="mb-2 inline-block rounded-[6px] bg-[#EF476F]/15 px-2.5 py-1 border border-[#501C2E] text-xs font-semibold text-[#EF476F]">
          {job.tag}
        </span>
        <h3 className="mb-3 text-base font-medium leading-snug">
          {job.title}
        </h3>{" "}
      </>
    )}
    <div className="mb-3 aspect-[4/5] max-h-60 w-full overflow-hidden rounded-[10px] bg-stone-800">
      <img
        src={job.image}
        alt={job.title}
        className="max-h-60 w-full object-cover"
      />
    </div>
    {!isjob && (
      <h3 className="mb-3 text-base font-medium leading-snug"> {job.name} </h3>
    )}
    {isjob ? (
      <div className="mb-3 flex items-center gap-4 text-xs font-normal text-stone-400">
        <span className="flex items-center gap-1.5">
          <Group className="h-3.5 w-3.5 text-[#EF476F]" />
          {job.applicants} Applicants
        </span>
        <span className="flex items-center gap-1.5">
          <Asterisk className="h-3.5 w-3.5 text-[#EF476F]" />
          {job.role}
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
        <StatusPill status={job.status} />
        <button className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-300">
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
);
