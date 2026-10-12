"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Megaphone,
  Calendar,
  Clock,
  Percent,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sliders,
  Layers,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "@/components/Topbar";
import { InputField } from "@/components/ui/InputField";
import { ROUTES } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { getStoredBusinessId } from "@/lib/api/business";
import { useCreateCampaign } from "@/lib/api/campaign";
import CampaignShareView from "./CampaignShareView";

function toDateTimeLocalString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function NewCampaignForm() {
  const router = useRouter();

  // Initial dates
  const now = new Date();
  const thirtyDaysLater = new Date();
  thirtyDaysLater.setDate(now.getDate() + 30);

  // Form State
  const [businessId, setBusinessId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [isSlugCustomized, setIsSlugCustomized] = useState<boolean>(false);
  const [startDateTime, setStartDateTime] = useState<string>(
    toDateTimeLocalString(now)
  );
  const [endDateTime, setEndDateTime] = useState<string>(
    toDateTimeLocalString(thirtyDaysLater)
  );
  const [hasEndDate, setHasEndDate] = useState<boolean>(true);

  // Tiers & Caps (Descending: Tier 1 highest, Tier 2 lower, Tier 3 lowest)
  const [tier1Pct, setTier1Pct] = useState<string>("15");
  const [tier2Pct, setTier2Pct] = useState<string>("10");
  const [tier3Pct, setTier3Pct] = useState<string>("5");
  const [maxDiscountCapPct, setMaxDiscountCapPct] = useState<string>("30");

  // Created Campaign Sharing State
  const [createdCampaign, setCreatedCampaign] = useState<{
    campaign: {
      id?: string;
      name: string;
      slug: string;
      tier1Pct?: number;
      tier2Pct?: number;
      tier3Pct?: number;
      maxDiscountCapPct?: number;
    };
    publicLink: string;
  } | null>(null);

  // React Query Mutation
  const { mutate: create, isPending, isError, error } = useCreateCampaign();

  // Window origin for public link preview
  const [origin, setOrigin] = useState<string>("http://localhost:3000");

  // Load businessId from localStorage & origin
  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
    const storedId = getStoredBusinessId();
    if (storedId) {
      setBusinessId(storedId);
    }
  }, []);


  // Auto-generate slug when name changes (unless user manually entered one)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugCustomized) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugCustomized(true);
    setSlug(slugify(val));
  };

  const setPresetDuration = (days: number) => {
    const target = new Date(startDateTime ? new Date(startDateTime) : now);
    target.setDate(target.getDate() + days);
    setEndDateTime(toDateTimeLocalString(target));
    setHasEndDate(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessId.trim()) {
      toast.error("Business ID is required. Please register your business first.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter a campaign name.");
      return;
    }

    if (!slug.trim()) {
      toast.error("Please provide a URL slug for your campaign.");
      return;
    }

    if (!startDateTime) {
      toast.error("Please select a campaign start date and time.");
      return;
    }

    const t1 = parseFloat(tier1Pct);
    const t2 = parseFloat(tier2Pct);
    const t3 = parseFloat(tier3Pct);
    const maxCap = parseFloat(maxDiscountCapPct);

    if (isNaN(t1) || isNaN(t2) || isNaN(t3) || isNaN(maxCap)) {
      toast.error("All tier percentages and the discount cap must be valid numbers.");
      return;
    }

    if (t1 <= 0 || t2 <= 0 || t3 <= 0 || maxCap <= 0) {
      toast.error("Percentages must be greater than 0%.");
      return;
    }

    // Tier 1 is highest, Tier 2 is lower, and Tier 3 is lowest
    if (t1 < t2 || t2 < t3) {
      toast.error("Tiers must descend: Tier 1 (Highest) ≥ Tier 2 ≥ Tier 3.");
      return;
    }

    if (t1 > maxCap) {
      toast.error("Tier 1 cannot exceed the Maximum Discount Cap.");
      return;
    }


    if (hasEndDate && endDateTime && new Date(endDateTime) <= new Date(startDateTime)) {
      toast.error("End date and time must be after the start date.");
      return;
    }

    // Convert local datetime to ISO format
    // If start date is now or within 2 minutes from now, backdate by 1 min to prevent clock-skew
    const parsedStart = new Date(startDateTime);
    const isStartingNow = parsedStart.getTime() <= Date.now() + 120000;
    const formattedStart = isStartingNow
      ? new Date(Date.now() - 60000).toISOString()
      : parsedStart.toISOString();

    const formattedEnd =
      hasEndDate && endDateTime ? new Date(endDateTime).toISOString() : null;

    // Call API: POST BASE_URL/api/campaigns
    create(
      {
        businessId: businessId.trim(),
        name: name.trim(),
        slug: slug.trim(),
        startDateTime: formattedStart,
        endDateTime: formattedEnd,
        tier1Pct: t1,
        tier2Pct: t2,
        tier3Pct: t3,
        maxDiscountCapPct: maxCap,
      },
      {
        onSuccess: (data) => {
          const successMsg = data?.message || "Campaign created successfully!";
          toast.success(successMsg);

          const fallbackLink =
            typeof window !== "undefined"
              ? `${window.location.origin}/c/${data?.campaign?.slug || slug}`
              : `/c/${data?.campaign?.slug || slug}`;
          const publicLink = data?.publicLink || fallbackLink;

          const finalCampaign = data?.campaign || {
            id: `cmp_${Date.now()}`,
            businessId,
            name,
            slug,
            tier1Pct: t1,
            tier2Pct: t2,
            tier3Pct: t3,
            maxDiscountCapPct: maxCap,
            startDateTime: formattedStart,
            endDateTime: formattedEnd,
          };

          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(
                `campaign_slug_${data?.campaign?.slug || slug}`,
                JSON.stringify(finalCampaign)
              );
            } catch { }
          }

          setCreatedCampaign({
            campaign: finalCampaign,
            publicLink,
          });

          if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          }
        },
        onError: (err) => {
          const errMsg = err?.message || "Failed to create campaign. Please try again.";
          toast.error(errMsg);
        },
      }
    );
  };

  // If campaign was created, show the dedicated Share & Promotion view!
  if (createdCampaign) {
    return (
      <>
        <Topbar
          title="Campaign Live"
          actions={
            <Link
              href={ROUTES.dashboard}
              className="btn btn-primary px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <span>Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          }
        />
        <CampaignShareView
          campaign={createdCampaign.campaign}
          publicLink={createdCampaign.publicLink}
          onReset={() => {
            setCreatedCampaign(null);
            setName("");
            setSlug("");
            setIsSlugCustomized(false);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 0, left: 0, behavior: "instant" });
            }
          }}
        />
      </>
    );
  }

  return (
    <>
      <Topbar
        title="Create Campaign"
        actions={
          <Link
            href={ROUTES.dashboard}

            className="btn btn-ghost px-3.5 py-1.5 text-xs flex items-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
        }
      />

      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-4xl w-full mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-7">
          <span className="badge badge-primary text-xs mb-2">New Initiative</span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
            Launch Referral Campaign
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Configure your tiered reward incentives, timing, and referral link to start acquiring customers.
          </p>
        </div>

        {/* Missing Business ID Alert */}
        {!businessId && (
          <div className="card-glow p-4 mb-6 border border-amber-300 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertCircle size={17} className="shrink-0 text-amber-600" />
              <span>
                <strong>No active business profile detected.</strong> Please register your business first.
              </span>
            </div>
            <Link
              href="/register"
              className="btn btn-primary px-3 py-1 text-xs shrink-0"
            >
              Register Now
            </Link>
          </div>
        )}

        {/* Form Error Banner */}
        {isError && (
          <div className="p-4 mb-6 rounded-2xl bg-[var(--color-error-soft)] border border-[rgba(220,38,38,0.25)] text-[var(--color-error)] text-xs sm:text-sm font-medium flex items-center gap-2.5 animate-scale-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error?.message || "Failed to launch campaign. Please check the fields and try again."}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Section 1: Campaign Identity */}
          <div className="card p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Megaphone size={18} className="text-[var(--color-primary)]" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                1. Campaign Details
              </h2>
            </div>

            {/* Campaign Name */}

            <div>
              <InputField
                id="camp-name"
                name="name"
                label="Campaign Name"
                placeholder="e.g. Summer Customer Blitz or VIP Friend Invite"
                value={name}
                required
                disabled={isPending}
                onChange={(e) => handleNameChange(e.target.value)}
                leftIcon={<Sparkles size={16} />}
              />
            </div>

            {/* Slug field with preview */}
            <div>
              <InputField
                id="camp-slug"
                name="slug"
                label="URL Slug (Custom Link)"
                placeholder="e.g. summer-customer-blitz"
                value={slug}
                required
                disabled={isPending}
                onChange={(e) => handleSlugChange(e.target.value)}
                hint="Used to create clean, shareable referral links for your customers"
              />

              {slug && (
                <div className="mt-2.5 p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-[var(--color-primary)] shrink-0">
                      Public Link Preview:
                    </span>
                    <code className="font-mono text-xs text-[var(--color-text-primary)] break-all font-semibold">
                      {`${origin}/c/${slug}`}
                    </code>
                  </div>
                  <span className="badge badge-primary text-[0.68rem] shrink-0 hidden sm:inline-block">
                    Live upon launch
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* Section 2: Date & Time Schedule */}
          <div className="card p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-[var(--color-primary)]" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  2. Schedule & Duration
                </h2>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-[var(--color-text-muted)] mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => setPresetDuration(14)}
                  className="px-2 py-1 rounded-md bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  +14 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDuration(30)}
                  className="px-2 py-1 rounded-md bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  +30 Days
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDuration(90)}
                  className="px-2 py-1 rounded-md bg-[var(--color-bg-subtle)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                >
                  +90 Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date & Time */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="camp-start-datetime"
                    className="text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Start Date & Time <span className="text-[var(--color-primary)] font-bold">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setStartDateTime(toDateTimeLocalString(new Date()))}
                    className="text-[0.7rem] text-[var(--color-primary)] hover:underline font-semibold cursor-pointer"
                    title="Set start time to now"
                  >
                    ⚡ Start Now (Active Immediately)
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="camp-start-datetime"
                    type="datetime-local"
                    value={startDateTime}
                    required
                    disabled={isPending}
                    onChange={(e) => setStartDateTime(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  When the campaign becomes active for customer referrals
                </p>
              </div>

              {/* End Date & Time */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="camp-end-datetime"
                    className="text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    End Date & Time
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasEndDate}
                      onChange={(e) => setHasEndDate(e.target.checked)}
                      className="rounded accent-[var(--color-primary)] cursor-pointer"
                    />
                    <span>Set Expiration</span>
                  </label>
                </div>

                <div className="relative flex items-center">
                  <input
                    id="camp-end-datetime"
                    type="datetime-local"
                    value={endDateTime}
                    disabled={!hasEndDate || isPending}
                    onChange={(e) => setEndDateTime(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-sm text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none disabled:opacity-50 disabled:bg-[var(--color-bg-subtle)]"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {hasEndDate
                    ? "Campaign automatically wraps up at this timestamp"
                    : "Runs indefinitely until manually paused"}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Tiered Reward Percentages */}
          <div className="card p-6 sm:p-7 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border-subtle)]">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-[var(--color-primary)]" />
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  3. Multi-Level Reward Tiers & Maximum Cap
                </h2>
              </div>
              <span className="badge badge-primary text-xs">Multi-Level Tiers</span>
            </div>

            <p className="text-xs text-[var(--color-text-secondary)] -mt-1">
              Configure descending reward percentages: Tier 1 offers the highest discount for direct referrals, with decreasing percentages for 2nd and 3rd degree levels.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tier 1 - Highest */}
              <div className="p-4 rounded-2xl bg-[var(--color-primary-soft)]/40 border-2 border-[var(--color-primary)]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary-active)]">
                      Tier 1 (Direct)
                    </span>
                    <span className="badge badge-primary text-[0.68rem] px-1.5 py-0.5">
                      Highest
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--color-text-secondary)] mb-3">
                    Direct 1st-degree referral reward (e.g. 15%)
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={tier1Pct}
                    required
                    disabled={isPending}
                    onChange={(e) => setTier1Pct(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-[var(--color-primary)] bg-[var(--color-bg-base)] text-base font-black text-[var(--color-primary)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-[var(--color-primary)] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Tier 2 - Lower */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                      Tier 2 (Level 2)
                    </span>
                    <span className="badge badge-warning text-[0.68rem] px-1.5 py-0.5">
                      Level 2
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--color-text-muted)] mb-3">
                    Secondary reward for 2nd-degree referrals (e.g. 10%)
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={tier2Pct}
                    required
                    disabled={isPending}
                    onChange={(e) => setTier2Pct(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-base font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-[var(--color-text-muted)] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Tier 3 - Lowest */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-primary)]">
                      Tier 3 (Level 3)
                    </span>
                    <span className="badge badge-info text-[0.68rem] px-1.5 py-0.5">
                      Level 3
                    </span>
                  </div>
                  <p className="text-[0.72rem] text-[var(--color-text-muted)] mb-3">
                    Tertiary reward for 3rd-degree referrals (e.g. 5%)
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={tier3Pct}
                    required
                    disabled={isPending}
                    onChange={(e) => setTier3Pct(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-base font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-[var(--color-text-muted)] pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              {/* Max Discount Cap */}
              <div className="p-4 rounded-2xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-strong)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[var(--color-text-primary)]">
                      Max Cap
                    </span>
                    <ShieldAlert size={16} className="text-[var(--color-warning)]" />
                  </div>
                  <p className="text-[0.72rem] text-[var(--color-text-muted)] mb-3">
                    Ceiling limit on any combined discount (e.g. 30%)
                  </p>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    value={maxDiscountCapPct}
                    required
                    disabled={isPending}
                    onChange={(e) => setMaxDiscountCapPct(e.target.value)}
                    className="w-full h-11 pl-3.5 pr-8 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-base font-bold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:ring-3 focus:ring-[var(--color-primary-glow)] transition-all outline-none"
                  />
                  <span className="absolute right-3.5 text-sm font-bold text-[var(--color-text-muted)] pointer-events-none">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Ladder Preview */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)]">
              <span className="text-xs font-semibold text-[var(--color-text-secondary)] block mb-2">
                Multi-Level Discount Breakdown:
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-[var(--color-primary)]">
                  Level 1 (Direct): {tier1Pct || 0}%
                </span>
                <span className="text-[var(--color-text-muted)]">≥</span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  Level 2: {tier2Pct || 0}%
                </span>
                <span className="text-[var(--color-text-muted)]">≥</span>
                <span className="font-bold text-[var(--color-text-primary)]">
                  Level 3: {tier3Pct || 0}%
                </span>
                <span className="text-[var(--color-text-muted)] ml-auto font-medium">
                  Maximum Cap: <strong className="text-[var(--color-primary-active)]">{maxDiscountCapPct || 0}%</strong>
                </span>
              </div>
            </div>
          </div>


          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <Link
              href={ROUTES.dashboard}
              className="btn btn-ghost w-full sm:w-auto px-6 py-3 text-sm font-medium order-2 sm:order-1"
            >
              Cancel
            </Link>

            <button
              id="campaign-create-submit"
              type="submit"
              disabled={isPending}
              className="btn btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md order-1 sm:order-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Launching Campaign...</span>
                </>
              ) : (
                <>
                  <span>🚀 Launch Campaign</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
