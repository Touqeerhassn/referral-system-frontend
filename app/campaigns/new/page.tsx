import type { Metadata } from "next";
import Topbar from "@/components/Topbar";
import { APP_NAME, REWARD_TYPE_LABELS } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — New Campaign`,
  description: "Create a new referral campaign for your business.",
};

const rewardTypes = Object.entries(REWARD_TYPE_LABELS);

import { InputField } from "@/components/ui/InputField";

export default function NewCampaignPage() {
  return (
    <>
      <Topbar title="Create Campaign" />
      <main style={{ flex: 1, padding: "2rem", overflowY: "auto", maxWidth: "720px" }}>
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--color-text-primary)" }}>
            New Referral Campaign
          </h1>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Fill in the details below to launch your campaign.
          </p>
        </div>

        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Basic Info */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              Campaign Details
            </h2>

            <InputField
              id="camp-title"
              label="Campaign Title"
              placeholder="e.g. Summer Referral Blast"
              required
            />

            <div>
              <label htmlFor="camp-desc" style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Description *
              </label>
              <textarea
                id="camp-desc"
                className="input"
                placeholder="Describe your campaign and what participants get..."
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* Reward */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              Reward Settings
            </h2>

            <div>
              <label htmlFor="camp-reward-type" style={{ display: "block", color: "var(--color-text-secondary)", fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.4rem" }}>
                Reward Type *
              </label>
              <select id="camp-reward-type" className="input" style={{ cursor: "pointer" }}>
                {rewardTypes.map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>

            <InputField
              id="camp-reward"
              label="Reward Value"
              placeholder='e.g. "$10 cash" or "15% discount"'
              required
            />
          </div>

          {/* Dates */}
          <div className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--color-text-primary)", marginBottom: "0.25rem" }}>
              Campaign Duration
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <InputField
                id="camp-start"
                type="date"
                label="Start Date"
                required
              />
              <InputField
                id="camp-end"
                type="date"
                label="End Date (optional)"
              />
            </div>
          </div>


          {/* Submit */}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button id="campaign-save-draft" type="button" className="btn btn-ghost" style={{ padding: "0.75rem 1.5rem" }}>
              Save as Draft
            </button>
            <button id="campaign-publish" type="submit" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
              🚀 Publish Campaign
            </button>
          </div>
        </form>
      </main>
    </>
  );
}
