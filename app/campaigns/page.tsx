import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { CampaignsContent } from "./CampaignsContent";

export const metadata: Metadata = {
  title: `${APP_NAME} — Campaigns`,
  description: "Manage all your referral campaigns and track performance.",
};

export default function CampaignsPage() {
  return <CampaignsContent />;
}

