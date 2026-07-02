"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import { toast } from "sonner";
import dummyImg from "../../../../assets/images/LoginImg.jpg";
import { getSingleEmployee, updateEmployee } from "@/services/admin-services";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import Loader from "../../components/ui/Loader";
import Link from "next/link";
import Pagination from "@/app/components/Pagination";

interface Log {
  _id: string;
  logs: string; // description
  createdAt: string;
  referenceId: string;
  referenceModel: string;
}

interface EmployeeData {
  _id: string;
  fullName: string;
  email: string;
  image?: string;
  role: string;
  country: string;
  language: string;
  isBlocked: boolean;
  logs: Log[];
}

const EmployeeById: React.FC = () => {
  const params = useParams();
  const pathname = usePathname();

  const employeeId = params?.id;
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    country: "",
    language: "",
    isBlocked: false,
    newPassword: "",
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("en-GB", options); // e.g., 12 Sep 2025, 10:58
  };

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const res = await getSingleEmployee(
        `${ADMIN_URLS.GET_EMPLOYEE_BY_ID}/${employeeId}?page=${page}&limit=${limit}`
      );
      if (res.status === 200) {
        const data = res.data.data;

        const currentPage = Number(data.page) || 1;
        const totalPages = Number(data.totalPages) || 1;

        const paginationData = res?.data?.totalPages;

        setEmployee(data);
        setPage(currentPage);
        setTotalPages(totalPages);

        setFormData({
          fullName: data.fullName || "",
          email: data.email || "",
          role: data.role || "",
          country: data.country || "",
          language: data.language || "",
          isBlocked: data.isBlocked || false,
          newPassword: "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch employee");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [page, limit]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload: any = {
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        country: formData.country,
        language: formData.language,
        isBlocked: formData.isBlocked,
      };
      if (formData.newPassword) {
        payload.password = formData.newPassword;
      }

      const res = await updateEmployee(
        `${ADMIN_URLS.UPDATE_EMPLOYEE}/${employeeId}`,
        payload
      );
      if (res.status === 200) {
        toast.success("Employee updated successfully");
        setEditMode(false);
        fetchEmployee();
      }
    } catch (error) {
      toast.error("Error updating employee");
    } finally {
      setLoading(false);
    }
  };

  const imageSrc = employee?.image
    ? employee.image.startsWith("http")
      ? employee.image
      : `${BASE_IMG_URL}${employee.image}`
    : dummyImg;

  const getLogLink = (log: Log, currentPath: string) => {
    const baseHref = (() => {
      switch (log.referenceModel) {
        case "tasks":
          return `/admin/task-management/${log.referenceId}`;
        case "taskresponse":
          return `/admin/user-management/review-task/${log.referenceId}?fr=review-tasks`;
        case "jobs":
          return `/admin/job-management/${log.referenceId}`;
        case "appliedJobs":
          return `/admin/job-management/${log.referenceId}`;
        default:
          return `/${log.referenceModel}/${log.referenceId}`;
      }
    })();

    // If you want to always include "from" query for back navigation
    return {
      pathname: baseHref.split("?")[0], // remove any existing query from baseHref
      query: { from: currentPath },
    };
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="flex flex-col lg:flex-row gap-10 px-4 sm:px-6 lg:px-8">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:gap-8 rounded-xl p-4 shadow-md w-full lg:max-w-sm lg:mx-auto">
              <div className="flex justify-center">
                <Image
                  src={imageSrc}
                  alt="Employee"
                  width={100}
                  height={100}
                  className="object-cover rounded-[20px] w-full max-w-[100px] "
                />
              </div>

              {/* Form Section */}
              <div className="flex-1 flex flex-col gap-4 text-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                  <Field
                    label="Full Name"
                    name="fullName"
                    value={formData.fullName}
                    editable={editMode}
                    onChange={handleChange}
                  />
                  <Field
                    label="Email"
                    name="email"
                    value={formData.email}
                    editable={editMode}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* <Field
              label="Role"
              name="role"
              value={formData.role}
              editable={editMode}
              onChange={handleChange}
            /> */}

                  <Field
                    label="Country"
                    name="country"
                    value={formData.country}
                    editable={editMode}
                    onChange={handleChange}
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-xs sm:text-sm font-light">
                      Status
                    </label>
                    <p className="px-3 py-2 rounded-[30px] bg-neutral-800 text-stone-300">
                      {formData.isBlocked ? "Blocked" : "Unblocked"}
                    </p>
                  </div>
                </div>

                {/* Password field only in edit mode */}
                {editMode && (
                  <Field
                    label="New Password"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    editable={editMode}
                    onChange={handleChange}
                  />
                )}

                {/* Action Buttons */}
                <div className="mt-4 flex gap-4 justify-center">
                  {editMode ? (
                    <button
                      onClick={handleSave}
                      className="px-5 w-full py-2 bg-rose-500 text-white rounded-[30px] hover:bg-rose-600 transition cursor-pointer"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditMode(true)}
                      className="px-5 w-full py-2 bg-[#ffccd3] text-black rounded-[30px] hover:bg-[#b78e94] transition cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto p-4 rounded-xl shadow-md no-scrollbar">
              {employee?.logs?.length ? (
                <div>
                  <table className="min-w-full bg-neutral-900 rounded-lg overflow-hidden shadow-md">
                    <thead>
                      <tr className="bg-neutral-800 text-left">
                        <th className="px-6 py-3 text-stone-300">Activity</th>
                        <th className="px-6 py-3 text-stone-300">Time</th>
                        <th className="px-6 py-3 text-stone-300">Link</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.logs.map((log) => {
                        // check if logs string ends with " 0"
                        const shouldHideLink = log.logs.trim().endsWith(" 0");

                        return (
                          <tr
                            key={log._id}
                            className="border-b border-neutral-700 hover:bg-neutral-800 transition"
                          >
                            <td className="px-6 py-4 text-stone-200">
                              {log.logs}
                            </td>
                            <td className="px-6 py-4 text-stone-400">
                              {formatDate(log.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              {!shouldHideLink && (
                                <Link
                                  href={getLogLink(log, pathname)}
                                  className="text-blue-500 hover:underline"
                                >
                                  View
                                </Link>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                    />
                  )}
                </div>
              ) : (
                <p className="text-stone-400 flex justify-center">
                  No Activiity found
                </p>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};

const Field = ({
  label,
  name,
  value,
  editable,
  type = "text",
  onChange,
}: {
  label: string;
  name: string;
  value: string | boolean;
  editable: boolean;
  type?: string;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs sm:text-sm font-light">{label}</label>
    {editable ? (
      <input
        type={type}
        name={name}
        value={String(value)}
        onChange={onChange}
        className="px-3 py-2 rounded-[30px] bg-neutral-800 text-white border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-rose-500"
      />
    ) : (
      <p className="px-3 py-2 rounded-[30px] bg-neutral-800 text-stone-300">
        {String(value) || "N/A"}
      </p>
    )}
  </div>
);

export default EmployeeById;
