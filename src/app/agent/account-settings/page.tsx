"use client";

import React, { useState } from "react";
import { X, Pencil, ChevronDown, Clock } from "lucide-react";
import { Check, LightBulbOn } from "iconoir-react";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const defaultActiveDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const fields = [
  { id: "name", label: "Name", type: "text", placeholder: "Name" },
  {
    id: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Email Address",
  },
  {
    id: "newPassword",
    label: "New Password",
    type: "password",
    placeholder: "********",
  },
  {
    id: "confirmPassword",
    label: "Confirm Password",
    type: "password",
    placeholder: "********",
  },
];

const timeOptions = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
];

const AccountSettings = () => {
  const [profileImage, setProfileImage] = useState("/assets/LoginImg.jpg");
  const [openAvailabilityModal, setOpenAvailabilityModal] = useState(false);

  // Saved / confirmed availability (reflected on the main card)
  const [savedDays, setSavedDays] = useState<string[]>(defaultActiveDays);
  const [savedStart, setSavedStart] = useState("10:00 AM");
  const [savedEnd, setSavedEnd] = useState("05:00 PM");

  // Draft state used inside the modal until "Confirm" is pressed
  const [draftDays, setDraftDays] = useState<string[]>(defaultActiveDays);
  const [draftStart, setDraftStart] = useState("10:00 AM");
  const [draftEnd, setDraftEnd] = useState("05:00 PM");
  const [applySameHours, setApplySameHours] = useState(true);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const openModal = () => {
    // seed the draft with whatever was last saved
    setDraftDays(savedDays);
    setDraftStart(savedStart);
    setDraftEnd(savedEnd);
    setOpenAvailabilityModal(true);
  };

  const toggleDraftDay = (day: string) => {
    setDraftDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleConfirmAvailability = () => {
    setSavedDays(draftDays);
    setSavedStart(draftStart);
    setSavedEnd(draftEnd);
    setOpenAvailabilityModal(false);
  };

  const totalWeeklyHours = (() => {
    const parseHour = (t: string) => {
      const [time, meridiem] = t.split(" ");
      let [h] = time.split(":").map(Number);
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
      return h;
    };
    const hoursPerDay = Math.max(
      parseHour(draftEnd) - parseHour(draftStart),
      0,
    );
    return hoursPerDay * draftDays.length;
  })();

  return (
    <main className="w-full">
      <section className="flex w-full flex-col items-start gap-4">
        <div className="flex w-[300px] max-w-full flex-col gap-3">
          <img
            src={profileImage}
            alt="Profile"
            className="aspect-[4/4.75] w-full rounded-lg border border-black/70 object-cover grayscale"
          />

          <label className="flex h-8 w-full cursor-pointer items-center justify-center rounded-full border border-neutral-600 bg-transparent px-4 text-xs font-normal text-stone-200 transition-colors hover:border-rose-400 hover:text-white">
            Upload / Change Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        <form className="grid w-full grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
          {fields.map((field) => (
            <div key={field.id} className="flex flex-col gap-1.5">
              <label
                htmlFor={field.id}
                className="text-xs font-light text-stone-200"
              >
                {field.label}
              </label>
              <input
                id={field.id}
                name={field.id}
                type={field.type}
                placeholder={field.placeholder}
                className="h-11 w-full rounded-md border border-neutral-700 bg-transparent px-3 text-xs text-stone-100 outline-none transition-colors placeholder:text-neutral-500 focus:border-rose-400"
              />
            </div>
          ))}

          <div className="rounded-xl border border-[#2C2C2C] bg-[#171314] md:col-span-2">
            <div className="rounded-t-xl flex items-start justify-between bg-white/10 p-2">
              <h3 className="text-sm font-medium text-white">Availability</h3>

              <button
                type="button"
                onClick={openModal}
                aria-label="Edit availability"
                className="flex h-7 w-7 items-center justify-center rounded-md border border-[#3a3a3a] text-neutral-300 transition-colors hover:border-[#EF476F] hover:text-[#EF476F]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-[11px] uppercase tracking-wide text-white">
                  Active Working Days
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {days.map((day) => {
                    const active = savedDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`rounded-md min-w-15 text-center px-3 py-1.5 text-sm font-medium ${
                          active
                            ? "bg-[#EF476F] text-white"
                            : "bg-white text-[#A93E58]"
                        }`}
                      >
                        {day}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wide text-white">
                  Time
                </p>
                <p className="mt-2 text-sm font-medium text-white">
                  {savedStart} - {savedEnd}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-11 w-full rounded-md bg-[#ff3f75] px-4 text-sm font-medium text-white transition-colors hover:bg-[#e83267] md:col-span-2"
          >
            Confirm
          </button>
        </form>
      </section>

      {openAvailabilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-[420px] max-w-full rounded-2xl border border-[#2D2D2D] bg-[#171314] p-6">
            <div className="mb-1 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-ovo font-normal uppercase tracking-[0.15em] text-white">
                  Set Your Availability
                </h2>
                <p className="mt-1 text-[11px] text-neutral-500">
                  Select your active working days and configure your daily
                  business hours.
                </p>
              </div>

              <button
                onClick={() => setOpenAvailabilityModal(false)}
                aria-label="Close"
                className="text-neutral-400 transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5">
              <p className="text-xs text-neutral-400">Active Working Days</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {days.map((day) => {
                  const active = draftDays.includes(day);
                  return (
                    <button
                      type="button"
                      key={day}
                      onClick={() => toggleDraftDay(day)}
                      className={`rounded-md px-3.5 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-[#EF476F] text-white"
                          : "bg-white text-[#A93E58] hover:bg-[#EF476F]/20 hover:text-white"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs text-neutral-400">
                  Start Time
                </label>
                <div className="relative">
                  <select
                    value={draftStart}
                    onChange={(e) => setDraftStart(e.target.value)}
                    className="h-11 w-full appearance-none rounded-md border border-[#333] bg-[#1f1c1c] pl-3 pr-16 text-xs text-white outline-none focus:border-rose-400"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Clock className="pointer-events-none absolute right-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-neutral-400">
                  End Time
                </label>
                <div className="relative">
                  <select
                    value={draftEnd}
                    onChange={(e) => setDraftEnd(e.target.value)}
                    className="h-11 w-full appearance-none rounded-md border border-[#333] bg-[#1f1c1c] pl-3 pr-16 text-xs text-white outline-none focus:border-rose-400"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <Clock className="pointer-events-none absolute right-8 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between px-3.5 py-3">
              <div>
                <p className="text-xs font-medium text-white">
                  Apply Same Hours To All Days
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">
                  Automatically copy these times to all selected days
                </p>
              </div>

              <button
                type="button"
                onClick={() => setApplySameHours((prev) => !prev)}
                className={`flex h-6 w-6 items-center justify-center rounded-md border ${
                  applySameHours
                    ? "border-[#EF476F] bg-[#2A1A20]"
                    : "border-[#5A5A5A]"
                }`}
              >
                {applySameHours && (
                  <Check
                    className="h-3.5 w-3.5 text-[#EF476F]"
                    strokeWidth={3}
                  />
                )}
              </button>
            </div>

            <div className="mt-4 rounded-lg flex items-center gap-2 border border-[#EF476F]/30 bg-pink-50 px-3.5 py-2.5">
              <LightBulbOn className="h-4 w-4 text-[#EF476F]" fill="yellow" />
              <p className="text-[11px] leading-relaxed text-[#A93E58]">
                Your schedule will be set to {totalWeeklyHours} hours per week
                across {draftDays.length} active working{" "}
                {draftDays.length === 1 ? "day" : "days"}.
              </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-3 mt-6 justify-end">
              <button
                onClick={() => setOpenAvailabilityModal(false)}
                className="rounded-lg border col-span-1 border-[#444] px-5 py-2 text-sm text-white transition-colors hover:border-neutral-300"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmAvailability}
                className="rounded-lg bg-[#EF476F] col-span-2 px-5 py-2 text-sm text-white transition-colors hover:bg-[#e13a63]"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default AccountSettings;
