import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import NewCampaignForm from "./NewCampaignForm";

export const metadata: Metadata = {
  title: `${APP_NAME} — New Campaign`,
  description: "Create a new referral campaign for your business.",
};

export default function NewCampaignPage() {
  return <NewCampaignForm />;
}
