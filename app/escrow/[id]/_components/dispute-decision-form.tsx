"use client";

import { FormEvent, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

type Props = {
  escrowId: string;
  disputeId: string;
  onSuccess?: () => void;
};

export function DisputeDecisionForm({ escrowId, disputeId, onSuccess }: Props) {
  const { post } = useAuthedApi();
  const [decision, setDecision] = useState<"APPROVE_SELLER" | "APPROVE_BUYER" | "PARTIAL_REFUND">("APPROVE_SELLER");
  const [reasoning, setReasoning] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const payload: Record<string, unknown> = {
        decision,
        reasoning: reasoning.trim() || null,
      };

      if (decision === "PARTIAL_REFUND") {
        payload.refund_amount = typeof refundAmount === "number" ? refundAmount : 0;
      }

      await post(`/api/escrow/${escrowId}/dispute/${disputeId}/decision`, payload);

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit decision.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-(--border) bg-white p-6">
      <h3 className="heading-3">Admin Decision</h3>
      <p className="mt-1 text-sm text-(--ink-muted)">Resolve this dispute and optionally issue a refund.</p>

      <div className="mt-4 grid gap-3">
        <label className="text-sm font-semibold">Decision</label>
        <select
          value={decision}
          onChange={(e) => setDecision(e.target.value as any)}
          className="input-field"
          disabled={isSubmitting}
        >
          <option value="APPROVE_SELLER">Approve seller (no refund)</option>
          <option value="APPROVE_BUYER">Approve buyer (full refund)</option>
          <option value="PARTIAL_REFUND">Partial refund</option>
        </select>

        {decision === "PARTIAL_REFUND" && (
          <input
            type="number"
            min={0}
            step="0.01"
            placeholder="Refund amount"
            value={refundAmount as any}
            onChange={(e) => setRefundAmount(e.target.value === "" ? "" : Number(e.target.value))}
            className="input-field"
            disabled={isSubmitting}
          />
        )}

        <div>
          <label className="block text-sm font-semibold">Reasoning (optional)</label>
          <textarea
            value={reasoning}
            onChange={(e) => setReasoning(e.target.value)}
            rows={3}
            className="textarea-field mt-2"
            disabled={isSubmitting}
          />
        </div>

        {error && <div className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1 px-4 py-3 text-sm disabled:opacity-60"
          >
            {isSubmitting ? "Submitting..." : "Submit decision"}
          </button>
        </div>
      </div>
    </form>
  );
}
