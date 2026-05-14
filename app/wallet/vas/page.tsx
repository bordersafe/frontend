"use client";

import { type FormEvent, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type VasResponse = {
  action_id: string;
  action_type: string;
  status: string;
  reference: string;
  created_at: string | null;
};

const PROVIDERS = ["MTN", "Airtel", "Glo", "9mobile"];

export default function VasPage() {
  const { user, isAuthLoading, post } = useAuthedApi();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [provider, setProvider] = useState(PROVIDERS[0] ?? "MTN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<VasResponse | null>(null);
  const [error, setError] = useState<UiError | null>(null);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isReady = isAmountValid && !!provider && !isSubmitting && !!user;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await post<VasResponse, { amount: number; currency: string; provider: string }>(
        "/api/wallet/vas",
        {
          amount: amountValue,
          currency,
          provider,
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
        <h1 className="heading-1">Airtime and VAS</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">Trigger a value-added service purchase.</p>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--ink-muted)">Sign in to purchase VAS.</p>
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
              placeholder="5000"
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

        <label className="mt-4 flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="provider">
          Provider
          <select
            id="provider"
            className="select-field"
            onChange={(event) => setProvider(event.target.value)}
            value={provider}
          >
            {PROVIDERS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <button
          className="btn-primary mt-6 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!isReady}
          type="submit"
        >
          {isSubmitting ? "Processing..." : "Buy VAS"}
        </button>
      </form>

      {result && (
        <section className="panel p-5 text-sm text-(--ink-muted)">
          <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Result</p>
          <p className="mt-2 font-semibold text-foreground">{result.status}</p>
          <p className="mt-2">Reference: {result.reference}</p>
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
