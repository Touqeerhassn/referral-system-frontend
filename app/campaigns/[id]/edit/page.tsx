import type { Metadata } from "next";
import Link from "next/link";
import Topbar from "@/components/Topbar";
import { APP_NAME, REWARD_TYPE_LABELS, ROUTES } from "@/lib/constants";
import { getMockCampaigns } from "@/lib/utils";
import { InputField } from "@/components/ui/InputField";
import { ArrowLeft, Save, Sparkles, Gift, Calendar } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `${APP_NAME} — Edit Campaign ${id}` };
}

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
      <Topbar
        title={`Edit — ${campaign.title}`}
        actions={
          <Link
            href={ROUTES.campaignDetail(id)}
            className="btn btn-ghost px-2.5 sm:px-3 py-1.5 text-xs font-semibold flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back</span>
          </Link>
        }
      />
      <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-2xl w-full mx-auto overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            Edit Campaign
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-muted)] mt-1">
            Update your campaign details, rewards, and duration.
          </p>
        </div>

        <form className="flex flex-col gap-5 sm:gap-6">
          {/* Campaign Details */}
          <div className="card p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Sparkles size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Campaign Identity
              </h2>
            </div>
            <InputField
              id="edit-title"
              label="Campaign Title"
              defaultValue={campaign.title}
            />
            <div>
              <label
                htmlFor="edit-desc"
                className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5"
              >
                Description
              </label>
              <textarea
                id="edit-desc"
                className="input-base text-xs sm:text-sm p-3 w-full rounded-xl resize-y min-h-[80px]"
                rows={3}
                defaultValue={campaign.description}
              />
            </div>
          </div>

          {/* Reward Settings */}
          <div className="card p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Gift size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Reward Settings
              </h2>
            </div>
            <div>
              <label
                htmlFor="edit-reward-type"
                className="block text-xs font-semibold text-[var(--color-text-secondary)] mb-1.5"
              >
                Reward Type
              </label>
              <select
                id="edit-reward-type"
                className="input-base text-xs sm:text-sm h-11 px-3 w-full rounded-xl cursor-pointer bg-[var(--color-bg-base)]"
                defaultValue={campaign.rewardType}
              >
                {Object.entries(REWARD_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              id="edit-reward"
              label="Reward Value / Text"
              defaultValue={campaign.reward}
            />
          </div>

          {/* Schedule */}
          <div className="card p-5 sm:p-6 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-[var(--color-border-subtle)]">
              <Calendar size={16} className="text-[var(--color-primary)]" />
              <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                Duration & Dates
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
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

          {/* Submit Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            <button
              id={`edit-save-${id}`}
              type="submit"
              className="btn btn-primary px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Save size={15} />
              <span>Save Changes</span>
            </button>
            <Link
              href={ROUTES.campaignDetail(id)}
              className="btn btn-ghost px-5 py-2.5 text-xs sm:text-sm font-semibold flex items-center justify-center text-[var(--color-text-muted)]"
            >
              Cancel
            </Link>
          </div>
        </form>
      </main>
    </>
  );
}
