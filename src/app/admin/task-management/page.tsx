"use client";
import CustomButton from "@/app/components/CustomButton";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import React, { ReactElement, useEffect, useState } from "react";
import { TableRow } from "../../../types/interface-types";
import { Eye, Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { getAllTasks } from "@/services/admin-services";
import TaskTab from "../user-management/user-child-components/TasksTab";
import { toast } from "sonner";
import Loader from "../components/ui/Loader";
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

interface TaskData {
  _id: string;
  taskType: string;
  answerType: string;
  taskNumber: number;
  milestone: number;
  completedCount: number;
  title: string;
  description: string;
  subject: string;
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

const TaskManagent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [taskList, setTaskList] = useState<TableRow[]>([]);
  const [sort, setSort] = useState("");
  const [search, setSearch] = useState("");

  const [totalPages, setTotalPages] = useState<number>(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 500); // ✅ safe debounce

  const headers: TableHeader[] = [
    {
      label: "Task No.",
      key: "taskNumber",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Task Title",
      key: "title",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Task Type",
      key: "taskType",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Completed By ",
      key: "completedCount",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const fetchAllTasks = async (showLoader = true) => {
    if (showLoader) setLoading(true); // 👈 only show loader when needed
    try {
      let URL = `${ADMIN_URLS.GET_ALL_TASKS}?page=${page}&limit=${limit}`;

      if (sort) URL += `&taskType=${sort}`;

      if (debouncedSearch) {
        const numericSearch = debouncedSearch.replace(/\D/g, ""); // keep only numbers
        if (numericSearch) {
          URL += `&search=${encodeURIComponent(numericSearch)}`;
        }
      }
      const response = await getAllTasks(URL);
      if (response.status === 200) {
        const resData = response?.data?.data?.tasks;
        const paginationData = response?.data?.data?.pagination;

        const mappedtasks: TableRow[] = resData.map((task: TaskData) => ({
          _id: task._id,
          taskType: task.taskType,
          answerType: task.answerType,
          taskNumber: task.taskNumber,
          milestone: task.milestone,
          completedCount: task.completedCount,
          title: task.title,
          description: task.description,
          subject: task.subject,
        }));

        setTaskList(mappedtasks);
        setTotalPages(paginationData.totalPages);
      } else {
        toast.error("Error Fetching Tasks:");
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks(false);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchAllTasks(true);
  }, [sort, page, limit]);

  const handleRouteWithId = (_id: string) => {
    router.push(`/admin/task-management/${_id}`);
  };

  const baseSortOptions = [
    { label: "Job Apply", value: "JOB_APPLY" },
    { label: "Profile Pic", value: "PROFILE_PIC" },
    { label: "Port Image", value: "PORT_IMAGE" },
    { label: "Port Bio", value: "PORT_BIO" },
    { label: "Link", value: "LINK" },
    { label: "Text", value: "TEXT" },
    { label: "Watch Video", value: "WATCH_VIDEO" },
    { label: "Download File", value: "DOWNLOAD_FILE" },
    { label: "Job Selected", value: "JOB_SELECTED" },
    { label: "Check Box", value: "CHECK_BOX" },
    { label: "Upload", value: "UPLOAD" },
    { label: "Quiz", value: "QUIZ" },
    { label: "Set Card", value: "SET_CARD" },
    { label: "Port Intro Video", value: "PORT_INTRO_VIDEO" },
    { label: "Calendly", value: "CALENDLY" },
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
          <div className="w-full inline-flex flex-col justify-center items-start gap-10">
            <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
                <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full max-w-full">
                  <div className="w-full sm:w-auto max-w-full">
                    <CustomSelect
                      options={sortOptions}
                      placeholder="Filter"
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
                      placeholder="Search By Task Number"
                      icon={<Search className="w-4 h-4" />}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      type="number"
                    />
                  </div>
                  <div className="w-full sm:w-auto max-w-full">
                    <CustomButton
                      label="Post A New Task"
                      size="Medium"
                      bgColor="bg-rose-500"
                      textColor="text-white"
                      onClick={() =>
                        router.push("/admin/task-management/post-task")
                      }
                    />
                  </div>
                </div>
              <div className="self-stretch rounded-[10px] flex flex-col justify-start items-start">
                <div className="self-stretch rounded-md outline outline-offset-[-1px] outline-stone-700 flex flex-col justify-start items-start">
                  {" "}
                  <DynamicTable
                    headers={headers}
                    data={taskList}
                    rowIcon={eyeimg.src}
                    onclickFunction={handleRouteWithId}
                  />
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TaskManagent;
