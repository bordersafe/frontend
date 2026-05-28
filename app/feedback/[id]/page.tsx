"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { formatCurrency, formatDate } from "@/lib/format";
import { getEscrowStatusMeta } from "@/lib/status-labels";
import { apiClient, normalizeApiError } from "@/lib/api";
import type { UiError } from "@/lib/api";

type PublicEscrowDetail = {
  id: string;
  transaction_ref: string;
  description: string | null;
  amount: number;
  currency: string;
  status: string;
  checkout_url: string | null;
  payment_checkout_url: string | null;
  archived_at?: string | null;
  disabled?: boolean;
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

export default function FeedbackPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [escrow, setEscrow] = useState<PublicEscrowDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<UiError | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

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
    const timer = window.setInterval(() => void run(), 10000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [id]);

  const handleCopyLink = async () => {
    if (!id) return;
    await navigator.clipboard.writeText(`${window.location.origin.replace(/\/$/, "")}/feedback/${id}`);
  };

  const isArchivedOrDisabled = !!escrow?.disabled || !!escrow?.archived_at;

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <section className="panel p-6">
        <h1 className="heading-1 mt-2">Escrow tracking and payment feedback</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          This page confirms whether the payment webhook has updated the escrow and lets you keep tracking the order.
        </p>
      </section>

      {escrow ? (
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Feedback summary</h2>
            <div className="mt-4 grid gap-3 text-sm text-(--ink-muted)">
              <div className="panel-muted px-4 py-3">
                <p className="kicker mb-1">Status</p>
                <div className="mt-1 flex flex-wrap gap-2 items-center">
                  <span className={getEscrowStatusMeta(escrow.status).chipClass}>{getEscrowStatusMeta(escrow.status).label}</span>
                </div>
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
                <div className="panel-muted px-4 py-3">
                  <p className="kicker mb-1">Description</p>
                  <p className="mt-1 font-semibold text-foreground">{escrow.description}</p>
                </div>
              <div className="panel-muted px-4 py-3">
                <p className="mt-2 text-sm">Share this link to track the escrow in real time.</p>
                <button className="btn-secondary mt-3 px-4 py-2 text-sm" onClick={handleCopyLink} type="button">
                  Copy tracking link
                </button>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <h2 className="text-sm font-semibold text-foreground">Payment and progress</h2>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Squad payment feedback is applied through the backend webhook, then this page reflects the updated escrow state.
            </p>

            {verified && escrow.payment_checkout_url && escrow.status === "AWAITING_PAYMENT" && !isArchivedOrDisabled ? (
              <div className="mt-4 space-y-3">
                <a
                  className="btn-primary inline-flex w-full items-center justify-center px-4 py-3 text-sm"
                  href={escrow.payment_checkout_url}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Open checkout
                </a>
                <p className="text-sm text-(--ink-muted)">
                  If payment was completed, the webhook should update this page shortly.
                </p>
              </div>
            ) : (
              <div className="mt-4 panel-muted px-4 py-3 text-sm text-(--ink-muted)">
                {isArchivedOrDisabled ? (
                  <p>This escrow has been archived or disabled.</p>
                ) : (
                  <>
                    {!verified ? (
                      <div className="space-y-3">
                        <p className="text-sm">Enter the email used to pay to reveal payment details.</p>
                        <div className="flex gap-2">
                          <input
                            aria-label="Email"
                            className="input flex-1"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            placeholder="you@example.com"
                            type="email"
                          />
                          <button
                            className="btn-primary px-3"
                            onClick={async () => {
                              if (!id) return;
                              setIsVerifying(true);
                              setVerifyError(null);
                              try {
                                const resp = await apiClient.post<{ verified: boolean }>(`/api/escrow/public/verify`, {
                                  escrow_id: id,
                                  email: emailInput,
                                });
                                if (resp?.verified) {
                                  setVerified(true);
                                } else {
                                  setVerifyError("Email did not match. Please check and try again.");
                                }
                              } catch (err) {
                                setVerifyError(normalizeApiError(err)?.message ?? "Verification failed.");
                              } finally {
                                setIsVerifying(false);
                              }
                            }}
                            type="button"
                          >
                            {isVerifying ? "Verifying..." : "Verify"}
                          </button>
                        </div>
                        {verifyError && <p className="text-sm text-(--danger)">{verifyError}</p>}
                      </div>
                    ) : (
                      <p>No hosted payment action is needed right now.</p>
                    )}
                  </>
                )}
              </div>
            )}

            {escrow.virtual_account && (
              <div className="mt-6 space-y-3 text-sm text-(--ink-muted)">
                <h3 className="text-sm font-semibold text-foreground">Virtual account details</h3>
                <div className="panel-muted px-4 py-3">
                  <p className="mt-2 font-semibold text-foreground">{escrow.virtual_account.account_number}</p>
                </div>
                <div className="panel-muted px-4 py-3">
                  <p className="mt-2 font-semibold text-foreground">{escrow.virtual_account.bank_name ?? "-"}</p>
                </div>
                {escrow.virtual_account.account_name && (
                  <div className="panel-muted px-4 py-3">
                    <p className="kicker mb-1">Account name</p>
                    <p className="mt-1 font-semibold text-foreground">{escrow.virtual_account.account_name}</p>
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
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : (
        <section className="panel p-5 text-sm text-(--ink-muted)">
          {error?.message ?? "Feedback page not found."}
        </section>
      )}

      {error && (
        <section className="panel-danger p-5 text-sm" role="alert">
          <p className="font-semibold text-(--danger)">{error.title}</p>
          <p className="mt-1 text-(--ink-muted)">{error.message}</p>
        </section>
      )}
    </main>
  );
}
