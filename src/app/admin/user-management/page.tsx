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
import { ADMIN_URLS } from "@/constants/apiUrls";
import { useCountry } from "@/app/components/CountryContext";
import { getAllUsers } from "@/services/admin-services";
import { toast } from "sonner";
import Loader from "../components/ui/Loader";

// Define interfaces for TypeScript type safety
interface SelectOption {
  label: string;
  value: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface UserData {
  id: number;
  _id: string;
  fullName: string;
  country: string;
  jobAppliedCount: number;
  deviceType:string;
  environment:string;
  isCommitment:boolean;
  totalAmountPaid: number;
  subscriptionPlan: string;
  currency: string;
  status:string;
  currentPeriodEnd:string;
  trialEnd:string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}


const UserManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
const debouncedSearch = useDebouncedValue(search, 500); // ✅ safe debounce

  const { country } = useCountry();

  const [UserList, setUserList] = useState<TableRow[]>([]);

  const router = useRouter();

  const headers: TableHeader[] = [
    {
      label: " Id",
      key: "id",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },

    {
      label: "Name",
      key: "fullName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Subscription Plan",
      key: "subscriptionPlan",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
     {
      label: "Status",
      key: "status",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
     {
      label: "End's on",
      key: "endOn",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
      {
      label: "Device Type",
      key: "deviceType",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Type",
      key: "isCommitment",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Country",
      key: "country",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Total Amount Paid",
      key: "totalAmountPaid",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const formatDate = (date?: string) => {
  if (!date) return "-";
  return new Date(date).toISOString().split("T")[0];
};

const formatStatus = (status?: string) => {
  if (!status) return "-";

  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};




const fetchAllUsers = async (showLoader = true) => {
  if (showLoader) setLoading(true); // 👈 only show loader when needed
  try {
    let URL = `${ADMIN_URLS.GET_ALL_USERS}?page=${page}&limit=${limit}`;

    if (sort) URL += `&sort=${sort}`;
    if (country) URL += `&country=${country}`;
    if (debouncedSearch) URL += `&search=${encodeURIComponent(debouncedSearch)}`;

    const response = await getAllUsers(URL);
    if (response.status === 200) {
      const resData = response?.data?.data?.users;
      const paginationData = response?.data?.data?.pagination;

      const mappedUsers: TableRow[] = resData.map((user: UserData, idx: number) => {
        const currencySymbol = user.currency === "gbp" ? "£" : user.currency === "eur" ? "€" : "";

        return {
          _id: user._id,
          id: (page - 1) * limit + (idx + 1),
          fullName: user.fullName || "-",
          country: user.country || "-",
          jobAppliedCount: user.jobAppliedCount || "0",
          totalAmountPaid:
            user.currency && user.totalAmountPaid
              ? `${currencySymbol}${Math.round(user.totalAmountPaid)}`
              : "-",
          subscriptionPlan: user.subscriptionPlan || "-",
          isCommitment: user.isCommitment ? "Commitment" : "Flex",
          environment:user.environment ? user.environment === "Production" ? "Prod" : user.environment : "-" ,
          deviceType:user.deviceType ? user.deviceType : user.environment === "Production" ? "Stripe" : "-",
          status: formatStatus(user.status) || "-" ,
         endOn: formatDate(user.currentPeriodEnd || user.trialEnd),

        };
      });

      setUserList(mappedUsers);
      setTotalPages(paginationData.totalPages);
    } else {
      toast.error("Error fetching users");
    }
  } catch (error) {
    console.log(error);
  } finally {
    if (showLoader) setLoading(false); 
  }
};

useEffect(() => {
  fetchAllUsers(false);
}, [debouncedSearch]);

useEffect(() => {
  fetchAllUsers(true);
}, [country, sort, page, limit]);

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/user-management/${_id}`);
  };

  const baseSortOptions = [
    { label: "Low → High Job", value: "jobLowToHigh" },
    { label: "High → Low Job", value: "jobHighToLow" },
  ];
  const sortOptions = sort
    ? [...baseSortOptions, { label: "Clear Sorting", value: "" }]
    : baseSortOptions;

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full flex flex-col justify-center items-start gap-10 max-w-full">
            <div className="w-full flex flex-col justify-start items-end gap-2.5 max-w-full">
              {/* Sort + Search */}
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
              </div>
              <div className="w-full flex flex-col justify-start items-start max-w-full">
                <div className="w-full overflow-x-auto max-w-full rounded-md outline outline-offset-[-1px] outline-stone-700">
                  <DynamicTable
                    headers={headers}
                    data={UserList}
                    rowIcon={eyeimg.src}
                    onclickFunction={handleRouteWithId}
                  />
                </div>
                <div className="w-full flex justify-center mt-3">
                  {UserList && UserList.length ? 
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                :
                <></>  
                }
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserManagement;
