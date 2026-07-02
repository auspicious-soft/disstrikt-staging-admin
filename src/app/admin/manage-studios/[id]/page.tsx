"use client";
import React, { useState, useEffect } from "react";
import { Trash2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// import { LoadScript } from "@react-google-maps/api";
import LocationPickerModal from "../../../components/LocationPickerModal";
import { ADMIN_URLS } from "@/constants/apiUrls";
import {
  updateStudio,
  getStudioByID,
  deleteBookingDate,
} from "@/services/admin-services";
import { toast } from "sonner";
import Loader from "../../components/ui/Loader";

// const libraries: "places"[] = ["places"];

interface LatLng {
  lat: number;
  lng: number;
}

interface SubSlot {
  bookingId: string;
  startTime: string;
  endTime: string;
  status: string;
  userId: string | null;
}

interface ScheduleEntry {
  id: string;
  date: string;
  activitiesBooked: number;
  startTime: string;
  endTime: string;
  intervalHours: string;
  isExisting?: boolean;
  slots?: SubSlot[];
  bookedSlots?: number;
}

const StudioById: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const studioId = params?.id as string;
  const apiKey = "AIzaSyCDZoRf-BZL2yR_ZyXpzht_a63hMgLCTis";

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
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [newSchedules, setNewSchedules] = useState<ScheduleEntry[]>([]);
  const [expandedSlots, setExpandedSlots] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const allowedCountries = ["GB", "NL", "BE", "ES", "FR"];
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    bookingId: string;
    scheduleId: string;
  } | null>(null);

  const fetchStudioData = async () => {
    if (!studioId) {
      toast.error("Studio ID not found");
      router.push("/admin/manage-studios");
      return;
    }

    setInitialLoading(true);
    try {
      const response = await getStudioByID(
        `${ADMIN_URLS.GET_STUDIO_BY_ID}?id=${studioId}`,
      );

      if (
        response &&
        response.data &&
        response.data.success &&
        response.data.data
      ) {
        const studio = response.data.data;

        setStudioName(studio.name || "");
        setSelectedAddress(studio.location || "");
        setLocationData({
          location: studio.location || "",
          city: studio.city || "",
          country: studio.country || "",
          countryCode: "",
        });

        if (
          studio.slots &&
          Array.isArray(studio.slots) &&
          studio.slots.length > 0
        ) {
          const mappedSchedules: ScheduleEntry[] = studio.slots.map(
            (slot: any, index: number) => ({
              id: `existing-${index}`,
              date: slot.date || "",
              activitiesBooked: slot.bookedSlots || 0,
              startTime: slot.startTime || "",
              endTime: slot.endTime || "",
              intervalHours: slot.interval || "",
              isExisting: true,
              slots: slot.slots || [],
              bookedSlots: slot.bookedSlots || 0,
            }),
          );
          setSchedules(mappedSchedules);
        } else {
          setSchedules([]);
        }

        toast.success("Studio data loaded successfully!");
      } else {
        toast.error("Failed to load studio data");
      }
    } catch (error) {
      console.error("Error fetching studio:", error);
      toast.error("Error loading studio data");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    if (studioId) {
      fetchStudioData();
    } else {
      toast.error("Studio ID not found in URL");
      router.push("/admin/manage-studios");
    }
  }, [studioId]);

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
    setSelectedAddress(address);
    setSelectedPosition(position);

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
      setErrors((prev) => ({
        ...prev,
        location: "Error selecting location.",
      }));
    }
  };

  const handleInputClick = () => {
    setIsModalOpen(true);
  };

  const handleNewScheduleChange = (
    id: string,
    field: keyof ScheduleEntry,
    value: string,
  ) => {
    setNewSchedules((prev) =>
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

          // If changing interval, reset end time
          if (field === "intervalHours") {
            updatedSchedule.endTime = "";
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
      isExisting: false,
    };
    setNewSchedules((prev) => [...prev, newSchedule]);
  };

  const removeNewScheduleRow = (id: string) => {
    setNewSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(id)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const toggleSlotExpansion = (id: string) => {
    setExpandedSlots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const deleteSubSlot = async (bookingId: string, scheduleId: string) => {
    setDeleteLoading(bookingId);
    try {
      const response = await deleteBookingDate(
        `${ADMIN_URLS.DELETE_BOOKING_DATE}?id=${bookingId}`,
      );

      if (response.success || response.status === 200) {
        toast.success("Sub-slot deleted successfully!");

        // Update the schedules state to remove the deleted sub-slot
        setSchedules((prev) =>
          prev.map((schedule) => {
            if (schedule.id === scheduleId && schedule.slots) {
              const updatedSlots = schedule.slots.filter(
                (slot) => slot.bookingId !== bookingId,
              );
              return {
                ...schedule,
                slots: updatedSlots,
                bookedSlots: Math.max(0, (schedule.bookedSlots || 0) - 1),
              };
            }
            return schedule;
          }),
        );
      } else {
        toast.error("Failed to delete sub-slot");
      }
    } catch (error) {
      console.error("Error deleting sub-slot:", error);
      toast.error("Error deleting sub-slot");
    } finally {
      setDeleteLoading(null);
    }
  };

  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  const getDisabledDates = () => {
    return [...schedules, ...newSchedules]
      .filter((s) => s.date)
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

    newSchedules.forEach((schedule) => {
      if (validateField("date", schedule.date))
        newErrors[`${schedule.id}_date`] = "Date is required";

      if (validateField("intervalHours", schedule.intervalHours))
        newErrors[`${schedule.id}_intervalHours`] = "Slot is required";

      if (validateField("startTime", schedule.startTime))
        newErrors[`${schedule.id}_startTime`] = "Start time is required";

      if (validateField("endTime", schedule.endTime))
        newErrors[`${schedule.id}_endTime`] = "End time is required";
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const payload = {
      id: studioId,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      name: studioName,
      location: selectedAddress,
      city: locationData.city,
      country: locationData.country,
      slots: newSchedules.map((schedule) => ({
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        slot: Number(schedule.intervalHours),
      })),
    };

    try {
      const response = await updateStudio(
        `${ADMIN_URLS.UPDATE_STUDIO}`,
        payload,
      );

      if (
        response.status === 200 ||
        response.status === 201 ||
        response.success
      ) {
        toast.success("Studio updated successfully!");
        setNewSchedules([]);
        await fetchStudioData();
      } else {
        toast.error("Failed to update studio");
      }
    } catch (error) {
      console.error(error);
      setErrors({ general: "Error updating studio." });
      toast.error("Error updating studio");
    } finally {
      setLoading(false);
    }
  };

  const intervalOptions = [
    { value: "30", label: "0.5 Hours" },
    { value: "60", label: "1 Hours" },
    { value: "90", label: "1.5 Hours" },
    { value: "120", label: "2 Hours" },
    { value: "150", label: "2.5 Hours" },
    { value: "180", label: "3 Hours" },
    { value: "210", label: "3.5 Hours" },
    { value: "240", label: "4 Hours" },
  ];

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setShowDeleteModal(false);
    setPendingDelete(null);
  };

  const confirmDeleteSubSlot = async () => {
    if (!pendingDelete) return;

    await deleteSubSlot(pendingDelete.bookingId, pendingDelete.scheduleId);

    setShowDeleteModal(false);
    setPendingDelete(null);
  };

  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  if (initialLoading) {
    return <Loader />;
  }

  if (!studioId) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="text-red-500 text-lg ">Studio ID not found</div>
      </div>
    );
  }

  return (
    <>
      {/* <LoadScript googleMapsApiKey={apiKey} libraries={libraries}> */}
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

        {/* Existing Slots (Read-only) */}
        {schedules.length > 0 && (
          <div className="w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-4">
            <h2 className="text-stone-200 text-lg font-semibold ">
              Existing Slots
            </h2>

            <div className="w-full grid grid-cols-[repeat(5,minmax(0,1fr))_auto] gap-4 px-5 text-center">
              <div className="text-neutral-200 text-xs font-medium ">Date</div>
              <div className="text-neutral-200 text-xs font-medium ">
                Start Time
              </div>
              <div className="text-neutral-200 text-xs font-medium ">
                End Time
              </div>
              <div className="text-neutral-200 text-xs font-medium ">
                Interval
              </div>
              <div className="text-neutral-200 text-xs font-medium ">
                Booked Slots
              </div>
              <div className="text-neutral-200 text-xs font-medium whitespace-nowrap text-end">
                Action
              </div>
            </div>

            <div className="w-full rounded-[10px] outline outline-neutral-700 flex flex-col">
              {schedules.map((schedule, index) => (
                <React.Fragment key={schedule.id}>
                  <div
                    className={`w-full grid grid-cols-[repeat(5,minmax(0,1fr))_auto] gap-4 px-5 py-3 ${
                      index !== schedules.length - 1 ||
                      expandedSlots.has(schedule.id)
                        ? "border-b border-neutral-700"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      <div className="text-neutral-200 text-xs font-medium ">
                        {schedule.date}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-neutral-200 text-xs font-medium ">
                        {schedule.startTime}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-neutral-200 text-xs font-medium ">
                        {schedule.endTime}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-neutral-200 text-xs font-medium ">
                        {schedule.intervalHours}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <div className="text-neutral-200 text-xs font-medium ">
                        {schedule.bookedSlots || 0}
                      </div>
                    </div>

                    <div className="flex items-center justify-end whitespace-nowrap gap-2">
                      {schedule.slots && schedule.slots.length > 0 && (
                        <button
                          onClick={() => toggleSlotExpansion(schedule.id)}
                          className="w-7 h-7 bg-blue-500 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600"
                        >
                          {expandedSlots.has(schedule.id) ? (
                            <ChevronUp className="w-4 h-4 text-white" />
                          ) : (
                            <Eye className="w-4 h-4 text-white" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Sub-slots */}
                  {expandedSlots.has(schedule.id) && schedule.slots && (
                    <div className="w-full bg-zinc-800/50 px-5 py-4 border-b border-neutral-700">
                      <div className="text-neutral-200 text-sm font-semibold  mb-3">
                        Sub-slots for {schedule.date}
                      </div>
                      <div className="space-y-2">
                        {schedule.slots.map((subSlot) => (
                          <div
                            key={subSlot.bookingId}
                            className="grid grid-cols-[1fr_1fr_1fr_auto] gap-4 px-4 py-2 bg-zinc-900 rounded-lg"
                          >
                            <div className="flex flex-col">
                              <span className="text-neutral-400 text-xs ">
                                Start Time
                              </span>
                              <span className="text-neutral-200 text-sm ">
                                {subSlot.startTime}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-neutral-400 text-xs ">
                                End Time
                              </span>
                              <span className="text-neutral-200 text-sm ">
                                {subSlot.endTime}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-neutral-400 text-xs ">
                                Status
                              </span>
                              <span
                                className={`text-sm  ${
                                  subSlot.status === "Empty"
                                    ? "text-green-400"
                                    : "text-yellow-400"
                                }`}
                              >
                                {subSlot.status}
                              </span>
                            </div>
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => {
                                  setPendingDelete({
                                    bookingId: subSlot.bookingId,
                                    scheduleId: schedule.id,
                                  });
                                  setShowDeleteModal(true);
                                }}
                                disabled={deleteLoading === subSlot.bookingId}
                                className={`w-7 h-7 bg-rose-500 rounded flex items-center justify-center ${
                                  deleteLoading === subSlot.bookingId
                                    ? "opacity-50 cursor-not-allowed"
                                    : "cursor-pointer hover:bg-rose-600"
                                }`}
                              >
                                {deleteLoading === subSlot.bookingId ? (
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-white" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}

        {/* New Slots Section */}
        <div className="w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex flex-col gap-4">
          <h2 className="text-stone-200 text-lg font-semibold ">
            Add New Slots
          </h2>

          {newSchedules.length > 0 && (
            <>
              <div className="w-full grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-4 px-5 text-center">
                <div className="text-neutral-200 text-xs font-medium ">
                  Date
                </div>
                <div className="text-neutral-200 text-xs font-medium ">
                  Interval (hours)
                </div>
                <div className="text-neutral-200 text-xs font-medium ">
                  Start Time
                </div>
                <div className="text-neutral-200 text-xs font-medium ">
                  End Time
                </div>
                <div className="text-neutral-200 text-xs font-medium whitespace-nowrap text-end">
                  Action
                </div>
              </div>

              <div className="w-full rounded-[10px] outline outline-neutral-700 flex flex-col">
                {newSchedules.map((schedule, index) => (
                  <div
                    key={schedule.id}
                    className={`w-full grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-4 px-5 py-3 ${
                      index !== newSchedules.length - 1
                        ? "border-b border-neutral-700"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col gap-1">
                      <input
                        type="date"
                        value={schedule.date}
                        onChange={(e) => {
                          const selectedDate = e.target.value;
                          const disabledDates = getDisabledDates();

                          if (disabledDates.includes(selectedDate)) {
                            toast.error(
                              "This date is already selected in another slot",
                            );
                            return;
                          }

                          handleNewScheduleChange(
                            schedule.id,
                            "date",
                            selectedDate,
                          );
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

                    <div className="flex flex-col gap-1">
                      <select
                        value={schedule.intervalHours}
                        onChange={(e) =>
                          handleNewScheduleChange(
                            schedule.id,
                            "intervalHours",
                            e.target.value,
                          )
                        }
                        className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-neutral-200 text-xs font-medium  ${
                          errors[`${schedule.id}_intervalHours`]
                            ? "border-red-500 border"
                            : ""
                        }`}
                      >
                        <option value="">Select</option>
                        {intervalOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <select
                        value={schedule.startTime}
                        onChange={(e) =>
                          handleNewScheduleChange(
                            schedule.id,
                            "startTime",
                            e.target.value,
                          )
                        }
                        disabled={!schedule.intervalHours}
                        className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-neutral-200 text-xs font-medium  max-h-40 overflow-y-auto ${
                          errors[`${schedule.id}_startTime`]
                            ? "border-red-500 border"
                            : ""
                        } ${
                          !schedule.intervalHours
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Select</option>
                        {allTimeSlots.slice(0, -1).map((slot) => (
                          <option key={slot.value} value={slot.value}>
                            {slot.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <select
                        value={schedule.endTime}
                        onChange={(e) =>
                          handleNewScheduleChange(
                            schedule.id,
                            "endTime",
                            e.target.value,
                          )
                        }
                        disabled={
                          !schedule.startTime || !schedule.intervalHours
                        }
                        className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-neutral-200 text-xs font-medium  max-h-40 overflow-y-auto ${
                          errors[`${schedule.id}_endTime`]
                            ? "border-red-500 border"
                            : ""
                        } ${
                          !schedule.startTime || !schedule.intervalHours
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
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
                    </div>

                    <div className="flex items-center justify-end whitespace-nowrap">
                      <button
                        onClick={() => removeNewScheduleRow(schedule.id)}
                        className="w-7 h-7 bg-rose-500 rounded flex items-center justify-center cursor-pointer hover:bg-rose-600"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

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
            className="w-full md:w-44 px-5 py-4 rounded-[10px] outline outline-zinc-400 text-stone-200 text-sm font-semibold  capitalize cursor-pointer hover:bg-zinc-800 transition-colors"
            onClick={() => router.push("/admin/manage-studios")}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full md:flex-1 px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Studio"}
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-[10px] outline outline-neutral-700 max-w-md w-full p-6 relative">
            {/* Close */}
            <button
              onClick={closeDeleteModal}
              disabled={!!deleteLoading}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="text-stone-200 text-xl font-semibold  mb-4">
              Delete Sub-slot
            </h2>

            {/* Content */}
            <p className="text-neutral-300 text-sm  mb-6">
              Are you sure you want to delete this sub-slot? This action cannot
              be undone.
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={!!deleteLoading}
                className="flex-1 px-5 py-3 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-semibold  hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={confirmDeleteSubSlot}
                disabled={!!deleteLoading}
                className="flex-1 px-5 py-3 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  hover:bg-rose-600 cursor-pointer"
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudioById;
