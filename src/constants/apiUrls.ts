export const BASE_IMG_URL = "https://disstrikt.s3.eu-north-1.amazonaws.com/";
const API_BASE_ADMIN = `/api/admin`;
// Auth related endpoints
export const AUTH_URLS = {
  LOGIN: `${API_BASE_ADMIN}/login`,
  LOGOUT: `${API_BASE_ADMIN}/logout`,
  FORGET_PASSWORD: `${API_BASE_ADMIN}/forget-password`,
  VERIFY_OTP: `${API_BASE_ADMIN}/verify-otp`,
  RESET_PASSWORD: `${API_BASE_ADMIN}/reset-password`,
  PROFILE: `${API_BASE_ADMIN}/profile`,
};

export const ADMIN_URLS = {
  GET_SUBSCRIPTIONS: `${API_BASE_ADMIN}/price-plan`,
  UPDATE_SUBSCRIPTION_PLAN: `${API_BASE_ADMIN}/price-plan`,

  GET_PLAN_INFO: `${API_BASE_ADMIN}/get-platform-info`,

  POST_PRIVACY_POLICY: `${API_BASE_ADMIN}/privacy-policy`,
  POST_TERMS_CONDITION: `${API_BASE_ADMIN}/term-and-condition`,
  POST_CONTACT_US: `${API_BASE_ADMIN}/support`,

  POST_A_JOB: `${API_BASE_ADMIN}/jobs`,
  GET_ALL_JOBS: `${API_BASE_ADMIN}/jobs`,
  GET_JOB_BY_ID: `${API_BASE_ADMIN}/jobsById`,
  UPDATE_JOB_BY_ID: `${API_BASE_ADMIN}/jobsById`,
  DOWNLOAD_CSV_TASK: `${API_BASE_ADMIN}/jobDataCSV`,

  GET_ALL_TASKS: `${API_BASE_ADMIN}/tasks`,
  GET_TASK_BY_ID: `${API_BASE_ADMIN}/tasksById`,
  UPDATE_TASK_BY_ID: `${API_BASE_ADMIN}/tasksById`,
  ADD_UPDATE_QUIZ: `${API_BASE_ADMIN}/addQuiz`,
  DELETE_QUIZ: `${API_BASE_ADMIN}/addQuiz`,
  ADD_UPDATE_DELETE_CHECKBOX: `${API_BASE_ADMIN}/addCheckbox`,
  UPLOAD_ANYTHING: `${API_BASE_ADMIN}/upload`,
  CREATE_TASK: `${API_BASE_ADMIN}/tasks`,

  GET_ALL_USERS: `${API_BASE_ADMIN}/getUsers`,
  GET_USER_BY_ID: `${API_BASE_ADMIN}/getUserById`,

  GET_ALL_REVIEWS: `${API_BASE_ADMIN}/userTask`,
  GET_USER_TASK_BY_ID: `${API_BASE_ADMIN}/userTask`,
  RATE_TASK: `${API_BASE_ADMIN}/userTask`,

  GET_ALL_REVENUES: `${API_BASE_ADMIN}/revenue`,

  GET_DASHBOARD_DATA: `${API_BASE_ADMIN}/get-dashboard`,

  GET_JOB_APPLICANTS: `${API_BASE_ADMIN}/get-all-applications`,

  GET_ADMIN_DATA: `${API_BASE_ADMIN}/admin-data`,
  UPDATE_ADMIN_DATA: `${API_BASE_ADMIN}/admin-data`,


  CREATE_EMPLOYEE:`${API_BASE_ADMIN}/employee`,
  GET_ALL_EMPLOYEES:`${API_BASE_ADMIN}/employee`,
  UPDATE_EMPLOYEE:`${API_BASE_ADMIN}/employee-by-id`,
  GET_EMPLOYEE_BY_ID:`${API_BASE_ADMIN}/employee-by-id`,
 

  GET_STUDIOS:`${API_BASE_ADMIN}/studio`,
  ADD_STUDIO:`${API_BASE_ADMIN}/studio`,
  UPDATE_STUDIO:`${API_BASE_ADMIN}/studio`,
  DELETE_STUDIO:`${API_BASE_ADMIN}/studio`,
  GET_STUDIO_BY_ID:`${API_BASE_ADMIN}/studioById`,
  DELETE_BOOKING_DATE:`${API_BASE_ADMIN}/studioById`,
  GET_STUDIO_FEATURES:`${API_BASE_ADMIN}/shootFeatures`,
  UPDATE_STUDIO_FEATURE:`${API_BASE_ADMIN}/shootFeatures`,


  GET_ALL_ACTIVITIES:`${API_BASE_ADMIN}/activities`,
  GET_ACTIVITY_BY_ID:`${API_BASE_ADMIN}/activitiesById`,
  REVIEW_ACTIVITY:`${API_BASE_ADMIN}/activitiesById`,
CANCEL_ACTIVITY:`${API_BASE_ADMIN}/activitiesById`

};
