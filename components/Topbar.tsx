"use client";

import React from "react";
import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import { APP_NAME } from "@/lib/constants";
import { useMobileNav } from "@/components/providers/MobileNavProvider";

interface TopbarProps {
  title?: string;
  actions?: React.ReactNode;
}

export default function Topbar({ title, actions }: TopbarProps) {
  const { open } = useMobileNav();

  return (
    <header className="h-14 sm:h-16 px-3.5 sm:px-6 md:px-8 bg-[var(--color-bg-card)]/90 backdrop-blur-md border-b border-[var(--color-border-default)] flex items-center justify-between sticky top-0 z-30 transition-all">
      {/* Left: Mobile Menu Trigger + Title */}
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
        <button
          type="button"
          onClick={open}
          className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h2 className="text-sm sm:text-base md:text-lg font-bold text-[var(--color-text-primary)] truncate">
            {title || APP_NAME}
          </h2>
        </div>
      </div>

      {/* Right: Actions & Optional Notification */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {actions}

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[var(--color-bg-card)] border border-[var(--color-border-default)] hover:border-[var(--color-border-strong)] text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell size={15} />
        </button>
      </div>
    </header>
  );
}
