import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CheckCircle2,
  Copy,
  Check,
  Share2,
  MessageCircle,
  Gift,
  Sparkles,
  Ticket,
  Percent,
  TrendingUp,
  Activity,
  Clock,
  RotateCcw,
  Lock,
  AlertCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { useLookupParticipant, type ParticipantData } from "@/lib/api/participant";
import { ParticipantStatusCard } from "./ParticipantStatusCard";

interface ParticipantSuccessViewProps {
  participant: ParticipantData;
  shareableLink: string;
  campaignName: string;
  tier1Pct?: number;
  tier2Pct?: number;
  tier3Pct?: number;
  maxDiscountCapPct?: number;
  initialTab?: "share" | "status";
  onParticipantUpdated?: (updated: ParticipantData) => void;
}

// Custom inline Instagram Icon
function InstagramIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

export function ParticipantSuccessView({
  participant,
  shareableLink,
  campaignName,
  tier1Pct,
  tier2Pct,
  tier3Pct,
  maxDiscountCapPct,
  initialTab = "share",
  onParticipantUpdated,
}: ParticipantSuccessViewProps) {
  const [currentParticipant, setCurrentParticipant] = useState<ParticipantData>(participant);
  const [activeTab, setActiveTab] = useState<"share" | "status">(initialTab);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const lookupMutation = useLookupParticipant();

  // Sync state if participant prop changes
  useEffect(() => {
    setCurrentParticipant(participant);
  }, [participant]);

  const isConfirmed = currentParticipant.orderStatus === "confirmed";
  const referralCode = currentParticipant.referralCode;

  // Background polling every 5s while order is pending
  useEffect(() => {
    if (isConfirmed) return;

    const interval = setInterval(() => {
      lookupMutation.mutate(
        { participantId: currentParticipant.id },
        {
          onSuccess: (data) => {
            if (data?.participant) {
              if (data.participant.orderStatus !== currentParticipant.orderStatus) {
                setCurrentParticipant(data.participant);
                onParticipantUpdated?.(data.participant);
                if (data.participant.orderStatus === "confirmed") {
                  toast.success("🎉 Your order has been confirmed! Referral code is now unlocked!");
                }
              }
            }
          },
        }
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [currentParticipant.id, currentParticipant.orderStatus, isConfirmed, onParticipantUpdated]);

  // Manual status check
  const handleCheckStatus = (isManual = true) => {
    if (isCheckingStatus) return;
    setIsCheckingStatus(true);

    lookupMutation.mutate(
      { participantId: currentParticipant.id },
      {
        onSuccess: (data) => {
          setIsCheckingStatus(false);
          if (data?.participant) {
            setCurrentParticipant(data.participant);
            onParticipantUpdated?.(data.participant);
            if (data.participant.orderStatus === "confirmed") {
              toast.success("🎉 Great news! Your order is confirmed and your referral code is unlocked!");
            } else if (isManual) {
              toast("Status: Still pending confirmation by the store owner.", {
                icon: "⏳",
              });
            }
          }
        },
        onError: (err: any) => {
          setIsCheckingStatus(false);
          if (isManual) {
            toast.error(err?.response?.data?.error || "Could not check status right now. Please try again.");
          }
        },
      }
    );
  };

  // Personalized share message
  const shareMessage = `Hey! I just joined "${campaignName}". Use my invite link or referral code "${referralCode}" to get discounts! Check it out: ${shareableLink}`;

  const copyToClipboard = async (text: string, isCode = false) => {
    if (!isConfirmed) {
      toast.error("Referral code is locked until the store owner confirms your order.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      if (isCode) {
        setCopiedCode(true);
        toast.success(`Referral code "${referralCode}" copied!`);
        setTimeout(() => setCopiedCode(false), 2200);
      } else {
        setCopiedLink(true);
        toast.success("Referral link copied to clipboard!");
        setTimeout(() => setCopiedLink(false), 2200);
      }
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  };

  // Social URLs
  const encodedMsg = encodeURIComponent(shareMessage);
  const encodedUrl = encodeURIComponent(shareableLink);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Join "${campaignName}" using my invite code ${referralCode}!`
  )}&url=${encodedUrl}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const handleInstagramShare = async () => {
    if (!isConfirmed) {
      toast.error("Sharing is locked until the store owner confirms your order.");
      return;
    }
    await copyToClipboard(shareMessage);
    toast.success("Referral link copied! Opening Instagram...");
    setTimeout(() => {
      window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener,noreferrer");
    }, 400);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top Tab Navigator: Share & Invite vs My Discount Status */}
      <div className="flex items-center justify-center p-1 bg-slate-200/80 rounded-2xl shadow-inner max-w-sm mx-auto w-full">
        <button
          type="button"
          onClick={() => setActiveTab("share")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "share"
              ? "bg-white text-[var(--color-primary)] shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {isConfirmed ? <Gift size={14} /> : <Clock size={14} />}
          <span>{isConfirmed ? "Invite & Share" : "Status & Code"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("status")}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "status"
              ? "bg-white text-indigo-700 shadow-xs"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <Activity size={14} />
          <span>My Discount Status</span>
        </button>
      </div>

      {activeTab === "status" ? (
        <ParticipantStatusCard
          participantId={currentParticipant.id}
          campaignName={campaignName}
          onBackToShare={() => setActiveTab("share")}
        />
      ) : isConfirmed ? (
        /* ─────────────────────────────────────────────────────────────
           STATE A: CONFIRMED & UNLOCKED — Referral Code and Sharing Active
        ───────────────────────────────────────────────────────────── */
        <div className="card p-4 sm:p-6 md:p-8 animate-scale-in text-center flex flex-col gap-5 sm:gap-6 shadow-xl border border-[var(--color-border)]">
          {/* Celebration Header */}
          <div>
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-sm ring-6 sm:ring-8 ring-emerald-50">
              <CheckCircle2 size={32} />
            </div>

            <span className="badge badge-success text-xs font-bold mb-2">
              Verified & Order Confirmed
            </span>

            <h2 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Welcome, {currentParticipant.name}!
            </h2>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-md mx-auto leading-relaxed">
              Your order is verified! You are now fully enrolled in <strong>{campaignName}</strong>. Share your unique code or link to start earning discounts!
            </p>
          </div>

          {/* Active Referral Code Box */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/50 to-pink-50/80 rounded-2xl p-4 sm:p-5 border border-indigo-100 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-900">
                <Ticket size={15} className="text-indigo-600" />
                <span>Your Personal Referral Code</span>
              </div>
              <span className="text-[0.7rem] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>Active</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white rounded-xl p-3 border border-indigo-200 shadow-xs">
              <span className="text-lg sm:text-2xl font-black tracking-widest text-indigo-700 font-mono select-all truncate">
                {referralCode}
              </span>
              <button
                type="button"
                id="btn-copy-code"
                onClick={() => copyToClipboard(referralCode, true)}
                className="btn btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                {copiedCode ? (
                  <>
                    <Check size={14} className="text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Personal Link Box */}
          <div className="text-left flex flex-col gap-2">
            <label
              htmlFor="personal-share-link"
              className="text-xs font-bold text-[var(--color-text-secondary)] flex items-center gap-1.5"
            >
              <Share2 size={14} className="text-[var(--color-primary)]" />
              <span>Your Direct Invite Link</span>
            </label>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                id="personal-share-link"
                type="text"
                readOnly
                value={shareableLink}
                className="input-base text-xs sm:text-sm font-mono truncate bg-[var(--color-surface-subtle)] flex-1 min-h-[42px] sm:min-h-0"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                type="button"
                id="btn-copy-link"
                onClick={() => copyToClipboard(shareableLink, false)}
                className="btn btn-primary px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-sm min-h-[42px] sm:min-h-0"
              >
                {copiedLink ? (
                  <>
                    <Check size={15} />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy size={15} />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Share on Social Media */}
          <div className="text-left flex flex-col gap-2.5 pt-2 border-t border-[var(--color-border-subtle)]">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Share Instantly with Friends
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {/* WhatsApp */}
              <a
                id="btn-share-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 transition-all flex items-center gap-2 font-semibold text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <MessageCircle size={15} />
                </div>
                <span className="truncate">WhatsApp</span>
              </a>

              {/* Instagram */}
              <button
                id="btn-share-instagram"
                type="button"
                onClick={handleInstagramShare}
                className="p-3 rounded-xl border border-pink-200 bg-pink-50/70 hover:bg-pink-100/80 text-pink-900 transition-all flex items-center gap-2 font-semibold text-xs text-left cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center shrink-0">
                  <InstagramIcon size={15} />
                </div>
                <span className="truncate">Instagram</span>
              </button>

              {/* Twitter / X */}
              <a
                id="btn-share-twitter"
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all flex items-center gap-2 font-semibold text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  𝕏
                </div>
                <span className="truncate">Twitter / 𝕏</span>
              </a>

              {/* Facebook */}
              <a
                id="btn-share-facebook"
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 transition-all flex items-center gap-2 font-semibold text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold text-sm">
                  f
                </div>
                <span className="truncate">Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                id="btn-share-linkedin"
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl border border-sky-200 bg-sky-50/70 hover:bg-sky-100/80 text-sky-800 transition-all flex items-center gap-2 font-semibold text-xs"
              >
                <div className="w-7 h-7 rounded-lg bg-[#0077b5] text-white flex items-center justify-center shrink-0 font-bold text-xs">
                  in
                </div>
                <span className="truncate">LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Button to view status directly */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setActiveTab("status")}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 text-indigo-900 font-bold text-xs sm:text-sm flex items-center justify-between transition-all shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-600" />
                <span>Check My Live Discounts & Referral Status</span>
              </div>
              <span className="text-xs bg-indigo-200/80 text-indigo-800 px-2 py-0.5 rounded-md font-semibold">
                View &rarr;
              </span>
            </button>
          </div>

          {/* Referral Rewards Ladder preview */}
          {(tier1Pct !== undefined || tier2Pct !== undefined || tier3Pct !== undefined) && (
            <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] mb-2.5">
                <Percent size={14} className="text-[var(--color-primary)]" />
                <span>Discounts You Can Earn</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">1st Friend</span>
                  <span className="text-sm font-extrabold text-[var(--color-primary)]">{tier1Pct ?? 0}% OFF</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">2nd Friend</span>
                  <span className="text-sm font-extrabold text-indigo-600">{tier2Pct ?? 0}% OFF</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">3rd+ Friends</span>
                  <span className="text-sm font-extrabold text-emerald-600">{tier3Pct ?? 0}% OFF</span>
                </div>
              </div>

              {maxDiscountCapPct && (
                <p className="text-[0.72rem] text-[var(--color-text-muted)] text-center mt-2">
                  Maximum accumulative discount cap: <strong>{maxDiscountCapPct}%</strong>
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ─────────────────────────────────────────────────────────────
           STATE B: PENDING OWNER CONFIRMATION — Referral Code Locked
        ───────────────────────────────────────────────────────────── */
        <div className="card p-6 sm:p-8 animate-scale-in text-center flex flex-col gap-6 shadow-xl border border-[var(--color-border)]">
          {/* Pending Status Header */}
          <div>
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 shadow-sm ring-8 ring-amber-50">
              <Clock size={36} className="animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              <span>Awaiting Business Confirmation</span>
            </div>

            <h2 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Registration Received, {currentParticipant.name}!
            </h2>

            <p className="text-sm text-[var(--color-text-secondary)] mt-1.5 max-w-md mx-auto">
              Your registration for <strong>{campaignName}</strong> is submitted. Your personal referral code will be released once the business owner confirms your order!
            </p>
          </div>

          {/* Locked Referral Code Box */}
          <div className="bg-gradient-to-br from-slate-50 via-amber-50/40 to-slate-100/70 rounded-2xl p-5 border border-amber-200/80 shadow-sm text-left">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                <Lock size={15} className="text-amber-600" />
                <span>Your Referral Code</span>
              </div>
              <span className="text-[0.7rem] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                <Clock size={11} />
                <span>Locked (Pending Confirmation)</span>
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 bg-white/80 rounded-xl p-3 border border-dashed border-amber-300 shadow-2xs">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-amber-500" />
                <span className="text-xl sm:text-2xl font-black tracking-widest text-slate-400 font-mono select-none">
                  ••••-•••••
                </span>
              </div>
              <button
                type="button"
                disabled
                className="btn btn-secondary px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 shrink-0 opacity-60 cursor-not-allowed"
                title="Code releases upon store confirmation"
              >
                <Lock size={13} />
                <span>Locked</span>
              </button>
            </div>

            <p className="text-[0.72rem] text-slate-500 mt-2 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-amber-600 shrink-0" />
              <span>
                Your unique code and shareable invite link will unlock automatically right after the merchant confirms your purchase.
              </span>
            </p>
          </div>

          {/* Status Check & Auto Refresh Panel */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200 text-left flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 block">
                  How does confirmation work?
                </span>
                <span className="text-xs text-amber-900/90 mt-0.5 block">
                  1. Complete your purchase with the merchant (cash, DM, or store payment).<br />
                  2. The store owner marks your order as <strong>Confirmed</strong> in their dashboard.<br />
                  3. Your code is instantly unlocked and you can start referring friends!
                </span>
              </div>
            </div>

            {/* Manual Check Status Button */}
            <div className="pt-1">
              <button
                type="button"
                id="btn-check-status-refresh"
                onClick={() => handleCheckStatus(true)}
                disabled={isCheckingStatus || lookupMutation.isPending}
                className="btn btn-primary w-full py-3 px-4 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                {isCheckingStatus || lookupMutation.isPending ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Checking Store Status...</span>
                  </>
                ) : (
                  <>
                    <RotateCcw size={16} />
                    <span>Check Status / Refresh Now</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[0.72rem] text-slate-500">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse inline-block" />
              <span>Auto-refreshing status in background every few seconds</span>
            </div>
          </div>

          {/* Referral Rewards Ladder preview */}
          {(tier1Pct !== undefined || tier2Pct !== undefined || tier3Pct !== undefined) && (
            <div className="p-4 rounded-xl bg-[var(--color-surface-subtle)] border border-[var(--color-border-subtle)] text-left">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-text-primary)] mb-2.5">
                <Percent size={14} className="text-[var(--color-primary)]" />
                <span>Rewards You Will Unlock Once Confirmed</span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">1st Friend</span>
                  <span className="text-sm font-extrabold text-[var(--color-primary)]">{tier1Pct ?? 0}% OFF</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">2nd Friend</span>
                  <span className="text-sm font-extrabold text-indigo-600">{tier2Pct ?? 0}% OFF</span>
                </div>
                <div className="p-2.5 rounded-lg bg-white border border-[var(--color-border-subtle)] shadow-2xs">
                  <span className="block text-[0.68rem] text-[var(--color-text-muted)] font-medium">3rd+ Friends</span>
                  <span className="text-sm font-extrabold text-emerald-600">{tier3Pct ?? 0}% OFF</span>
                </div>
              </div>

              {maxDiscountCapPct && (
                <p className="text-[0.72rem] text-[var(--color-text-muted)] text-center mt-2">
                  Maximum accumulative discount cap: <strong>{maxDiscountCapPct}%</strong>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

