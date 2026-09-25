import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getMockCampaigns, statusBadgeClass, formatDate } from "@/lib/utils";
import type { DashboardStats } from "@/types";

export const metadata: Metadata = {
  title: `${APP_NAME} — Dashboard`,
  description: "Overview of your referral campaigns, participants, and earnings.",
};

const stats: DashboardStats = {
  totalCampaigns: 3,
  activeCampaigns: 2,
  totalParticipants: 67,
  totalReferrals: 184,
  totalRewardsPaid: "$840",
  conversionRate: 38,
};

const statCards = [
  { label: "Active Campaigns", value: stats.activeCampaigns,     icon: "📣", color: "var(--color-primary)" },
  { label: "Total Participants", value: stats.totalParticipants,  icon: "👥", color: "#4A9FF0" },
  { label: "Total Referrals",   value: stats.totalReferrals,     icon: "🔗", color: "var(--color-success)" },
  { label: "Rewards Paid",      value: stats.totalRewardsPaid,   icon: "💰", color: "var(--color-warning)" },
];

export default function DashboardPage() {
  const campaigns = getMockCampaigns();

  return (
    <>
      <Topbar
        title="Dashboard"
        actions={
          <Link href={ROUTES.newCampaign} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            + New Campaign
          </Link>
        }
      />

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Welcome banner */}
        <div
          className="card-glow"
          style={{ padding: "1.75rem 2rem", marginBottom: "2rem", position: "relative", overflow: "hidden" }}
        >
          <div
            style={{
              position: "absolute", top: "-30px", right: "-30px",
              width: "200px", height: "200px",
              background: "rgba(240, 74, 103, 0.10)",
              borderRadius: "50%", filter: "blur(48px)",
            }}
          />
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-text-primary)", position: "relative" }}>
            Welcome back, Business! 👋
          </h1>
          <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9rem", marginTop: "0.4rem", position: "relative" }}>
            You have <strong style={{ color: "var(--color-primary)" }}>{stats.activeCampaigns} active campaigns</strong> running.
            Conversion rate is <strong style={{ color: "var(--color-success)" }}>{stats.conversionRate}%</strong>.
          </p>
        </div>

        {/* Stat Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {statCards.map((s) => (
            <div key={s.label} className="card" style={{ padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {s.label}
                  </p>
                  <p style={{ color: s.color, fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem", lineHeight: 1 }}>
                    {s.value}
                  </p>
                </div>
                <span style={{ fontSize: "1.75rem", opacity: 0.8 }}>{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Campaigns */}
        <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Recent Campaigns
          </h2>
          <Link href={ROUTES.campaigns} style={{ color: "var(--color-primary)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
            View all →
          </Link>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {campaigns.map((c) => (
            <Link
              key={c.id}
              href={ROUTES.campaignDetail(c.id)}
              style={{ textDecoration: "none" }}
            >
              <div
                className="card"
                style={{
                  padding: "1.1rem 1.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ color: "var(--color-text-primary)", fontWeight: 600, fontSize: "0.95rem", marginBottom: "0.2rem" }}>
                    {c.title}
                  </h3>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>
                    Started {formatDate(c.startDate)} · {c.reward}
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexShrink: 0 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{c.totalParticipants}</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem" }}>Participants</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{c.totalReferrals}</p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem" }}>Referrals</p>
                  </div>
                  <span className={`badge ${statusBadgeClass(c.status)}`} style={{ textTransform: "capitalize" }}>
                    {c.status}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
