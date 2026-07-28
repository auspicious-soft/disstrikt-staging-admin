import {
  axiosInstance,
  axiosInstanceFormData,
} from "@/lib/axios";

type Payload = unknown;

const get = (url: string) => axiosInstance.get(url);
const post = (url: string, payload?: Payload) => axiosInstance.post(url, payload);
const patch = (url: string, payload?: Payload) => axiosInstance.patch(url, payload);
const remove = (url: string) => axiosInstance.delete(url);

export const getAllJobs = get;
export const getJobById = get;
export const getTaskById = get;
export const getAllTasks = get;
export const getAllUsers = get;
export const getUserById = get;
export const getUserTaskById = get;
export const getJobApplicants = get;
export const getPlanInfo = get;
export const getAdminDataaa = get;
export const getDashboardData = get;

export const postCreateJob = post;
export const postTask = post;
export const postPrivacypolicy = post;
export const postTermsAndCondition = post;
export const postContactUs = post;

export const UpdateJobById = patch;
export const updateTaskDetails = patch;
export const updateQuizTask = patch;
export const addUpdateDeleteCheckbox = patch;
export const rateTask = patch;
export const UpdateAdminData = patch;

export const deleteQuiz = remove;

export const downloadCSVTask = (url: string) =>
  axiosInstance.get(url, { responseType: "blob" });

export const downloadCSV = downloadCSVTask;

export const uploadAnything = (url: string, payload: FormData) =>
  axiosInstanceFormData.post(url, payload);
