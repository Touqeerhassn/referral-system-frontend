// ============================================================
// lib/constants.ts — App-wide constants
// ============================================================

export const APP_NAME = "RefPulse";
export const APP_TAGLINE = "Turn Customers into Brand Ambassadors";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Route groups
export const ROUTES = {
  // Public / Landing
  home: "/",

  // --- Business Owner Routes ---
  // Auth
  login: "/login",
  register: "/register",

  // Dashboard
  dashboard: "/dashboard",

  // Campaigns
  campaigns: "/campaigns",
  newCampaign: "/campaigns/new",
  campaignDetail: (id: string) => `/campaigns/${id}`,
  editCampaign: (id: string) => `/campaigns/${id}/edit`,
  campaignLeaderboard: (id: string) => `/campaigns/${id}/leaderboard`,

  // Settings
  settings: "/settings",

  // --- Participant / Customer Routes ---
  // Public referral join page
  referral: (campaignId: string) => `/r/${campaignId}`,

  // Participant's personal dashboard (after joining)
  participantDashboard: (code: string) => `/r/${code}/dashboard`,
} as const;

// Campaign reward type labels
export const REWARD_TYPE_LABELS: Record<string, string> = {
  cash: "Cash Reward",
  credit: "Store Credit",
  discount: "Discount Code",
  product: "Free Product",
  custom: "Custom Reward",
};

// Nav items for the business sidebar
export const BUSINESS_NAV_ITEMS = [
  { label: "Dashboard",  href: ROUTES.dashboard,  icon: "grid" },
  { label: "Campaigns",  href: ROUTES.campaigns,  icon: "megaphone" },
  { label: "Settings",   href: ROUTES.settings,   icon: "settings" },
];
