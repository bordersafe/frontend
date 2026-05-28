"use client";

import { useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { DisputeCreateRequest, DisputeCreateResponse } from "@/lib/api";

const DISPUTE_REASONS = [
  { value: "product_not_received", label: "Product not received" },
  { value: "product_damaged", label: "Product damaged or defective" },
  { value: "product_not_matching", label: "Product doesn't match description" },
  { value: "product_counterfeit", label: "Product appears counterfeit" },
  { value: "quality_issues", label: "Significant quality issues" },
  { value: "seller_communication", label: "Seller not communicating" },
  { value: "payment_issue", label: "Payment or refund issue" },
  { value: "other", label: "Other reason" },
];

type DisputeFormProps = {
  escrowId: string;
  onDisputeFiled: (dispute: DisputeCreateResponse) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function DisputeForm({ escrowId, onDisputeFiled, onCancel, isLoading = false }: DisputeFormProps) {
  const { post } = useAuthedApi();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState<string[]>([]);
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEvidence = () => {
    if (evidenceUrl.trim()) {
      setEvidence([...evidence, evidenceUrl.trim()]);
      setEvidenceUrl("");
    }
  };

  const handleRemoveEvidence = (index: number) => {
    setEvidence(evidence.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!reason) {
        throw new Error("Please select a dispute reason.");
      }
      if (!description.trim()) {
        throw new Error("Please provide a description of the issue.");
      }

      const payload: DisputeCreateRequest = {
        reason,
        description: description.trim(),
        evidence,
      };

      const response = await post<DisputeCreateResponse>(
        `/api/escrow/${escrowId}/dispute`,
        payload
      );

      if (response) {
        onDisputeFiled(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to file dispute. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="dispute-reason" className="mb-2 block text-sm font-semibold text-foreground">
          Reason for dispute *
        </label>
        <select
          id="dispute-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading || isSubmitting}
          className="w-full rounded-lg border border-white/70 bg-white/90 px-4 py-2 text-sm text-foreground outline-none disabled:opacity-60"
        >
          <option value="">Select a reason...</option>
          {DISPUTE_REASONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="dispute-description" className="mb-2 block text-sm font-semibold text-foreground">
          Describe the issue *
        </label>
        <textarea
          id="dispute-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading || isSubmitting}
          placeholder="Provide details about what went wrong, when you discovered it, and any steps you've already taken."
          rows={5}
          className="w-full rounded-lg border border-white/70 bg-white/90 px-4 py-2 text-sm text-foreground outline-none disabled:opacity-60"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Evidence (optional)
        </label>
        <p className="text-xs text-(--ink-muted) mb-3">
          Attach photos, videos, or links to documentation that supports your dispute.
        </p>

        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            disabled={isLoading || isSubmitting}
            placeholder="https://example.com/photo.jpg"
            className="flex-1 rounded-lg border border-white/70 bg-white/90 px-4 py-2 text-sm text-foreground outline-none disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleAddEvidence}
            disabled={!evidenceUrl.trim() || isLoading || isSubmitting}
            className="rounded-lg bg-(--primary) px-4 py-2 text-xs font-semibold text-(--action-ink) disabled:opacity-60"
          >
            Add
          </button>
        </div>

        {evidence.length > 0 && (
          <div className="space-y-2">
            {evidence.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-white/70 bg-white/50 px-3 py-2 text-xs"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 truncate text-(--primary) hover:underline"
                >
                  {url}
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveEvidence(index)}
                  className="ml-2 text-xs text-(--ink-muted) hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-(--warning)/10 p-4 text-sm text-(--warning)">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading || isSubmitting || !reason || !description.trim()}
          className="flex-1 rounded-lg bg-(--primary) px-4 py-2 text-sm font-semibold text-(--action-ink) disabled:opacity-60"
        >
          {isSubmitting ? "Filing dispute..." : "File dispute"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading || isSubmitting}
          className="rounded-lg border border-white/70 bg-white/90 px-4 py-2 text-sm font-semibold text-foreground hover:bg-white/80 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
