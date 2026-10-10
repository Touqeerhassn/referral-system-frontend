"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { InputField } from "@/components/ui/InputField";
import { useLoginBusiness } from "@/lib/api/business";
import { APP_NAME } from "@/lib/constants";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();

  const { mutate: login, isPending, isError, error } = useLoginBusiness();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = identifier.trim();

    if (!val) {
      setFieldError("Please enter your registered phone number or email.");
      return;
    }

    setFieldError(undefined);

    login(
      { phone: val },
      {
        onSuccess: (data) => {
          if (!data.success || !data.business) {
            toast.error(data.error || "Login failed. Please check your credentials.");
            return;
          }

          if (typeof window !== "undefined") {
            localStorage.setItem("business_id", data.business.id);
            localStorage.setItem("business", JSON.stringify(data.business));
            localStorage.setItem("current_user", JSON.stringify(data.business));
            if (data.token) {
              localStorage.setItem("auth_token", data.token);
            }
          }

          toast.success(`Welcome back, ${data.business.name}! 🎉`);
          router.push("/dashboard");
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.error ||
            err?.message ||
            "Account not found. Please verify your phone number or register.";
          toast.error(msg);
        },
      }
    );
  };

  return (
    <div
      className="card-glow animate-scale-in"
      style={{ width: "100%", maxWidth: "440px", padding: "2.5rem" }}
    >
      {/* Logo & Heading */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span
            className="text-gradient-brand"
            style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em" }}
          >
            {APP_NAME}
          </span>
        </Link>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
          Sign in to access your business referral portal
        </p>
      </div>

      {/* Error alert if any */}
      {isError && (
        <div
          className="animate-scale-in"
          style={{
            marginBottom: "1rem",
            padding: "0.85rem 1rem",
            borderRadius: "var(--radius-md)",
            background: "var(--color-error-soft)",
            border: "1px solid rgba(220,38,38,0.25)",
            color: "var(--color-error)",
            fontSize: "0.8rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>
            {(error as any)?.response?.data?.error ||
              error?.message ||
              "No business found for this number."}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <InputField
          id="login-phone"
          name="phone"
          type="text"
          label="Registered Phone Number"
          placeholder="+92 300 1234567 or email"
          hint="Enter the phone number verified on WhatsApp (or business email)"
          autoComplete="tel"
          required
          leftIcon={<Phone size={16} />}
          value={identifier}
          disabled={isPending}
          error={fieldError}
          onChange={(e) => {
            setIdentifier(e.target.value);
            if (fieldError) setFieldError(undefined);
          }}
        />

        <button
          id="login-submit"
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
          style={{
            marginTop: "0.5rem",
            width: "100%",
            height: "46px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "0.95rem",
          }}
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <hr className="divider" style={{ margin: "1.5rem 0" }} />

      <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0 }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-link" style={{ fontWeight: 600, textDecoration: "none" }}>
          Register with WhatsApp
        </Link>
      </p>
    </div>
  );
}
