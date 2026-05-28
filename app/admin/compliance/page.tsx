"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type TabType = "policies" | "violations" | "audit" | "reports";

type CompliancePolicy = {
  policy_id: string;
  policy_name: string;
  policy_type: string;
  description: string;
  rules: any[];
  enabled: boolean;
};

type Violation = {
  violation_id: string;
  policy_id: string;
  entity_type: string;
  entity_id: string;
  severity: "WARNING" | "VIOLATION" | "CRITICAL";
  description: string;
  detected_at: string;
  resolved_at?: string;
};

type AuditLog = {
  audit_id: string;
  timestamp: string;
  actor_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: string;
};

export default function CompliancePage() {
  const { user, profile, isAuthLoading, get } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("policies");
  const [error, setError] = useState<UiError | null>(null);

  // Policies tab
  const [policies, setPolicies] = useState<CompliancePolicy[]>([]);
  const [isLoadingPolicies, setIsLoadingPolicies] = useState(false);

  // Violations tab
  const [violations, setViolations] = useState<Violation[]>([]);
  const [isLoadingViolations, setIsLoadingViolations] = useState(false);
  const [entityTypeFilter, setEntityTypeFilter] = useState("USER");
  const [entityIdFilter, setEntityIdFilter] = useState("");
  const [showResolvedFilter, setShowResolvedFilter] = useState(false);

  // Audit tab
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);
  const [auditLimit, setAuditLimit] = useState(100);

  // Reports tab
  const [reportType, setReportType] = useState<"VIOLATIONS" | "AUDIT_TRAIL" | "POLICY_SUMMARY">("VIOLATIONS");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Load policies
  const loadPolicies = useCallback(async () => {
    setIsLoadingPolicies(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/compliance/policies");
      setPolicies(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingPolicies(false);
    }
  }, [get]);

  // Load violations
  const loadViolations = async () => {
    if (!entityIdFilter) {
      setError({
        kind: "VALIDATION",
        title: "Error",
        message: "Please enter an entity ID",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsLoadingViolations(true);
    setError(null);

    try {
      const url = `/api/admin/compliance/violations?entity_type=${entityTypeFilter}&entity_id=${entityIdFilter}&resolved=${showResolvedFilter}`;
      const response = await get<any>(url);
      setViolations(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingViolations(false);
    }
  };

  // Load audit logs
  const loadAuditLogs = useCallback(async () => {
    setIsLoadingAudit(true);
    setError(null);

    try {
      const url = `/api/admin/compliance/audit-logs?limit=${auditLimit}`;
      const response = await get<any>(url);
      setAuditLogs(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingAudit(false);
    }
  }, [get, auditLimit]);

  // Generate report
  const generateReport = async () => {
    setIsGeneratingReport(true);
    setError(null);

    try {
      const url = `/api/admin/compliance/reports/${reportType}?days=30`;
      const response = await get<any>(url);
      setReportData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Export audit trail
  const exportAuditTrail = async () => {
    try {
      const url = `/api/admin/compliance/audit-export?days=30`;
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
      link.download = `audit_trail_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "policies") {
      loadPolicies();
    }
  }, [activeTab, loadPolicies]);

  useEffect(() => {
    if (activeTab === "audit") {
      loadAuditLogs();
    }
  }, [activeTab, loadAuditLogs]);

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
            You don't have permission to access compliance features.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Compliance & Audit</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Policy management, violation tracking, and audit trail.
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
            activeTab === "policies"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("policies")}
          type="button"
        >
          Policies
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "violations"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("violations")}
          type="button"
        >
          Violations
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "audit"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("audit")}
          type="button"
        >
          Audit Logs
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "reports"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("reports")}
          type="button"
        >
          Reports
        </button>
      </div>

      {/* Policies Tab */}
      {activeTab === "policies" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Compliance Policies</h2>

            {isLoadingPolicies ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading policies...</p>
            ) : policies.length > 0 ? (
              <div className="mt-6 space-y-3">
                {policies.map((policy) => (
                  <div key={policy.policy_id} className="rounded-lg border border-(--ink-border) p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{policy.policy_name}</p>
                        <p className="mt-1 text-xs text-(--ink-soft) uppercase tracking-wider">
                          {policy.policy_type}
                        </p>
                        <p className="mt-2 text-sm text-(--ink-muted)">{policy.description}</p>
                        <p className="mt-2 text-xs font-semibold text-foreground">
                          {policy.rules?.length || 0} rules
                        </p>
                      </div>
                      <span className={`rounded px-3 py-1 text-xs font-semibold ${
                        policy.enabled
                          ? "bg-(--success-soft) text-(--success)"
                          : "bg-(--surface-soft) text-(--ink-muted)"
                      }`}>
                        {policy.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">
                No compliance policies configured
              </p>
            )}
          </div>
        </section>
      )}

      {/* Violations Tab */}
      {activeTab === "violations" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Violations Tracker</h2>

            <div className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground">Entity Type</label>
                  <select
                    className="select-field mt-2 text-sm"
                    value={entityTypeFilter}
                    onChange={(e) => setEntityTypeFilter(e.target.value)}
                    aria-label="Entity type filter"
                  >
                    <option value="USER">User</option>
                    <option value="TRANSACTION">Transaction</option>
                    <option value="MERCHANT">Merchant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground">Entity ID</label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="text"
                    placeholder="Enter entity ID"
                    aria-label="Entity ID for violation search"
                    value={entityIdFilter}
                    onChange={(e) => setEntityIdFilter(e.target.value)}
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <button
                    className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                    onClick={loadViolations}
                    disabled={isLoadingViolations}
                    type="button"
                  >
                    {isLoadingViolations ? "Searching..." : "Search"}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  className="w-4 h-4 rounded"
                  type="checkbox"
                  checked={showResolvedFilter}
                  onChange={(e) => setShowResolvedFilter(e.target.checked)}
                  aria-label="Show resolved violations"
                />
                <label className="text-sm text-foreground">Show resolved violations</label>
              </div>
            </div>

            {violations.length > 0 && (
              <div className="mt-6 space-y-3">
                {violations.map((violation) => (
                  <div
                    key={violation.violation_id}
                    className={`rounded-lg p-4 ${
                      violation.severity === "CRITICAL"
                        ? "bg-(--danger-soft)"
                        : violation.severity === "VIOLATION"
                        ? "bg-(--warn-soft)"
                        : "bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className={`font-semibold ${
                          violation.severity === "CRITICAL" || violation.severity === "VIOLATION"
                            ? "text-(--danger)"
                            : "text-foreground"
                        }`}>
                          {violation.description}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Entity: {violation.entity_type} {violation.entity_id}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Detected: {new Date(violation.detected_at).toLocaleDateString()}
                        </p>
                        {violation.resolved_at && (
                          <p className="mt-1 text-xs font-semibold text-(--success)">
                            ✓ Resolved: {new Date(violation.resolved_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${
                        violation.severity === "CRITICAL"
                          ? "bg-(--danger) text-(--danger-ink)"
                          : violation.severity === "VIOLATION"
                          ? "bg-(--warn) text-(--warn-ink)"
                          : "bg-(--ink-soft) text-foreground"
                      }`}>
                        {violation.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {entityIdFilter && violations.length === 0 && !isLoadingViolations && (
              <p className="mt-6 text-center text-sm text-(--success)">
                ✓ No violations found for this entity
              </p>
            )}
          </div>
        </section>
      )}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Audit Trail</h2>
              <button
                className="btn-secondary px-4 py-2 text-sm"
                onClick={exportAuditTrail}
                type="button"
              >
                Export CSV
              </button>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-foreground">
                Limit
              </label>
              <select
                className="select-field mt-2 text-sm w-32"
                value={auditLimit}
                onChange={(e) => setAuditLimit(parseInt(e.target.value))}
                aria-label="Audit log limit"
              >
                <option value={50}>Last 50</option>
                <option value={100}>Last 100</option>
                <option value={500}>Last 500</option>
              </select>
            </div>

            {isLoadingAudit ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading audit logs...</p>
            ) : auditLogs.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--ink-border)">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Timestamp</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Action</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Actor</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Resource</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.audit_id} className="border-b border-(--ink-border) hover:bg-(--surface-soft)">
                        <td className="px-3 py-2 text-xs text-(--ink-muted)">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-foreground">
                          {log.action}
                        </td>
                        <td className="px-3 py-2 text-xs text-(--ink-muted) font-mono">
                          {log.actor_id}
                        </td>
                        <td className="px-3 py-2 text-xs text-(--ink-muted)">
                          {log.resource_type} ({log.resource_id})
                        </td>
                        <td className={`px-3 py-2 text-xs font-semibold ${
                          log.status === "SUCCESS"
                            ? "text-(--success)"
                            : "text-(--danger)"
                        }`}>
                          {log.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">
                No audit logs found
              </p>
            )}
          </div>
        </section>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Compliance Reports</h2>

            <div className="mt-6 flex gap-2">
              <select
                className="select-field text-sm flex-1"
                value={reportType}
                onChange={(e) => setReportType(e.target.value as any)}
                aria-label="Report type"
              >
                <option value="VIOLATIONS">Violations Report</option>
                <option value="AUDIT_TRAIL">Audit Trail Report</option>
                <option value="POLICY_SUMMARY">Policy Summary</option>
              </select>

              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={generateReport}
                disabled={isGeneratingReport}
                type="button"
              >
                {isGeneratingReport ? "Generating..." : "Generate"}
              </button>
            </div>

            {reportData && (
              <div className="mt-6 space-y-6">
                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">
                    Generated
                  </p>
                  <p className="mt-2 text-sm text-foreground">
                    {new Date(reportData.generated_at).toLocaleString()}
                  </p>
                </div>

                {reportData.report_data?.summary && (
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="font-semibold text-foreground">Summary</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {Object.entries(reportData.report_data.summary).map(([key, value]: [string, any]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-(--ink-muted) capitalize">
                            {key.replace(/_/g, " ")}
                          </span>
                          <span className="font-semibold text-foreground">
                            {typeof value === "object" ? JSON.stringify(value) : value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportData.report_data?.violations && reportData.report_data.violations.length > 0 && (
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="font-semibold text-foreground">
                      Recent Violations ({reportData.report_data.violations.length})
                    </p>
                    <p className="mt-1 text-xs text-(--ink-muted)">
                      Showing first 5 violations
                    </p>
                    <div className="mt-3 space-y-2">
                      {reportData.report_data.violations.slice(0, 5).map((v: any, idx: number) => (
                        <div key={idx} className="text-xs text-(--ink-muted)">
                          • {v.description}
                        </div>
                      ))}
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
