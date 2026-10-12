import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { APP_NAME } from "@/lib/constants";
import { InputField } from "@/components/ui/InputField";
import { User, Mail, Building2, Lock, ShieldCheck, Check } from "lucide-react";

export const metadata: Metadata = {
  title: `${APP_NAME} — Settings`,
  description: "Manage your business account settings.",
};

export default function SettingsPage() {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] w-full overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto pb-20 md:pb-0 bg-[var(--color-bg-surface)]">
        <Topbar title="Settings" />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-2xl w-full mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
              Account Settings
            </h1>
            <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
              Manage your business profile, subscription plan, and security.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            {/* Profile Section */}
            <div className="card p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
              <div className="border-b border-[var(--color-border-subtle)] pb-2.5">
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  Business Profile
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Update your contact details and business identity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <InputField
                  id="settings-name"
                  label="Full Name"
                  defaultValue="Business Owner"
                  leftIcon={<User size={16} />}
                />
                <InputField
                  id="settings-email"
                  type="email"
                  label="Email Address"
                  defaultValue="owner@business.com"
                  leftIcon={<Mail size={16} />}
                />
              </div>

              <InputField
                id="settings-business"
                label="Business Name"
                defaultValue="My Business"
                leftIcon={<Building2 size={16} />}
              />

              <button
                id="settings-save-profile"
                type="button"
                className="btn btn-primary self-stretch sm:self-start px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-xs"
              >
                Save Profile
              </button>
            </div>

            {/* Subscription Section */}
            <div className="card-glow p-5 sm:p-6 border border-amber-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <span className="badge badge-warning text-[0.68rem] font-bold mb-1.5 inline-block">
                    Current Plan
                  </span>
                  <h2 className="text-base font-black text-[var(--color-text-primary)]">
                    Guest Plan
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                    Explore referral capabilities with starter tier limits.
                  </p>
                  <ul className="mt-3 text-xs text-[var(--color-text-secondary)] space-y-1.5 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>1 active referral campaign</span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>Real-time participant tracking & order confirmation</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                      <span>✕</span>
                      <span>Unlimited campaigns (Subscriber only)</span>
                    </li>
                    <li className="flex items-center gap-1.5 text-[var(--color-text-muted)]">
                      <span>✕</span>
                      <span>Automated WhatsApp bulk broadcast</span>
                    </li>
                  </ul>
                </div>

                <button
                  id="settings-upgrade"
                  type="button"
                  className="btn btn-primary px-4 py-2 text-xs font-bold shrink-0 self-stretch sm:self-auto shadow-sm"
                >
                  ⭐ Upgrade Plan
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div className="card p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
              <div className="border-b border-[var(--color-border-subtle)] pb-2.5">
                <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                  Change Password
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Update your business account credentials.
                </p>
              </div>

              <InputField
                id="settings-current-pw"
                type="password"
                label="Current Password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                <InputField
                  id="settings-new-pw"
                  type="password"
                  label="New Password"
                  placeholder="Minimum 8 chars"
                  leftIcon={<Lock size={16} />}
                />
                <InputField
                  id="settings-confirm-pw"
                  type="password"
                  label="Confirm New Password"
                  placeholder="Repeat new password"
                  leftIcon={<Lock size={16} />}
                />
              </div>

              <button
                id="settings-change-pw"
                type="button"
                className="btn btn-secondary self-stretch sm:self-start px-5 py-2.5 text-xs sm:text-sm font-semibold shadow-2xs"
              >
                Update Password
              </button>
            </div>

            {/* Danger Zone */}
            <div className="card p-5 sm:p-6 border border-rose-200 bg-rose-50/30 flex flex-col gap-2.5 shadow-xs">
              <h2 className="text-base font-bold text-rose-600">
                Danger Zone
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                Permanently delete your business account and all associated campaigns, referral trees, and participant records.
              </p>
              <button
                id="settings-delete-account"
                type="button"
                className="btn bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 self-stretch sm:self-start px-4 py-2 text-xs font-bold mt-1"
              >
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
