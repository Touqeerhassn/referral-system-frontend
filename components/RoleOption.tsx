"use client";

import React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RoleOptionProps {
  id: string;
  value: string;
  label: string;
  badgeText: string;
  badgeVariant?: "primary" | "warning";
  description: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * RoleOption — Single selectable role button card with active highlight feedback
 */
export function RoleOption({
  id,
  label,
  badgeText,
  badgeVariant = "primary",
  description,
  icon,
  isSelected,
  onSelect,
  className,
}: RoleOptionProps) {
  return (
    <button
      type="button"
      id={id}
      onClick={onSelect}
      className={cn(
        "relative flex flex-col items-start p-4 rounded-2xl cursor-pointer text-left transition-all duration-150",
        isSelected
          ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-soft)] shadow-sm ring-3 ring-[var(--color-primary-glow)]"
          : "border border-[var(--color-border-default)] bg-[var(--color-bg-card)] shadow-xs hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-subtle)]",
        className
      )}
    >
      {/* Top Indicator */}
      <div className="flex w-full justify-between items-center mb-2.5">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150",
            isSelected
              ? "bg-[var(--color-primary)] text-white shadow-xs"
              : "bg-[var(--color-bg-subtle)] text-[var(--color-text-secondary)]"
          )}
        >
          {icon}
        </div>

        {isSelected ? (
          <CheckCircle2
            size={20}
            className="text-[var(--color-primary)] animate-scale-in"
          />
        ) : (
          <Circle
            size={18}
            className="text-[var(--color-border-strong)] opacity-60"
          />
        )}
      </div>

      {/* Title & Badge */}
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={cn(
            "font-bold text-[0.95rem]",
            isSelected
              ? "text-[var(--color-primary-active)]"
              : "text-[var(--color-text-primary)]"
          )}
        >
          {label}
        </span>
        <span
          className={cn(
            "badge text-[0.68rem] px-1.5 py-0.5",
            badgeVariant === "warning" ? "badge-warning" : "badge-primary"
          )}
        >
          {badgeText}
        </span>
      </div>

      {/* Description */}
      <p
        className={cn(
          "text-xs leading-snug m-0",
          isSelected
            ? "text-[var(--color-text-secondary)]"
            : "text-[var(--color-text-muted)]"
        )}
      >
        {description}
      </p>
    </button>
  );
}

export default RoleOption;
