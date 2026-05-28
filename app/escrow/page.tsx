"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { getEscrowStatusMeta } from "@/lib/status-labels";

type EscrowItem = {
  id: string;
  transaction_ref: string;
  amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  description: string | null;
  archived_at?: string | null;
  disabled?: boolean;
  created_at: string | null;
  updated_at: string | null;
};

type EscrowListResponse = {
  count: number;
  items: EscrowItem[];
};

const STATUS_OPTIONS = [
  { label: "All statuses", value: "ALL" },
  { label: "Awaiting Payment", value: "AWAITING_PAYMENT" },
  { label: "Funds Locked", value: "FUNDS_LOCKED" },
  { label: "Awaiting Confirmation", value: "DELIVERED_AWAITING_BUYER_CONFIRMATION" },
  { label: "Under Review", value: "AWAITING_ADMIN_FINALIZATION" },
  { label: "Paid Out", value: "DISBURSED" },
  { label: "Refunded", value: "REFUNDED" },
];

/** Skeleton card while list is loading */
function EscrowListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="panel p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="skeleton h-4 w-40 rounded" />
              <div className="skeleton h-3 w-24 rounded" />
            </div>
            <div className="skeleton h-6 w-20 rounded-full" />
          </div>
          <div className="skeleton mt-4 h-3 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

export default function EscrowListPage() {
  const { user, isAuthLoading, get } = useAuthedApi();
  const [status, setStatus] = useState("ALL");
  const query = status === "ALL" ? "" : `?status=${encodeURIComponent(status)}`;
  const {
    data,
    error: fetchError,
    isLoading,
    mutate,
  } = useSWR<EscrowListResponse>(
    !isAuthLoading && user ? ["escrow-list", user.uid, status] : null,
    async () => get<EscrowListResponse>(`/api/escrow${query}`),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );

  const items = data?.items ?? [];
  const error = fetchError ? normalizeApiError(fetchError) : null;
  const isArchivedOrDisabled = (item: EscrowItem) =>
    !!item.archived_at || !!item.disabled;

  return (
    <main className="flex min-h-full flex-col gap-6">
      {/* ── Header ─────────────────────────────── */}
      <header className="panel p-6 reveal-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="heading-1">Escrow list</h1>
            <p className="text-sm text-(--ink-muted)">
              Track every escrow you have created or have access to.
            </p>
            {!isAuthLoading && !user && (
              <p className="text-sm text-(--warning)">
                Sign in to view your escrows.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link
              className="btn-primary inline-flex items-center justify-center px-4 py-2 text-xs"
              href="/escrow/new"
            >
              + New escrow
            </Link>
            <button
              className="btn-secondary px-4 py-2 text-xs"
              onClick={() => void mutate()}
              type="button"
              disabled={isLoading}
            >
              {isLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Filter bar ─────────────────────────── */}
      <section className="panel p-5 reveal-up delay-80">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">Filter by status</p>
            <p className="mt-1 text-xs text-(--ink-soft)">Select which queue to monitor.</p>
          </div>
          <select
            className="select-field w-auto min-w-[200px]"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ── List ───────────────────────────────── */}
      {isLoading ? (
        <EscrowListSkeleton />
      ) : items.length === 0 ? (
        <section className="panel p-10 reveal-up delay-160">
          {user ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-4xl">📋</div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No escrows found
                </p>
                <p className="mt-1 text-sm text-(--ink-muted)">
                  {status === "ALL"
                    ? "You haven't created any escrows yet."
                    : `No escrows with status "${STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}".`}
                </p>
              </div>
              {status === "ALL" && (
                <Link
                  className="btn-primary px-5 py-2.5 text-sm"
                  href="/escrow/new"
                >
                  Create your first escrow
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="text-4xl">🔒</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Sign in required</p>
                <p className="mt-1 text-sm text-(--ink-muted)">
                  Sign in to view and manage your escrows.
                </p>
              </div>
              <Link className="btn-primary px-5 py-2.5 text-sm" href="/auth/login">
                Sign in
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section className="grid gap-4 reveal-up delay-160">
          {items.map((item) => {
            const statusMeta = getEscrowStatusMeta(item.status);
            const archived = isArchivedOrDisabled(item);
            return (
              <Link
                key={item.id}
                className="panel lift-hover p-5"
                href={`/escrow/${item.id}`}
                aria-disabled={archived}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      {item.transaction_ref}
                    </h2>
                    <p className="mt-1 text-sm text-(--ink-muted)">
                      {formatCurrency(item.amount, item.currency)} · {item.buyer_email}
                    </p>
                    {item.description && (
                      <p className="mt-1 text-xs text-(--ink-soft)">{item.description}</p>
                    )}
                    {archived && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="chip bg-(--ink-soft)/10 text-(--ink-soft)">
                          Archived / Disabled
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className={statusMeta.chipClass}>{statusMeta.label}</span>
                    {item.updated_at && (
                      <p className="mt-2 text-xs text-(--ink-soft)">
                        Updated {formatRelativeTime(item.updated_at)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-white/60 pt-4 text-xs text-(--ink-muted)">
                  <span>
                    {archived
                      ? "Actions disabled for archived records"
                      : "Open to manage escrow"}
                  </span>
                  <span className={archived ? "opacity-60" : "font-semibold text-(--primary)"}>
                    {archived ? "Archived" : "View details →"}
                  </span>
                </div>
              </Link>
            );
          })}
        </section>
      )}

      {error && (
        <section className="panel-danger p-5 text-sm reveal-up" role="alert">
          <p className="font-semibold text-(--danger)">{error.title}</p>
          <p className="mt-1 text-(--ink-muted)">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft) font-mono">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
