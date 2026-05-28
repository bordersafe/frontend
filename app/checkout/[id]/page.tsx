"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { apiClient, normalizeApiError } from "@/lib/api";
import type { UiError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import { getEscrowStatusMeta } from "@/lib/status-labels";

type PublicEscrowDetail = {
  id: string;
  transaction_ref: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  checkout_url: string | null;
  payment_checkout_url: string | null;
  virtual_account: {
    account_number: string;
    account_name: string | null;
    bank_name: string | null;
    expires_at: string | null;
    reference: string | null;
  } | null;
  created_at: string | null;
  updated_at: string | null;
};

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="panel p-5">
        <div className="skeleton h-4 w-32 rounded" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-14 rounded-2xl" />
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="skeleton h-14 rounded-2xl" />
            <div className="skeleton h-14 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="panel p-5">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="mt-4 space-y-3">
          <div className="skeleton h-12 rounded-full" />
          <div className="skeleton h-12 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [escrow, setEscrow] = useState<PublicEscrowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UiError | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<PublicEscrowDetail>(`/api/escrow/public/${id}`);
        if (!cancelled) {
          setEscrow(response);
        }
      } catch (err) {
        if (!cancelled) {
          setError(normalizeApiError(err));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const paymentLink = escrow?.payment_checkout_url ?? escrow?.checkout_url ?? null;

  const handleCopy = async () => {
    if (!paymentLink) return;
    await navigator.clipboard.writeText(paymentLink);
    setCopyFeedback("Copied!");
    window.setTimeout(() => setCopyFeedback(null), 2000);
  };

  const statusMeta = escrow ? getEscrowStatusMeta(escrow.status) : null;

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="heading-1 mt-2">Pay for this escrow</h1>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Use the hosted payment link below. Funds lock once Squad confirms payment.
            </p>
          </div>
          {/* No account needed badge */}
          <span className="flex items-center gap-2 rounded-full border border-(--success)/30 bg-(--success)/8 px-4 py-2 text-sm font-semibold text-(--success)">
            ✓ No account needed
          </span>
        </div>
      </section>

      {isLoading ? (
        <LoadingSkeleton />
      ) : escrow ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Order summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-(--ink-muted)">
              <div className="panel-muted px-4 py-3">
                <p className="kicker mb-1">Status</p>
                {statusMeta && <span className={statusMeta.chipClass}>{statusMeta.label}</span>}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Amount</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {formatCurrency(escrow.amount, escrow.currency)}
                  </p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Transaction ref</p>
                  <p className="mt-1 font-semibold text-foreground break-all">{escrow.transaction_ref}</p>
                </div>
              </div>
              {escrow.description && (
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Description</p>
                  <p className="mt-1 font-semibold text-foreground">{escrow.description}</p>
                </div>
              )}
            </div>

            {/* Simple 3-step progress for buyers */}
            <div className="mt-5 flex items-stretch gap-0 overflow-hidden rounded-2xl border border-(--border-soft)">
              {[
                { label: "Payment", done: escrow.status !== "AWAITING_PAYMENT" },
                { label: "Delivery", done: ["AWAITING_ADMIN_FINALIZATION", "DISBURSED", "REFUNDED"].includes(escrow.status) },
                { label: "Release", done: escrow.status === "DISBURSED" || escrow.status === "REFUNDED" },
              ].map((step, i) => (
                <div
                  key={step.label}
                  className={`flex-1 border-r border-(--border-soft) px-3 py-2 text-center last:border-r-0 text-xs font-semibold ${
                    step.done
                      ? "bg-(--success)/10 text-(--success)"
                      : i === 0 && escrow.status === "AWAITING_PAYMENT"
                        ? "bg-(--warning)/10 text-(--warning)"
                        : "text-(--ink-soft)"
                  }`}
                >
                  {step.done ? "✓ " : ""}{step.label}
                </div>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Payment link</h2>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Open the hosted checkout to complete payment, or copy/share the link.
            </p>

            {paymentLink ? (
              <div className="mt-4 space-y-3">
                <a
                  className="btn-primary inline-flex w-full items-center justify-center px-4 py-3 text-sm"
                  href={paymentLink}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Open checkout ↗
                </a>
                <button
                  className="btn-secondary w-full px-4 py-3 text-sm"
                  onClick={() => void handleCopy()}
                  type="button"
                >
                  {copyFeedback ?? "Copy checkout link"}
                </button>
              </div>
            ) : (
              <p className="mt-4 text-sm text-(--ink-muted)">
                A hosted payment link is not available for this escrow yet.
              </p>
            )}

            {escrow.virtual_account && (
              <div className="mt-6 space-y-3 text-sm text-(--ink-muted)">
                <h3 className="text-sm font-semibold text-foreground">Virtual account details</h3>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Account number</p>
                  <p className="mt-1 font-mono font-semibold text-foreground">
                    {escrow.virtual_account.account_number}
                  </p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Bank</p>
                  <p className="mt-1 font-semibold text-foreground">
                    {escrow.virtual_account.bank_name ?? "—"}
                  </p>
                </div>
                {escrow.virtual_account.account_name && (
                  <div className="panel-muted px-4 py-3">
                    <p className="kicker mb-1">Account name</p>
                    <p className="mt-1 font-semibold text-foreground">
                      {escrow.virtual_account.account_name}
                    </p>
                  </div>
                )}
                {escrow.virtual_account.expires_at && (
                  <div className="panel-warning px-4 py-3">
                    <p className="kicker mb-1">Account expires</p>
                    <p className="mt-1 font-semibold text-(--warning)">
                      {formatDate(escrow.virtual_account.expires_at)}
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      ) : null}

      {error && (
        <section className="panel-danger p-5 text-sm" role="alert">
          <p className="font-semibold text-(--danger)">{error.title}</p>
          <p className="mt-1 text-(--ink-muted)">{error.message}</p>
        </section>
      )}
    </main>
  );
}
