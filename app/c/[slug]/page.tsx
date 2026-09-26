import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { PublicCampaignClient } from "./PublicCampaignClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const formattedTitle = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} — Join & Earn Referral Rewards`,
    description: `Join the ${formattedTitle} referral program on ${APP_NAME}. Refer your friends and earn rewards today!`,
  };
}

export default async function PublicCampaignPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    ref?: string;
    campaignId?: string;
    cid?: string;
    participantId?: string;
    id?: string;
    checkStatus?: string;
  }>;
}) {
  const { slug } = await params;
  const { ref, campaignId, cid, participantId, id, checkStatus } =
    await searchParams;

  return (
    <PublicCampaignClient
      slug={slug}
      initialRef={ref}
      initialCampaignId={campaignId || cid}
      initialParticipantId={participantId || id}
      initialMode={checkStatus === "true" || !!(participantId || id) ? "status" : undefined}
    />
  );
}
