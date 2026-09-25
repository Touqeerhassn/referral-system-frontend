import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${APP_NAME} — Login`,
  description: "Log in to your RefPulse business account.",
};

import { Mail, Lock } from "lucide-react";
import { InputField } from "@/components/ui/InputField";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        className="card-glow animate-scale-in"
        style={{ width: "100%", maxWidth: "420px", padding: "2.5rem" }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <span
            className="text-gradient-brand"
            style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em" }}
          >
            {APP_NAME}
          </span>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginTop: "0.4rem" }}>
            Welcome back — sign in to continue
          </p>
        </div>

        {/* Form */}
        <form style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          <InputField
            id="login-email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="you@business.com"
            autoComplete="email"
            required
            leftIcon={<Mail size={16} />}
          />

          <InputField
            id="login-password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            leftIcon={<Lock size={16} />}
          />

          <button id="login-submit" type="submit" className="btn btn-primary" style={{ marginTop: "0.5rem", width: "100%", padding: "0.75rem" }}>
            Log In
          </button>
        </form>


        <hr className="divider" style={{ margin: "1.5rem 0" }} />

        <p style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-link" style={{ fontWeight: 600, textDecoration: "none" }}>
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
