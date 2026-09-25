"use client";

import React from "react";
import { User, Crown, Sparkles } from "lucide-react";
import { RoleOption } from "./RoleOption";

export type AccountRole = "guest" | "subscriber";

export interface RoleSelectorProps {
  selectedRole: AccountRole;
  onChange: (role: AccountRole) => void;
  className?: string;
}

/**
 * RoleSelector — Component managing the Role Selection section with options and tier perks callout
 */
export function RoleSelector({
  selectedRole,
  onChange,
  className = "mb-6",
}: RoleSelectorProps) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-2.5">
        Choose Your Account Type
      </label>

      {/* Grid of Role Option buttons */}
      <div className="grid grid-cols-2 gap-3.5">
        <RoleOption
          id="role-guest-btn"
          value="guest"
          label="Guest"
          badgeText="Free"
          badgeVariant="primary"
          description="1 Active campaign · Quick setup"
          icon={<User size={18} />}
          isSelected={selectedRole === "guest"}
          onSelect={() => onChange("guest")}
        />

        <RoleOption
          id="role-subscriber-btn"
          value="subscriber"
          label="Subscriber"
          badgeText="PRO"
          badgeVariant="warning"
          description="Unlimited campaigns · Pro tools"
          icon={<Crown size={18} />}
          isSelected={selectedRole === "subscriber"}
          onSelect={() => onChange("subscriber")}
        />
      </div>

      {/* Selected Tier Feature Highlight Callout */}
      <div className="mt-3 p-3 rounded-xl bg-[var(--color-bg-subtle)] border border-dashed border-[var(--color-border-strong)] flex items-center gap-2 text-xs text-[var(--color-text-secondary)]">
        <Sparkles size={16} className="text-[var(--color-primary)] shrink-0" />
        {selectedRole === "guest" ? (
          <span>
            <strong>Guest Plan:</strong> Perfect for test driving. Launch 1
            active referral campaign immediately without entering payment
            details.
          </span>
        ) : (
          <span>
            <strong>Subscriber Plan:</strong> Run unlimited concurrent
            campaigns, custom branding, CSV export, and live leaderboard
            syncing.
          </span>
        )}
      </div>
    </div>
  );
}

export default RoleSelector;
