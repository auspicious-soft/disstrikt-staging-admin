"use client";

import DynamicTable from "@/app/components/DynamicTable";
import Image from "next/image";
import React from "react";
import { Camera, Community, DiceFive, Eye, Gift, GlassFragile, MusicNote } from "iconoir-react";
import { ChevronsUpDown } from "lucide-react";

interface TicketHolder {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  tickets: number;
  activeMonths: string;
}

const includedItems = [
  { label: "Welcome Drink", icon: GlassFragile },
  { label: "Professional Pictures", icon: Camera },
  { label: "Live Entertainment", icon: MusicNote },
  { label: "Exclusive Giveaways", icon: Gift },
  { label: "Networking", icon: Community },
  { label: "Games & Activities", icon: DiceFive },
];

const ticketHolders: TicketHolder[] = [
  {
    _id: "1",
    name: "Allen Johnson",
    email: "David.Anderson@example.com",
    mobile: "+331 234 45 078",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "2",
    name: "Maria Smith",
    email: "Alina.Johnson@example.com",
    mobile: "+331 234 65 990",
    tickets: 1,
    activeMonths: "6 Months",
  },
  {
    _id: "3",
    name: "Janel Brown",
    email: "James.Brown@example.com",
    mobile: "+331 123 45 078",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "4",
    name: "Emily Davis",
    email: "Emily.Davis@example.com",
    mobile: "+331 234 67 912",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "5",
    name: "Sarah Taylor",
    email: "Maria.Smith@example.com",
    mobile: "+331 123 44 072",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "6",
    name: "David Anderson",
    email: "David.Anderson@example.com",
    mobile: "+331 234 65 704",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "7",
    name: "Jessica Thomas",
    email: "Sophia.Lee@example.com",
    mobile: "+331 123 45 975",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "8",
    name: "Daniel Martinez",
    email: "Noah.Smith@example.com",
    mobile: "+331 234 43 074",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "9",
    name: "Laura Garcia",
    email: "Laura.Garcia@example.com",
    mobile: "+331 123 45 672",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "10",
    name: "Robert Rodriguez",
    email: "Robert.Rodriguez@example.com",
    mobile: "+331 234 56 978",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "11",
    name: "Sophia Lee",
    email: "Isabella.Martinez@example.com",
    mobile: "+331 123 45 676",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "12",
    name: "William Walker",
    email: "William.Walker@example.com",
    mobile: "+331 234 65 440",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "13",
    name: "Olivia Hall",
    email: "Olivia.Hall@example.com",
    mobile: "+331 234 56 440",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "14",
    name: "James Young",
    email: "James.Young@example.com",
    mobile: "+331 123 45 672",
    tickets: 1,
    activeMonths: "5 Months",
  },
  {
    _id: "15",
    name: "Michael Wilson",
    email: "Michael.Wilson@example.com",
    mobile: "+331 123 45 634",
    tickets: 1,
    activeMonths: "5 Months",
  },
];

const ticketHeaders = [
  { label: "Name", key: "name",icon: <ChevronsUpDown className="w-4 h-4" /> },
  { label: "Email", key: "email",icon: <ChevronsUpDown className="w-4 h-4" /> },
  { label: "Mobile Number", key: "mobile",icon: <ChevronsUpDown className="w-4 h-4" /> },
  { label: "No. Of Tickets", key: "tickets", align: "center" as const ,icon: <ChevronsUpDown className="w-4 h-4" />},
  { label: "Total Active Months", key: "activeMonths",align: "center" as const ,icon: <ChevronsUpDown className="w-4 h-4" /> },
];

const CelebrationCruiseCreateEvent = () => {
  return (
    <main className="w-full space-y-3 text-stone-200">
      <section className="grid gap-3 rounded-md border-none bg-white/10 p-2.5 lg:grid-cols-[minmax(300px,1.05fr)_minmax(360px,1.6fr)]">
        <div className="relative min-h-[185px] overflow-hidden rounded-md border border-stone-800 bg-neutral-950">
          <Image
            src="/assets/curvedMainImg.png"
            alt="Celebration cruise event"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 38vw, 100vw"
          />
        </div>

        <div className="flex flex-col justify-between gap-5 rounded-md bg-none px-1 py-4">
          <div>
            <div className="mb-3 flex items-start justify-between gap-3">
              <span className="rounded-full bg-rose-300 px-3 py-1 text-xs font-light text-black/80">
                Upcoming Event
              </span>
              <span className="text-sm font-medium text-rose-500">€ 150</span>
            </div>
            <p className="max-w-3xl text-sm leading-6 font-normal text-stone-200">
              Join fellow models, experts and creatives for an unforgettable
              Halloween celebration aboard the Celebration Cruise. Enjoy
              networking, music, games, photography moments and surprises
              throughout the evening.
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 bg-white/10 px-2 rounded-lg">
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Scheduled Date</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                24 July, 2026
              </dd>
            </div>
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Time Slot</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                07:00-09:00 PM
              </dd>
            </div>
            <div className="rounded-md p-3">
              <dt className="text-[11px] text-stone-400">Location</dt>
              <dd className="mt-1 text-xs font-medium text-stone-100">
                Paris, France
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="rounded-md border border-stone-700 bg-none">
        <div className="border-b border-stone-700 px-3 bg-white/10 py-2">
          <h3 className="text-sm font-medium text-stone-200">
            What&apos;s Included
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 p-2 sm:grid-cols-3 xl:grid-cols-6">
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

      <section className="overflow-hidden rounded-md bg-none border border-stone-700">
        <button
          type="button"
          className="flex w-full items-center justify-between bg-white/10 px-3 py-2 text-left"
        >
          <span className="text-xs font-medium text-stone-200">
            People Who Bought Ticket
          </span>
        </button>

        <div className="[&_table]:!outline-none">
          <DynamicTable
            headers={ticketHeaders}
            data={ticketHolders}
            isEyeShow={false}
            renderActions={(row) => (
              <button
                type="button"
                aria-label={`View ${row.name}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-stone-300 transition-colors hover:bg-neutral-700 hover:text-white"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
            )}
            showActionsHeaderLabel={false}
          />
        </div>
      </section>
    </main>
  );
};

export default CelebrationCruiseCreateEvent;
