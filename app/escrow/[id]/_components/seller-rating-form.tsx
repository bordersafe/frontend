"use client";

import { FormEvent, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

interface SellerRatingFormProps {
  escrowId: string;
  sellerId: string;
  isVisible: boolean;
  onSuccess?: () => void;
}

export function SellerRatingForm({
  escrowId,
  sellerId,
  isVisible,
  onSuccess,
}: SellerRatingFormProps) {
  const { post } = useAuthedApi();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isVisible) {
    return null;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await post("/api/sellers/ratings", {
        escrow_id: escrowId,
        rating,
        comment: comment.trim() ? comment.trim() : null,
      });

      setSuccessMessage("Rating submitted. Thanks for your feedback.");
      setComment("");
      onSuccess?.();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to submit rating.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold text-foreground">Rate this seller</h2>
      <p className="mt-2 text-sm text-(--ink-muted)">
        Your rating appears on the seller's public profile and helps other buyers choose trusted vendors.
      </p>

      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <label className="text-xs uppercase tracking-[0.18em] text-(--ink-soft)">
          Rating
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold ${
                rating >= value
                  ? "border-amber-300 bg-amber-100 text-amber-800"
                  : "border-(--border-soft) bg-white text-(--ink-muted)"
              }`}
            >
              ★ {value}
            </button>
          ))}
        </div>

        <textarea
          className="textarea-field min-h-24"
          placeholder="Optional comment about seller communication, speed, or product quality"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />

        <div className="flex items-center justify-between gap-3">
          <a
            href={`/sellers/${sellerId}`}
            className="text-xs font-semibold text-(--primary) hover:underline"
          >
            View seller public profile
          </a>
          <button
            className="btn-primary px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Submitting..." : "Submit rating"}
          </button>
        </div>
      </form>

      {successMessage ? (
        <p className="mt-3 text-sm text-green-700">{successMessage}</p>
      ) : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
