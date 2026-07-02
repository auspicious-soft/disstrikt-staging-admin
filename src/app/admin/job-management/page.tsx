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
import { useRouter } from "next/navigation";
import { getAllJobs } from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { toast } from "sonner";
import { useCountry } from "@/app/components/CountryContext";
import Loader from "../components/ui/Loader";
// Define interfaces for TypeScript type safety
interface SelectOption {
  label: string;
  value: string;
}

interface JobData {
  _id: string;
  title: string;
  companyName: string;
  country: string;
  pay: number;
  countryCode: string;
  currency: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const JobListings: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [jobList, setJobList] = useState<TableRow[]>([]);
  const [sort, setSort] = useState("oldToNew"); // default
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 500); // ✅ safe debounce

  const router = useRouter();
  const { country } = useCountry();

  const headers: TableHeader[] = [
    {
      label: "Job Title",
      key: "jobTitle",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Company Name",
      key: "companyName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Country",
      key: "country",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Estimated Payout",
      key: "payout",
      fontWeight: "font-medium",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];
  const fetchAlljobs = async (showLoader = true) => {
    if (showLoader) setLoading(true); // 👈 only show loader when needed
    try {
      let URL = `${ADMIN_URLS.GET_ALL_JOBS}?page=${page}&limit=${limit}`;

      // only add sort if not empty
      if (sort) {
        URL += `&sort=${sort}`;
      }

      if (country) {
        URL += `&country=${country}`;
      }

      if (debouncedSearch)
        URL += `&search=${encodeURIComponent(debouncedSearch)}`;

      const response = await getAllJobs(`${URL}`);
      if (response.status === 200) {
        const resData = response?.data?.data?.data;
        const paginationData = response?.data?.data?.pagination;
        const mappedJobs: TableRow[] = resData.map((job: JobData) => ({
          _id: job._id,
          jobTitle: job.title,
          companyName: job.companyName,
          country: job.country,
          payout: `${job.currency.toUpperCase()} ${job.pay}`,
        }));

        setJobList(mappedJobs);
        setTotalPages(paginationData.totalPages);
      } else {
        toast.error("Error fetching jobs");
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlljobs(false);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAlljobs(true);
  }, [country, sort, page, limit]);

  // Sample options for sort and country selects
  const baseSortOptions: SelectOption[] = [
    { label: "Job Date (Old → New)", value: "oldToNew" },
    { label: "Job Date(New → Old)", value: "newToOld" },
    { label: "High → Low Pay", value: "highToLowPay" },
    { label: "Low → High Pay", value: "lowToHighPay" },
  ];

  const sortOptions = sort
    ? [...baseSortOptions, { label: "Clear Sorting", value: "" }]
    : baseSortOptions;

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/job-management/${_id}`);
  };
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full inline-flex flex-col justify-center items-start gap-10">
            <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
              <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full max-w-full">
                <div className="w-full sm:w-auto max-w-full">
                  <CustomSelect
                    options={sortOptions}
                    placeholder="Sort"
                    icon={
                      <div className="w-5 h-5 relative origin-top-left -rotate-90 overflow-hidden">
                        <div className="w-2.5 h-[5px] left-[5px] top-[7.50px] absolute outline outline-offset-[-0.62px] outline-stone-200" />
                      </div>
                    }
                    value={sort}
                    onChange={(value) => setSort(value)}
                  />
                </div>
                <div className="w-full sm:w-auto max-w-full">
                  <CustomInput
                    placeholder="Search"
                    icon={<Search className="w-4 h-4" />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-auto max-w-full">
                  <CustomButton
                    label="Post New Job"
                    size="Medium"
                    bgColor="bg-rose-500"
                    textColor="text-white"
                    onClick={() =>
                      router.push("/admin/job-management/post-job")
                    }
                  />
                </div>
              </div>
              <div className="self-stretch rounded-[10px] flex flex-col justify-start items-start">
                <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700 flex flex-col justify-start items-start">
                  {" "}
                  <DynamicTable
                    headers={headers}
                    data={jobList}
                    rowIcon={eyeimg.src}
                    onclickFunction={handleRouteWithId}
                  />
                </div>
                {jobList.length >= limit ? (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
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

export default JobListings;
