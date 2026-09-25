import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Base API URL with fallback for local backend development
export const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 150000,
});

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("auth_token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Global error formatting and handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";

    // Handle 401 Unauthorized
    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth_token");
        // Optionally redirect to login if required:
        // window.location.href = "/login";
      }
    }

    // Return a normalized error object
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
