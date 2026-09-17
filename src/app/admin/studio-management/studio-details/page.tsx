"use client";

import React from "react";
import { CalendarDays, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreateStudio } from "@/hooks/useAdmin";
import LocationPickerModal from "@/app/components/LocationPickerModal";

interface AvailabilityRow {
  date: string;
  activitiesBooked: number;
  startTime: string;
  endTime: string;
  interval: string;
}

interface AddOnFeatureRow {
  feature: string;
  usd: string;
  eur: string;
  gbp: string;
}

const inputClass =
  "h-12 w-full rounded-md border border-stone-700 bg-transparent px-3 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const timeInputClass =
  "h-10 w-full rounded-md border border-stone-700 bg-transparent px-3 text-xs text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400";

const selectClass =
  "h-10 w-full appearance-none rounded-md border border-stone-700 bg-transparent px-3 pr-9 text-xs text-stone-200 outline-none focus:border-rose-400";

const DeleteButton = ({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label="Delete row"
    className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded text-white transition-colors ${
      disabled
        ? "bg-stone-600 cursor-not-allowed"
        : "bg-rose-500 hover:bg-rose-400"
    }`}
  >
    <Trash2 className="h-3.5 w-3.5" />
  </button>
);

const StudioDetails = () => {
  const router = useRouter();
  const [studioName, setStudioName] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [country, setCountry] = React.useState("");
  const [city, setCity] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState("");
  const [isLocationPickerOpen, setIsLocationPickerOpen] = React.useState(false);
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [calendarMonth, setCalendarMonth] = React.useState(new Date());
  const [availabilityRows, setAvailabilityRows] = React.useState<
    AvailabilityRow[]
  >([]);

  // Add-on features: feature name plus 3 currency prices (usd/eur/gbp)
  const [addOnRows, setAddOnRows] = React.useState<AddOnFeatureRow[]>([
    {
      feature: "",
      usd: "",
      eur: "",
      gbp: "",
    },
  ]);

  const {
    mutate: createStudio,
    isPending: isCreating,
  } = useCreateStudio();

  const formatLocalDateInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const parseLocalDate = (dateString: string) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
  };
  const getFirstDayOfMonth = (date: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      1
    ).getDay();
  };
  const isDateBeforeToday = (date: Date) => {
    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    return date < todayStart;
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(
      calendarMonth.getFullYear(),
      calendarMonth.getMonth(),
      day
    );

    if (isDateBeforeToday(date)) {
      toast.error("Please select a date from today onwards");
      return;
    }

    const formattedDate = formatLocalDateInput(date);

    setSelectedDate(formattedDate);
    setShowCalendar(false);
  };
  const handlePrevMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() - 1
      )
    );
  };
  const handleNextMonth = () => {
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + 1
      )
    );
  };
  const timeValues = Array.from({ length: 24 }, (_, hour) => {
    return [
      `${String(hour).padStart(2, "0")}:00`,
      `${String(hour).padStart(2, "0")}:30`,
    ];
  }).flat();
  const startTimeOptions = [...timeValues];
  const endTimeOptions = [...timeValues, "24:00"];

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const getAllowedStartTimes = (selectedDate: string, interval = "") => {
    if (!interval) return [];

    const today = new Date();
    const todayString = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString().split("T")[0];

    if (selectedDate !== todayString) {
      return startTimeOptions;
    }

    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    return startTimeOptions.filter(
      (time) => timeToMinutes(time) > nowMinutes
    );
  };

  const getAllowedEndTimes = (
    startTime: string,
    selectedDate: string,
    interval = ""
  ) => {
    if (!startTime || !interval) return [];

    const today = new Date();
    const todayString = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString().split("T")[0];
    const startMinutes = timeToMinutes(startTime);
    const nowMinutes = today.getHours() * 60 + today.getMinutes();

    const intervalMinutes = Number(interval);
    if (startTime && intervalMinutes > 0) {
      return endTimeOptions.filter((time) => {
        const endMinutes = timeToMinutes(time);
        const elapsedMinutes = endMinutes - startMinutes;

        if (elapsedMinutes < intervalMinutes) return false;
        if (elapsedMinutes % intervalMinutes !== 0) return false;
        if (selectedDate === todayString && endMinutes <= nowMinutes) {
          return false;
        }

        return true;
      });
    }

    return endTimeOptions.filter((time) => {
      const endMinutes = timeToMinutes(time);
      if (endMinutes <= startMinutes) return false;
      if (selectedDate === todayString && endMinutes <= nowMinutes) {
        return false;
      }
      return true;
    });
  };

  const normalizeCountryValue = (
    countryCode?: string,
    countryName?: string
  ) => {
    const normalizedCode = countryCode?.toUpperCase() || "";
    const normalizedName = countryName?.toLowerCase() || "";

    if (
      ["FR", "FRA", "FRANCE"].includes(normalizedCode) ||
      normalizedName.includes("france")
    ) {
      return "France";
    }
    if (
      ["GB", "UK", "GBR", "UNITED KINGDOM"].includes(normalizedCode) ||
      normalizedName.includes("united kingdom")
    ) {
      return "United Kingdom";
    }
    if (
      ["ES", "ESP", "SPAIN"].includes(normalizedCode) ||
      normalizedName.includes("spain")
    ) {
      return "Spain";
    }
    if (
      ["NL", "NLD", "NETHERLANDS", "THE NETHERLANDS"].includes(
        normalizedCode
      ) || normalizedName.includes("netherlands")
    ) {
      return "Netherlands";
    }
    if (
      ["BE", "BEL", "BELGIUM"].includes(normalizedCode) ||
      normalizedName.includes("belgium")
    ) {
      return "Belgium";
    }

    return "";
  };

  const applyGeocodedLocation = (
    nextAddress: string,
    position?: { lat: number; lng: number }
  ) => {
    if (typeof window === "undefined" || !window.google?.maps?.Geocoder) {
      toast.error("Google Maps is not available yet. Please try again shortly.");
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    const request = position ? { location: position } : { address: nextAddress };

    geocoder.geocode(request, (results, status) => {
      if (status !== window.google.maps.GeocoderStatus.OK || !results?.[0]) {
        toast.error(
          "We could not find that address. Please enter it manually or pick a location on the map."
        );
        return;
      }

      const addressComponents = results[0].address_components || [];
      const countryComponent = addressComponents.find((component) =>
        component.types.includes("country")
      );
      const localityComponent = addressComponents.find((component) =>
        component.types.includes("locality")
      );
      const adminAreaComponent = addressComponents.find((component) =>
        component.types.includes("administrative_area_level_1")
      );
      const resolvedCity = localityComponent?.long_name || adminAreaComponent?.long_name || "";
      const resolvedCountry = normalizeCountryValue(
        countryComponent?.short_name,
        countryComponent?.long_name
      );

      setLocation(results[0].formatted_address || nextAddress);
      setCountry(resolvedCountry || "");
      setCity(resolvedCity || "");
    });
  };

  const handleLocationSelect = (
    address: string,
    position: { lat: number; lng: number }
  ) => {
    applyGeocodedLocation(address, position);
    setIsLocationPickerOpen(false);
  };

  const addAvailability = () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    const alreadyExists = availabilityRows.some(
      (row) => row.date === selectedDate
    );
    if (alreadyExists) {
      toast.error("This date is already selected");
      return;
    }

    const newRow: AvailabilityRow = {
      date: selectedDate,
      activitiesBooked: 0,
      startTime: "",
      endTime: "",
      interval: "",
    };

    setAvailabilityRows((prev) => [
      ...prev,
      newRow,
    ]);

    setSelectedDate("");
  };
  const updateAvailabilityRow = (
    index: number,
    field: keyof AvailabilityRow,
    value: string | number
  ) => {
    setAvailabilityRows((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;

        const nextRow = { ...row, [field]: value };

        if (field === "date" && typeof value === "string") {
          const allowedStartTimes = getAllowedStartTimes(value, nextRow.interval);
          const nextStart = allowedStartTimes.includes(nextRow.startTime)
            ? nextRow.startTime
            : allowedStartTimes[0] || "";
          const allowedEndTimes = getAllowedEndTimes(
            nextStart,
            value,
            nextRow.interval
          );
          const nextEnd = allowedEndTimes.includes(nextRow.endTime)
            ? nextRow.endTime
            : allowedEndTimes[0] || "";

          return {
            ...nextRow,
            startTime: nextStart,
            endTime: nextEnd,
          };
        }

        if (field === "startTime" && typeof value === "string") {
          const allowedEndTimes = getAllowedEndTimes(
            value,
            row.date,
            nextRow.interval
          );
          const nextEnd = allowedEndTimes.includes(nextRow.endTime)
            ? nextRow.endTime
            : allowedEndTimes[0] || (nextRow.interval ? "" : "24:00");

          return {
            ...nextRow,
            endTime: nextEnd,
          };
        }

        if (field === "endTime" && typeof value === "string") {
          const startMinutes = timeToMinutes(nextRow.startTime);
          const endMinutes = timeToMinutes(value);

          if (endMinutes <= startMinutes) {
            const allowedEndTimes = getAllowedEndTimes(nextRow.startTime, row.date);
            return {
              ...nextRow,
              endTime: allowedEndTimes[0] || (nextRow.interval ? "" : "24:00"),
            };
          }
        }

        if (field === "interval" && typeof value === "string") {
          return {
            ...nextRow,
            startTime: "",
            endTime: "",
          };
        }

        return nextRow;
      })
    );
  };
  const deleteAvailabilityRow = (index: number) => {
    setAvailabilityRows((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  // ---- Add On Features handlers ----
  const addAddOnRow = () => {
    setAddOnRows((current) => [
      ...current,
      {
        feature: "",
        usd: "",
        eur: "",
        gbp: "",
      },
    ]);
  };

  const updateAddOnRow = (
    index: number,
    field: "feature" | "usd" | "eur" | "gbp",
    value: string
  ) => {
    setAddOnRows((current) =>
      current.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const removeAddOnRow = (index: number) => {
    setAddOnRows((current) =>
      current.length === 1
        ? current
        : current.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const validateForm = () => {
    if (!studioName.trim()) {
      toast.error("Studio name is required");
      return false;
    }

    if (!location.trim()) {
      toast.error("Location is required");
      return false;
    }

    if (!country.trim() || !city.trim()) {
      toast.error("Please select a valid country and city from the map");
      return false;
    }

    if (availabilityRows.length === 0) {
      toast.error("Please add at least one availability");
      return false;
    }

    for (const row of availabilityRows) {
      if (!row.date) {
        toast.error("Date is required");
        return false;
      }

      if (!row.startTime) {
        toast.error("Start time is required");
        return false;
      }

      if (!row.endTime) {
        toast.error("End time is required");
        return false;
      }

      if (!row.interval) {
        toast.error(
          "Please select interval for all dates"
        );
        return false;
      }
    }

    return true;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      name: studioName,
      location,
      city,
      country,
      slots: availabilityRows.map((row) => ({
        date: row.date,
        startTime: row.startTime,
        endTime: row.endTime,
        slot: Number(row.interval),
      })),

      addOnFeatures: addOnRows
        .filter(
          (row) =>
            row.feature.trim() !== "" &&
            (row.usd.trim() !== "" ||
              row.eur.trim() !== "" ||
              row.gbp.trim() !== "")
        )
        .map((row) => ({
          featureName: row.feature.trim(),
          prices: {
            usd: parseFloat(row.usd.trim()) || 0,
            eur: parseFloat(row.eur.trim()) || 0,
            gbp: parseFloat(row.gbp.trim()) || 0,
          },
        })),
    };

    createStudio(payload, {
      onSuccess: (response) => {
        if (
          response?.status === 200 ||
          response?.success
        ) {
          toast.success(
            "Studio schedule created successfully!"
          );

          setStudioName("");
          setLocation("");
          setCountry("");
          setCity("");
          setAvailabilityRows([]);
          setAddOnRows([
            {
              feature: "",
              usd: "",
              eur: "",
              gbp: "",
            },
          ]);

          router.push(
            "/admin/studio-management"
          );
        } else {
          toast.error("Failed to create studio");
        }
      },
      onError: (error) => {
        console.error(
          "Error creating studio:",
          error
        );
        toast.error(
          "Error creating studio"
        );
      },
    });
  };

  return (
    <main className="w-full text-stone-200">
      <div className="space-y-6">

        {/* Studio Name + Location */}

        <section className="grid gap-3 md:grid-cols-2">

          <label className="block">
            <span className="mb-1.5 block text-xs font-normal text-stone-100">
              Studio Name
            </span>

            <input
              className={inputClass}
              placeholder="Name"
              type="text"
              value={studioName}
              onChange={(e) =>
                setStudioName(e.target.value.trimStart())
              }
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-normal text-stone-100">
              Location
            </span>

            <input
              className={inputClass}
              placeholder="Select location"
              type="text"
              value={location}
              readOnly
              onClick={() => setIsLocationPickerOpen(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsLocationPickerOpen(true);
                }
              }}
            />
          </label>

        </section>

        {(country || city) && (
          <section className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs font-normal text-stone-100">
                Country
              </span>
              <input
                className={inputClass}
                type="text"
                value={country}
                readOnly
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-normal text-stone-100">
                City
              </span>
              <input
                className={inputClass}
                type="text"
                value={city}
                readOnly
              />
            </label>
          </section>
        )}

        {/* Availability */}

        <section className="rounded-lg border border-stone-700">

          <div className="bg-white/15 px-4 py-3 rounded-t-lg">
            <h2 className="text-sm font-medium text-stone-100">
              Availability
            </h2>
          </div>

          <div className="space-y-4 p-3 overflow-visible">

            {/* Date selector */}

            <div className="space-y-4 rounded-lg border border-stone-700/50 bg-stone-900/30 p-4">

              <div className="flex gap-3">

                <div className="block flex-1">

                  <span className="mb-1.5 block text-xs font-normal text-stone-100">
                    Select Date
                  </span>

                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setShowCalendar(
                          !showCalendar
                        )
                      }
                      className={
                        inputClass +
                        " cursor-pointer text-left"
                      }
                    >
                      {selectedDate
                        ? parseLocalDate(selectedDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Select a date"}
                    </button>

                    <CalendarDays
                      onClick={() =>
                        setShowCalendar(
                          !showCalendar
                        )
                      }
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
                            {calendarMonth.toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                              }
                            )}
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
                              length:
                                getFirstDayOfMonth(
                                  calendarMonth
                                ),
                            },
                            (_, i) => (
                              <div
                                key={`empty-${i}`}
                              />
                            )
                          )}

                          {Array.from(
                            {
                              length:
                                getDaysInMonth(
                                  calendarMonth
                                ),
                            },
                            (_, i) => i + 1
                          ).map((day) => {

                            const date =
                              new Date(
                                calendarMonth.getFullYear(),
                                calendarMonth.getMonth(),
                                day
                              );

                            const formattedDate =
                              formatLocalDateInput(date);

                            const isSelected =
                              selectedDate ===
                              formattedDate;

                            const alreadyAdded =
                              availabilityRows.some(
                                (row) =>
                                  row.date ===
                                  formattedDate
                              );
                            const isPastDate = isDateBeforeToday(date);

                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() =>
                                  handleDateSelect(
                                    day
                                  )
                                }
                                disabled={
                                  alreadyAdded ||
                                  isPastDate
                                }
                                className={`rounded py-2 text-sm ${
                                  isSelected
                                    ? "bg-rose-500 text-white"
                                    : alreadyAdded
                                    ? "text-stone-600 cursor-not-allowed"
                                    : isPastDate
                                    ? "text-stone-600 cursor-not-allowed"
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

            {/* Availability table */}

            {availabilityRows.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-stone-700">
                <p className="px-6 py-3 text-xs text-stone-400">
                  Select the interval first, then choose the start and end time.
                </p>

                <table className="w-full min-w-[880px] table-fixed border-collapse">

                  <thead>
                    <tr className="h-11 text-left text-xs font-normal text-stone-100">

                      <th className="w-[22%] px-6 text-xs font-normal">
                        Date
                      </th>

                      <th className="w-[22%] px-6 text-xs font-normal">
                        Activities Booked
                      </th>

                      <th className="w-[17%] px-2 text-xs font-normal">
                        Interval in hours
                      </th>

                      <th className="w-[16%] px-2 text-xs font-normal">
                        Start Time
                      </th>

                      <th className="w-[16%] px-2 text-xs font-normal">
                        End Time
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
                          <select
                            className={selectClass}
                            value={row.interval}
                            onChange={(e) =>
                              updateAvailabilityRow(index, "interval", e.target.value)
                            }
                          >
                            <option value="" disabled className="bg-gray-500 text-white">
                              Select start time
                            </option>
                            {[
                              ["30", "0.5 hour"], ["60", "1 hour"],
                              ["90", "1.5 hours"], ["120", "2 hours"],
                              ["150", "2.5 hours"], ["180", "3 hours"],
                              ["210", "3.5 hours"], ["240", "4 hours"],
                            ].map(([value, label]) => (
                              <option key={value} value={value} className="bg-gray-500 text-white">
                                {label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2">
                          <select
                            className={timeInputClass}
                            value={row.startTime}
                            onChange={(e) => updateAvailabilityRow(index, "startTime", e.target.value)}
                            disabled={!row.interval}
                          >
                            <option value="" disabled className="bg-gray-500 text-white">Select end time</option>
                            {getAllowedStartTimes(row.date, row.interval).map((time) => (
                              <option key={`start-${time}`} value={time} className="bg-gray-500 text-white">{time}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2">
                          <select
                            className={timeInputClass}
                            value={row.endTime}
                            onChange={(e) => updateAvailabilityRow(index, "endTime", e.target.value)}
                            disabled={!row.interval || !row.startTime}
                          >
                            <option value="" disabled className="bg-gray-500 text-white">Select interval</option>
                            {getAllowedEndTimes(row.startTime, row.date, row.interval).map((time) => (
                              <option key={`end-${time}`} value={time} className="bg-gray-500 text-white">{time}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 text-center">
                          <button
                            type="button"
                            onClick={() => deleteAvailabilityRow(index)}
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

        {/* Add On Features */}

        <section className="overflow-hidden rounded-xl border border-stone-700">

          <div className="bg-white/15 px-4 py-3 rounded-t-lg">
            <h2 className="text-sm font-medium text-stone-100">
              Add On Features
            </h2>
          </div>

          <div className="space-y-4 px-5 py-4">

            {addOnRows.map((row, index) => (
              <div
                key={index}
                className="grid items-end gap-3 sm:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_32px]"
              >

                <div className="relative">
                  <label className="mb-1 block text-[10px] text-stone-400">
                    Feature
                  </label>
                  <input
                    className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                    placeholder="Feature name"
                    value={row.feature}
                    onChange={(e) =>
                      updateAddOnRow(
                        index,
                        "feature",
                        e.target.value.trimStart()
                      )
                    }
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-[10px] text-stone-400">
                    USD ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                    placeholder="0.00"
                    value={row.usd}
                    onChange={(e) =>
                      updateAddOnRow(
                        index,
                        "usd",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-[10px] text-stone-400">
                    EUR (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                    placeholder="0.00"
                    value={row.eur}
                    onChange={(e) =>
                      updateAddOnRow(
                        index,
                        "eur",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="relative">
                  <label className="mb-1 block text-[10px] text-stone-400">
                    GBP (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="h-12 w-full rounded-md border border-stone-700 bg-transparent px-4 text-sm text-stone-200 outline-none placeholder:text-stone-500 focus:border-rose-400"
                    placeholder="0.00"
                    value={row.gbp}
                    onChange={(e) =>
                      updateAddOnRow(
                        index,
                        "gbp",
                        e.target.value
                      )
                    }
                  />
                </div>

                <DeleteButton
                  onClick={() => removeAddOnRow(index)}
                  disabled={addOnRows.length === 1}
                />

              </div>
            ))}

            <div className="flex justify-end">

              <button
                type="button"
                onClick={addAddOnRow}
                className="inline-flex items-center gap-3 text-xs font-medium text-stone-300 underline-offset-2 hover:text-white underline"
              >
                + Add Another
              </button>

            </div>

          </div>

        </section>

        {/* Actions */}

        <div className="grid gap-3 sm:grid-cols-[minmax(160px,315px)_1fr]">

          <button
            type="button"
            onClick={() =>
              router.push(
                "/admin/studio-management"
              )
            }
            className="h-12 rounded-md border border-stone-200/70 text-sm font-medium text-stone-200 transition-colors hover:bg-white/10"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isCreating}
            className="h-12 rounded-md bg-rose-500 text-sm font-medium text-white transition-colors hover:bg-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating
              ? "Saving..."
              : "Save"}
          </button>

        </div>

      </div>

      <LocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onSelectLocation={handleLocationSelect}
      />
    </main>
  );
};

export default StudioDetails;