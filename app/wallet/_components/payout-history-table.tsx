"use client";

import type { PayoutHistoryResponse } from "@/lib/api/types";

const formatDate = (date: Date) => {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

interface PayoutHistoryTableProps {
  history: PayoutHistoryResponse | null;
  isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-900",
  PROCESSING: "bg-blue-100 text-blue-900",
  COMPLETED: "bg-green-100 text-green-900",
  FAILED: "bg-red-100 text-red-900",
};

export function PayoutHistoryTable({
  history,
  isLoading,
}: PayoutHistoryTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6">
        <div className="h-6 w-32 animate-pulse rounded bg-[var(--border-soft)]"></div>
        <div className="mt-4 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded bg-[var(--border-soft)]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!history || history.count === 0) {
    return (
      <div className="rounded-lg border border-[var(--border-soft)] bg-white p-6">
        <h3 className="text-lg font-semibold text-[var(--ink)]">Payout History</h3>
        <p className="mt-4 text-sm text-[var(--ink-muted)]">No payouts yet</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border-soft)] bg-white overflow-hidden">
      <div className="p-6 border-b border-[var(--border-soft)]">
        <h3 className="text-lg font-semibold text-[var(--ink)]">Payout History</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-[var(--border-soft)] bg-[var(--border-soft)]">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-[var(--ink-muted)]">Amount</th>
              <th className="px-6 py-3 text-left font-medium text-[var(--ink-muted)]">Status</th>
              <th className="px-6 py-3 text-left font-medium text-[var(--ink-muted)]">Fee</th>
              <th className="px-6 py-3 text-left font-medium text-[var(--ink-muted)]">Scheduled</th>
              <th className="px-6 py-3 text-left font-medium text-[var(--ink-muted)]">Processed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-soft)]">
            {history.items.map((payout) => (
              <tr key={payout.id} className="hover:bg-[var(--border-soft)]">
                <td className="px-6 py-4 font-medium text-[var(--ink)]">
                  ₦{payout.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block rounded px-2.5 py-1.5 text-xs font-medium ${STATUS_COLORS[payout.status]}`}>
                    {payout.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">
                  {payout.fee > 0 ? `₦${payout.fee}` : "—"}
                </td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">
                  {formatDate(new Date(payout.scheduled_date))}
                </td>
                <td className="px-6 py-4 text-[var(--ink-muted)]">
                  {payout.processed_date
                    ? formatDate(new Date(payout.processed_date))
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
