"use client";

import React from "react";
import toast from "react-hot-toast";
import {
  RotateCcw,
  TrendingUp,
  Users,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Percent,
  Sparkles,
  Ticket,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useParticipantSummary } from "@/lib/api/participant";

interface ParticipantStatusCardProps {
  participantId: string;
  campaignName?: string;
  onBackToShare?: () => void;
}

export function ParticipantStatusCard({
  participantId,
  campaignName,
  onBackToShare,
}: ParticipantStatusCardProps) {
  const { data, isLoading, isError, error, refetch, isFetching } =
    useParticipantSummary(participantId);

  const handleManualRefresh = async () => {
    try {
      await refetch();
      toast.success("Referral status updated!");
    } catch {
      toast.error("Failed to refresh status.");
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6 sm:p-8 animate-fade-in text-center flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-3" />
        <p className="text-sm font-semibold text-[var(--color-text-secondary)]">
          Fetching your referral & discount status...
        </p>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="card p-6 sm:p-8 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
          <AlertCircle size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--color-text-primary)]">
          Unable to Load Status
        </h3>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1 max-w-sm">
          {error?.message || "Participant summary could not be retrieved."}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="btn btn-secondary mt-4 text-xs font-semibold px-4 py-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { participant, metrics, ledgerDetails } = data;
  const isConfirmed = participant.orderStatus === "confirmed";

  // Calculate discount progress percentage toward cap
  const maxCap = metrics.maxDiscountCapPct || 100;
  const progressPct = Math.min(
    100,
    Math.round((metrics.applicableDiscountPct / (maxCap || 1)) * 100)
  );

  return (
    <div className="card p-5 sm:p-7 animate-scale-in flex flex-col gap-5 text-left border border-[var(--color-border)] shadow-xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="badge badge-primary text-[0.68rem] font-bold">
              Participant Dashboard
            </span>
            <span
              className={`badge text-[0.68rem] font-bold ${
                isConfirmed ? "badge-success" : "bg-amber-100 text-amber-800 border-amber-200"
              }`}
            >
              Order: {participant.orderStatus.toUpperCase()}
            </span>
          </div>
          <h3 className="text-xl font-black text-[var(--color-text-primary)] tracking-tight">
            {participant.name}
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Referral Code:{" "}
            <span className="font-mono font-bold text-indigo-600">
              {participant.referralCode}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isFetching}
          className="btn btn-secondary text-xs px-2.5 py-1.5 font-semibold flex items-center gap-1.5 shrink-0 hover:bg-slate-100"
          title="Refresh live metrics"
        >
          <RotateCcw
            size={13}
            className={isFetching ? "animate-spin text-[var(--color-primary)]" : ""}
          />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Primary Reward Progress Highlight */}
      <div className="bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl p-4 sm:p-5 border border-indigo-200/60 relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-950 flex items-center gap-1.5">
            <Percent size={14} className="text-indigo-600" />
            <span>Active Discount Unlocked</span>
          </span>
          <span className="text-xs font-semibold text-indigo-700">
            Cap: {maxCap}% Max
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-black text-indigo-950 tracking-tight">
            {metrics.applicableDiscountPct}%
          </span>
          <span className="text-xs sm:text-sm font-bold text-indigo-700">
            OFF your purchase
          </span>
          {metrics.totalEarnedPct > metrics.applicableDiscountPct && (
            <span className="text-[0.7rem] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-semibold ml-auto">
              {metrics.totalEarnedPct}% Earned (Capped)
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-indigo-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-[0.72rem] text-indigo-900/80 mt-2">
          {progressPct >= 100
            ? "Maximum discount cap reached! You have unlocked the full reward."
            : `Earned ${metrics.applicableDiscountPct}% out of maximum allowed ${maxCap}% discount cap.`}
        </p>
      </div>

      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Direct Referrals */}
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-center">
          <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-1.5">
            <Users size={15} />
          </div>
          <span className="block text-lg sm:text-xl font-black text-[var(--color-text-primary)]">
            {metrics.directReferrals}
          </span>
          <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">
            Direct Friends (Tier 1)
          </span>
        </div>

        {/* Indirect Referrals */}
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-center">
          <div className="w-7 h-7 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-1.5">
            <TrendingUp size={15} />
          </div>
          <span className="block text-lg sm:text-xl font-black text-[var(--color-text-primary)]">
            {metrics.indirectReferrals}
          </span>
          <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">
            Network (Tier 2+)
          </span>
        </div>

        {/* Order Status */}
        <div className="p-3 sm:p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-center">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1.5 ${
              isConfirmed
                ? "bg-emerald-100 text-emerald-600"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            {isConfirmed ? <ShieldCheck size={15} /> : <Clock size={15} />}
          </div>
          <span className="block text-sm sm:text-base font-extrabold capitalize text-[var(--color-text-primary)] truncate">
            {participant.orderStatus}
          </span>
          <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">
            Order Verification
          </span>
        </div>
      </div>

      {/* Rewards Ledger History */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--color-primary)]" />
            <span>Referral Rewards Ledger ({ledgerDetails.length})</span>
          </span>
        </div>

        {ledgerDetails.length === 0 ? (
          <div className="p-5 rounded-xl bg-[var(--color-surface-subtle)] border border-dashed border-[var(--color-border)] text-center">
            <Ticket size={24} className="mx-auto text-[var(--color-text-muted)] mb-2 opacity-50" />
            <p className="text-xs font-semibold text-[var(--color-text-secondary)]">
              No confirmed referral rewards yet
            </p>
            <p className="text-[0.72rem] text-[var(--color-text-muted)] mt-1 max-w-xs mx-auto">
              Share your personal link with friends! When they make an order, your reward will automatically appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {ledgerDetails.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-white border border-[var(--color-border-subtle)] shadow-2xs flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    T{item.tierLevel}
                  </div>
                  <div className="min-w-0">
                    <span className="block font-bold text-[var(--color-text-primary)] truncate">
                      Tier {item.tierLevel} Referral
                    </span>
                    <span className="text-[0.68rem] text-[var(--color-text-muted)]">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="block font-black text-emerald-600 text-sm">
                    +{item.discountPercent}%
                  </span>
                  <span className="text-[0.65rem] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold capitalize">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Back to Share Link action */}
      {onBackToShare && (
        <button
          type="button"
          onClick={onBackToShare}
          className="btn btn-secondary w-full text-xs font-bold py-2.5 flex items-center justify-center gap-1.5 mt-1"
        >
          <span>View My Invite Link & Share Options</span>
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}
