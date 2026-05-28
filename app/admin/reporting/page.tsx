"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type DashboardMetrics = {
  period: string;
  timestamp: string;
  total_transactions: number;
  total_volume: number;
  active_users: number;
  active_merchants: number;
  fraud_rate: number;
  chargeback_rate: number;
  resolution_time_avg: number;
  sla_compliance: number;
};

type MerchantRanking = {
  seller_id: string;
  total_transactions: number;
  total_volume: number;
  success_rate: number;
  dispute_rate: number;
  refund_rate: number;
  seller_risk_score: number;
};

type TabType = "dashboard" | "merchants" | "custom";

export default function ReportingPage() {
  const { user, profile, isAuthLoading, get } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("dashboard");
  const [error, setError] = useState<UiError | null>(null);

  // Dashboard tab
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsDays, setMetricsDays] = useState(30);

  // Merchants tab
  const [merchants, setMerchants] = useState<MerchantRanking[]>([]);
  const [isLoadingMerchants, setIsLoadingMerchants] = useState(false);
  const [merchantDays, setMerchantDays] = useState(30);
  const [merchantLimit, setMerchantLimit] = useState(20);

  // Load dashboard metrics
  const loadDashboardMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    setError(null);

    try {
      const response = await get<DashboardMetrics>(`/api/admin/reporting/dashboard?days=${metricsDays}`);
      setMetrics(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [get, metricsDays]);

  // Load merchant performance
  const loadMerchantPerformance = useCallback(async () => {
    setIsLoadingMerchants(true);
    setError(null);

    try {
      const response = await get<any>(
        `/api/admin/reporting/merchant-performance?limit=${merchantLimit}&days=${merchantDays}`
      );
      setMerchants(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingMerchants(false);
    }
  }, [get, merchantLimit, merchantDays]);

  useEffect(() => {
    if (activeTab === "dashboard") {
      loadDashboardMetrics();
    }
  }, [activeTab, loadDashboardMetrics]);

  useEffect(() => {
    if (activeTab === "merchants") {
      loadMerchantPerformance();
    }
  }, [activeTab, loadMerchantPerformance]);

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
            You don't have permission to access reports.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Advanced Reporting</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Comprehensive dashboards and performance analytics.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border)">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "dashboard"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("dashboard")}
          type="button"
        >
          Dashboard
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "merchants"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("merchants")}
          type="button"
        >
          Merchant Performance
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "custom"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("custom")}
          type="button"
        >
          Custom Reports
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === "dashboard" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Business Dashboard</h2>
              <select
                className="select-field text-sm"
                value={metricsDays}
                onChange={(e) => setMetricsDays(parseInt(e.target.value))}
                aria-label="Select dashboard period"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {isLoadingMetrics ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading metrics...</p>
            ) : metrics ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Transactions
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {metrics.total_transactions}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Total Volume
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      ₦{(metrics.total_volume / 1000000).toFixed(1)}M
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Active Users
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {metrics.active_users}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Active Merchants
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {metrics.active_merchants}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--success-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--success)">
                      SLA Compliance
                    </p>
                    <p className="mt-2 text-3xl font-bold text-(--success)">
                      {Math.round(metrics.sla_compliance)}%
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg bg-(--danger-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--danger)">
                      Fraud Rate
                    </p>
                    <p className="mt-2 text-3xl font-bold text-(--danger)">
                      {metrics.fraud_rate.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--warn-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--warn)">
                      Chargeback Rate
                    </p>
                    <p className="mt-2 text-3xl font-bold text-(--warn)">
                      {metrics.chargeback_rate.toFixed(2)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Avg Resolution
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(metrics.resolution_time_avg)}m
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Period
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {metrics.period}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Merchants Tab */}
      {activeTab === "merchants" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Merchant Performance Ranking</h2>
              <div className="flex gap-2">
                <select
                  className="select-field text-xs"
                  value={merchantLimit}
                  onChange={(e) => setMerchantLimit(parseInt(e.target.value))}
                  aria-label="Merchant limit"
                >
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                </select>

                <select
                  className="select-field text-xs"
                  value={merchantDays}
                  onChange={(e) => setMerchantDays(parseInt(e.target.value))}
                  aria-label="Merchant period"
                >
                  <option value={7}>7 days</option>
                  <option value={30}>30 days</option>
                  <option value={90}>90 days</option>
                </select>
              </div>
            </div>

            {isLoadingMerchants ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading merchant data...</p>
            ) : merchants.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--ink-border)">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Merchant ID</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Transactions</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Volume</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Success Rate</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Dispute Rate</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {merchants.map((merchant, idx) => (
                      <tr key={idx} className="border-b border-(--ink-border) hover:bg-(--surface-soft)">
                        <td className="px-3 py-2 text-xs font-mono text-(--ink-muted)">
                          {merchant.seller_id}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">
                          {merchant.total_transactions}
                        </td>
                        <td className="px-3 py-2 text-right text-foreground">
                          ₦{(merchant.total_volume / 1000).toFixed(0)}K
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${
                          merchant.success_rate >= 90 ? "text-(--success)" : "text-(--ink-muted)"
                        }`}>
                          {merchant.success_rate.toFixed(1)}%
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${
                          merchant.dispute_rate <= 5 ? "text-(--success)" : merchant.dispute_rate <= 10 ? "text-(--warn)" : "text-(--danger)"
                        }`}>
                          {merchant.dispute_rate.toFixed(1)}%
                        </td>
                        <td className={`px-3 py-2 text-right font-semibold ${
                          merchant.seller_risk_score <= 30 ? "text-(--success)" : merchant.seller_risk_score <= 50 ? "text-(--warn)" : "text-(--danger)"
                        }`}>
                          {merchant.seller_risk_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">
                No merchant data available
              </p>
            )}
          </div>
        </section>
      )}

      {/* Custom Reports Tab */}
      {activeTab === "custom" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Custom Reports</h2>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Configure, schedule, and manage custom reports tailored to your needs.
            </p>

            <div className="mt-6 rounded-lg border border-(--ink-border) p-4 text-center">
              <p className="text-sm text-(--ink-muted)">
                Report scheduling and customization coming soon.
              </p>
              <p className="mt-2 text-xs text-(--ink-soft)">
                Configure automated reports and distribution lists to stakeholders
              </p>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
