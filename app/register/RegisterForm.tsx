"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { InputField } from "@/components/ui/InputField";
import { WhatsAppVerifyModal } from "@/components/ui/WhatsAppVerifyModal";
import { RoleSelector, type AccountRole } from "@/components/RoleSelector";
import { useInitiateWhatsAppVerify } from "@/lib/api/business";
import type { VerifyStatusResponse } from "@/lib/api/business";
import { APP_NAME } from "@/lib/constants";

/* ─────────────────────────────────────────────────────────────────────────────
   Helper: basic phone validation
───────────────────────────────────────────────────────────────────────────── */
function isValidPhone(raw: string): boolean {
  // Strip spaces/dashes/parens, must be 7–15 digits optionally starting with +
  const stripped = raw.replace(/[\s\-().]/g, "");
  return /^\+?\d{7,15}$/.test(stripped);
}

/* ─────────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────────── */
export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>("guest");

  const [formData, setFormData] = useState({
    name: "",
    email: "",    // optional
    phone: "",    // compulsory
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    phone?: string;
  }>({});

  /* ── WhatsApp modal state ─────────────────────────────────────────────── */
  const [modal, setModal] = useState<{
    open: boolean;
    nonce: string;
    waLink: string;
    expiresAt?: number;
  }>({ open: false, nonce: "", waLink: "" });

  const {
    mutate: initiateVerify,
    isPending,
    isError,
    error,
  } = useInitiateWhatsAppVerify();

  /* ── Client-side validation ───────────────────────────────────────────── */
  function validate(): boolean {
    const errors: typeof fieldErrors = {};
    if (!formData.name.trim()) {
      errors.name = "Business name is required.";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!isValidPhone(formData.phone.trim())) {
      errors.phone = "Enter a valid phone number with country code (e.g. +923001234567).";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ── Submit: Step 1 — initiate WhatsApp verification ─────────────────── */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    initiateVerify(
      {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || undefined,
        role,
      },
      {
        onSuccess: (data) => {
          setModal({
            open: true,
            nonce: data.nonce,
            waLink: data.waLink,
            expiresAt: data.expiresAt,
          });
        },
        onError: (err) => {
          toast.error(err?.message || "Could not start verification. Please try again.");
        },
      }
    );
  };

  /* ── Step 2: webhook confirmed → save auth & redirect ────────────────── */
  const handleVerified = (data: VerifyStatusResponse) => {
    if (typeof window !== "undefined") {
      const business = data.business || {};
      const businessId = data.business?.id;

      if (businessId) localStorage.setItem("business_id", businessId);
      localStorage.setItem("business", JSON.stringify(business));
      localStorage.setItem("current_user", JSON.stringify(business));

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
    }

    toast.success("Phone verified! Welcome to " + APP_NAME + " 🎉");

    setTimeout(() => {
      router.push("/dashboard");
    }, 1400);
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <>
      {/* ── WhatsApp Verification Modal ─────────────────────────────────── */}
      {modal.open && (
        <WhatsAppVerifyModal
          nonce={modal.nonce}
          waLink={modal.waLink}
          businessName={formData.name.trim()}
          phone={formData.phone.trim()}
          expiresAt={modal.expiresAt}
          onVerified={handleVerified}
          onClose={() => setModal({ open: false, nonce: "", waLink: "" })}
        />
      )}

      {/* ── Registration Card ───────────────────────────────────────────── */}
      <div className="card-glow animate-scale-in w-full max-w-[520px] p-6 sm:p-10">
        {/* Logo & Header */}
        <div className="text-center mb-7">
          <Link
            href="/"
            className="text-gradient-brand text-3xl sm:text-4xl font-black tracking-tight inline-block hover:opacity-95 transition-opacity"
          >
            {APP_NAME}
          </Link>
          <p className="text-sm text-[var(--color-text-muted)] mt-1.5">
            Register your business and start your referral campaign
          </p>
        </div>

        {/* Role Selection */}
        <RoleSelector selectedRole={role} onChange={setRole} />

        {/* How Verification Works — info pill */}
        {/* <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "11px 14px",
            borderRadius: 12,
            background: "rgba(37,211,102,0.07)",
            border: "1px solid rgba(37,211,102,0.22)",
            marginBottom: 20,
          }}
        >
          <MessageCircle
            size={16}
            style={{ color: "#128C7E", flexShrink: 0, marginTop: 1 }}
          />
          <p
            style={{
              margin: 0,
              fontSize: 12,
              color: "var(--color-text-secondary)",
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: "#128C7E" }}>WhatsApp Verification:</strong>{" "}
            After submitting, we&apos;ll open WhatsApp so you can send a
            one-tap message to confirm your number — zero SMS cost, no OTP
            codes to type.
          </p>
        </div> */}

        {/* API error banner */}
        {isError && (
          <div className="mb-4 p-3.5 rounded-xl bg-[var(--color-error-soft)] border border-[rgba(220,38,38,0.25)] text-[var(--color-error)] text-xs font-medium flex items-center gap-2 animate-scale-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>
              {error?.message || "Verification request failed. Please try again."}
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* Business Name — COMPULSORY */}
          <InputField
            id="reg-name"
            name="name"
            label="Business Name"
            placeholder="e.g. Acme Coffee Co."
            required
            autoComplete="organization"
            leftIcon={<User size={16} />}
            value={formData.name}
            disabled={isPending}
            error={fieldErrors.name}
            onChange={(e) => {
              setFormData({ ...formData, name: e.target.value });
              if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: undefined }));
            }}
          />

          {/* Phone Number — COMPULSORY */}
          <InputField
            id="reg-phone"
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+92 300 1234567"
            required
            autoComplete="tel"
            leftIcon={<Phone size={16} />}
            hint="Include country code · Used to verify via WhatsApp"
            value={formData.phone}
            disabled={isPending}
            error={fieldErrors.phone}
            onChange={(e) => {
              setFormData({ ...formData, phone: e.target.value });
              if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: undefined }));
            }}
          />

          {/* Email — OPTIONAL */}
          <InputField
            id="reg-email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="contact@business.com"
            required={false}
            autoComplete="email"
            leftIcon={<Mail size={16} />}
            hint="Optional — for campaign reports and receipts"
            value={formData.email}
            disabled={isPending}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          {/* Hidden role */}
          <input type="hidden" name="selectedRole" value={role} />

          {/* Submit */}
          <button
            id="register-submit"
            type="submit"
            disabled={isPending}
            className="btn btn-primary mt-2 w-full h-[46px] text-[0.95rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Preparing verification…</span>
              </>
            ) : (
              <>
                {/* WhatsApp logo inline SVG */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span>
                  {role === "guest"
                    ? "Continue & Verify via WhatsApp"
                    : "Continue & Verify via WhatsApp"}
                </span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        <hr className="divider my-6" />

        <p className="text-center text-sm text-[var(--color-text-muted)] m-0">
          Already have an account?{" "}
          <Link href="/login" className="text-link font-semibold hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </>
  );
}
