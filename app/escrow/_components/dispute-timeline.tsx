"use client";

import { useEffect, useState } from "react";
import type { DisputeDetail } from "@/lib/api";

type DisputeTimelineProps = {
  dispute: DisputeDetail;
};

export function DisputeTimeline({ dispute }: DisputeTimelineProps) {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const deadline = new Date(dispute.sla_deadline).getTime();
      const now = Date.now();
      const remaining = deadline - now;

      if (remaining <= 0) {
        setIsExpired(true);
        setTimeRemaining("Deadline passed");
      } else {
        setIsExpired(false);
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeRemaining(`${days}d ${hours}h remaining`);
        } else if (hours > 0) {
          setTimeRemaining(`${hours}h ${minutes}m remaining`);
        } else {
          setTimeRemaining(`${minutes}m remaining`);
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dispute.sla_deadline]);

  const createdDate = new Date(dispute.created_at);
  const deadlineDate = new Date(dispute.sla_deadline);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/70 bg-white/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-(--ink-soft)">Dispute filed</p>
            <p className="text-sm font-semibold text-foreground">
              {createdDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p className="text-xs text-(--ink-muted)">{createdDate.toLocaleTimeString()}</p>
          </div>

          <div className="text-right space-y-1">
            <p className="text-xs uppercase tracking-widest text-(--ink-soft)">SLA deadline</p>
            <p className="text-sm font-semibold text-foreground">
              {deadlineDate.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <p
              className={`text-xs font-semibold ${
                isExpired ? "text-(--warning)" : "text-(--success)"
              }`}
            >
              {timeRemaining}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline visualization */}
      <div className="space-y-2">
        <div className="text-xs uppercase tracking-widest text-(--ink-soft)">Timeline</div>
        <div className="space-y-3">
          {/* Dispute filed */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <div className="h-3 w-3 rounded-full bg-(--primary)" />
              <div className="mt-2 h-6 w-0.5 bg-(--border)" />
            </div>
            <div className="pb-3">
              <p className="text-xs font-semibold text-foreground">Dispute filed</p>
              <p className="text-xs text-(--ink-muted)">
                Reason: {dispute.reason.replaceAll("_", " ")}
              </p>
            </div>
          </div>

          {/* Responses */}
          {dispute.responses.length > 0 && (
            <>
              {dispute.responses.map((response, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center pt-1">
                    <div className={`h-3 w-3 rounded-full ${
                      response.from === "seller" ? "bg-(--info)" : "bg-(--success)"
                    }`} />
                    {idx < dispute.responses.length - 1 && <div className="mt-2 h-6 w-0.5 bg-(--border)" />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {response.from === "seller" ? "Seller response" : "Buyer response"}
                    </p>
                    <p className="text-xs text-(--ink-muted)">
                      {new Date(response.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Admin decision */}
          {dispute.admin_decision && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className={`h-3 w-3 rounded-full ${
                  dispute.admin_decision.decision === "APPROVE_BUYER"
                    ? "bg-(--success)"
                    : "bg-(--warning)"
                }`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Admin decision</p>
                <p className="text-xs text-(--ink-muted)">
                  {dispute.admin_decision.decision === "APPROVE_BUYER"
                    ? "Decision: Refund approved"
                    : "Decision: Seller approved"}
                </p>
                <p className="text-xs text-(--ink-soft) mt-1">
                  {new Date(dispute.admin_decision.decided_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}

          {/* Pending */}
          {!dispute.admin_decision && (
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1">
                <div className="h-3 w-3 rounded-full bg-(--ink-muted) opacity-50" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">Awaiting admin review</p>
                <p className="text-xs text-(--ink-muted)">Our team is reviewing your dispute</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
