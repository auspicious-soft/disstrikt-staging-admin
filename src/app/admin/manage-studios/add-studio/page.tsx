"use client";
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LoadScript } from "@react-google-maps/api";
import LocationPickerModal from "../../../components/LocationPickerModal";
import { ADMIN_URLS } from "@/constants/apiUrls";
import { createStudio } from "@/services/admin-services";
import { toast } from "sonner";
import { ChevronDown, ChevronUp } from "lucide-react";

const libraries: "places"[] = ["places"];

interface LatLng {
  lat: number;
  lng: number;
}

interface ScheduleEntry {
  id: string;
  date: string;
  activitiesBooked: number;
  startTime: string;
  endTime: string;
  intervalHours: string;
}

const StudioSchedule: React.FC = () => {
  const router = useRouter();
  const [studioName, setStudioName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [locationData, setLocationData] = useState({
    location: "",
    city: "",
    country: "",
    countryCode: "",
  });
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([
    {
      id: "1",
      date: "",
      activitiesBooked: 0,
      startTime: "",
      endTime: "",
      intervalHours: "",
    },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const allowedCountries = ["GB", "NL", "BE", "ES", "FR"];
  const [activeSelect, setActiveSelect] = useState<string | null>(null);
  const [openSelect, setOpenSelect] = useState<string | null>(null);

  const apiKey = "AIzaSyCDZoRf-BZL2yR_ZyXpzht_a63hMgLCTis";

  // Generate time slots in 30-minute intervals from 00:00 to 24:00
  const generateTimeSlots = () => {
    const slots = [];
    for (let i = 0; i <= 24; i++) {
      const hour = i.toString().padStart(2, "0");
      slots.push({ value: `${hour}:00`, label: `${hour}:00` });
      if (i < 24) {
        slots.push({ value: `${hour}:30`, label: `${hour}:30` });
      }
    }
    return slots;
  };

  const allTimeSlots = generateTimeSlots();

  // Get available end time slots based on start time and interval
  const getAvailableEndSlots = (startTime: string, intervalMinutes: string) => {
    if (!startTime || !intervalMinutes) return allTimeSlots;

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const interval = parseInt(intervalMinutes);
    const minEndTotalMinutes = startTotalMinutes + interval;

    return allTimeSlots.filter((slot) => {
      const [slotHour, slotMinute] = slot.value.split(":").map(Number);
      const slotTotalMinutes = slotHour * 60 + slotMinute;
      return slotTotalMinutes >= minEndTotalMinutes;
    });
  };

  const validateField = (name: string, value: string | number) => {
    if (value.toString().trim() === "") {
      return `${
        name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
      } is required`;
    }
    return "";
  };

  const handleStudioNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setStudioName(value);
    setErrors((prev) => ({
      ...prev,
      studioName: validateField("studioName", value),
    }));
  };

  const handleSelectLocation = (address: string, position: LatLng) => {
    console.log("Selected address:", address, "Position:", position);
    setSelectedAddress(address);
    setSelectedPosition(position);
    if (typeof google === "undefined" || !google.maps) {
      console.error("Google Maps not loaded yet");
      toast.error("Google Maps is loading, please try again");
      return;
    }
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          let cityName = "";
          let countryName = "";
          let countryCode = "";

          results[0].address_components.forEach((component) => {
            if (!cityName) {
              if (component.types.includes("locality")) {
                cityName = component.long_name;
              } else if (component.types.includes("postal_town")) {
                cityName = component.long_name;
              } else if (
                component.types.includes("administrative_area_level_2")
              ) {
                cityName = component.long_name;
              } else if (component.types.includes("sublocality")) {
                cityName = component.long_name;
              }
            }

            if (component.types.includes("country")) {
              countryName = component.long_name;
              countryCode = component.short_name;
            }
          });

          if (!allowedCountries.includes(countryCode)) {
            setErrors((prev) => ({
              ...prev,
              location: "Studios can only be added in UK, NL, BE, ES, or FR.",
            }));
            setLocationData({
              city: "",
              country: "",
              countryCode: "",
              location: "",
            });
            setSelectedAddress("");
            setSelectedPosition(null);
            return;
          }

          if (!cityName && results[0].formatted_address) {
            const addressParts = results[0].formatted_address.split(", ");
            if (addressParts.length >= 2) {
              cityName =
                addressParts[addressParts.length - 3] ||
                addressParts[addressParts.length - 2] ||
                "";
            }
          }

          setLocationData({
            city: cityName,
            country: countryName,
            countryCode: countryCode,
            location: address,
          });
          setErrors((prev) => ({ ...prev, location: "" }));
        }
      });
    } catch (error) {
      console.error("Error getting city/country:", error);
      setErrors((prev) => ({ ...prev, location: "Error selecting location." }));
    }
  };

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleScheduleChange = (
    id: string,
    field: keyof ScheduleEntry,
    value: string,
  ) => {
    setSchedules((prev) =>
      prev.map((schedule) => {
        if (schedule.id === id) {
          const updatedSchedule = { ...schedule, [field]: value };

          // If changing start time, reset end time if it's now invalid
          if (
            field === "startTime" &&
            schedule.endTime &&
            schedule.intervalHours
          ) {
            const [startHour, startMinute] = value.split(":").map(Number);
            const [endHour, endMinute] = schedule.endTime
              .split(":")
              .map(Number);
            const startTotalMinutes = startHour * 60 + startMinute;
            const endTotalMinutes = endHour * 60 + endMinute;
            const intervalMinutes = parseInt(schedule.intervalHours);

            if (endTotalMinutes <= startTotalMinutes + intervalMinutes) {
              updatedSchedule.endTime = "";
            }
          }

          return updatedSchedule;
        }
        return schedule;
      }),
    );
    setErrors((prev) => ({
      ...prev,
      [`${id}_${field}`]: validateField(field, value),
    }));
  };

  const addScheduleRow = () => {
    const newSchedule: ScheduleEntry = {
      id: Date.now().toString(),
      date: "",
      activitiesBooked: 0,
      startTime: "",
      endTime: "",
      intervalHours: "",
    };
    setSchedules((prev) => [...prev, newSchedule]);
  };

  const removeScheduleRow = (id: string) => {
    if (schedules.length > 1) {
      setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
      setErrors((prev) => {
        const newErrors = { ...prev };
        Object.keys(newErrors).forEach((key) => {
          if (key.startsWith(id)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const getDisabledDates = (currentId: string) => {
    return schedules
      .filter(
        (s) => s.id !== currentId && s.date, // exclude current row & empty
      )
      .map((s) => s.date);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    const studioNameError = validateField("studioName", studioName);
    if (studioNameError) newErrors.studioName = studioNameError;

    const locationError = validateField("location", selectedAddress);
    if (locationError) newErrors.location = locationError;

    const cityError = validateField("city", locationData.city);
    if (cityError) newErrors.city = cityError;

    const countryError = validateField("country", locationData.country);
    if (countryError) newErrors.country = countryError;

    schedules.forEach((schedule) => {
      if (validateField("date", schedule.date))
        newErrors[`${schedule.id}_date`] = "Date is required";

      if (validateField("startTime", schedule.startTime))
        newErrors[`${schedule.id}_startTime`] = "Start time is required";

      if (validateField("endTime", schedule.endTime))
        newErrors[`${schedule.id}_endTime`] = "End time is required";

      if (validateField("intervalHours", schedule.intervalHours))
        newErrors[`${schedule.id}_intervalHours`] = "Slot is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const payload = {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      name: studioName,
      location: selectedAddress,
      city: locationData.city,
      country: locationData.country,
      slots: schedules.map((schedule) => ({
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slot: Number(schedule.intervalHours),
      })),
    };

    try {
      const response = await createStudio(`${ADMIN_URLS.ADD_STUDIO}`, payload);
      if (response.status === 200) {
        setStudioName("");
        setSelectedAddress("");
        setSelectedPosition(null);
        setLocationData({
          location: "",
          city: "",
          country: "",
          countryCode: "",
        });
        setSchedules([
          {
            id: "1",
            date: "",
            activitiesBooked: 0,
            startTime: "",
            endTime: "",
            intervalHours: "",
          },
        ]);
        router.push("/admin/manage-studios");
        setErrors({});

        toast.success("Studio schedule created successfully!");
      } else {
        toast.error("Failed to Create Studio");
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: "Error creating studio." });
    } finally {
      setLoading(false);
    }
  };

  const intervalOptions = [
    { value: "30", label: "0.5 Hours " },
    { value: "60", label: "1 Hours" },
    { value: "90", label: "1.5 Hours" },
    { value: "120", label: "2 Hours" },
    { value: "150", label: "2.5 Hours" },
    { value: "180", label: "3 Hours" },
    { value: "210", label: "3.5 Hours" },
    { value: "240", label: "4 Hours" },
  ];

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
      <div className="w-full flex flex-col justify-center items-start gap-10">
        {errors.general && (
          <div className="w-full text-red-500 text-sm font-light ">
            {errors.general}
          </div>
        )}

        {/* Studio Name and Location Row */}
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-stone-200 text-xs font-light ">
              Studio Name
            </label>
            <input
              type="text"
              placeholder="Studio Name Here"
              value={studioName}
              onChange={handleStudioNameChange}
              className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                errors.studioName ? "border-red-500 border" : ""
              }`}
            />
            {errors.studioName && (
              <span className="text-red-500 text-xs font-light ">
                {errors.studioName}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-stone-200 text-xs font-light ">
              Location
            </label>
            <input
              type="text"
              value={selectedAddress}
              onClick={handleInputClick}
              placeholder="1234 Maple Avenue, Creative Hub..."
              className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  cursor-pointer ${
                errors.location ? "border-red-500 border" : ""
              }`}
              readOnly
            />
            <LocationPickerModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSelectLocation={handleSelectLocation}
              initialCenter={selectedPosition}
            />
            {errors.location && (
              <span className="text-red-500 text-xs font-light ">
                {errors.location}
              </span>
            )}
          </div>
        </div>

        {/* City and Country Row */}
        <div className="w-full flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-stone-200 text-xs font-light ">City</label>
            <input
              type="text"
              value={locationData.city}
              placeholder="City"
              className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  cursor-not-allowed ${
                errors.city ? "border-red-500 border" : ""
              }`}
              disabled
              readOnly
            />
            {errors.city && (
              <span className="text-red-500 text-xs font-light ">
                {errors.city}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            <label className="text-stone-200 text-xs font-light ">
              Country
            </label>
            <input
              type="text"
              value={locationData.country}
              placeholder="Country"
              className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  cursor-not-allowed ${
                errors.country ? "border-red-500 border" : ""
              }`}
              disabled
              readOnly
            />
            {errors.country && (
              <span className="text-red-500 text-xs font-light ">
                {errors.country}
              </span>
            )}
          </div>
        </div>

        {/* Schedule Table */}
        <div className="w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-4">
          {/* Table Header */}
          <div className="w-full grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-4 px-5 text-center">
            <div className="text-neutral-200 text-xs font-medium  text-center">
              Date
            </div>
            <div className="text-neutral-200 text-xs font-medium  text-center">
              Interval (hours)
            </div>
            <div className="text-neutral-200 text-xs font-medium  text-center">
              Start Time
            </div>
            <div className="text-neutral-200 text-xs font-medium  text-center">
              End Time
            </div>
            <div className="text-neutral-200 text-xs font-medium whitespace-nowrap text-end">
              Action
            </div>
          </div>

          {/* Schedule Rows */}
          <div className="w-full rounded-[10px] outline outline-neutral-700 flex flex-col">
            {schedules.map((schedule, index) => (
              <div
                key={schedule.id}
                className={`w-full grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-4 px-5 py-3 ${
                  index !== schedules.length - 1
                    ? "border-b border-neutral-700"
                    : ""
                }`}
              >
                {/* Date */}
                <div className="flex flex-col gap-1">
                  <input
                    type="date"
                    value={schedule.date}
                    onChange={(e) => {
                      const selectedDate = e.target.value;
                      const disabledDates = getDisabledDates(schedule.id);

                      if (disabledDates.includes(selectedDate)) {
                        toast.error(
                          "This date is already selected in another slot",
                        );
                        return;
                      }

                      handleScheduleChange(schedule.id, "date", selectedDate);
                    }}
                    onClick={(e) => e.currentTarget.showPicker()}
                    min={getTomorrowDate()}
                    className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-neutral-200 text-xs font-medium  ${
                      errors[`${schedule.id}_date`]
                        ? "border-red-500 border"
                        : ""
                    }`}
                  />
                </div>

                <div className="flex flex-col gap-1 relative">
                  <select
                    value={schedule.intervalHours}
                    onMouseDown={() =>
                      setOpenSelect(
                        openSelect === `${schedule.id}_interval`
                          ? null
                          : `${schedule.id}_interval`,
                      )
                    }
                    onBlur={() => setOpenSelect(null)}
                    onChange={(e) =>
                      handleScheduleChange(
                        schedule.id,
                        "intervalHours",
                        e.target.value,
                      )
                    }
                    className={`w-full appearance-none px-4 py-3.5 pr-10 bg-zinc-900/80 rounded-[10px]
      outline outline-neutral-700 text-neutral-200 text-xs font-medium 
      ${errors[`${schedule.id}_intervalHours`] ? "border-red-500 border" : ""}
    `}
                  >
                    <option value="">Select</option>
                    {intervalOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    {openSelect === `${schedule.id}_interval` ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative">
                  <select
                    value={schedule.startTime}
                    onMouseDown={() =>
                      setOpenSelect(
                        openSelect === `${schedule.id}_start`
                          ? null
                          : `${schedule.id}_start`,
                      )
                    }
                    onBlur={() => setOpenSelect(null)}
                    onChange={(e) =>
                      handleScheduleChange(
                        schedule.id,
                        "startTime",
                        e.target.value,
                      )
                    }
                    className={`w-full appearance-none px-4 py-3.5 pr-10 bg-zinc-900/80 rounded-[10px]
      outline outline-neutral-700 text-neutral-200 text-xs font-medium  no-scrollbar
      ${errors[`${schedule.id}_startTime`] ? "border-red-500 border" : ""}
    `}
                  >
                    <option value="">Select</option>
                    {allTimeSlots.slice(0, -1).map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    {openSelect === `${schedule.id}_start` ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1 relative">
                  <select
                    value={schedule.endTime}
                    disabled={!schedule.startTime || !schedule.intervalHours}
                    onMouseDown={() =>
                      setOpenSelect(
                        openSelect === `${schedule.id}_end`
                          ? null
                          : `${schedule.id}_end`,
                      )
                    }
                    onBlur={() => setOpenSelect(null)}
                    onChange={(e) =>
                      handleScheduleChange(
                        schedule.id,
                        "endTime",
                        e.target.value,
                      )
                    }
                    className={`w-full appearance-none px-4 py-3.5 pr-10 bg-zinc-900/80 rounded-[10px]
      outline outline-neutral-700 text-neutral-200 text-xs font-medium  no-scrollbar
      ${errors[`${schedule.id}_endTime`] ? "border-red-500 border" : ""}
      ${
        !schedule.startTime || !schedule.intervalHours
          ? "opacity-50 cursor-not-allowed"
          : ""
      }
    `}
                  >
                    <option value="">Select</option>
                    {getAvailableEndSlots(
                      schedule.startTime,
                      schedule.intervalHours,
                    ).map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
                    {openSelect === `${schedule.id}_end` ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {/* Delete Action */}
                <div className="flex items-center justify-end whitespace-nowrap">
                  <button
                    onClick={() => removeScheduleRow(schedule.id)}
                    disabled={schedules.length === 1}
                    className={`w-7 h-7 bg-rose-500 rounded flex items-center justify-center ${
                      schedules.length === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }`}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Row Button */}
          <button
            onClick={addScheduleRow}
            className="w-full px-5 py-3 bg-zinc-800 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-semibold  hover:bg-zinc-700 transition-colors"
          >
            + Add Another Date
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col md:flex-row gap-2.5">
          <button
            className="w-full md:w-44 px-5 py-4 rounded-[10px] outline outline-zinc-400 text-stone-200 text-sm font-semibold  capitalize cursor-pointer"
            onClick={() => router.push("/admin/manage-studios")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:flex-1 px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </div>
    </LoadScript>
  );
};

export default StudioSchedule;
