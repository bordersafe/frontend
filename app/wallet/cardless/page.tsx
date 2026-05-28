"use client";

import { type FormEvent, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

import { formatCurrency, formatDate } from "@/lib/format";

type CardlessResponse = {
  action_id: string;
  action_type: string;
  status: string;
  reference: string;
  paycode: string;
  expires_at: string;
  created_at: string | null;
};

export default function CardlessPage() {
  const { user, isAuthLoading, post } = useAuthedApi();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CardlessResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);
  const [copied, setCopied] = useState(false);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isReady = isAmountValid && !isSubmitting && !!user;

  const formattedAmount = isAmountValid ? formatCurrency(amountValue, currency) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;
    setIsSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const response = await post<CardlessResponse, { amount: number; currency: string }>(
        "/api/wallet/cardless",
        { amount: amountValue, currency }
      );
      setResult(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPaycode = async () => {
    if (!result?.paycode) return;
    await navigator.clipboard.writeText(result.paycode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6 reveal-up flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--action)/10 text-2xl flex-shrink-0">
          🏧
        </div>
        <div>
          <h1 className="heading-2">Cardless paycode</h1>
          <p className="mt-1 text-sm text-(--ink-muted)">
            Generate a temporary paycode to withdraw cash at partner ATMs and agents without a card.
          </p>
        </div>
      </header>

      {!isAuthLoading && !user && (
        <section className="panel-danger p-5 rounded-2xl text-sm reveal-up">
          Sign in to generate a cardless paycode.
        </section>
      )}

      {user && !result && (
        <form className="panel p-6 reveal-up delay-80" onSubmit={handleSubmit}>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="kicker block mb-2" htmlFor="cardless-amount">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-(--ink-soft)">₦</span>
                <input
                  id="cardless-amount"
                  className="input-field w-full pl-7"
                  inputMode="decimal"
                  min="1"
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="15,000"
                  type="number"
                  value={amount}
                />
              </div>
              {formattedAmount && (
                <p className="mt-1 text-xs text-(--success) font-medium">{formattedAmount}</p>
              )}
            </div>

            <div>
              <label className="kicker block mb-2" htmlFor="cardless-currency">Currency</label>
              {/* Only NGN is supported in this region */}
              <div className="input-field flex cursor-default items-center justify-between bg-white/40">
                <span className="text-sm font-medium text-foreground">NGN — Nigerian Naira</span>
                <span className="chip text-xs">Only currency</span>
              </div>
            </div>
          </div>

          <div className="mt-5 panel-muted rounded-2xl px-4 py-3 text-sm text-(--ink-muted) flex items-start gap-3">
            <span className="text-base flex-shrink-0 mt-0.5">ℹ️</span>
            <p className="text-xs">The paycode is single-use and expires after a limited time. Do not share it with anyone you don't trust.</p>
          </div>

          <button
            className="btn-primary mt-5 w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!isReady}
            type="submit"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-3.5 w-3.5 spin-slow" fill="none" viewBox="0 0 24 24">
                  <path d="M4 12a8 8 0 018-8v2a6 6 0 100 12v2a8 8 0 01-8-8Z" fill="currentColor" />
                </svg>
                Generating…
              </span>
            ) : "Generate paycode"}
          </button>
        </form>
      )}

      {result && (
        <section className="panel p-6 border-l-4 border-(--action) reveal-up">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">🎟️</span>
            <div>
              <p className="text-sm text-(--ink-muted)">Use this code at any partner ATM or agent.</p>
            </div>
          </div>

          <div className="panel-muted rounded-2xl px-6 py-5 text-center mb-4">
            <p className="text-4xl font-black tracking-[0.15em] text-foreground font-mono">{result.paycode}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mb-5">
            <div className="panel-muted rounded-2xl px-4 py-3">
              <p className="kicker mb-1">Expires at</p>
              <p className="mt-1 font-semibold text-foreground">{formatDate(result.expires_at)}</p>
            </div>
            <div className="panel-muted rounded-2xl px-4 py-3">
              <p className="kicker mb-1">Transaction reference</p>
              <p className="mt-1 font-mono text-sm font-bold text-foreground truncate">{result.reference}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button className="btn-primary flex-1 px-4 py-2.5 text-sm" onClick={() => void handleCopyPaycode()} type="button">
              {copied ? "Copied!" : "Copy paycode"}
            </button>
            <button
              className="btn-secondary px-4 py-2.5 text-sm"
              type="button"
              onClick={() => { setResult(null); setAmount(""); }}
            >
              Generate another
            </button>
            <a href="/wallet" className="btn-outline px-4 py-2.5 text-sm">
              Back to wallet
            </a>
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
