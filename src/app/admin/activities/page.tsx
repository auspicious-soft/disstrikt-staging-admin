"use client";
import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import React, { ReactElement, useEffect, useState } from "react";
import { Eye, Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { useCountry } from "@/app/components/CountryContext";
import { getAllActivities, getAllUsers } from "@/services/admin-services";
import { toast } from "sonner";
import { TableRow } from "@/types/interface-types";
import Loader from "../components/ui/Loader";

const TABS = [
  "Upcoming Activities",
  "Past Activities",
  "Reviewd Activities",
  "Cancelled Activities",
  "Un-attended Activities",
];

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

interface ActivityData {
  id: number;
  _id: string;
  slotId?: string;
  userId?: {
    _id?: string;
    fullName?: string;
  };
  studioId?: {
    _id?: string;
    name?: string;
  };
  activityType: string;
  date?: string;
  cancelledBy?: string;
  comments?: string | null;
  startTime?: string;
  endtime?: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const ActivityManagement: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Upcoming Activities");
  const [tabLoading, setTabLoading] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const isPastActivities = activeTab === "Past Activities";
  const isCancelledActivities = activeTab === "Cancelled Activities";

  const debouncedSearch = useDebouncedValue(search, 500);

  const { country } = useCountry();

  const [activityList, setActivityList] = useState<TableRow[]>([]);

  const router = useRouter();

  // Base headers for all tabs
  const baseHeaders: TableHeader[] = [
    {
      label: " Id",
      key: "id",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Model Name",
      key: "modelName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Studio",
      key: "studio",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Activity Type",
      key: "activityType",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date",
      key: "date",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Time",
      key: "time",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  // Add "Cancelled Via" column for Cancelled Activities tab
  const headers: TableHeader[] = isCancelledActivities
    ? [
        ...baseHeaders,
        {
          label: "Cancelled Via",
          key: "cancelledVia",
          icon: <ChevronsUpDown className="w-4 h-4" />,
        },
      ]
    : baseHeaders;

  const formatDate = (date?: string) => {
    if (!date) return "-";

    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
  };

  const formatTimeRange = (start?: string, end?: string) => {
    if (!start || !end) return "-";

    const to12Hour = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const hourStr = String(hour12).padStart(2, "0");
      const minuteStr = m === 0 ? "" : `:${String(m).padStart(2, "0")}`;
      const period = h >= 12 ? "PM" : "AM";
      return `${hourStr}${minuteStr} ${period}`;
    };

    return `${to12Hour(start)} - ${to12Hour(end)}`;
  };

  const getActiveTabKey = (tab: string) => {
    switch (tab) {
      case "Upcoming Activities":
        return "Upcoming";
      case "Past Activities":
        return "Past";
      case "Reviewd Activities":
        return "Reviewed";
      case "Cancelled Activities":
        return "Cancelled";
      case "Un-attended Activities":
        return "Unattended";
      default:
        return "";
    }
  };

  const activeKey = getActiveTabKey(activeTab);

  const fetchAllActivities = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      let URL = `${ADMIN_URLS.GET_ALL_ACTIVITIES}?type=${activeKey}&page=${page}&limit=${limit}`;

      if (debouncedSearch)
        URL += `&search=${encodeURIComponent(debouncedSearch)}`;

      const response = await getAllActivities(URL);
      if (response.status === 200) {
        const resData = response?.data?.data?.data;
        const paginationData = response?.data?.data?.pagination;

        const mappedActivities: TableRow[] = resData.map(
          (activity: ActivityData, idx: number) => {
            const baseData = {
              _id: activity._id,
              studioId: activity?.studioId?._id,
              slotId: activity?.slotId,
              id: (page - 1) * limit + (idx + 1),
              modelName: activity?.userId?.fullName || "-",
              studio: activity?.studioId?.name || "-",
              activityType: activity.activityType || "0",
              time: formatTimeRange(activity.startTime, activity.endtime),
              date: formatDate(activity.date),
              cancelledBy: activity.cancelledBy,
              comments: activity.comments,
            };

            // Add cancelledVia only for Cancelled Activities tab
            if (isCancelledActivities) {
              return {
                ...baseData,
                cancelledVia: activity.cancelledBy || "-",
              };
            }

            return baseData;
          },
        );

        setActivityList(mappedActivities);
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
    fetchAllActivities(false);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAllActivities(true);
  }, [page, limit, activeTab]);

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/activities/review-activity/${_id}`);
  };

  const handleOtherRouteWithId = (_id: string) => {
    const activity = activityList.find((item) => item._id === _id);

    const id = (activity as any)?.slotId || _id;

    const query = activeTab === "Cancelled Activities" ? `?type=Cancelled` : "";

    router.push(`/admin/activities/${id}${query}`);
  };

  const toggleTooltip = (id: string) => {
    setActiveTooltip(activeTooltip === id ? null : id);
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <div className="w-full flex flex-col justify-center items-start gap-10 max-w-full">
            <div className="w-full flex flex-col justify-start items-end gap-2.5 max-w-full">
              {/* Sort + Search */}
              <div className="flex items-center justify-between gap-4 w-full">
                {/* Tabs */}
                <div className="bg-neutral-900 p-[3px] rounded-[30px] sm:rounded-[40px] md:rounded-[50px] flex flex-nowrap items-center gap-2">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`p-2 sm:p-2.5 rounded-[30px] sm:rounded-[40px] md:rounded-[50px] text-xs sm:text-sm  transition-all duration-200 cursor-pointer whitespace-nowrap ${
                        activeTab === tab
                          ? "bg-rose-500 text-white"
                          : "text-stone-200 hover:bg-neutral-800"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="w-[220px] max-w-full">
                  <CustomInput
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="w-full flex flex-col justify-start items-start max-w-full">
                <div className="w-full overflow-x-auto max-w-full rounded-md outline outline-offset-[-1px] outline-stone-700">
                  {loading ? (
                    <Loader />
                  ) : isCancelledActivities ? (
                    <div className="cancelled-actions-table">
                      <DynamicTable
                        headers={headers}
                        data={activityList}
                        rowIcon={isCancelledActivities ? undefined : eyeimg.src}
                        onclickFunction={
                          isCancelledActivities
                            ? undefined
                            : handleOtherRouteWithId
                        }
                        isEyeShow={!isPastActivities && !isCancelledActivities}
                        renderActions={
                          isPastActivities
                            ? (row) => (
                                <span
                                  onClick={() => handleRouteWithId(row._id)}
                                  className="text-blue-500 font-medium cursor-pointer hover:underline"
                                >
                                  Review
                                </span>
                              )
                            : isCancelledActivities
                              ? (row) => {
                                  // Only show eye icon if cancelled by ADMIN
                                  if ((row as any).cancelledBy === "ADMIN") {
                                    const hasComments =
                                      (row as any).comments &&
                                      (row as any).comments.trim() !== "";

                                    return (
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => toggleTooltip(row._id)}
                                          className="w-8 h-8 flex cursor-pointer justify-center items-center bg-neutral-800 rounded-md hover:bg-neutral-700"
                                        >
                                          <div className="w-4 h-4 relative">
                                            <img
                                              src={eyeimg.src}
                                              alt="view icon"
                                              className="w-full h-full object-contain"
                                            />
                                          </div>
                                        </button>

                                        {/* Tooltip */}
                                        {activeTooltip === row._id &&
                                          hasComments && (
                                            <div className="absolute top-full right-[-9px] mt-2 w-64 p-3 bg-zinc-800 rounded-lg shadow-lg border border-stone-700 z-50">
                                              <div className="text-stone-400 text-sm font-light  italic">
                                                Cancellation Reason:
                                              </div>
                                              <div className="text-stone-400 text-sm font-light  italic">
                                                {(row as any).comments}
                                              </div>

                                              {/* Arrow */}
                                              <div className="absolute bottom-full right-4 -mb-1">
                                                <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-zinc-800"></div>
                                              </div>
                                            </div>
                                          )}

                                        {/* Show "No comments" if tooltip is active but no comments */}
                                        {activeTooltip === row._id &&
                                          !hasComments && (
                                            <div className="absolute top-full right-[-9px] mt-2 w-64 p-3 bg-zinc-800 rounded-lg shadow-lg border border-stone-700 z-50">
                                              <div className="text-stone-400 text-sm font-light  italic">
                                                No cancellation reason provided
                                              </div>
                                              {/* Arrow */}
                                              <div className="absolute bottom-full right-4 -mb-1">
                                                <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-zinc-800"></div>
                                              </div>
                                            </div>
                                          )}
                                      </div>
                                    );
                                  }
                                  return null;
                                }
                              : undefined
                        }
                      />
                    </div>
                  ) : (
                    <DynamicTable
                      headers={headers}
                      data={activityList}
                      rowIcon={isCancelledActivities ? undefined : eyeimg.src}
                      onclickFunction={
                        isCancelledActivities
                          ? undefined
                          : handleOtherRouteWithId
                      }
                      isEyeShow={!isPastActivities && !isCancelledActivities}
                      renderActions={
                        isPastActivities
                          ? (row) => (
                              <span
                                onClick={() => handleRouteWithId(row._id)}
                                className="text-blue-500 font-medium cursor-pointer hover:underline"
                              >
                                Review
                              </span>
                            )
                          : isCancelledActivities
                            ? (row) => {
                                // Only show eye icon if cancelled by ADMIN
                                if ((row as any).cancelledBy === "ADMIN") {
                                  const hasComments =
                                    (row as any).comments &&
                                    (row as any).comments.trim() !== "";

                                  return (
                                    <div className="relative">
                                      <button
                                        type="button"
                                        onClick={() => toggleTooltip(row._id)}
                                        className="w-8 h-8 flex cursor-pointer justify-center items-center bg-neutral-800 rounded-md hover:bg-neutral-700"
                                      >
                                        <div className="w-4 h-4 relative">
                                          <img
                                            src={eyeimg.src}
                                            alt="view icon"
                                            className="w-full h-full object-contain"
                                          />
                                        </div>
                                      </button>

                                      {/* Tooltip */}
                                      {activeTooltip === row._id &&
                                        hasComments && (
                                          <div className="absolute top-full right-[-9px] mt-2 w-64 p-3 bg-zinc-800 rounded-lg shadow-lg border border-stone-700 z-50">
                                            <div className="text-stone-400 text-sm font-light  italic">
                                              Cancellation Reason:
                                            </div>
                                            <div className="text-stone-400 text-sm font-light  italic">
                                              {(row as any).comments}
                                            </div>

                                            {/* Arrow */}
                                            <div className="absolute bottom-full right-4 -mb-1">
                                              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-zinc-800"></div>
                                            </div>
                                          </div>
                                        )}

                                      {/* Show "No comments" if tooltip is active but no comments */}
                                      {activeTooltip === row._id &&
                                        !hasComments && (
                                          <div className="absolute top-full right-[-9px] mt-2 w-64 p-3 bg-zinc-800 rounded-lg shadow-lg border border-stone-700 z-50">
                                            <div className="text-stone-400 text-sm font-light  italic">
                                              No cancellation reason provided
                                            </div>
                                            {/* Arrow */}
                                            <div className="absolute bottom-full right-4 -mb-1">
                                              <div className="w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-zinc-800"></div>
                                            </div>
                                          </div>
                                        )}
                                    </div>
                                  );
                                }
                                return null;
                              }
                            : undefined
                      }
                    />
                  )}
                </div>
                <div className="w-full flex justify-center mt-3">
                  {activityList && activityList.length ? (
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
          </div>
        </>
      )}
    </>
  );
};

export default ActivityManagement;
