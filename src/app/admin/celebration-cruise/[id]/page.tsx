"use client";

import DynamicTable from "@/app/components/DynamicTable";
import Pagination from "@/app/components/Pagination";
import SafeImage from "@/app/components/SafeImage";
import { ConfirmModal } from "@/app/components/ConfirmModal";
import React, { useMemo, useState } from "react";
import {
  Camera,
  Community,
  DiceFive,
  GlassFragile,
  Gift,
  MusicNote,
} from "iconoir-react";
import { ChevronsUpDown, Pencil, Trash2 } from "lucide-react";
import {
  useDeleteCelebrationCruise,
  useGetCelebrationCruiseById,
  useGetCelebrationCruiseTickets,
} from "@/hooks/useAdmin";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import axios from "axios";
import Loader from "../../components/ui/Loader";
import { formatName } from "@/lib/media";

// Same keys as the backend and the app
const includedItemOptions = [
  { key: "WELCOME_DRINK", label: "Welcome Drink", icon: GlassFragile },
  { key: "PROFESSIONAL_PICTURES", label: "Professional Pictures", icon: Camera },
  { key: "LIVE_ENTERTAINMENT", label: "Live Entertainment", icon: MusicNote },
  { key: "EXCLUSIVE_GIVEAWAYS", label: "Exclusive Giveaways", icon: Gift },
  { key: "NETWORKING", label: "Networking", icon: Community },
  { key: "GAMES_ACTIVITIES", label: "Games & Activities", icon: DiceFive },
];

