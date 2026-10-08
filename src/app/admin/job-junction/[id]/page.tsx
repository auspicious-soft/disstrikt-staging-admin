"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronsUpDown,
  Link2,
} from "lucide-react";
import referenceImage from "@/assets/images/dummyUserImg.png";
import Pagination from "@/app/components/Pagination";
import DynamicTable from "@/app/components/DynamicTable";
import { TableRow } from "@/types/interface-types";
import { ArrowDown, NavArrowDownSolid } from "iconoir-react";
import {
  useDownloadJobCSV,
  useGetJobById,
  useUpdateJobApplicantStatus,
} from "@/hooks/useAdmin";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import { usePanel } from "@/app/components/PanelContext";
import Loader from "../../components/ui/Loader";

// SELECTED is shown as "Shortlisted" (the app's name for it)
type ApplicantStatus = "PENDING" | "SELECTED" | "ACCEPTED" | "REJECTED";
type ApplicantFilter = "ALL" | "PENDING" | "SELECTED" | "REJECTED";

const filters: { label: string; value: ApplicantFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending Applications", value: "PENDING" },
  { label: "Shortlisted", value: "SELECTED" },
  { label: "Rejected", value: "REJECTED" },
];

const statusLabel: Record<ApplicantStatus, string> = {
  PENDING: "Pending",
  SELECTED: "Shortlisted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};

const applicantHeaders = [
  {
    label: "Name",
    key: "name",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Gender",
    key: "gender",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Portfolio",
    key: "portfolio",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Status",
    key: "status",
    icon: <ChevronsUpDown className="h-4 w-4" />,
    width: "w-40",
  },
  {
    label: "Date Of Birth",
    key: "dateOfBirth",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
  {
    label: "Country",
    key: "country",
    icon: <ChevronsUpDown className="h-4 w-4" />,
  },
];

const statusClassName = (status: ApplicantStatus) => {
  switch (status) {
    case "SELECTED":
      return "bg-sky-500 text-white";
    case "ACCEPTED":
      return "bg-emerald-600 text-white";
    case "REJECTED":
      return "bg-red-500 text-white";
    default:
      return "bg-amber-500 text-neutral-950";
  }
};

// ---- formatting helpers -----------------------------------------------

const formatLabel = (value?: string | null) => {
  if (!value) return "N/A";
  return value
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatRange = (min?: number | null, max?: number | null, suffix = "") => {
  if (min == null && max == null) return "N/A";
  if (min == null) return `Up to ${max}${suffix}`;
  if (max == null) return `${min}${suffix}+`;
  return `${min} - ${max}${suffix}`;
};

const formatBudget = (pay?: number | null, currency?: string | null) => {
  if (pay == null) return "N/A";
  return `${pay} ${currency ? currency.toUpperCase() : ""} / Model / Day`.trim();
};

// ---- small presentational components -----------------------------------

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div className="min-w-0">
    <p className="text-xs font-normal text-stone-400">{label}</p>
    <p className="mt-1 text-sm font-medium text-stone-100">{value}</p>
  </div>
);

const SectionPanel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="overflow-hidden rounded-md border border-stone-700 bg-black/10">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 cursor-pointer items-center justify-between bg-white/10 px-3"
      >
        <h2 className="text-sm font-medium text-stone-100">{title}</h2>

        <NavArrowDownSolid
          className={`h-4 w-4 text-stone-300 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && children}
    </section>
  );
};

const JobJunctionDetailsPage = () => {
  const [activeFilter, setActiveFilter] = useState<ApplicantFilter>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { kind } = usePanel();
  const isAgent = kind === "agent";
  const { data, isPending } = useGetJobById({
    id,
    status: activeFilter,
    page: currentPage,
    limit: 10,
  });
  const { mutate: updateApplicantStatus, isPending: isUpdatingStatus } =
    useUpdateJobApplicantStatus();
  const { mutate: downloadCSV, isPending: isDownloading } = useDownloadJobCSV();

  const job = data?.data?.revisedData;
  const appliedJobs = data?.data?.appliedJobs ?? [];
  const pagination = data?.data?.pagination;
  const counts = data?.data?.counts ?? {};

  const toastError = (error: unknown, fallback: string) => {
    toast.error(
      (axios.isAxiosError(error) && error.response?.data?.message) || fallback,
    );
  };

  const handleStatusChange = (
    appliedJobId: string,
    status: "SELECTED" | "REJECTED",
  ) => {
    updateApplicantStatus(
      { appliedJobId, status },
      {
        onSuccess: () =>
          toast.success(
            status === "SELECTED" ? "Applicant shortlisted" : "Applicant rejected",
          ),
        onError: (error) => toastError(error, "Could not update the status"),
      },
    );
  };

  const handleExportCSV = () => {
    if (!id) return;
    downloadCSV(
      { id, title: job?.title },
      {
        // The CSV comes back as a blob, so the server's message isn't readable here
        onError: () => toast.error("Could not export the applicants"),
      },
    );
  };

  const applicantRows = useMemo(() => {
    return appliedJobs.map((appliedJob: any) => ({
      _id: appliedJob._id,
      name: appliedJob.user?.fullName || "N/A",
      gender: formatLabel(appliedJob.userInfo?.gender),
      portfolio: appliedJob.link || "N/A",
      status: appliedJob.status as ApplicantStatus,
      dateOfBirth: appliedJob.userInfo?.dob
        ? new Date(appliedJob.userInfo.dob).toLocaleDateString("en-GB")
        : "N/A",
      country: appliedJob.user?.country || "N/A",
      userMode: appliedJob.user?.userMode || "",
    })) as unknown as TableRow[];
  }, [appliedJobs]);

  const renderApplicantCell = (row: TableRow, key: string) => {
    if (key === "portfolio") {
      const isModel = String(row.userMode).toUpperCase() === "MODEL";

      if (!isModel) {
        return "N/A";
      }

      if (!row[key] || row[key] === "N/A") {
        return "N/A";
      }

      return (
        <a
          href={String(row[key])}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 border-b border-sky-500 text-sky-500"
        >
          <Link2 className="h-3 w-3" />
          Link
        </a>
      );
    }

    if (key === "status") {
      const status = (row[key] as ApplicantStatus) || "PENDING";

      // Agents can't change statuses; ACCEPTED is set by the model, not here
      if (isAgent || status === "ACCEPTED") {
        return (
          <span
            className={`inline-flex min-w-28 items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium ${statusClassName(
              status,
            )}`}
          >
            {statusLabel[status] ?? status}
          </span>
        );
      }

      // The API only accepts SELECTED or REJECTED, so Pending can't be picked
      return (
        <select
          value={status}
          disabled={isUpdatingStatus}
          onChange={(event) =>
            handleStatusChange(
              String(row._id),
              event.target.value as "SELECTED" | "REJECTED",
            )
          }
          aria-label="Applicant status"
          className={`min-w-32 cursor-pointer appearance-none rounded-full px-3 py-1.5 text-center text-xs font-medium outline-none disabled:cursor-wait disabled:opacity-70 ${statusClassName(
            status,
          )}`}
        >
          {status === "PENDING" && (
            <option value="PENDING" disabled>
              Pending
            </option>
          )}
          <option value="SELECTED">Shortlisted</option>
          <option value="REJECTED">Rejected</option>
        </select>
      );
    }

    return String(row[key] ?? "N/A");
  };

  const summarySections = useMemo(
    () => [
      {
        title: "Compensation",
        items: [
          {
            label: "Compensation Type",
            value: formatLabel(job?.compensationType),
          },
          {
            label: "Currency",
            value: job?.currency ? job.currency.toUpperCase() : "N/A",
          },
          { label: "Budget", value: formatBudget(job?.pay) },
          { label: "Travel Covered", value: job?.travelCovered ? "Yes" : "No" },
        ],
      },
      {
        title: "Eligibility Criteria",
        items: [
          {
            label: "Experience",
            value: job?.experience != null ? `${job.experience} Years` : "N/A",
          },
          { label: "Gender", value: formatLabel(job?.gender) },
          { label: "Age Range", value: formatRange(job?.minAge, job?.maxAge) },
          {
            label: "Height Range",
            value: formatRange(job?.minHeightInCm, job?.maxHeightInCm, " Cm"),
          },
        ],
      },
    ],
    [job],
  );

  const referenceImages = job?.uploadReference ?? [];

  return (
    <>
      {isPending ? (
        <Loader />
      ) : (
        <div className="w-full min-w-0 space-y-5 text-stone-100">
          <section className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h1 className="text-xl font-medium leading-tight text-stone-100">
                  {job?.title || "N/A"}
                </h1>
                <p className="mt-2 max-w-6xl text-xs font-normal leading-4 text-stone-200">
                  {job?.description || "No description provided."}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-[#256533] px-4 py-1 text-base font-medium text-white">
                  {formatLabel(job?.userMode)}
                </span>
                {!isAgent && (
                  <button
                    type="button"
                    aria-label="Edit job"
                    onClick={() => router.push(`/admin/job-junction/edit/${id}`)}
                    className="rounded-md border border-stone-700 bg-stone-800 px-3 py-2 text-xs font-medium text-stone-300 transition-colors hover:bg-stone-700 hover:text-white"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
              <InfoItem label="Posted By" value={job?.companyName || "N/A"} />
              <InfoItem
                label="Niche"
                value={
                  (Array.isArray(job?.niche) ? job.niche.join(", ") : job?.niche) ||
                  "N/A"
                }
              />
              <InfoItem
                label="Location"
                value={job?.location || job?.city || job?.country || "N/A"}
              />
              <InfoItem
                label="Date and Time"
                value={formatDateTime(job?.startDateTime)}
              />
            </div>
          </section>

          {summarySections.map((section) => (
            <SectionPanel key={section.title} title={section.title}>
              <div className="grid grid-cols-2 gap-5 px-3 py-4 md:grid-cols-4">
                {section.items.map((item) => (
                  <InfoItem
                    key={item.label}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </SectionPanel>
          ))}

          <SectionPanel title="Reference Images">
            {referenceImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-5 lg:grid-cols-9">
                {referenceImages.map((src: string, index: number) => (
                  <div
                    key={index}
                    className="relative aspect-[1.12/1] overflow-hidden rounded bg-stone-800"
                  >
                    <Image
                      src={
                        src
                          ? src.startsWith("http")
                            ? src
                            : `${process.env.NEXT_AWS_S3_BASE_URL}${src}`
                          : ""
                      }
                      alt="Reference"
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-xs text-stone-400">
                No reference images uploaded.
              </div>
            )}
          </SectionPanel>

          <SectionPanel title="Additional Notes">
            <div className="px-3 py-4 text-xs text-stone-400">
              {job?.additionalNotes || "No additional notes provided."}
            </div>
          </SectionPanel>

          <section className="space-y-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="w-full max-w-fit  overflow-x-auto">
                <div className="flex min-w-max rounded-full bg-white/10 p-1">
                  {filters.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => {
                        setActiveFilter(filter.value);
                        setCurrentPage(1);
                      }}
                      className={`rounded-full px-4 py-2 text-xs font-normal transition-colors ${
                        activeFilter === filter.value
                          ? "bg-rose-500 text-white"
                          : "text-stone-400 hover:bg-stone-800 hover:text-white"
                      }`}
                    >
                      {filter.label} ({counts[filter.value] ?? 0})
                    </button>
                  ))}
                </div>
              </div>

              {!isAgent && (
                <button
                  type="button"
                  onClick={handleExportCSV}
                  disabled={isDownloading}
                  className="flex h-10 w-full lg:w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-rose-500 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-600 disabled:cursor-wait disabled:opacity-70"
                >
                  <ArrowDown className="h-4 w-4" />
                  {isDownloading ? "Exporting..." : "Export CSV"}
                </button>
              )}
            </div>

            <div className="w-full rounded-md border border-stone-700">
              <DynamicTable
                headers={applicantHeaders}
                data={applicantRows}
                isEyeShow={false}
                renderCell={renderApplicantCell}
              />
            </div>

            {(pagination?.totalPages ?? 1) > 1 && (
              <Pagination
                currentPage={pagination?.page || currentPage}
                totalPages={pagination?.totalPages || 1}
                onPageChange={setCurrentPage}
              />
            )}
          </section>
        </div>
      )}
    </>
  );
};

export default JobJunctionDetailsPage;
