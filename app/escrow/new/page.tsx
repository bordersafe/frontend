"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError, StoreListResponse, StoreSummary } from "@/lib/api";
import { canAccessVendorWorkspace } from "@/lib/roles";
import { useToast } from "@/lib/toast-context";
import { Modal } from "@/app/_components/modal";
import { formatCurrency, formatDate } from "@/lib/format";

type InitiateResponse = {
  transaction_ref: string;
  funding_method: "VIRTUAL_ACCOUNT";
  checkout_url?: string | null;
  payment_checkout_url?: string | null;
  virtual_account?: {
    account_number: string;
    account_name: string | null;
    bank_name: string | null;
    expires_at: string | null;
    reference: string | null;
    customer_identifier?: string | null;
    account_type?: "dynamic" | "business";
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

const CURRENCY_OPTIONS = ["NGN"];

export default function NewEscrowPage() {
  const router = useRouter();
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const { toast } = useToast();
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
  const canCreateEscrow = canAccessVendorWorkspace(profile?.roles);

  const amountValue = Number.parseFloat(amount);
  const isAmountValid = Number.isFinite(amountValue) && amountValue > 0;
  const isEmailValid = email.trim().length > 3 && email.includes("@");
  const isReady =
    isAmountValid && isEmailValid && !isSubmitting && !!user && canCreateEscrow;

  useEffect(() => {
    if (isAuthLoading || !user) return;
    let cancelled = false;
    const run = async () => {
      setIsStoresLoading(true);
      setError(null);
      try {
        const response = await get<StoreListResponse>("/api/stores/mine");
        if (!cancelled) setStores(response.items ?? []);
      } catch (err) {
        if (!cancelled) setError(normalizeApiError(err));
      } finally {
        if (!cancelled) setIsStoresLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [get, isAuthLoading, user]);

  useEffect(() => {
    if (isAuthLoading || !profile) return;
    if (canCreateEscrow) return;
    if (profile.roles.includes("customer")) {
      router.replace("/buyer");
      return;
    }
    router.replace("/dashboard");
  }, [canCreateEscrow, isAuthLoading, profile, router]);

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
        },
      );
      setResult(response);
      setShowPaymentModal(true);
      toast({ message: "Escrow created! Share the payment link with your buyer.", variant: "success" });
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
    setShowPaymentModal(false);
    setCopyFeedback(null);
    setError(null);
  };

  const paymentLink =
    result?.payment_checkout_url ?? result?.checkout_url ?? null;

  const handleCopyPaymentLink = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopyFeedback("Copied!");
    window.setTimeout(() => setCopyFeedback(null), 2000);
  };

  /** After the modal closes, redirect to the new escrow so the stale form disappears */
  const handleModalClose = () => {
    setShowPaymentModal(false);
    if (result?.transaction_ref) {
      // Redirect to the escrow detail page — the form won't be stale there
      router.push(`/escrow`);
    }
  };

  return (
    <main className="flex min-h-full flex-col gap-6">
      <header className="panel p-6 reveal-up">
        <h1 className="heading-1">Create escrow</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Choose how buyer payment should happen. Funds lock after Squad confirms payment.
        </p>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--warning)">Sign in to create an escrow.</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <form className="panel p-5 reveal-up delay-80" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="kicker block mb-2" htmlFor="amount">
                Amount
              </label>
              <input
                id="amount"
                className="input-field"
                inputMode="decimal"
                min="1"
                onChange={(event) => setAmount(event.target.value)}
                placeholder="150,000"
                type="number"
                value={amount}
              />
              <p className="mt-1 text-xs text-(--ink-soft)">Minimum: ₦1</p>
            </div>

            <div>
              <label className="kicker block mb-2" htmlFor="currency">
                Currency
              </label>
              {/* Only NGN is supported — shown as read-only */}
              <div className="input-field flex items-center justify-between text-sm text-(--ink-muted)">
                <span className="font-medium text-foreground">NGN — Nigerian Naira</span>
                <span className="chip text-xs">Only option</span>
              </div>
            </div>

            <div>
              <label className="kicker block mb-2" htmlFor="store">
                Store <span className="font-normal normal-case text-(--ink-soft)">(optional)</span>
              </label>
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
            </div>

            <div>
              <p className="kicker mb-2">Funding method</p>
              <div className="input-field flex cursor-default items-center justify-between bg-white/40">
                <span className="text-sm text-foreground">Virtual account</span>
                <span className="chip text-xs">Preferred</span>
              </div>
              <p className="mt-1 text-xs text-(--ink-soft)">
                Only method available in this region.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="kicker block mb-2" htmlFor="email">
              Buyer email
            </label>
            <input
              id="email"
              className="input-field"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="buyer@example.com"
              type="email"
              autoComplete="email"
              value={email}
            />
            {email && !isEmailValid && (
              <p className="mt-1 text-xs text-(--danger)">Enter a valid email address.</p>
            )}
            {isEmailValid && (
              <p className="mt-1 text-xs text-(--success)">✓ Valid email</p>
            )}
          </div>

          <div className="mt-4">
            <label className="kicker block mb-2" htmlFor="description">
              Description{" "}
              <span className="font-normal normal-case text-(--ink-soft)">(optional)</span>
            </label>
            <textarea
              id="description"
              className="textarea-field min-h-24"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Shipment details or item description"
              value={description}
            />
          </div>

          {error && (
            <div className="panel-danger mt-4 p-4 text-sm" role="alert">
              <p className="font-semibold text-(--danger)">{error.title}</p>
              <p className="mt-1 text-sm text-(--ink-muted)">{error.message}</p>
              {error.correlationId && (
                <p className="mt-2 text-xs text-(--ink-soft)">
                  Correlation ID: {error.correlationId}
                </p>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="btn-primary px-5 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isReady}
              type="submit"
            >
              {isSubmitting ? "Creating…" : "Create virtual account"}
            </button>
            <button
              className="btn-secondary px-5 py-3 text-sm disabled:opacity-60"
              onClick={handleReset}
              type="button"
              disabled={isSubmitting}
            >
              Reset
            </button>
          </div>

          <p className="mt-4 text-xs text-(--ink-soft)">
            Buyer gets a dedicated Squad virtual account and funds are held once transfer is confirmed.
          </p>
        </form>

        <aside className="flex flex-col gap-4">
          <section className="panel p-5 reveal-up delay-80">
            <h2 className="text-sm font-semibold text-foreground">What happens next</h2>
            <ul className="mt-3 space-y-3 text-sm text-(--ink-muted)">
              {[
                "Buyer transfers to the generated virtual account.",
                "Webhook locks funds and updates escrow state.",
                "Seller uploads waybill once funds are secured.",
              ].map((step) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-(--accent-positive)" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-5 reveal-up delay-160">
            <h2 className="text-sm font-semibold text-foreground">Payment details</h2>
            {result ? (
              <div className="mt-4 space-y-3 text-sm text-(--ink-muted)">
                <p>Payment details were created. Open the modal to view the hosted checkout and virtual account.</p>
                <button
                  className="btn-primary px-4 py-3 text-sm"
                  onClick={() => setShowPaymentModal(true)}
                  type="button"
                >
                  View payment details
                </button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-(--ink-muted)">
                Submit the form to generate payment details and a transaction reference.
              </p>
            )}
          </section>
        </aside>
      </div>

      {/* ── Payment modal — accessible, with Escape + focus trap ── */}
      {result && (
        <Modal
          isOpen={showPaymentModal}
          onClose={handleModalClose}
          title="Escrow created"
          subtitle="Share the payment link below with your buyer so they can complete payment."
        >
          <div className="grid gap-3 text-sm text-(--ink-muted) sm:grid-cols-2">
            <div className="panel-muted px-4 py-3">
              <p className="kicker mb-1">Transaction ref</p>
              <p className="font-semibold text-foreground break-all">{result.transaction_ref}</p>
            </div>
            <div className="panel-muted px-4 py-3">
              <p className="kicker mb-1">Status</p>
              <p className="font-semibold text-foreground">{result.status}</p>
            </div>

            {result.virtual_account && (
              <>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Account number</p>
                  <p className="font-semibold text-foreground font-mono">
                    {result.virtual_account.account_number}
                  </p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Account name</p>
                  <p className="font-semibold text-foreground">
                    {result.virtual_account.account_name ?? "—"}
                  </p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Bank</p>
                  <p className="font-semibold text-foreground">
                    {result.virtual_account.bank_name ?? "—"}
                  </p>
                </div>
                {result.virtual_account.expires_at && (
                  <div className="panel-warning px-4 py-3">
                    <p className="kicker mb-1">Account expires</p>
                    <p className="font-semibold text-(--warning)">
                      {formatDate(result.virtual_account.expires_at)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {paymentLink && (
            <div className="mt-5 rounded-2xl border border-(--border-soft) bg-(--surface-muted) p-4">
              <p className="text-sm font-semibold text-foreground">Checkout link</p>
              <p className="mt-1 text-sm text-(--ink-muted)">
                Open the hosted checkout or copy/share the link to send to the buyer.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  className="btn-primary inline-flex items-center justify-center px-4 py-3 text-sm"
                  href={paymentLink}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Open checkout ↗
                </a>
                <button
                  className="btn-secondary px-4 py-3 text-sm"
                  onClick={() => void handleCopyPaymentLink()}
                  type="button"
                >
                  {copyFeedback ?? "Copy link"}
                </button>
                <button
                  className="btn-outline px-4 py-3 text-sm"
                  onClick={async () => {
                    if (
                      typeof navigator !== "undefined" &&
                      typeof navigator.share === "function"
                    ) {
                      try {
                        await navigator.share({
                          title: `BorderSafe escrow ${result.transaction_ref}`,
                          text: "Use this link to complete escrow payment.",
                          url: paymentLink,
                        });
                        return;
                      } catch {
                        // fall through to copy
                      }
                    }
                    void handleCopyPaymentLink();
                  }}
                  type="button"
                >
                  Share
                </button>
              </div>
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              className="btn-primary px-5 py-2.5 text-sm"
              onClick={handleModalClose}
              type="button"
            >
              Done — go to escrow list
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