const ticketHeaders = [
  {
    label: "Ticket No.",
    key: "ticketCode",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  { label: "Name", key: "name", icon: <ChevronsUpDown className="w-4 h-4" /> },
  {
    label: "Email",
    key: "email",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Mobile Number",
    key: "mobile",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "No. Of Tickets",
    key: "tickets",
    align: "center" as const,
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Amount Paid",
    key: "amountPaid",
    align: "center" as const,
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
  {
    label: "Purchased On",
    key: "purchasedOn",
    icon: <ChevronsUpDown className="w-4 h-4" />,
  },
];

const statusLabels: Record<string, { label: string; className: string }> = {
  UPCOMING: { label: "Upcoming Event", className: "bg-blue-500 text-white" },
  ACTIVE: { label: "Ongoing", className: "bg-green-500 text-white" },
  CLOSED: { label: "Closed", className: "bg-yellow-500 text-black" },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

// "20:00" -> "8:00 PM"
const formatClock = (value: string) => {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const formatSlotDate = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

const formatMoney = (amount: number, currency?: string) =>
  `${currency?.toUpperCase() ?? ""} ${Number(amount ?? 0).toFixed(2)}`;

const CelebrationCruiseDetails = () => {
  const { id } = useParams();
  const router = useRouter();
  const [ticketPage, setTicketPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { data, isPending } = useGetCelebrationCruiseById(id);
  const { data: tickets, isPending: ticketsPending } =
    useGetCelebrationCruiseTickets({ id, page: ticketPage, limit: 10 });
  const { mutate: deleteCruise, isPending: isDeleting } =
    useDeleteCelebrationCruise();

  const status = statusLabels[data?.status] ?? statusLabels.UPCOMING;
  const includedItems = includedItemOptions.filter((option) =>
    (data?.includedItems ?? []).includes(option.key),
  );
  const heldTickets = (data?.ticketsSold ?? 0) + (data?.pendingTickets ?? 0);

  const ticketRows = useMemo(
    () =>
      tickets?.data?.map((ticket: any) => ({
        _id: ticket._id,
        ticketCode: ticket.ticketCode ?? "-",
        name: formatName(ticket.user?.fullName) || "Deleted user",
        email: ticket.user?.email ?? "-",
        mobile: ticket.user?.phone
          ? `${ticket.user?.countryCode ?? ""} ${ticket.user.phone}`.trim()
          : "-",
        tickets: ticket.quantity,
        amountPaid: formatMoney(ticket.amount, ticket.currency),
        purchasedOn: formatDate(ticket.paidAt ?? ticket.createdAt),
      })) ?? [],
    [tickets],
  );

  const handleDelete = () => {
    deleteCruise(String(id), {
      onSuccess: () => {
        toast.success("Event deleted");
        router.push("/admin/celebration-cruise");
      },
      onError: (error) => {
        setConfirmDelete(false);
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message ?? "Could not delete event");
        }
      },
    });
  };

  if (isPending) return <Loader />;

  if (!data) {
    return (
      <p className="text-sm text-stone-400">This event could not be found.</p>
    );
  }

  return (
    <main className="w-full space-y-3 text-stone-200">
      <section className="grid gap-3 rounded-md border-none bg-white/10 p-2.5 lg:grid-cols-[minmax(300px,1.05fr)_minmax(360px,1.6fr)]">
        <div className="relative min-h-[185px] overflow-hidden rounded-md border border-stone-800 bg-neutral-950">
          <SafeImage
            src={[data.bannerImage, data.image].filter(Boolean)}
            alt={data.title ?? "Celebration Cruise"}
            className="absolute inset-0 h-full w-full object-cover"
            placeholder={
              <div className="absolute inset-0 flex items-center justify-center text-xs text-stone-500">
                No image
              </div>
            }
          />
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-md bg-none px-1 py-4">
          <div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-light ${status.className}`}
                >
                  {status.label}
                </span>
                <h2 className="text-sm font-medium text-stone-100">
                  {data.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-rose-500">
                  {formatMoney(data.price, data.currency)}
                  {data.serviceFee > 0 && (
                    <span className="ml-1 text-xs text-stone-400">
                      + {formatMoney(data.serviceFee, data.currency)} fee
                    </span>
                  )}
                </span>
                {data.status !== "CLOSED" && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/admin/celebration-cruise/create-event?id=${id}`,
                      )
                    }
                    aria-label="Edit event"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-neutral-700 hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (heldTickets > 0) {
                      toast.error(
                        "This event has sold or reserved tickets and cannot be deleted",
                      );
                      return;
                    }
                    setConfirmDelete(true);
                  }}
                  aria-label="Delete event"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-rose-600 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="max-w-3xl text-sm leading-6 font-normal text-stone-200">
              {data.description}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 bg-white/10 px-2 rounded-lg">
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Tickets Sold</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                {data.ticketsSold ?? 0} / {data.totalTickets}
                {data.pendingTickets > 0 && (
                  <span className="text-stone-400">
                    {" "}
                    ({data.pendingTickets} awaiting payment)
                  </span>
                )}
              </dd>
            </div>
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Available</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                {data.availableTickets}
              </dd>
            </div>
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Revenue</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                {formatMoney(data.revenue, data.currency)}
                {data.serviceFeesCollected > 0 && (
                  <span className="text-stone-400">
                    {" "}
                    (incl. {formatMoney(data.serviceFeesCollected, data.currency)} fees)
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-md border border-stone-700 bg-none">
        <div className="border-b border-stone-700 px-3 bg-white/10 py-2">
          <h3 className="text-sm font-medium text-stone-200">
            Schedule &amp; Location
          </h3>
        </div>
        <div className="grid gap-3 p-3 md:grid-cols-[1fr_1fr]">
          <ul className="space-y-2">
            {data.slots?.map((slot: any, index: number) => (
              <li
                key={slot._id ?? index}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-700 px-3 py-2 text-xs"
              >
                <span className="text-stone-400">Day {index + 1}</span>
                <span className="font-medium text-stone-100">
                  {formatSlotDate(slot.date)}
                </span>
                <span className="text-stone-200">
                  {formatClock(slot.startTime)} - {formatClock(slot.endTime)}
                  {slot.endsNextDay && (
                    <span className="text-stone-400"> (+1 day)</span>
                  )}
                </span>
              </li>
            ))}
            <li className="text-[11px] text-stone-500">
              Venue time ({data.timeZone})
            </li>
          </ul>
          <div className="rounded-md border border-stone-700 px-3 py-2 text-xs">
            <p className="text-stone-400">Location</p>
            <p className="mt-1 font-medium text-stone-100">
              {[data.address, data.city, data.country]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-md border border-stone-700 bg-none">
        <div className="border-b border-stone-700 px-3 bg-white/10 py-2">
          <h3 className="text-sm font-medium text-stone-200">
            What&apos;s Included
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 xl:grid-cols-6">
          {!includedItems.length && (
            <p className="col-span-full px-1 py-2 text-xs text-stone-400">
              Nothing selected.
            </p>
          )}
          {includedItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-md border border-stone-700 bg-none px-2 py-3 text-center"
              >
                <Icon className="h-5 w-5 text-rose-500" />
                <span className="text-[11px] leading-tight text-stone-200">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-stone-700 bg-none">
        <div className="border-b border-stone-700 px-3 bg-white/10 py-2">
          <h3 className="text-sm font-medium text-stone-200">
            Terms &amp; Conditions
          </h3>
        </div>
        <p className="whitespace-pre-line px-3 py-3 text-xs leading-5 text-stone-300">
          {data.termsAndConditions || "Not set yet. Edit the event to add them."}
        </p>
      </section>

      <section className="overflow-hidden rounded-md bg-none border border-stone-700">
        <div className="flex w-full items-center justify-between bg-white/10 px-3 py-2 text-left">
          <span className="text-xs font-medium text-stone-200">
            People Who Bought Ticket
          </span>
          <span className="text-xs text-stone-400">
            {tickets?.summary?.purchases ?? 0}{" "}
            {tickets?.summary?.purchases === 1 ? "purchase" : "purchases"}
          </span>
        </div>

        {ticketsPending ? (
          <p className="px-3 py-6 text-center text-xs text-stone-400">
            Loading…
          </p>
        ) : ticketRows.length ? (
          <div className="[&_table]:!outline-none">
            <DynamicTable
              headers={ticketHeaders}
              data={ticketRows}
              isEyeShow={false}
              showActionsHeaderLabel={false}
            />
          </div>
        ) : (
          <p className="px-3 py-6 text-center text-xs text-stone-400">
            No tickets sold yet.
          </p>
        )}

        {(tickets?.pagination?.totalPages ?? 1) > 1 && (
          <div className="px-3">
            <Pagination
              currentPage={ticketPage}
              totalPages={tickets.pagination.totalPages}
              onPageChange={setTicketPage}
            />
          </div>
        )}
      </section>

      <ConfirmModal
        open={confirmDelete}
        title="Delete event?"
        description={`"${data.title}" will be removed permanently.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        loading={isDeleting}
        danger
      />
    </main>
  );
};

export default CelebrationCruiseDetails;
