import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import DashboardContent from "./DashboardContent";

export const metadata: Metadata = {
  title: `${APP_NAME} — Dashboard`,
  description: "Overview of your referral campaigns, participants, and earnings.",
};

export default function DashboardPage() {
  return <DashboardContent />;
}
