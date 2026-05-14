"use client";

import { useCallback, useEffect, useState } from "react";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type ReviewItem = {
  id: string;
  status: string;
  amount: number | null;
  currency: string | null;
  buyer_email: string | null;
  seller_id: string | null;
  description: string | null;
  delivery: {
    delivered_at: string;
    source: string;
    notes?: string | null;
  } | null;
  proof: {
    original_product_url: string | null;
    buyer_received_url: string | null;
    uploaded_at: string;
  } | null;
  arbitration: {
    confidence_score: number;
    verdict: "MATCH" | "FRAUD";
    reasoning: string;
    decided_at: string;
  } | null;
  created_at: string | null;
  updated_at: string | null;
};

type ReviewQueueResponse = {
  status: string;
  count: number;
  items: ReviewItem[];
};

type ResolveResponse = {
  escrow_id: string;
  status: string;
  action?: string;
  transaction_reference?: string;
};

const DEFAULT_STATUS = "AWAITING_ADMIN_FINALIZATION";

function ProofLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return <p className="text-xs text-(--ink-soft)">No {label.toLowerCase()} uploaded.</p>;
  }

  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url) || url.includes("/image/upload");

  return (
    <div className="space-y-2">
      <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">{label}</p>
      {isImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt={label}
          className="h-40 w-full rounded-2xl object-cover"
          src={url}
        />
      ) : (
        <a
          className="btn-secondary inline-flex items-center justify-center px-3 py-2 text-xs"
          href={url}
          rel="noreferrer"
          target="_blank"
        >
          Open {label}
        </a>
      )}
    </div>
  );
}

