"use client";

import DynamicTable from "@/app/components/DynamicTable";
import React, { useEffect, useRef, useState } from "react";
import { ChevronsUpDown, ArrowDownToLine } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { TableRow } from "../../../../types/interface-types";
import eyeimg from "../../../../assets/icons/Eye.png";
import copyLink from "../../../../assets/icons/CopyLink.png";
import DummyImg from "../../../../assets/images/LoginImg.jpg";
import {
  downloadCSV,
  getTaskById,
  UpdateJobById,
} from "@/services/admin-services";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import { toast } from "sonner";
import Pagination from "@/app/components/Pagination";
import UpdateStatusModal from "@/app/components/UpdateJobStatusModal";
import Loader from "../../components/ui/Loader";

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: React.ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface RevisedData {
  _id: string;
  minAge: number;
  maxAge: number;
  minHeightInCm: number;
  date?: string | null;
  time: number;
  pay: number;
  currency: string;
  countryCode: string;
  isActive: boolean;
  title: string;
  image?: string;
  description: string;
  companyName: string;
  location: string;
  city: string;
  country: string;
  gender: string;
  branch: string;
}

interface CustomTableRow extends TableRow {
  userId?: string;
}

const JobListingsId: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id;
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [jobData, setJobData] = useState<CustomTableRow[]>([]);
  const [revisedData, setRevisedData] = useState<RevisedData | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);

  const headers: TableHeader[] = [
    {
      label: "Name",
      key: "name",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[100px] sm:min-w-[120px] lg:min-w-[150px]",
    },
    {
      label: "Gender",
      key: "gender",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[70px] sm:min-w-[100px] lg:min-w-[120px]",
    },
    {
      label: "Portfolio",
      key: "portfolio",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]",
    },
    {
      label: "Status",
      key: "status",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]",
    },
    {
      label: "Date Of Birth",
      key: "dateOfBirth",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[90px] sm:min-w-[100px] lg:min-w-[120px]",
    },
    {
      label: "Country",
      key: "country",
      icon: <ChevronsUpDown className="w-3 h-3 sm:w-4 sm:h-4" />,
      width: "min-w-[80px] sm:min-w-[100px] lg:min-w-[120px]",
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

  const fetchjobById = async () => {
    setLoading(true);
    try {
      const response = await getTaskById(
        `${ADMIN_URLS.GET_JOB_BY_ID}/${jobId}?page=${page}&limit=${limit}&status=${activeFilter}`,
      );

      if (response.status === 200) {
        const resData = response?.data?.data;
        const appliedJobs = resData?.appliedJobs || [];
        const revised = resData?.revisedData;
        const paginationData = resData?.pagination;

        const mappedJobs: CustomTableRow[] = appliedJobs.map((job: any) => ({
          _id: job._id || "",
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
        setRevisedData(revised);
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

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    setPage(1);
  };

  useEffect(() => {
    if (jobId) {
      fetchjobById();
    }
  }, [page, limit, activeFilter, jobId]);

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

  const formatDateTime = (date: string, time: number) => {
    const dateObj = new Date(date);
    const dateStr = dateObj.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    const timeStr = time.toString().padStart(2, "0") + ":00";
    return { date: dateStr, time: timeStr };
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
        await fetchjobById();
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

  const handleRowIconClick = (id: string) => {
    const job = jobData.find((row) => row._id === id);
    setSelectedJobId(id);
    setSelectedStatus(job?.status || null);
    setIsModalOpen(true);
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

  const handleDownloadCSV = async () => {
    setLoading(true);
    try {
      const response = await downloadCSV(
        `${ADMIN_URLS.DOWNLOAD_CSV_TASK}/${jobId}`,
      );
      if (response.status === 200) {
        let filename = `export_${jobId}.csv`;
        const contentDisposition = response.headers["content-disposition"];
        if (contentDisposition) {
          const match = contentDisposition.match(/filename="(.+?)"/);
          if (match && match[1]) {
            filename = match[1];
          }
        }

        const blob = new Blob([response.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success("Download Success");
      } else {
        toast.error("Download Error");
      }
    } catch (error) {
      console.log(error);
      toast.error("Download Failed");
    } finally {
      setLoading(false);
    }
  };

  const renderCell = (row: TableRow, key: string) => {
    if (key === "portfolio") {
      return (
        <div
          className={`py-1 border-b border-blue-500 w-16 sm:w-20 lg:w-22 flex justify-start items-center  ${
            row.userId ? "cursor-pointer" : "cursor-not-allowed opacity-50"
          }`}
          onClick={() => row.userId && handleCopyLink(row.userId)}
        >
          <div className="w-3 h-3 sm:w-4 sm:h-4 relative overflow-hidden flex-shrink-0">
            <Image
              className="w-2 h-2 sm:w-3 sm:h-3"
              src={copyLink}
              alt="Copy Link"
              width={16}
              height={16}
            />
          </div>
          <div className="text-blue-500 text-[10px] xs:text-xs sm:text-sm font-normal  leading-tight truncate">
            {row[key]}
          </div>
        </div>
      );
    }
    if (key === "status") {
      return (
        <div
          className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 rounded-[99px] flex justify-center items-center gap-1 sm:gap-2.5 cursor-pointer ${getStatusStyles(
            row[key],
          )} min-w-fit max-w-full`}
          onClick={() => statusModalTrigger(row._id)}
        >
          <div className="text-[10px] xs:text-xs sm:text-sm font-normal  leading-tight whitespace-nowrap">
            {row[key]}
          </div>
        </div>
      );
    }
    return (
      <div className="text-[10px] xs:text-xs sm:text-sm font-normal  leading-tight break-words">
        {row[key]}
      </div>
    );
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full max-w-[100vw] overflow-x-hidden inline-flex flex-col justify-center items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10 ">
            <style jsx>{`
              @media (max-width: 375px) {
                .xs-responsive-table {
                  min-width: 500px;
                }
                .xs-filter-button {
                  width: 60px;
                  padding: 0.25rem 0.5rem;
                  font-size: 0.6rem;
                }
                .xs-modal-content {
                  width: 95vw !important;
                  max-width: 95vw !important;
                  margin: 0.5rem;
                }
              }
              @media (min-width: 376px) and (max-width: 480px) {
                .responsive-table {
                  min-width: 550px;
                }
                .filter-button {
                  width: 70px;
                  padding: 0.375rem 0.75rem;
                  font-size: 0.65rem;
                }
                .modal-content {
                  width: 92vw !important;
                  max-width: 92vw !important;
                }
              }
              @media (min-width: 481px) and (max-width: 640px) {
                .responsive-table {
                  min-width: 600px;
                }
                .filter-button {
                  width: 80px;
                  padding: 0.5rem;
                  font-size: 0.7rem;
                }
                .modal-content {
                  width: 90vw !important;
                  max-width: 90vw !important;
                }
              }
              @media (min-width: 641px) and (max-width: 768px) {
                .filter-button {
                  width: 100px;
                  font-size: 0.75rem;
                }
                .modal-content {
                  width: 85vw !important;
                  max-width: 85vw !important;
                }
              }
              @media (min-width: 769px) and (max-width: 1024px) {
                .filter-button {
                  width: 110px;
                  font-size: 0.875rem;
                }
                .modal-content {
                  width: 70vw !important;
                  max-width: 70vw !important;
                }
              }
              @media (min-width: 1025px) {
                .modal-content {
                  width: 60vw !important;
                  max-width: 60vw !important;
                }
              }
              .filter-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: center;
                align-items: center;
                gap: 0.25rem;
              }
              @media (min-width: 640px) {
                .filter-container {
                  justify-content: flex-start;
                  gap: 0.5rem;
                }
              }
            `}</style>

            <div className="self-stretch inline-flex flex-col lg:flex-row justify-start items-start gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
              <div className="w-full lg:w-1/4 min-h-[300px] lg:min-h-0 bg-zinc-800 rounded-[10px] border border-stone-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                {revisedData?.image ? (
                  <img
                    src={
                      revisedData?.image
                        ? `${BASE_IMG_URL}${revisedData?.image}`
                        : ""
                    }
                    alt="Job"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="min-h-[300px] flex justify-center items-center">
                    <span className="text-zinc-400 text-center text-sm  font-light ">
                      No Image Available
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-3 sm:gap-4 lg:gap-5">
                <div className="self-stretch flex flex-col justify-start items-start gap-2 sm:gap-2.5">
                  <div className="justify-start text-stone-200 text-base sm:text-lg lg:text-xl xl:text-xl font-extrabold  leading-tight break-words">
                    {revisedData?.title ||
                      "Runway Casting – Berlin Fashion Week"}
                  </div>
                  <div className="self-stretch justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light  leading-tight break-words">
                    {revisedData?.description ||
                      "I'm a passionate and versatile model..."}
                  </div>
                </div>

                <div className="self-stretch inline-flex flex-col lg:flex-row justify-start items-start lg:items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-10">
                  <div className="flex-1 flex justify-start items-center gap-1.5">
                    <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                      <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                        Company Name
                      </div>
                      <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold  break-words">
                        {revisedData?.companyName || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex justify-start items-center gap-1.5">
                    <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                      <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                        Date and Time
                      </div>
                      <div className="inline-flex flex-wrap justify-start items-center gap-1.5 sm:gap-2.5">
                        <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold ">
                          {revisedData?.date
                            ? new Date(revisedData.date).toLocaleString(
                                "en-GB",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour12: true,
                                },
                              )
                            : "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="self-stretch inline-flex flex-col lg:flex-row justify-start items-start lg:items-center gap-3 sm:gap-4 lg:gap-6 xl:gap-10">
                  <div className="flex-1 flex justify-start items-center gap-1.5">
                    <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                      <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                        Estimated Payout
                      </div>
                      <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold ">
                        {revisedData
                          ? `${revisedData.currency === "eur" ? "€" : "£"} ${
                              revisedData.pay
                            }`
                          : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="self-stretch p-3 sm:p-4 lg:p-5 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-3 sm:gap-4 lg:gap-5">
              <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-extrabold ">
                Eligibility Criteria
              </div>
              <div className="self-stretch grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <div className="flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                    <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                      Age
                    </div>
                    <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold ">
                      {revisedData
                        ? `${revisedData.minAge}-${revisedData.maxAge}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                    <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                      Gender
                    </div>
                    <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold ">
                      {revisedData?.gender || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="flex justify-start items-center gap-1.5">
                  <div className="flex-1 inline-flex flex-col justify-center items-start gap-2 sm:gap-2.5">
                    <div className="justify-start text-stone-200 text-xs sm:text-sm lg:text-base font-light ">
                      Job Type
                    </div>
                    <div className="justify-start text-stone-200 text-sm sm:text-base lg:text-sm font-bold  break-words">
                      {revisedData?.branch || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="self-stretch flex flex-col justify-start items-start gap-3 sm:gap-4 lg:gap-5">
              <div className="self-stretch inline-flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 sm:gap-4">
                <div className="w-full lg:w-auto lg:min-w-[500px] xl:min-w-[600px] p-[3px] bg-neutral-900 rounded-[50px] flex justify-center items-center">
                  <button
                    className={`flex-1 p-1.5 sm:p-2 lg:p-2.5 rounded-[50px] flex justify-center cursor-pointer items-center gap-1 sm:gap-2.5 transition-all duration-200 ${
                      activeFilter === "ALL"
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-900 text-stone-200"
                    }`}
                    onClick={() => handleFilterClick("ALL")}
                  >
                    <div className="text-center text-[10px] xs:text-xs sm:text-sm lg:text-base font-normal  whitespace-nowrap ">
                      All ({jobData.length})
                    </div>
                  </button>
                  <button
                    className={`flex-1 p-1.5 sm:p-2 lg:p-2.5 rounded-[50px] flex justify-center cursor-pointer items-center gap-1 sm:gap-2.5 transition-all duration-200 ${
                      activeFilter === "PENDING"
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-900 text-stone-200"
                    }`}
                    onClick={() => handleFilterClick("PENDING")}
                  >
                    <div className="text-center text-[10px] xs:text-xs sm:text-sm lg:text-base font-normal  whitespace-nowrap">
                      Pending
                    </div>
                  </button>
                  <button
                    className={`flex-1 p-1.5 sm:p-2 lg:p-2.5 rounded-[50px] flex justify-center cursor-pointer items-center gap-1 sm:gap-2.5 transition-all duration-200 ${
                      activeFilter === "SELECTED"
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-900 text-stone-200"
                    }`}
                    onClick={() => handleFilterClick("SELECTED")}
                  >
                    <div className="text-center text-[10px] xs:text-xs sm:text-sm lg:text-base font-normal  whitespace-nowrap">
                      Shortlisted
                    </div>
                  </button>
                  <button
                    className={`flex-1 p-1.5 sm:p-2 lg:p-2.5 rounded-[50px] flex justify-center cursor-pointer items-center gap-1 sm:gap-2.5 transition-all duration-200 ${
                      activeFilter === "REJECTED"
                        ? "bg-rose-500 text-white"
                        : "bg-neutral-900 text-stone-200"
                    }`}
                    onClick={() => handleFilterClick("REJECTED")}
                  >
                    <div className="text-center text-[10px] xs:text-xs sm:text-sm lg:text-base font-normal  whitespace-nowrap">
                      Rejected
                    </div>
                  </button>
                </div>

                <div
                  className={`px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-[50px] outline outline-offset-[-1px] outline-rose-500 flex justify-center items-center gap-1.5 sm:gap-2.5 cursor-pointer transition-all duration-200 hover:bg-rose-500/10 ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={loading ? () => {} : handleDownloadCSV}
                >
                  <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 relative overflow-hidden flex-shrink-0">
                    <ArrowDownToLine className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
                  </div>
                  <div className="text-center text-stone-200 text-xs sm:text-sm lg:text-base font-normal  whitespace-nowrap">
                    {loading ? "Downloading..." : "Export CSV"}
                  </div>
                </div>
              </div>

              <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-300">
                <DynamicTable
                  headers={headers}
                  data={jobData}
                  rowIcon={eyeimg.src}
                  onclickFunction={handleRowIconClick}
                  renderCell={renderCell}
                  // className="responsive-table xs-responsive-table min-w-full"
                />
              </div>

              <div className="self-stretch flex justify-center">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>

              {isModalOpen && (
                <UpdateStatusModal
                  onClose={handleCloseModal}
                  handleOverlayClick={handleOverlayClick}
                  modalRef={modalRef}
                  selectedJobId={selectedJobId}
                  currentStatus={selectedStatus}
                  onStatusChange={updateJobStatus}
                  // className="modal-content xs-modal-content"
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
