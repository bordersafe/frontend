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
  review_deadline_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type AdjudicationResponse = {
  escrow_id: string;
  status: string;
  confidence_score: number;
  verdict: "MATCH" | "FRAUD";
  reasoning: string;
};

type ReviewQueueResponse = {
  status: string;
  count: number;
  items: ReviewItem[];
  metrics?: {
    high_confidence_count: number;
    medium_confidence_count: number;
    low_confidence_count: number;
  };
};

type ResolveResponse = {
  escrow_id: string;
  status: string;
  action?: string;
  transaction_reference?: string;
};

const DEFAULT_STATUS = "AWAITING_ADMIN_FINALIZATION";
const OVERRIDE_CODES = ["BUYER_FRAUD", "SELLER_FRAUD", "NO_PROOF", "INSUFFICIENT_EVIDENCE", "PROCEDURAL_ERROR", "POLICY_VIOLATION", "OTHER"] as const;

function ConfidenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="inline-block rounded-full bg-(--accent-soft) px-2 py-1 text-xs font-semibold text-(--accent)">No verdict</span>;
  }

  if (score >= 90) {
    return <span className="inline-block rounded-full bg-(--success-soft) px-2 py-1 text-xs font-semibold text-(--success)">High {score}%</span>;
  } else if (score >= 60) {
    return <span className="inline-block rounded-full bg-(--warning-soft) px-2 py-1 text-xs font-semibold text-(--warning)">Med {score}%</span>;
  } else {
    return <span className="inline-block rounded-full bg-(--danger-soft) px-2 py-1 text-xs font-semibold text-(--danger)">Low {score}%</span>;
  }
}

