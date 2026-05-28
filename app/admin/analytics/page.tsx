"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type MetricsData = {
  total_cases: number;
  resolved_cases: number;
  pending_cases: number;
  avg_resolution_time_hours: number;
  avg_queue_wait_time_hours: number;
  approval_rate_percent: number;
  refund_rate_percent: number;
  sla_attainment_percent: number;
  fraud_detection_rate_percent: number;
  appeal_rate_percent: number;
};

type AdminStats = {
  admin_id: string;
  cases_resolved: number;
  avg_resolution_time_hours: number;
  sla_attainment_percent: number;
};

type HighRiskData = {
  high_fraud_escrows: number;
  high_fraud_amount: number;
  high_risk_sellers: number;
  appealed_count: number;
  disputed_count: number;
  avg_dispute_amount: number;
};

type TrendData = {
  metric: string;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  data_points: Array<{
    date: string;
    value: number;
    change_percent?: number;
  }>;
};

export default function AnalyticsDashboardPage() {
  const { user, profile, isAuthLoading, get } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [error, setError] = useState<UiError | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [topAdmins, setTopAdmins] = useState<AdminStats[]>([]);
  const [highRisk, setHighRisk] = useState<HighRiskData | null>(null);
  const [trendMetric, setTrendMetric] = useState<"approval_rate" | "sla_attainment" | "resolution_time">("approval_rate");
  const [trendPeriod, setTrendPeriod] = useState<"DAILY" | "WEEKLY" | "MONTHLY">("DAILY");
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [exportingType, setExportingType] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<"CSV" | "JSON">("CSV");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingTrends, setIsLoadingTrends] = useState(false);

  // Load all data
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [metricsRes, adminsRes, riskRes] = await Promise.all([
        get<MetricsData>("/api/admin/analytics/metrics"),
        get<any>("/api/admin/analytics/top-admins?metric=CASES_RESOLVED&limit=5"),
        get<HighRiskData>("/api/admin/analytics/high-risk"),
      ]);

      setMetrics(metricsRes);
      setTopAdmins(adminsRes.items || []);
      setHighRisk(riskRes);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  // Load trend data
  const loadTrendData = useCallback(async () => {
    setIsLoadingTrends(true);

    try {
      const metricMap = {
        approval_rate: "approval_rate_percent",
        sla_attainment: "sla_attainment_percent",
        resolution_time: "avg_resolution_time_hours",
      };

      const response = await get<TrendData>(
        `/api/admin/analytics/trends/${metricMap[trendMetric]}?period=${trendPeriod}&days=30`
      );
      setTrendData(response);
    } catch (err) {
      console.error("Failed to load trend data:", err);
    } finally {
      setIsLoadingTrends(false);
    }
  }, [get, trendMetric, trendPeriod]);

  // Export analytics
  const exportData = async (type: "ESCROWS" | "METRICS" | "ADMINS") => {
    setExportingType(type);

    try {
      const url = `/api/admin/analytics/export?type=${type}&format=${exportFormat}&days=30`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${await user?.getIdToken()}`,
        },
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `analytics_${type}_${Date.now()}.${exportFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setExportingType(null);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    loadTrendData();
  }, [loadTrendData]);

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
            You don't have permission to access analytics.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Analytics Dashboard</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Comprehensive performance metrics and insights for the admin ecosystem.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {isLoading ? (
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading dashboard data...
        </section>
      ) : (
        <>
          {/* Key Metrics */}
          {metrics && (
            <section className="panel p-6">
              <h2 className="heading-2">Key Performance Metrics</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">{metrics.total_cases}</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">
                    {metrics.resolved_cases} resolved, {metrics.pending_cases} pending
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">{metrics.avg_resolution_time_hours}h</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">
                    Queue: {metrics.avg_queue_wait_time_hours}h
                  </p>
                </div>

                <div className="rounded-lg bg-(--success-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--success)">SLA Attainment</p>
                  <p className="mt-2 text-3xl font-bold text-(--success)">{metrics.sla_attainment_percent}%</p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">{metrics.approval_rate_percent}%</p>
                </div>

                <div className="rounded-lg bg-(--danger-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--danger)">Fraud Detection</p>
                  <p className="mt-2 text-3xl font-bold text-(--danger)">{metrics.fraud_detection_rate_percent}%</p>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-2xl font-bold text-foreground">{metrics.refund_rate_percent}%</p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-2xl font-bold text-foreground">{metrics.appeal_rate_percent}%</p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-2xl font-bold text-foreground">
                    {metrics.total_cases > 0 ? Math.round((metrics.resolved_cases / metrics.total_cases) * 100) : 0}%
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Trend Chart */}
          <section className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Trend Analysis</h2>
              <div className="flex gap-2">
                <select
                  className="select-field text-xs"
                  value={trendMetric}
                  onChange={(e) => setTrendMetric(e.target.value as any)}
                  aria-label="Select metric for trend analysis"
                >
                  <option value="approval_rate">Approval Rate</option>
                  <option value="sla_attainment">SLA Attainment</option>
                  <option value="resolution_time">Resolution Time</option>
                </select>

                <select
                  className="select-field text-xs"
                  value={trendPeriod}
                  onChange={(e) => setTrendPeriod(e.target.value as any)}
                  aria-label="Select trend period"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
            </div>

            {isLoadingTrends ? (
              <p className="mt-4 text-center text-sm text-(--ink-muted)">Loading trend data...</p>
            ) : trendData ? (
              <div className="mt-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-(--ink-border)">
                        <th className="px-3 py-2 text-left font-semibold text-foreground">Period</th>
                        <th className="px-3 py-2 text-right font-semibold text-foreground">Value</th>
                        <th className="px-3 py-2 text-right font-semibold text-foreground">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trendData.data_points.map((point, idx) => (
                        <tr key={idx} className="border-b border-(--ink-border)">
                          <td className="px-3 py-2 text-(--ink-muted)">{point.date}</td>
                          <td className="px-3 py-2 text-right font-semibold text-foreground">
                            {point.value}
                          </td>
                          <td
                            className={`px-3 py-2 text-right font-semibold ${
                              point.change_percent && point.change_percent > 0
                                ? "text-(--success)"
                                : "text-(--danger)"
                            }`}
                          >
                            {point.change_percent ? `${point.change_percent > 0 ? "+" : ""}${point.change_percent}%` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>

          {/* Top Admins */}
          {topAdmins.length > 0 && (
            <section className="panel p-6">
              <h2 className="heading-2">Top Performing Admins (Last 7 Days)</h2>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--ink-border)">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Admin ID</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Cases Resolved</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Avg Resolution</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">SLA Attainment</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topAdmins.map((admin, idx) => (
                      <tr key={idx} className="border-b border-(--ink-border) hover:bg-(--surface-soft)">
                        <td className="px-3 py-2 text-(--ink-muted) font-mono text-xs">{admin.admin_id}</td>
                        <td className="px-3 py-2 text-right font-semibold text-foreground">
                          {admin.cases_resolved}
                        </td>
                        <td className="px-3 py-2 text-right text-(--ink-muted)">
                          {admin.avg_resolution_time_hours}h
                        </td>
                        <td
                          className={`px-3 py-2 text-right font-semibold ${
                            admin.sla_attainment_percent >= 90 ? "text-(--success)" : "text-(--ink-muted)"
                          }`}
                        >
                          {admin.sla_attainment_percent}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* High Risk Summary */}
          {highRisk && (
            <section className="panel p-6">
              <h2 className="heading-2">High-Risk Transactions Summary</h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg bg-(--danger-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--danger)">High Fraud Escrows</p>
                  <p className="mt-2 text-3xl font-bold text-(--danger)">{highRisk.high_fraud_escrows}</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">
                    ₦{(highRisk.high_fraud_amount / 1000000).toFixed(2)}M total
                  </p>
                </div>

                <div className="rounded-lg bg-(--warn-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--warn)">High-Risk Sellers</p>
                  <p className="mt-2 text-3xl font-bold text-(--warn)">{highRisk.high_risk_sellers}</p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">{highRisk.appealed_count}</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">
                    {highRisk.disputed_count} disputed
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">
                    ₦{(highRisk.avg_dispute_amount / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Export Section */}
          <section className="panel p-6">
            <h2 className="heading-2">Data Export</h2>

            <div className="mt-4 flex gap-2">
              <select
                className="select-field text-sm"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                aria-label="Select export format"
              >
                <option value="CSV">CSV Format</option>
                <option value="JSON">JSON Format</option>
              </select>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <button
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-60"
                onClick={() => exportData("ESCROWS")}
                disabled={exportingType !== null}
                type="button"
              >
                {exportingType === "ESCROWS" ? "Exporting..." : "Export Escrows"}
              </button>
              <button
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-60"
                onClick={() => exportData("METRICS")}
                disabled={exportingType !== null}
                type="button"
              >
                {exportingType === "METRICS" ? "Exporting..." : "Export Metrics"}
              </button>
              <button
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-60"
                onClick={() => exportData("ADMINS")}
                disabled={exportingType !== null}
                type="button"
              >
                {exportingType === "ADMINS" ? "Exporting..." : "Export Admin Stats"}
              </button>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
