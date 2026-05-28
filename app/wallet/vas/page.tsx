"use client";

import { type FormEvent, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import { formatCurrency } from "@/lib/format";
import type { UiError } from "@/lib/api";

type VasResponse = {
  action_id: string;
  action_type: string;
  status: string;
  reference: string;
  created_at: string | null;
};

const PROVIDERS = [
  { value: "MTN", label: "MTN", emoji: "🟡" },
  { value: "Airtel", label: "Airtel", emoji: "🔴" },
  { value: "Glo", label: "Glo", emoji: "🟢" },
  { value: "9mobile", label: "9mobile", emoji: "🟢" },
];

const VAS_TYPES = [
  { value: "airtime", label: "Airtime" },
  { value: "data", label: "Data" },
];

export default function VasPage() {
  const { user, isAuthLoading, post } = useAuthedApi();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [provider, setProvider] = useState(PROVIDERS[0]?.value ?? "MTN");
  const [vasType, setVasType] = useState("airtime");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VasResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isReady = isAmountValid && !!provider && !isSubmitting && !!user;

  const formattedAmount = isAmountValid ? formatCurrency(amountValue, currency) : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await post<VasResponse, { amount: number; currency: string; provider: string }>(
        "/api/wallet/vas",
        { amount: amountValue, currency, provider }
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
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-(--action)/10 text-2xl flex-shrink-0">
          📱
        </div>
        <div>
          <h1 className="heading-2">Airtime &amp; VAS</h1>
          <p className="mt-1 text-sm text-(--ink-muted)">
            Purchase airtime or data for any Nigerian network operator, charged from your BorderSafe wallet.
          </p>
        </div>
      </header>

      {!isAuthLoading && !user && (
        <section className="panel-danger p-5 rounded-2xl text-sm reveal-up">
          Sign in to purchase VAS from your wallet.
        </section>
      )}

      {user && (
        <form className="panel p-6 reveal-up delay-80" onSubmit={handleSubmit}>

          {/* VAS type toggle */}
          <div>
            <div className="flex gap-2">
              {VAS_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setVasType(t.value)}
                  className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-semibold transition-all ${
                    vasType === t.value
                      ? "border-(--action) bg-(--action)/5 text-foreground"
                      : "border-(--border-soft) text-(--ink-muted) hover:border-(--border-medium)"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provider cards */}
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setProvider(p.value)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-sm font-semibold transition-all ${
                    provider === p.value
                      ? "border-(--action) bg-(--action)/5 shadow-sm"
                      : "border-(--border-soft) hover:border-(--border-medium)"
                  }`}
                >
                  <span className="text-xl">{p.emoji}</span>
                  <span className="text-xs">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount & Currency */}
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className="kicker block mb-2" htmlFor="vas-amount">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-(--ink-soft)">₦</span>
                <input
                  id="vas-amount"
                  className="input-field w-full pl-7"
                  inputMode="decimal"
                  min="1"
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="1,000"
                  type="number"
                  value={amount}
                />
              </div>
              {formattedAmount && (
                <p className="mt-1 text-xs text-(--success) font-medium">{formattedAmount}</p>
              )}
            </div>

            <div>
              <label className="kicker block mb-2" htmlFor="vas-currency">Currency</label>
              {/* Only NGN is supported in this region */}
              <div className="input-field flex cursor-default items-center justify-between bg-white/40">
                <span className="text-sm font-medium text-foreground">NGN — Nigerian Naira</span>
                <span className="chip text-xs">Only currency</span>
              </div>
            </div>
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
                Processing…
              </span>
            ) : `Buy ${vasType} for ${PROVIDERS.find(p => p.value === provider)?.label ?? provider}`}
          </button>
        </form>
      )}

      {result && (
        <section className="panel p-6 reveal-up" role="status">
          <p className="text-sm font-semibold text-(--success)">✓ VAS purchase initiated</p>
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
              Make another purchase
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
