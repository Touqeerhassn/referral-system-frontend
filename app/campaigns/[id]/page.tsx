import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getMockCampaigns, getMockLeaderboard, statusBadgeClass, formatDate, buildReferralLink } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${APP_NAME} — Campaign ${id}`,
    description: "View your referral campaign details and analytics.",
  };
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const leaderboard = getMockLeaderboard(5);
  const referralLink = `http://localhost:3000/r/${campaign.id}`;

  return (
    <>
      <Topbar
        title={campaign.title}
        actions={
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href={ROUTES.editCampaign(id)} className="btn btn-ghost" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
              ✏️ Edit
            </Link>
            <Link href={ROUTES.campaignLeaderboard(id)} className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.82rem" }}>
              🏆 Leaderboard
            </Link>
          </div>
        }
      />

      <main style={{ flex: 1, padding: "2rem", overflowY: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem", alignItems: "start" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {/* Info card */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                <div>
                  <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                    {campaign.title}
                  </h1>
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.35rem" }}>
                    {campaign.description}
                  </p>
                </div>
                <span className={`badge ${statusBadgeClass(campaign.status)}`} style={{ textTransform: "capitalize", flexShrink: 0, marginLeft: "1rem" }}>
                  {campaign.status}
                </span>
              </div>

              <hr className="divider" style={{ marginBottom: "1rem" }} />

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                {[
                  { label: "Reward", value: campaign.reward, icon: "🎁" },
                  { label: "Participants", value: campaign.totalParticipants, icon: "👥" },
                  { label: "Referrals", value: campaign.totalReferrals, icon: "🔗" },
                ].map((s) => (
                  <div key={s.label} style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "1.5rem" }}>{s.icon}</span>
                    <p style={{ color: "var(--color-primary)", fontWeight: 800, fontSize: "1.25rem", marginTop: "0.25rem" }}>
                      {s.value}
                    </p>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.75rem" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral link card */}
            <div className="card-glow" style={{ padding: "1.5rem" }}>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.75rem" }}>
                📣 Campaign Referral Link
              </h2>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", marginBottom: "0.75rem" }}>
                Share this link with your customers. They will each get a unique personal link after joining.
              </p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  readOnly
                  value={referralLink}
                  className="input"
                  style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}
                />
                <button id={`copy-link-${id}`} className="btn btn-primary" style={{ padding: "0 1.25rem", flexShrink: 0 }}>
                  Copy
                </button>
              </div>
            </div>

            {/* Mini leaderboard */}
            <div className="card" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
                  🏆 Top Referrers
                </h2>
                <Link href={ROUTES.campaignLeaderboard(id)} style={{ color: "var(--color-primary)", fontSize: "0.82rem", fontWeight: 600, textDecoration: "none" }}>
                  Full leaderboard →
                </Link>
              </div>
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.6rem 0",
                    borderBottom: entry.rank < 5 ? "1px solid var(--color-border-subtle)" : "none",
                  }}
                >
                  <span style={{
                    width: "24px",
                    textAlign: "center",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    color: entry.rank <= 3 ? "var(--color-warning)" : "var(--color-text-muted)",
                  }}>
                    #{entry.rank}
                  </span>
                  <div
                    style={{
                      width: "28px", height: "28px", borderRadius: "50%",
                      background: "var(--gradient-brand)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.7rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                    }}
                  >
                    {entry.participantName[0]}
                  </div>
                  <span style={{ flex: 1, color: "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: 500 }}>
                    {entry.participantName}
                  </span>
                  <span style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.875rem" }}>
                    {entry.referralCount} refs
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column — sidebar info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.85rem" }}>
                Campaign Info
              </h3>
              {[
                { label: "Status",     value: campaign.status, capitalize: true },
                { label: "Start Date", value: formatDate(campaign.startDate) },
                { label: "End Date",   value: campaign.endDate ? formatDate(campaign.endDate) : "No end date" },
                { label: "Reward",     value: campaign.reward },
                { label: "Reward Type", value: campaign.rewardType, capitalize: true },
              ].map((row) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.45rem 0", borderBottom: "1px solid var(--color-border-subtle)" }}>
                  <span style={{ color: "var(--color-text-muted)", fontSize: "0.8rem" }}>{row.label}</span>
                  <span style={{ color: "var(--color-text-primary)", fontSize: "0.8rem", fontWeight: 600, textTransform: row.capitalize ? "capitalize" : "none" as any }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: "1.25rem" }}>
              <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.85rem" }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <Link href={ROUTES.editCampaign(id)} className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: "0.85rem" }}>
                  ✏️ Edit Campaign
                </Link>
                <Link href={ROUTES.campaignLeaderboard(id)} className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: "0.85rem" }}>
                  🏆 View Leaderboard
                </Link>
                <button id={`pause-campaign-${id}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: "0.85rem", width: "100%" }}>
                  ⏸️ Pause Campaign
                </button>
                <button id={`end-campaign-${id}`} className="btn btn-ghost" style={{ justifyContent: "flex-start", fontSize: "0.85rem", color: "var(--color-error)", width: "100%" }}>
                  🛑 End Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
