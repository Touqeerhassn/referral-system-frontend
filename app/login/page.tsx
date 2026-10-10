import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: `${APP_NAME} — Login`,
  description: "Log in to your RefPulse business account.",
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <LoginForm />
    </div>
  );
}

