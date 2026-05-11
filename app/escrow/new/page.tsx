"use client";

import { type FormEvent, useState } from "react";

import { apiClient, normalizeApiError } from "@/lib/api";
import type { UiError } from "@/lib/api";

type InitiateResponse = {
  transaction_ref: string;
  checkout_url: string;
  status: string;
};

type InitiateRequestBody = {
  amount: number;
  email: string;
  currency: string;
};

const CURRENCY_OPTIONS = ["NGN", "GHS", "KES", "USD", "ZAR"];

export default function NewEscrowPage() {
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [result, setResult] = useState<InitiateResponse | null>(null);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isEmailValid = email.trim().length > 3 && email.includes("@");
  const isReady = isAmountValid && isEmailValid && !isSubmitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post<InitiateResponse, InitiateRequestBody>(
        "/api/squad/initiate",
        {
          amount: amountValue,
          email: email.trim(),
          currency,
        },
      );
      setResult(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    setEmail("");
    setCurrency("NGN");
    setResult(null);
    setError(null);
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Escrow setup</p>
        <h1 className="text-2xl font-semibold text-foreground">Create Escrow</h1>
        <p className="text-sm text-(--ink-muted)">
          Start a buyer checkout. Funds lock after Squad confirms payment.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur"
          onSubmit={handleSubmit}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="amount">
              Amount
              <input
                id="amount"
                className="rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm text-foreground outline-none"
                inputMode="decimal"
                min="1"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="150000"
                type="number"
                value={amount}
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="currency">
              Currency
              <select
                id="currency"
                className="rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm text-foreground outline-none"
                onChange={(event) => setCurrency(event.target.value)}
                value={currency}
              >
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="email">
            Buyer email
            <input
              id="email"
              className="rounded-2xl border border-(--border-soft) bg-(--surface-alt) px-4 py-3 text-sm text-foreground outline-none"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="buyer@example.com"
              type="email"
              value={email}
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-2xl bg-(--action) px-5 py-3 text-sm font-semibold text-(--action-ink) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isReady}
              type="submit"
            >
              {isSubmitting ? "Starting checkout..." : "Create checkout"}
            </button>
            <button
              className="rounded-2xl border border-(--border-soft) bg-white/80 px-5 py-3 text-sm font-semibold text-(--ink-muted)"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 text-xs text-(--ink-soft)">
            Buyer receives the Squad payment link and funds are held in escrow once paid.
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-(--border-soft) bg-white/70 p-4 text-sm text-(--ink-muted)">
              <p className="font-semibold text-foreground">{error.title}</p>
              <p className="mt-1 text-sm text-(--ink-muted)">{error.message}</p>
              {error.correlationId && (
                <p className="mt-2 text-xs text-(--ink-soft)">
                  Correlation ID: {error.correlationId}
                </p>
              )}
            </div>
          )}
        </form>

        <aside className="flex flex-col gap-4">
          <section className="rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-(--card-shadow) backdrop-blur">
            <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
            <ul className="mt-3 space-y-3 text-sm text-(--ink-muted)">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                <span>Buyer completes Squad checkout.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                <span>Webhook locks funds and updates escrow state.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                <span>Seller uploads waybill once funds are secured.</span>
              </li>
            </ul>
          </section>

          <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-(--card-shadow) backdrop-blur">
            <h2 className="text-sm font-semibold text-foreground">Checkout details</h2>
            {result ? (
              <div className="mt-4 space-y-3 text-sm text-(--ink-muted)">
                <div className="rounded-2xl bg-(--surface-alt) px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Transaction ref</p>
                  <p className="mt-2 font-semibold text-foreground">{result.transaction_ref}</p>
                </div>
                <div className="rounded-2xl bg-(--surface-alt) px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Status</p>
                  <p className="mt-2 font-semibold text-foreground">{result.status}</p>
                </div>
                <a
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-(--action) px-4 py-3 text-sm font-semibold text-(--action-ink)"
                  href={result.checkout_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Squad checkout
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-(--ink-muted)">
                Submit the form to generate a checkout link and transaction reference.
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
