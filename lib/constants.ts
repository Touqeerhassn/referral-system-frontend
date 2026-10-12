// ============================================================
// lib/constants.ts — App-wide constants
// ============================================================

export const APP_NAME = "RefPulse";
export const APP_TAGLINE = "Turn Customers into Brand Ambassadors";
export const LIVE_APP_URL = "https://referral-system-frontend.vercel.app";

// Clean APP_URL without trailing slash, defaulting to live production URL
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || LIVE_APP_URL
).replace(/\/+$/, "");

/**
 * Resolves a campaign's public URL, ensuring it ALWAYS uses the live production domain
 * (or configured NEXT_PUBLIC_APP_URL) and NEVER leaks localhost/127.0.0.1.
 */
export function getPublicCampaignUrl(slug: string, apiPublicLink?: string | null): string {
  const base = APP_URL || LIVE_APP_URL;
  const cleanSlug = (slug || "").trim().replace(/^\/+/, "");

  if (apiPublicLink && typeof apiPublicLink === "string") {
    try {
      const parsed = new URL(apiPublicLink);
      // If backend returns a localhost URL or railway domain, replace origin with live base URL
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.includes("railway.app")
      ) {
        return `${base}${parsed.pathname}${parsed.search}`;
      }
      return apiPublicLink.replace(/\/+$/, "");
    } catch {
      // If it's a relative path like "/c/my-slug"
      if (apiPublicLink.startsWith("/")) {
        return `${base}${apiPublicLink}`;
      }
    }
  }

  return `${base}/c/${cleanSlug}`;
}

/**
 * Resolves a participant referral URL with their referral code, guaranteeing live domain
 */
export function getPublicReferralUrl(slug: string, referralCode: string, apiLink?: string | null): string {
  const base = APP_URL || LIVE_APP_URL;
  const cleanSlug = (slug || "").trim().replace(/^\/+/, "");
  const codeParam = referralCode ? `?ref=${encodeURIComponent(referralCode)}` : "";

  if (apiLink && typeof apiLink === "string") {
    try {
      const parsed = new URL(apiLink);
      if (
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1" ||
        parsed.hostname.includes("railway.app")
      ) {
        return `${base}${parsed.pathname}${parsed.search}`;
      }
      return apiLink.replace(/\/+$/, "");
    } catch {
      if (apiLink.startsWith("/")) {
        return `${base}${apiLink}`;
      }
    }
  }

  return `${base}/c/${cleanSlug}${codeParam}`;
}


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
