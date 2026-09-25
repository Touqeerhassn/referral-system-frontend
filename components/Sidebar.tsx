"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME, BUSINESS_NAV_ITEMS } from "@/lib/constants";

const icons: Record<string, React.ReactNode> = {
  grid: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  megaphone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  ),
  settings: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
};

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "var(--color-bg-card)",
        borderRight: "1px solid var(--color-border-default)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        flexShrink: 0,
        boxShadow: "1px 0 0 var(--color-border-subtle)",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "0 1.5rem 2rem" }}>
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span
            className="text-gradient-brand"
            style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            {APP_NAME}
          </span>
        </Link>
        <p style={{ color: "var(--color-text-muted)", fontSize: "0.72rem", marginTop: "2px" }}>
          Business Portal
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 0.75rem" }}>
        {BUSINESS_NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.65rem 0.85rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "0.25rem",
                textDecoration: "none",
                color: active ? "var(--color-primary)" : "var(--color-text-secondary)",
                background: active ? "var(--color-primary-soft)" : "transparent",
                fontWeight: active ? 600 : 400,
                fontSize: "0.875rem",
                transition: "all var(--transition-fast)",
                border: active ? "1px solid #F5C0CB" : "1px solid transparent",
              }}
            >
              <span style={{ opacity: active ? 1 : 0.7 }}>{icons[item.icon ?? "grid"]}</span>
              {item.label}
              {active && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "var(--color-primary)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        style={{
          margin: "0 0.75rem",
          padding: "0.85rem",
          borderRadius: "var(--radius-md)",
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-default)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--gradient-brand)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#fff",
              flexShrink: 0,
            }}
          >
            B
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--color-text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Business Owner
            </p>
            <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>Guest Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