function ProofLink({ label, url }: { label: string; url: string | null }) {
  if (!url) {
    return <p className="text-xs text-(--ink-soft)">No {label.toLowerCase()} uploaded.</p>;
  }

  const isImage = /\.(png|jpg|jpeg|webp)$/i.test(url) || url.includes("/image/upload");

  return (
    <div className="space-y-2">
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

function formatDeadlineLabel(deadlineAt: string | null) {
  if (!deadlineAt) {
    return "7-day review window";
  }

  const deadline = new Date(deadlineAt);
  if (Number.isNaN(deadline.getTime())) {
    return "7-day review window";
  }

  return deadline.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface CaseDetailModalProps {
  item: ReviewItem | null;
  adminReasoning: string;
  overrideCode: string | "";
  appealEligible: boolean;
  analysisResult: AdjudicationResponse | null;
  analyzing: boolean;
  onReasoningChange: (value: string) => void;
  onOverrideCodeChange: (value: string) => void;
  onAppealEligibleChange: (value: boolean) => void;
  onRunAiComparison: () => void;
  onClose: () => void;
}

function CaseDetailModal({
  item,
  adminReasoning,
  overrideCode,
  appealEligible,
  analysisResult,
  analyzing,
  onReasoningChange,
  onOverrideCodeChange,
  onAppealEligibleChange,
  onRunAiComparison,
  onClose,
}: CaseDetailModalProps) {
  if (!item) return null;

  const requiresOverride = item.arbitration && item.arbitration.confidence_score >= 90;
  const OVERRIDE_CODES = ["BUYER_FRAUD", "SELLER_FRAUD", "NO_PROOF", "INSUFFICIENT_EVIDENCE", "PROCEDURAL_ERROR", "POLICY_VIOLATION", "OTHER"] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="panel w-full max-h-[90vh] max-w-3xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-(--ink-border) pb-4">
          <div>
            <h2 className="heading-2">Case Detail</h2>
            <p className="mt-1 text-sm text-(--ink-muted)">{item.id}</p>
          </div>
          <button
            className="text-xl font-semibold text-(--ink-muted) hover:text-foreground"
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 space-y-6">
          {/* Case Info */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Case Information</h3>
            <div className="mt-3 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-(--ink-soft)">Amount:</span>
                <span className="font-semibold">{item.amount ?? "--"} {item.currency ?? ""}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--ink-soft)">Buyer:</span>
                <span className="font-semibold">{item.buyer_email ?? "Unknown"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-(--ink-soft)">Seller ID:</span>
                <span className="font-semibold">{item.seller_id ?? "Unknown"}</span>
              </div>
              {item.description && (
                <div className="flex justify-between">
                  <span className="text-(--ink-soft)">Description:</span>
                  <span className="font-semibold">{item.description}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-(--ink-soft)">Review window:</span>
                <span className="font-semibold">{formatDeadlineLabel(item.review_deadline_at)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-(--border) bg-(--border-soft) p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI comparison</h3>
                <p className="mt-1 text-xs text-(--ink-soft)">Run this after both proof images are available.</p>
              </div>
              <button
                className="btn-primary px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
                disabled={analyzing || !item.proof?.original_product_url || !item.proof?.buyer_received_url}
                onClick={onRunAiComparison}
                type="button"
              >
                {analyzing ? "Analyzing..." : "Run AI comparison"}
              </button>
            </div>
            {analysisResult && (
              <div className="rounded-lg bg-white p-3 text-sm text-(--ink-muted)">
                <p className="font-semibold text-foreground">Latest AI result</p>
                <p className="mt-2">Verdict: {analysisResult.verdict}</p>
                <p>Confidence: {analysisResult.confidence_score}%</p>
                <p>{analysisResult.reasoning}</p>
                {analysisResult.confidence_score >= 90 && analysisResult.verdict === "MATCH" ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-(--success)">
                    Auto-approval triggered on the admin queue.
                  </p>
                ) : (
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-(--warning)">
                    Confidence below auto-approve threshold. Use the approve/refund actions below.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* AI Verdict */}
          {item.arbitration && (
            <div className="space-y-3 rounded-lg bg-(--accent-soft) p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">AI Arbitration Verdict</h3>
                <ConfidenceBadge score={item.arbitration.confidence_score} />
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">{item.arbitration.verdict}</span> — {item.arbitration.reasoning}
                </p>
                <p className="text-xs text-(--ink-soft)">Decided {item.arbitration.decided_at}</p>
              </div>
            </div>
          )}

          {/* Delivery & Proof */}
          {(item.delivery || item.proof) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Evidence & Delivery</h3>
              {item.delivery && (
                <p className="text-sm text-(--ink-muted)">
                  Delivered {item.delivery.delivered_at} ({item.delivery.source})
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <ProofLink label="Original product" url={item.proof?.original_product_url ?? null} />
                <ProofLink label="Buyer received" url={item.proof?.buyer_received_url ?? null} />
              </div>
            </div>
          )}

          {/* Admin Resolution Fields */}
          <div className="space-y-4 border-t border-(--ink-border) pt-6">
            <h3 className="text-sm font-semibold text-foreground">Your Decision</h3>

            {requiresOverride && (
              <div className="rounded-lg bg-(--warning-soft) p-3">
                <p className="text-xs font-semibold text-(--warning)">
                  ⚠ High confidence ({item.arbitration?.confidence_score}%) auto-approves on the AI path; manual refunds still need an override code.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-(--ink-soft)">
                Admin Reasoning <span className="text-(--danger)">*</span>
              </label>
              <textarea
                className="input-field mt-2 text-sm"
                placeholder="Explain your decision and any override rationale..."
                rows={3}
                value={adminReasoning}
                onChange={(e) => onReasoningChange(e.target.value)}
              />
              <p className="mt-1 text-xs text-(--ink-soft)">{adminReasoning.length}/500 characters</p>
            </div>

            {requiresOverride && (
              <div>
                <label className="block text-xs font-semibold uppercase text-(--ink-soft)">
                  Override Code <span className="text-(--danger)">*</span>
                </label>
                <select
                  className="select-field mt-2 text-sm"
                  value={overrideCode}
                  onChange={(e) => onOverrideCodeChange(e.target.value)}
                  aria-label="Select override code reason"
                >
                  <option value="">Select reason for override...</option>
                  {OVERRIDE_CODES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <label className="flex items-center gap-2">
              <input
                className="h-4 w-4"
                type="checkbox"
                checked={appealEligible}
                onChange={(e) => onAppealEligibleChange(e.target.checked)}
              />
              <span className="text-sm text-(--ink-muted)">Buyer can appeal this decision</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-(--ink-border) pt-4">
          <button
            className="btn-secondary px-4 py-2 text-sm"
            onClick={onClose}
            type="button"
          >
            Close
          </button>
        </div>
      </div>
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
  const [metrics, setMetrics] = useState<ReviewQueueResponse["metrics"] | null>(null);

  // Filters
  const [confidenceMin, setConfidenceMin] = useState<number | "">("");
  const [confidenceMax, setConfidenceMax] = useState<number | "">(90);
  const [amountMin, setAmountMin] = useState<number | "">("");
  const [amountMax, setAmountMax] = useState<number | "">("");

  // Case detail modal
  const [selectedCase, setSelectedCase] = useState<ReviewItem | null>(null);
  const [adminReasoning, setAdminReasoning] = useState("");
  const [overrideCode, setOverrideCode] = useState<string>("");
  const [appealEligible, setAppealEligible] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AdjudicationResponse | null>(null);
  const [isAnalyzingCase, setIsAnalyzingCase] = useState(false);

  const fetchQueue = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("status", status);
      if (confidenceMin !== "") params.set("confidence_min", String(confidenceMin));
      if (confidenceMax !== "") params.set("confidence_max", String(confidenceMax));
      if (amountMin !== "") params.set("amount_min", String(amountMin));
      if (amountMax !== "") params.set("amount_max", String(amountMax));

      const response = await get<ReviewQueueResponse>(`/api/admin/escrows?${params.toString()}`);
      setItems(response.items ?? []);
      setMetrics(response.metrics ?? null);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, status, confidenceMin, confidenceMax, amountMin, amountMax, user]);

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
        admin_reasoning: adminReasoning.trim() || null,
        override_code: overrideCode || null,
        appeal_eligible: appealEligible,
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
      setSelectedCase(null);
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

  const handleOpenCase = (item: ReviewItem) => {
    setSelectedCase(item);
    setAdminReasoning("");
    setOverrideCode("");
    setAppealEligible(true);
    setAnalysisResult(null);
  };

  const handleRunAiComparison = async () => {
    if (!selectedCase?.proof?.original_product_url || !selectedCase?.proof?.buyer_received_url) {
      return;
    }

    setIsAnalyzingCase(true);
    setError(null);

    try {
      const response = await post<AdjudicationResponse>("/api/escrow/analyze", {
        escrow_id: selectedCase.id,
        original_product_url: selectedCase.proof.original_product_url,
        buyer_received_url: selectedCase.proof.buyer_received_url,
      });
      setAnalysisResult(response);

      if (response.confidence_score >= 90 && response.verdict === "MATCH") {
        await post<ResolveResponse>("/api/admin/resolve", {
          escrow_id: selectedCase.id,
          action: "approve",
          admin_reasoning: "Auto-approved after AI confidence above 90%.",
          appeal_eligible: true,
        });

        await fetchQueue();
        setSelectedCase(null);
      }
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsAnalyzingCase(false);
    }
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

          {/* Status & Metrics */}
          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Queue status</p>
                <p className="mt-2 text-xs text-(--ink-soft)">{status}</p>
              </div>
              {metrics && (
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-(--success)">{metrics.high_confidence_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-(--warning)">{metrics.medium_confidence_count}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-(--danger)">{metrics.low_confidence_count}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Filters */}
          <section className="panel p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">Filters</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold uppercase text-(--ink-soft)">Confidence min</label>
                <input
                  className="input-field mt-2 text-sm"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={confidenceMin}
                  onChange={(e) => setConfidenceMin(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-(--ink-soft)">Confidence max</label>
                <input
                  className="input-field mt-2 text-sm"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="100"
                  value={confidenceMax}
                  onChange={(e) => setConfidenceMax(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-(--ink-soft)">Amount min</label>
                <input
                  className="input-field mt-2 text-sm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={amountMin}
                  onChange={(e) => setAmountMin(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-(--ink-soft)">Amount max</label>
                <input
                  className="input-field mt-2 text-sm"
                  type="number"
                  min="0"
                  placeholder="1000000"
                  value={amountMax}
                  onChange={(e) => setAmountMax(e.target.value ? Number(e.target.value) : "")}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                className="btn-secondary px-3 py-2 text-xs"
                onClick={fetchQueue}
                type="button"
              >
                {isLoading ? "Filtering..." : "Apply filters"}
              </button>
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
            </div>
          </section>

          {items.length === 0 && !isLoading ? (
            <section className="panel p-6 text-sm text-(--ink-muted)">
              No escrows match your filters.
            </section>
          ) : (
            <div className="grid gap-4">
              {items.map((item) => {
                const detail = refundDetails[item.id] ?? { bankCode: "", accountNumber: "", accountName: "" };
                const canResolve = !!user && item.status === DEFAULT_STATUS && resolvingId !== item.id;
                const canRefund =
                  canResolve && detail.bankCode.trim().length > 0 && detail.accountNumber.trim().length > 0;
                const isPending = pendingResolution?.id === item.id;
                const pendingAction = isPending ? pendingResolution?.action : null;

                return (
                  <section key={item.id} className="panel p-4 hover:bg-(--surface-hover) cursor-pointer transition" onClick={() => handleOpenCase(item)}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{item.id}</h3>
                          <ConfidenceBadge score={item.arbitration?.confidence_score ?? null} />
                        </div>
                        <p className="mt-1 text-sm text-(--ink-muted)">
                          {item.amount ?? "--"} {item.currency ?? ""} · {item.buyer_email ?? "Unknown"}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="chip mt-1">{item.status}</span>
                      </div>
                    </div>

                    {item.arbitration && (
                      <p className="mt-2 text-sm text-(--ink-muted)">
                        {item.arbitration.reasoning}
                      </p>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        className="btn-primary px-3 py-2 text-xs disabled:opacity-60"
                        disabled={!canResolve}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(item.id, "approve");
                        }}
                        type="button"
                      >
                        Approve
                      </button>
                      <button
                        className="btn-secondary px-3 py-2 text-xs disabled:opacity-60"
                        disabled={!canRefund}
                        onClick={(e) => {
                          e.stopPropagation();
                          // Open refund details form
                        }}
                        type="button"
                      >
                        Refund
                      </button>
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          {error && (
            <section className="panel-outline p-5 text-sm text-(--ink-muted)">
              <p className="font-semibold text-foreground">{error.title}</p>
              <p className="mt-1">{error.message}</p>
            </section>
          )}

          {/* Case Detail Modal */}
          <CaseDetailModal
            item={selectedCase}
            adminReasoning={adminReasoning}
            overrideCode={overrideCode}
            appealEligible={appealEligible}
            analysisResult={analysisResult}
            analyzing={isAnalyzingCase}
            onReasoningChange={setAdminReasoning}
            onOverrideCodeChange={setOverrideCode}
            onAppealEligibleChange={setAppealEligible}
            onRunAiComparison={() => void handleRunAiComparison()}
            onClose={() => setSelectedCase(null)}
          />
        </>
      )}
    </main>
  );
}
