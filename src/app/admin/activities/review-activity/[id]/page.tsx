"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import { toast } from "sonner";
import Loader from "../../../components/ui/Loader";
import { ChevronDown, X } from "lucide-react";
import {
  getActivityById,
  uploadAnything,
  reviewActivity,
} from "@/services/admin-services";

interface AddOnFeature {
  key: string;
  value: number;
}

interface ActivityData {
  _id: string;
  userId?: {
    _id?: string;
    fullName?: string;
    phone?: string;
    email?: string;
  };
  studioId?: {
    _id?: string;
    name?: string;
    location?: string;
    city?: string;
    country?: string;
  };
  activityType?: string;
  date?: string;
  startTime?: string;
  endtime?: string;
  time?: string;
  slot?: string;
  status?: string;
  attended?: boolean | null;
  activity?: string | null;
  rating?: number;
  comments?: string | null;
  images?: string[];
  shootFormat?: string;
  shootGoals?: string;
  vibes?: string;
  canBringOutfits?: number;
  addOnFeatures?: AddOnFeature[];
  createdAt?: string;
  updatedAt?: string;
}

interface UserData {
  _id: string;
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  profilePicture?: string;
}

const ReviewActivity: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const slotId = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [wasPresent, setWasPresent] = useState<boolean | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [rating, setRating] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);

  const fetchActivityDetails = async () => {
    if (!slotId) {
      toast.error("Activity ID not found");
      router.push("/admin/activities");
      return;
    }

    setLoading(true);
    try {
      const activityResponse = await getActivityById(
        `${ADMIN_URLS.GET_ACTIVITY_BY_ID}?slotId=${slotId}`,
      );

      if (activityResponse?.data?.success && activityResponse?.data?.data) {
        const data = activityResponse?.data?.data;
        setActivityData(data);

        if (data.attended !== null && data.attended !== undefined) {
          if (typeof data.attended === "string") {
            setWasPresent(data.attended === "Yes");
          } else if (typeof data.attended === "boolean") {
            setWasPresent(data.attended);
          }
        }

        if (data.images && data.images.length > 0) {
          console.log("Original images from API:", data.images);

          const imageUrls = data.images.map((img: string) => {
            if (img.startsWith("http://") || img.startsWith("https://")) {
              console.log("Image is already a full URL:", img);
              return img;
            }
            const fullUrl = `${BASE_IMG_URL || ""}${img}`;
            console.log("Constructed full URL:", fullUrl);
            return fullUrl;
          });

          console.log("Final image URLs:", imageUrls);
          setUploadedImages(imageUrls);
        }

        if (data.rating && data.rating > 0) {
          setRating(data.rating.toString());
        }

        if (data.comments) {
          setComments(data.comments);
        }
      }
    } catch (error) {
      console.error("Error fetching activity:", error);
      toast.error("Error loading activity details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slotId) {
      fetchActivityDetails();
    } else {
      toast.error("Activity ID not found in URL");
      router.push("/admin/activities");
    }
  }, [slotId]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    setImageFiles((prev) => [...prev, ...filesArray]);

    // Create preview URLs
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadAnything(
        ADMIN_URLS.UPLOAD_ANYTHING,
        formData,
      );

      if (response.status === 201) {
        const fileKey = response.data.data.key;
        return fileKey;
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const uploadAllImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadPromises = imageFiles.map((file) => uploadFile(file));

    try {
      const results = await Promise.allSettled(uploadPromises);

      const successfulUploads: string[] = [];
      let failedCount = 0;

      results.forEach((result, index) => {
        if (result.status === "fulfilled" && result.value) {
          successfulUploads.push(result.value);
        } else {
          failedCount++;
          console.error(`Failed to upload image ${index + 1}`);
        }
      });

      if (failedCount > 0) {
        toast.warning(
          `${failedCount} image(s) failed to upload, but ${successfulUploads.length} succeeded`,
        );
      } else if (successfulUploads.length > 0) {
        toast.success("All images uploaded successfully");
      }

      return successfulUploads;
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Error uploading images");
      return [];
    } finally {
      setUploadingImages(false);
    }
  };

  const handleSubmit = async () => {
    if (wasPresent === null) {
      toast.error("Please select if the model was present");
      return;
    }

    if (wasPresent === true) {
      if (imageFiles.length === 0 && uploadedImages.length === 0) {
        toast.error("Please upload at least one image");
        return;
      }

      if (!rating) {
        toast.error("Please select a rating");
        return;
      }
      if (!comments.trim()) {
        toast.error("Please add comments");
        return;
      }
    }

    setSubmitLoading(true);
    try {
      let imageUrls: string[] = [];

      if (wasPresent === true && imageFiles.length > 0) {
        imageUrls = await uploadAllImages();

        if (imageUrls.length === 0 && imageFiles.length > 0) {
          toast.error("Failed to upload images. Please try again.");
          setSubmitLoading(false);
          return;
        }
      }

      const payload: any = {
        slotId: slotId,
        attended: wasPresent ? "Yes" : "No",
        // comments: comments.trim(),
      };

      if (wasPresent === true) {
        payload.rating = Number(rating);
        payload.images = imageUrls;
        payload.comments = comments.trim();
      } else {
        payload.images = [];
        payload.comments = null;
      }

      const response = await reviewActivity(
        ADMIN_URLS.REVIEW_ACTIVITY,
        payload,
      );

      if (response?.data?.success || response.status === 200) {
        toast.success("Activity reviewed successfully!");
        router.push("/admin/activities");
      } else {
        toast.error(response?.data?.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Error submitting review");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!activityData) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="text-red-500 text-lg ">Activity not found</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col justify-start items-start gap-10">
      {/* Header */}
      <div className="w-full">
        <h1 className="text-stone-200 text-2xl font-semibold ">
          Review Activity
        </h1>
      </div>

      {/* Activity Details Card */}
      <div className="w-full inline-flex flex-col justify-start items-start gap-2.5">
        <div className="justify-start text-stone-200 text-base font-semibold ">
          Activity Details
        </div>
        <div className="w-full p-4 bg-zinc-800 rounded-[10px] border-r-2 border-b-2 border-stone-700 flex flex-col justify-start items-start gap-5">
          {/* Row 1: Model Name & Activity Type */}
          <div className="w-full inline-flex justify-start items-center gap-10">
            <div className="flex-1 flex justify-start items-center gap-1.5">
              <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                <div className="justify-start text-stone-200 text-xs font-light ">
                  Model Name
                </div>
                <div className="justify-start text-stone-200 text-sm font-extrabold ">
                  {activityData?.userId?.fullName || "-"}
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-start items-center gap-1.5">
              <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                <div className="justify-start text-stone-200 text-xs font-light ">
                  Activity Type
                </div>
                <div className="justify-start text-stone-200 text-sm font-extrabold ">
                  {activityData?.activityType || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Phone Number & Email Address */}
          <div className="w-full inline-flex justify-start items-center gap-10">
            <div className="flex-1 flex justify-start items-center gap-1.5">
              <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                <div className="justify-start text-stone-200 text-xs font-light ">
                  Phone Number
                </div>
                <div className="justify-start text-stone-200 text-sm font-extrabold ">
                  {activityData?.userId?.phone || "-"}
                </div>
              </div>
            </div>
            <div className="flex-1 flex justify-start items-center gap-1.5">
              <div className="flex-1 inline-flex flex-col justify-center items-start gap-2.5">
                <div className="justify-start text-stone-200 text-xs font-light ">
                  Email Address
                </div>
                <div className="justify-start text-stone-200 text-sm font-extrabold  break-all">
                  {activityData?.userId?.email || "-"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <div className="w-full inline-flex flex-col justify-start items-start gap-2.5">
        <div className="w-full flex flex-col justify-start items-start gap-2.5">
          <div className="justify-start text-stone-200 text-base font-semibold ">
            Review Activity
          </div>
        </div>

        <div className="w-full flex flex-col justify-start items-start gap-4">
          {/* Was Present? */}
          <div className="w-full inline-flex justify-start items-start gap-2.5">
            <div className="flex-1 inline-flex flex-col justify-start items-start gap-2.5">
              <div className="justify-start text-stone-200 text-xs font-light ">
                Was Present?
              </div>
              <div className="w-full inline-flex justify-start items-start gap-12 flex-wrap content-start">
                {/* Yes Option */}
                <div
                  className="flex justify-start items-center gap-1.5 cursor-pointer"
                  onClick={() => setWasPresent(true)}
                >
                  <div className="w-5 h-5 relative bg-neutral-800 rounded-[99px] overflow-hidden flex items-center justify-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        wasPresent === true ? "bg-rose-400" : "bg-stone-700"
                      }`}
                    />
                  </div>
                  <div className="justify-start text-zinc-400 text-sm font-light ">
                    Yes, was present.
                  </div>
                </div>

                {/* No Option */}
                <div
                  className="flex justify-start items-center gap-1.5 cursor-pointer"
                  onClick={() => setWasPresent(false)}
                >
                  <div className="w-5 h-5 relative bg-neutral-800 rounded-[99px] overflow-hidden flex items-center justify-center">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        wasPresent === false ? "bg-rose-400" : "bg-stone-700"
                      }`}
                    />
                  </div>
                  <div className="justify-start text-zinc-400 text-sm font-light ">
                    No, did not show up
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Images - Only show if model was present */}
          {wasPresent === true && (
            <div className="w-full flex flex-col justify-start items-start gap-1">
              <div className="justify-start text-stone-200 text-xs font-light ">
                Upload Images {uploadingImages && "(Uploading...)"}
              </div>
              <div className="inline-flex justify-start items-start gap-1.5 flex-wrap">
                {/* Show already uploaded images from server */}
                {uploadedImages.map((img, index) => (
                  <div
                    key={`uploaded-${index}`}
                    className="w-32 h-32 rounded-[10px] border border-stone-700 overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}

                {/* Show preview of newly selected images */}
                {imagePreviewUrls.map((img, index) => (
                  <div
                    key={`preview-${index}`}
                    className="w-32 h-32 rounded-[10px] border border-stone-700 overflow-hidden relative group"
                  >
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}

                {/* Add More Button */}
                <label className="w-32 h-32 p-4 bg-zinc-900/80 rounded-[10px] outline-1 outline-offset-[-1px] outline-neutral-700 flex flex-col justify-center items-center gap-2.5 cursor-pointer hover:bg-zinc-800 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                  <div className="w-2 h-2 bg-zinc-400 outline-1 outline-offset-[-0.50px] outline-neutral-800" />
                  <div className="justify-start text-zinc-400 text-sm font-light ">
                    Add More
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Rate Activity - Only show if model was present */}
          {wasPresent === true && (
            <div className="w-full flex flex-col justify-start items-start gap-1.5">
              <div className="justify-start text-stone-200 text-xs font-light ">
                Rate Activity
              </div>
              <div className="w-full relative">
                <div
                  className="w-full px-4 py-3.5 bg-zinc-900/80 rounded-[10px] outline-1 outline-offset-[-1px] outline-neutral-700 inline-flex justify-between items-center cursor-pointer"
                  onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                >
                  <div className="justify-start text-zinc-400 text-sm font-light ">
                    {rating || "Select rating"}
                  </div>
                  <ChevronDown className="w-5 h-5 text-stone-200" />
                </div>

                {isRatingDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 rounded-[10px] outline-1 outline-neutral-700 overflow-hidden z-10">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <div
                        key={num}
                        className="px-4 py-3 text-zinc-400 text-sm font-light  hover:bg-zinc-800 cursor-pointer"
                        onClick={() => {
                          setRating(num.toString());
                          setIsRatingDropdownOpen(false);
                        }}
                      >
                        {num}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {wasPresent === true && (
            <div className="w-full flex flex-col justify-start items-start gap-2.5">
              <div className="w-full flex flex-col justify-start items-start gap-1.5">
                <div className="justify-start text-stone-200 text-xs font-light ">
                  Comments
                </div>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add your comments here..."
                  className="w-full px-4 pt-4 pb-14 bg-zinc-900/80 rounded-[10px] outline-1 outline-offset-[-1px] outline-neutral-700 text-zinc-400 text-sm font-light  resize-none"
                  rows={4}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="w-full flex flex-col md:flex-row gap-2.5">
        <button
          className="w-full md:w-44 px-5 py-4 rounded-[10px] outline outline-zinc-400 text-stone-200 text-sm font-semibold  capitalize cursor-pointer hover:bg-zinc-800 transition-colors"
          onClick={() => router.push("/admin/activities")}
          disabled={submitLoading || uploadingImages}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full md:flex-1 px-5 py-4 bg-rose-500 rounded-[10px] text-white text-sm font-semibold  capitalize cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:bg-rose-600 transition-colors"
          disabled={submitLoading || uploadingImages}
        >
          {submitLoading
            ? "Submitting..."
            : uploadingImages
              ? "Uploading Images..."
              : "Submit Review"}
        </button>
      </div>
    </div>
  );
};

export default ReviewActivity;
