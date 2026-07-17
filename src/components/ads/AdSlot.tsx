"use client";

import { type ReactNode } from "react";

type Placement = "header" | "sidebar" | "between-cards" | "footer";

interface AdSlotProps {
  placement: Placement;
  className?: string;
  children?: ReactNode;
}

const SIZES: Record<Placement, { width: string; height: string; label: string }> = {
  header: { width: "728px", height: "90px", label: "728×90" },
  sidebar: { width: "300px", height: "250px", label: "300×250" },
  "between-cards": { width: "100%", height: "100px", label: "Responsive" },
  footer: { width: "728px", height: "90px", label: "728×90" },
};

export function AdSlot({ placement, className = "" }: AdSlotProps) {
  const isDev = process.env.NODE_ENV === "development";
  const size = SIZES[placement];

  if (!isDev) {
    return (
      <div
        data-ad-placement={placement}
        className={`ad-slot ad-slot-${placement} ${className}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <div
      data-ad-placement={placement}
      className={`relative flex items-center justify-center rounded-lg border-2 border-dashed border-brand-300 dark:border-brand-700 bg-brand-50/50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 text-xs font-medium ${className}`}
      style={{ minHeight: size.height }}
    >
      <div className="text-center space-y-1">
        <p className="opacity-70">Ad Slot</p>
        <p className="font-semibold">{placement}</p>
        <p className="opacity-50">{size.label}</p>
      </div>
    </div>
  );
}
