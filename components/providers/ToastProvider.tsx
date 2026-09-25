"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#FFFFFF",
          color: "#1A0E12",
          border: "1px solid #F0D6DA",
          boxShadow: "0 4px 16px rgba(180, 60, 80, 0.10)",
          borderRadius: "0.75rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          padding: "0.75rem 1rem",
        },
        success: {
          duration: 3500,
          iconTheme: {
            primary: "#0E9E6B",
            secondary: "#FFFFFF",
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: "#DC2626",
            secondary: "#FFFFFF",
          },
        },
      }}
    />
  );
}

export default ToastProvider;
