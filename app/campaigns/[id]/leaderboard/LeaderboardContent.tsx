"use client";

import React from "react";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { ROUTES } from "@/lib/constants";
import { useCampaignLeaderboard, useCampaignById } from "@/lib/api/campaign";
import {
  Trophy,
  Users,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Percent,
  Gift,
  Loader2,
  AlertCircle,
  Medal,
} from "lucide-react";

interface LeaderboardContentProps {
  campaignId: string;
}

const medals = ["🥇", "🥈", "🥉"];

export function LeaderboardContent({ campaignId }: LeaderboardContentProps) {
  // Fetch dynamic campaign details: GET /api/campaigns/:campaignId
  const { data: campaignData, isLoading: isLoadingCampaign } =
    useCampaignById(campaignId);

  // Fetch dynamic leaderboard: GET /api/campaigns/:campaignId/leaderboard
  const {
    data: leaderboardData,
    isLoading: isLoadingLeaderboard,
    isError,
    error,
    refetch,
    isFetching,
  } = useCampaignLeaderboard(campaignId);

  const campaign = campaignData?.campaign;
  const campaignTitle = campaign?.name || campaign?.slug || `Campaign ${campaignId}`;
  const leaderboard = leaderboardData?.leaderboard || [];

  return (
    <>
      <Topbar
        title={`🏆 Leaderboard`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.dashboard}
              className="btn btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </Link>
            {campaign?.slug && (
              <Link
                href={`/c/${campaign.slug}`}
                target="_blank"
                className="btn btn-ghost px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
                title="Preview public campaign landing page"
              >
                <span>Public Page</span>
                <ExternalLink size={12} />
              </Link>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="btn btn-secondary px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1"
              title="Refresh live leaderboard"
            >
              <RotateCcw
                size={13}
                className={isFetching ? "animate-spin text-[var(--color-primary)]" : ""}
              />
            </button>
          </div>
        }
      />

      <main className="flex-1 p-4 sm:p-8 max-w-4xl mx-auto w-full overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="badge badge-primary text-[0.68rem] font-bold">
              Ranked Referrals
            </span>
            {campaign?.slug && (
              <span className="text-xs font-mono text-[var(--color-text-muted)] bg-slate-100 px-2 py-0.5 rounded">
                /c/{campaign.slug}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {isLoadingCampaign ? "Loading campaign..." : campaignTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Real-time ranked advocates earning multi-tier discounts through referrals.
          </p>
        </div>

        {/* Loading state */}
        {isLoadingLeaderboard && (
          <div className="card p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-3" />
            <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
              Fetching live leaderboard rankings...
            </p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="card p-8 text-center flex flex-col items-center justify-center">
            <AlertCircle size={32} className="text-rose-500 mb-2" />
            <h3 className="text-base font-bold text-[var(--color-text-primary)]">
              Failed to load leaderboard
            </h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              {error?.message || "Could not retrieve leaderboard data."}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="btn btn-secondary mt-4 text-xs font-semibold px-4 py-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state: No referrers yet */}
        {!isLoadingLeaderboard && !isError && leaderboard.length === 0 && (
          <div className="card p-10 text-center flex flex-col items-center justify-center border-dashed border-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Trophy size={28} />
            </div>
            <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
              No Referrals Confirmed Yet
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1 mb-5 max-w-md">
              When customers share their unique referral links and orders are verified in the
              dashboard, top referrers will rank here automatically.
            </p>
            {campaign?.slug && (
              <Link
                href={`/c/${campaign.slug}`}
                target="_blank"
                className="btn btn-primary px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <span>Open Public Campaign Page</span>
                <ExternalLink size={13} />
              </Link>
            )}
          </div>
        )}

        {/* Live Podium & Leaderboard Table */}
        {!isLoadingLeaderboard && !isError && leaderboard.length > 0 && (
          <div className="flex flex-col gap-6">
            {/* Top 3 Podium (if >= 2 participants) */}
            {leaderboard.length >= 2 && (
              <div className="flex gap-2 sm:gap-4 justify-center items-end my-4 pt-4">
                {/* 2nd place (left) */}
                {leaderboard[1] && (
                  <div className="flex-1 flex flex-col items-center max-w-[160px]">
                    <div className="w-11 h-11 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm shadow-xs mb-1.5">
                      {leaderboard[1].participantName?.[0]?.toUpperCase() || "2"}
                    </div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-full text-center">
                      🥈 {leaderboard[1].participantName}
                    </p>
                    <p className="text-[0.72rem] text-indigo-600 font-extrabold mb-1">
                      {leaderboard[1].referralCount} referrals
                    </p>
                    <div className="w-full h-24 bg-slate-100 rounded-t-xl border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-slate-400">2</span>
                      <span className="text-[0.68rem] font-bold text-emerald-600">
                        +{leaderboard[1].totalDiscountEarnedPct}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* 1st place (center, highest) */}
                {leaderboard[0] && (
                  <div className="flex-1 flex flex-col items-center max-w-[180px]">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-amber-950 font-black flex items-center justify-center text-base shadow-md ring-4 ring-amber-100 mb-1.5">
                      {leaderboard[0].participantName?.[0]?.toUpperCase() || "1"}
                    </div>
                    <p className="text-sm font-black text-[var(--color-text-primary)] truncate max-w-full text-center">
                      🥇 {leaderboard[0].participantName}
                    </p>
                    <p className="text-xs text-[var(--color-primary)] font-black mb-1">
                      {leaderboard[0].referralCount} referrals
                    </p>
                    <div className="w-full h-32 bg-gradient-to-b from-amber-50 to-amber-100/60 rounded-t-2xl border border-amber-200 flex flex-col items-center justify-center shadow-xs">
                      <span className="text-3xl font-black text-amber-600">1</span>
                      <span className="text-xs font-black text-emerald-600">
                        +{leaderboard[0].totalDiscountEarnedPct}% OFF
                      </span>
                    </div>
                  </div>
                )}

                {/* 3rd place (right) */}
                {leaderboard[2] && (
                  <div className="flex-1 flex flex-col items-center max-w-[160px]">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-sm shadow-xs mb-1.5">
                      {leaderboard[2].participantName?.[0]?.toUpperCase() || "3"}
                    </div>
                    <p className="text-xs font-bold text-[var(--color-text-primary)] truncate max-w-full text-center">
                      🥉 {leaderboard[2].participantName}
                    </p>
                    <p className="text-[0.72rem] text-indigo-600 font-extrabold mb-1">
                      {leaderboard[2].referralCount} referrals
                    </p>
                    <div className="w-full h-20 bg-slate-100 rounded-t-xl border border-slate-200 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-400">3</span>
                      <span className="text-[0.68rem] font-bold text-emerald-600">
                        +{leaderboard[2].totalDiscountEarnedPct}% OFF
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Rankings Table */}
            <div className="card overflow-hidden border border-[var(--color-border)] shadow-sm">
              <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                  All Ranked Referrers ({leaderboard.length})
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold text-[0.68rem] bg-slate-50">
                      <th className="py-2.5 px-4 text-center">Rank</th>
                      <th className="py-2.5 px-4">Participant</th>
                      <th className="py-2.5 px-4">Phone</th>
                      <th className="py-2.5 px-4 text-center">Referrals</th>
                      <th className="py-2.5 px-4 text-right">Discount Earned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border-subtle)]">
                    {leaderboard.map((entry, index) => {
                      const rank = index + 1;
                      const isTop3 = rank <= 3;

                      return (
                        <tr
                          key={entry.participantId || index}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          {/* Rank */}
                          <td className="py-3 px-4 text-center font-bold">
                            {isTop3 ? (
                              <span className="text-base">{medals[rank - 1]}</span>
                            ) : (
                              <span className="text-slate-500 font-mono">#{rank}</span>
                            )}
                          </td>

                          {/* Participant Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold flex items-center justify-center text-xs shrink-0">
                                {entry.participantName?.[0]?.toUpperCase() || "?"}
                              </div>
                              <span className="font-bold text-[var(--color-text-primary)] text-sm">
                                {entry.participantName}
                              </span>
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="py-3 px-4 font-mono text-[var(--color-text-muted)] text-[0.72rem]">
                            {entry.phone}
                          </td>

                          {/* Referral Count */}
                          <td className="py-3 px-4 text-center font-extrabold text-sm text-indigo-700">
                            {entry.referralCount}
                          </td>

                          {/* Discount Percent */}
                          <td className="py-3 px-4 text-right font-black text-emerald-600 text-sm">
                            +{entry.totalDiscountEarnedPct}% OFF
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
