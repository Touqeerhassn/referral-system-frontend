import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getMockCampaigns, statusBadgeClass, formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${APP_NAME} — Campaigns`,
  description: "Manage all your referral campaigns.",
};

export default function CampaignsPage() {
  const campaigns = getMockCampaigns();

  return (
    <>
      <Topbar
        title="Campaigns"
        actions={
          <Link href={ROUTES.newCampaign} className="btn btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.85rem" }}>
            + New Campaign
          </Link>
        }
      />

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            All Campaigns
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            {campaigns.length} campaigns total · {campaigns.filter((c) => c.status === "active").length} active
          </p>
        </div>

        {/* Campaign grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {campaigns.map((c) => (
            <div key={c.id} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Header row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
                    {c.title}
                  </h2>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", lineHeight: 1.5 }}>
                    {c.description}
                  </p>
                </div>
                <span className={`badge ${statusBadgeClass(c.status)}`} style={{ marginLeft: "0.75rem", textTransform: "capitalize", flexShrink: 0 }}>
                  {c.status}
                </span>
              </div>

              {/* Reward */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.2rem" }}>🎁</span>
                <span style={{ color: "var(--color-primary)", fontWeight: 600, fontSize: "0.9rem" }}>{c.reward}</span>
              </div>

              {/* Stats */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                  background: "var(--color-bg-elevated)",
                  borderRadius: "var(--radius-md)",
                  padding: "0.85rem 1rem",
                }}
              >
                <div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Participants
                  </p>
                  <p style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "1.1rem", marginTop: "0.15rem" }}>
                    {c.totalParticipants}
                  </p>
                </div>
                <div>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Referrals
                  </p>
                  <p style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: "1.1rem", marginTop: "0.15rem" }}>
                    {c.totalReferrals}
                  </p>
                </div>
              </div>

              {/* Dates */}
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.78rem" }}>
                Started {formatDate(c.startDate)}
                {c.endDate ? ` · Ends ${formatDate(c.endDate)}` : " · No end date"}
              </p>

              {/* Actions */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                <Link href={ROUTES.campaignDetail(c.id)} className="btn btn-secondary" style={{ flex: 1, padding: "0.5rem", fontSize: "0.82rem", justifyContent: "center" }}>
                  View
                </Link>
                <Link href={ROUTES.campaignLeaderboard(c.id)} className="btn btn-ghost" style={{ flex: 1, padding: "0.5rem", fontSize: "0.82rem", justifyContent: "center" }}>
                  🏆 Leaderboard
                </Link>
                <Link href={ROUTES.editCampaign(c.id)} className="btn btn-ghost" style={{ padding: "0.5rem 0.75rem", fontSize: "0.82rem" }}>
                  ✏️
                </Link>
              </div>
            </div>
          ))}

          {/* "Create new" card */}
          <Link href={ROUTES.newCampaign} style={{ textDecoration: "none" }}>
            <div
              style={{
                border: "2px dashed var(--color-border-default)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                minHeight: "260px",
                cursor: "pointer",
                transition: "all var(--transition-base)",
                color: "var(--color-text-muted)",
              }}
            >
              <span style={{ fontSize: "2.5rem" }}>➕</span>
              <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>Create Campaign</p>
              <p style={{ fontSize: "0.8rem", textAlign: "center" }}>Launch a new referral campaign</p>
            </div>
          </Link>
        </div>
      </main>
    </>
  );
}
