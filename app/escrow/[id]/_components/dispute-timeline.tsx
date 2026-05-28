"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";

type DisputeResponse = {
  from: "buyer" | "seller";
  message: string;
  evidence: string[];
  created_at: string;
};

type AdminDecision = {
  decision: "APPROVE_SELLER" | "APPROVE_BUYER" | "PARTIAL_REFUND";
  reasoning: string;
  decided_at: string;
  decided_by: string;
};

type Appeal = {
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  resolved_at: string | null;
  decision: string | null;
};

type Dispute = {
  id: string;
  initiated_by: "buyer" | "seller";
  reason: string;
  status: "OPEN" | "RESOLVED" | "APPEALED";
  created_at: string;
  sla_deadline?: string | null;
  responses: DisputeResponse[];
  admin_decision?: AdminDecision | null;
  appeal?: Appeal | null;
};

function SlaClock({ deadline }: { deadline: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    let mounted = true;
    function update() {
      const now = Date.now();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (!mounted) return;

      if (isNaN(target)) {
        setLabel("Invalid SLA");
        return;
      }

      if (diff <= 0) {
        const ago = formatDuration(Math.abs(diff));
        setLabel(`SLA breached ${ago} ago`);
      } else {
        setLabel(`${formatDuration(diff)} remaining`);
      }
    }

    const iv = setInterval(update, 1000);
    update();
    return () => {
      mounted = false;
      clearInterval(iv);
    };
  }, [deadline]);

  function formatDuration(ms: number) {
    const sec = Math.floor(ms / 1000);
    const days = Math.floor(sec / (24 * 3600));
    const hours = Math.floor((sec % (24 * 3600)) / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${sec % 60}s`;
  }

  return <span className="text-sm font-medium text-(--ink-strong)">{label}</span>;
}

interface DisputeTimelineProps {
  dispute: Dispute;
  userRole: "seller" | "buyer" | "admin";
}

const DECISION_COLORS = {
  APPROVE_SELLER: "bg-green-50 border-green-200",
  APPROVE_BUYER: "bg-red-50 border-red-200",
  PARTIAL_REFUND: "bg-yellow-50 border-yellow-200",
};

const DECISION_BADGES = {
  APPROVE_SELLER: "bg-green-100 text-green-700",
  APPROVE_BUYER: "bg-red-100 text-red-700",
  PARTIAL_REFUND: "bg-yellow-100 text-yellow-700",
};

export function DisputeTimeline({ dispute, userRole }: DisputeTimelineProps) {
  const timelineItems = useMemo(() => {
    const items: Array<{
      type: "opened" | "response" | "decision" | "appeal" | "appeal_resolved";
      timestamp: string;
      data: unknown;
    }> = [];

    // Add dispute opened event
    items.push({
      type: "opened",
      timestamp: dispute.created_at,
      data: {
        initiatedBy: dispute.initiated_by,
        reason: dispute.reason,
      },
    });

    // Add responses
    dispute.responses.forEach((response) => {
      items.push({
        type: "response",
        timestamp: response.created_at,
        data: response,
      });
    });

    // Add admin decision
    if (dispute.admin_decision) {
      items.push({
        type: "decision",
        timestamp: dispute.admin_decision.decided_at,
        data: dispute.admin_decision,
      });
    }

    // Add appeal
    if (dispute.appeal) {
      items.push({
        type: "appeal",
        timestamp: dispute.appeal.created_at,
        data: dispute.appeal,
      });
    }

    // Add appeal resolution
    if (dispute.appeal?.resolved_at) {
      items.push({
        type: "appeal_resolved",
        timestamp: dispute.appeal.resolved_at,
        data: {
          status: dispute.appeal.status,
          decision: dispute.appeal.decision,
        },
      });
    }

    return items.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [dispute]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Dispute Status Badge */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-(--ink-soft) uppercase tracking-widest">
          Status
        </span>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            dispute.status === "OPEN"
              ? "bg-yellow-100 text-yellow-700"
              : dispute.status === "APPEALED"
                ? "bg-blue-100 text-blue-700"
                : "bg-green-100 text-green-700"
          }`}
        >
          {dispute.status === "OPEN"
            ? "Open"
            : dispute.status === "APPEALED"
              ? "Appealed"
              : "Resolved"}
        </span>
      </div>

      {/* SLA summary */}
      {dispute.sla_deadline && (
        <div className="panel-muted px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <div>

              <p className="mt-1 font-semibold text-foreground">{new Date(dispute.sla_deadline).toLocaleString()}</p>
            </div>
            <div>
              <SlaClock deadline={dispute.sla_deadline} />
            </div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative space-y-4 pl-6">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-(--border)" />

        {timelineItems.map((item, idx) => {
          const isOpened = item.type === "opened";
          const isResponse = item.type === "response";
          const isDecision = item.type === "decision";
          const isAppeal = item.type === "appeal";
          const isAppealResolved = item.type === "appeal_resolved";

          return (
            <div key={idx} className="relative">
              {/* Timeline dot */}
              <div
                className={`absolute -left-3.5 -top-1 h-5 w-5 rounded-full border-2 ${
                  isOpened
                    ? "bg-yellow-100 border-yellow-400"
                    : isResponse
                      ? "bg-blue-100 border-blue-400"
                      : isDecision
                        ? "bg-green-100 border-green-400"
                        : "bg-purple-100 border-purple-400"
                }`}
              />

              {/* Content */}
              <div
                className={`rounded-lg border p-4 ${
                  isDecision
                    ? DECISION_COLORS[
                        (item.data as AdminDecision).decision
                      ]
                    : "bg-white border-(--border)"
                }`}
              >
                {isOpened && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Dispute Opened
                        </h4>
                        <p className="mt-1 text-sm text-(--ink-muted)">
                          {(item.data as { initiatedBy: string }).initiatedBy ===
                          "buyer"
                            ? "Buyer initiated a dispute"
                            : "Seller initiated a dispute"}
                        </p>
                      </div>
                      <span className="text-xs text-(--ink-soft) whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <div className="mt-3 rounded bg-white/50 p-3 text-sm">
                      <p className="font-medium text-(--ink-strong)">Reason</p>
                      <p className="mt-1 text-(--ink-muted)">
                        {(item.data as { reason: string }).reason}
                      </p>
                    </div>
                    {/* Show SLA clock inline when dispute opened */}
                    {dispute.sla_deadline && (
                      <div className="mt-3 text-sm text-(--ink-muted)">

                        <div className="mt-1">
                          <SlaClock deadline={dispute.sla_deadline} />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isResponse && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {(item.data as DisputeResponse).from === "seller"
                            ? "Seller Response"
                            : "Buyer Response"}
                        </h4>
                      </div>
                      <span className="text-xs text-(--ink-soft) whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-(--ink-muted)">
                      {(item.data as DisputeResponse).message}
                    </p>
                    {(item.data as DisputeResponse).evidence.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-(--ink-soft) uppercase">
                          Evidence ({(item.data as DisputeResponse).evidence.length})
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {(item.data as DisputeResponse).evidence.map(
                            (url, i) => (
                              <a
                                key={i}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                              >
                                📎 File {i + 1}
                              </a>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {isDecision && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Admin Decision
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span
                            className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                              DECISION_BADGES[
                                (item.data as AdminDecision).decision
                              ]
                            }`}
                          >
                            {(item.data as AdminDecision).decision ===
                            "APPROVE_SELLER"
                              ? "Approved for Seller"
                              : (item.data as AdminDecision).decision === "APPROVE_BUYER"
                                ? "Full Refund Approved"
                                : "Partial Refund Approved"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-(--ink-soft) whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Reasoning:</span>{" "}
                      {(item.data as AdminDecision).reasoning}
                    </p>
                    {((item.data as AdminDecision).decision === "APPROVE_BUYER" || 
                      (item.data as AdminDecision).decision === "PARTIAL_REFUND") && (
                      <p className="mt-2 rounded-lg bg-white/50 px-3 py-2 text-sm text-green-700">
                        💚 A refund has been approved and is being processed. Check the refund status panel above for details.
                      </p>
                    )}
                  </>
                )}

                {isAppeal && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Appeal Filed
                        </h4>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Status:{" "}
                          <span className="font-semibold">
                            {(item.data as Appeal).status === "PENDING"
                              ? "Pending Review"
                              : (item.data as Appeal).status === "APPROVED"
                                ? "Approved"
                                : "Rejected"}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-(--ink-soft) whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-(--ink-muted)">
                      <span className="font-medium">Appeal Reason:</span>{" "}
                      {(item.data as Appeal).reason}
                    </p>
                  </>
                )}

                {isAppealResolved && (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-semibold text-foreground">
                          Appeal Decision
                        </h4>
                        <span
                          className={`mt-1 inline-block rounded px-2 py-1 text-xs font-semibold ${
                            (item.data as { status: string }).status ===
                            "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {(item.data as { status: string }).status}
                        </span>
                      </div>
                      <span className="text-xs text-(--ink-soft) whitespace-nowrap">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                    {(item.data as { decision: string }).decision && (
                      <p className="mt-2 text-sm text-(--ink-muted)">
                        {(item.data as { decision: string }).decision}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
