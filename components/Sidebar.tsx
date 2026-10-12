"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, X, Plus, Menu } from "lucide-react";
import toast from "react-hot-toast";
import { APP_NAME, BUSINESS_NAV_ITEMS, ROUTES } from "@/lib/constants";
import { getStoredBusiness } from "@/lib/api/business";
import { useMobileNav } from "@/components/providers/MobileNavProvider";

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
  const router = useRouter();
  const { isOpen, close, toggle } = useMobileNav();
  const [business, setBusiness] = useState<any>(null);

  useEffect(() => {
    setBusiness(getStoredBusiness());
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("business_id");
      localStorage.removeItem("business");
      localStorage.removeItem("current_user");
      localStorage.removeItem("auth_token");
    }
    toast.success("Logged out successfully");
    close();
    router.push("/login");
  };

  const navLinksContent = (
    <nav className="flex-1 space-y-1 py-2">
      {BUSINESS_NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => close()}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-150 ${
              active
                ? "bg-[var(--color-primary-soft)] text-[var(--color-primary)] font-bold border border-[#F5C0CB] shadow-2xs"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-subtle)] font-medium border border-transparent"
            }`}
          >
            <span className={`shrink-0 ${active ? "opacity-100 text-[var(--color-primary)]" : "opacity-75"}`}>
              {icons[item.icon ?? "grid"]}
            </span>
            <span className="truncate">{item.label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] shrink-0" />
            )}
          </Link>
        );
      })}
    </nav>
  );

  const userFooterContent = (
    <div className="p-3 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex flex-col gap-3 shadow-2xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-brand-crimson)] text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-2xs">
          {business?.name ? business.name.charAt(0).toUpperCase() : "B"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-[var(--color-text-primary)] truncate">
            {business?.name || "Business Owner"}
          </p>
          <p className="text-[0.68rem] text-[var(--color-text-muted)] truncate">
            {business?.subsStatus ? `${business.subsStatus} Plan` : "Guest Plan"}
          </p>
        </div>
      </div>

      <button
        id="sidebar-logout-btn"
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-center gap-1.5 w-full py-1.5 px-2.5 rounded-lg border border-[var(--color-border-default)] hover:border-red-200 text-[var(--color-text-muted)] hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-all cursor-pointer"
        title="Sign out of RefPulse"
      >
        <LogOut size={13} />
        <span>Log Out</span>
      </button>
    </div>
  );

  return (
    <>
      {/* 1. DESKTOP SIDEBAR (Static, hidden on small screens) */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen shrink-0 border-r border-[var(--color-border-default)] bg-[var(--color-bg-card)] sticky top-0 h-screen p-5 justify-between shadow-xs z-30">
        <div>
          {/* Brand Logo */}
          <div className="mb-6 px-1">
            <Link href="/dashboard" className="inline-block">
              <span className="text-gradient-brand text-2xl font-black tracking-tight">
                {APP_NAME}
              </span>
            </Link>
            <p className="text-[0.7rem] uppercase font-bold tracking-wider text-[var(--color-text-muted)] mt-0.5">
              Business Portal
            </p>
          </div>

          {/* Nav Items */}
          {navLinksContent}
        </div>

        {/* User Footer */}
        {userFooterContent}
      </aside>

      {/* 2. MOBILE OFF-CANVAS SLIDE-OVER DRAWER (When open) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={close}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-72 max-w-[85vw] bg-[var(--color-bg-card)] h-full shadow-2xl flex flex-col justify-between p-5 z-10 border-r border-[var(--color-border-default)] animate-slide-in-right">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 mb-3 border-b border-[var(--color-border-subtle)]">
                <div>
                  <Link href="/dashboard" onClick={close} className="inline-block">
                    <span className="text-gradient-brand text-xl font-black tracking-tight">
                      {APP_NAME}
                    </span>
                  </Link>
                  <p className="text-[0.65rem] uppercase font-bold tracking-wider text-[var(--color-text-muted)]">
                    Business Portal
                  </p>
                </div>

                <button
                  onClick={close}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  aria-label="Close navigation"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nav Items */}
              {navLinksContent}
            </div>

            {/* Mobile Drawer Footer */}
            {userFooterContent}
          </div>
        </div>
      )}

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (Fixed at bottom on phones) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--color-bg-card)]/95 backdrop-blur-md border-t border-[var(--color-border-default)] px-3 py-1.5 flex items-center justify-around shadow-lg">
        {/* Dashboard */}
        <Link
          href={ROUTES.dashboard}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-xs font-semibold transition-colors ${
            pathname === ROUTES.dashboard
              ? "text-[var(--color-primary)] font-bold"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {icons.grid}
          </div>
          <span className="text-[0.68rem]">Dashboard</span>
        </Link>

        {/* Campaigns */}
        <Link
          href={ROUTES.campaigns}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-xs font-semibold transition-colors ${
            pathname === ROUTES.campaigns || pathname.startsWith("/campaigns/") && pathname !== ROUTES.newCampaign
              ? "text-[var(--color-primary)] font-bold"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {icons.megaphone}
          </div>
          <span className="text-[0.68rem]">Campaigns</span>
        </Link>

        {/* + Quick New Campaign (Center floating button) */}
        <Link
          href={ROUTES.newCampaign}
          className="flex flex-col items-center justify-center -mt-4 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white w-11 h-11 rounded-full shadow-md shadow-[var(--color-primary)]/30 active:scale-95 transition-all"
          title="Create New Campaign"
        >
          <Plus size={22} className="stroke-[2.5]" />
        </Link>

        {/* Settings */}
        <Link
          href={ROUTES.settings}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-xs font-semibold transition-colors ${
            pathname === ROUTES.settings
              ? "text-[var(--color-primary)] font-bold"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          <div className="w-5 h-5 flex items-center justify-center">
            {icons.settings}
          </div>
          <span className="text-[0.68rem]">Settings</span>
        </Link>

        {/* More Menu Drawer Trigger */}
        <button
          type="button"
          onClick={toggle}
          className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-xs font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Menu size={18} />
          </div>
          <span className="text-[0.68rem]">Menu</span>
        </button>
      </div>
    </>
  );
}
