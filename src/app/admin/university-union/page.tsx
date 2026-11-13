"use client";

import React, { ReactElement, useEffect, useState } from "react";
import { usePersistedTab } from "@/hooks/usePersistedTab";
import CustomInput from "@/app/components/CustomInput";
import CustomSelect from "@/app/components/CustomSelect";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useRouter } from "next/navigation";
import { useDebouncedValue } from "@/hooks/useDebounce";
import UnionMessages from "./UnionMessages";
import ApproveCallRequestModal from "@/app/components/ApproveCallRequestModal";
import { Link } from "iconoir-react";
import { useGetModelMansionAgents } from "@/hooks/useModelMansion";
import { apiErrorMessage } from "@/hooks/useAgentAccount";
import {
  UnionCallRow,
  UnionChatType,
  UnionModelRow,
  useRespondUnionCall,
  useUnionCalls,
  useUnionModels,
} from "@/hooks/useUniversityUnion";
import { formatDate } from "../model-mansion/[id]/format";

type TaskRow = UnionModelRow & {
  modelName: string;
  chapter: string;
  module: string;
  task: string;
  agentName: string;
  lastCompleted: string;
  progress: string;
};

type CallRow = UnionCallRow & {
  modelName: string;
  agentName: string;
  dateTime: string;
};

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

const MAIN_TABS = ["Tasks", "Calls", "Messages"];
const callTabs = ["Scheduled Calls", "Call Requests"];
const messageTabs = ["All", "Individual", "Groups"];
const messageTypeOf: Record<string, UnionChatType> = {
  All: "all",
  Individual: "model",
  Groups: "group",
};

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
  const [activeTab, setActiveTab] = usePersistedTab("tab", "Tasks", MAIN_TABS);
  const [agent, setAgent] = useState("");
  const [activeCallTab, setActiveCallTab] = usePersistedTab("callTab", "Scheduled Calls", callTabs);
  const [activeMessageTab, setActiveMessageTab] = usePersistedTab("messageTab", "All", messageTabs);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [onlyReview, setOnlyReview] = useState(false);
  const router = useRouter();
  const debouncedSearch = useDebouncedValue(search, 500);
  const [openModal, setOpenModal] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [selectedCall, setSelectedCall] = useState<CallRow | null>(null);
  const [callError, setCallError] = useState("");
  const [callPending, setCallPending] = useState<"approve" | "reject" | null>(null);

  const { data: agents } = useGetModelMansionAgents();
  const respondCall = useRespondUnionCall();
  const modelsQuery = useUnionModels({
    page,
    limit,
    search: debouncedSearch,
    agent,
    review: onlyReview,
  });
  const callsQuery = useUnionCalls({
    tab: activeCallTab === "Scheduled Calls" ? "upcoming" : "requests",
    page,
    limit,
    search: debouncedSearch,
    agent,
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
      key: "agentName",
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

  const callHeaders: TableHeader[] = [
    {
      label: "Name Of Model",
      key: "modelName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Agent",
      key: "agentName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date & Time",
      key: "dateTime",
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
      key: "agentName",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
    {
      label: "Date & Time",
      key: "dateTime",
      icon: <ChevronsUpDown className="w-4 h-4" />,
    },
  ];

  const taskRows: TaskRow[] = (modelsQuery.data?.models ?? []).map((model) => ({
    ...model,
    modelName: model.fullName,
    task: model.currentKey ? `${model.currentKey} ${model.currentTitle}` : "All completed",
    agentName: model.agent || "Unassigned",
    lastCompleted: formatDate(model.lastCompletedAt) || "-",
    progress: `${model.percentage}%`,
  }));

  const callRows: CallRow[] = (callsQuery.data?.calls ?? []).map((call) => ({
    ...call,
    modelName: call.model?.fullName || "-",
    agentName: call.agent?.fullName || "-",
    dateTime: `${call.date} ${call.time}`,
  }));

  const totalPages =
    (activeTab === "Calls"
      ? callsQuery.data?.pagination?.totalPages
      : modelsQuery.data?.pagination?.totalPages) || 1;

  const answerCall = (type: "approve" | "reject") => {
    if (!selectedCall) return;
    setCallError("");
    setCallPending(type);
    respondCall.mutate(
      { id: selectedCall._id, type, meetingLink },
      {
        onSuccess: () => setOpenModal(false),
        onError: (err) => setCallError(apiErrorMessage(err)),
        onSettled: () => setCallPending(null),
      },
    );
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, agent, activeTab, activeCallTab, onlyReview]);

  const renderCell = (row: TaskRow, key: string) => {
    if (key === "progress") {
      return <span className="font-medium text-blue-500">{row.progress}</span>;
    }
    if (key === "task" && row.pendingKey) {
      return (
        <span>
          {row.task}{" "}
          <span className="ml-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] text-amber-400">
            Review
          </span>
        </span>
      );
    }
    return row[key as keyof TaskRow] as React.ReactNode;
  };

  const renderCallCell = (row: CallRow, key: string) => {
    if (key === "link") {
      return (
        <a
          href={row.meetingLink || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#3B82F6] hover:underline"
        >
          <Link className="h-4 w-4" />
          Link
        </a>
      );
    }

    return row[key as keyof CallRow] as React.ReactNode;
  };

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-col sm:flex-row justify-end items-end gap-2.5 w-full">
          <div className="flex flex-wrap justify-between gap-3 w-full">
            <Tabs
              tabs={MAIN_TABS}
              activeTab={activeTab}
              onChange={setActiveTab}
            />

            <div className="flex gap-2">
              <div className="w-52">
                <CustomSelect
                  placeholder="Select Agent"
                  options={[
                    { label: "All", value: "" },
                    { label: "Unassigned", value: "unassigned" },
                    ...(agents ?? []).map((item: any) => ({
                      label: item.fullName,
                      value: item._id,
                    })),
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
              <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-xs text-stone-300">
                <input
                  type="checkbox"
                  checked={onlyReview}
                  onChange={(event) => setOnlyReview(event.target.checked)}
                  className="accent-[#EF476F]"
                />
                Only models waiting for a review
              </label>
              <DynamicTable
                headers={headers}
                data={taskRows}
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
                data={callRows}
                rowIcon={
                  activeCallTab === "Scheduled Calls" ? null : eyeimg.src
                }
                onclickFunction={(id) => {
                  const call = callRows.find((item) => item._id === id);

                  if (!call) return;

                  setSelectedCall(call);
                  setMeetingLink("");
                  setCallError("");
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

          {activeTab === "Messages" && (
            <>
              <div className="p-2">
                <Tabs
                  tabs={messageTabs}
                  activeTab={activeMessageTab}
                  onChange={setActiveMessageTab}
                  variant="underline"
                />
              </div>
              <UnionMessages
                search={debouncedSearch}
                agent={agent}
                type={messageTypeOf[activeMessageTab] ?? "all"}
              />
            </>
          )}
        </div>
      </div>
      <ApproveCallRequestModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        data={{
          modelName: selectedCall?.modelName || "",
          agent: selectedCall?.agentName || "",
          date: selectedCall?.dateTime || "",
          meetingLink: "",
        }}
        meetingLink={meetingLink}
        setMeetingLink={setMeetingLink}
        pending={callPending}
        error={callError}
        note={selectedCall?.note}
        onReject={() => answerCall("reject")}
        onApprove={() => answerCall("approve")}
      />
    </div>
  );
};

export default UniversityUnion;
