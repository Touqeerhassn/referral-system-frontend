"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCw,
  Timer,
  X,
  ShieldCheck,
  AlertCircle,
  Smartphone,
} from "lucide-react";
import { checkVerifyStatus } from "@/lib/api/business";
import type { VerifyStatusResponse } from "@/lib/api/business";

/* ─────────────────────────────────────────────────────────────
   Types
───────────────────────────────────────────────────────────── */
export interface WhatsAppVerifyModalProps {
  nonce: string;
  waLink: string;
  businessName: string;
  phone: string;
  expiresAt?: number; // unix timestamp (seconds)
  onVerified: (data: VerifyStatusResponse) => void;
  onClose: () => void;
}

/* ─────────────────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────────────────── */
const POLL_INTERVAL_MS = 2000;
const DEFAULT_TTL_SECS = 300; // 5 minutes

function formatCountdown(secs: number): string {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

/* ─────────────────────────────────────────────────────────────
   Step indicator
───────────────────────────────────────────────────────────── */
function Step({
  n,
  label,
  done,
  active,
}: {
  n: number;
  label: string;
  done: boolean;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
          transition: "all 0.3s",
          background: done
            ? "var(--color-success)"
            : active
            ? "var(--color-primary)"
            : "var(--color-bg-subtle)",
          color: done || active ? "#fff" : "var(--color-text-muted)",
          border: active
            ? "2px solid var(--color-primary)"
            : done
            ? "2px solid var(--color-success)"
            : "2px solid var(--color-border-default)",
          boxShadow: active ? "0 0 0 4px var(--color-primary-glow)" : "none",
        }}
      >
        {done ? <CheckCircle2 size={14} /> : n}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: active ? 600 : 400,
          color: active
            ? "var(--color-text-primary)"
            : done
            ? "var(--color-success)"
            : "var(--color-text-muted)",
          transition: "color 0.3s",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export function WhatsAppVerifyModal({
  nonce,
  waLink,
  businessName,
  phone,
  expiresAt,
  onVerified,
  onClose,
}: WhatsAppVerifyModalProps) {
  const ttlSecs = expiresAt
    ? Math.max(0, expiresAt - Math.floor(Date.now() / 1000))
    : DEFAULT_TTL_SECS;

  const [countdown, setCountdown] = useState(ttlSecs);
  const [pollStatus, setPollStatus] = useState<
    "idle" | "polling" | "verified" | "expired" | "error"
  >("idle");
  const [copied, setCopied] = useState(false);
  const [hasTapped, setHasTapped] = useState(false);
  const [isMobile] = useState(isMobileDevice);
  const [pollError, setPollError] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Plain code shown in WhatsApp (e.g. "VERIFY_REF-938214")
  const codeText = waLink.includes("text=")
    ? decodeURIComponent(waLink.split("text=")[1])
    : `VERIFY_${nonce}`;

  /* ── Countdown ─────────────────────────────────────────── */
  useEffect(() => {
    if (pollStatus === "verified" || pollStatus === "expired") return;
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          setPollStatus("expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current!);
  }, [pollStatus]);

  /* ── Polling ───────────────────────────────────────────── */
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    setPollStatus("polling");
    setPollError(null);

    pollRef.current = setInterval(async () => {
      try {
        const result = await checkVerifyStatus(nonce);
        if (result.status === "VERIFIED") {
          stopPolling();
          setPollStatus("verified");
          clearInterval(countdownRef.current!);
          onVerified(result);
        } else if (result.status === "EXPIRED") {
          stopPolling();
          setPollStatus("expired");
        }
      } catch {
        setPollError("Could not reach server — retrying…");
      }
    }, POLL_INTERVAL_MS);
  }, [nonce, onVerified, stopPolling]);

  // Start polling immediately when modal mounts — the user may send
  // the WhatsApp message from another device before clicking the button.
  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, [startPolling, stopPolling]);

  /* ── Open WhatsApp ─────────────────────────────────────── */
  const handleOpenWhatsApp = () => {
    setHasTapped(true);
    window.open(waLink, "_blank", "noopener,noreferrer");
  };

  /* ── Copy code ─────────────────────────────────────────── */
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* silent */
    }
  };

  const step = pollStatus === "verified" ? 3 : hasTapped ? 2 : 1;
  const isActive = pollStatus !== "verified" && pollStatus !== "expired";

  return (
    /* Backdrop */
    <div
      id="wa-verify-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !hasTapped) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(26,14,18,0.55)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        animation: "waFadeIn 0.25s ease",
      }}
    >
      {/* Card */}
      <div
        id="wa-verify-modal"
        style={{
          background: "var(--color-bg-card)",
          borderRadius: 20,
          width: "100%",
          maxWidth: 460,
          padding: "32px 28px 28px",
          boxShadow:
            "0 24px 80px rgba(240,74,103,0.12), 0 8px 32px rgba(0,0,0,0.10)",
          border: "1px solid var(--color-border-subtle)",
          position: "relative",
          animation: "waScaleIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close — always visible except on success */}
        {pollStatus !== "verified" && (
          <button
            id="wa-verify-close"
            onClick={onClose}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              background: "var(--color-bg-subtle)",
              border: "none",
              borderRadius: "50%",
              width: 32,
              height: 32,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text-muted)",
            }}
          >
            <X size={16} />
          </button>
        )}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background:
                pollStatus === "verified"
                  ? "linear-gradient(135deg,#0E9E6B 0%,#127358 100%)"
                  : "linear-gradient(135deg,#25D366 0%,#128C7E 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              boxShadow:
                pollStatus === "verified"
                  ? "0 8px 24px rgba(14,158,107,0.35)"
                  : "0 8px 24px rgba(37,211,102,0.30)",
              transition: "all 0.4s",
            }}
          >
            {pollStatus === "verified" ? (
              <ShieldCheck size={30} color="#fff" />
            ) : (
              <MessageCircle size={30} color="#fff" />
            )}
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 20,
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.3px",
            }}
          >
            {pollStatus === "verified"
              ? "Phone Verified! 🎉"
              : "Verify via WhatsApp"}
          </h2>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            {pollStatus === "verified" ? (
              <>
                <strong style={{ color: "var(--color-success)" }}>
                  {businessName}
                </strong>{" "}
                is verified. Redirecting to your dashboard…
              </>
            ) : (
              <>
                Confirm that{" "}
                <strong style={{ color: "var(--color-text-secondary)" }}>
                  {phone}
                </strong>{" "}
                is yours — zero SMS cost, instantly free.
              </>
            )}
          </p>
        </div>

        {/* ── VERIFIED STATE ──────────────────────────────── */}
        {pollStatus === "verified" && (
          <div
            style={{
              background: "var(--color-success-soft)",
              border: "1px solid rgba(14,158,107,0.20)",
              borderRadius: 14,
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              animation: "waScaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1)",
            }}
          >
            <CheckCircle2 size={28} color="var(--color-success)" />
            <div>
              <p
                style={{
                  margin: 0,
                  fontWeight: 700,
                  fontSize: 14,
                  color: "var(--color-success)",
                }}
              >
                Verification Successful
              </p>
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  color: "var(--color-text-muted)",
                }}
              >
                Setting up your account…
              </p>
            </div>
            <Loader2
              size={18}
              style={{ marginLeft: "auto", color: "var(--color-success)" }}
              className="animate-spin"
            />
          </div>
        )}

        {/* ── EXPIRED STATE ───────────────────────────────── */}
        {pollStatus === "expired" && (
          <>
            <div
              style={{
                background: "var(--color-error-soft)",
                border: "1px solid rgba(220,38,38,0.20)",
                borderRadius: 14,
                padding: "16px 20px",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <AlertCircle
                size={20}
                color="var(--color-error)"
                style={{ flexShrink: 0, marginTop: 1 }}
              />
              <div>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--color-error)",
                  }}
                >
                  Code Expired
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 12,
                    color: "var(--color-text-muted)",
                  }}
                >
                  This link expired. Please close and try again.
                </p>
              </div>
            </div>
            <button
              id="wa-verify-back-btn"
              onClick={onClose}
              style={{
                width: "100%",
                padding: "12px 20px",
                borderRadius: 10,
                border: "1.5px solid var(--color-border-default)",
                cursor: "pointer",
                background: "var(--color-bg-card)",
                color: "var(--color-text-secondary)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              ← Back to Registration
            </button>
          </>
        )}

        {/* ── ACTIVE FLOW ─────────────────────────────────── */}
        {isActive && (
          <>
            {/* Step tracker */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "16px 18px",
                background: "var(--color-bg-surface)",
                borderRadius: 14,
                border: "1px solid var(--color-border-subtle)",
                marginBottom: 20,
              }}
            >
              <Step
                n={1}
                label='Click "Open WhatsApp" below'
                done={hasTapped}
                active={!hasTapped}
              />
              <div
                style={{
                  height: 1,
                  background: "var(--color-border-subtle)",
                  margin: "0 4px",
                }}
              />
              <Step
                n={2}
                label="Tap Send in WhatsApp — don't change the message!"
                done={step >= 3}
                active={hasTapped && step < 3}
              />
              <div
                style={{
                  height: 1,
                  background: "var(--color-border-subtle)",
                  margin: "0 4px",
                }}
              />
              <Step
                n={3}
                label="Return here — we detect it automatically"
                done={step >= 3}
                active={step >= 2}
              />
            </div>

            {/* Open WhatsApp Button */}
            <button
              id="wa-verify-open-btn"
              onClick={handleOpenWhatsApp}
              style={{
                width: "100%",
                padding: "14px 20px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                background:
                  "linear-gradient(135deg,#25D366 0%,#128C7E 100%)",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                boxShadow: "0 4px 20px rgba(37,211,102,0.35)",
                transition: "transform 0.15s, box-shadow 0.15s",
                marginBottom: 12,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform =
                  "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 8px 28px rgba(37,211,102,0.45)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "";
                (e.currentTarget as HTMLButtonElement).style.boxShadow =
                  "0 4px 20px rgba(37,211,102,0.35)";
              }}
            >
              {isMobile ? (
                <Smartphone size={18} />
              ) : (
                <ExternalLink size={18} />
              )}
              <span>
                {hasTapped ? "Open WhatsApp Again" : "Open WhatsApp"}
              </span>
              <span
                style={{
                  fontSize: 11,
                  background: "rgba(255,255,255,0.20)",
                  padding: "2px 8px",
                  borderRadius: 20,
                  fontWeight: 500,
                }}
              >
                {isMobile ? "Opens your app" : "Opens new tab"}
              </span>
            </button>

            {/* Code copy row */}
            <p
              style={{
                margin: "0 0 6px",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--color-text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.6px",
              }}
            >
              Your verification code (pre-filled in WhatsApp)
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--color-bg-subtle)",
                border: "1px solid var(--color-border-default)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
              }}
            >
              <code
                style={{
                  flex: 1,
                  fontSize: 13,
                  fontFamily: "monospace",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  letterSpacing: "0.5px",
                  userSelect: "all",
                  wordBreak: "break-all",
                }}
              >
                {codeText}
              </code>
              <button
                id="wa-verify-copy-btn"
                onClick={handleCopy}
                aria-label="Copy code"
                style={{
                  background: copied
                    ? "var(--color-success-soft)"
                    : "var(--color-bg-card)",
                  border: `1px solid ${
                    copied
                      ? "rgba(14,158,107,0.30)"
                      : "var(--color-border-default)"
                  }`,
                  borderRadius: 7,
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 600,
                  color: copied
                    ? "var(--color-success)"
                    : "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {copied ? <CheckCircle2 size={12} /> : <Copy size={12} />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Polling status */}
            {hasTapped && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "12px 16px",
                  borderRadius: 12,
                  background: pollError
                    ? "var(--color-warning-soft)"
                    : "var(--color-info-soft)",
                  border: `1px solid ${
                    pollError
                      ? "rgba(200,124,10,0.25)"
                      : "rgba(37,99,235,0.15)"
                  }`,
                  marginBottom: 14,
                  animation: "waFadeIn 0.3s ease",
                }}
              >
                <Loader2
                  size={15}
                  style={{
                    flexShrink: 0,
                    color: pollError
                      ? "var(--color-warning)"
                      : "var(--color-info)",
                  }}
                  className="animate-spin"
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 12,
                    color: pollError
                      ? "var(--color-warning)"
                      : "var(--color-info)",
                    fontWeight: 500,
                    flex: 1,
                    lineHeight: 1.4,
                  }}
                >
                  {pollError ??
                    "Listening for your WhatsApp message… updates automatically."}
                </p>
              </div>
            )}

            {/* Countdown + manual check */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  fontVariantNumeric: "tabular-nums",
                  color:
                    countdown < 60
                      ? "var(--color-error)"
                      : "var(--color-text-muted)",
                }}
              >
                <Timer size={13} />
                Expires in {formatCountdown(countdown)}
              </div>
              {hasTapped && (
                <button
                  id="wa-verify-check-btn"
                  onClick={() => checkVerifyStatus(nonce).catch(() => {})}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    padding: "4px 6px",
                    borderRadius: 6,
                    fontWeight: 500,
                  }}
                >
                  <RefreshCw size={11} />
                  Check now
                </button>
              )}
            </div>

            {/* Desktop fallback hint */}
            {!isMobile && (
              <div
                style={{
                  padding: "11px 14px",
                  borderRadius: 10,
                  background: "var(--color-bg-subtle)",
                  border: "1px solid var(--color-border-subtle)",
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                }}
              >
                <Smartphone
                  size={15}
                  style={{
                    color: "var(--color-text-muted)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                />
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    color: "var(--color-text-muted)",
                    lineHeight: 1.6,
                  }}
                >
                  <strong style={{ color: "var(--color-text-secondary)" }}>
                    On desktop?
                  </strong>{" "}
                  Copy the code above, then open WhatsApp on your phone,
                  message our number, and paste{" "}
                  <code
                    style={{
                      background: "var(--color-bg-card)",
                      padding: "1px 5px",
                      borderRadius: 4,
                      fontFamily: "monospace",
                      fontSize: 11,
                    }}
                  >
                    {codeText}
                  </code>
                  {" "}as the message. This page will update automatically.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes waFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes waScaleIn {
          from { opacity: 0; transform: scale(0.90); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
