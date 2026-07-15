"use client";

import { useMemo, useState } from "react";
import { NavArrowDownSolid } from "iconoir-react";
import { CalendarDays, ChevronRight, Clock3, MapPin } from "lucide-react";

type CollabStatus = "Pending" | "Approved" | "Rejected";
type CollabTab = "Requests Received" | "Enquired Collabs";

type CollabRequest = {
  id: number;
  agencyName: string;
  location: string;
  date: string;
  time: string;
  collabType: string;
  primaryAudience: string;
  status: CollabStatus;
  idea: string;
};

const receivedRequests: CollabRequest[] = [
  {
    id: 1,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Pending",
    idea: "Collaborate with a renowned fashion photographer to create a stunning editorial shoot in the heart of Paris. The concept revolves around blending urban street style with high fashion, showcasing vibrant outfits against iconic city backdrops.",
  },
  {
    id: 2,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Pending",
    idea: "Create a polished campaign set around contemporary model casting, clean wardrobe direction, and social-first photo deliverables.",
  },
  {
    id: 3,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Approved",
    idea: "Produce a seasonal fashion collaboration with location-led storytelling and a refined commercial portfolio finish.",
  },
  {
    id: 4,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Rejected",
    idea: "Develop a short-form visual concept for a boutique brand launch with stills, reels, and model-led product moments.",
  },
];

const enquiredCollabs: CollabRequest[] = [
  {
    id: 5,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Pending",
    idea: "Explore a collaboration for a fashion editorial shoot with a strong city backdrop and premium styling direction.",
  },
  {
    id: 6,
    agencyName: "Agency Name",
    location: "Paris, France",
    date: "12 Jun - 14 Jun",
    time: "10:00 AM",
    collabType: "Professional Shoot Collab",
    primaryAudience: "Women 22-45",
    status: "Approved",
    idea: "Plan an agency-led campaign built around lifestyle posing, natural light portraits, and polished social deliverables.",
  },
];

