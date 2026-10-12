import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { getMockCampaigns, getMockParticipant, getMockLeaderboard } from "@/lib/utils";
import { Trophy, Link as LinkIcon, Gift, Share2, Copy } from "lucide-react";

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
    <div className="min-h-screen bg-[var(--gradient-hero)] p-3.5 sm:p-6 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="text-center mb-1">
          <Link href="/" className="inline-block">
            <span className="text-gradient-brand text-2xl font-black tracking-tight">
              {APP_NAME}
            </span>
          </Link>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Participant Referral Portal
          </p>
        </div>

        {/* Welcome card */}
        <div className="card-glow p-5 sm:p-7 animate-scale-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
                Hi, {participant.name}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1">
                You are participating in{" "}
                <strong className="text-[var(--color-primary)]">{campaign.title}</strong>
              </p>
            </div>
            <span className="badge badge-success text-xs font-bold self-start sm:self-auto">
              🟢 Active
            </span>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4 mt-5">
            {[
              { label: "My Referrals", value: participant.referralCount, icon: "🔗", color: "text-[var(--color-primary)]" },
              { label: "Total Earned", value: participant.totalRewards, icon: "💰", color: "text-[var(--color-warning)]" },
              { label: "My Rank", value: `#${myRank}`, icon: "🏆", color: "text-[var(--color-success)]" },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-3 rounded-2xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] shadow-2xs"
              >
                <span className="text-xl sm:text-2xl block">{s.icon}</span>
                <p className={`${s.color} text-lg sm:text-2xl font-black mt-1 leading-tight`}>
                  {s.value}
                </p>
                <p className="text-[var(--color-text-muted)] text-[0.68rem] sm:text-xs mt-0.5 font-medium truncate">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* My referral link */}
        <div className="card p-5 sm:p-6 animate-fade-in-up">
          <h2 className="text-sm sm:text-base font-bold text-[var(--color-text-primary)] mb-1">
            📣 My Referral Link
          </h2>
          <p className="text-xs text-[var(--color-text-muted)] mb-3">
            Share this link with friends. You earn{" "}
            <strong className="text-[var(--color-primary)]">{campaign.reward}</strong> for every successful referral.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              readOnly
              value={participant.referralLink}
              id="my-referral-link"
              className="input-base text-xs font-mono py-2 px-3 flex-1 bg-[var(--color-bg-subtle)] truncate"
            />
            <button
              id="copy-my-link"
              type="button"
              className="btn btn-primary px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
            >
              <Copy size={13} />
              <span>Copy</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              id="share-whatsapp"
              type="button"
              className="btn btn-ghost py-2 text-xs font-semibold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
            >
              💬 WhatsApp
            </button>
            <button
              id="share-facebook"
              type="button"
              className="btn btn-ghost py-2 text-xs font-semibold rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200"
            >
              📘 Facebook
            </button>
            <button
              id="share-twitter"
              type="button"
              className="btn btn-ghost py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200"
            >
              🐦 Twitter
            </button>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="card overflow-hidden shadow-xs">
          <div className="p-4 border-b border-[var(--color-border-subtle)]">
            <h2 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Trophy size={15} className="text-amber-500" />
              <span>Campaign Leaderboard</span>
            </h2>
          </div>

          {/* Mobile Card View (screens < sm) */}
          <div className="block sm:hidden divide-y divide-[var(--color-border-subtle)]">
            {leaderboard.map((entry) => {
              const isMe = entry.referralCount === participant.referralCount && entry.rank === myRank;
              return (
                <div
                  key={entry.participantId}
                  className={`p-3 flex items-center justify-between gap-2.5 ${
                    isMe ? "bg-[var(--color-primary-soft)]/50" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs text-[var(--color-text-muted)] w-5 text-center shrink-0">
                      #{entry.rank}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-brand-crimson)] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {entry.participantName[0]}
                    </div>
                    <span className={`text-xs truncate ${isMe ? "font-bold text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>
                      {entry.participantName} {isMe && "(You)"}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-[var(--color-primary)] block">
                      {entry.referralCount} refs
                    </span>
                    <span className="badge badge-success text-[0.65rem]">
                      {entry.totalRewards}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (screens >= sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-[var(--color-border-subtle)] text-[var(--color-text-muted)] uppercase tracking-wider font-semibold text-[0.68rem]">
                  <th className="py-2.5 px-4 text-center">Rank</th>
                  <th className="py-2.5 px-4">Participant</th>
                  <th className="py-2.5 px-4 text-center">Referrals</th>
                  <th className="py-2.5 px-4 text-right">Rewards</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border-subtle)]">
                {leaderboard.map((entry) => {
                  const isMe = entry.referralCount === participant.referralCount && entry.rank === myRank;
                  return (
                    <tr
                      key={entry.participantId}
                      className={isMe ? "bg-[var(--color-primary-soft)]/50" : "hover:bg-slate-50"}
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-500">
                        #{entry.rank}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-brand-crimson)] text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {entry.participantName[0]}
                          </div>
                          <span className={`font-medium ${isMe ? "font-bold text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"}`}>
                            {entry.participantName} {isMe && "(You)"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-[var(--color-primary)]">
                        {entry.referralCount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="badge badge-success text-[0.68rem]">{entry.totalRewards}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
