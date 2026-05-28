"use client";

import type { PayoutScheduleResponse } from "@/lib/api/types";

const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface PayoutScheduleWidgetProps {
  schedule: PayoutScheduleResponse | null;
  isLoading: boolean;
}

export function PayoutScheduleWidget({
  schedule,
  isLoading,
}: PayoutScheduleWidgetProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--border-soft)]"></div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-[var(--border-soft)]"></div>
          <div className="h-4 w-40 animate-pulse rounded bg-[var(--border-soft)]"></div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6">
        <p className="text-sm text-[var(--ink-muted)]">No payout schedule available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6">
      <h3 className="text-lg font-semibold text-[var(--ink)]">Next Payout</h3>
      
      <div className="mt-4 space-y-3">
        <div>
          <p className="text-xs text-[var(--ink-muted)]">Scheduled Date</p>
          <p className="text-2xl font-bold text-[var(--action)]">
            {formatDate(new Date(schedule.next_payout_date))}
          </p>
        </div>

        <div>
          <p className="text-xs text-[var(--ink-muted)]">Frequency</p>
          <p className="text-sm font-medium text-[var(--ink)]">
            {schedule.payout_frequency}
          </p>
        </div>

        <div className="rounded-lg bg-[var(--border-soft)] p-3">
          <p className="text-xs text-[var(--ink-muted)]">Total Pending</p>
          <p className="mt-1 text-xl font-semibold text-[var(--action)]">
            ₦{schedule.total_pending.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
