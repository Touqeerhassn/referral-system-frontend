// ============================================================
// REFERRAL SYSTEM — Shared TypeScript Types
// ============================================================

// --- User / Auth ---
export type UserRole = "guest" | "subscriber";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessName: string;
  businessSlug: string;  // unique URL-safe handle
  avatarUrl?: string;
  createdAt: string;
}

// --- Campaign ---
export type CampaignStatus = "draft" | "active" | "paused" | "ended";

export interface Campaign {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  reward: string;          // e.g. "$10 credit", "5% discount"
  rewardType: "cash" | "credit" | "discount" | "product" | "custom";
  startDate: string;
  endDate?: string;
  status: CampaignStatus;
  referralLinkBase: string; // https://app.com/r/{campaignId}
  totalReferrals: number;
  totalParticipants: number;
  createdAt: string;
  updatedAt: string;
}

// --- Referral ---
export type ReferralStatus = "pending" | "completed" | "rejected";

export interface Referral {
  id: string;
  campaignId: string;
  referrerId: string;      // participant who shared the link
  referredEmail?: string;
  referredName?: string;
  status: ReferralStatus;
  rewardEarned?: string;
  createdAt: string;
}

// --- Participant (Customer) ---
export interface Participant {
  id: string;
  campaignId: string;
  name: string;
  email: string;
  phone?: string;
  referralCode: string;    // unique per participant per campaign
  referralLink: string;
  referralCount: number;   // how many friends referred
  totalRewards: string;
  joinedAt: string;
}

// --- Leaderboard Entry ---
export interface LeaderboardEntry {
  rank: number;
  participantId: string;
  participantName: string;
  referralCount: number;
  totalRewards: string;
  avatarUrl?: string;
}

// --- Dashboard Stats ---
export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalParticipants: number;
  totalReferrals: number;
  totalRewardsPaid: string;
  conversionRate: number; // percentage
}

// --- API Response Wrapper ---
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- Form Types ---
export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  businessName: string;
  role: UserRole;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface CampaignFormData {
  title: string;
  description: string;
  reward: string;
  rewardType: Campaign["rewardType"];
  startDate: string;
  endDate?: string;
}

export interface ParticipantJoinFormData {
  name: string;
  email: string;
  phone?: string;
}

// --- Navigation ---
export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
}
