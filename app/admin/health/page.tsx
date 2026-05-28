"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type ServiceHealth = {
  service_id: string;
  service_name: string;
  status: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  response_time_ms: number;
  last_check: string;
  error_message?: string;
  check_count: number;
  success_count: number;
  failure_count: number;
};

type SystemMetrics = {
  metrics_id: string;
  timestamp: string;
  cpu_usage_percent: number;
  memory_usage_percent: number;
  disk_usage_percent: number;
  uptime_seconds: number;
  open_connections: number;
  pending_tasks: number;
};

type Alert = {
  alert_id: string;
  rule_id: string;
  service_name: string;
  alert_type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  message: string;
  triggered_at: string;
  resolved_at?: string;
};

type TabType = "overview" | "services" | "metrics" | "alerts" | "rules";

export default function HealthPage() {
  const { user, profile, isAuthLoading, get, post, patch, put } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const isSuperAdmin = profile?.roles?.includes("super_admin");

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [error, setError] = useState<UiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Overview data
  const [summary, setSummary] = useState<any>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Services data
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  // Metrics data
  const [metrics, setMetrics] = useState<SystemMetrics[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsHours, setMetricsHours] = useState(24);

  // Alerts data
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(false);
  const [alertsHours, setAlertsHours] = useState(24);

  // Load health summary
  const loadSummary = useCallback(async () => {
    setIsLoadingSummary(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/health/summary");
      setSummary(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingSummary(false);
    }
  }, [get]);

  // Load services
  const loadServices = useCallback(async () => {
    setIsLoadingServices(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/health/services");
      setServices(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingServices(false);
    }
  }, [get]);

  // Load metrics
  const loadMetrics = useCallback(async () => {
    setIsLoadingMetrics(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/health/metrics?hours=${metricsHours}`);
      setMetrics(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingMetrics(false);
    }
  }, [get, metricsHours]);

  // Load alerts
  const loadAlerts = useCallback(async () => {
    setIsLoadingAlerts(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/health/alerts?hours=${alertsHours}&limit=100`);
      setAlerts(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingAlerts(false);
    }
  }, [get, alertsHours]);

  // Check database health
  const checkDatabaseHealth = async () => {
    try {
      await post("/api/admin/health/check-database", {});
      await loadServices();
      setSuccess("Database health check complete");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Resolve alert
  const resolveAlert = async (alertId: string) => {
    try {
      await patch(`/api/admin/health/alerts/${alertId}/resolve`, {});
      await loadAlerts();
      setSuccess("Alert resolved");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "overview") {
      loadSummary();
    }
  }, [activeTab, loadSummary]);

  useEffect(() => {
    if (activeTab === "services") {
      loadServices();
    }
  }, [activeTab, loadServices]);

  useEffect(() => {
    if (activeTab === "metrics") {
      loadMetrics();
    }
  }, [activeTab, loadMetrics]);

  useEffect(() => {
    if (activeTab === "alerts") {
      loadAlerts();
    }
  }, [activeTab, loadAlerts]);

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
            You don't have permission to access health monitoring.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">System Health & Monitoring</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Monitor service health, system metrics, and system alerts.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {success && (
        <section className="panel-outline p-5 text-sm bg-(--success-soft)">
          <p className="font-semibold text-(--success)">{success}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border) overflow-x-auto">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "overview"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("overview")}
          type="button"
        >
          Overview
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "services"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("services")}
          type="button"
        >
          Services
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "metrics"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("metrics")}
          type="button"
        >
          System Metrics
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "alerts"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("alerts")}
          type="button"
        >
          Alerts
        </button>
        {isSuperAdmin && (
          <button
            className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "rules"
                ? "border-b-2 border-(--action) text-(--action)"
                : "text-(--ink-muted) hover:text-foreground"
            }`}
            onClick={() => setActiveTab("rules")}
            type="button"
          >
            Alert Rules
          </button>
        )}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <section className="space-y-6">
          {isLoadingSummary ? (
            <div className="panel p-6 text-center text-sm text-(--ink-muted)">
              Loading health summary...
            </div>
          ) : summary ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className={`rounded-lg p-4 ${
                  summary.summary.overall_health === "HEALTHY"
                    ? "bg-(--success-soft)"
                    : "bg-(--warn-soft)"
                }`}>
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Overall Status
                  </p>
                  <p className={`mt-2 text-2xl font-bold ${
                    summary.summary.overall_health === "HEALTHY"
                      ? "text-(--success)"
                      : "text-(--warn)"
                  }`}>
                    {summary.summary.overall_health}
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Total Services
                  </p>
                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {summary.summary.total_services}
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Healthy
                  </p>
                  <p className="mt-2 text-3xl font-bold text-(--success)">
                    {summary.summary.healthy_services}
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Degraded
                  </p>
                  <p className="mt-2 text-3xl font-bold text-(--warn)">
                    {summary.summary.degraded_services}
                  </p>
                </div>

                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Unhealthy
                  </p>
                  <p className="mt-2 text-3xl font-bold text-(--danger)">
                    {summary.summary.unhealthy_services}
                  </p>
                </div>
              </div>

              {summary.alerts && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-sm font-semibold text-foreground">Recent Alerts</p>
                    <p className="mt-2 text-2xl font-bold text-foreground">
                      {summary.alerts.recent_count}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-sm font-semibold text-foreground">Unresolved</p>
                    <p className="mt-2 text-2xl font-bold text-(--warn)">
                      {summary.alerts.unresolved_count}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-sm font-semibold text-foreground">Critical</p>
                    <p className="mt-2 text-2xl font-bold text-(--danger)">
                      {summary.alerts.critical_count}
                    </p>
                  </div>
                </div>
              )}

              {summary.latest_metrics && (
                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="font-semibold text-foreground">Latest System Metrics</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-sm">
                      <p className="text-(--ink-soft)">CPU Usage</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {Math.round(summary.latest_metrics.cpu_usage_percent)}%
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-(--ink-soft)">Memory Usage</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {Math.round(summary.latest_metrics.memory_usage_percent)}%
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-(--ink-soft)">Disk Usage</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {Math.round(summary.latest_metrics.disk_usage_percent)}%
                      </p>
                    </div>
                    <div className="text-sm">
                      <p className="text-(--ink-soft)">Open Connections</p>
                      <p className="mt-1 text-lg font-bold text-foreground">
                        {summary.latest_metrics.open_connections}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </section>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Service Health Status</h2>
              <button
                className="btn-secondary text-sm px-3 py-2"
                onClick={checkDatabaseHealth}
                type="button"
              >
                Check DB Now
              </button>
            </div>

            {isLoadingServices ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading services...</p>
            ) : services.length > 0 ? (
              <div className="mt-6 space-y-3">
                {services.map((service) => (
                  <div
                    key={service.service_id}
                    className={`rounded-lg p-4 ${
                      service.status === "HEALTHY"
                        ? "bg-(--success-soft)"
                        : service.status === "DEGRADED"
                        ? "bg-(--warn-soft)"
                        : "bg-(--danger-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{service.service_name}</p>
                        <p className="mt-1 text-xs text-(--ink-muted)">
                          Response: {Math.round(service.response_time_ms)}ms • Checks: {service.check_count}
                        </p>
                        <p className="text-xs text-(--ink-soft)">
                          Last check: {new Date(service.last_check).toLocaleString()}
                        </p>
                        {service.error_message && (
                          <p className="mt-1 text-xs text-(--danger)">{service.error_message}</p>
                        )}
                      </div>
                      <span className={`rounded px-3 py-1 text-xs font-semibold ${
                        service.status === "HEALTHY"
                          ? "bg-(--success) text-(--success-ink)"
                          : service.status === "DEGRADED"
                          ? "bg-(--warn) text-(--warn-ink)"
                          : "bg-(--danger) text-(--danger-ink)"
                      }`}>
                        {service.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No services recorded</p>
            )}
          </div>
        </section>
      )}

      {/* Metrics Tab */}
      {activeTab === "metrics" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">System Metrics</h2>
              <select
                className="select-field text-sm"
                value={metricsHours}
                onChange={(e) => setMetricsHours(parseInt(e.target.value))}
                aria-label="Metrics time period"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={72}>Last 72 hours</option>
              </select>
            </div>

            {isLoadingMetrics ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading metrics...</p>
            ) : metrics.length > 0 ? (
              <div className="mt-6 space-y-4">
                {metrics.slice(0, 10).map((metric) => (
                  <div key={metric.metrics_id} className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs text-(--ink-muted) font-mono">
                      {new Date(metric.timestamp).toLocaleString()}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">CPU</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {Math.round(metric.cpu_usage_percent)}%
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">Memory</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {Math.round(metric.memory_usage_percent)}%
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">Disk</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {Math.round(metric.disk_usage_percent)}%
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">Uptime</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {Math.round(metric.uptime_seconds / 3600)}h
                        </p>
                      </div>
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">Connections</p>
                        <p className="mt-1 font-semibold text-foreground">{metric.open_connections}</p>
                      </div>
                      <div className="text-sm">
                        <p className="text-(--ink-soft)">Tasks</p>
                        <p className="mt-1 font-semibold text-foreground">{metric.pending_tasks}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No metrics available</p>
            )}
          </div>
        </section>
      )}

      {/* Alerts Tab */}
      {activeTab === "alerts" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">System Alerts</h2>
              <select
                className="select-field text-sm"
                value={alertsHours}
                onChange={(e) => setAlertsHours(parseInt(e.target.value))}
                aria-label="Alerts time period"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={72}>Last 72 hours</option>
              </select>
            </div>

            {isLoadingAlerts ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading alerts...</p>
            ) : alerts.length > 0 ? (
              <div className="mt-6 space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.alert_id}
                    className={`rounded-lg p-4 ${
                      alert.severity === "CRITICAL"
                        ? "bg-(--danger-soft)"
                        : alert.severity === "WARNING"
                        ? "bg-(--warn-soft)"
                        : "bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          alert.severity === "CRITICAL" || alert.severity === "WARNING"
                            ? "text-(--danger)"
                            : "text-foreground"
                        }`}>
                          {alert.message}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-muted)">
                          {alert.service_name} • {alert.alert_type}
                        </p>
                        <p className="text-xs text-(--ink-soft)">
                          {new Date(alert.triggered_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`rounded px-2 py-1 text-xs font-semibold ${
                          alert.severity === "CRITICAL"
                            ? "bg-(--danger) text-(--danger-ink)"
                            : alert.severity === "WARNING"
                            ? "bg-(--warn) text-(--warn-ink)"
                            : "bg-(--ink-soft) text-foreground"
                        }`}>
                          {alert.severity}
                        </span>
                        {!alert.resolved_at && (
                          <button
                            className="btn-secondary text-xs px-2 py-1"
                            onClick={() => resolveAlert(alert.alert_id)}
                            type="button"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--success)">✓ No alerts</p>
            )}
          </div>
        </section>
      )}

      {/* Alert Rules Tab */}
      {activeTab === "rules" && isSuperAdmin && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Alert Rules (Super Admin Only)</h2>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Configure alert rules for automated monitoring and notifications.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
