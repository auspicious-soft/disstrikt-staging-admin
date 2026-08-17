"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ChevronDown,
  ChevronsUpDown,
  Link2,
  Pencil,
} from "lucide-react";
import referenceImage from "@/assets/images/dummyUserImg.png";
import Pagination from "@/app/components/Pagination";
import DynamicTable from "@/app/components/DynamicTable";
import { TableRow } from "@/types/interface-types";
import { ArrowDown, NavArrowDownSolid } from "iconoir-react";
import { useGetJobById } from "@/hooks/useAdmin";
import { useParams } from "next/navigation";
import Loader from "../../components/ui/Loader";

type ApplicantStatus = "PENDING" | "SELECTED" | "REJECTED";
type ApplicantFilter = "ALL" | ApplicantStatus;

type Applicant = {
  id: number;
  _id: string;
  name: string;
  gender: string;
  portfolio: string;
  status: ApplicantStatus;
  dateOfBirth: string;
  country: string;
};

// Static table data — swap this out for `appliedJobs` once the API starts returning applicants.
const applicants: Applicant[] = [
  {
    id: 1,
    _id: "1",
    name: "Alex Johnson",
    gender: "Male",
    portfolio: "Link",
    status: "PENDING",
    dateOfBirth: "15-08-81",
    country: "Netherlands",
  },
  {
    id: 2,
    _id: "2",
    name: "Daniel Martinez",
    gender: "Female",
    portfolio: "Link",
    status: "SELECTED",
    dateOfBirth: "22-11-86",
    country: "Netherlands",
  },
  {
    id: 3,
    _id: "3",
    name: "Laura Garcia",
    gender: "Male",
    portfolio: "Link",
    status: "REJECTED",
    dateOfBirth: "03-05-85",
    country: "Belgium",
  },
  {
    id: 4,
    _id: "4",
    name: "Olivia Hall",
    gender: "Female",
    portfolio: "Link",
    status: "PENDING",
    dateOfBirth: "03-05-85",
    country: "Belgium",
  },
  {
    id: 5,
    _id: "5",
    name: "James Young",
    gender: "Male",
    portfolio: "Link",
    status: "SELECTED",
    dateOfBirth: "27-12-83",
    country: "Dutch",
  },
  {
    id: 6,
    _id: "6",
    name: "Michael Wilson",
    gender: "Female",
    portfolio: "Link",
    status: "REJECTED",
    dateOfBirth: "09-04-90",
    country: "Netherlands",
  },
];

const filters: { label: string; value: ApplicantFilter }[] = [
  { label: "All (60)", value: "ALL" },
  { label: "Pending Applications (10)", value: "PENDING" },
  { label: "Shortlisted (40)", value: "SELECTED" },
  { label: "Rejected (10)", value: "REJECTED" },
];

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
  const { id } = useParams();
  const { data, isPending } = useGetJobById({ id, status: activeFilter });

  const job = data?.data?.revisedData;
  const appliedJobs = data?.data?.appliedJobs ?? [];
  const pagination = data?.data?.pagination;

  // Table stays static for now since appliedJobs is empty — swap `applicants`
  // for a mapped version of `appliedJobs` once the API returns applicant records.
  const visibleApplicants = useMemo(() => {
    if (activeFilter === "ALL") return applicants;
    return applicants.filter((applicant) => applicant.status === activeFilter);
  }, [activeFilter]);

  const applicantRows = visibleApplicants as unknown as TableRow[];

  const renderApplicantCell = (row: TableRow, key: string) => {
    if (key === "portfolio") {
      return (
        <button className="inline-flex items-center gap-1 border-b border-sky-500 text-sky-500">
          <Link2 className="h-3 w-3" />
          {row[key]}
        </button>
      );
    }

    if (key === "status") {
      return (
        <button
          className={`inline-flex min-w-28 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium ${statusClassName(
            row[key] as ApplicantStatus,
          )}`}
        >
          {row[key]}
          <ChevronDown className="h-3 w-3" />
        </button>
      );
    }

    return row[key];
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

              <span className="shrink-0 rounded-full bg-[#256533] px-4 py-1 text-base font-medium text-white">
                {formatLabel(job?.userMode)}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
              <InfoItem label="Posted By" value={job?.companyName || "N/A"} />
              <InfoItem label="Niche" value={job?.niche || "N/A"} />
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
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className="flex h-10 w-full lg:w-fit shrink-0 items-center justify-center gap-2 rounded-md bg-rose-500 px-5 text-sm font-medium text-white transition-colors hover:bg-rose-600"
              >
                <ArrowDown className="h-4 w-4" />
                Export CSV
              </button>
            </div>

            <div className="w-full rounded-md border border-stone-700">
              <DynamicTable
                headers={applicantHeaders}
                data={applicantRows}
                isEyeShow={false}
                renderCell={renderApplicantCell}
                renderActions={() => (
                  <button className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-stone-800 text-stone-300 hover:bg-stone-700">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                showActionsHeaderLabel={false}
              />
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 10}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      )}
    </>
  );
};

export default JobJunctionDetailsPage;
