import { axiosInstance, getAxiosInstance, getAxiosInstanceFormData } from "@/config/axios";
import { AUTH_URLS } from "@/constants/apiUrls";

export const loginService = async (payload: any) => {
 return  await axiosInstance.post(`/api/admin/login`, {
    email: payload.email,
    password: payload.password,
  });
};
export const forgotPasswordService = async (payload: any) =>
  await axiosInstance.post(`${AUTH_URLS.FORGET_PASSWORD}`, payload);
export const sendOtpService = async (payload: any) =>
  await axiosInstance.post(`${AUTH_URLS.VERIFY_OTP}`, payload);
export const resetPassword = async (payload: any) =>
  await axiosInstance.post(`${AUTH_URLS.RESET_PASSWORD}`, payload);
export const logOutService = async (route: string) => {
  const axiosInstance = await getAxiosInstance();
  return axiosInstance.post(route);
};


//----------Subscription Page--------------------------
export const getSubscriptionDetails = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const updateSubscriptionPlan = async (route: string, payload:any) =>{
  const axiosInstance = await getAxiosInstance()
  return axiosInstance.put(route, payload);
}


// ------------------- Terms & Condition -----------------------


export const getPlanInfo = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const postPrivacypolicy = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const postTermsAndCondition = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const postContactUs = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}


// -------------------- Job Management -----------------

export const postCreateJob = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const getAllJobs = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getJobById = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const UpdateJobById = async (route: string, payload:any) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.put(route, payload);
}

export const downloadCSV = async (route: string) => {
  const axiosInstance = await getAxiosInstance();
  return axiosInstance.get(route, { responseType: 'blob' });
};


// ----------------- Task Management ---------------------

export const getAllTasks = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getTaskById = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}
export const updateTaskDetails =async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.put(route, payload);
}

export const updateQuizTask =async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}
export const deleteQuiz =async (route:string) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.delete(route);
}

export const addUpdateDeleteCheckbox = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}


export const postTask = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const uploadAnything = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstanceFormData()
  return axiosInstance.post(route, payload);
}




//  -------------------- User Management -------------------

export const getAllUsers = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getUserById = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}




// Review Task

export const getAllReviews = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getUserTaskById = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}


export const rateTask = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}


// Dashboard

export const getDashboardData = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getRevenueData = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getJobApplicants = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}


// Admin Personal API's\

export const getAdminDataaa = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}


export const UpdateAdminData =async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.put(route, payload);
}

export const CreateEmployeeByAdmin =async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const getEmployeesByAdmin = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const updateEmployee  =async (route:string, payload:any) =>{
    const axiosInstance = await getAxiosInstance()
  return axiosInstance.put(route, payload);
}

export const getSingleEmployee  =  async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}



// Studio Routes

export const getAllStudios = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const createStudio = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const updateStudio = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}

export const getStudioByID = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const deleteBookingDate =async (route:string) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.delete(route);
}
export const deleteStudio =async (route:string) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.delete(route);
}

export const getStudioFeatures = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const updateStudioFeatures = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}


export const getAllActivities = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const getActivityById = async (route: string) => {
    const axiosInstance = await getAxiosInstance()
    return axiosInstance.get(route);
}

export const reviewActivity = async (route:string, payload:any) =>{
   const axiosInstance = await getAxiosInstance()
  return axiosInstance.post(route, payload);
}


export const cancelBooking  =async (route:string, payload:any) =>{
    const axiosInstance = await getAxiosInstance()
  return axiosInstance.put(route, payload);
}
