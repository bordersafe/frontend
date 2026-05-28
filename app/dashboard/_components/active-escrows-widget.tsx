/**
 * Active escrows summary widget.
 * Shows count of locked funds, pending delivery, and awaiting confirmation.
 */
"use client";

import Link from "next/link";
import { useAuthedApi } from "@/lib/api/auth-client";
import useSWR from "swr";

interface SellerSummary {
  active_escrows: {
    locked_funds: number;
    pending_delivery: number;
    awaiting_confirmation: number;
  };
}

export function ActiveEscrowsWidget() {
  const { get } = useAuthedApi();
  const { data: summary, isLoading, isValidating } = useSWR<SellerSummary>(
    "seller-summary",
    async () => get<SellerSummary>("/api/escrow/summary/mine"),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 30000,
    },
  );

  if (isLoading) {
    return (
      <div className="panel p-6 bg-(--surface-alt)">
        <p className="text-sm text-(--ink-muted)">Loading active escrows...</p>
      </div>
    );
  }

  const statuses = [
    {
      label: "Locked Funds",
      count: summary?.active_escrows.locked_funds || 0,
      icon: "🔒",
      color: "text-(--info)",
      link: "?status=FUNDS_LOCKED",
    },
    {
      label: "Pending Delivery",
      count: summary?.active_escrows.pending_delivery || 0,
      icon: "📦",
      color: "text-(--warning)",
      link: "?status=DELIVERED_AWAITING_BUYER_CONFIRMATION",
    },
    {
      label: "Awaiting Admin",
      count: summary?.active_escrows.awaiting_confirmation || 0,
      icon: "⏳",
      color: "text-(--primary)",
      link: "?status=AWAITING_ADMIN_FINALIZATION",
    },
  ];

  return (
    <div className="panel p-6 bg-(--surface-alt)">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-(--ink-soft) mb-4">
        Active Escrows {isValidating ? "· Refreshing" : ""}
      </h2>

      <div className="grid grid-cols-3 gap-3">
        {statuses.map((stat) => (
          <Link
            key={stat.label}
            href={`/escrow${stat.link}`}
            className="rounded-lg border border-white/70 bg-white/90 p-4 hover:bg-white transition-colors"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <p className="text-xs text-(--ink-muted) mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
