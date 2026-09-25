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
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { InputField } from "@/components/ui/InputField";
import { RoleSelector, type AccountRole } from "@/components/RoleSelector";
import { useRegisterBusiness } from "@/lib/api/business";
import { APP_NAME } from "@/lib/constants";

export default function RegisterForm() {
  const router = useRouter();
  const [role, setRole] = useState<AccountRole>("guest");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const {
    mutate: register,
    isPending,
    isError,
    error,
    isSuccess,
    data: responseData,
  } = useRegisterBusiness();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Call API: POST BASE_URL/api/businesses/register { name, email, phone }
    register(
      {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      {
        onSuccess: (data) => {
          const successMsg =
            data?.message || "Business registered successfully!";
          toast.success(successMsg);

          if (typeof window !== "undefined") {
            const businessData = data.business || data;
            const businessId = data.business?.id || data.id;

            // Save business id specifically for campaign retrieval and operations
            if (businessId) {
              localStorage.setItem("business_id", businessId);
            }

            // Save complete user / business data in localStorage
            localStorage.setItem("business", JSON.stringify(businessData));
            localStorage.setItem("current_user", JSON.stringify(businessData));

            if (data?.token) {
              localStorage.setItem("auth_token", data.token);
            }
          }

          // Redirect after short delay so user sees success feedback
          setTimeout(() => {
            router.push("/dashboard");
          }, 1200);
        },

        onError: (err) => {
          const errorMsg =
            err?.message || "Registration failed. Please try again.";
          toast.error(errorMsg);
        },
      }
    );
  };


  return (
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

      {/* Role Selection Section */}
      <RoleSelector selectedRole={role} onChange={setRole} />

      {/* Success Notification */}
      {isSuccess && (
        <div className="mb-4 p-3.5 rounded-xl bg-[var(--color-success-soft)] border border-[rgba(14,158,107,0.25)] text-[var(--color-success)] text-xs font-medium flex items-center gap-2 animate-scale-in">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>
            {responseData?.message ||
              "Business registered successfully! Redirecting to dashboard..."}
          </span>
        </div>
      )}

      {/* Error Notification */}
      {isError && (
        <div className="mb-4 p-3.5 rounded-xl bg-[var(--color-error-soft)] border border-[rgba(220,38,38,0.25)] text-[var(--color-error)] text-xs font-medium flex items-center gap-2 animate-scale-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>
            {error?.message ||
              "Registration failed. Please check your details and try again."}
          </span>
        </div>
      )}

      {/* Registration Form with reusable InputField components */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <InputField
          id="reg-name"
          name="name"
          label="Full Name / Business Name"
          placeholder="Acme Corp or John Doe"
          required
          autoComplete="name"
          leftIcon={<User size={16} />}
          value={formData.name}
          disabled={isPending || isSuccess}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        {/* Email */}
        <InputField
          id="reg-email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="contact@business.com"
          required
          autoComplete="email"
          leftIcon={<Mail size={16} />}
          value={formData.email}
          disabled={isPending || isSuccess}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* Phone */}
        <InputField
          id="reg-phone"
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="+1 (555) 000-0000"
          required
          autoComplete="tel"
          leftIcon={<Phone size={16} />}
          hint="Required for account verification and campaign updates"
          value={formData.phone}
          disabled={isPending || isSuccess}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />

        {/* Hidden role input */}
        <input type="hidden" name="selectedRole" value={role} />

        {/* Submit button with loading state */}
        <button
          id="register-submit"
          type="submit"
          disabled={isPending || isSuccess}
          className="btn btn-primary mt-2 w-full h-[46px] text-[0.95rem] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Registering business...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 size={18} />
              <span>Registered Successfully</span>
            </>
          ) : (
            <>
              <span>
                {role === "guest"
                  ? "Register as Free Guest"
                  : "Register as Pro Subscriber"}
              </span>
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </form>

      <hr className="divider my-6" />

      <p className="text-center text-sm text-[var(--color-text-muted)] m-0">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-link font-semibold hover:underline"
        >
          Log In
        </Link>
      </p>
    </div>
  );
}
