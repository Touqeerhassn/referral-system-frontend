import type { Metadata } from "next";
import Topbar from "@/components/Topbar";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getMockLeaderboard, getMockCampaigns } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${APP_NAME} — Leaderboard`,
    description: `Campaign ${id} referral leaderboard.`,
  };
}

const medals = ["🥇", "🥈", "🥉"];

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];
  const leaderboard = getMockLeaderboard(10);

  return (
    <>
      <Topbar title={`🏆 ${campaign.title} — Leaderboard`} />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", maxWidth: "800px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Leaderboard
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Top referrers for <strong style={{ color: "var(--color-primary)" }}>{campaign.title}</strong>
          </p>
        </div>

        {/* Top 3 podium */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            alignItems: "flex-end",
            marginBottom: "2rem",
          }}
        >
          {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => {
            const heights = ["100px", "130px", "90px"];
            const sizes = ["1.1rem", "1.3rem", "1rem"];
            const displayRank = [2, 1, 3][i];
            return (
              <div
                key={entry.participantId}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                  maxWidth: "200px",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    background: "var(--gradient-brand)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "#fff",
                    boxShadow: displayRank === 1 ? "var(--shadow-glow)" : "none",
                  }}
                >
                  {entry.participantName[0]}
                </div>
                <p style={{ color: "var(--color-text-primary)", fontWeight: 700, fontSize: sizes[i], textAlign: "center" }}>
                  {medals[displayRank - 1]} {entry.participantName.split(" ")[0]}
                </p>
                <p style={{ color: "var(--color-primary)", fontWeight: 700, fontSize: "0.9rem" }}>
                  {entry.referralCount} refs
                </p>
                <div
                  style={{
                    width: "100%",
                    height: heights[i],
                    background: displayRank === 1 ? "var(--gradient-brand)" : "var(--color-bg-card)",
                    borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                    border: "1px solid var(--color-border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    color: displayRank === 1 ? "#fff" : "var(--color-text-muted)",
                  }}
                >
                  {displayRank}
                </div>
              </div>
            );
          })}
        </div>

        {/* Full table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--color-bg-elevated)" }}>
                {["Rank", "Participant", "Referrals", "Rewards"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "0.85rem 1.25rem",
                      textAlign: h === "Rank" || h === "Referrals" || h === "Rewards" ? "center" : "left",
                      color: "var(--color-text-muted)",
                      fontSize: "0.75rem",
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
              {leaderboard.map((entry) => (
                <tr
                  key={entry.participantId}
                  style={{
                    borderBottom: "1px solid var(--color-border-subtle)",
                    transition: "background var(--transition-fast)",
                  }}
                >
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "center" }}>
                    <span style={{
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      color: entry.rank <= 3 ? "var(--color-warning)" : "var(--color-text-muted)",
                    }}>
                      {entry.rank <= 3 ? medals[entry.rank - 1] : `#${entry.rank}`}
                    </span>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <div
                        style={{
                          width: "32px", height: "32px", borderRadius: "50%",
                          background: "var(--gradient-brand)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                        }}
                      >
                        {entry.participantName[0]}
                      </div>
                      <span style={{ color: "var(--color-text-primary)", fontWeight: 500, fontSize: "0.9rem" }}>
                        {entry.participantName}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "center" }}>
                    <span style={{ color: "var(--color-primary)", fontWeight: 700 }}>{entry.referralCount}</span>
                  </td>
                  <td style={{ padding: "0.9rem 1.25rem", textAlign: "center" }}>
                    <span className="badge badge-success">{entry.totalRewards}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
