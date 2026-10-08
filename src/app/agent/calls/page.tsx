"use client";

import React, { ReactElement, useEffect, useState } from "react";
import CustomInput from "@/app/components/CustomInput";
import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import Loader from "@/app/admin/components/ui/Loader";
import { Search, ChevronsUpDown } from "lucide-react";
import eyeimg from "../../../assets/icons/Eye.png";
import { useDebouncedValue } from "@/hooks/useDebounce";
import ApproveCallRequestModal from "@/app/components/ApproveCallRequestModal";
import { Link } from "iconoir-react";
import { toast } from "sonner";
import { getSession } from "@/lib/auth";
import { formatName } from "@/lib/media";
import {
  AgentCall,
  AgentCallTab,
  apiErrorMessage,
  useAgentCalls,
  useRespondToCall,
} from "@/hooks/useAgentAccount";

interface CallRow {
  _id: string;
  modelName: string;
  // "YYYY-MM-DD HH:mm" so the column sorts by time
  sortDate: string;
  date: string;
  link: string | null;
  note: string;
  call: AgentCall;
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
}

const TABS: Record<string, AgentCallTab> = {
  "Upcoming Calls": "upcoming",
  Requests: "requests",
  Past: "past",
};

const STATUS_LABEL: Record<AgentCall["status"], { label: string; className: string }> = {
  REQUESTED: { label: "Expired", className: "bg-[#6B6B6B]" },
  APPROVED: { label: "Completed", className: "bg-[#3DA755]" },
  REJECTED: { label: "Rejected", className: "bg-[#E0414F]" },
  CANCELLED: { label: "Cancelled", className: "bg-[#6B6B6B]" },
};

const Tabs = ({ tabs, activeTab, onChange }: TabProps) => (
  <div className="inline-flex rounded-full bg-[#2A2425] p-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        type="button"
        onClick={() => onChange(tab)}
        className={`rounded-full px-5 py-2 text-xs transition-all ${
          activeTab === tab ? "bg-[#EF476F] text-white" : "text-stone-400 hover:text-white"
        }`}
      >
        {tab}
      </button>
    ))}
  </div>
);

// "2026-10-09" + "10:00 - 10:30" -> "Fri, 9 Oct 2026 · 10:00 - 10:30"
const formatCallDate = (call: AgentCall) => {
  const [y, m, d] = call.date.split("-").map(Number);
  const day = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  return `${day} · ${call.time}`;
};

