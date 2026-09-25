import type { Metadata } from "next";
import Topbar from "@/components/Topbar";
import { APP_NAME, REWARD_TYPE_LABELS } from "@/lib/constants";
import { getMockCampaigns } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${APP_NAME} — Edit Campaign ${id}` };
}

import { InputField } from "@/components/ui/InputField";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaigns = getMockCampaigns();
  const campaign = campaigns.find((c) => c.id === id) ?? campaigns[0];

  return (
    <>
      <Topbar title={`Edit — ${campaign.title}`} />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", maxWidth: "720px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            Edit Campaign
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Update your campaign settings below.
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Campaign Details</h2>
            <InputField
              id="edit-title"
              label="Campaign Title"
              defaultValue={campaign.title}
            />
            <div>
              <label htmlFor="edit-desc" style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Description
              </label>
              <textarea id="edit-desc" className="input" rows={3} defaultValue={campaign.description} style={{ resize: "vertical" }} />
            </div>
          </div>

          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Reward</h2>
            <div>
              <label htmlFor="edit-reward-type" style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Reward Type
              </label>
              <select id="edit-reward-type" className="input" defaultValue={campaign.rewardType} style={{ cursor: "pointer" }}>
                {Object.entries(REWARD_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <InputField
              id="edit-reward"
              label="Reward Value"
              defaultValue={campaign.reward}
            />
          </div>

          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)" }}>Duration</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InputField
                id="edit-start"
                type="date"
                label="Start Date"
                defaultValue={campaign.startDate}
              />
              <InputField
                id="edit-end"
                type="date"
                label="End Date"
                defaultValue={campaign.endDate ?? ""}
              />
            </div>
          </div>


          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button id={`edit-save-${id}`} type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
              Save Changes
            </button>
            <a href={`/campaigns/${id}`} className="btn btn-ghost" style={{ padding: "0.75rem 1.5rem" }}>
              Cancel
            </a>
          </div>
        </form>
      </main>
    </>
  );
}
