"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Topbar from "@/components/Topbar";
import { ROUTES } from "@/lib/constants";
import {
  useBusinessCampaigns,
  useBusinessParticipants,
  getStoredBusinessId,
  type ApiCampaignItem,
} from "@/lib/api/business";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  Megaphone,
  Users,
  Trophy,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Gift,
  RotateCcw,
  Loader2,
  Clock,
} from "lucide-react";

export function CampaignsContent() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [origin, setOrigin] = useState<string>("");

  useEffect(() => {
    setBusinessId(getStoredBusinessId());
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const {
    data: campaignsData,
    isLoading: isLoadingCampaigns,
    refetch,
    isFetching,
  } = useBusinessCampaigns(businessId);

  const { data: participantsData } = useBusinessParticipants(businessId);

  const campaigns: ApiCampaignItem[] = campaignsData?.campaigns || [];
  const participants = participantsData?.participants || [];

  const getPublicCampaignUrl = (slugOrId: string) => {
    const base =
      origin ||
      (typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
    return `${base}/c/${slugOrId}`;
  };

  const copyLink = (slugOrId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getPublicCampaignUrl(slugOrId);
    navigator.clipboard.writeText(url);
    setCopiedId(slugOrId);
    toast.success("Public campaign link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Topbar
        title="Campaigns"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn btn-secondary px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
              title="Refresh campaigns"
            >
              <RotateCcw
                size={13}
                className={isFetching ? "animate-spin text-[var(--color-primary)]" : ""}
              />
            </button>
            <Link
              href={ROUTES.newCampaign}
              className="btn btn-primary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>New Campaign</span>
            </Link>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              All Campaigns
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Manage your referral campaigns, track discounts, and inspect leaderboards.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {isLoadingCampaigns && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="card p-5 animate-pulse flex flex-col gap-3">
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded mt-4" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingCampaigns && campaigns.length === 0 && (
          <div className="card p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mb-3">
              <Megaphone size={28} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              No campaigns found
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1 mb-5">
              Launch your first referral campaign to turn customers into brand ambassadors.
            </p>
            <Link
              href={ROUTES.newCampaign}
              className="btn btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} />
              <span>Create Campaign</span>
            </Link>
          </div>
        )}

        {/* Campaign cards grid */}
        {!isLoadingCampaigns && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {campaigns.map((c) => {
              const cName = c.name || c.title || "Referral Campaign";
              const cSlug = c.slug || c.id;
              const isCopied = copiedId === cSlug;

              const campParts = participants.filter((p) => p.campaignId === c.id);
              const campPending = campParts.filter((p) => p.orderStatus === "pending").length;

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

              return (
                <div
                  key={c.id}
                  className="card p-5 flex flex-col justify-between gap-4 hover:border-[var(--color-border-strong)] transition-all shadow-xs"
                >
                  <div>
                    {/* Header: Title & Status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h2 className="font-black text-base text-[var(--color-text-primary)] truncate">
                          {cName}
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap text-xs">
                          <span className="font-bold text-[var(--color-primary)] text-[0.7rem] shrink-0">
                            Public Link Preview:
                          </span>
                          <Link
                            href={`/c/${cSlug}`}
                            target="_blank"
                            className="font-mono text-[0.7rem] text-indigo-600 hover:text-indigo-800 font-semibold bg-indigo-50/70 hover:bg-indigo-100 px-1.5 py-0.5 rounded border border-indigo-100 flex items-center gap-1 transition-colors break-all"
                            title="Open public page"
                          >
                            <span>{origin ? `${origin}/c/${cSlug}` : `http://localhost:3000/c/${cSlug}`}</span>
                            <ExternalLink size={10} className="shrink-0" />
                          </Link>
                        </div>
                      </div>
                      <span className={`badge ${statusClass} text-[0.65rem] font-bold capitalize shrink-0`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Tier Percentages */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 my-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-indigo-900 font-semibold">
                        <Gift size={13} className="text-indigo-600" />
                        <span>Tiers:</span>
                      </div>
                      <span className="font-bold text-slate-800">
                        {c.tier1Pct ?? 15}% / {c.tier2Pct ?? 8}% / {c.tier3Pct ?? 3}%
                      </span>
                      <span className="text-[0.68rem] text-slate-500">
                        Cap: {c.maxDiscountCapPct ?? 40}%
                      </span>
                    </div>

                    {/* Stats Pill */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs mb-2">
                      <div className="p-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                        <span className="block text-base font-black text-[var(--color-text-primary)]">
                          {campParts.length}
                        </span>
                        <span className="text-[0.68rem] text-[var(--color-text-muted)] font-medium">
                          Participants
                        </span>
                      </div>
                      <div className="p-2 rounded-lg bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)]">
                        <span
                          className={`block text-base font-black ${
                            campPending > 0 ? "text-amber-600" : "text-emerald-600"
                          }`}
                        >
                          {campPending}
                        </span>
                        <span className="text-[0.68rem] text-[var(--color-text-muted)] font-medium">
                          Pending Orders
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
                    <Link
                      href={ROUTES.campaignLeaderboard(c.id)}
                      className="btn btn-secondary px-2.5 py-1.5 text-xs font-bold flex items-center gap-1 shadow-2xs"
                    >
                      <Trophy size={13} className="text-amber-500" />
                      <span>Leaderboard</span>
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => copyLink(cSlug, e)}
                        className="btn btn-ghost px-2 py-1.5 text-xs font-semibold flex items-center gap-1"
                        title="Copy public referral link"
                      >
                        {isCopied ? (
                          <Check size={13} className="text-emerald-600" />
                        ) : (
                          <Copy size={13} />
                        )}
                        <span className="hidden sm:inline">Link</span>
                      </button>

                      <Link
                        href={`/c/${cSlug}`}
                        target="_blank"
                        className="btn btn-ghost px-2 py-1.5 text-xs"
                        title="Open public page"
                      >
                        <ExternalLink size={13} />
                      </Link>
                    </div>
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
