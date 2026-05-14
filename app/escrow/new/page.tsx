"use client";

import { type FormEvent, useEffect, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type InitiateResponse = {
  transaction_ref: string;
  funding_method: "VIRTUAL_ACCOUNT";
  virtual_account?: {
    account_number: string;
    account_name: string | null;
    bank_name: string | null;
    expires_at: string | null;
    reference: string | null;
  };
  status: string;
};

type InitiateRequestBody = {
  amount: number;
  email: string;
  currency: string;
  funding_method: "VIRTUAL_ACCOUNT";
  description?: string;
  store_id?: string;
};

type StoreSummary = {
  id: string;
  name: string;
  slug: string;
  status: string;
  role: string;
};

type StoreListResponse = {
  count: number;
  items: StoreSummary[];
};

const CURRENCY_OPTIONS = ["NGN"];

export default function NewEscrowPage() {
  const { user, isAuthLoading, get, post } = useAuthedApi();
  const [amount, setAmount] = useState("");
  const [email, setEmail] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [fundingMethod] = useState<"VIRTUAL_ACCOUNT">("VIRTUAL_ACCOUNT");
  const [description, setDescription] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [isStoresLoading, setIsStoresLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [result, setResult] = useState<InitiateResponse | null>(null);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isEmailValid = email.trim().length > 3 && email.includes("@");
  const isReady = isAmountValid && isEmailValid && !isSubmitting && !!user;

  useEffect(() => {
    if (isAuthLoading || !user) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsStoresLoading(true);
      setError(null);

      try {
        const response = await get<StoreListResponse>("/api/stores/mine");
        if (!cancelled) {
          setStores(response.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(normalizeApiError(err));
        }
      } finally {
        if (!cancelled) {
          setIsStoresLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [get, isAuthLoading, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isReady) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await post<InitiateResponse, InitiateRequestBody>(
        "/api/squad/initiate",
        {
          amount: amountValue,
          email: email.trim(),
          currency,
          funding_method: fundingMethod,
          ...(description.trim() ? { description: description.trim() } : {}),
          ...(storeId ? { store_id: storeId } : {}),
        }
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
    setDescription("");
    setStoreId("");
    setResult(null);
    setError(null);
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Create escrow</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Choose how buyer payment should happen. Funds lock after Squad confirms payment.
        </p>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--ink-muted)">Sign in to create an escrow.</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
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
                placeholder="150000"
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
                {CURRENCY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="store">
              Store (optional)
              <select
                id="store"
                className="select-field"
                onChange={(event) => setStoreId(event.target.value)}
                value={storeId}
                disabled={!user || isStoresLoading}
              >
                <option value="">Personal escrow</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-col gap-2 text-sm text-(--ink-muted)">
              Funding method
              <div className="select-field flex items-center justify-between">
                <span>Virtual account</span>
                <span className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Preferred</span>
              </div>
            </div>
          </div>

          <label className="mt-4 flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="email">
            Buyer email
            <input
              id="email"
              className="input-field"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="buyer@example.com"
              type="email"
              value={email}
            />
          </label>

          <label className="mt-4 flex flex-col gap-2 text-sm text-(--ink-muted)" htmlFor="description">
            Description (optional)
            <textarea
              id="description"
              className="textarea-field min-h-24"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Shipment details or item description"
              value={description}
            />
          </label>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isReady}
              type="submit"
            >
              {isSubmitting ? "Creating virtual account..." : "Create virtual account"}
            </button>
            <button
              className="btn-secondary px-5 py-3 text-sm"
              onClick={handleReset}
              type="button"
            >
              Reset
            </button>
          </div>

          <div className="mt-4 text-xs text-(--ink-soft)">
            Buyer gets a dedicated Squad virtual account and funds are held once transfer is confirmed.
          </div>

          {error && (
            <div className="panel-outline mt-4 p-4 text-sm text-(--ink-muted)">
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
          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
            <ul className="mt-3 space-y-3 text-sm text-(--ink-muted)">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2 w-2 rounded-full bg-(--accent-positive)" />
                <span>Buyer transfers to the generated virtual account.</span>
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

          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Payment details</h2>
            {result ? (
              <div className="mt-4 space-y-3 text-sm text-(--ink-muted)">
                <div className="panel-muted px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Transaction ref</p>
                  <p className="mt-2 font-semibold text-foreground">{result.transaction_ref}</p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Status</p>
                  <p className="mt-2 font-semibold text-foreground">{result.status}</p>
                </div>
                {result.virtual_account ? (
                  <>
                    <div className="panel-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                        Account number
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {result.virtual_account.account_number}
                      </p>
                    </div>
                    <div className="panel-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                        Account name
                      </p>
                      <p className="mt-2 font-semibold text-foreground">
                        {result.virtual_account.account_name ?? "-"}
                      </p>
                    </div>
                    <div className="panel-muted px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">Bank</p>
                      <p className="mt-2 font-semibold text-foreground">
                        {result.virtual_account.bank_name ?? "-"}
                      </p>
                    </div>
                    {result.virtual_account.expires_at && (
                      <div className="panel-muted px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.22em] text-(--ink-soft)">
                          Expires at
                        </p>
                        <p className="mt-2 font-semibold text-foreground">
                          {result.virtual_account.expires_at}
                        </p>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-(--ink-muted)">
                Submit the form to generate payment details and a transaction reference.
              </p>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
