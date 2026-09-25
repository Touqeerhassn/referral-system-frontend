import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: `${APP_NAME} — Register Your Business`,
  description:
    "Create a RefPulse account as a Guest or Subscriber and start your first referral campaign.",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 sm:p-8">
      <RegisterForm />
    </div>
  );
}

