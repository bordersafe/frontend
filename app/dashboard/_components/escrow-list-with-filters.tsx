/**
 * Escrow list with filtering, sorting, and CSV export.
 */
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuthedApi } from "@/lib/api/auth-client";
import { EscrowDetail } from "@/lib/api/types";
import useSWR from "swr";

interface EscrowListResponse {
  count: number;
  items: EscrowDetail[];
}

const STATUS_COLORS = {
  AWAITING_PAYMENT: "bg-(--warning)/10 text-(--warning)",
  FUNDS_LOCKED: "bg-(--info)/10 text-(--info)",
  DELIVERED_AWAITING_BUYER_CONFIRMATION: "bg-(--warning)/10 text-(--warning)",
  AWAITING_ADMIN_FINALIZATION: "bg-(--primary)/10 text-(--primary)",
  DISPUTE_ADJUDICATION: "bg-(--warning)/10 text-(--warning)",
  DISBURSED: "bg-(--success)/10 text-(--success)",
  REFUNDED: "bg-(--warning)/10 text-(--warning)",
};

export function EscrowListWithFilters() {
  const { get } = useAuthedApi();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "amount-high" | "amount-low">("newest");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: response, isLoading, isValidating } = useSWR<EscrowListResponse>(
    ["escrow-list", selectedStatus],
    async () => {
      const params = new URLSearchParams();
      if (selectedStatus) params.append("status", selectedStatus);
      params.append("limit", "100");
      return get<EscrowListResponse>(`/api/escrow?${params.toString()}`);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  const filteredAndSorted = useMemo(() => {
    let items = response?.items || [];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(
        (item) =>
          item.transaction_ref.toLowerCase().includes(query) ||
          item.buyer_email.toLowerCase().includes(query) ||
          item.id.toLowerCase().includes(query),
      );
    }

    // Sort
    const sorted = [...items];
    if (sortBy === "newest") {
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });
    } else if (sortBy === "oldest") {
      sorted.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateA - dateB;
      });
    } else if (sortBy === "amount-high") {
      sorted.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount-low") {
      sorted.sort((a, b) => a.amount - b.amount);
    }

    return sorted;
  }, [response?.items, searchQuery, sortBy]);

  const exportToCSV = () => {
    const headers = [
      "Escrow ID",
      "Transaction Ref",
      "Buyer Email",
      "Amount",
      "Status",
      "Created",
    ];
    const rows = filteredAndSorted.map((item) => [
      item.id,
      item.transaction_ref,
      item.buyer_email,
      item.amount,
      item.status,
      item.created_at ? new Date(item.created_at).toLocaleDateString() : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `escrows-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const isArchivedOrDisabled = (item: EscrowDetail) => !!item.archived_at || !!item.disabled;

  const statusOptions = [
    { value: null, label: "All Statuses" },
    { value: "AWAITING_PAYMENT", label: "Awaiting Payment" },
    { value: "FUNDS_LOCKED", label: "Funds Locked" },
    { value: "DELIVERED_AWAITING_BUYER_CONFIRMATION", label: "Pending Delivery" },
    { value: "AWAITING_ADMIN_FINALIZATION", label: "Admin Review" },
    { value: "DISBURSED", label: "Disbursed" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  if (isLoading) {
    return (
      <div className="panel p-6">
        <p className="text-sm text-(--ink-muted)">Loading escrows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="panel p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-xs font-semibold text-(--ink-muted) mb-2">
              Status
            </label>
            <select
              value={selectedStatus || ""}
              onChange={(e) => setSelectedStatus(e.target.value || null)}
              aria-label="Filter escrow status"
              className="w-full px-3 py-2 rounded-lg border border-white/70 bg-white/90 text-sm text-foreground"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value || "all"} value={opt.value || ""}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-xs font-semibold text-(--ink-muted) mb-2">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              aria-label="Sort escrows"
              className="w-full px-3 py-2 rounded-lg border border-white/70 bg-white/90 text-sm text-foreground"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-high">Highest Amount</option>
              <option value="amount-low">Lowest Amount</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-xs font-semibold text-(--ink-muted) mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Ref, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-white/70 bg-white/90 text-sm text-foreground"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <button
            onClick={exportToCSV}
            className="btn-secondary px-3 py-2 text-xs"
            disabled={filteredAndSorted.length === 0}
          >
            📥 Export CSV
          </button>
          {isValidating && <span className="self-center text-xs text-(--ink-soft)">Refreshing updates</span>}
        </div>
      </div>

      {/* List */}
      <div className="panel p-6">
        <p className="text-sm text-(--ink-muted) mb-4">
          Showing {filteredAndSorted.length} of {response?.count || 0} escrows
        </p>

        {filteredAndSorted.length === 0 ? (
          <p className="text-sm text-(--ink-muted) text-center py-8">
            No escrows match your filters.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/70 text-(--ink-muted)">
                  <th className="px-3 py-2 text-left font-semibold">Ref</th>
                  <th className="px-3 py-2 text-left font-semibold">Buyer</th>
                  <th className="px-3 py-2 text-right font-semibold">Amount</th>
                  <th className="px-3 py-2 text-center font-semibold">Status</th>
                  <th className="px-3 py-2 text-left font-semibold">Created</th>
                  <th className="px-3 py-2 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.map((item) => {
                  const color =
                    STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] ||
                    "bg-(--ink-soft)/10 text-(--ink-soft)";
                  const createdDate = item.created_at ? new Date(item.created_at) : null;

                  return (
                    <tr key={item.id} className="border-b border-white/70 hover:bg-white/50 transition-colors">
                      <td className="px-3 py-3 font-mono text-xs text-(--ink-muted)">
                        {item.transaction_ref}
                      </td>
                      <td className="px-3 py-3 text-xs">{item.buyer_email}</td>
                      <td className="px-3 py-3 text-right font-semibold">
                        ₦{item.amount.toLocaleString("en-NG")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${color}`}>
                          {item.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION"
                            ? "Pending"
                            : item.status === "AWAITING_ADMIN_FINALIZATION"
                              ? "Review"
                              : item.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-(--ink-muted)">
                        {createdDate?.toLocaleDateString("en-NG")}
                      </td>
                      <td className="px-3 py-3 text-center">
                        {isArchivedOrDisabled(item) ? (
                          <span className="text-xs font-semibold text-(--ink-soft)">Archived</span>
                        ) : (
                          <Link
                            href={`/escrow/${item.id}`}
                            className="text-xs font-semibold text-(--primary) hover:underline"
                          >
                            View
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
