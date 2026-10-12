import type { Metadata } from "next";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { getMockCampaigns, daysRemaining } from "@/lib/utils";
import { InputField } from "@/components/ui/InputField";
import { User, Mail, Phone, Gift, Sparkles, CheckCircle2 } from "lucide-react";

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
    <div className="min-h-screen bg-[var(--gradient-hero)] flex flex-col items-center justify-center p-3.5 sm:p-6 md:p-8">
      {/* Brand header */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <span className="text-gradient-brand text-2xl sm:text-3xl font-black tracking-tight">
            {APP_NAME}
          </span>
        </Link>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-5">
        {/* Campaign banner */}
        <div className="card-glow p-5 sm:p-8 text-center animate-scale-in">
          <span className="text-4xl sm:text-5xl block mb-2">🎉</span>
          <h1 className="text-xl sm:text-2xl font-black text-[var(--color-text-primary)] tracking-tight">
            {campaign.title}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
            {campaign.description}
          </p>

          {/* Reward highlight */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-primary-muted)] border border-[var(--color-border-strong)] mt-4">
            <span className="text-base sm:text-lg">🎁</span>
            <span className="text-[var(--color-primary)] font-bold text-xs sm:text-sm">
              {campaign.reward}
            </span>
          </div>

          {/* Deadline */}
          {days !== null && (
            <p className="text-[var(--color-text-muted)] text-xs mt-3">
              ⏰ {days > 0 ? `${days} days remaining` : "Campaign ended"}
            </p>
          )}
        </div>

        {/* Join form */}
        <div className="card p-5 sm:p-7 animate-fade-in-up">
          <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
            Join & Start Referring
          </h2>

          {ref && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>You were invited by a friend! Your referral will be tracked.</span>
            </div>
          )}

          <form className="flex flex-col gap-4">
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
              className="btn btn-primary py-3 text-xs sm:text-sm font-bold shadow-md mt-1 flex items-center justify-center gap-2"
            >
              🚀 Join & Get My Referral Link
            </button>
          </form>

          <p className="text-center text-[var(--color-text-muted)] text-[0.72rem] mt-3">
            By joining, you agree to the campaign terms. No spam, ever.
          </p>
        </div>

        {/* How it works */}
        <div className="card p-5 sm:p-6">
          <h3 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)] mb-3">
            How it works
          </h3>
          {[
            { step: "1", text: "Join the campaign with your name and email" },
            { step: "2", text: "Get your unique referral link instantly" },
            { step: "3", text: "Share with friends & family" },
            { step: "4", text: "Earn rewards for every successful referral!" },
          ].map((item) => (
            <div key={item.step} className="flex gap-3 items-start mb-2.5 last:mb-0">
              <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-brand-crimson)] flex items-center justify-center text-[0.68rem] font-bold text-white shrink-0">
                {item.step}
              </span>
              <span className="text-[var(--color-text-secondary)] text-xs pt-0.5">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
