"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type AppealDoc = {
  id: string;
  escrow_id: string;
  status: "OPEN" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PARTIALLY_APPROVED";
  initiated_at: string;
  reason: string;
  supporting_evidence?: Array<{
    url: string;
    type: "image" | "document" | "message";
    added_at: string;
  }>;
  admin_response?: {
    decided_at: string;
    decided_by: string;
    decision: "APPROVED" | "REJECTED" | "PARTIAL";
    reasoning: string;
    new_split?: {
      buyer_amount: number;
      seller_amount: number;
    };
  } | null;
  resolved_at?: string | null;
};

type AppealList = {
  escrow_id: string;
  appeals: Array<{
    id: string;
    status: AppealDoc["status"];
    initiated_at: string;
    reason: string;
    admin_response: AppealDoc["admin_response"] | null;
    resolved_at: string | null;
  }>;
};

function StatusBadge({ status }: { status: string }) {
  const statusColors: Record<string, string> = {
    OPEN: "bg-(--warning-soft) text-(--warning)",
    UNDER_REVIEW: "bg-(--action-soft) text-(--action)",
    APPROVED: "bg-(--success-soft) text-(--success)",
    REJECTED: "bg-(--danger-soft) text-(--danger)",
    PARTIALLY_APPROVED: "bg-(--accent-soft) text-(--accent)",
  };

  const statusLabels: Record<string, string> = {
    OPEN: "Open",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    PARTIALLY_APPROVED: "Partial",
  };

  return (
    <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusColors[status] || "bg-(--ink-soft)"}`}>
      {statusLabels[status] || status}
    </span>
  );
}

export default function AppealsPage() {
  const params = useParams<{ id: string }>();
  const { user, isAuthLoading, get, post } = useAuthedApi();
  const escrowId = params?.id;

  const [appeals, setAppeals] = useState<AppealList["appeals"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<UiError | null>(null);
  const [selectedAppeal, setSelectedAppeal] = useState<AppealDoc | null>(null);
  const [isCreatingAppeal, setIsCreatingAppeal] = useState(false);

  // Create appeal form state
  const [appealReason, setAppealReason] = useState("");
  const [supportingEvidenceUrls, setSupportingEvidenceUrls] = useState<string[]>([]);
  const [newEvidenceUrl, setNewEvidenceUrl] = useState("");

  const fetchAppeals = useCallback(async () => {
    if (!user || !escrowId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await get<AppealList>(`/api/buyer/escrow/${escrowId}/appeals`);
      setAppeals(response.appeals ?? []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [get, escrowId, user]);

  useEffect(() => {
    if (!isAuthLoading && user && escrowId) {
      void fetchAppeals();
    }
  }, [escrowId, fetchAppeals, isAuthLoading, user]);

  const handleCreateAppeal = async () => {
    if (!escrowId) {
      return;
    }

    if (!appealReason.trim()) {
      setError({
        kind: "VALIDATION",
        title: "Missing reason",
        message: "Please provide a reason for your appeal.",
        retryable: false,
        correlationId: null,
        status: 400,
      });
      return;
    }

    setIsCreatingAppeal(true);
    setError(null);

    try {
      await post(`/api/buyer/escrow/${escrowId}/appeal`, {
        reason: appealReason.trim(),
        supporting_evidence: supportingEvidenceUrls
          .filter((url) => url.trim())
          .map((url) => ({
            url: url.trim(),
            type: "image" as const,
          })),
      });

      setAppealReason("");
      setSupportingEvidenceUrls([]);
      setNewEvidenceUrl("");
      await fetchAppeals();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsCreatingAppeal(false);
    }
  };

  const addEvidenceUrl = () => {
    if (newEvidenceUrl.trim() && supportingEvidenceUrls.length < 10) {
      setSupportingEvidenceUrls([...supportingEvidenceUrls, newEvidenceUrl.trim()]);
      setNewEvidenceUrl("");
    }
  };

  const removeEvidenceUrl = (index: number) => {
    setSupportingEvidenceUrls(supportingEvidenceUrls.filter((_, i) => i !== index));
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

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Appeals</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          View and manage your appeals for escrow {escrowId}
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
          Loading appeals...
        </section>
      ) : !appeals || appeals.length === 0 ? (
        <section className="panel p-6 space-y-4">
          <p className="text-sm text-(--ink-muted)">No appeals yet. You can create a new appeal below.</p>
        </section>
      ) : (
        <div className="grid gap-4">
          {appeals.map((appeal) => (
            <section
              key={appeal.id}
              className="panel p-4 cursor-pointer hover:bg-(--surface-hover) transition"
              onClick={() => setSelectedAppeal(appeal as AppealDoc)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{appeal.id}</h3>
                    <StatusBadge status={appeal.status} />
                  </div>
                  <p className="mt-1 text-sm text-(--ink-muted)">{appeal.reason.substring(0, 150)}</p>
                  <p className="mt-1 text-xs text-(--ink-soft)">Initiated {appeal.initiated_at}</p>
                </div>
              </div>

              {appeal.admin_response && (
                <div className="mt-3 rounded-lg bg-(--accent-soft) p-3">
                  <p className="text-xs font-semibold text-(--accent)">
                    {appeal.admin_response.decision}: {appeal.admin_response.reasoning.substring(0, 100)}...
                  </p>
                </div>
              )}
            </section>
          ))}
        </div>
      )}

      {/* Create New Appeal Section */}
      {(!appeals || appeals.length === 0 || (appeals.length > 0 && appeals[appeals.length - 1].status === "REJECTED")) && (
        <section className="panel p-6">
          <h2 className="heading-2">Create a New Appeal</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">
            Explain why you believe the decision should be reconsidered.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-(--ink-soft)">
                Reason <span className="text-(--danger)">*</span>
              </label>
              <textarea
                className="input-field mt-2 text-sm"
                placeholder="Explain your appeal reason..."
                rows={4}
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
                disabled={isCreatingAppeal}
              />
              <p className="mt-1 text-xs text-(--ink-soft)">{appealReason.length}/1000 characters</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-(--ink-soft)">
                Supporting Evidence (optional)
              </label>
              <p className="mt-1 text-xs text-(--ink-muted)">Add up to 10 image or document URLs</p>

              <div className="mt-3 space-y-2">
                {supportingEvidenceUrls.map((url, index) => (
                  <div key={index} className="flex items-center justify-between gap-2 rounded-lg bg-(--surface-soft) p-2">
                    <p className="truncate text-xs text-(--ink-muted)">{url}</p>
                    <button
                      className="text-sm font-semibold text-(--danger) hover:underline"
                      onClick={() => removeEvidenceUrl(index)}
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {supportingEvidenceUrls.length < 10 && (
                <div className="mt-3 flex gap-2">
                  <input
                    className="input-field flex-1 text-sm"
                    placeholder="https://example.com/image.jpg"
                    type="url"
                    value={newEvidenceUrl}
                    onChange={(e) => setNewEvidenceUrl(e.target.value)}
                    disabled={isCreatingAppeal}
                  />
                  <button
                    className="btn-secondary px-3 py-2 text-xs disabled:opacity-60"
                    onClick={addEvidenceUrl}
                    disabled={isCreatingAppeal || !newEvidenceUrl.trim()}
                    type="button"
                  >
                    Add
                  </button>
                </div>
              )}
            </div>

            <div className="flex gap-2 border-t border-(--ink-border) pt-4">
              <button
                className="btn-primary px-4 py-2 text-sm disabled:opacity-60"
                onClick={handleCreateAppeal}
                disabled={isCreatingAppeal || !appealReason.trim()}
                type="button"
              >
                {isCreatingAppeal ? "Creating..." : "Submit Appeal"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Appeal Detail Modal */}
      {selectedAppeal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setSelectedAppeal(null)}>
          <div className="panel w-full max-h-[90vh] max-w-3xl overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-(--ink-border) pb-4">
              <div>
                <h2 className="heading-2">Appeal Details</h2>
                <p className="mt-1 text-sm text-(--ink-muted)">{selectedAppeal.id}</p>
              </div>
              <button
                className="text-xl font-semibold text-(--ink-muted) hover:text-foreground"
                onClick={() => setSelectedAppeal(null)}
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">Status</h3>
                  <StatusBadge status={selectedAppeal.status} />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-foreground">Your Appeal Reason</h3>
                <p className="mt-2 text-sm text-(--ink-muted)">{selectedAppeal.reason}</p>
              </div>

              {selectedAppeal.supporting_evidence && selectedAppeal.supporting_evidence.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Supporting Evidence</h3>
                  <div className="mt-3 grid gap-4 sm:grid-cols-2">
                    {selectedAppeal.supporting_evidence.map((ev, index) => (
                      <div key={index} className="space-y-2">
                        <img
                          alt={`Evidence ${index + 1}`}
                          className="h-40 w-full rounded-lg object-cover"
                          src={ev.url}
                        />
                        <p className="text-xs text-(--ink-soft)">Added {ev.added_at}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedAppeal.admin_response && (
                <div className="space-y-3 rounded-lg bg-(--accent-soft) p-4">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Admin Decision</h3>
                    <p className="mt-2 text-sm">
                      <span className="font-semibold">
                        {selectedAppeal.admin_response.decision === "APPROVED"
                          ? "Approved ✓"
                          : selectedAppeal.admin_response.decision === "REJECTED"
                            ? "Rejected ✗"
                            : "Partially Approved"}
                      </span>
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold uppercase text-(--ink-soft)">Reasoning</h3>
                    <p className="mt-2 text-sm text-(--ink-muted)">{selectedAppeal.admin_response.reasoning}</p>
                  </div>

                  {selectedAppeal.admin_response.new_split && (
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-(--ink-soft)">Split Decision</h3>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2 text-sm">
                        <div className="rounded bg-(--success-soft) p-3">
                          <p className="text-xs text-(--ink-soft)">You receive</p>
                          <p className="mt-1 font-bold text-(--success)">
                            {selectedAppeal.admin_response.new_split.buyer_amount}
                          </p>
                        </div>
                        <div className="rounded bg-(--ink-soft) p-3">
                          <p className="text-xs text-(--ink-soft)">Seller receives</p>
                          <p className="mt-1 font-bold text-(--ink)">{selectedAppeal.admin_response.new_split.seller_amount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-(--ink-soft)">Decided {selectedAppeal.admin_response.decided_at}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-(--ink-border) pt-4">
              <button
                className="btn-secondary px-4 py-2 text-sm"
                onClick={() => setSelectedAppeal(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
