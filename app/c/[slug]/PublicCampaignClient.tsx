"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  User,
  Phone,
  Ticket,
  Gift,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Percent,
  TrendingUp,
  Search,
  KeyRound,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { InputField } from "@/components/ui/InputField";
import { useCampaignBySlug, CampaignDetails } from "@/lib/api/campaign";
import {
  useJoinCampaign,
  useLookupParticipant,
  ParticipantData,
} from "@/lib/api/participant";
import { ParticipantSuccessView } from "./ParticipantSuccessView";

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: basic phone validation (same as in RegisterForm.tsx)
───────────────────────────────────────────────────────────────────────────── */
function isValidPhone(raw: string): boolean {
  // Strip spaces/dashes/parens, must be 7–15 digits optionally starting with +
  const stripped = raw.replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(stripped);
}

interface PublicCampaignClientProps {
  slug: string;
  initialRef?: string;
  initialCampaignId?: string;
  initialParticipantId?: string;
  initialMode?: "join" | "status";
}

export function PublicCampaignClient({
  slug,
  initialRef = "",
  initialCampaignId = "",
  initialParticipantId = "",
  initialMode = "join",
}: PublicCampaignClientProps) {
  // Query campaign details from backend
  const { data: campaignResponse, isLoading: isLoadingCampaign } =
    useCampaignBySlug(slug);

  const campaign: CampaignDetails | undefined = campaignResponse?.campaign;

  // Local storage fallback if campaign was created locally
  const [localCampaign, setLocalCampaign] = useState<CampaignDetails | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && !campaign) {
      try {
        const stored = localStorage.getItem(`campaign_slug_${slug}`);
        if (stored) {
          setLocalCampaign(JSON.parse(stored));
        }
      } catch {}
    }
  }, [slug, campaign]);

  const activeCampaign = campaign || localCampaign;
  const campaignId = activeCampaign?.id || initialCampaignId;

  // Top View Mode: "join" (New Participant) vs "lookup" (Returning Participant Status Check)
  const [viewMode, setViewMode] = useState<"join" | "lookup">(
    initialMode === "status" || initialParticipantId ? "lookup" : "join"
  );

  // Form state for Joining
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [incomingRefCode, setIncomingRefCode] = useState(initialRef);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  // Form state for Status Lookup (by Phone or Referral Code)
  const [lookupQuery, setLookupQuery] = useState("");
  const [lookupError, setLookupError] = useState("");

  // Active / Previously joined participant state
  const [joinedResult, setJoinedResult] = useState<{
    participant: ParticipantData;
    shareableLink: string;
    initialTab?: "share" | "status";
  } | null>(null);

  // Existing participant remembered from this device/browser
  const [savedParticipant, setSavedParticipant] = useState<{
    participant: ParticipantData;
    shareableLink: string;
  } | null>(null);

  // TanStack Query mutations
  const joinMutation = useJoinCampaign();
  const lookupMutation = useLookupParticipant();

  // Load saved participant from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(`participant_data_${slug}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.participant?.id) {
            setSavedParticipant(parsed);
            if (initialMode === "status") {
              setJoinedResult({ ...parsed, initialTab: "status" });
            }
          }
        }
      } catch {}
    }
  }, [slug, initialMode]);

  // If initialParticipantId was passed in URL searchParams, look up immediately
  useEffect(() => {
    if (initialParticipantId && !joinedResult) {
      lookupMutation.mutate(
        { participantId: initialParticipantId },
        {
          onSuccess: (data) => {
            if (data?.participant) {
              const fallbackLink =
                typeof window !== "undefined"
                  ? `${window.location.origin}/c/${slug}?ref=${data.participant.referralCode}`
                  : `/c/${slug}?ref=${data.participant.referralCode}`;

              const resObj = {
                participant: data.participant,
                shareableLink: data.shareableLink || fallbackLink,
                initialTab: "status" as const,
              };
              setJoinedResult(resObj);
            }
          },
        }
      );
    }
  }, [initialParticipantId]);

  // If user modifies initialRef in URL, sync it
  useEffect(() => {
    if (initialRef && !incomingRefCode) {
      setIncomingRefCode(initialRef);
    }
  }, [initialRef, incomingRefCode]);

  const formattedCampaignTitle =
    activeCampaign?.name ||
    slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  // Sanitize phone input
  const sanitizePhoneNumber = (raw: string): string => {
    let clean = raw.trim();
    const hasPlus = clean.startsWith("+");
    clean = clean.replace(/\D/g, "");
    return hasPlus ? `+${clean}` : clean;
  };

  // Helper to persist participant info to localStorage
  const persistParticipant = (participant: ParticipantData, shareableLink: string) => {
    if (typeof window !== "undefined") {
      try {
        const payload = { participant, shareableLink };
        localStorage.setItem(`participant_id_${slug}`, participant.id);
        localStorage.setItem(`participant_id_${participant.campaignId}`, participant.id);
        localStorage.setItem(`participant_data_${slug}`, JSON.stringify(payload));
        localStorage.setItem(`last_active_participant_id`, participant.id);
        setSavedParticipant(payload);
      } catch {}
    }
  };

  // ── Handler: Lookup Existing Participant Status ─────────────────────────────
  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError("");

    const query = lookupQuery.trim();
    if (!query) {
      setLookupError("Please enter your phone number, referral code, or participant ID.");
      return;
    }

    // Determine payload based on input format
    let lookupPayload: {
      campaignId?: string;
      phone?: string;
      referralCode?: string;
      participantId?: string;
    } = { campaignId };

    if (query.startsWith("part_")) {
      lookupPayload = { participantId: query };
    } else if (/[0-9]/.test(query) && query.replace(/[\s\-().]/g, "").length >= 7) {
      lookupPayload.phone = query.replace(/[\s\-().]/g, "");
    } else {
      lookupPayload.referralCode = query.toUpperCase();
    }

    lookupMutation.mutate(lookupPayload, {
      onSuccess: (data) => {
        if (data?.participant) {
          toast.success(`Welcome back, ${data.participant.name}!`);
          const fallbackLink =
            typeof window !== "undefined"
              ? `${window.location.origin}/c/${slug}?ref=${data.participant.referralCode}`
              : `/c/${slug}?ref=${data.participant.referralCode}`;

          const link = data.shareableLink || fallbackLink;
          persistParticipant(data.participant, link);

          setJoinedResult({
            participant: data.participant,
            shareableLink: link,
            initialTab: "status",
          });
        }
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "No registered participant found with this phone or referral code.";
        setLookupError(msg);
        toast.error(msg);
      },
    });
  };

  // ── Handler: Join Campaign ────────────────────────────────────────────────
  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const trimmedName = name.trim();
    const rawPhone = phone.trim();
    const trimmedRef = incomingRefCode.trim().toUpperCase();

    // Validations (same standard as RegisterForm.tsx)
    const errors: { [key: string]: string } = {};

    if (isNotStarted) {
      toast.error(`This campaign has not started yet. Registration opens on ${startDate?.toLocaleDateString()}.`);
      return;
    }

    if (isEnded) {
      toast.error("This campaign has already ended.");
      return;
    }

    if (!trimmedName) {
      errors.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      errors.name = "Full name must be at least 2 characters.";
    }

    if (!rawPhone) {
      errors.phone = "Phone number is required.";
    } else if (!isValidPhone(rawPhone)) {
      errors.phone =
        "Enter a valid phone number with country code (e.g. +923001234567).";
    }

    if (!campaignId) {
      errors.campaign = "Campaign could not be identified. Please refresh or try again.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    // Cleaned phone for API submission (same stripping as RegisterForm.tsx)
    const cleanPhone = rawPhone.replace(/[\s\-().]/g, "");

    // Call API: POST BASE_URL/api/participants/join
    joinMutation.mutate(
      {
        campaignId,
        name: trimmedName,
        phone: cleanPhone,
        incomingRefCode: trimmedRef || undefined,
      },
      {
        onSuccess: (data) => {
          if (data?.participant?.orderStatus === "confirmed") {
            toast.success("Participant registered and confirmed!");
          } else {
            toast.success("Registration submitted! Awaiting store owner confirmation.");
          }
          if (data?.participant) {
            const fallbackLink =
              typeof window !== "undefined"
                ? `${window.location.origin}/c/${slug}?ref=${data.participant.referralCode}`
                : `/c/${slug}?ref=${data.participant.referralCode}`;

            const fullLink = data.shareableLink || fallbackLink;
            persistParticipant(data.participant, fullLink);

            setJoinedResult({
              participant: data.participant,
              shareableLink: fullLink,
              initialTab: "share",
            });
          }
        },
        onError: (err: any) => {
          const apiError =
            err?.response?.data?.error ||
            err?.message ||
            "Failed to join campaign. Please try again.";
          const errorField = err?.response?.data?.field;
          const existingPartId = err?.response?.data?.participantId;

          // If phone is already registered, automatically offer or fetch their existing status!
          if (
            apiError.toLowerCase().includes("already joined") ||
            errorField === "phone"
          ) {
            toast.loading("You are already registered! Fetching your discount status...", {
              id: "existing-lookup",
              duration: 2500,
            });

            // Automatically look up the existing participant
            lookupMutation.mutate(
              existingPartId
                ? { participantId: existingPartId }
                : { campaignId, phone: cleanPhone },
              {
                onSuccess: (lookupData) => {
                  toast.dismiss("existing-lookup");
                  if (lookupData?.participant) {
                    toast.success(`Welcome back, ${lookupData.participant.name}!`);
                    const fallbackLink =
                      typeof window !== "undefined"
                        ? `${window.location.origin}/c/${slug}?ref=${lookupData.participant.referralCode}`
                        : `/c/${slug}?ref=${lookupData.participant.referralCode}`;

                    const link = lookupData.shareableLink || fallbackLink;
                    persistParticipant(lookupData.participant, link);

                    setJoinedResult({
                      participant: lookupData.participant,
                      shareableLink: link,
                      initialTab: "status",
                    });
                  }
                },
                onError: () => {
                  toast.dismiss("existing-lookup");
                  setFieldErrors({ phone: apiError });
                  toast.error(apiError);
                },
              }
            );
            return;
          }

          if (apiError.toLowerCase().includes("referral code")) {
            setFieldErrors((prev) => ({ ...prev, ref: apiError }));
          }

          toast.error(apiError);
        },
      }
    );
  };

  // Check if campaign is active / ended
  const now = new Date();
  const startDate = activeCampaign?.startDateTime
    ? new Date(activeCampaign.startDateTime)
    : null;
  const endDate = activeCampaign?.endDateTime
    ? new Date(activeCampaign.endDateTime)
    : null;

  const isNotStarted = startDate ? now < startDate : false;
  const isEnded = endDate ? now > endDate : false;

  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col items-center justify-center p-4 sm:p-8">
      {/* Brand Header */}
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="text-gradient-brand text-2xl font-black tracking-tight inline-block hover:opacity-90 transition-opacity"
        >
          {APP_NAME}
        </Link>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">
        {/* Campaign Banner */}
        <div className="card-glow p-6 sm:p-8 text-center animate-scale-in">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-soft)] text-[var(--color-primary)] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Gift size={28} />
          </div>

          <span className="badge badge-primary text-xs font-semibold mb-2">
            Referral Rewards Program
          </span>

          <h1 className="text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {isLoadingCampaign && !activeCampaign ? (
              <span className="inline-block w-48 h-7 bg-slate-200 animate-pulse rounded-md" />
            ) : (
              formattedCampaignTitle
            )}
          </h1>

          <p className="text-sm text-[var(--color-text-secondary)] mt-2">
            Join this exclusive referral program. Get your personal link and earn discount rewards for every friend who joins!
          </p>

          {/* Tier Highlight Pill */}
          {activeCampaign && (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-border-strong)] mt-4">
              <Sparkles size={15} className="text-[var(--color-primary)]" />
              <span className="text-xs font-bold text-[var(--color-primary)]">
                Up to {activeCampaign.tier1Pct}% discount on your next orders
              </span>
            </div>
          )}

          {/* Dates notices if applicable */}
          {isNotStarted && startDate && (
            <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
              <Calendar size={15} className="shrink-0 text-amber-600" />
              <span>Starts on {startDate.toLocaleDateString()}</span>
            </div>
          )}
          {isEnded && endDate && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-center gap-2">
              <AlertCircle size={15} className="shrink-0 text-rose-600" />
              <span>This campaign ended on {endDate.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* If participant joined or has active view */}
        {joinedResult ? (
          <div>
            <ParticipantSuccessView
              participant={joinedResult.participant}
              shareableLink={joinedResult.shareableLink}
              campaignName={formattedCampaignTitle}
              tier1Pct={activeCampaign?.tier1Pct}
              tier2Pct={activeCampaign?.tier2Pct}
              tier3Pct={activeCampaign?.tier3Pct}
              maxDiscountCapPct={activeCampaign?.maxDiscountCapPct}
              initialTab={joinedResult.initialTab || "share"}
              onParticipantUpdated={(updated) => {
                const link =
                  typeof window !== "undefined"
                    ? `${window.location.origin}/c/${slug}?ref=${updated.referralCode}`
                    : `/c/${slug}?ref=${updated.referralCode}`;
                persistParticipant(updated, link);
                setJoinedResult((prev) =>
                  prev ? { ...prev, participant: updated, shareableLink: link } : null
                );
              }}
            />

            <div className="text-center mt-3 flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => {
                  setJoinedResult(null);
                  setViewMode("join");
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors underline cursor-pointer"
              >
                Join with a different phone number
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  setJoinedResult(null);
                  setViewMode("lookup");
                }}
                className="text-xs text-indigo-600 hover:text-indigo-800 transition-colors font-semibold cursor-pointer"
              >
                Lookup another account
              </button>
            </div>
          </div>
        ) : (
          /* Main Interactive Container: Toggle between Join Form & Lookup Status */
          <div className="card p-6 sm:p-8 animate-fade-in-up shadow-lg">
            {/* Returning participant banner if already saved in localStorage */}
            {savedParticipant && (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 text-indigo-950 text-xs flex items-center justify-between gap-3 mb-5 shadow-xs">
                <div className="min-w-0">
                  <span className="font-bold block truncate">
                    Welcome back, {savedParticipant.participant.name}!
                  </span>
                  <span className="text-[0.72rem] text-indigo-700">
                    {savedParticipant.participant.orderStatus === "confirmed" ? (
                      <>
                        Code: <strong>{savedParticipant.participant.referralCode}</strong>
                      </>
                    ) : (
                      <span className="text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
                        <Clock size={11} className="text-amber-600 shrink-0" />
                        <span>Status: Pending Store Confirmation</span>
                      </span>
                    )}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setJoinedResult({
                      ...savedParticipant,
                      initialTab: savedParticipant.participant.orderStatus === "confirmed" ? "status" : "share",
                    })
                  }
                  className="btn btn-primary px-3 py-1.5 text-xs font-bold shrink-0 shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <TrendingUp size={13} />
                  <span>
                    {savedParticipant.participant.orderStatus === "confirmed"
                      ? "View My Status"
                      : "Check Order Status"}
                  </span>
                </button>
              </div>
            )}

            {/* Top Switcher: Join vs Check My Status */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setViewMode("join");
                  setLookupError("");
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === "join"
                    ? "bg-white text-[var(--color-primary)] shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Gift size={14} />
                <span>New? Join Program</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewMode("lookup");
                  setFieldErrors({});
                }}
                className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  viewMode === "lookup"
                    ? "bg-white text-indigo-700 shadow-xs"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
              >
                <Search size={14} />
                <span>Check My Status & Discounts</span>
              </button>
            </div>

            {/* VIEW MODE A: Check My Status & Discounts Form */}
            {viewMode === "lookup" ? (
              <div className="animate-fade-in flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-1 flex items-center gap-1.5">
                    <TrendingUp size={16} className="text-indigo-600" />
                    <span>Check Your Referral Progress</span>
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Already registered? Enter your phone number or referral code to view your active discounts and rewards anytime.
                  </p>
                </div>

                {lookupError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{lookupError}</span>
                  </div>
                )}

                <form onSubmit={handleLookupSubmit} className="flex flex-col gap-3.5">
                  <InputField
                    id="lookup-query"
                    name="lookupQuery"
                    label="Phone Number or Referral Code"
                    placeholder="e.g. +923001234567 or TES-DNAKT"
                    required
                    leftIcon={<Search size={16} />}
                    value={lookupQuery}
                    onChange={(e) => {
                      setLookupQuery(e.target.value);
                      if (lookupError) setLookupError("");
                    }}
                    hint="Enter the phone number or code you registered with."
                  />

                  <button
                    type="submit"
                    disabled={lookupMutation.isPending}
                    className="btn btn-primary h-12 w-full text-sm font-bold flex items-center justify-center gap-2 shadow-md mt-1 cursor-pointer"
                  >
                    {lookupMutation.isPending ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Verifying Account...</span>
                      </>
                    ) : (
                      <>
                        <span>View My Discounts & Progress</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-[0.72rem] text-[var(--color-text-muted)] mt-1">
                  Haven't joined yet?{" "}
                  <button
                    type="button"
                    onClick={() => setViewMode("join")}
                    className="text-[var(--color-primary)] font-bold hover:underline cursor-pointer"
                  >
                    Register here &rarr;
                  </button>
                </p>
              </div>
            ) : (
              /* VIEW MODE B: Standard Join Form */
              <div className="animate-fade-in flex flex-col gap-4">
                <div>
                  <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-1">
                    Join & Get Your Personal Referral Link
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Fill in your details below to generate your unique link.
                  </p>
                </div>

                {/* Invited by Banner if ref query exists */}
                {initialRef && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5 shadow-2xs">
                    <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="font-semibold block">You were invited by a friend!</span>
                      <span className="text-[0.72rem] text-emerald-800">
                        Referral code <strong>{initialRef}</strong> is automatically applied.
                      </span>
                    </div>
                  </div>
                )}

                {fieldErrors.campaign && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{fieldErrors.campaign}</span>
                  </div>
                )}

                <form onSubmit={handleJoinSubmit} className="flex flex-col gap-4">
                  {/* Full Name */}
                  <InputField
                    id="participant-name"
                    name="name"
                    label="Full Name"
                    placeholder="e.g. Jane Doe"
                    required
                    autoComplete="name"
                    leftIcon={<User size={16} />}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) {
                        setFieldErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    error={fieldErrors.name}
                  />

                  {/* Phone Number */}
                  <InputField
                    id="participant-phone"
                    name="phone"
                    type="tel"
                    label="Phone Number"
                    placeholder="+92 300 1234567"
                    required
                    autoComplete="tel"
                    leftIcon={<Phone size={16} />}
                    hint="Include country code · Used to confirm your number & track rewards"
                    value={phone}
                    disabled={joinMutation.isPending}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (fieldErrors.phone) {
                        setFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                    error={fieldErrors.phone}
                  />

                  {/* Referral Code (Optional) */}
                  <div className="flex flex-col gap-1.5">
                    <InputField
                      id="participant-ref-code"
                      name="incomingRefCode"
                      label="Referral Code (Optional)"
                      placeholder="e.g. ALI-X7K2P"
                      leftIcon={<Ticket size={16} />}
                      value={incomingRefCode}
                      onChange={(e) => {
                        setIncomingRefCode(e.target.value.toUpperCase());
                        if (fieldErrors.ref) {
                          setFieldErrors((prev) => ({ ...prev, ref: "" }));
                        }
                      }}
                      hint="Leave blank if you don't have an invite code."
                      error={fieldErrors.ref}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="btn-join-campaign"
                    disabled={joinMutation.isPending || isEnded || isNotStarted}
                    className="btn btn-primary h-12 w-full text-sm font-bold flex items-center justify-center gap-2 shadow-md mt-2 disabled:opacity-50 cursor-pointer"
                  >
                    {joinMutation.isPending || lookupMutation.isPending ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : isNotStarted ? (
                      <>
                        <Clock size={17} />
                        <span>Campaign Opens on {startDate?.toLocaleDateString()}</span>
                      </>
                    ) : isEnded ? (
                      <span>Campaign Has Ended</span>
                    ) : (
                      <>
                        <span>Get My Referral Link</span>
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-xs text-[var(--color-text-muted)] mt-2">
                  Already joined this campaign?{" "}
                  <button
                    type="button"
                    onClick={() => setViewMode("lookup")}
                    className="text-indigo-600 font-bold hover:underline cursor-pointer"
                  >
                    Check your referral discount status here &rarr;
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* How It Works Card */}
        <div className="card p-5 sm:p-6 shadow-sm border border-[var(--color-border-subtle)]">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)] mb-3 flex items-center gap-1.5">
            <Sparkles size={14} className="text-[var(--color-primary)]" />
            <span>How The Referral Program Works</span>
          </h3>

          <div className="space-y-3 text-xs text-[var(--color-text-secondary)]">
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-[0.68rem] shrink-0 mt-0.5">
                1
              </span>
              <span>
                Sign up with your name and phone number to claim your unique personal referral code.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-[0.68rem] shrink-0 mt-0.5">
                2
              </span>
              <span>
                Share your invite link with friends via WhatsApp, Instagram, or social media.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-[0.68rem] shrink-0 mt-0.5">
                3
              </span>
              <span>
                When friends make a purchase using your code, you unlock progressive discount tiers!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
