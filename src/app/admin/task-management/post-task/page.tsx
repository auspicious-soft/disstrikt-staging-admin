"use client";
import React, { useState, ChangeEvent } from "react";
import { X } from "lucide-react";
import { ADMIN_URLS } from "@/constants/apiUrls";
import {
  addUpdateDeleteCheckbox,
  deleteQuiz,
  postTask,
  updateQuizTask,
  updateTaskDetails,
  uploadAnything,
} from "@/services/admin-services";
import { toast } from "sonner";
import { Router } from "next/router";
import { useRouter } from "next/navigation";

interface QuizQuestion {
  title: string;
  options: string[];
  correctOption: number | null;
  _id?: string;
}

interface TaskForm {
  title: string;
  reviewType: string;
  taskTypes: string[];
  description: string;
  file: File | null;
  answerType: string;
  checklistOptions: string[];
  link: string;
  downloadFile: File | null;
  video: File | null;
  quizQuestions: QuizQuestion[];
}

// interface CheckBox {}

interface TaskForm {
  title: string;
  reviewType: string;
  taskTypes: string[];
  description: string;
  file: File | null;
  answerType: string;
  checklistOptions: string[];
  link: string;
  downloadFile: File | null;
  video: File | null;
  quizQuestions: QuizQuestion[];
  checkbox?: any;
  count: number;
  subject: string;
}

const TaskManagement: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fileKey, setFileKey] = useState("");
  const [selectedDownloadFileType, setSelectedDownloadFileType] = useState<
    "image" | "video" | "file" | null
  >(null); // Track which DOWNLOAD_FILE input is selected
  const router = useRouter()
  const [formData, setFormData] = useState<TaskForm>({
    title: "",
    reviewType: "Manual",
    taskTypes: [],
    description: "",
    file: null,
    answerType: "",
    checklistOptions: ["Option 1", "Option 2", "Option 3", "Option 4"],
    link: "",
    downloadFile: null,
    video: null,
    quizQuestions: [
      {
        title: "",
        options: ["Option 1", "Option 2", "Option 3", "Option 4"],
        correctOption: null,
      },
    ],
    count: 0,
    subject: "",
  });

  // const taskTypeOptions = [
  //   "JOB_APPLY",
  //   "PROFILE_PIC",
  //   "PORT_IMAGE",
  //   "PORT_BIO",
  //   "LINK",
  //   "TEXT",
  //   "WATCH_VIDEO",
  //   "DOWNLOAD_FILE",
  //   "JOB_SELECTED",
  //   "CHECK_BOX",
  //   "UPLOAD",
  //   "QUIZ",
  //   "SET_CARD",
  //   "PORT_INTRO_VIDEO",
  //   "CALENDLY",
  // ];

    const taskTypeOptions = [
    "LINK",
    "TEXT",
    "WATCH_VIDEO",
    "DOWNLOAD_FILE",
    "JOB_SELECTED",
    "CHECK_BOX",
    "QUIZ",
    "CALENDLY",
  ];

  // Handle select changes
  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTaskTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      taskTypes: [type], // always replace with the clicked type
    }));
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      reviewType: "Manual",
      taskTypes: [],
      description: "",
      file: null,
      answerType: "",
      checklistOptions: ["Option 1", "Option 2", "Option 3", "Option 4"],
      link: "",
      downloadFile: null,
      video: null,
      quizQuestions: [
        {
          title: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: null,
        },
      ],
      count: 0,
      subject: "",
    });
        router.push("/admin/task-management")

  };

  // Handle input and textarea changes
  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: "file" | "downloadFile" | "video",
    downloadFileType?: "image" | "video" | "file"
  ) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, [field]: file }));
    if (field === "downloadFile" && file) {
      setSelectedDownloadFileType(downloadFileType || null);
    } else if (field === "downloadFile" && !file) {
      setSelectedDownloadFileType(null); // Reset when file is removed
    }
  };

const handleRemoveFile = (field: "file" | "downloadFile" | "video") => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    if (field === "downloadFile") {
      setSelectedDownloadFileType(null); // Show all DOWNLOAD_FILE inputs again
    }
    setFileKey(""); // Clear uploaded file key
  };
  // Handle checklist option changes
const handleChecklistOptionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newOptions = [...prev.checklistOptions];
      newOptions[index] = value;
      return { ...prev, checklistOptions: newOptions };
    });
  };

  // Add new checklist option
  const addChecklistOption = () => {
    setFormData((prev) => ({
      ...prev,
      checklistOptions: [
        ...prev.checklistOptions,
        `Option ${prev.checklistOptions.length + 1}`,
      ],
    }));
  };

    // Remove checklist option
  const removeChecklistOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      checklistOptions: prev.checklistOptions.filter((_, i) => i !== index),
    }));
  };

  const handleQuizQuestionChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newQuestions = [...prev.quizQuestions];
      newQuestions[index] = { ...newQuestions[index], title: value };
      return { ...prev, quizQuestions: newQuestions };
    });
  };

  const handleQuizOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setFormData((prev) => {
      const newQuestions = [...prev.quizQuestions];
      const newOptions = [...newQuestions[questionIndex].options];
      newOptions[optionIndex] = value;
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newOptions,
      };
      return { ...prev, quizQuestions: newQuestions };
    });
  };

  const handleQuizCorrectOptionChange = (
    questionIndex: number,
    optionIndex: number
  ) => {
    setFormData((prev) => {
      const newQuestions = [...prev.quizQuestions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        correctOption: optionIndex,
      };
      return { ...prev, quizQuestions: newQuestions };
    });
  };

  // Add new quiz question
  const addQuizQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        {
          title: "",
          options: ["Option 1", "Option 2", "Option 3", "Option 4"],
          correctOption: null,
        },
      ],
    }));
  };

  // Remove quiz question
