"use client";

import React from "react";
import { CalendarDays, Trash2 } from "lucide-react";

interface AvailabilityRow {
  date: string;
  activitiesBooked: number;
  startTime: string;
  endTime: string;
  interval: string;
}

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-3 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const timeInputClass =
  "h-10 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-xs text-stone-200 outline-none focus:border-rose-400";

const StudioDetails = () => {
  const [selectedDate, setSelectedDate] = React.useState("");
  const [startTime, setStartTime] = React.useState("09:00");
  const [endTime, setEndTime] = React.useState("16:00");
  const [interval, setInterval] = React.useState("");
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());

  const [availabilityRows, setAvailabilityRows] = React.useState<
    AvailabilityRow[]
  >([]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day,
    );
    const formattedDate = date.toISOString().split("T")[0];
    setSelectedDate(formattedDate);
    setShowCalendar(false);
  };

  const handlePrevMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1),
    );
  };

  const addAvailability = () => {
    if (!selectedDate) return;

    const newRow: AvailabilityRow = {
      date: selectedDate,
      activitiesBooked: 0,
      startTime: "09:00",
      endTime: "16:00",
      interval: "",
    };

    setAvailabilityRows((prev) => [...prev, newRow]);
    setSelectedDate("");
  };

  const updateAvailabilityRow = (
    index: number,
    field: keyof AvailabilityRow,
    value: string | number,
  ) => {
    setAvailabilityRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const deleteAvailabilityRow = (index: number) => {
    setAvailabilityRows((prev) => prev.filter((_, i) => i !== index));
  };
  return (
    <main className="w-full text-stone-200">
      <form className="space-y-6">
        <section className="grid gap-3 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-normal text-stone-100">
              Studio Name
            </span>
            <input className={inputClass} placeholder="Name" type="text" />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-normal text-stone-100">
              Location
            </span>
            <input className={inputClass} placeholder="Name" type="text" />
          </label>
        </section>

        <section className="rounded-lg border border-stone-700">
          <div className="bg-white/15 px-4 py-3 rounded-t-lg">
            <h2 className="text-sm font-medium text-stone-100">Availability</h2>
          </div>

          <div className="space-y-4 p-3 overflow-visible">
            <div className="space-y-4 rounded-lg border border-stone-700/50 bg-stone-900/30 p-4">
              <div className="flex gap-3">
                <div className="block flex-1">
                  <span className="mb-1.5 block text-xs font-normal text-stone-100">
                    Select Date
                  </span>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCalendar(!showCalendar)}
                      className={inputClass + " cursor-pointer text-left"}
                    >
                      {selectedDate
                        ? new Date(selectedDate).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Select a date"}
                    </button>
                    <CalendarDays
                      onClick={() => setShowCalendar(!showCalendar)}
                      className="pointer-events-auto absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 cursor-pointer"
                    />

                    {showCalendar && (
                      <div className="absolute top-full left-0 mt-2 z-50 w-80 rounded-lg border border-stone-700 bg-stone-800 p-4 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="rounded px-2 py-1 hover:bg-stone-700"
                          >
                            ←
                          </button>
                          <span className="text-sm font-medium text-stone-100">
                            {calendarMonth.toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </span>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="rounded px-2 py-1 hover:bg-stone-700"
                          >
                            →
                          </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2 mb-3">
                          {[
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ].map((day) => (
                            <div
                              key={day}
                              className="text-center text-xs font-medium text-stone-400"
                            >
                              {day}
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                          {Array.from(
                            {
                              length: getFirstDayOfMonth(calendarMonth),
                            },
                            (_, i) => (
                              <div key={`empty-${i}`} />
                            ),
                          )}
                          {Array.from(
                            { length: getDaysInMonth(calendarMonth) },
                            (_, i) => i + 1,
                          ).map((day) => {
                            const date = new Date(
                              calendarMonth.getFullYear(),
                              calendarMonth.getMonth(),
                              day,
                            );
                            const formattedDate = date
                              .toISOString()
                              .split("T")[0];
                            const isSelected = selectedDate === formattedDate;

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                className={`rounded py-2 text-sm ${
                                  isSelected
                                    ? "bg-rose-500 text-white"
                                    : "text-stone-200 hover:bg-stone-700"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={addAvailability}
                  disabled={!selectedDate}
                  className="mt-6 rounded-md bg-rose-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-400 disabled:bg-stone-600 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>

            {availabilityRows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-stone-700">
                <table className="w-full min-w-[880px] table-fixed border-collapse">
                  <thead>
                    <tr className="h-11 text-left text-xs font-normal text-stone-100">
                      <th className="w-[22%] px-6 text-xs font-normal">Date</th>
                      <th className="w-[22%] px-6 text-xs font-normal">
                        Activities Booked
                      </th>
                      <th className="w-[16%] px-2 text-xs font-normal">
                        Start Time
                      </th>
                      <th className="w-[16%] px-2 text-xs font-normal">
                        End Time
                      </th>
                      <th className="w-[17%] px-2 text-xs font-normal">
                        Interval in hours
                      </th>
                      <th className="w-[7%] px-2 text-xs font-normal text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {availabilityRows.map((row, index) => (
                      <tr key={index} className="h-14 text-xs text-stone-200">
                        <td className="px-6">{row.date}</td>
                        <td className="px-6">{row.activitiesBooked}</td>
                        <td className="px-2">
                          <input
                            type="time"
                            className={timeInputClass}
                            value={row.startTime}
                            onChange={(e) =>
                              updateAvailabilityRow(
                                index,
                                "startTime",
                                e.target.value,
                              )
                            }
                            aria-label={`Start time ${row.date}`}
                          />
                        </td>
                        <td className="px-2">
                          <input
                            type="time"
                            className={timeInputClass}
                            value={row.endTime}
                            onChange={(e) =>
                              updateAvailabilityRow(
                                index,
                                "endTime",
                                e.target.value,
                              )
                            }
                            aria-label={`End time ${row.date}`}
                          />
                        </td>
                        <td className="px-2">
                          <div className="relative">
                            <select
                              className={selectClass}
                              value={row.interval}
                              onChange={(e) =>
                                updateAvailabilityRow(
                                  index,
                                  "interval",
                                  e.target.value,
                                )
                              }
                              aria-label={`Interval ${row.date}`}
                            >
                              <option value="" disabled>
                                Select
                              </option>
                              <option value="1">1 hour</option>
                              <option value="2">2 hours</option>
                              <option value="3">3 hours</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-2 text-center">
                          <button
                            type="button"
                            onClick={() => deleteAvailabilityRow(index)}
                            aria-label={`Remove availability ${row.date}`}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-rose-500 text-white transition-colors hover:bg-rose-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-[minmax(160px,315px)_1fr]">
          <button
            type="button"
            className="h-12 rounded-md border border-stone-200/70 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-12 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400"
          >
            Save
          </button>
        </div>
      </form>
    </main>
  );
};

export default StudioDetails;
