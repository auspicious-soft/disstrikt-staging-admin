"use client";
import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import React, { ReactElement, useEffect, useState } from "react";
import { TableRow } from "../../../types/interface-types"; // Import shared interface
import { Eye, Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { getAllReviews } from "@/services/admin-services";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Loader from "../components/ui/Loader";
// Define interfaces for TypeScript type safety
interface SelectOption {
  label: string;
  value: string;
}

interface user {
  fullName: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface ReviewData {
  _id: string;
  Name: number;
  milestone: number;
  createdAt: string;
  appReview: boolean;
  user: user;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}


const ReviewTask: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState<TableRow[]>([]);
  const [sort, setSort] = useState("newToOld");
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 500); // ✅ safe debounce

  const router = useRouter();

  // Sample headers for the table
  const headers: TableHeader[] = [
    {
      label: "S.No", // Changed from "User Id" to "S.No"
      key: "index", // Use index for display
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Name",
      key: "name",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Milestone",
      key: "milestone",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Level",
      key: "level",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Created On",
      key: "createdOn",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const fetchjobById =async (showLoader = true) => {
  if (showLoader) setLoading(true); // 👈 only show loader when needed
    try {
      let MAIN_URL = `${ADMIN_URLS.GET_ALL_REVIEWS}?page=${page}&limit=${limit}&sortOrder=${sort}`;
      if (debouncedSearch) {
        MAIN_URL += `&search=${encodeURIComponent(debouncedSearch)}`;
      }
      const response = await getAllReviews(`${MAIN_URL}`);

      if (response.status === 200) {
        const resData = response?.data?.data?.data;

        const paginationData = resData?.pagination;

        // Map appliedJobs to TableRow format
        const mappedReviews: TableRow[] = resData.map(
          (review: any, idx: number) => ({
            index: (page - 1) * limit + idx + 1,
            _id: review._id || "",
            name: review.user?.fullName || "N/A",
            milestone: review.milestone?.toString() || "N/A", // Convert to string to match TableRow
            level: review.taskNumber || "N/A", // Since level is not in the API response, provide a default
            createdOn: review.createdAt
              ? new Date(review.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit",
                })
              : "N/A", // Format date to match "15-08-23"
          })
        );
        // Set job data for table
        setReviewData(mappedReviews);
        // // Set revised data for JSX fields
        // setRevisedData(revised);
        // Set pagination
        setTotalPages(paginationData?.totalPages || 1);
      } else {
        toast.error("Error Fetching Job Data");
      }
    } catch (error) {
      console.error("Error fetching job:", error);
      toast.error("Error Fetching Job Data");
    } finally {
    if (showLoader) setLoading(false); 
  }
  };


  useEffect(() => {
    fetchjobById(false);
  }, [debouncedSearch]);
  
  useEffect(() => {
    fetchjobById(true);
  }, [ sort, page, limit]);

  const baseSortOptions: SelectOption[] = [
    { label: "Old → New ", value: "oldToNew" },
    { label: "New → Old", value: "newToOld" },
  ];

    const sortOptions = sort
    ? [...baseSortOptions, { label: "Clear Sorting", value: "" }]
    : baseSortOptions;

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/user-management/review-task/${_id}?fr=review-tasks`);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full inline-flex flex-col justify-center items-start gap-10">
            <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
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
                <div className="flex justify-start items-center gap-11">
                  <CustomInput
                    placeholder="Search"
                    icon={<Search className="w-4 h-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="self-stretch rounded-[10px] flex flex-col justify-start items-start">
                <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700 flex flex-col justify-start items-start">
                  {" "}
                  <DynamicTable
                    headers={headers}
                    data={reviewData}
                    rowIcon={eyeimg.src}
                    // isEyeShow={false}
                    onclickFunction={handleRouteWithId}
                  />
                </div>
                {reviewData.length > 0 ? (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ReviewTask;
