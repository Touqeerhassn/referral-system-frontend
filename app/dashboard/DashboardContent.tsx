"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Megaphone,
  Users,
  Link as LinkIcon,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Crown,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Gift,
  Trophy,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import Topbar from "@/components/Topbar";
import { ROUTES } from "@/lib/constants";
import {
  useBusinessCampaigns,
  useBusinessParticipants,
  getStoredBusinessId,
  getStoredBusiness,
  type ApiCampaignItem,
} from "@/lib/api/business";
import { ParticipantOrdersTable } from "./ParticipantOrdersTable";
import { formatDate } from "@/lib/utils";

export default function DashboardContent() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedId = getStoredBusinessId();
    setBusinessId(storedId);
  }, []);

  // Fetch campaigns from backend API: GET /api/businesses/:businessId/campaigns
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useBusinessCampaigns(businessId);

  // Fetch all business participants from backend API
  const { data: participantsData } = useBusinessParticipants(businessId);
  const participantsList = participantsData?.participants || [];
  const pendingOrdersCount = participantsList.filter(
    (p) => p.orderStatus === "pending"
  ).length;

  // Cached fallback business info from registration if API is pending
  const cachedBusiness = isMounted ? getStoredBusiness() : null;
  const business = data?.business || cachedBusiness;
  const campaigns: ApiCampaignItem[] = data?.campaigns || [];

  // Computed metrics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(
    (c) => c.status === "active" || (!c.status && true)
  ).length;
  const totalParticipants =
    participantsList.length > 0
      ? participantsList.length
      : campaigns.reduce(
        (sum, c) => sum + (Number(c.totalParticipants) || 0),
        0
      );
  const totalReferrals = campaigns.reduce(
    (sum, c) => sum + (Number(c.totalReferrals) || 0),
    0
  );

  const copyLink = (slugOrId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/c/${slugOrId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slugOrId);
    toast.success("Public campaign link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Topbar
        title="Dashboard"
        actions={
          <div className="flex items-center gap-2.5">
            {businessId && (
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="btn btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5"
                title="Refresh campaigns"
              >
                <RefreshCw
                  size={14}
                  className={isFetching ? "animate-spin text-[var(--color-primary)]" : ""}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            <Link
              href={ROUTES.newCampaign}
              className="btn btn-primary px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={16} />
              <span>New Campaign</span>
            </Link>
          </div>
        }
      />

      <main className="flex-1 p-3.5 sm:p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
        {/* State: No Business Registered yet */}
        {isMounted && !businessId && (
          <div className="card-glow p-6 sm:p-8 mb-8 border-2 border-[var(--color-primary)]/20 animate-scale-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="badge badge-warning mb-2 text-xs">
                  Setup Required
                </span>
                <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                  Connect or Register Your Business
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-xl">
                  No registered business ID found in your browser session.
                  Register your business to start creating and tracking referral
                  campaigns.
                </p>
              </div>
              <Link
                href="/register"
                className="btn btn-primary px-5 py-2.5 text-sm shrink-0 flex items-center gap-2 shadow-sm"
              >
                <span>Register Business</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* State: API Error */}
        {isError && (
          <div className="p-4 mb-6 rounded-2xl bg-[var(--color-error-soft)] border border-[rgba(220,38,38,0.25)] text-[var(--color-error)] text-sm flex items-center justify-between gap-3 animate-scale-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} className="shrink-0" />
              <span>
                {error?.message || "Failed to load campaigns from the backend API."}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="btn btn-ghost text-xs px-3 py-1 border-[var(--color-error)] text-[var(--color-error)] hover:bg-[var(--color-error)]/10"
            >
              Retry
            </button>
          </div>
        )}

        {/* Welcome Banner */}
        <div className="card-glow p-6 sm:p-8 mb-8 relative overflow-hidden animate-fade-in-up">
          <div className="absolute -top-10 -right-10 w-52 h-52 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
                  Welcome back, {business?.name || "Business"}! 👋
                </h1>
                {business?.subsStatus && (
                  <span
                    className={
                      business.subsStatus.toLowerCase() === "subscriber"
                        ? "badge badge-warning text-xs font-bold"
                        : "badge badge-primary text-xs font-bold"
                    }
                  >
                    <Crown size={12} className="inline mr-1" />
                    {business.subsStatus}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {isLoading ? (
                  <span className="opacity-70">Fetching campaign analytics...</span>
                ) : totalCampaigns > 0 ? (
                  <span>
                    You have{" "}
                    <strong className="text-[var(--color-primary)]">
                      {activeCampaigns} active campaign
                      {activeCampaigns === 1 ? "" : "s"}
                    </strong>{" "}
                    running with{" "}
                    <strong className="text-[var(--color-text-primary)]">
                      {totalReferrals} total referral
                      {totalReferrals === 1 ? "" : "s"}
                    </strong>
                    .
                  </span>
                ) : (
                  <span>
                    Your business is ready. Launch your first campaign to reward
                    customers for referring their friends.
                  </span>
                )}
              </p>
            </div>

            {business?.id && (
              <div className="text-xs bg-[var(--color-bg-base)]/80 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[var(--color-border-default)] self-start md:self-auto flex items-center gap-1.5 text-[var(--color-text-muted)]">
                <span>Business ID:</span>
                <code className="font-mono text-[var(--color-text-primary)] font-semibold">
                  {business.id}
                </code>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4 mb-8">
          {/* Card 1: Total Campaigns */}
          <div className="card p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Campaigns
              </span>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center">
                <Megaphone size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              {isLoading ? "—" : totalCampaigns}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {activeCampaigns} active now
            </p>
          </div>

          {/* Card 2: Active Campaigns */}
          <div className="card p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Active Campaigns
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[var(--color-success)] flex items-center justify-center">
                <Sparkles size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-success)]">
              {isLoading ? "—" : activeCampaigns}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Currently generating leads
            </p>
          </div>

          {/* Card 3: Total Participants */}
          <div className="card p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Participants
              </span>
              <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Users size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)]">
              {isLoading ? "—" : totalParticipants}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Advocates registered
            </p>
          </div>

          {/* Card 4: Total Referrals */}
          <div className="card p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Total Referrals
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-[var(--color-warning)] flex items-center justify-center">
                <LinkIcon size={16} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[var(--color-primary)]">
              {isLoading ? "—" : totalReferrals}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Converted friends
            </p>
          </div>

          {/* Card 5: Pending Approvals */}
          <div className="card p-3.5 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)]">
                Pending Orders
              </span>
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${pendingOrdersCount > 0
                    ? "bg-amber-100 text-amber-700 animate-pulse"
                    : "bg-slate-100 text-slate-500"
                  }`}
              >
                <Clock size={16} />
              </div>
            </div>
            <div
              className={`text-2xl sm:text-3xl font-extrabold ${pendingOrdersCount > 0
                  ? "text-amber-600"
                  : "text-[var(--color-text-primary)]"
                }`}
            >
              {pendingOrdersCount}
            </div>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {pendingOrdersCount > 0
                ? "Action needed in table below"
                : "All orders verified"}
            </p>
          </div>
        </div>

        {/* Participant Orders & Confirmations Table against Specific Campaigns */}
        {businessId && (
          <ParticipantOrdersTable
            businessId={businessId}
            campaigns={campaigns}
            selectedCampaignId={selectedCampaignId}
            onSelectCampaign={setSelectedCampaignId}
          />
        )}

        {/* Campaigns Section */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[var(--color-text-primary)]">
              Your Campaigns ({campaigns.length})
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Live referral campaigns fetched directly from your account
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.newCampaign}
              className="btn btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>New Campaign</span>
            </Link>
          </div>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="flex flex-col gap-3.5">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="card p-5 animate-pulse flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-2.5 w-full sm:w-1/2">
                  <div className="h-5 bg-[var(--color-bg-subtle)] rounded-md w-3/4" />
                  <div className="h-3.5 bg-[var(--color-bg-subtle)] rounded-md w-1/2" />
                </div>
                <div className="h-8 bg-[var(--color-bg-subtle)] rounded-lg w-24 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State: No Campaigns Created */}
        {!isLoading && campaigns.length === 0 && (
          <div className="card p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-xl mx-auto my-6 border-dashed border-2">
            <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-4 shadow-sm">
              <Gift size={32} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              No referral campaigns yet
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] mt-1.5 mb-6 max-w-sm">
              Create your first referral campaign to generate your unique link,
              reward customers, and build your leaderboard!
            </p>
            <Link
              href={ROUTES.newCampaign}
              className="btn btn-primary px-6 py-2.5 text-sm font-semibold flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} />
              <span>Create First Campaign</span>
            </Link>
          </div>
        )}

        {/* Campaigns List */}
        {!isLoading && campaigns.length > 0 && (
          <div className="flex flex-col gap-4">
            {campaigns.map((c) => {
              const cName = c.name || c.title || "Referral Campaign";
              const cSlug = c.slug || c.id;
              const isCopied = copiedId === cSlug;

              // Check live dates
              const now = new Date();
              const startDate = c.startDateTime ? new Date(c.startDateTime) : null;
              const endDate = c.endDateTime ? new Date(c.endDateTime) : null;

              let statusText = "Active";
              let statusClass = "badge-success";
              if (startDate && now < startDate) {
                statusText = "Scheduled";
                statusClass = "badge-info";
              } else if (endDate && now > endDate) {
                statusText = "Ended";
                statusClass = "badge-error";
              }

              // Participants registered specifically for this campaign
              const campParts = participantsList.filter((p) => p.campaignId === c.id);
              const campPending = campParts.filter((p) => p.orderStatus === "pending").length;
              const isFilterActive = selectedCampaignId === c.id;

              return (
                <div
                  key={c.id}
                  className={`card p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all ${
                    isFilterActive
                      ? "ring-2 ring-[var(--color-primary)] border-[var(--color-primary)] shadow-md"
                      : "hover:border-[var(--color-border-strong)]"
                  }`}
                >
                  {/* Left: Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Link
                        href={ROUTES.campaignLeaderboard(c.id)}
                        className="font-black text-lg text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors truncate"
                      >
                        {cName}
                      </Link>
                      <span className={`badge ${statusClass} text-[0.68rem] capitalize font-bold`}>
                        {statusText}
                      </span>
                      {campPending > 0 && (
                        <span className="badge badge-warning text-[0.68rem] font-bold animate-pulse">
                          {campPending} Pending Order{campPending === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>

                    {/* Slug & Public Page URL */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap text-xs">
                      <span className="text-[var(--color-text-muted)] font-medium">
                        Public Link:
                      </span>
                      <Link
                        href={`/c/${cSlug}`}
                        target="_blank"
                        className="font-mono text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1"
                      >
                        <span>/c/{cSlug}</span>
                        <ExternalLink size={11} />
                      </Link>
                    </div>

                    {/* Tier Discounts Breakdown */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] font-medium">
                        <Gift size={13} className="text-[var(--color-primary)]" />
                        <span>
                          Tiers: <strong>{c.tier1Pct ?? 15}%</strong> /{" "}
                          <strong>{c.tier2Pct ?? 8}%</strong> /{" "}
                          <strong>{c.tier3Pct ?? 3}%</strong>
                        </span>
                        <span className="text-[var(--color-text-muted)]">
                          (Cap: {c.maxDiscountCapPct ?? 40}%)
                        </span>
                      </div>

                      {startDate && (
                        <span className="flex items-center gap-1 text-[var(--color-text-muted)] text-[0.72rem]">
                          <Calendar size={12} />
                          <span>Started {formatDate(startDate.toISOString())}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle: Metrics & Campaign Stats */}
                  <div className="grid grid-cols-3 gap-2 py-2.5 border-y lg:border-y-0 lg:border-x border-[var(--color-border-subtle)] lg:px-6 shrink-0 lg:min-w-[260px] text-center">
                    <div className="text-center">
                      <p className="text-xl font-black text-[var(--color-text-primary)] leading-tight">
                        {campParts.length}
                      </p>
                      <p className="text-[0.68rem] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                        Participants
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-amber-600 leading-tight">
                        {campPending}
                      </p>
                      <p className="text-[0.68rem] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                        Pending
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-[var(--color-primary)] leading-tight">
                        {campParts.filter((p) => p.orderStatus === "confirmed").length}
                      </p>
                      <p className="text-[0.68rem] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold">
                        Confirmed
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap justify-start lg:justify-end">
                    {/* View Participants & Confirm Orders for this campaign */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCampaignId(c.id);
                        const el = document.getElementById("participant-orders-section");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                      className={`btn px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-2xs ${
                        isFilterActive
                          ? "btn-primary"
                          : campPending > 0
                            ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                            : "btn-secondary"
                      }`}
                      title="Filter and manage participant orders for this campaign"
                    >
                      <Users size={14} />
                      <span>
                        {isFilterActive
                          ? "Showing Orders"
                          : campPending > 0
                            ? `Verify Orders (${campPending})`
                            : "View Orders"}
                      </span>
                    </button>

                    {/* Leaderboard Link */}
                    <Link
                      href={ROUTES.campaignLeaderboard(c.id)}
                      className="btn btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      title="View live ranked leaderboard"
                    >
                      <Trophy size={14} className="text-amber-500" />
                      <span>Leaderboard</span>
                    </Link>

                    {/* Copy Link */}
                    <button
                      type="button"
                      onClick={(e) => copyLink(cSlug, e)}
                      className="btn btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5 font-semibold"
                      title="Copy public invitation link"
                    >
                      {isCopied ? (
                        <>
                          <Check size={14} className="text-[var(--color-success)]" />
                          <span className="text-[var(--color-success)]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          <span className="hidden sm:inline">Copy Link</span>
                        </>
                      )}
                    </button>

                    {/* Open Public Page */}
                    <Link
                      href={`/c/${cSlug}`}
                      target="_blank"
                      className="btn btn-ghost px-2.5 py-1.5 text-xs"
                      title="Preview public campaign landing page"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
