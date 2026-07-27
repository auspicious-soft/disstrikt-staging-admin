import axios, { type InternalAxiosRequestConfig } from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// =======================
// Public APIs (Login)
// =======================
export const authAxios = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// =======================
// Protected APIs
// =======================
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const axiosInstanceFormData = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Attach token before every request
const attachAuthToken = async (config: InternalAxiosRequestConfig) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
};

const handleUnauthorized = async (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return Promise.reject(error);
  }

  if (error.response?.status === 401) {
    console.warn("Unauthorized: Logging out user...");

    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(
  attachAuthToken,
  (error) => Promise.reject(error)
);

axiosInstanceFormData.interceptors.request.use(
  attachAuthToken,
  (error) => Promise.reject(error)
);

// Handle unauthorized globally
axiosInstance.interceptors.response.use((response) => response, handleUnauthorized);
axiosInstanceFormData.interceptors.response.use(
  (response) => response,
  handleUnauthorized
);

export const getAxiosInstance = async () => axiosInstance;

export const getAxiosInstanceFormData = async () => axiosInstanceFormData;

export const getImageClientS3URL = (key: string) => {
  return `${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${key}`;
};