export default function AdminReviewPage() {
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const [status, setStatus] = useState(DEFAULT_STATUS);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [pendingResolution, setPendingResolution] = useState<
    { id: string; action: "approve" | "refund" } | null
  >(null);
  const [refundDetails, setRefundDetails] = useState<
    Record<string, { bankCode: string; accountNumber: string; accountName: string }>
  >({});

  const fetchQueue = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<ReviewQueueResponse>(
        `/api/admin/escrows?status=${encodeURIComponent(status)}`
      );
      setItems(response.items ?? []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, status, user]);

  useEffect(() => {
    if (!isAuthLoading && user) {
      void fetchQueue();
    }
  }, [fetchQueue, isAuthLoading, user]);

  useEffect(() => {
    if (!user || isAuthLoading) {
      return;
    }

    if (status !== DEFAULT_STATUS) {
      return;
    }

    const timer = setInterval(() => {
      void fetchQueue();
    }, 12000);

    return () => clearInterval(timer);
  }, [fetchQueue, isAuthLoading, status, user]);

  const handleResolve = async (escrowId: string, action: "approve" | "refund") => {
    setResolvingId(escrowId);
    setError(null);

    try {
      const payload: Record<string, unknown> = {
        escrow_id: escrowId,
        action,
      };

      if (action === "refund") {
        const details = refundDetails[escrowId] ?? { bankCode: "", accountNumber: "", accountName: "" };
        payload.refund_bank_code = details.bankCode.trim();
        payload.refund_account_number = details.accountNumber.trim();
        if (details.accountName.trim()) {
          payload.refund_account_name = details.accountName.trim();
        }
      }

      const shouldRequery = pendingResolution?.id === escrowId && pendingResolution?.action === action;
      const endpoint = shouldRequery ? "/api/admin/requery-transfer" : "/api/admin/resolve";
      const response = await post<ResolveResponse>(endpoint, payload);

      if (endpoint === "/api/admin/requery-transfer" && response.status === "PENDING") {
        setPendingResolution({ id: escrowId, action });
        return;
      }

      await fetchQueue();
      setPendingResolution(null);
    } catch (err) {
      const normalized = normalizeApiError(err);
      setError(normalized);
      if (normalized.code === "TRANSFER_PENDING") {
        setPendingResolution({ id: escrowId, action });
      }
    } finally {
      setResolvingId(null);
    }
  };

  const updateRefundDetail = (escrowId: string, field: "bankCode" | "accountNumber" | "accountName", value: string) => {
    setRefundDetails((prev) => ({
      ...prev,
      [escrowId]: {
        bankCode: prev[escrowId]?.bankCode ?? "",
        accountNumber: prev[escrowId]?.accountNumber ?? "",
        accountName: prev[escrowId]?.accountName ?? "",
        [field]: value,
      },
    }));
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      {isAuthLoading ? (
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading...
        </section>
      ) : !isAdminUser ? (
        <section className="panel p-6">
          <h1 className="heading-1">Access Denied</h1>
          <p className="mt-2 text-sm text-(--ink-muted)">
            You don't have permission to access the admin panel. Only administrators can access this area.
          </p>
          <a
            className="mt-4 inline-block rounded-full bg-(--action) px-4 py-2 text-xs font-semibold text-(--action-ink)"
            href="/dashboard"
          >
            Return to Dashboard
          </a>
        </section>
      ) : (
        <>
          <header className="panel p-6">
            <h1 className="heading-1">Escrow review queue</h1>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Review AI advisories and finalize payout or refund decisions.
            </p>
          </header>

          <section className="panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Queue status</p>
            <p className="mt-2 text-xs text-(--ink-soft)">{status}</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="select-field text-sm"
              onChange={(event) => setStatus(event.target.value)}
              value={status}
              aria-label="Select review queue status"
            >
              <option value={DEFAULT_STATUS}>Awaiting admin finalization</option>
              <option value="DISBURSED">Disbursed</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button
              className="btn-secondary px-3 py-2 text-xs"
              onClick={fetchQueue}
              type="button"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>
      </section>

      {items.length === 0 && !isLoading ? (
        <section className="panel p-6 text-sm text-(--ink-muted)">
          No escrows in this queue yet.
        </section>
      ) : (
        <div className="grid gap-6">
          {items.map((item) => {
            const detail = refundDetails[item.id] ?? { bankCode: "", accountNumber: "", accountName: "" };
            const canResolve = !!user && item.status === DEFAULT_STATUS && resolvingId !== item.id;
            const canRefund =
              canResolve && detail.bankCode.trim().length > 0 && detail.accountNumber.trim().length > 0;
            const isPending = pendingResolution?.id === item.id;
            const pendingAction = isPending ? pendingResolution?.action : null;

            return (
              <section
                key={item.id}
                className="panel p-5"
              >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Escrow ID</p>
                  <h2 className="mt-2 text-lg font-semibold text-foreground">{item.id}</h2>
                  <p className="mt-1 text-sm text-(--ink-muted)">
                    {item.amount ?? "--"} {item.currency ?? ""} · {item.buyer_email ?? "Unknown buyer"}
                  </p>
                  {item.seller_id && (
                    <p className="mt-1 text-xs text-(--ink-soft)">Seller ID: {item.seller_id}</p>
                  )}
                  {item.description && (
                    <p className="mt-1 text-xs text-(--ink-soft)">{item.description}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Status</p>
                  <div className="mt-2 flex justify-end">
                    <span className="chip">{item.status}</span>
                  </div>
                  {item.updated_at && (
                    <p className="mt-1 text-xs text-(--ink-soft)">Updated {item.updated_at}</p>
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="panel-muted space-y-3 px-4 py-4 text-sm text-(--ink-muted)">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">AI advisory</p>
                  {item.arbitration ? (
                    <div className="space-y-2">
                      <p className="font-semibold text-foreground">
                        {item.arbitration.verdict} · {item.arbitration.confidence_score}% confidence
                      </p>
                      <p>{item.arbitration.reasoning}</p>
                      <p className="text-xs text-(--ink-soft)">
                        Decided at {item.arbitration.decided_at}
                      </p>
                    </div>
                  ) : (
                    <p>No AI advisory available.</p>
                  )}

                  {item.delivery && (
                    <div className="pt-2 text-xs text-(--ink-soft)">
                      Delivered at {item.delivery.delivered_at} ({item.delivery.source})
                    </div>
                  )}
                </div>

                <div className="grid gap-3">
                  <ProofLink label="Original product" url={item.proof?.original_product_url ?? null} />
                  <ProofLink label="Buyer received" url={item.proof?.buyer_received_url ?? null} />
                </div>
              </div>

              <div className="panel-outline mt-5 grid gap-3 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Refund payout details</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input
                    className="input-field text-sm"
                    placeholder="Bank code"
                    value={detail.bankCode}
                    onChange={(event) => updateRefundDetail(item.id, "bankCode", event.target.value)}
                    aria-label="Refund bank code"
                  />
                  <input
                    className="input-field text-sm"
                    placeholder="Account number"
                    value={detail.accountNumber}
                    onChange={(event) => updateRefundDetail(item.id, "accountNumber", event.target.value)}
                    aria-label="Refund account number"
                  />
                  <input
                    className="input-field text-sm"
                    placeholder="Account name (optional)"
                    value={detail.accountName}
                    onChange={(event) => updateRefundDetail(item.id, "accountName", event.target.value)}
                    aria-label="Refund account name"
                  />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canResolve}
                  onClick={() => handleResolve(item.id, "approve")}
                  type="button"
                >
                  {resolvingId === item.id
                    ? "Processing..."
                    : pendingAction === "approve"
                      ? "Retry payout"
                      : "Approve payout"}
                </button>
                <button
                  className="btn-secondary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!canRefund}
                  onClick={() => handleResolve(item.id, "refund")}
                  type="button"
                >
                  {pendingAction === "refund" ? "Retry refund" : "Refund buyer"}
                </button>
              </div>
              {isPending && (
                <p className="mt-3 text-xs text-(--ink-soft)">
                  Transfer is pending confirmation. Retry after a short delay.
                </p>
              )}
            </section>
            );
          })}
          </div>
      )}

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {error.code === "TRANSFER_PENDING" && (
            <p className="mt-2 text-xs text-(--ink-soft)">
              Squad reported a pending transfer. Requery after a short delay.
            </p>
          )}
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft)">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </section>
      )}
        </>
      )}
    </main>
  );
}
