"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getUserTaskById, rateTask } from "@/services/admin-services";
import { ADMIN_URLS, BASE_IMG_URL } from "@/constants/apiUrls";
import { toast } from "sonner";
import Link from "next/link";

interface TaskData {
  _id: string;
  userId: string;
  taskId: string;
  appReview: boolean;
  checkBox: Record<string, any>;
  input: Record<string, any>;
  isActive: boolean;
  milestone: number;
  quiz: any[];
  rating: number;
  taskNumber: number;
  taskReviewed: boolean;
  text: string;
  uploadLinks: string[];
  createdAt: string;
  updatedAt: string;
}

const ReviewTaskById: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.id as string;

  const [rating, setRating] = useState("0");
  const [comment, setComment] = useState("");
  const [taskData, setTaskData] = useState<TaskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainRole] = useState("ADMIN");
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const fetchTaskData = async () => {
      if (!taskId) {
        setError("Task ID not found");
        setLoading(false);
        return;
      }

      try {
        const response = await getUserTaskById(
          `${ADMIN_URLS.GET_USER_TASK_BY_ID}/${taskId}`
        );
        if (response.status === 200) {
          setTaskData(response.data.data);
        } else {
          toast.error("Failed to fetch task data");
          setError("Failed to fetch task data");
        }
      } catch (err) {
        console.error("Error fetching task:", err);
        toast.error("Error fetching task details");
        setError("Error fetching task details");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [taskId]);

  const handleCancel = () => {
    router.back();
  };

  const handleSave = async () => {
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }

    setIsSaving(true);
    try {
      const payload = { rating: Number(rating), comment };
      const response = await rateTask(
        `${ADMIN_URLS.RATE_TASK}/${taskId}`,
        payload
      );

      if (response.status === 200) {
        toast.success("Rating saved successfully");
        router.back();
      } else {
        toast.error("Failed to save rating");
      }
    } catch (err) {
      console.error("Error saving rating:", err);
      toast.error("Error saving rating");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!taskData) return <div>No task data found</div>;

  return (
    <section className="w-full max-w-6xl mx-auto flex flex-col gap-6 sm:gap-7 px-4 sm:px-6 lg:px-8">
      <div className="w-full flex flex-col gap-6 sm:gap-8">
        {/* Task Info */}
        <div className="w-full flex flex-col gap-4">
          <h2 className="text-stone-200 text-sm sm:text-base font-extrabold">
            Task {taskData.taskNumber}
          </h2>
          <p className="text-stone-200 text-xs sm:text-sm font-light">
            {taskData.text || "No description available"}
          </p>
        </div>

       {
        mainRole && mainRole === "ADMIN" &&(
           <div className="w-full flex flex-col gap-4">
          <Link href={`/admin/user-management/${taskData.userId}`} className="text-blue-500 hover:underline">
            View User
          </Link>
        </div>
        )
       }

        {/* Uploaded Links */}
        {taskData.uploadLinks && taskData.uploadLinks.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-stone-200 text-sm sm:text-base font-semibold">
              Uploaded Links
            </h3>
            <ul className="list-disc list-inside space-y-1">
              {taskData.uploadLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={`${BASE_IMG_URL}${link}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-400 underline text-xs sm:text-sm"
                  >
                    {`${BASE_IMG_URL}${link}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rating + Comment */}
        <div className="flex flex-col gap-4 sm:gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-stone-200 text-xs sm:text-sm font-medium">
              Rate This Task
            </label>
            <select
              value={rating || taskData.rating.toString()}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-3 sm:p-4 bg-white rounded-[10px] outline outline-offset-[-1px] outline-rose-200 text-zinc-500 text-xs sm:text-sm font-light"
            >
              <option value="0">0</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between">
              <label className="text-stone-200 text-xs sm:text-sm font-medium">
                Add Comment
              </label>
              <span className="text-stone-200 text-xs sm:text-sm">
                Optional
              </span>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Text here"
              className="w-full h-28 sm:h-32 p-3 sm:p-4 bg-white rounded-[10px] outline outline-offset-[-1px] outline-rose-200 text-zinc-500 text-xs sm:text-sm font-light resize-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleCancel}
            className="w-full sm:flex-1 px-5 py-3 sm:py-4 rounded-[10px] outline outline-offset-[-1px] outline-zinc-400 cursor-pointer"
            disabled={isSaving}
          >
            <span className="text-stone-200 text-sm sm:text-base font-semibold">
              Cancel
            </span>
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:flex-1 px-5 py-3 sm:py-4 bg-rose-500 rounded-[10px] text-white disabled:opacity-50 cursor-pointer"
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReviewTaskById;
