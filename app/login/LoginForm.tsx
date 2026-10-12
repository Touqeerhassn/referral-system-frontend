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
    <div className="card-glow animate-scale-in w-full max-w-[440px] p-5 sm:p-9 shadow-xl">
      {/* Logo & Heading */}
      <div className="text-center mb-7">
        <Link href="/" className="inline-block hover:opacity-95 transition-opacity">
          <span className="text-gradient-brand text-3xl font-black tracking-tight">
            {APP_NAME}
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1.5">
          Sign in to access your business referral portal
        </p>
      </div>

      {/* Error alert if any */}
      {isError && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--color-error-soft)] border border-[rgba(220,38,38,0.25)] text-[var(--color-error)] text-xs font-medium flex items-center gap-2 animate-scale-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {(error as any)?.response?.data?.error ||
              error?.message ||
              "No business found for this number."}
          </span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          className="btn btn-primary mt-1 w-full h-11 flex items-center justify-center gap-2 text-xs sm:text-sm font-bold shadow-sm"
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

      <hr className="divider my-5 border-[var(--color-border-subtle)]" />

      <p className="text-center text-[var(--color-text-muted)] text-xs sm:text-sm">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-link font-semibold hover:underline">
          Register with WhatsApp
        </Link>
      </p>
    </div>
  );
}
