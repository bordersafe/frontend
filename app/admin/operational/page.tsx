"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type BulkOperation = {
  id: string;
  operation_type: "BULK_APPROVE" | "BULK_REFUND" | "BULK_HOLD" | "BULK_RELEASE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED" | "PARTIALLY_COMPLETED";
  created_at: string;
  created_by: string;
  total_items: number;
  completed_items: number;
  failed_items: number;
  reason: string;
};

type TabType = "operations" | "reports" | "bulk-create";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-900",
    IN_PROGRESS: "bg-blue-100 text-blue-900",
    COMPLETED: "bg-green-100 text-green-900",
    FAILED: "bg-red-100 text-red-900",
    PARTIALLY_COMPLETED: "bg-orange-100 text-orange-900",
  };

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${colors[status] || "bg-gray-100"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function OperationTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    BULK_APPROVE: "Approve",
    BULK_REFUND: "Refund",
    BULK_HOLD: "Hold",
    BULK_RELEASE: "Release",
  };

  return <span className="font-semibold text-foreground">{labels[type] || type}</span>;
}

export default function OperationalToolingPage() {
  const { user, profile, isAuthLoading, get, post } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("operations");
  const [error, setError] = useState<UiError | null>(null);

  // Operations tab state
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [isLoadingOps, setIsLoadingOps] = useState(false);
  const [opsFilter, setOpsFilter] = useState<string>("all");

  // Reports tab state
  const [selectedReport, setSelectedReport] = useState<string>("ESCROWS");
  const [reportFormat, setReportFormat] = useState<"CSV" | "JSON" | "TSV">("CSV");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Bulk create tab state
  const [bulkType, setBulkType] = useState<"BULK_APPROVE" | "BULK_REFUND">("BULK_APPROVE");
  const [escrowIds, setEscrowIds] = useState("");
  const [bulkReason, setBulkReason] = useState("");
  const [isBulkCreating, setIsBulkCreating] = useState(false);

  // Fetch operations
  const fetchOperations = useCallback(async () => {
    setIsLoadingOps(true);
    setError(null);

    try {
      const statusParam = opsFilter === "all" ? "" : `?status=${opsFilter}`;
      const response = await get<any>(`/api/admin/operations${statusParam}`);
      setOperations(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingOps(false);
    }
  }, [get, opsFilter]);

  // Generate report
  const generateReport = async () => {
    setError(null);

    try {
      setIsGeneratingReport(true);

      const reportUrl = `/api/admin/reports/${selectedReport.toLowerCase().replace(/_/g, "-")}?format=${reportFormat}`;
      const response = await fetch(reportUrl, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${selectedReport}_report_${Date.now()}.${reportFormat.toLowerCase()}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Create bulk operation
  const createBulkOp = async () => {
    if (!escrowIds.trim() || !bulkReason.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing information",
        message: "Please enter escrow IDs and a reason.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setError(null);

    try {
      setIsBulkCreating(true);

      const ids = escrowIds
        .split("\n")
        .map((id) => id.trim())
        .filter((id) => id);

      if (ids.length === 0) {
        throw new Error("No valid escrow IDs provided");
      }

      if (bulkType === "BULK_APPROVE") {
        await post(`/api/admin/operations/bulk-approve`, {
          escrow_ids: ids,
          reason: bulkReason,
        });
      } else if (bulkType === "BULK_REFUND") {
        // For refunds, assume 50/50 split by default
        const refundItems = ids.map((id) => ({
          escrow_id: id,
          buyer_amount: 50,
          seller_amount: 50,
        }));

        await post(`/api/admin/operations/bulk-refund`, {
          refund_items: refundItems,
          reason: bulkReason,
        });
      }

      setEscrowIds("");
      setBulkReason("");
      setActiveTab("operations");
      await fetchOperations();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsBulkCreating(false);
    }
  };

  useEffect(() => {
    if (activeTab === "operations") {
      fetchOperations();
    }
  }, [activeTab, opsFilter, fetchOperations]);

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
            You don't have permission to access operational tooling.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Operational Tooling</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Manage bulk operations, generate reports, and automate administrative tasks.
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
            activeTab === "operations"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("operations")}
          type="button"
        >
          Operations
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
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "bulk-create"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("bulk-create")}
          type="button"
        >
          Create Bulk Op
        </button>
      </div>

      {/* Operations Tab */}
      {activeTab === "operations" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Bulk Operations</h2>
              <select
                className="select-field text-sm"
                value={opsFilter}
                onChange={(e) => setOpsFilter(e.target.value)}
                aria-label="Filter operations by status"
              >
                <option value="all">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {isLoadingOps ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading operations...</p>
            ) : operations.length === 0 ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No operations found</p>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--ink-border)">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Items</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Progress</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {operations.map((op) => (
                      <tr key={op.id} className="border-b border-(--ink-border-soft) hover:bg-(--surface-soft)">
                        <td className="px-4 py-3">
                          <OperationTypeLabel type={op.operation_type} />
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={op.status} />
                        </td>
                        <td className="px-4 py-3 text-sm">{op.total_items} items</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-20 rounded-full bg-(--surface-soft)">
                              <div
                                className="h-full rounded-full bg-(--action)"
                                style={{
                                  width: `${Math.round(
                                    ((op.completed_items + op.failed_items) / op.total_items) * 100
                                  )}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-(--ink-muted)">
                              {op.completed_items}/{op.total_items}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-(--ink-muted)">
                          {new Date(op.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Generate Reports</h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-foreground">Report Type</label>
                <select
                  className="select-field mt-2 text-sm"
                  value={selectedReport}
                  onChange={(e) => setSelectedReport(e.target.value)}
                  aria-label="Select report type"
                >
                  <option value="ESCROWS">Escrows</option>
                  <option value="APPEALS">Appeals</option>
                  <option value="SELLER_RISK">Seller Risk</option>
                  <option value="ADMIN_METRICS">Admin Metrics</option>
                  <option value="WATCHLIST">Watchlist</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground">Format</label>
                <select
                  className="select-field mt-2 text-sm"
                  value={reportFormat}
                  onChange={(e) => setReportFormat(e.target.value as any)}
                  aria-label="Select report format"
                >
                  <option value="CSV">CSV</option>
                  <option value="JSON">JSON</option>
                  <option value="TSV">TSV</option>
                </select>
              </div>
            </div>

            <button
              className="btn-primary mt-6 px-4 py-2 text-sm disabled:opacity-60"
              onClick={generateReport}
              disabled={isGeneratingReport}
              type="button"
            >
              {isGeneratingReport ? "Generating..." : "Download Report"}
            </button>
          </div>

          <div className="panel p-6">
            <h3 className="heading-3">Available Report Types</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-(--surface-soft) p-4">
                <p className="font-semibold text-foreground">Escrows Report</p>
                <p className="mt-1 text-sm text-(--ink-muted)">Complete escrow transaction data with statuses and amounts</p>
              </div>
              <div className="rounded-lg bg-(--surface-soft) p-4">
                <p className="font-semibold text-foreground">Appeals Report</p>
                <p className="mt-1 text-sm text-(--ink-muted)">Buyer appeal records with decisions and resolution status</p>
              </div>
              <div className="rounded-lg bg-(--surface-soft) p-4">
                <p className="font-semibold text-foreground">Seller Risk Report</p>
                <p className="mt-1 text-sm text-(--ink-muted)">Seller risk scorecards and active risk actions</p>
              </div>
              <div className="rounded-lg bg-(--surface-soft) p-4">
                <p className="font-semibold text-foreground">Admin Metrics Report</p>
                <p className="mt-1 text-sm text-(--ink-muted)">Admin SLA metrics and resolution timelines</p>
              </div>
              <div className="rounded-lg bg-(--surface-soft) p-4">
                <p className="font-semibold text-foreground">Watchlist Report</p>
                <p className="mt-1 text-sm text-(--ink-muted)">Fraud watchlist entries and monitoring status</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bulk Create Tab */}
      {activeTab === "bulk-create" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Create Bulk Operation</h2>

            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground">Operation Type</label>
                <select
                  className="select-field mt-2 text-sm"
                  value={bulkType}
                  onChange={(e) => setBulkType(e.target.value as any)}
                  aria-label="Select operation type"
                >
                  <option value="BULK_APPROVE">Bulk Approve</option>
                  <option value="BULK_REFUND">Bulk Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground">
                  Escrow IDs (one per line)
                </label>
                <textarea
                  className="input-field mt-2 text-sm font-mono"
                  placeholder="escrow_id_1&#10;escrow_id_2&#10;escrow_id_3"
                  rows={6}
                  value={escrowIds}
                  onChange={(e) => setEscrowIds(e.target.value)}
                  disabled={isBulkCreating}
                />
                <p className="mt-2 text-xs text-(--ink-muted)">
                  {escrowIds.split("\n").filter((id) => id.trim()).length} valid escrow IDs
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground">Reason</label>
                <textarea
                  className="input-field mt-2 text-sm"
                  placeholder="Explain the reason for this bulk operation..."
                  rows={3}
                  value={bulkReason}
                  onChange={(e) => setBulkReason(e.target.value)}
                  disabled={isBulkCreating}
                />
              </div>

              <div className="rounded-lg bg-(--warning-soft) p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--warning)">Warning</p>
                <p className="mt-2 text-sm text-foreground">
                  This action will process {bulkType === "BULK_APPROVE" ? "approval and disbursement" : "refunds"} for{" "}
                  <strong>
                    {escrowIds.split("\n").filter((id) => id.trim()).length} escrows
                  </strong>
                  . This cannot be easily reversed.
                </p>
              </div>

              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={createBulkOp}
                disabled={
                  isBulkCreating ||
                  !escrowIds.trim() ||
                  !bulkReason.trim() ||
                  escrowIds.split("\n").filter((id) => id.trim()).length === 0
                }
                type="button"
              >
                {isBulkCreating ? "Creating..." : "Create Bulk Operation"}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
