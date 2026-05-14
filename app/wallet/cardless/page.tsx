"use client";

import { type FormEvent, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

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

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isReady = isAmountValid && !isSubmitting && !!user;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await post<CardlessResponse, { amount: number; currency: string }>(
        "/api/wallet/cardless",
        {
          amount: amountValue,
          currency,
        }
      );
      setResult(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col gap-5 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Cardless paycode</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">Generate a temporary paycode.</p>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--ink-muted)">Sign in to generate a paycode.</p>
        )}
      </header>

      <form
        className="panel p-5"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="amount">
            Amount
            <input
              id="amount"
              className="input-field"
              inputMode="decimal"
              min="1"
              onChange={(event) => setAmount(event.target.value)}
              placeholder="15000"
              type="number"
              value={amount}
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="currency">
            Currency
            <select
              id="currency"
              className="select-field"
              onChange={(event) => setCurrency(event.target.value)}
              value={currency}
            >
              <option value="NGN">NGN</option>
            </select>
          </label>
        </div>

        <button
          className="btn-primary mt-6 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isReady}
          type="submit"
        >
          {isSubmitting ? "Generating..." : "Generate paycode"}
        </button>
      </form>

      {result && (
        <section className="panel p-5 text-sm text-(--ink-muted)">
          <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Paycode</p>
          <p className="mt-2 text-lg font-semibold text-foreground">{result.paycode}</p>
          <p className="mt-2">Expires at: {result.expires_at}</p>
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
