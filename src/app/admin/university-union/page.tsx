"use client";

import React, { ReactElement, useEffect, useMemo, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import MessagesPage from "@/app/components/chatUi";
import ApproveCallRequestModal from "@/app/components/ApproveCallRequestModal";
import { Link } from "iconoir-react";

interface TableRow {
  _id: string;
  modelName: string;
  chapter: string;
  module: string;
  task: string;
  agent: string;
  lastCompleted: string;
  progress: string;
}

interface CallRow {
  _id: string;
  modelName: string;
  agent: string;
  date: string;
  link: string;
}

interface TableHeader {
  label: string;
  key: string;
  width?: string;
  icon?: ReactElement;
  align?: "start" | "end" | "center";
  fontWeight?: string;
}

interface TabProps {
  tabs: string[];
  activeTab: string;
  onChange: (tab: string) => void;
  variant?: "pill" | "underline";
}

const callTabs = ["Scheduled Calls", "Call Requests"];

const Tabs = ({ tabs, activeTab, onChange, variant = "pill" }: TabProps) => {
  if (variant === "underline") {
    return (
      <div className="inline-flex h-8 items-end gap-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              type="button"
              onClick={() => onChange(tab)}
              className={`h-full border-b-2 px-0 text-sm font-medium leading-none transition-colors ${
                isActive
                  ? "border-[#EF476F] text-[#EF476F]"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="inline-flex rounded-full bg-[#2A2425] p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`rounded-full px-5 py-2 text-xs transition-all ${
            activeTab === tab
              ? "bg-[#EF476F] text-white"
              : "text-stone-400 hover:text-white"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

const UniversityUnion: React.FC = () => {
  // --- previously-missing state that the JSX below depends on ---
  const [activeTab, setActiveTab] = useState("Tasks");
  const [agent, setAgent] = useState("");
  const [activeCallTab, setActiveCallTab] = useState("Scheduled Calls");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 500);
  const [openModal, setOpenModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedRequest, setSelectedRequest] = useState({
    modelName: "",
    agent: "",
    date: "",
    meetingLink: "",
  });

  const headers: TableHeader[] = [
    {
      label: "Model Name",
      key: "modelName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Chapter",
      key: "chapter",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Module",
      key: "module",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Task",
      key: "task",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Agent",
      key: "agent",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Last Completed",
      key: "lastCompleted",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Progress",
      key: "progress",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const dummyUsers: TableRow[] = [
    {
      _id: "1",
      modelName: "Naomi",
      chapter: "Introduction",
      module: "Model Basics",
      task: "Profile Setup",
      agent: "Sarah",
      lastCompleted: "10 Jul 2026",
      progress: "100%",
    },
    {
      _id: "2",
      modelName: "Emily Smith",
      chapter: "Posing",
      module: "Beginner",
      task: "Standing Poses",
      agent: "Michael",
      lastCompleted: "11 Jul 2026",
      progress: "85%",
    },
    {
      _id: "3",
      modelName: "David Wilson",
      chapter: "Lighting",
      module: "Studio Lights",
      task: "Soft Light",
      agent: "Olivia",
      lastCompleted: "12 Jul 2026",
      progress: "70%",
    },
    {
      _id: "4",
      modelName: "Sophia Brown",
      chapter: "Runway",
      module: "Catwalk",
      task: "Walking Practice",
      agent: "Daniel",
      lastCompleted: "13 Jul 2026",
      progress: "90%",
    },
    {
      _id: "5",
      modelName: "Liam Johnson",
      chapter: "Photography",
      module: "Portraits",
      task: "Headshots",
      agent: "Emma",
      lastCompleted: "14 Jul 2026",
      progress: "60%",
    },
    {
      _id: "6",
      modelName: "Noah Williams",
      chapter: "Expressions",
      module: "Advanced",
      task: "Facial Expressions",
      agent: "Lucas",
      lastCompleted: "15 Jul 2026",
      progress: "45%",
    },
    {
      _id: "7",
      modelName: "Ava Davis",
      chapter: "Fashion",
      module: "Editorial",
      task: "Magazine Shoot",
      agent: "Henry",
      lastCompleted: "16 Jul 2026",
      progress: "100%",
    },
    {
      _id: "8",
      modelName: "James Miller",
      chapter: "Fitness",
      module: "Workout",
      task: "Gym Shoot",
      agent: "Mia",
      lastCompleted: "17 Jul 2026",
      progress: "75%",
    },
    {
      _id: "9",
      modelName: "Charlotte Moore",
      chapter: "Commercial",
      module: "Advertising",
      task: "Product Shoot",
      agent: "Ethan",
      lastCompleted: "18 Jul 2026",
      progress: "55%",
    },
    {
      _id: "10",
      modelName: "Benjamin Taylor",
      chapter: "Final Assessment",
      module: "Certification",
      task: "Complete Exam",
      agent: "Grace",
      lastCompleted: "19 Jul 2026",
      progress: "95%",
    },
  ];

  const callHeaders: TableHeader[] = [
    {
      label: "Name Of Model",
      key: "modelName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Agent",
      key: "agent",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date & Time",
      key: "date",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Call Link",
      key: "link",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];
  const requestHeaders: TableHeader[] = [
    {
      label: "Name Of Model",
      key: "modelName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Agent",
      key: "agent",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date & Time",
      key: "date",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const scheduledCalls: CallRow[] = [
    {
      _id: "1",
      modelName: "Alex Johnson",
      agent: "Alex Johnson",
      date: "2023-10-01 10:00 AM",
      link: "Link",
    },
  ];

  // previously-missing data source for the "Call Requests" sub-tab
  const callRequests: CallRow[] = [
    {
      _id: "2",
      modelName: "Priya Nair",
      agent: "Sarah",
      date: "2026-07-31 02:00 PM",
      link: "Pending",
    },
  ];

  const filteredUsers = useMemo(() => {
    let data = [...dummyUsers];

    if (debouncedSearch) {
      const keyword = debouncedSearch.toLowerCase();
      data = data.filter(
        (user) =>
          user.modelName.toLowerCase().includes(keyword) ||
          user.chapter.toLowerCase().includes(keyword) ||
          user.module.toLowerCase().includes(keyword) ||
          user.task.toLowerCase().includes(keyword) ||
          user.agent.toLowerCase().includes(keyword),
      );
    }

    if (agent) {
      data = data.filter((user) => user.agent === agent);
    }

    return data;
  }, [debouncedSearch, agent]);

  const totalPages = Math.ceil(filteredUsers.length / limit) || 1;

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredUsers.slice(start, start + limit);
  }, [filteredUsers, page, limit]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agent, activeTab, activeCallTab]);

  const renderCell = (row: TableRow, key: string) => {
    if (key === "progress") {
      return <span className="font-medium text-blue-500">{row.progress}</span>;
    }
    return row[key as keyof TableRow];
  };

  // previously-missing render function for the Calls table
  const renderCallCell = (row: CallRow, key: string) => {
    if (key === "link") {
      return (
        <a
          href={row.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#3B82F6] hover:underline"
        >
          <Link className="h-4 w-4" />
          Link
        </a>
      );
    }

    return row[key as keyof CallRow];
  };

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full">
          <div className="flex flex-wrap justify-between gap-3 w-full">
            <Tabs
              tabs={["Tasks", "Calls", "Messages"]}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="flex gap-2">
              <div className="w-52">
                <CustomSelect
                  placeholder="Select Agent"
                  options={[
                    { label: "All", value: "" },
                    { label: "Sarah", value: "Sarah" },
                    { label: "Michael", value: "Michael" },
                  ]}
                  value={agent}
                  onChange={setAgent}
                />
              </div>

              <CustomInput
                placeholder="Search"
                icon={<Search size={16} />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="self-stretch rounded-md ">
          {activeTab === "Tasks" && (
            <>
              <DynamicTable
                headers={headers}
                data={paginatedUsers}
                rowIcon={eyeimg.src}
                onclickFunction={(id: string) =>
                  router.push(`/admin/university-union/${id}`)
                }
                renderCell={renderCell}
                showActionsHeaderLabel={false}
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}

          {activeTab === "Calls" && (
            <>
              <div className="p-2">
                <Tabs
                  tabs={callTabs}
                  activeTab={activeCallTab}
                  onChange={setActiveCallTab}
                  variant="underline"
                />
              </div>

              <DynamicTable
                headers={
                  activeCallTab === "Scheduled Calls"
                    ? callHeaders
                    : requestHeaders
                }
                data={
                  activeCallTab === "Scheduled Calls"
                    ? scheduledCalls
                    : callRequests
                }
                rowIcon={
                  activeCallTab === "Scheduled Calls" ? null : eyeimg.src
                }
                onclickFunction={(id) => {
                  const request = callRequests.find((item) => item._id === id);

                  if (!request) return;

                  setSelectedRequest({
                    modelName: request.modelName,
                    agent: request.agent,
                    date: request.date,
                    meetingLink: "",
                  });

                  setMeetingLink("");
                  setOpenModal(true);
                }}
                renderCell={renderCallCell}
                showActionsHeaderLabel={
                  activeCallTab === "Scheduled Calls" ? false : true
                }
              />

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}

          {activeTab === "Messages" && <MessagesPage />}
        </div>
      </div>
      <ApproveCallRequestModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        data={selectedRequest}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        onReject={() => {
          console.log("Reject");
          setOpenModal(false);
        }}
        onApprove={() => {
          console.log("Meeting Link:", meetingLink);
          console.log("Approve:", selectedRequest);

          setOpenModal(false);
        }}
      />
    </div>
  );
};

export default UniversityUnion;
