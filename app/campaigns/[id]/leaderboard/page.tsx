import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { LeaderboardContent } from "./LeaderboardContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${APP_NAME} — Leaderboard`,
    description: `Campaign ${id} referral leaderboard.`,
  };
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeaderboardContent campaignId={id} />;
}
