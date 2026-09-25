import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { getMockCampaigns, formatDate, daysRemaining } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  const { campaignId } = await params;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId) ?? campaigns[0];
  return {
    title: `Join "${campaign.title}" — ${APP_NAME}`,
    description: `You've been invited to join the "${campaign.title}" referral campaign. Sign up and start earning rewards!`,
  };
}

import { InputField } from "@/components/ui/InputField";
import { User, Mail, Phone } from "lucide-react";

export default async function ReferralJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { campaignId } = await params;
  const { ref } = await searchParams;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId) ?? campaigns[0];
  const days = campaign.endDate ? daysRemaining(campaign.endDate) : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem 1.5rem",
      }}
    >
      {/* Brand header */}
      <div style={{ marginBottom: "2rem", textAlign: "center" }}>
        <span
          className="text-gradient-brand"
          style={{ fontSize: "1.6rem", fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          {APP_NAME}
        </span>
      </div>

      <div style={{ width: "100%", maxWidth: "480px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {/* Campaign banner */}
        <div
          className="card-glow animate-scale-in"
          style={{ padding: "2rem", textAlign: "center" }}
        >
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              marginTop: "0.75rem",
              lineHeight: 1.3,
            }}
          >
            {campaign.title}
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem", lineHeight: 1.6 }}>
            {campaign.description}
          </p>

          {/* Reward highlight */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1.25rem",
              borderRadius: "var(--radius-pill)",
              background: "var(--color-primary-muted)",
              border: "1px solid var(--color-border-strong)",
              marginTop: "1rem",
            }}
          >
            <span style={{ fontSize: "1.25rem" }}>🎁</span>
            <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "1rem" }}>
              {campaign.reward}
            </span>
          </div>

          {/* Deadline */}
          {days !== null && (
            <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.75rem" }}>
              ⏰ {days > 0 ? `${days} days remaining` : "Campaign ended"}
            </p>
          )}
        </div>

        {/* Join form */}
        <div className="card animate-fade-in-up" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1.25rem" }}>
            Join & Start Referring
          </h2>

          {ref && (
            <div
              style={{
                padding: "0.6rem 0.85rem",
                background: "var(--color-success-muted)",
                border: "1px solid rgba(46,204,138,0.3)",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: "var(--color-success)",
              }}
            >
              ✅ You were referred by a friend! Your referral is tracked.
            </div>
          )}

          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <InputField
              id="part-name"
              label="Full Name"
              placeholder="Enter your full name"
              autoComplete="name"
              required
              leftIcon={<User size={16} />}
            />

            <InputField
              id="part-email"
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              autoComplete="email"
              required
              leftIcon={<Mail size={16} />}
            />

            <InputField
              id="part-phone"
              type="tel"
              label="Phone (optional)"
              placeholder="+92 300 0000000"
              autoComplete="tel"
              leftIcon={<Phone size={16} />}
            />


            {/* Hidden referrer code */}
            {ref && <input type="hidden" name="ref" value={ref} />}
            <input type="hidden" name="campaignId" value={campaignId} />

            <button
              id="participant-join-submit"
              type="submit"
              className="btn btn-primary animate-pulse-glow"
              style={{ padding: "0.8rem", fontSize: "0.95rem", marginTop: "0.25rem" }}
            >
              🚀 Join & Get My Referral Link
            </button>
          </form>

          <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.78rem", marginTop: "1rem" }}>
            By joining, you agree to the campaign terms. No spam, ever.
          </p>
        </div>

        {/* How it works */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "1rem" }}>
            How it works
          </h3>
          {[
            { step: "1", text: "Join the campaign with your name and email" },
            { step: "2", text: "Get your unique referral link instantly" },
            { step: "3", text: "Share with friends & family" },
            { step: "4", text: "Earn rewards for every successful referral!" },
          ].map((item) => (
            <div key={item.step} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start", marginBottom: "0.65rem" }}>
              <span
                style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "var(--gradient-brand)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                }}
              >
                {item.step}
              </span>
              <span style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", paddingTop: "2px" }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
