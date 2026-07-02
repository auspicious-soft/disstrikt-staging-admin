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
import { getRevenueData } from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { toast } from "sonner";
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

interface RevenueData {
  _id: string;
  userId: {
    _id:string;
    fullName:string;
  };
  status: string;
  amount: number;
  currency: string;
  paidAt: string;
  planName: string;
}

const getCurrencySymbol = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "USD":
      return "$";
    default:
      return currency; 
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const Revenue: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [revenuesData, setRevenuesData] = useState<TableRow[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Sample headers for the table
  const headers: TableHeader[] = [
    {
      label: "User Id",
      key: "_id",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Name",
      key: "fullName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Subscription Plan",
      key: "planName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Renewed On",
      key: "paidAt",
      fontWeight: "font-medium",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Amount",
      key: "amount",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];
  


   const fetchRevenueData = async () => {
    try {
      const response = await getRevenueData(`${ADMIN_URLS.GET_ALL_REVENUES}?page=${page}&limit=${limit}`);
      if (response.status === 200) {
        const resData = response?.data?.data?.data;
        const paginationData = response?.data?.data;
        const mappedJobs: TableRow[] = resData.map((revenue: RevenueData) => ({
        _id: revenue._id,
          fullName: revenue.userId.fullName,
          status: revenue.status,
          amount: `${getCurrencySymbol(revenue.currency)}${revenue.amount}`,
          currency: revenue.currency,
          paidAt: formatDate(revenue.paidAt),
          planName: revenue.planName,
        }));

        setRevenuesData(mappedJobs);
        setTotalPages(paginationData.totalPages);
      } else {
        toast.error("Error fetching jobs");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
       fetchRevenueData();
  }, [ page, limit]);




  return (
    <>
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
       
        <div className="self-stretch rounded-[10px] flex flex-col justify-start items-start">
          <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700 flex flex-col justify-start items-start">
            {" "}
            <DynamicTable
              headers={headers}
              data={revenuesData}
              rowIcon={eyeimg.src}
              isEyeShow={false}
            />
          </div>
          {revenuesData.length >= limit ? 
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
           : <></>}
        </div>
      </div>
    </div>
    </>
  );
};

export default Revenue;
