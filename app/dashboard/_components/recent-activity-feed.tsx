/**
 * Recent activity feed showing last 10 transactions.
 */
"use client";

import Link from "next/link";
import { useAuthedApi } from "@/lib/api/auth-client";
import useSWR from "swr";

interface SellerSummary {
  recent_activity: Array<{
    id: string;
    transaction_ref: string;
    amount: number;
    status: string;
    created_at: string | null;
  }>;
}

const STATUS_BADGES = {
  AWAITING_PAYMENT: { label: "Awaiting Payment", color: "text-(--warning)" },
  FUNDS_LOCKED: { label: "Funds Locked", color: "text-(--info)" },
  DELIVERED_AWAITING_BUYER_CONFIRMATION: {
    label: "Pending Delivery",
    color: "text-(--warning)",
  },
  AWAITING_ADMIN_FINALIZATION: { label: "Admin Review", color: "text-(--primary)" },
  DISBURSED: { label: "Disbursed", color: "text-(--success)" },
  REFUNDED: { label: "Refunded", color: "text-(--warning)" },
};

export function RecentActivityFeed() {
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

  const activity = summary?.recent_activity || [];

  if (isLoading) {
    return (
      <div className="panel p-6 bg-(--surface-alt)">
        <p className="text-sm text-(--ink-muted)">Loading recent activity...</p>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="panel p-6 bg-(--surface-alt)">
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-(--ink-soft) mb-4">
          Recent Activity
        </h2>
        <p className="text-sm text-(--ink-muted)">No escrows yet. Create your first escrow to get started!</p>
        {isValidating && <p className="mt-3 text-xs text-(--ink-soft)">Refreshing activity...</p>}
      </div>
    );
  }

  return (
    <div className="panel p-6 bg-(--surface-alt)">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-(--ink-soft) mb-4">
        Recent Activity (Last 10)
      </h2>

      <div className="space-y-2">
        {activity.map((item) => {
          const badge = STATUS_BADGES[item.status as keyof typeof STATUS_BADGES] || {
            label: item.status,
            color: "text-(--ink-muted)",
          };
          const createdDate = item.created_at ? new Date(item.created_at) : null;
          const timeAgo = createdDate
            ? Math.floor((Date.now() - createdDate.getTime()) / 1000)
            : 0;
          const timeLabel =
            timeAgo < 60
              ? `${timeAgo}s ago`
              : timeAgo < 3600
                ? `${Math.floor(timeAgo / 60)}m ago`
                : `${Math.floor(timeAgo / 3600)}h ago`;

          return (
            <Link
              key={item.id}
              href={`/escrow/${item.id}`}
              className="flex items-center justify-between rounded-lg border border-white/70 bg-white/90 p-3 hover:bg-white transition-colors"
            >
              <div className="flex-1">
                <p className="text-xs font-mono text-(--ink-muted)">{item.transaction_ref}</p>
                <p className="text-sm font-semibold text-(--ink-primary) mt-1">
                  ₦{item.amount.toLocaleString("en-NG")}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-xs font-semibold ${badge.color}`}>{badge.label}</p>
                <p className="text-xs text-(--ink-soft) mt-1">{timeLabel}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <Link
        href="/escrow"
        className="mt-4 inline-block text-xs font-semibold text-(--primary) hover:underline"
      >
        View all escrows →
      </Link>
      {isValidating && <p className="mt-3 text-xs text-(--ink-soft)">Refreshing activity...</p>}
    </div>
  );
}
