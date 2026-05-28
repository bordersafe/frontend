"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type SecurityEvent = {
  event_id: string;
  event_type: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  description: string;
  source_ip: string;
  user_id?: string;
  timestamp: string;
  resolved: boolean;
};

type PerformanceMetrics = {
  period_hours: number;
  total_requests: number;
  avg_response_time_ms: number;
  min_response_time_ms: number;
  max_response_time_ms: number;
  p95_response_time_ms: number;
  p99_response_time_ms: number;
  status_code_distribution: Record<string, number>;
  endpoint_request_counts: Record<string, number>;
};

type TabType = "events" | "performance" | "ip-check" | "metrics";

export default function SecurityPage() {
  const { user, profile, isAuthLoading, get, patch, put } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const isSuperAdmin = profile?.roles?.includes("super_admin");

  const [activeTab, setActiveTab] = useState<TabType>("events");
  const [error, setError] = useState<UiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Events tab
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [eventHours, setEventHours] = useState(24);
  const [eventSeverity, setEventSeverity] = useState<"" | "INFO" | "WARNING" | "CRITICAL">("");

  // Performance tab
  const [performance, setPerformance] = useState<PerformanceMetrics | null>(null);
  const [isLoadingPerformance, setIsLoadingPerformance] = useState(false);
  const [perfHours, setPerfHours] = useState(24);

  // IP Check tab
  const [ipAddress, setIpAddress] = useState("");
  const [ipCheckResult, setIpCheckResult] = useState<any>(null);
  const [isCheckingIp, setIsCheckingIp] = useState(false);

  // Load security events
  const loadSecurityEvents = useCallback(async () => {
    setIsLoadingEvents(true);
    setError(null);

    try {
      const url = `/api/admin/security/events?hours=${eventHours}&limit=100${eventSeverity ? `&severity=${eventSeverity}` : ""}`;
      const response = await get<any>(url);
      setEvents(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingEvents(false);
    }
  }, [get, eventHours, eventSeverity]);

  // Load performance metrics
  const loadPerformanceMetrics = useCallback(async () => {
    setIsLoadingPerformance(true);
    setError(null);

    try {
      const response = await get<PerformanceMetrics>(`/api/admin/security/performance-metrics?hours=${perfHours}`);
      setPerformance(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingPerformance(false);
    }
  }, [get, perfHours]);

  // Check IP
  const checkIp = async () => {
    if (!ipAddress) {
      setError({
        kind: "VALIDATION",
        title: "Error",
        message: "Please enter an IP address",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsCheckingIp(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/security/ip-check/${ipAddress}`);
      setIpCheckResult(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsCheckingIp(false);
    }
  };

  // Resolve event
  const resolveEvent = async (eventId: string) => {
    try {
      await patch(`/api/admin/security/events/${eventId}/resolve`, {});
      await loadSecurityEvents();
      setSuccess("Event resolved");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "events") {
      loadSecurityEvents();
    }
  }, [activeTab, loadSecurityEvents]);

  useEffect(() => {
    if (activeTab === "performance") {
      loadPerformanceMetrics();
    }
  }, [activeTab, loadPerformanceMetrics]);

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
            You don't have permission to access security features.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Security & Performance</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Monitor security events, performance metrics, and IP reputation.
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
            activeTab === "events"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("events")}
          type="button"
        >
          Security Events
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "performance"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("performance")}
          type="button"
        >
          Performance
        </button>
        {isSuperAdmin && (
          <button
            className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "ip-check"
                ? "border-b-2 border-(--action) text-(--action)"
                : "text-(--ink-muted) hover:text-foreground"
            }`}
            onClick={() => setActiveTab("ip-check")}
            type="button"
          >
            IP Check
          </button>
        )}
      </div>

      {/* Security Events Tab */}
      {activeTab === "events" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Security Events</h2>
              <div className="flex gap-2">
                <select
                  className="select-field text-xs"
                  value={eventHours}
                  onChange={(e) => setEventHours(parseInt(e.target.value))}
                  aria-label="Event hours"
                >
                  <option value={1}>Last 1 hour</option>
                  <option value={6}>Last 6 hours</option>
                  <option value={24}>Last 24 hours</option>
                  <option value={72}>Last 72 hours</option>
                </select>

                <select
                  className="select-field text-xs"
                  value={eventSeverity}
                  onChange={(e) => setEventSeverity(e.target.value as any)}
                  aria-label="Event severity"
                >
                  <option value="">All severities</option>
                  <option value="INFO">Info</option>
                  <option value="WARNING">Warning</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            {isLoadingEvents ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading events...</p>
            ) : events.length > 0 ? (
              <div className="mt-6 space-y-3">
                {events.map((event) => (
                  <div
                    key={event.event_id}
                    className={`rounded-lg p-4 ${
                      event.severity === "CRITICAL"
                        ? "bg-(--danger-soft)"
                        : event.severity === "WARNING"
                        ? "bg-(--warn-soft)"
                        : "bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          event.severity === "CRITICAL" || event.severity === "WARNING"
                            ? "text-(--danger)"
                            : "text-foreground"
                        }`}>
                          {event.description}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          {event.event_type} • {new Date(event.timestamp).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs font-mono text-(--ink-muted)">{event.source_ip}</p>
                      </div>
                      <div className="flex gap-2">
                        <span className={`rounded px-2 py-1 text-xs font-semibold ${
                          event.severity === "CRITICAL"
                            ? "bg-(--danger) text-(--danger-ink)"
                            : event.severity === "WARNING"
                            ? "bg-(--warn) text-(--warn-ink)"
                            : "bg-(--ink-soft) text-foreground"
                        }`}>
                          {event.severity}
                        </span>
                        {!event.resolved && (
                          <button
                            className="btn-secondary text-xs px-2 py-1"
                            onClick={() => resolveEvent(event.event_id)}
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
              <p className="mt-6 text-center text-sm text-(--success)">✓ No security events</p>
            )}
          </div>
        </section>
      )}

      {/* Performance Tab */}
      {activeTab === "performance" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Performance Metrics</h2>
              <select
                className="select-field text-sm"
                value={perfHours}
                onChange={(e) => setPerfHours(parseInt(e.target.value))}
                aria-label="Performance period"
              >
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
                <option value={72}>Last 72 hours</option>
              </select>
            </div>

            {isLoadingPerformance ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading metrics...</p>
            ) : performance ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Total Requests
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {performance.total_requests}
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Avg Response
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(performance.avg_response_time_ms)}ms
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      P95 Response
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(performance.p95_response_time_ms)}ms
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      P99 Response
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(performance.p99_response_time_ms)}ms
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                      Max Response
                    </p>
                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(performance.max_response_time_ms)}ms
                    </p>
                  </div>
                </div>

                {Object.keys(performance.status_code_distribution).length > 0 && (
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="font-semibold text-foreground">Status Code Distribution</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.entries(performance.status_code_distribution).map(([code, count]) => (
                        <div key={code} className="flex justify-between text-sm">
                          <span className="text-(--ink-muted)">HTTP {code}</span>
                          <span className="font-semibold text-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* IP Check Tab */}
      {activeTab === "ip-check" && isSuperAdmin && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">IP Reputation Check</h2>

            <div className="mt-6 flex gap-2">
              <input
                className="input-field flex-1"
                type="text"
                placeholder="Enter IP address"
                aria-label="IP address to check"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
              />
              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={checkIp}
                disabled={isCheckingIp}
                type="button"
              >
                {isCheckingIp ? "Checking..." : "Check"}
              </button>
            </div>

            {ipCheckResult && (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="font-semibold text-foreground">Reputation</p>
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-(--ink-muted)">IP Address</span>
                      <span className="font-mono text-foreground">{ipCheckResult.reputation.ip_address}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-(--ink-muted)">Score</span>
                      <span className={`font-semibold ${
                        ipCheckResult.reputation.reputation_score > 70
                          ? "text-(--danger)"
                          : ipCheckResult.reputation.reputation_score > 30
                          ? "text-(--warn)"
                          : "text-(--success)"
                      }`}>
                        {ipCheckResult.reputation.reputation_score}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-(--ink-muted)">Threat Level</span>
                      <span className="font-semibold text-foreground">
                        {ipCheckResult.reputation.threat_level}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-(--ink-muted)">Blocklisted</span>
                      <span className={`font-semibold ${
                        ipCheckResult.reputation.is_blocklisted ? "text-(--danger)" : "text-(--success)"
                      }`}>
                        {ipCheckResult.reputation.is_blocklisted ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                {ipCheckResult.suspicious_activity && (
                  <div className={`rounded-lg p-4 ${
                    ipCheckResult.suspicious_activity.is_suspicious
                      ? "bg-(--danger-soft)"
                      : "bg-(--success-soft)"
                  }`}>
                    <p className={`font-semibold ${
                      ipCheckResult.suspicious_activity.is_suspicious
                        ? "text-(--danger)"
                        : "text-(--success)"
                    }`}>
                      {ipCheckResult.suspicious_activity.is_suspicious ? "⚠ Suspicious Activity Detected" : "✓ No Suspicious Activity"}
                    </p>
                    <div className="mt-2 space-y-1 text-xs">
                      <p className="text-(--ink-muted)">
                        Total Events: {ipCheckResult.suspicious_activity.total_events}
                      </p>
                      <p className="text-(--ink-muted)">
                        Critical Events: {ipCheckResult.suspicious_activity.critical_count}
                      </p>
                      <p className="text-(--ink-muted)">
                        Warning Events: {ipCheckResult.suspicious_activity.warning_count}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
