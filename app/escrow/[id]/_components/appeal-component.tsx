"use client";

import { FormEvent, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

interface AppealComponentProps {
  escrowId: string;
  hasAdminDecision: boolean;
  isAppealPending: boolean;
  onSuccess?: () => void;
}

export function AppealComponent({
  escrowId,
  hasAdminDecision,
  isAppealPending,
  onSuccess,
}: AppealComponentProps) {
  const { post } = useAuthedApi();
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError("Please provide a reason for your appeal");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await post(`/api/escrow/${escrowId}/dispute/appeal`, {
        reason: reason.trim(),
      });

      setSuccess(true);
      setReason("");
      setTimeout(() => {
        setSuccess(false);
        setIsOpen(false);
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to file appeal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasAdminDecision || isAppealPending) {
    return null;
  }

  return (
    <div className="rounded-lg border border-(--border) bg-white p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="heading-3">Dispute Decision</h3>
          <p className="mt-1 text-sm text-(--ink-muted)">
            If you disagree with the admin decision, you can file an appeal.
          </p>
        </div>
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="rounded bg-(--action) px-4 py-2 text-sm font-medium text-(--action-ink) hover:bg-opacity-90"
          >
            Appeal Decision
          </button>
        )}
      </div>

      {isOpen && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="appeal-reason" className="block text-sm font-medium">
              Why are you appealing this decision?
            </label>
            <textarea
              id="appeal-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you believe the decision was incorrect..."
              className="mt-2 w-full rounded border border-(--border) bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-(--action)"
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="rounded bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded bg-green-50 p-3 text-sm text-green-700">
              Appeal submitted successfully! Our team will review it shortly.
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="rounded bg-(--action) px-4 py-2 text-sm font-medium text-(--action-ink) hover:bg-opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Filing..." : "File Appeal"}
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="rounded border border-(--border) px-4 py-2 text-sm font-medium text-(--ink-strong) hover:bg-(--border-soft)"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
