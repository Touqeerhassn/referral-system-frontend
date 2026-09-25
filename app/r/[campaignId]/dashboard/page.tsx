import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { getMockCampaigns, getMockParticipant, getMockLeaderboard } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}): Promise<Metadata> {
  return { title: `${APP_NAME} — My Referral Dashboard` };
}

export default async function ParticipantDashboardPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === campaignId) ?? campaigns[0];
  const participant = getMockParticipant(campaignId);
  const leaderboard = getMockLeaderboard(10);
  const myRank = leaderboard.findIndex((e) => e.referralCount <= participant.referralCount) + 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        padding: "2rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div style={{ width: "100%", maxWidth: "700px" }}>
        <div style={{ marginBottom: "1.75rem", textAlign: "center" }}>
          <span
            className="text-gradient-brand"
            style={{ fontSize: "1.5rem", fontWeight: 900, letterSpacing: "-0.02em", display: "block" }}
          >
            {APP_NAME}
          </span>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>
            Participant Dashboard
          </p>
        </div>

        {/* Welcome card */}
        <div className="card-glow animate-scale-in" style={{ padding: "1.75rem", marginBottom: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-text-primary)" }}>
                Hi, {participant.name}! 👋
              </h1>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                You&apos;re participating in{" "}
                <strong style={{ color: "var(--color-primary)" }}>{campaign.title}</strong>
              </p>
            </div>
            <span className="badge badge-success" style={{ fontSize: "0.82rem" }}>🟢 Active</span>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "1rem",
              marginTop: "1.25rem",
            }}
          >
            {[
              { label: "My Referrals",  value: participant.referralCount, icon: "🔗", color: "var(--color-primary)" },
              { label: "Total Earned",  value: participant.totalRewards,  icon: "💰", color: "var(--color-warning)" },
              { label: "My Rank",       value: `#${myRank}`,             icon: "🏆", color: "var(--color-success)" },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  textAlign: "center",
                  padding: "0.85rem",
                  background: "var(--color-bg-card)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <span style={{ fontSize: "1.4rem" }}>{s.icon}</span>
                <p style={{ color: s.color, fontSize: "1.5rem", fontWeight: 800, marginTop: "0.25rem", lineHeight: 1 }}>
                  {s.value}
                </p>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", marginTop: "0.2rem" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* My referral link */}
        <div className="card animate-fade-in-up" style={{ padding: "1.5rem", marginBottom: "1.25rem" }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.5rem" }}>
            📣 My Referral Link
          </h2>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.82rem", marginBottom: "0.85rem" }}>
            Share this link with friends. You earn <strong style={{ color: "var(--color-primary)" }}>{campaign.reward}</strong> for every successful referral.
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              readOnly
              value={participant.referralLink}
              className="input"
              id="my-referral-link"
              style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}
            />
            <button id="copy-my-link" className="btn btn-primary" style={{ padding: "0 1.25rem", flexShrink: 0 }}>
              Copy
            </button>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
            <button id="share-whatsapp" className="btn btn-ghost" style={{ flex: 1, fontSize: "0.82rem", padding: "0.5rem" }}>
              💬 WhatsApp
            </button>
            <button id="share-facebook" className="btn btn-ghost" style={{ flex: 1, fontSize: "0.82rem", padding: "0.5rem" }}>
              📘 Facebook
            </button>
            <button id="share-twitter" className="btn btn-ghost" style={{ flex: 1, fontSize: "0.82rem", padding: "0.5rem" }}>
              🐦 Twitter
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-border-subtle)" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
              🏆 Campaign Leaderboard
            </h2>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-elevated)" }}>
                {["Rank", "Participant", "Referrals", "Rewards"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.75rem 1.25rem",
                      textAlign: h === "Rank" || h === "Referrals" || h === "Rewards" ? "center" : "left",
                      color: "var(--color-text-muted)",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid var(--color-border-subtle)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => {
                const isMe = entry.referralCount === participant.referralCount && entry.rank === myRank;
                return (
                  <tr
                    key={entry.participantId}
                    style={{
                      borderBottom: "1px solid var(--color-border-subtle)",
                      background: isMe ? "var(--color-primary-muted)" : "transparent",
                    }}
                  >
                    <td style={{ padding: "0.8rem 1.25rem", textAlign: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: "0.85rem", color: entry.rank <= 3 ? "var(--color-warning)" : "var(--color-text-muted)" }}>
                        #{entry.rank}
                      </span>
                    </td>
                    <td style={{ padding: "0.8rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {entry.participantName[0]}
                        </div>
                        <span style={{ color: isMe ? "var(--color-primary)" : "var(--color-text-primary)", fontSize: "0.875rem", fontWeight: isMe ? 700 : 400 }}>
                          {entry.participantName}{isMe && " (You)"}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "0.8rem 1.25rem", textAlign: "center" }}>
                      <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{entry.referralCount}</span>
                    </td>
                    <td style={{ padding: "0.8rem 1.25rem", textAlign: "center" }}>
                      <span className="badge badge-success">{entry.totalRewards}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
