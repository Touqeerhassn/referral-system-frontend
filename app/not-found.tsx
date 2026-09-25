import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--gradient-hero)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem",
        gap: "1.5rem",
      }}
    >
      <span style={{ fontSize: "5rem" }}>🔍</span>
      <h1
        className="text-gradient-brand"
        style={{ fontSize: "4rem", fontWeight: 900, lineHeight: 1 }}
      >
        404
      </h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "1.1rem", maxWidth: "400px" }}>
        Oops! This page doesn&apos;t exist or the referral link may have expired.
      </p>
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <Link href="/" className="btn btn-primary" style={{ padding: "0.75rem 2rem" }}>
          Go Home
        </Link>
        <Link href="/dashboard" className="btn btn-outline" style={{ padding: "0.75rem 2rem" }}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
