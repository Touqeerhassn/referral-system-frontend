"use client";

import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  return (
    <header
      style={{
        height: "64px",
        background: "var(--color-bg-card)",
        borderBottom: "1px solid var(--color-border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 40,
        backdropFilter: "blur(8px)",
      }}
    >
      <h2
        style={{
          fontSize: "1.05rem",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      >
        {title}
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {actions}
        {/* Notification bell */}
        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            background: "var(--color-bg-card)",
            border: "1px solid var(--color-border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-secondary)",
            transition: "all var(--transition-fast)",
          }}
          title="Notifications"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
