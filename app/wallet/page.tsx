"use client";

import Link from "next/link";
import { useState } from "react";
import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import { PayoutScheduleWidget } from "./_components/payout-schedule-widget";
import { PayoutHistoryTable } from "./_components/payout-history-table";
import { BankAccountManager } from "./_components/bank-account-manager";
import { ImmediatePayoutModal } from "./_components/immediate-payout-modal";
import type {
  PayoutScheduleResponse,
  PayoutHistoryResponse,
  BankAccountsListResponse,
} from "@/lib/api/types";

type WalletSummary = {
  wallet_id: string;
  available_balance: number;
  currency: string;
  updated_at: string | null;
};

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  const secs = Math.floor((Date.now() - d.getTime()) / 1000);
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

function WalletSkeleton() {
  return (
    <div className="panel p-6">
      <div className="skeleton h-3 w-24 mb-4" />
      <div className="skeleton h-12 w-56 mb-4" />
      <div className="skeleton h-6 w-32 mb-5 rounded-full" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-12 w-full rounded-2xl" />)}
      </div>
    </div>
  );
}

export default function WalletPage() {
  const { get } = useAuthedApi();
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);

  const { data: wallet, isLoading: walletLoading, isValidating: walletRefreshing } = useSWR<WalletSummary>(
    "wallet",
    async () => get<WalletSummary>("/api/wallet"),
    { revalidateOnFocus: true, revalidateOnReconnect: true }
  );

  const { data: payoutSchedule, isLoading: scheduleLoading, mutate: refreshSchedule } =
    useSWR<PayoutScheduleResponse>(
      "payout-schedule",
      async () => get<PayoutScheduleResponse>("/api/wallet/payout/schedule"),
      { refreshInterval: 60000 }
    );

  const { data: payoutHistory, isLoading: historyLoading, mutate: refreshHistory } =
    useSWR<PayoutHistoryResponse>(
      "payout-history",
      async () => get<PayoutHistoryResponse>("/api/wallet/payout/history"),
      { refreshInterval: 60000 }
    );

  const { data: bankAccounts, isLoading: accountsLoading, mutate: refreshAccounts } =
    useSWR<BankAccountsListResponse>(
      "bank-accounts",
      async () => get<BankAccountsListResponse>("/api/wallet/bank-accounts"),
      { refreshInterval: 60000 }
    );

  const handlePayoutSuccess = async () => {
    await refreshSchedule();
    await refreshHistory();
  };

  const formattedBalance = wallet
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: wallet.currency ?? "NGN",
        maximumFractionDigits: 2,
      }).format(wallet.available_balance ?? 0)
    : null;

  const quickActions: Array<
    | { label: string; icon: string; href: string; variant: string; action?: never }
    | { label: string; icon: string; action: () => void; variant: string; href?: never }
  > = [
    { label: "Send",           icon: "↗",  href: "/wallet/send-money", variant: "btn-secondary" },
    { label: "Cardless",       icon: "💳", href: "/wallet/cardless",   variant: "btn-secondary" },
    { label: "VAS",            icon: "⚡", href: "/wallet/vas",        variant: "btn-secondary" },
    { label: "Request Payout", icon: "₦",  action: () => setIsPayoutModalOpen(true), variant: "btn-primary" },
  ];

  return (
    <main className="flex min-h-full flex-col gap-6">

      {/* ── Balance Hero ────────────────────────────── */}
      {walletLoading ? (
        <WalletSkeleton />
      ) : (
        <section className="panel p-6 border-l-4 border-(--success) relative overflow-hidden reveal-up">
          {/* Glow */}
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-(--success)/10 blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-4xl font-bold text-foreground tracking-tight">
                  {formattedBalance ?? "—"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="chip text-xs">{wallet?.currency ?? "NGN"} · Primary</span>
                  {wallet?.updated_at && (
                    <span className="text-xs text-(--ink-soft)">
                      Updated {formatRelativeTime(wallet.updated_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-(--success) text-white text-2xl flex-shrink-0 float-slow">
                ₦
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {quickActions.map((action) =>
                action.action ? (
                  <button
                    key={action.label}
                    onClick={action.action}
                    type="button"
                    className={`${action.variant} flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm`}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ) : (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`${action.variant} flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm text-center`}
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Payout management ────────────────────────── */}
      <section className="grid gap-5 lg:grid-cols-2 reveal-up delay-80">
        <PayoutScheduleWidget schedule={payoutSchedule ?? null} isLoading={scheduleLoading} />
        <BankAccountManager accounts={bankAccounts ?? null} isLoading={accountsLoading} onRefresh={refreshAccounts} />
      </section>

      {/* ── Payout history ────────────────────────────── */}
      <div className="reveal-up delay-160">
        <PayoutHistoryTable history={payoutHistory ?? null} isLoading={historyLoading} />
      </div>

      {/* ── Recent wallet activity placeholder ─────────── */}
      <section className="panel p-6 reveal-up delay-220">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Recent wallet activity</h2>
          <Link href="/escrow" className="text-xs font-semibold text-(--primary) hover:underline">
            View escrows →
          </Link>
        </div>
        <div className="py-6 flex flex-col items-center gap-3 text-center">
          <div className="text-4xl float-slow">💰</div>
          <p className="text-sm text-(--ink-muted)">
            No recent wallet transactions. Payouts will appear here after disbursement.
          </p>
        </div>
      </section>

      <ImmediatePayoutModal
        isOpen={isPayoutModalOpen}
        availableBalance={wallet?.available_balance ?? 0}
        bankAccounts={bankAccounts ?? null}
        onClose={() => setIsPayoutModalOpen(false)}
        onSuccess={handlePayoutSuccess}
      />
    </main>
  );
}
