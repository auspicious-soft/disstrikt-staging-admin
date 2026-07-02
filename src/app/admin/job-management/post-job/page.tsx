"use client";
import React, { useCallback, useState } from "react";
import { Calendar, TimerIcon, X } from "lucide-react";
import { LoadScript } from "@react-google-maps/api";
import LocationPickerModal from "../../../components/LocationPickerModal";
import { postCreateJob, uploadAnything } from "@/services/admin-services";
import { ADMIN_URLS } from "@/constants/apiUrls";
import Loader from "../../components/ui/Loader";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dumyImg from "../../../../../public/assets/LoginImg.jpg";
import { toast } from "sonner";
const libraries: "places"[] = ["places"];

interface LatLng {
  lat: number;
  lng: number;
}

const PostJob: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [tempMinAge, setTempMinAge] = useState<string>("");
  const [tempMaxAge, setTempMaxAge] = useState<string>("");
  const [selectedPosition, setSelectedPosition] = useState<LatLng | null>(null);
  const [jobImageFile, setJobImageFile] = useState<File | null>(null);
  const [jobImagePreview, setJobImagePreview] = useState<string | null>(null);
  const [uploadingJobImage, setUploadingJobImage] = useState(false);
  const [jobData, setJobData] = useState({
    title: "",
    branch: "",
    description: "",
    companyName: "",
    location: "",
    city: "",
    country: "",
    gender: "",
    minAge: "",
    maxAge: "",
    minHeightInCm: "",
    date: "",
    time: "",
    pay: "",
    countryCode: "",
    currency: "",
    ampm: "",
    timeZone: "",
    image: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const allowedCountries = ["GB", "NL", "BE", "ES", "FR"];
  const router = useRouter();
  const apiKey = "AIzaSyCDZoRf-BZL2yR_ZyXpzht_a63hMgLCTis";

  const debounce = <T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ) => {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const handleSelectLocation = (address: string, position: LatLng) => {
    console.log("Selected address:", address, "Position:", position);
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
            // Check for city in multiple possible types (prioritized order)
            if (!cityName) {
              if (component.types.includes("locality")) {
                cityName = component.long_name;
              } else if (component.types.includes("postal_town")) {
                // Common for UK addresses
                cityName = component.long_name;
              } else if (
                component.types.includes("administrative_area_level_2")
              ) {
                // Fallback for some UK locations
                cityName = component.long_name;
              } else if (component.types.includes("sublocality")) {
                // Additional fallback
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
              location: "Jobs can only be posted in UK, NL, BE, ES, or FR.",
            }));
            setJobData((prev) => ({
              ...prev,
              city: "",
              country: "",
              countryCode: "",
              location: "",
            }));
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

          setJobData((prev) => ({
            ...prev,
            city: cityName,
            country: countryName,
            countryCode: countryCode,
            location: address,
          }));
          setErrors((prev) => ({ ...prev, location: "" }));
        }
      });
    } catch (error) {
      console.error("Error getting city/country:", error);
      setErrors((prev) => ({ ...prev, location: "Error selecting location." }));
    }
  };

  const handleInputClick = () => {
    console.log(
      "Location input clicked. Current address:",
      selectedAddress,
      "Current position:",
      selectedPosition,
      "Modal open:",
      isModalOpen,
    );
    setIsModalOpen(true);
  };

  if (!apiKey) {
    console.error(
      "Google Maps API key is missing. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file.",
    );
  }

  const toYYYYMMDD = (value: string) => {
    if (!value) return "";
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return "";
    // normalize & return exactly as YYYY-MM-DD
    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  const parseTimeTo24Hour = (value: string) => {
    if (!value) return null;
    const [hStr, mStr] = value.split(":");
    const h = Number(hStr);
    if (Number.isNaN(h)) return null;
    return h; // just return the hour in 24h format (0–23)
  };

  const validateField = (name: string, value: string | number) => {
    if (value.toString().trim() === "") {
      return `${
        name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
      } is required`;
    }
    return "";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;

    if (name === "minAge" || name === "maxAge") {
      return;
    }

    setJobData((prev) => ({
      ...prev,
      [name]: ["minAge", "maxAge", "minHeightInCm", "pay"].includes(name)
        ? value === ""
          ? ""
          : Number(value)
        : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
    }));
  };

  const updateMinAge = useCallback((name: string, value: string) => {
    const minAgeMin = 0;
    const minAgeMax = 100;

    let finalValue: string | number = value;
    if (value !== "" && !isNaN(Number(value))) {
      const numValue = Number(value);
      if (numValue < minAgeMin) {
        finalValue = minAgeMin;
      } else if (numValue > minAgeMax) {
        finalValue = minAgeMax;
      } else {
        finalValue = numValue;
      }
    }

    setJobData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    setTempMinAge(finalValue.toString());
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, finalValue),
    }));
  }, []);

  const updateMaxAge = useCallback((name: string, value: string) => {
    const maxAgeMin = 0;
    const maxAgeMax = 100;

    let finalValue: string | number = value;
    if (value !== "" && !isNaN(Number(value))) {
      const numValue = Number(value);
      if (numValue < maxAgeMin) {
        finalValue = maxAgeMin;
      } else if (numValue > maxAgeMax) {
        finalValue = maxAgeMax;
      } else {
        finalValue = numValue;
      }
    }

    setJobData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
    setTempMaxAge(finalValue.toString());
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, finalValue),
    }));
  }, []);

  const debouncedUpdateMinAge = useCallback(
    debounce((name: string, value: string) => {
      updateMinAge(name, value);
    }, 500),
    [updateMinAge],
  );

  const debouncedUpdateMaxAge = useCallback(
    debounce((name: string, value: string) => {
      updateMaxAge(name, value);
    }, 500),
    [updateMaxAge],
  );

  const handleMinAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempMinAge(value); // Update temporary state immediately
    debouncedUpdateMinAge(name, value); // Debounced update for jobData
  };

  const handleMaxAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempMaxAge(value); // Update temporary state immediately
    debouncedUpdateMaxAge(name, value); // Debounced update for jobData
  };

  const handlePostJob = async () => {
    const requiredFields = {
      title: jobData.title,
      branch: jobData.branch,
      description: jobData.description,
      companyName: jobData.companyName,
      location: selectedAddress,
      city: jobData.city,
      country: jobData.country,
      gender: jobData.gender,
      minAge: jobData.minAge,
      maxAge: jobData.maxAge,
      minHeightInCm: jobData.minHeightInCm,
      date: jobData.date,
      time: jobData.time,
      // pay: jobData.pay,
      countryCode: jobData.countryCode,
      currency: jobData.currency,
    };

    const newErrors: Record<string, string> = {};
    Object.entries(requiredFields).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key] = error;
    });

    if (Number(jobData.minAge) === 0) {
      newErrors.minAge = "Minimum age cannot be 0";
    }
    if (Number(jobData.maxAge) === 0) {
      newErrors.maxAge = "Maximum age cannot be 0";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    let uploadedImageKey = "";
    if (jobImageFile) {
      const formData = new FormData();
      formData.append("file", jobImageFile);
      try {
        const imgResponse = await uploadAnything(
          ADMIN_URLS.UPLOAD_ANYTHING,
          formData,
        );
        if (imgResponse.status === 201) {
          uploadedImageKey = imgResponse.data.data.key;
        } else {
          toast.error("Image upload failed");
          setLoading(false);
          return;
        }
      } catch {
        toast.error("Error uploading image");
        setLoading(false);
        return;
      }
    }

    const hour12 = Number(jobData.time);
    const isPM = jobData.ampm === "PM";
    let hour24 = isPM ? (hour12 % 12) + 12 : hour12 % 12;
    if (hour24 === 0) hour24 = 24;

    const dateOnly = toYYYYMMDD(jobData.date);
    const timeHour = parseTimeTo24Hour(jobData.time); // e.g., "14:30" -> 14
    if (timeHour == null) {
      setErrors({ time: "Invalid time." });
      setLoading(false);
      return;
    }

    const payload = {
      en: {
        title: jobData.title,
        branch: jobData.branch,
        description: jobData.description,
        companyName: jobData.companyName,
        location: selectedAddress,
        city: jobData.city,
        country: jobData.country,
        gender: jobData.gender,
      },
      minAge: jobData.minAge,
      maxAge: jobData.maxAge,
      minHeightInCm: jobData.minHeightInCm,
      date: dateOnly,
      time: hour24,
      pay: jobData.pay,
      image: uploadedImageKey,
      countryCode: jobData.countryCode === "GB" ? "UK" : jobData.countryCode,
      currency: jobData.currency,
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    try {
      const response = await postCreateJob(`${ADMIN_URLS.POST_A_JOB}`, {
        ...payload,
      });
      if (response.status === 201) {
        console.log(response, "response");
        setJobData({
          title: "",
          branch: "",
          description: "",
          companyName: "",
          location: "",
          city: "",
          country: "",
          gender: "",
          minAge: "",
          maxAge: "",
          minHeightInCm: "",
          date: "",
          time: "",
          pay: "",
          countryCode: "",
          currency: "",
          ampm: "",
          timeZone: "",
          image: "",
        });
        setSelectedAddress("");
        setSelectedPosition(null);
        setErrors({});
        router.push("/admin/job-management");
      } else {
        setErrors({ general: "Error creating job." });
      }
    } catch (error) {
      setErrors({ general: "Error creating job." });
      console.log(error, "error");
    } finally {
      setLoading(false);
    }
  };

  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // move to tomorrow
    return today.toISOString().split("T")[0]; // format YYYY-MM-DD
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <LoadScript googleMapsApiKey={apiKey} libraries={libraries}>
            <div className="w-full flex flex-col justify-center items-start gap-10">
              {errors.general && (
                <div className="w-full text-red-500 text-sm font-light ">
                  {errors.general}
                </div>
              )}
              <div className="w-full flex flex-col md:flex-row justify-start items-start gap-10">
                <div className="flex-1 w-full flex flex-col justify-center items-start gap-5">
                  <div className="flex flex-col-reverse sm:flex-row w-full gap-4">
                    {/* Form fields - 2/3 width */}
                    <div className="w-full sm:w-2/3 flex flex-col gap-5">
                      {/* Job Title */}
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Job Title
                        </label>
                        <input
                          type="text"
                          placeholder="Job Title"
                          name="title"
                          value={jobData.title}
                          onChange={handleChange}
                          className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                            errors.title ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.title && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.title}
                          </span>
                        )}
                      </div>

                      {/* Job Branch */}
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Job Branch
                        </label>
                        <select
                          className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                            errors.branch ? "border-red-500 border" : ""
                          }`}
                          name="branch"
                          value={jobData.branch}
                          onChange={handleChange}
                        >
                          {/* <option value="">Select</option> */}
                          <option value="Model">Model</option>
                          <option value="Actor">Actor</option>
                          <option value="Content-creator">
                            Content-creator
                          </option>
                          <option value="Influencer">Influencer</option>
                          <option value="Affiliate-marketing">
                            Affiliate-marketing
                          </option>
                          <option value="Hosting">Hosting</option>
                          <option value="Dancing">Dancing</option>
                          <option value="Singing">Singing</option>
                          <option value="Artist">Artist</option>
                        </select>
                        {errors.branch && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.branch}
                          </span>
                        )}
                      </div>

                      {/* Job Description */}
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Job Description
                        </label>
                        <textarea
                          placeholder="Job Description"
                          name="description"
                          value={jobData.description}
                          onChange={handleChange}
                          className={`w-full px-4 pt-4 pb-14 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                            errors.description ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.description && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.description}
                          </span>
                        )}
                      </div>

                      {/* Company Name */}
                      <div className="w-full flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Name Of The Company
                        </label>
                        <input
                          type="text"
                          placeholder="Company Name"
                          name="companyName"
                          value={jobData.companyName}
                          onChange={handleChange}
                          className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                            errors.companyName ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.companyName && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.companyName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full sm:w-1/3 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Job Image
                      </label>

                      {/* Image preview or placeholder */}
                      <div className="w-full flex-1 min-h-[200px] sm:min-h-0 relative bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 overflow-hidden flex items-center justify-center">
                        {jobImagePreview ? (
                          <>
                            <img
                              src={jobImagePreview}
                              alt="Job preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              onClick={() => {
                                setJobImageFile(null);
                                setJobImagePreview(null);
                              }}
                              className="absolute top-2 right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-6 h-6 text-white" />
                            </button>
                          </>
                        ) : (
                          <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                setJobImageFile(file);
                                const reader = new FileReader();
                                reader.onloadend = () =>
                                  setJobImagePreview(reader.result as string);
                                reader.readAsDataURL(file);
                              }}
                            />
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center">
                              <span className="text-zinc-400 text-xl leading-none">
                                +
                              </span>
                            </div>
                            <span className="text-zinc-400 text-sm font-light ">
                              Choose Image
                            </span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Date & Time */}
                  <div className="w-full flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={jobData.date}
                        onChange={handleChange}
                        min={getTomorrowDate()}
                        onClick={(e) => e.currentTarget.showPicker()} // Trigger native date picker
                        className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                          errors.date ? "border-red-500 border" : ""
                        }`}
                      />
                      {errors.date && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.date}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select Time
                      </label>
                      <div className="flex gap-2 relative">
                        <select
                          name="time"
                          value={jobData.time}
                          onChange={handleChange}
                          className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                            errors.time ? "border-red-500 border" : ""
                          }`}
                        >
                          <option value="">Select Hour</option>{" "}
                          {/* placeholder */}
                          {Array.from({ length: 12 }, (_, i) => i + 1).map(
                            (h) => (
                              <option key={h} value={h.toString()}>
                                {h}
                              </option>
                            ),
                          )}
                        </select>

                        <select
                          name="ampm"
                          value={jobData.ampm || "AM"}
                          onChange={(e) =>
                            setJobData({ ...jobData, ampm: e.target.value })
                          }
                          className="w-28 p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light "
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>

                        <TimerIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5" />
                      </div>
                      {errors.time && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.time}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location & Country */}
                  <div className="w-full flex flex-col lg:flex-row gap-4">
                    <div className="w-full lg:basis-1/2 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select Location
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
                    <div className="w-full md:basis-1/4 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select Country
                      </label>
                      <input
                        className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  cursor-not-allowed ${
                          errors.country ? "border-red-500 border" : ""
                        }`}
                        name="country"
                        type="text"
                        value={jobData.country}
                        disabled
                        onChange={handleChange}
                      />
                      {errors.country && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.country}
                        </span>
                      )}
                    </div>
                    <div className="w-full md:basis-1/4 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select City
                      </label>
                      <input
                        className={`w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  cursor-not-allowed ${
                          errors.city ? "border-red-500 border" : ""
                        }`}
                        name="city"
                        type="text"
                        value={jobData.city}
                        disabled
                        onChange={handleChange}
                      />
                      {errors.city && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.city}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payout */}
                  <div className="w-full flex flex-col md:flex-row gap-4">
                    <div className="w-full md:basis-1/4 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Select Currency
                      </label>
                      <select
                        className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                          errors.currency ? "border-red-500 border" : ""
                        }`}
                        name="currency"
                        value={jobData.currency}
                        onChange={handleChange}
                      >
                        <option value="">Select</option>
                        <option value="eur">EUR</option>
                        <option value="gbp">GBP</option>
                      </select>
                      {errors.currency && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.currency}
                        </span>
                      )}
                    </div>
                    <div className="w-full md:basis-3/4 flex flex-col gap-2.5">
                      <label className="text-stone-200 text-xs font-light ">
                        Estimated Payout
                      </label>
                      <input
                        type="number"
                        placeholder="250"
                        name="pay"
                        value={jobData.pay}
                        onChange={handleChange}
                        className={`w-full p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-sm font-light  ${
                          errors.pay ? "border-red-500 border" : ""
                        }`}
                      />
                      {errors.pay && (
                        <span className="text-red-500 text-xs font-light ">
                          {errors.pay}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Eligibility */}
                  <div className="w-full p-4 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col gap-5">
                    <div className="text-stone-200 text-sm font-bold ">
                      Eligibility Criteria
                    </div>
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex-1 flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Minimum Age
                        </label>
                        <input
                          type="number"
                          placeholder="25+"
                          name="minAge"
                          value={tempMinAge}
                          onChange={handleMinAgeChange}
                          className={`p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-bold  ${
                            errors.minAge ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.minAge && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.minAge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Maximum Age
                        </label>
                        <input
                          type="number"
                          placeholder="25+"
                          name="maxAge"
                          value={tempMaxAge}
                          onChange={handleMaxAgeChange}
                          className={`p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-bold  ${
                            errors.maxAge ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.maxAge && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.maxAge}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Minimum Height (cm)
                        </label>
                        <input
                          type="text"
                          placeholder="180"
                          name="minHeightInCm"
                          value={jobData.minHeightInCm}
                          onChange={handleChange}
                          className={`p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-bold  ${
                            errors.minHeightInCm ? "border-red-500 border" : ""
                          }`}
                        />
                        {errors.minHeightInCm && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.minHeightInCm}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col gap-2.5">
                        <label className="text-stone-200 text-xs font-light ">
                          Gender
                        </label>
                        <select
                          className={`p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-stone-200 text-sm font-bold  ${
                            errors.gender ? "border-red-500 border" : ""
                          }`}
                          name="gender"
                          value={jobData.gender}
                          onChange={handleChange}
                        >
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                          <option value="BOTH">Both</option>
                        </select>
                        {errors.gender && (
                          <span className="text-red-500 text-xs font-light ">
                            {errors.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="w-full flex flex-col md:flex-row gap-2.5">
                    <button
                      className="w-full md:w-44 px-5 py-4 rounded-[10px] outline outline-zinc-400 text-stone-200 text-sm font-semibold  capitalize cursor-pointer"
                      onClick={() => router.push("/admin/job-management")}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handlePostJob}
                      className="w-full md:flex-1 px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize cursor-pointer"
                      disabled={loading}
                    >
                      {loading ? "Posting..." : "Post Job"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </LoadScript>
        </>
      )}
    </>
  );
};

export default PostJob;
