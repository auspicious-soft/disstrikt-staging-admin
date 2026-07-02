"use client";

import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import React, { ReactElement, useEffect, useState } from "react";
import { TableRow } from "../../../../types/interface-types"; // Import shared interface
import { Trash2, RotateCcw } from "lucide-react";
import eyeimg from "../../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { getEmployeesByAdmin, updateEmployee } from "@/services/admin-services";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";
import ToggleSwitch from "@/app/components/ToggleSwitch";

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface EmployeeData {
  id: number;
  _id: string;
  fullName: string;
  country: string;
  image: string;
  role: string;
  language: string;
  isBlocked: boolean;
  email: string;
  countryCode: string;
}

const GetAllEmployees: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [employeeList, setEmployeeList] = useState<TableRow[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(100);
  const countryMap: Record<string, string> = {
    FR: "France",
    UK: "United Kingdom",
    ES: "Spain",
    NL: "Netherlands",
    BL: "Belgium",
  };
  const router = useRouter();

  const headers: TableHeader[] = [
    {
      label: " Id",
      key: "id",
    },

    {
      label: "Name",
      key: "fullName",
    },
    {
      label: "Email",
      key: "email",
    },
    {
      label: "Country",
      key: "country",
    },

    {
      label: "Role",
      key: "role",
    },
    // {
    //   label: "Language",
    //   key: "language",
    // },
  ];

  const fetchAllEmployees = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const URL = `${ADMIN_URLS.GET_ALL_EMPLOYEES}`;
      const response = await getEmployeesByAdmin(URL);
      if (response.status === 200) {
        const resData = response?.data?.data;

        const mappedUsers: TableRow[] = resData.map(
          (emp: EmployeeData, idx: number) => {
            return {
              _id: emp._id,
              id: (page - 1) * limit + (idx + 1),
              fullName: emp.fullName || "NA",
              country: countryMap[emp.country] || emp.country || "NA",
              image: emp.image || "NA",
              role: emp.role || "NA",
              language: emp.language || "NA",
              isBlocked: emp.isBlocked,
              email: emp.email || "NA",
              countryCode: emp.country,
            };
          }
        );

        setEmployeeList(mappedUsers);
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
    fetchAllEmployees(true);
  }, [page, limit]);

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/employee-management/${_id}`);
  };

const handleBlockToggle = async (row: any, block: boolean) => {
  setLoading(true);
  try {
    const payload = {
      fullName: row.fullName,
      email: row.email,
      password: "",
      country: row.countryCode,
      isBlocked: block,
    };

    const res = await updateEmployee(
      `${ADMIN_URLS.UPDATE_EMPLOYEE}/${row._id}`,
      payload
    );

    if (res.status === 200) {
      if (block) {
        toast.success(`${row.fullName} has been blocked successfully`);
      } else {
        toast.success(`${row.fullName} has been unblocked successfully`);
      }
    }

    fetchAllEmployees(false); // refresh list quietly
  } catch (error) {
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full flex flex-col justify-center items-start gap-10 max-w-full">
            <div className="w-full flex flex-col justify-start items-end gap-2.5 max-w-full">
              <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full max-w-full"></div>
              <div className="w-full flex flex-col justify-start items-start max-w-full">
                <div className="w-full overflow-x-auto max-w-full rounded-md outline outline-offset-[-1px] outline-stone-700">
                  <DynamicTable
                    headers={headers}
                    data={employeeList}
                    rowIcon={eyeimg.src}
                    onclickFunction={handleRouteWithId}
                    renderActions={(row) => (
                      <ToggleSwitch
                        isOn={!row.isBlocked}
                        onToggle={() => handleBlockToggle(row, !row.isBlocked)}
                      />
                    )}
                  />
                </div>
                <div className="w-full flex justify-center mt-3">
                  {employeeList.length >= limit ? (
                    <Pagination
                      currentPage={page}
                      totalPages={0}
                      onPageChange={setPage}
                    />
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default GetAllEmployees;
