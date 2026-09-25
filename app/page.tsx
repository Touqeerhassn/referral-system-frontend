import Link from "next/link";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_NAME} — ${APP_TAGLINE}`,
  description:
    "RefPulse helps businesses grow through powerful referral campaigns. Register, launch a campaign, and let your customers do the marketing.",
};

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ─── Navbar ─── */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "1.25rem 2.5rem",
          borderBottom: "1px solid var(--color-border-default)",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <span
          className="text-gradient-brand"
          style={{ fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.02em" }}
        >
          {APP_NAME}
        </span>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <Link href="/login" className="btn btn-ghost" style={{ padding: "0.5rem 1.25rem" }}>
            Log In
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: "0.5rem 1.25rem" }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "5rem 1.5rem",
          gap: "2rem",
        }}
      >
        <span className="badge badge-primary animate-fade-in-up" style={{ fontSize: "0.8rem" }}>
          🚀 Referral-powered growth for every business
        </span>

        <h1
          className="text-gradient-brand animate-fade-in-up"
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: "800px",
            animationDelay: "0.05s",
          }}
        >
          {APP_TAGLINE}
        </h1>

        <p
          className="animate-fade-in-up"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "1.15rem",
            maxWidth: "560px",
            lineHeight: 1.7,
            animationDelay: "0.1s",
          }}
        >
          Launch referral campaigns in minutes. Share unique links with customers.
          Watch your business grow through word-of-mouth — automatically.
        </p>

        <div
          className="animate-fade-in-up"
          style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", animationDelay: "0.15s" }}
        >
          <Link href="/register" className="btn btn-primary animate-pulse-glow" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
            Start for Free
          </Link>
          <Link href="/login" className="btn btn-outline" style={{ padding: "0.8rem 2rem", fontSize: "1rem" }}>
            I already have an account
          </Link>
        </div>

        {/* ─── Feature Cards ─── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "1.25rem",
            maxWidth: "900px",
            width: "100%",
            marginTop: "3rem",
          }}
        >
          {[
            { icon: "🏪", title: "Register Your Business", desc: "Set up as a Guest or Subscriber and get your campaign hub." },
            { icon: "📣", title: "Launch Campaigns", desc: "Create reward-based referral campaigns in just a few clicks." },
            { icon: "🔗", title: "Share Referral Links", desc: "Customers get unique links to share with their network." },
            { icon: "🏆", title: "Track & Reward", desc: "Live leaderboards, referral counts, and automatic reward tracking." },
          ].map((f) => (
            <div key={f.title} className="card animate-fade-in-up" style={{ padding: "1.5rem", textAlign: "left" }}>
              <span style={{ fontSize: "2rem" }}>{f.icon}</span>
              <h3 style={{ color: "var(--color-text-primary)", fontWeight: 700, marginTop: "0.75rem", fontSize: "1rem" }}>
                {f.title}
              </h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.4rem", lineHeight: 1.6 }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </main>

      {/* ─── Footer ─── */}
      <footer
        style={{
          textAlign: "center",
          padding: "1.5rem",
          color: "var(--color-text-muted)",
          fontSize: "0.82rem",
          borderTop: "1px solid var(--color-border-default)",
          background: "var(--color-bg-card)",
        }}
      >
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </footer>
    </div>
  );
}