const CollabRequestsContent = () => {
  const [activeTab, setActiveTab] = useState<CollabTab>("Requests Received");
  const [statusFilter, setStatusFilter] = useState<CollabStatus | "All">("All");
  const [statusOpen, setStatusOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CollabRequest | null>(
    null,
  );

  const requests =
    activeTab === "Requests Received" ? receivedRequests : enquiredCollabs;

  const filteredRequests = useMemo(() => {
    if (statusFilter === "All") return requests;
    return requests.filter((request) => request.status === statusFilter);
  }, [requests, statusFilter]);

  const statusClassName = (status: CollabStatus) => {
    switch (status) {
      case "Approved":
        return "bg-emerald-500";
      case "Rejected":
        return "bg-rose-500";
      default:
        return "bg-amber-400";
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 pl-2">
        <div className="flex items-center gap-5 text-xs font-light">
          <button
            type="button"
            onClick={() => setActiveTab("Requests Received")}
            className={`pb-1 transition-colors ${
              activeTab === "Requests Received"
                ? "border-b border-rose-500 text-rose-500"
                : "text-stone-300 hover:text-white"
            }`}
          >
            Requests Received
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("Enquired Collabs")}
            className={`pb-1 transition-colors ${
              activeTab === "Enquired Collabs"
                ? "border-b border-rose-500 text-rose-500"
                : "text-stone-300 hover:text-white"
            }`}
          >
            Enquired Collabs
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setStatusOpen((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-normal text-stone-200"
          >
            {statusFilter === "All" ? "Status" : statusFilter}
            <NavArrowDownSolid
              className={`transition-transform ${statusOpen ? "rotate-180" : ""}`}
            />
          </button>

          {statusOpen && (
            <div className="absolute right-0 top-6 z-20 w-32 overflow-hidden rounded-md border border-stone-700 bg-stone-950 shadow-xl">
              {(["All", "Pending", "Approved", "Rejected"] as const).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => {
                      setStatusFilter(status);
                      setStatusOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-xs transition-colors hover:bg-stone-800 ${
                      statusFilter === status
                        ? "text-rose-500"
                        : "text-stone-200"
                    }`}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
          )}
        </div>
      </div>
      <div className="w-full rounded-md border border-stone-800 bg-black/10 ">
        <div className=" flex flex-col">
          {filteredRequests.map((item) => (
            <div
              key={item.id}
              className="grid w-full grid-cols-1 items-center gap-3 border-b border-stone-800 px-3 py-2 text-left transition-colors last:border-b-0 hover:bg-white/[0.03] md:grid-cols-[minmax(150px,1fr)_minmax(260px,1.35fr)_auto] md:gap-5"
            >
              <div className="min-w-0 px-1 py-1">
                <h3 className="text-sm font-medium leading-4 text-rose-500">
                  {item.agencyName}
                </h3>
                <div className="mt-2 flex flex-col gap-1 text-xs font-normal leading-3 text-stone-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                  <span className="flex min-w-0 items-center gap-1">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </span>
                </div>
                <div className="mt-2 flex flex-col gap-1 text-xs font-normal leading-3 text-stone-400 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3">
                  <span className="flex min-w-0 items-center gap-1 border-r border-stone-600 pr-3">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.date}</span>
                  </span>
                  <span className="flex min-w-0 items-center gap-1">
                    <Clock3 className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.time}</span>
                  </span>
                </div>
              </div>

              <div className="grid min-h-14 grid-cols-1 gap-3 rounded-md bg-stone-800/80 px-4 py-3 sm:grid-cols-2 sm:gap-8">
                <div className="flex items-center justify-between gap-5 px-1 md:justify-start">
                  <div className="min-w-0">
                    <p className="text-[10px] font-normal leading-3 text-stone-400">
                      Collab Type
                    </p>
                    <p className="mt-1 truncate text-xs font-medium leading-4 text-stone-100">
                      {item.collabType}
                    </p>
                  </div>

                  <div className="min-w-20">
                    <p className="text-[10px] font-normal leading-3 text-stone-400">
                      Primary Audience
                    </p>
                    <p className="mt-1 truncate text-xs font-medium leading-4 text-stone-100">
                      {item.primaryAudience}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-5 px-1 md:justify-end">
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-normal leading-none text-white ${statusClassName(item.status)}`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
              <button
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-stone-800"
                type="button"
                aria-label={`Open ${item.agencyName} collab details`}
                onClick={() => setSelectedRequest(item)}
              >
                <ChevronRight className="h-4 w-4 shrink-0 text-stone-200" />
              </button>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-stone-400">
              No collabs found for this status.
            </div>
          )}
        </div>
      </div>

      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-[500px] rounded-xl border border-stone-800 bg-[#130d0f] p-7 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="font-ovo text-base font-normal uppercase tracking-wide text-stone-100">
              Collab Details
            </h2>

            <div className="mt-5">
              <h3 className="text-sm font-medium text-rose-500">
                Name Of The Agency/Person
              </h3>
              <p className="mt-2 flex items-center gap-1 text-xs font-normal text-stone-400">
                <MapPin className="h-3 w-3" />
                {selectedRequest.location}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-normal text-stone-400">
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {selectedRequest.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  {selectedRequest.time}
                </span>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-stone-800/80 px-5 py-4">
              <div>
                <p className="text-[10px] font-normal leading-3 text-stone-400">
                  Collab Type
                </p>
                <p className="mt-2 text-xs font-medium leading-4 text-stone-100">
                  {selectedRequest.collabType}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-[10px] font-normal leading-3 text-stone-400">
                  Primary Audience
                </p>
                <p className="mt-2 text-xs font-medium leading-4 text-stone-100">
                  {selectedRequest.primaryAudience}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-stone-800/80 px-5 py-4">
              <p className="text-[10px] font-normal leading-3 text-stone-400">
                Idea
              </p>
              <p className="mt-2 text-xs font-medium leading-5 text-stone-100">
                {selectedRequest.idea}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CollabRequestsContent;
