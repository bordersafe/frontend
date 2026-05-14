"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type EscrowItem = {
  id: string;
  amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type EscrowListResponse = {
  count: number;
  items: EscrowItem[];
};

const STATUS_OPTIONS = [
  { label: "All", value: "ALL" },
  { label: "Awaiting payment", value: "AWAITING_PAYMENT" },
  { label: "Funds locked", value: "FUNDS_LOCKED" },
  { label: "Awaiting buyer confirmation", value: "DELIVERED_AWAITING_BUYER_CONFIRMATION" },
  { label: "Awaiting admin finalization", value: "AWAITING_ADMIN_FINALIZATION" },
  { label: "Disbursed", value: "DISBURSED" },
  { label: "Refunded", value: "REFUNDED" },
];

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

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <h1 className="heading-1">Escrow list</h1>
            <p className="text-sm text-(--ink-muted)">
              Track every escrow you have created or have access to.
            </p>
            {!isAuthLoading && !user && (
              <p className="text-sm text-(--ink-muted)">Sign in to view your escrows.</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link className="btn-primary inline-flex items-center justify-center px-4 py-2 text-xs" href="/escrow/new">
              New escrow
            </Link>
            <button className="btn-secondary px-4 py-2 text-xs" onClick={() => void mutate()} type="button">
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Status filter</p>
            <p className="mt-1 text-xs text-(--ink-soft)">Select which queue to monitor.</p>
          </div>
          <select
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
          <button className="btn-secondary px-4 py-2 text-xs" onClick={() => void mutate()} type="button">
            Refresh
          </button>
        </div>
      </section>

      {items.length === 0 && !isLoading ? (
        <section className="panel p-6 text-sm text-(--ink-muted)">
          {user ? "No escrows yet." : "Sign in to view escrows."}
        </section>
      ) : (
        <section className="grid gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              className="panel lift-hover p-5"
              href={`/escrow/${item.id}`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Escrow ID</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{item.id}</h2>
                  <p className="mt-1 text-sm text-(--ink-muted)">
                    {item.amount} {item.currency} · {item.buyer_email}
                  </p>
                  {item.description && (
                    <p className="mt-1 text-xs text-(--ink-soft)">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Status</p>
                  <div className="mt-2 flex justify-end">
                    <span className="chip">{item.status.replaceAll("_", " ")}</span>
                  </div>
                  {item.updated_at && (
                    <p className="mt-1 text-xs text-(--ink-soft)">Updated {item.updated_at}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </section>
      )}

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft)">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
