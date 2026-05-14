"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type WalletSummary = {
  wallet_id: string;
  available_balance: number;
  currency: string;
  updated_at: string | null;
};

export default function WalletPage() {
  const { user, isAuthLoading, get } = useAuthedApi();
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);

  const fetchWallet = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<WalletSummary>("/api/wallet");
      setWallet(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && user) {
      void fetchWallet();
    }
  }, [isAuthLoading, user]);

  const formattedBalance = wallet
    ? new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: wallet.currency ?? "NGN",
        maximumFractionDigits: 2,
      }).format(wallet.available_balance ?? 0)
    : "--";
  const quickActions = [
    { label: "Send", href: "/wallet/send-money" },
    { label: "Cardless", href: "/wallet/cardless" },
    { label: "VAS", href: "/wallet/vas" },
  ];

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="subheading">
              {user ? "Wallet overview" : "Sign in to access your wallet"}
            </p>
            <div className="mt-3 text-xs text-(--ink-soft)">
              <p>{wallet?.currency ?? "NGN"} · Primary balance</p>
            </div>
            <h1 className="heading-1">
              {isLoading ? "Loading..." : formattedBalance}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn-secondary h-10 w-10 text-xs" type="button">
              ...
            </button>
            <button className="btn-secondary h-10 w-10 text-xs" type="button">
              o
            </button>
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-(--accent-positive)/20 px-3 py-1 text-xs font-semibold text-(--accent-positive-ink)">
          {wallet?.updated_at ? `Updated ${wallet.updated_at}` : "Balance snapshot"}
        </div>

        <div className="panel-strong mt-5 p-2">
          <div className="grid grid-cols-3 gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                className="btn-ghost px-3 py-3 text-center text-xs"
                href={action.href}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-3">Send again</h2>
            <span className="text-xs text-(--ink-soft)">Recent contacts</span>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-3">
            {["RA", "LO", "BI", "+"].map((initials) => (
              <div
                key={initials}
                className="panel-muted flex h-12 w-12 items-center justify-center text-xs font-semibold text-(--ink-muted)"
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="heading-3">Incoming transfers</h2>
            <span className="text-xs text-(--ink-soft)">This month</span>
          </div>
          <div className="panel-muted mt-6 h-20" />
          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-(--ink-muted)">$2,432.43</span>
            <span className="rounded-full bg-(--accent-positive)/20 px-2 py-1 text-xs font-semibold text-(--accent-positive-ink)">
              +2.10%
            </span>
          </div>
        </div>
      </section>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="heading-3">Recent ledger</h2>
          <span className="text-xs text-(--ink-soft)">All records</span>
        </div>
        <div className="mt-4 rounded-[22px] border border-white/70 bg-white/80 p-4 text-sm text-(--ink-muted)">
          <p>No recent wallet activity yet.</p>
          <p className="mt-1 text-xs text-(--ink-soft)">Transactions will appear here once transfers and payouts are recorded.</p>
        </div>
      </section>

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
