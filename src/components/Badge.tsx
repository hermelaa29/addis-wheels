import React from "react";
import { BookingStatus, CarStatus, UserStatus } from "@/types";

interface BadgeProps {
  children?: React.ReactNode;
  status?: BookingStatus | CarStatus | UserStatus | string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({ children, status, variant, size = "sm" }: BadgeProps) {
  let badgeVariant = variant || "neutral";

  if (status) {
    switch (status) {
      case "approved":
      case "confirmed":
      case "completed":
      case "active":
      case "resolved":
        badgeVariant = "success";
        break;
      case "requested":
      case "pending":
      case "in_progress":
      case "under_review":
        badgeVariant = "warning";
        break;
      case "rejected":
      case "declined":
      case "cancelled":
      case "suspended":
      case "open":
      case "disputed":
        badgeVariant = "danger";
        break;
      case "automatic":
      case "manual":
        badgeVariant = "info";
        break;
      default:
        badgeVariant = "neutral";
    }
  }

  const variantStyles = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    danger: "bg-rose-50 text-rose-700 border-rose-200",
    info: "bg-sky-50 text-sky-700 border-sky-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    default: "bg-navy-50 text-navy-800 border-navy-200",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-sm font-semibold",
  };

  const label = children || (status ? formatStatus(status) : "");

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border ${variantStyles[badgeVariant]} ${sizeStyles[size]} capitalize tracking-wide`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}

function formatStatus(val: string): string {
  return val.replace(/_/g, " ");
}
