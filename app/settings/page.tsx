import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Settings`,
  description: "Manage your business account settings.",
};

import { InputField } from "@/components/ui/InputField";
import { User, Mail, Building2, Lock } from "lucide-react";

export default function SettingsPage() {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg-surface)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar title="Settings" />
        <main style={{ flex: 1, padding: "2rem", overflowY: "auto", maxWidth: "680px" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Account Settings</h1>
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
              Manage your profile, business info, and subscription.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Profile */}
            <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Profile</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <InputField
                  id="settings-name"
                  label="Full Name"
                  defaultValue="Business Owner"
                  leftIcon={<User size={16} />}
                />
                <InputField
                  id="settings-email"
                  type="email"
                  label="Email"
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
              <button id="settings-save-profile" className="btn btn-primary" style={{ alignSelf: "flex-start", padding: "0.6rem 1.5rem" }}>
                Save Profile
              </button>
            </div>

            {/* Subscription */}
            <div className="card-glow" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Current Plan</h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", marginTop: "0.25rem" }}>
                    You are on the <strong style={{ color: "var(--color-primary)" }}>Guest</strong> plan.
                  </p>
                  <ul style={{ marginTop: "0.85rem", color: "var(--color-text-secondary)", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <li>✅ 1 active campaign</li>
                    <li>✅ Basic analytics</li>
                    <li style={{ color: "var(--color-text-muted)" }}>❌ Unlimited campaigns</li>
                    <li style={{ color: "var(--color-text-muted)" }}>❌ Advanced leaderboard</li>
                  </ul>
                </div>
                <button id="settings-upgrade" className="btn btn-primary animate-pulse-glow" style={{ padding: "0.6rem 1.25rem", fontSize: "0.85rem" }}>
                  ⭐ Upgrade
                </button>
              </div>
            </div>

            {/* Password */}
            <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Change Password</h2>
              <InputField
                id="settings-current-pw"
                type="password"
                label="Current Password"
                placeholder="••••••••"
                leftIcon={<Lock size={16} />}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                  label="Confirm Password"
                  placeholder="Repeat new password"
                  leftIcon={<Lock size={16} />}
                />
              </div>

              <button id="settings-change-pw" className="btn btn-secondary" style={{ alignSelf: "flex-start", padding: "0.6rem 1.5rem" }}>
                Update Password
              </button>
            </div>

            {/* Danger zone */}
            <div className="card" style={{ padding: "1.5rem", border: "1px solid var(--color-error-muted)" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-error)" }}>Danger Zone</h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", margin: "0.5rem 0 1rem" }}>
                Permanently delete your account and all associated data.
              </p>
              <button id="settings-delete-account" className="btn" style={{ background: "var(--color-error-muted)", color: "var(--color-error)", border: "1px solid var(--color-error)", padding: "0.6rem 1.5rem", fontSize: "0.85rem" }}>
                Delete Account
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
