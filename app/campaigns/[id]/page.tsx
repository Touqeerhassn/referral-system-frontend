import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { CampaignDetailContent } from "./CampaignDetailContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${APP_NAME} — Campaign Details`,
    description: `Manage campaign ${id}, track referral conversions, and inspect discounts.`,
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CampaignDetailContent campaignId={id} />;
}

