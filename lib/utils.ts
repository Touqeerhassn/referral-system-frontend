import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Campaign, LeaderboardEntry, Participant } from "@/types";

/** Merges class names safely with tailwind-merge and clsx */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}


/** Generate a unique referral code for a participant */
export function generateReferralCode(prefix = "ref"): string {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${random}`;
}

/** Build a full referral link given campaign id and participant code */
export function buildReferralLink(campaignId: string, code: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/r/${campaignId}?ref=${code}`;
}

/** Format a date string to a human-readable format */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Calculate days remaining until a date */
export function daysRemaining(endDate: string): number {
  const diff = new Date(endDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/** Return a CSS class for a campaign status badge */
export function statusBadgeClass(status: Campaign["status"]): string {
  const map: Record<Campaign["status"], string> = {
    active: "badge-success",
    draft: "badge-info",
    paused: "badge-warning",
    ended: "badge-error",
  };
  return map[status] ?? "badge-primary";
}

/** Slugify a business name into a URL-safe string */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Truncate text with an ellipsis */
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}

/** Mock — placeholder leaderboard data for a campaign */
export function getMockLeaderboard(count = 10): LeaderboardEntry[] {
  const names = [
    "Ali Hassan", "Sara Khan", "Usman Malik", "Fatima Zahra",
    "Bilal Ahmed", "Ayesha Siddiqui", "Omar Farooq", "Zara Baig",
    "Hamza Raza", "Nadia Iqbal",
  ];
  return names.slice(0, count).map((name, i) => ({
    rank: i + 1,
    participantId: `p-${i + 1}`,
    participantName: name,
    referralCount: Math.max(1, 50 - i * 5 + Math.floor(Math.random() * 3)),
    totalRewards: `$${(50 - i * 4).toFixed(0)}`,
  }));
}

/** Mock — placeholder campaigns for development */
export function getMockCampaigns(): Campaign[] {
  return [
    {
      id: "camp-001",
      ownerId: "user-1",
      title: "Summer Referral Blast",
      description: "Refer friends and earn $10 for each signup!",
      reward: "$10 Cash",
      rewardType: "cash",
      startDate: "2026-06-01",
      endDate: "2026-09-30",
      status: "active",
      referralLinkBase: "/r/camp-001",
      totalReferrals: 128,
      totalParticipants: 45,
      createdAt: "2026-06-01",
      updatedAt: "2026-09-01",
    },
    {
      id: "camp-002",
      ownerId: "user-1",
      title: "Loyalty Discount Drive",
      description: "Share and get 15% off your next order.",
      reward: "15% Discount",
      rewardType: "discount",
      startDate: "2026-08-15",
      status: "active",
      referralLinkBase: "/r/camp-002",
      totalReferrals: 56,
      totalParticipants: 22,
      createdAt: "2026-08-15",
      updatedAt: "2026-09-10",
    },
    {
      id: "camp-003",
      ownerId: "user-1",
      title: "Free Product Giveaway",
      description: "Top referrer wins a free product!",
      reward: "Free Product",
      rewardType: "product",
      startDate: "2026-09-01",
      endDate: "2026-09-30",
      status: "draft",
      referralLinkBase: "/r/camp-003",
      totalReferrals: 0,
      totalParticipants: 0,
      createdAt: "2026-09-01",
      updatedAt: "2026-09-01",
    },
  ];
}

/** Mock — participant info */
export function getMockParticipant(campaignId: string): Participant {
  return {
    id: "part-001",
    campaignId,
    name: "Your Name",
    email: "you@example.com",
    referralCode: "REF-AB12CD",
    referralLink: `http://localhost:3000/r/${campaignId}?ref=REF-AB12CD`,
    referralCount: 3,
    totalRewards: "$30",
    joinedAt: new Date().toISOString(),
  };
}
