"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import Topbar from "@/components/Topbar";
import { ROUTES } from "@/lib/constants";
import { useCampaignById, useCampaignLeaderboard } from "@/lib/api/campaign";
import { useBusinessParticipants, getStoredBusinessId } from "@/lib/api/business";
import { formatDate } from "@/lib/utils";
import {
  Trophy,
  Copy,
  Check,
  ExternalLink,
  Users,
  Gift,
  Calendar,
  Layers,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export function CampaignDetailContent({ campaignId }: { campaignId: string }) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBusinessId(getStoredBusinessId());
  }, []);

  const { data: campaignData, isLoading, error } = useCampaignById(campaignId);
  const { data: leaderboardData } = useCampaignLeaderboard(campaignId);
  const { data: participantsData } = useBusinessParticipants(businessId);

  const campaign = campaignData?.campaign;
  const leaderboard = leaderboardData?.leaderboard || [];
  const participants = (participantsData?.participants || []).filter(
    (p) => p.campaignId === campaignId
  );
  const confirmedCount = participants.filter((p) => p.orderStatus === "confirmed").length;
  const pendingCount = participants.filter((p) => p.orderStatus === "pending").length;

  const publicUrl = typeof window !== "undefined" && campaign?.slug
    ? `${window.location.origin}/c/${campaign.slug}`
    : "";

  const copyPublicLink = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Public campaign link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
          <p className="text-sm text-[var(--color-text-muted)] font-medium">
            Loading campaign details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center flex flex-col items-center gap-3">
          <AlertCircle size={40} className="text-red-500" />
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
            Campaign Not Found
          </h2>
          <p className="text-xs text-[var(--color-text-muted)]">
            Could not find campaign details for ID: {campaignId}.
          </p>
          <Link href={ROUTES.campaigns} className="btn btn-secondary text-xs mt-3">
            ← Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  const now = new Date();
  const startDate = campaign.startDateTime ? new Date(campaign.startDateTime) : null;
  const endDate = campaign.endDateTime ? new Date(campaign.endDateTime) : null;

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
    <>
      <Topbar
        title={campaign.name}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.campaignLeaderboard(campaignId)}
              className="btn btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              <Trophy size={14} className="text-amber-500" />
              <span>Leaderboard</span>
            </Link>
            <Link
              href={ROUTES.dashboard}
              className="btn btn-ghost px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </Link>
          </div>
        }
      />

      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-6xl mx-auto w-full overflow-y-auto space-y-5 sm:space-y-6">
        {/* Top Info Banner */}
        <div className="card p-4 sm:p-6 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                  {campaign.name}
                </h1>
                <span className={`badge ${statusClass} text-xs font-bold capitalize`}>
                  {statusText}
                </span>
              </div>
              <p className="text-xs font-mono text-[var(--color-text-muted)] mt-1 break-all">
                ID: {campaign.id} · Slug: /c/{campaign.slug}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={copyPublicLink}
                className="btn btn-primary px-3 py-2 text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied!" : "Copy Public Link"}</span>
              </button>

              <Link
                href={`/c/${campaign.slug}`}
                target="_blank"
                className="btn btn-secondary px-3 py-2 text-xs font-bold flex items-center gap-1.5"
              >
                <span>View Public Page</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-[var(--color-border-subtle)]">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
              <span className="text-[0.7rem] uppercase font-bold text-[var(--color-text-muted)] block">
                Total Participants
              </span>
              <span className="text-xl font-black text-slate-900 mt-1 block">
                {participants.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70">
              <span className="text-[0.7rem] uppercase font-bold text-emerald-700 block">
                Confirmed Orders
              </span>
              <span className="text-xl font-black text-emerald-800 mt-1 block">
                {confirmedCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/70">
              <span className="text-[0.7rem] uppercase font-bold text-amber-700 block">
                Pending Verification
              </span>
              <span className="text-xl font-black text-amber-800 mt-1 block">
                {pendingCount}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-200/70">
              <span className="text-[0.7rem] uppercase font-bold text-indigo-700 block">
                Max Discount Cap
              </span>
              <span className="text-xl font-black text-indigo-800 mt-1 block">
                {campaign.maxDiscountCapPct}%
              </span>
            </div>
          </div>
        </div>

        {/* Tier Percentages & Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="text-[var(--color-primary)]" size={18} />
                <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                  Tiered Referral Commissions
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-4 leading-relaxed">
                When a participant refers new buyers who get their orders verified, commission percentage discounts propagate up the tree:
              </p>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[0.7rem] font-black flex items-center justify-center">
                      1
                    </span>
                    <span className="text-xs font-semibold text-slate-800">Direct Referrals (Tier 1)</span>
                  </div>
                  <span className="text-sm font-black text-indigo-600">{campaign.tier1Pct}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-[0.7rem] font-black flex items-center justify-center">
                      2
                    </span>
                    <span className="text-xs font-semibold text-slate-800">Second-Degree (Tier 2)</span>
                  </div>
                  <span className="text-sm font-black text-blue-600">{campaign.tier2Pct}%</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500 text-white text-[0.7rem] font-black flex items-center justify-center">
                      3
                    </span>
                    <span className="text-xs font-semibold text-slate-800">Third-Degree (Tier 3)</span>
                  </div>
                  <span className="text-sm font-black text-cyan-600">{campaign.tier3Pct}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="text-[var(--color-primary)]" size={18} />
                <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                  Campaign Timeline & Dates
                </h3>
              </div>
              <p className="text-xs text-[var(--color-text-muted)] mb-4">
                Active window during which customers can participate and generate referrals.
              </p>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Starts At</span>
                  <span className="text-xs font-bold text-slate-800">
                    {formatDate(campaign.startDateTime)}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Ends At</span>
                  <span className="text-xs font-bold text-slate-800">
                    {campaign.endDateTime ? formatDate(campaign.endDateTime) : "No expiration"}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">Created On</span>
                  <span className="text-xs font-bold text-slate-800">
                    {campaign.createdAt ? formatDate(campaign.createdAt) : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
              <span className="text-xs text-[var(--color-text-muted)] font-medium">
                Public Landing URL
              </span>
              <div className="flex items-center gap-2 font-mono text-xs text-[var(--color-primary)]">
                <span>/c/{campaign.slug}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top 5 Leaderboard Preview */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-amber-500" />
              <h3 className="font-bold text-sm text-[var(--color-text-primary)]">
                Top Referrers
              </h3>
            </div>
            <Link
              href={ROUTES.campaignLeaderboard(campaignId)}
              className="text-xs font-bold text-[var(--color-primary)] hover:underline"
            >
              Full Leaderboard →
            </Link>
          </div>

          {leaderboard.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] py-4 text-center">
              No participant referral activity recorded yet for this campaign.
            </p>
          ) : (
            <div className="space-y-2">
              {leaderboard.slice(0, 5).map((entry, index) => {
                const rank = index + 1;
                const displayName =
                  entry.participantName ||
                  (typeof entry.name === "string" ? entry.name : "Participant");
                const subtitle =
                  (typeof entry.referralCode === "string" ? entry.referralCode : null) ||
                  entry.phone ||
                  "";
                const referrals =
                  entry.referralCount ??
                  (typeof entry.totalDirectReferrals === "number"
                    ? entry.totalDirectReferrals
                    : 0);
                const discountPct =
                  entry.totalDiscountEarnedPct ??
                  (typeof entry.totalEarnedPct === "number"
                    ? entry.totalEarnedPct
                    : 0);

                return (
                  <div
                    key={entry.participantId || index}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
                          rank === 1
                            ? "bg-amber-400 text-slate-900"
                            : rank === 2
                            ? "bg-slate-300 text-slate-900"
                            : rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {rank}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {displayName}
                        </p>
                        {subtitle && (
                          <p className="text-[0.65rem] font-mono text-slate-500">
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-indigo-600 block">
                        {referrals} referrals
                      </span>
                      <span className="text-[0.65rem] text-slate-500">
                        {discountPct}% discount earned
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
