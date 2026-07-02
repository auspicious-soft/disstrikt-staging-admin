"use client";

import DynamicTable from "@/app/components/DynamicTable";
import React, { useEffect, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import copyLink from "../../../assets/icons/CopyLink.png";
import eyeImg from "../../../assets/icons/Eye.png";
import { getJobApplicants, UpdateJobById } from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { toast } from "sonner";
import Pagination from "@/app/components/Pagination";
import UpdateStatusModal from "@/app/components/UpdateJobStatusModal";
import { TableRow } from "@/types/interface-types";
import CustomSelect from "@/app/components/CustomSelect";
import UserId from "../user-management/[id]/page";
import Loader from "../components/ui/Loader";

interface SelectOption {
  label: string;
  value: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: React.ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface CustomTableRow extends TableRow {
  userId?: string;
}

const JobListingsId: React.FC = () => {
  const router = useRouter();
  const [sort, setSort] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<CustomTableRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const headers: TableHeader[] = [
    {
      label: "Name",
      key: "name",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Gender",
      key: "gender",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Portfolio",
      key: "portfolio",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Status",
      key: "status",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date Of Birth",
      key: "dateOfBirth",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Country",
      key: "country",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-orange-400 text-neutral-900";
      case "SELECTED":
        return "bg-teal-400 text-neutral-900";
      case "REJECTED":
        return "bg-red-500 text-stone-200";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const fetchjobApplicants = async () => {
    setLoading(true);
    try {
      const response = await getJobApplicants(
        `${ADMIN_URLS.GET_JOB_APPLICANTS}?page=${page}&limit=${limit}&status=${sort}`,
      );

      if (response.status === 200) {
        const resData = response?.data?.data;
        const appliedJobs = resData?.appliedJobs || [];
        const paginationData = resData?.pagination;

        // Map appliedJobs to TableRow format
        const mappedJobs: CustomTableRow[] = appliedJobs.map((job: any) => ({
          _id: job._id || "",
          jobId: job.jobId || "",
          name: job.user?.fullName || "N/A",
          gender: job.userInfo?.gender || "N/A",
          portfolio: "Copy Link",
          status: job.status || "N/A",
          dateOfBirth: job.userInfo?.dob
            ? new Date(job.userInfo.dob).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
              })
            : "N/A",
          country: job.user?.country || "N/A",
          userId: job.user?._id || "",
        }));

        setJobData(mappedJobs);
        setTotalPages(paginationData?.totalPages || 1);
      } else {
        toast.error("Error Fetching Job Data");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Error Fetching Job Data");
    } finally {
      setLoading(false);
    }
  };

  console.log(jobData, "jondfata");

  useEffect(() => {
    fetchjobApplicants();
  }, [page, limit, sort]);

  const handleCopyLink = async (userId?: string) => {
    if (!userId) {
      toast.error("No user ID available to copy link");
      return;
    }
    const link = `https://disstrikt-portfolio.vercel.app/portfolio/${userId}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const updateJobStatus = async (jobId: string, status: string) => {
    setLoading(true);
    try {
      const response = await UpdateJobById(
        `${ADMIN_URLS.UPDATE_JOB_BY_ID}/${jobId}`,
        { status },
      );
      if (response.status === 200) {
        toast.success("Job status updated successfully");
        await fetchjobApplicants();
      } else {
        toast.error("Failed to update job status");
      }
    } catch (error) {
      console.error("Error updating job status:", error);
      toast.error("Failed to update job status");
    } finally {
      setLoading(false);
    }
  };

  const handleRowIconClick = (userId: string) => {
    // const job = jobData.find((row) => row.userId === id);
    // setSelectedJobId(id);

    router.push(`/admin/user-management/${userId}?fr=JobEntitites`);
  };

  const statusModalTrigger = (id: string) => {
    const job = jobData.find((row) => row._id === id);
    setSelectedJobId(id);
    setSelectedStatus(job?.status || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJobId(null);
    setSelectedStatus(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleCloseModal();
    }
  };

  const renderCell = (row: TableRow, key: string) => {
    if (key === "portfolio") {
      return (
        <div
          className={`py-1 border-b border-blue-500 w-22 flex justify-start items-center gap-1 ${
            row.userId ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
          onClick={() => row.userId && handleCopyLink(row.userId)}
        >
          <div className="w-4 h-4 relative overflow-hidden">
            <Image
              className="w-4 h-4"
              src={copyLink}
              alt="Copy Link"
              width={16}
              height={16}
            />
          </div>
          <div className="text-blue-500 text-xs font-normal  leading-tight">
            {row[key]}
          </div>
        </div>
      );
    }
    if (key === "status") {
      return (
        <div
          className={`px-4 py-1.5 rounded-[99px] flex justify-center items-center gap-2.5 cursor-pointer ${getStatusStyles(
            row[key],
          )}`}
          onClick={() => statusModalTrigger(row._id)}
        >
          <div className="text-xs font-normal  leading-tight">{row[key]}</div>
        </div>
      );
    }
    return row[key];
  };

  const sortOptions: SelectOption[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Selected", value: "SELECTED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full inline-flex flex-col justify-center items-start gap-10">
            <div className="inline-flex justify-start items-center gap-2.5">
              <CustomSelect
                options={sortOptions}
                placeholder="Sort"
                icon={
                  <div className="w-5 h-5 relative origin-top-left -rotate-90 overflow-hidden">
                    <div className="w-2.5 h-[5px] left-[5px] top-[7.50px] absolute outline  outline-offset-[-0.62px] outline-stone-200" />
                  </div>
                }
                value={sort}
                onChange={(value) => setSort(value)}
              />
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-5">
              <DynamicTable
                headers={headers}
                data={jobData}
                rowIcon={eyeImg.src}
                onclickFunction={(id) => {
                  const row = jobData.find((job) => job._id === id);
                  if (row?.userId) {
                    handleRowIconClick(row.userId);
                  }
                }}
                renderCell={renderCell}
              />
              {jobData.length >= limit ? (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              ) : (
                <></>
              )}
              {isModalOpen && (
                <UpdateStatusModal
                  onClose={handleCloseModal}
                  handleOverlayClick={handleOverlayClick}
                  modalRef={modalRef}
                  selectedJobId={selectedJobId}
                  currentStatus={selectedStatus}
                  onStatusChange={updateJobStatus}
                />
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default JobListingsId;