const removeQuizQuestion = async (index: number) => {
    const question = formData.quizQuestions[index];
    // For creation, since no _id yet, just remove locally
    setFormData((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((_, i) => i !== index),
    }));
  };



 const updateTaskCheckbox = async (taskId: string, checkboxOptions: string[]) => {
    try {
      const response = await addUpdateDeleteCheckbox(
        `${ADMIN_URLS.ADD_UPDATE_DELETE_CHECKBOX}`,
        {
          taskId,
          checkbox: checkboxOptions,
        }
      );

      if (response.status === 200) {
        toast.success("Checkbox options updated successfully");
        return response.data;
      } else {
        throw new Error("Failed to update checkbox options");
      }
    } catch (error) {
      console.error("Error updating checkbox options:", error);
      toast.error("Failed to update checkbox options");
      throw error;
    }
  };

  const uploadFile = async (file: File) => {
    if (!file) {
      toast.error("No file selected for upload");
      throw new Error("No file selected");
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await uploadAnything(
        ADMIN_URLS.UPLOAD_ANYTHING,
        formData
      );

      if (response.status === 201) {
        toast.success("File uploaded successfully");
        const fileData = response.data.data.key;
        setFileKey(fileData);
        return fileData; // Return the URL key
      } else {
        throw new Error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
      throw error;
    }
  };

 const handleCreateTask = async () => {
    setLoading(true);
     const missingFields: string[] = [];
  if (!formData.title.trim()) missingFields.push("Title");
  if (!formData.taskTypes || formData.taskTypes.length === 0) missingFields.push("Task Type");
  if (!formData.answerType.trim()) missingFields.push("Answer Type");

  if (missingFields.length > 0) {
    toast.error(`${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required to create a task`);
    setLoading(false);
    return;
  }

    const taskType = formData.taskTypes[0] || "";

    
   if (taskType === "QUIZ") {
    for (let i = 0; i < formData.quizQuestions.length; i++) {
      const question = formData.quizQuestions[i];
      if (!question.title.trim()) {
        toast.error(`Quiz Question ${i + 1}: Title is required`);
        setLoading(false);
        return;
      }
      if (question.correctOption === null) {
        toast.error(`Quiz Question ${i + 1}: Correct Option is required`);
        setLoading(false);
        return;
      }
    }
  }
    try {
      let link: string[] = formData.link ? [formData.link] : [];

      // Check if there's a file to upload (file, downloadFile, or video)
      const fileToUpload =
        formData.file || formData.downloadFile || formData.video;
      if (fileToUpload) {
        const uploadedFileKey = await uploadFile(fileToUpload);
        link = [uploadedFileKey]; // Override with uploaded key
      }

      const taskType = formData.taskTypes[0] || "";

      const payload = {
        newMilestone: false,
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        taskType,
        answerType: formData.answerType,
        link,
        count: formData.count,
      };

      const response = await postTask(ADMIN_URLS.CREATE_TASK, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Task Created Successfully");
        const taskId = response.data.data._id;

        // Handle CHECK_BOX
        if (taskType === "CHECK_BOX") {
          await updateTaskCheckbox(taskId, formData.checklistOptions);
        }

        // Handle QUIZ
        if (taskType === "QUIZ") {
          const quizPayload = {
            taskId: taskId,
            quiz: formData.quizQuestions.map((question, index) => ({
              taskId: taskId,
              question: question.title,
              option_A: question.options[0],
              option_B: question.options[1],
              option_C: question.options[2],
              option_D: question.options[3],
              questionNumber: index + 1,
              answer:
                question.correctOption !== null
                  ? `option_${String.fromCharCode(65 + question.correctOption)}`
                  : null,
            })),
          };

          const quizResponse = await updateQuizTask(
            `${ADMIN_URLS.ADD_UPDATE_QUIZ}/${taskId}`,
            quizPayload
          );

          if (quizResponse.status === 200) {
            toast.success("Quiz updated successfully");
          } else {
            toast.error("Failed to save quiz");
          }
        }

        handleCancel(); // Reset form after successful creation
        router.push("/admin/task-management")
      } else {
        toast.error("Error Creating Task");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error("Error Creating Task");
    } finally {
      setLoading(false);
    }
  };

return (
  <div className="w-full flex flex-col justify-center items-start gap-6 sm:gap-8 lg:gap-10">
    {/* Form Sections */}
    <div className="w-full flex flex-col justify-start items-start gap-4 sm:gap-5">
      {/* Basic Details */}
      <div className="w-full flex flex-col justify-start items-start gap-3 sm:gap-4">
        <h2 className="text-stone-200 text-sm sm:text-base lg:text-lg font-semibold">
          Basic Details
        </h2>
        <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-3 sm:gap-4">
          {/* Title Input */}
          <div className="w-full lg:flex-1 flex flex-col justify-start items-start gap-2 sm:gap-2.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Title of Task
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Title"
              className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light"
            />
          </div>
          <div className="w-full lg:flex-1 flex flex-col justify-start items-start gap-2 sm:gap-2.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              placeholder="Subject"
              className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light"
            />
          </div>
          {/* Review Type Dropdown (Disabled) */}
          <div className="w-full lg:w-72 flex flex-col justify-start items-start gap-2 sm:gap-2.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Review Type
            </label>
            <div className="w-full p-3 sm:p-4 bg-zinc-800 rounded-[10px] outline outline-neutral-700 flex justify-between items-center">
              <span className="text-zinc-400 text-xs sm:text-sm font-light">Manual</span>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 -rotate-90 opacity-50 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Task Details */}
      <div className="w-full flex flex-col justify-start items-start gap-3 sm:gap-4">
        <h2 className="text-stone-200 text-sm sm:text-base lg:text-lg font-semibold">
          Task Details
        </h2>
        {/* Task Type Multi-select Radio Buttons */}
        <div className="w-full flex flex-col justify-start items-start gap-2 sm:gap-2.5">
          <label className="text-stone-200 text-xs sm:text-sm font-light ">
            Task Type
          </label>
          <div className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {taskTypeOptions.map((type) => (
              <div
                key={type}
                className="flex justify-start items-center gap-1.5 min-w-0 cursor-pointer"
                  onClick={() => handleTaskTypeChange(type)}
              >
                <div
                  className={`w-4 h-4 sm:w-5 sm:h-5 bg-zinc-800 rounded-full flex items-center justify-center flex-shrink-0 ${
                    formData.taskTypes.includes(type) ? "bg-rose-400" : ""
                  }`}
                  onClick={() => handleTaskTypeChange(type)}
                >
                  {formData.taskTypes.includes(type) && (
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full" />
                  )}
                </div>
                <span className="text-zinc-400 text-xs sm:text-sm font-light truncate">
                  {type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Fields Based on Task Type */}
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label className="text-stone-200 text-xs sm:text-sm font-light">
            Task Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Job Title"
            className="w-full px-3 sm:px-4 pt-3 sm:pt-4 pb-12 sm:pb-14 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light min-h-[120px] resize-y"
          />
        </div>

        {["JOB_APPLY", "JOB_SELECTED"].includes(
          formData?.taskTypes[0] || ""
        ) && (
          <div className="flex-1 w-full flex flex-col justify-start items-start gap-2 sm:gap-2.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Number of Count
            </label>
            <input
              type="number"
              name="count"
              value={formData.count}
              onChange={handleInputChange}
              placeholder="Count"
              className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light"
            />
          </div>
        )}

        {formData.taskTypes.includes("CHECK_BOX") && (
          <div className="w-full flex flex-col justify-start items-start gap-1.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Checklist Options
            </label>
            <div className="w-full p-3 sm:p-4 rounded-[10px] outline outline-neutral-700 flex flex-col justify-start items-start gap-3 sm:gap-4 lg:gap-5">
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-2.5 sm:gap-3">
                {formData.checklistOptions.map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex flex-col justify-start items-start gap-[5px]"
                  >
                    <div className="w-full flex items-center relative">
                      <input
                        type="text"
                        value={option}
                        onChange={(e) =>
                          handleChecklistOptionChange(
                            optionIndex,
                            e.target.value
                          )
                        }
                        className="w-full px-3 sm:px-4 py-3 sm:py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light pr-8 sm:pr-10"
                      />
                      <button
                        onClick={() =>
                          removeChecklistOption(optionIndex)
                        }
                        className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center"
                      >
                        <X className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4 text-zinc-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex w-full justify-start">
                <button
                  onClick={addChecklistOption}
                  className="text-blue-500 text-sm sm:text-base font-normal leading-tight"
                >
                  + Add another Option
                </button>
              </div>
            </div>
          </div>
        )}

        {formData.taskTypes.includes("WATCH_VIDEO") && (
          <div className="w-full flex flex-col justify-start items-start gap-1.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Upload Video
            </label>
            {formData.video ? (
              <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                <span className="text-zinc-400 text-xs sm:text-sm break-all flex-1">
                  {formData.video.name}
                </span>
                <button
                  onClick={() => handleRemoveFile("video")}
                  className="text-red-500 text-xs sm:text-sm cursor-pointer hover:text-red-400 flex-shrink-0"
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileChange(e, "video")}
                className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300"
              />
            )}
          </div>
        )}

        {formData.taskTypes.includes("DOWNLOAD_FILE") && (
          <div className="w-full flex flex-col justify-start items-start gap-3 sm:gap-4">
            {(!selectedDownloadFileType ||
              selectedDownloadFileType === "image") && (
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-stone-200 text-xs sm:text-sm font-light">
                  Upload Image
                </label>
                {formData.downloadFile &&
                selectedDownloadFileType === "image" ? (
                  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-400 text-xs sm:text-sm break-all flex-1">
                      {formData.downloadFile.name}
                    </span>
                    <button
                      onClick={() => handleRemoveFile("downloadFile")}
                      className="text-red-500 text-xs sm:text-sm cursor-pointer hover:text-red-400 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e, "downloadFile", "image")
                    }
                    className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300"
                  />
                )}
              </div>
            )}

            {(!selectedDownloadFileType ||
              selectedDownloadFileType === "video") && (
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-stone-200 text-xs sm:text-sm font-light">
                  Upload Video
                </label>
                {formData.downloadFile &&
                selectedDownloadFileType === "video" ? (
                  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-400 text-xs sm:text-sm break-all flex-1">
                      {formData.downloadFile.name}
                    </span>
                    <button
                      onClick={() => handleRemoveFile("downloadFile")}
                      className="text-red-500 text-xs sm:text-sm cursor-pointer hover:text-red-400 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      handleFileChange(e, "downloadFile", "video")
                    }
                    className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300"
                  />
                )}
              </div>
            )}

            {(!selectedDownloadFileType ||
              selectedDownloadFileType === "file") && (
              <div className="w-full flex flex-col gap-1.5">
                <label className="text-stone-200 text-xs sm:text-sm font-light">
                  Upload File
                </label>
                {formData.downloadFile &&
                selectedDownloadFileType === "file" ? (
                  <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                    <span className="text-zinc-400 text-xs sm:text-sm break-all flex-1">
                      {formData.downloadFile.name}
                    </span>
                    <button
                      onClick={() => handleRemoveFile("downloadFile")}
                      className="text-red-500 text-xs sm:text-sm cursor-pointer hover:text-red-400 flex-shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) =>
                      handleFileChange(e, "downloadFile", "file")
                    }
                    className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light cursor-pointer file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-700 file:text-zinc-300"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {[
          "LINK",
          "PROFILE_PIC",
          "TEXT",
          "WATCH_VIDEO",
          "UPLOAD",
          "DOWNLOAD_FILE",
          "PORT_IMAGE",
          "PORT_BIO",
          "SET_CARD",
          "PORT_INTRO_VIDEO",
          "CALENDLY",
        ].includes(formData?.taskTypes[0] || "") && (
          <div className="w-full flex flex-col justify-start items-start gap-1.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">Link</label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleInputChange}
              placeholder="URL here"
              className="w-full p-3 sm:p-4 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light"
            />
          </div>
        )}

        {formData.taskTypes.includes("QUIZ") && (
          <div className="w-full flex flex-col justify-start items-start gap-1.5">
            <label className="text-stone-200 text-xs sm:text-sm font-light">
              Quiz Questions
            </label>
            <div className="w-full p-3 sm:p-4 rounded-[10px] outline outline-neutral-700 flex flex-col justify-start items-start gap-4 sm:gap-5">
              {formData.quizQuestions.map((question, questionIndex) => (
                <div
                  key={questionIndex}
                  className="w-full flex flex-col justify-start items-start gap-2 sm:gap-2.5"
                >
                  <div className="w-full flex flex-col sm:flex-row justify-start items-start sm:items-center gap-2 sm:gap-2.5">
                    <div className="w-full sm:flex-1 flex justify-start items-center gap-2 sm:gap-2.5">
                      <div className="w-10 sm:w-12 flex flex-col justify-start items-start gap-[5px] flex-shrink-0">
                        <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex justify-center items-center">
                          <span className="text-zinc-400 text-xs sm:text-sm font-light">
                            {questionIndex + 1}
                          </span>
                        </div>
                      </div>
                      <div className="hidden sm:block w-px h-8 sm:h-11 bg-neutral-700" />
                      <div className="flex-1 flex justify-start items-center gap-2 sm:gap-2.5 min-w-0">
                        <input
                          type="text"
                          value={question.title}
                          onChange={(e) =>
                            handleQuizQuestionChange(
                              questionIndex,
                              e.target.value
                            )
                          }
                          placeholder="Title of question"
                          className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light min-w-0"
                        />
                      </div>
                    </div>
                    {questionIndex > 0 && (
                      <button
                        onClick={() => removeQuizQuestion(questionIndex)}
                        className="p-1.5 sm:p-[5px] ml-0 sm:ml-0.5 rounded-2xl outline outline-neutral-400 flex justify-center items-center flex-shrink-0 self-end sm:self-auto"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-400" />
                      </button>
                    )}
                  </div>
                  
                  {/* Options Grid - Responsive 2x2 layout */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 pl-0 sm:pr-7">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="flex justify-between items-start gap-2 sm:gap-2.5"
                      >
                        <div className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 flex items-center gap-2 sm:gap-2.5">
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 bg-zinc-800 rounded-full flex items-center justify-center cursor-pointer flex-shrink-0 ${
                              question.correctOption === optionIndex
                                ? "bg-rose-400"
                                : ""
                            }`}
                            onClick={() =>
                              handleQuizCorrectOptionChange(
                                questionIndex,
                                optionIndex
                              )
                            }
                          >
                            {question.correctOption === optionIndex && (
                              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-400 rounded-full" />
                            )}
                          </div>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleQuizOptionChange(
                                questionIndex,
                                optionIndex,
                                e.target.value
                              )
                            }
                            className="flex-1 bg-transparent text-zinc-400 text-xs sm:text-sm font-light outline-none min-w-0"
                            placeholder={`Option ${optionIndex + 1}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex w-full justify-start">
                <button
                  onClick={addQuizQuestion}
                  className="text-blue-500 text-sm sm:text-base font-normal leading-tight"
                >
                  + Add another question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Answer Details */}
      <div className="w-full flex flex-col justify-start items-start gap-3 sm:gap-4">
        <h2 className="text-stone-200 text-sm sm:text-base lg:text-lg font-semibold">
          Answer Details
        </h2>
        <div className="w-full flex flex-col justify-start items-start gap-1.5">
          <label className="text-stone-200 text-xs sm:text-sm font-light">
            Answer Type
          </label>
          <select
            name="answerType"
            value={formData.answerType}
            onChange={handleSelectChange}
            className="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-zinc-900/80 rounded-[10px] outline outline-neutral-700 text-zinc-400 text-xs sm:text-sm font-light"
          >
            <option value="">Select</option>
            <option value="UPLOAD_FILE">Upload File</option>
            <option value="DONE">Done</option>
            <option value="WRITE_SECTION">Write Section</option>
            <option value="UPLOAD_IMAGE">Upload Image</option>
            <option value="UPLOAD_VIDEO">Upload Video</option>
            <option value="CALENDLY">Calendly</option>
          </select>
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="w-full flex flex-col sm:flex-row justify-start items-stretch sm:items-start gap-2 sm:gap-2.5">
      <button
        onClick={handleCancel}
        className="w-full sm:w-44 px-4 sm:px-5 py-3 sm:py-4 rounded-[10px] outline outline-zinc-400 text-stone-200 text-xs sm:text-sm font-semibold capitalize order-2 sm:order-1 cursor-pointer"
      >
        Cancel
      </button>
      <button
        onClick={handleCreateTask}
        disabled={loading}
        className="flex-1 px-4 sm:px-5 py-3 sm:py-4 bg-rose-500 rounded-[10px] text-white text-xs sm:text-sm font-semibold capitalize order-1 sm:order-2 cursor-pointer"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  </div>
);
};

export default TaskManagement;
