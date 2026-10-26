// FixFlow - Centralized Axios Client
// Reads base URL from import.meta.env.VITE_API_URL and standardizes error responses.

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Response interceptor: unwrap response data or standardize API error message
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "An unexpected network error occurred. Please verify the backend is running.";

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.details = error.response?.data?.errors;
    customError.requestId = error.response?.data?.requestId;

    return Promise.reject(customError);
  }
);

export default api;
