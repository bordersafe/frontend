/**
 * Seller earnings and summary widget.
 * Displays total received, pending payout, and next payout date.
 */
"use client";

import { useAuthedApi } from "@/lib/api/auth-client";
import useSWR from "swr";

interface SellerSummary {
  earnings: {
    total_received: number;
    pending_payout: number;
    next_payout_date: string;
  };
  active_escrows: {
    locked_funds: number;
    pending_delivery: number;
    awaiting_confirmation: number;
  };
  recent_activity: Array<{
    id: string;
    transaction_ref: string;
    amount: number;
    status: string;
    created_at: string | null;
  }>;
}

export function EarningsWidget() {
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

  const nextPayoutDate = summary?.earnings?.next_payout_date
    ? new Date(summary.earnings.next_payout_date)
    : null;

  if (isLoading) {
    return (
      <div className="panel p-6 bg-(--surface-alt)">
        <p className="text-sm text-(--ink-muted)">Loading earnings...</p>
      </div>
    );
  }

  return (
    <div className="panel p-6 bg-(--surface-alt) border-l-4 border-(--success)">
      <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-(--ink-soft) mb-4">
        Earnings & Payouts {isValidating ? "· Refreshing" : ""}
      </h2>

      <div className="space-y-4">
        <div>
          <p className="text-xs text-(--ink-muted) mb-1">Total Received</p>
          <p className="text-2xl font-bold text-(--ink-primary)">
            ₦{(summary?.earnings.total_received || 0).toLocaleString("en-NG")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-(--ink-muted) mb-1">Pending Payout</p>
            <p className="text-lg font-semibold text-(--success)">
              ₦{(summary?.earnings.pending_payout || 0).toLocaleString("en-NG")}
            </p>
          </div>
          <div>
            <p className="text-xs text-(--ink-muted) mb-1">Next Payout</p>
            <p className="text-sm font-mono text-(--ink-primary)">
              {nextPayoutDate ? nextPayoutDate.toLocaleDateString("en-NG") : "--"}
            </p>
          </div>
        </div>
      </div>
      {isValidating && <p className="mt-3 text-xs text-(--ink-soft)">Refreshing earnings data...</p>}
    </div>
  );
}
