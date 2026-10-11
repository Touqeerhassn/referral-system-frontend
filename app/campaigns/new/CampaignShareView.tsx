"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Plus,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { ROUTES } from "@/lib/constants";

function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}



export interface CampaignShareViewProps {
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
  onReset: () => void;
}

export default function CampaignShareView({
  campaign,
  publicLink,
  onReset,
}: CampaignShareViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    const el = containerRef.current;
    if (el) {
      el.scrollTop = 0;
      el.scrollIntoView({ behavior: "instant", block: "start" });
      let parent = el.parentElement;
      while (parent) {
        if (parent.scrollTop > 0) {
          parent.scrollTop = 0;
        }
        parent = parent.parentElement;
      }
    }
  }, []);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const discountText = campaign.tier1Pct ? `up to ${campaign.tier1Pct}%` : "great rewards";

  // Pre-made sharing message
  const shareMessage = `Hey! Check out our new referral program "${campaign.name}" and earn ${discountText} off: ${publicLink}`;

  // Pre-made customer DM template
  const customerTemplate = `Hi there! 👋 We just launched our new referral rewards program. Refer your friends and you'll get ${discountText} discount when they shop with us!\n\nJoin here: ${publicLink}`;

  const copyToClipboard = (text: string, isTemplate = false) => {
    navigator.clipboard.writeText(text);
    if (isTemplate) {
      setCopiedTemplate(true);
      toast.success("Customer message template copied!");
      setTimeout(() => setCopiedTemplate(false), 2000);
    } else {
      setCopiedLink(true);
      toast.success("Public referral link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Social URLs
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out our new referral program and get ${discountText} off!`)}&url=${encodeURIComponent(publicLink)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicLink)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicLink)}`;

  // Handle Instagram Share
  const handleInstagramShare = () => {
    navigator.clipboard.writeText(shareMessage);
    toast.success("Campaign link copied! Opening Instagram...");
    window.open("https://www.instagram.com/direct/inbox/", "_blank");
  };


  return (
    <div ref={containerRef} className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-3xl w-full mx-auto animate-scale-in">
      {/* Celebration Header */}
      <div className="card-glow p-6 sm:p-8 mb-6 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-4 shadow-sm animate-scale-in">
          <Sparkles size={32} />
        </div>

        <span className="badge badge-success text-xs font-bold mb-2 inline-flex items-center gap-1">
          <CheckCircle2 size={13} />
          <span>Campaign Active</span>
        </span>

        <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-text-primary)] tracking-tight">
          Campaign Launched Successfully! 🎉
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1.5 max-w-lg mx-auto">
          <strong>{campaign.name}</strong> is live. Share your public campaign link with customers on social media, WhatsApp, or direct messages to start getting referrals.
        </p>
      </div>

      {/* Main Public Link Card */}
      <div className="card p-6 sm:p-7 mb-6 flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-muted)] block mb-1">
            Your Public Campaign Link
          </span>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Customers visit this link to join and receive their personal referral code.
          </p>
        </div>

        {/* Link Input with 1-Click Copy */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              readOnly
              value={publicLink}
              className="w-full h-12 pl-3.5 pr-10 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-base)] text-sm font-semibold text-[var(--color-text-primary)] focus:border-[var(--color-primary)] outline-none"
              onClick={() => copyToClipboard(publicLink)}
            />
          </div>

          <button
            type="button"
            onClick={() => copyToClipboard(publicLink)}
            className="btn btn-primary h-12 px-5 text-sm font-semibold shrink-0 flex items-center gap-2 shadow-sm"
          >
            {copiedLink ? (
              <>
                <Check size={16} />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social & Direct Message Share Buttons */}
      <div className="card p-6 sm:p-7 mb-6 flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={18} className="text-[var(--color-primary)]" />
            <h2 className="text-base font-bold text-[var(--color-text-primary)]">
              Share With Customers & Friends
            </h2>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">
            Pick a channel below to send your public referral link immediately:
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 transition-all flex items-center gap-2.5 font-semibold text-xs sm:text-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <MessageCircle size={18} />
            </div>
            <div className="min-w-0">
              <span className="block font-bold truncate">WhatsApp</span>
              <span className="text-[0.7rem] text-emerald-700/80 hidden sm:block">
                Direct chat
              </span>
            </div>
          </a>

          {/* Instagram */}
          <button
            type="button"
            onClick={handleInstagramShare}
            className="p-3.5 rounded-xl border border-pink-200 bg-pink-50/70 hover:bg-pink-100/80 text-pink-900 transition-all flex items-center gap-2.5 font-semibold text-xs sm:text-sm group text-left cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white flex items-center justify-center shrink-0 shadow-xs">
              <InstagramIcon size={18} />
            </div>
            <div className="min-w-0">
              <span className="block font-bold truncate">Instagram</span>
              <span className="text-[0.7rem] text-pink-700/80 hidden sm:block">
                Direct message
              </span>
            </div>
          </button>

          {/* X (Twitter) */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-all flex items-center gap-2.5 font-semibold text-xs sm:text-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-bold text-sm">𝕏</span>
            </div>
            <div className="min-w-0">
              <span className="block font-bold truncate">Twitter / 𝕏</span>
              <span className="text-[0.7rem] text-slate-600 hidden sm:block">
                Post tweet
              </span>
            </div>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-800 transition-all flex items-center gap-2.5 font-semibold text-xs sm:text-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-bold text-base">f</span>
            </div>
            <div className="min-w-0">
              <span className="block font-bold truncate">Facebook</span>
              <span className="text-[0.7rem] text-blue-700/80 hidden sm:block">
                Share post
              </span>
            </div>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/80 text-indigo-800 transition-all flex items-center gap-2.5 font-semibold text-xs sm:text-sm group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="font-bold text-sm">in</span>
            </div>
            <div className="min-w-0">
              <span className="block font-bold truncate">LinkedIn</span>
              <span className="text-[0.7rem] text-indigo-700/80 hidden sm:block">
                Network post
              </span>
            </div>
          </a>
        </div>
      </div>


      {/* Customer DM Ready Template */}
      <div className="card p-6 sm:p-7 mb-8 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
            Ready-Made Customer DM Message
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(customerTemplate, true)}
            className="text-xs font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            {copiedTemplate ? (
              <>
                <Check size={14} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy Message</span>
              </>
            )}
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--color-bg-subtle)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-primary)] font-mono whitespace-pre-wrap leading-relaxed">
          {customerTemplate}
        </div>
      </div>

      {/* Navigation Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="btn btn-ghost w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 order-2 sm:order-1"
        >
          <Plus size={16} />
          <span>Create Another Campaign</span>
        </button>

        <Link
          href={ROUTES.dashboard}
          className="btn btn-primary w-full sm:w-auto px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md order-1 sm:order-2"
        >
          <LayoutDashboard size={16} />
          <span>Go to Dashboard</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
