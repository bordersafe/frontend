"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type RiskScorecard = {
  seller_id: string;
  overall_risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  risk_score: number;
  last_updated: string;
  metrics: {
    fraud_disputes_ratio: number;
    refund_request_ratio: number;
    appeal_reversal_ratio: number;
    payment_compliance_score: number;
    response_time_avg: number;
    account_age_days: number;
    total_transactions: number;
    high_risk_transactions: number;
    dispute_count: number;
    fraud_count: number;
    appeal_count: number;
    appeal_approval_count: number;
  };
  risk_factors: Array<{
    factor: string;
    severity: "LOW" | "HIGH";
    weight: number;
    description: string;
  }>;
  actions: Array<{
    action: string;
    taken_at: string;
    reason: string;
    expires_at?: string | null;
  }>;
};

function RiskBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    LOW: "bg-(--success-soft) text-(--success)",
    MEDIUM: "bg-(--warning-soft) text-(--warning)",
    HIGH: "bg-(--danger-soft) text-(--danger)",
    CRITICAL: "bg-red-100 text-red-900",
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${colors[level] || "bg-(--ink-soft)"}`}>
      {level}
    </span>
  );
}

function RiskMeter({ score }: { score: number }) {
  const percentage = (score / 100) * 100;
  const color =
    score >= 75 ? "bg-red-500" : score >= 50 ? "bg-orange-500" : score >= 25 ? "bg-yellow-500" : "bg-green-500";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Risk Score</span>
        <span className="text-lg font-bold text-foreground">{score}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-(--surface-soft)">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default function SellerRiskPage() {
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [sellerId, setSellerId] = useState("");
  const [scorecard, setScorecard] = useState<RiskScorecard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [isApplyingAction, setIsApplyingAction] = useState(false);

  // Action form state
  const [selectedAction, setSelectedAction] = useState<"HOLD" | "VERIFY" | "SUSPEND" | "RESTORE">("VERIFY");
  const [actionReason, setActionReason] = useState("");
  const [actionDuration, setActionDuration] = useState(7);

  const fetchScorecard = useCallback(async () => {
    if (!sellerId.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing seller ID",
        message: "Please enter a seller ID to fetch risk scorecard.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<RiskScorecard>(`/api/admin/seller/${sellerId}/risk-scorecard`);
      setScorecard(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, sellerId]);

  const handleApplyAction = async () => {
    if (!scorecard || !actionReason.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing information",
        message: "Please provide a reason for the action.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsApplyingAction(true);
    setError(null);

    try {
      await post(`/api/admin/seller/${scorecard.seller_id}/apply-risk-action`, {
        action: selectedAction,
        reason: actionReason.trim(),
        duration_days: selectedAction === "RESTORE" ? null : actionDuration,
      });

      setActionReason("");
      setActionDuration(7);
      await fetchScorecard();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsApplyingAction(false);
    }
  };

  if (isAuthLoading) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading...
        </section>
      </main>
    );
  }

  if (!isAdminUser) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6">
          <h1 className="heading-1">Access Denied</h1>
          <p className="mt-2 text-sm text-(--ink-muted)">
            You don't have permission to access the seller risk management panel.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Seller Risk Management</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Monitor seller risk scores and apply protective actions.
        </p>
      </header>

      {/* Seller Search */}
      <section className="panel p-6">
        <label className="block text-sm font-semibold text-foreground">Seller ID</label>
        <div className="mt-3 flex gap-2">
          <input
            className="input-field flex-1 text-sm"
            placeholder="Enter seller ID..."
            type="text"
            value={sellerId}
            onChange={(e) => setSellerId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                fetchScorecard();
              }
            }}
          />
          <button
            className="btn-primary px-4 py-2 text-sm"
            onClick={fetchScorecard}
            disabled={isLoading || !sellerId.trim()}
            type="button"
          >
            {isLoading ? "Loading..." : "Fetch Scorecard"}
          </button>
        </div>
      </section>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {scorecard && (
        <>
          {/* Risk Overview */}
          <section className="panel p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="heading-2">{scorecard.seller_id}</h2>
                <p className="mt-2 text-sm text-(--ink-muted)">Last updated {scorecard.last_updated}</p>
              </div>
              <RiskBadge level={scorecard.overall_risk} />
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              {/* Risk Score */}
              <div>
                <RiskMeter score={scorecard.risk_score} />
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-2xl font-bold text-foreground">{scorecard.metrics.total_transactions}</p>
                </div>
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-2xl font-bold text-foreground">{scorecard.metrics.account_age_days}d</p>
                </div>
                <div className="rounded-lg bg-(--danger-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--danger)">Fraud Dispute %</p>
                  <p className="mt-2 text-2xl font-bold text-(--danger)">
                    {scorecard.metrics.fraud_disputes_ratio.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg bg-(--warning-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--warning)">Refund %</p>
                  <p className="mt-2 text-2xl font-bold text-(--warning)">
                    {scorecard.metrics.refund_request_ratio.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Risk Factors */}
          {scorecard.risk_factors.length > 0 && (
            <section className="panel p-6">
              <h3 className="heading-3">Risk Factors Identified</h3>
              <div className="mt-4 space-y-3">
                {scorecard.risk_factors.map((factor, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${factor.severity === "HIGH" ? "bg-(--danger-soft)" : "bg-(--warning-soft)"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{factor.description}</p>
                        <p className="mt-1 text-xs text-(--ink-muted)">{factor.factor}</p>
                      </div>
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${factor.severity === "HIGH" ? "bg-(--danger) text-(--danger-ink)" : "bg-(--warning) text-(--warning-ink)"}`}>
                        {factor.severity}
                      </span>
                    </div>
                    <div className="mt-2 h-1 w-full rounded-full bg-(--surface-soft)">
                      <div
                        className="h-full rounded-full bg-(--action)"
                        style={{ width: `${Math.round(factor.weight * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Active Actions */}
          {scorecard.actions.length > 0 && (
            <section className="panel p-6">
              <h3 className="heading-3">Active Risk Actions</h3>
              <div className="mt-4 space-y-3">
                {scorecard.actions.map((action, index) => (
                  <div key={index} className="rounded-lg border border-(--ink-border) p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground">{action.action}</p>
                        <p className="mt-1 text-sm text-(--ink-muted)">{action.reason}</p>
                      </div>
                      {action.expires_at && (
                        <span className="text-xs font-semibold text-(--warning)">
                          Expires {new Date(action.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Apply Action */}
          <section className="panel p-6">
            <h3 className="heading-3">Apply Risk Action</h3>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground">Action Type</label>
                <select
                  className="select-field mt-2 text-sm"
                  value={selectedAction}
                  onChange={(e) => setSelectedAction(e.target.value as any)}
                  aria-label="Select risk action type"
                >
                  <option value="VERIFY">Verify Account</option>
                  <option value="HOLD">Hold Transactions</option>
                  <option value="SUSPEND">Suspend Account</option>
                  <option value="RESTORE">Restore Account</option>
                </select>
              </div>

              {selectedAction !== "RESTORE" && (
                <div>
                  <label className="block text-sm font-semibold text-foreground">Duration (days)</label>
                  <input
                    className="input-field mt-2 text-sm"
                    min="1"
                    max="365"
                    type="number"
                    value={actionDuration}
                    onChange={(e) => setActionDuration(Number(e.target.value))}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground">Reason</label>
                <textarea
                  className="input-field mt-2 text-sm"
                  placeholder="Explain the reason for this action..."
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  disabled={isApplyingAction}
                />
              </div>

              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={handleApplyAction}
                disabled={isApplyingAction || !actionReason.trim()}
                type="button"
              >
                {isApplyingAction ? "Applying..." : "Apply Action"}
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
