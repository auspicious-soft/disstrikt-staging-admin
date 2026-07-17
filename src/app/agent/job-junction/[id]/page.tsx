"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronsUpDown,
  Pencil,
} from "lucide-react";
import referenceImage from "@/assets/images/dummyUserImg.png";
import Pagination from "@/app/components/Pagination";
import DynamicTable from "@/app/components/DynamicTable";
import { TableRow } from "@/types/interface-types";
import { ArrowDown, Link, NavArrowDownSolid } from "iconoir-react";

type ApplicantStatus = "Pending" | "Shortlisted" | "Rejected";
type ApplicantFilter = "All" | ApplicantStatus;

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

const applicants: Applicant[] = [
  {
    id: 1,
    _id: "1",
    name: "Alex Johnson",
    gender: "Male",
    portfolio: "Link",
    status: "Pending",
    dateOfBirth: "15-08-81",
    country: "Netherlands",
  },
  {
    id: 2,
    _id: "2",
    name: "Daniel Martinez",
    gender: "Female",
    portfolio: "Link",
    status: "Shortlisted",
    dateOfBirth: "22-11-86",
    country: "Netherlands",
  },
  {
    id: 3,
    _id: "3",
    name: "Laura Garcia",
    gender: "Male",
    portfolio: "Link",
    status: "Rejected",
    dateOfBirth: "03-05-85",
    country: "Belgium",
  },
  {
    id: 4,
    _id: "4",
    name: "Olivia Hall",
    gender: "Female",
    portfolio: "Link",
    status: "Pending",
    dateOfBirth: "03-05-85",
    country: "Belgium",
  },
  {
    id: 5,
    _id: "5",
    name: "James Young",
    gender: "Male",
    portfolio: "Link",
    status: "Shortlisted",
    dateOfBirth: "27-12-83",
    country: "Dutch",
  },
  {
    id: 6,
    _id: "6",
    name: "Michael Wilson",
    gender: "Female",
    portfolio: "Link",
    status: "Rejected",
    dateOfBirth: "09-04-90",
    country: "Netherlands",
  },
];

const filters: { label: string; value: ApplicantFilter }[] = [
  { label: "All (60)", value: "All" },
  { label: "Pending Applications (10)", value: "Pending" },
  { label: "Shortlisted (40)", value: "Shortlisted" },
  { label: "Rejected (10)", value: "Rejected" },
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

const summarySections = [
  {
    title: "Compensation",
    items: [
      { label: "Compensation Type", value: "Paid" },
      { label: "Currency", value: "EUR" },
      { label: "Budget", value: "500 / Model / Day" },
      { label: "Travel Covered", value: "Yes" },
    ],
  },
  {
    title: "Eligibility Criteria",
    items: [
      { label: "Experience", value: "1-2 Years" },
      { label: "Gender", value: "Male" },
      { label: "Age Range", value: "24-45" },
      { label: "Height Range", value: "168 - 180 Cm" },
    ],
  },
];

const statusClassName = (status: ApplicantStatus) => {
  switch (status) {
    case "Shortlisted":
      return "bg-sky-500 text-white";
    case "Rejected":
      return "bg-red-500 text-white";
    default:
      return "bg-amber-500 text-neutral-950";
  }
};

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
  const [activeFilter, setActiveFilter] = useState<ApplicantFilter>("All");
  const [currentPage, setCurrentPage] = useState(1);

  const visibleApplicants = useMemo(() => {
    if (activeFilter === "All") return applicants;
    return applicants.filter((applicant) => applicant.status === activeFilter);
  }, [activeFilter]);

  const applicantRows = visibleApplicants as unknown as TableRow[];

  const renderApplicantCell = (row: TableRow, key: string) => {
    if (key === "portfolio") {
      return (
        <button className="inline-flex items-center gap-1 border-b border-sky-500 text-sky-500">
          <Link className="h-3 w-3" />
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
        </button>
      );
    }

    return row[key];
  };

  return (
    <div className="w-full min-w-0 space-y-5 text-stone-100">
      <section className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-medium leading-tight text-stone-100">
              Runway Casting - Berlin Fashion Week
            </h1>
            <p className="mt-2 max-w-6xl text-xs font-normal leading-4 text-stone-200">
              I&apos;m a passionate and versatile model with experience in both
              commercial and editorial work. I bring energy, professionalism,
              and creativity to every shoot, whether it&apos;s fashion,
              lifestyle, or on-camera work. I love collaborating with teams to
              bring visual stories to life and am always open to new challenges
              that help me grow in the industry.
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-[#256533] px-4 py-1 text-base font-medium text-white">
            Model
          </span>
        </div>

        <div className="grid grid-cols-1 gap-x-16 gap-y-5 md:grid-cols-2">
          <InfoItem label="Posted By" value="The Iconic Mapple" />
          <InfoItem label="Niche" value="Editorial" />
          <InfoItem label="Location" value="Paris, France" />
          <InfoItem label="Date and Time" value="24 June 09:00 Am" />
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
        <div className="grid grid-cols-3 gap-2 p-3 sm:grid-cols-5 lg:grid-cols-9">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              className="relative aspect-[1.12/1] overflow-hidden rounded bg-stone-800"
            >
              <Image
                src={referenceImage}
                alt="Reference"
                fill
                sizes="120px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </SectionPanel>

      <SectionPanel title="Additional Notes">
        <div className="px-3 py-4 text-xs text-stone-400">
          Additional casting details will appear here.
        </div>
      </SectionPanel>

      <section className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-git max-w-full overflow-x-auto">
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
        </div>

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

        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
        />
      </section>
    </div>
  );
};

export default JobJunctionDetailsPage;
