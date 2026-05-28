"use client";

import { type FormEvent, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type SendMoneyResponse = {
  action_id: string;
  action_type: string;
  status: string;
  reference: string;
  created_at: string | null;
};

export default function SendMoneyPage() {
  const { user, isAuthLoading, post } = useAuthedApi();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [destination, setDestination] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SendMoneyResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isReady = isAmountValid && destination.trim() && !isSubmitting && !!user;

  const formattedAmount =
    isAmountValid
      ? new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(amountValue)
      : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await post<SendMoneyResponse, { amount: number; currency: string; destination: string }>(
        "/api/wallet/send-money",
        { amount: amountValue, currency, destination: destination.trim() }
      );
      setResult(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6 reveal-up flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--success)/15 text-2xl flex-shrink-0">
          💸
        </div>
        <div>
          <h1 className="heading-2">Send money</h1>
          <p className="mt-1 text-sm text-(--ink-muted)">
            Trigger a wallet send action. Funds are debited from your BorderSafe wallet balance.
          </p>
        </div>
      </header>

      {!isAuthLoading && !user && (
        <section className="panel-danger p-5 rounded-2xl text-sm reveal-up">
          Sign in to send money from your wallet.
        </section>
      )}

      {user && (
        <form className="panel p-6 reveal-up delay-80" onSubmit={handleSubmit}>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="kicker block mb-2" htmlFor="amount">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-(--ink-soft)">₦</span>
                <input
                  id="amount"
                  className="input-field w-full pl-7"
                  inputMode="decimal"
                  min="1"
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="25,000"
                  type="number"
                  value={amount}
                />
              </div>
              {formattedAmount && (
                <p className="mt-1 text-xs text-(--success) font-medium">{formattedAmount}</p>
              )}
            </div>

            <div>
              <label className="kicker block mb-2" htmlFor="currency">Currency</label>
              {/* Only NGN is supported in this region */}
              <div className="input-field flex cursor-default items-center justify-between bg-white/40">
                <span className="text-sm font-medium text-foreground">NGN — Nigerian Naira</span>
                <span className="chip text-xs">Only currency</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label className="kicker block mb-2" htmlFor="destination">Destination</label>
            <input
              id="destination"
              className="input-field w-full"
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. beneficiary reference or account number"
              type="text"
              value={destination}
            />
            <p className="mt-1.5 text-xs text-(--ink-soft)">
              Internal reference or test destination. Full beneficiary flows are coming soon.
            </p>
          </div>

          <button
            className="btn-primary mt-6 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isReady}
            type="submit"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-3.5 w-3.5 spin-slow" fill="none" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8Z" fill="currentColor" />
                </svg>
                Sending…
              </span>
            ) : "Send money"}
          </button>
        </form>
      )}

      {result && (
        <section className="panel p-6 reveal-up" role="status">
          <p className="text-sm font-semibold text-(--success)">✓ Transfer initiated</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="panel-muted rounded-2xl px-4 py-3">
              <p className="kicker mb-1">Status</p>
              <p className="mt-1 font-bold text-foreground">{result.status}</p>
            </div>
            <div className="panel-muted rounded-2xl px-4 py-3">
              <p className="kicker mb-1">Transaction reference</p>
              <p className="mt-1 font-mono text-sm font-bold text-foreground truncate">{result.reference}</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href="/wallet" className="btn-primary px-5 py-2.5 text-sm">
              ← Back to wallet
            </a>
            <button
              className="btn-secondary px-5 py-2.5 text-sm"
              type="button"
              onClick={() => setResult(null)}
            >
              Make another transfer
            </button>
          </div>
        </section>
      )}

      {error && (
        <section className="panel-danger p-5 text-sm rounded-2xl reveal-up">
          <p className="font-semibold text-(--danger)">{error.title}</p>
          <p className="mt-1 text-(--ink-muted)">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft) font-mono">ID: {error.correlationId}</p>
          )}
        </section>
      )}
    </main>
  );
}
