import axios from "axios";
import { getTokenCustom } from "@/actions";
import { signOut } from "next-auth/react";

export const axiosInstance = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
    headers: {
        'Content-Type': 'application/json',
        // 'role' : 'admin'
    }
})

// ✅ Interceptor to catch 401 globally
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized -> logout
      console.warn("Unauthorized: Logging out user...");
      try {
        // If using next-auth
        await signOut({ callbackUrl: "/login" });

        // If using custom logout
        // localStorage.clear();
        // router.push("/login");
      } catch (e) {
        console.error("Error during logout", e);
      }
    }
    return Promise.reject(error);
  }
);

const attachInterceptor = (instance: any) => {
  instance.interceptors.response.use(
    (response: any) => response,
    async (error: any) => {
      if (error.response?.status === 401) {
        console.warn("Unauthorized: Logging out user...");
        await signOut({ callbackUrl: "/" }); 
        // or custom logout
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

const createAuthInstance = async () => {
  try {
    const token = await getTokenCustom();
    const instance = axios.create({
      baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return attachInterceptor(instance);
  } catch (error) {
    console.error("Error getting token:", error);
    throw error;
  }
};

const createAuthInstanceFormData = async () => {
    try {
        const token = await getTokenCustom();
        const instance = axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
            headers: {
                Authorization: `Bearer ${token}`,
                // 'role' : 'admin', 
               "Content-Type": "multipart/form-data"
            },
        })
          return attachInterceptor(instance);
    } catch (error) {
        console.error('Error getting token:', error);
        throw error
    }
};

const createPublisherInstance = async () => {
    try {
        const token = await getTokenCustom();
        return axios.create({
            baseURL: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
            headers: {
                Authorization: `Bearer ${token}`,
                // 'role' : 'publisher', 
                'Content-Type': 'application/json'
            },
        })
    } catch (error) {
        console.error('Error getting token:', error);
        throw error
    }
};

export const getAxiosInstance = async () => {
    return await createAuthInstance()
}

export const getAxiosInstanceFormData = async () => {
    return await createAuthInstanceFormData()
}


export const getAxiosInstanceForPublisher = async () => {
    return await createPublisherInstance()
}

export const getImageClientS3URL = (key: string) => {
   return`${process.env.NEXT_PUBLIC_AWS_BUCKET_PATH}${key}`
}