const AgentCalls: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Upcoming Calls");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const debouncedSearch = useDebouncedValue(search, 500);
  const [selected, setSelected] = useState<AgentCall | null>(null);
  const [meetingLink, setMeetingLink] = useState("");
  const [modalError, setModalError] = useState("");
  const [agentName, setAgentName] = useState("");

  const tab = TABS[activeTab];
  const { data, isLoading, isFetching } = useAgentCalls({
    tab,
    search: debouncedSearch,
    page,
    limit,
  });
  const respond = useRespondToCall();

  useEffect(() => {
    setAgentName(formatName(getSession().admin?.fullName));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, activeTab]);

  const rows: CallRow[] = (data?.calls ?? []).map((call) => ({
    _id: call._id,
    modelName: formatName(call.model?.fullName) || "Deleted user",
    sortDate: `${call.date} ${call.time}`,
    date: formatCallDate(call),
    link: call.meetingLink,
    note: call.note || "-",
    call,
  }));

  const headers: TableHeader[] = [
    { label: "Name Of Model", key: "modelName", icon: <ChevronsUpDown className="w-4 h-4" /> },
    { label: "Date & Time", key: "sortDate", icon: <ChevronsUpDown className="w-4 h-4" /> },
    tab === "upcoming"
      ? { label: "Call Link", key: "link" }
      : tab === "requests"
        ? { label: "Note", key: "note" }
        : { label: "Status", key: "status" },
  ];

  const renderCallCell = (row: CallRow, key: string) => {
    if (key === "sortDate") return row.date;
    if (key === "link") {
      return row.link ? (
        <a
          href={row.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#3B82F6] hover:underline"
        >
          <Link className="h-4 w-4" />
          Link
        </a>
      ) : (
        "-"
      );
    }
    if (key === "note") {
      return <span className="line-clamp-2 break-words">{row.note}</span>;
    }
    if (key === "status") {
      // An approved call in "Past" has ended; an open request there has expired
      const status = STATUS_LABEL[row.call.status];
      return (
        <span
          className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[10px] leading-none text-white ${status.className}`}
        >
          {status.label}
        </span>
      );
    }
    return row[key as keyof CallRow] as React.ReactNode;
  };

  const openRequest = (id: string) => {
    const call = data?.calls.find((item) => item._id === id);
    if (!call) return;
    setSelected(call);
    setMeetingLink("");
    setModalError("");
  };

  const closeModal = () => {
    if (respond.isPending) return;
    setSelected(null);
  };

  const handleApprove = () => {
    if (!selected) return;
    const link = meetingLink.trim();
    if (!/^https?:\/\/\S+\.\S+/i.test(link)) {
      setModalError("Paste a valid meeting link (starting with https://)");
      return;
    }
    respond.mutate(
      { id: selected._id, type: "approve", meetingLink: link },
      {
        onSuccess: () => {
          toast.success("Call approved");
          setSelected(null);
        },
        onError: (error) => setModalError(apiErrorMessage(error, "Couldn't approve the call")),
      },
    );
  };

  const handleReject = () => {
    if (!selected) return;
    respond.mutate(
      { id: selected._id, type: "reject" },
      {
        onSuccess: () => {
          toast.success("Call request rejected");
          setSelected(null);
        },
        onError: (error) => setModalError(apiErrorMessage(error, "Couldn't reject the call")),
      },
    );
  };

  const emptyText =
    tab === "requests"
      ? "No call requests waiting for you."
      : tab === "upcoming"
        ? "No upcoming calls."
        : "No past calls.";

  return (
    <div className="w-full inline-flex flex-col justify-center items-start gap-10">
      <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
        <div className="flex flex-wrap justify-between gap-3 w-full">
          <Tabs tabs={Object.keys(TABS)} activeTab={activeTab} onChange={setActiveTab} />

          <CustomInput
            placeholder="Search model"
            icon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="self-stretch rounded-md">
          {isLoading ? (
            <Loader />
          ) : (
            <div className={isFetching ? "opacity-70 transition-opacity" : ""}>
              {rows.length ? (
                <DynamicTable
                  headers={headers}
                  data={rows}
                  rowIcon={tab === "requests" ? eyeimg.src : undefined}
                  isEyeShow={tab === "requests"}
                  renderCell={renderCallCell}
                  showActionsHeaderLabel={tab === "requests"}
                  onclickFunction={openRequest}
                />
              ) : (
                <p className="py-16 text-center text-sm text-stone-400">{emptyText}</p>
              )}

              {(data?.pagination.totalPages ?? 1) > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={data?.pagination.totalPages ?? 1}
                  onPageChange={setPage}
                />
              )}
            </div>
          )}
          {data?.timeZone && rows.length > 0 && (
            <p className="mt-2 text-[11px] text-neutral-500">
              Times are in {data.timeZone.replace(/_/g, " ")}.
            </p>
          )}
        </div>
      </div>

      <ApproveCallRequestModal
        open={Boolean(selected)}
        onClose={closeModal}
        data={{
          modelName: formatName(selected?.model?.fullName) || "-",
          agent: agentName || "-",
          date: selected ? formatCallDate(selected) : "",
          meetingLink: "",
        }}
        note={selected?.note}
        meetingLink={meetingLink}
        setMeetingLink={(value) => {
          setMeetingLink(value);
          setModalError("");
        }}
        pending={respond.isPending ? (respond.variables?.type ?? null) : null}
        error={modalError}
        onReject={handleReject}
        onApprove={handleApprove}
      />
    </div>
  );
};

export default AgentCalls;
