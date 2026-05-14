"use client";

import { type FormEvent, useMemo, useState } from "react";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type EscrowDetail = {
  id: string;
  transaction_ref: string;
  description: string | null;
  amount: number;
  currency: string;
  buyer_email: string;
  status: string;
  checkout_url: string | null;
  waybill: {
    is_valid_waybill: boolean;
    tracking_number: string | null;
    courier: string | null;
    checked_at: string;
  } | null;
  delivery: {
    delivered_at: string;
    source: string;
    notes?: string | null;
  } | null;
  proof: {
    original_product_url: string | null;
    buyer_received_url: string | null;
    uploaded_at: string;
  } | null;
  arbitration: {
    confidence_score: number;
    verdict: "MATCH" | "FRAUD";
    reasoning: string;
    decided_at: string;
  } | null;
  buyer_confirmation: {
    confirmed_at: string;
    notes?: string | null;
  } | null;
  payout: unknown | null;
  created_at: string | null;
  updated_at: string | null;
};

type WaybillResponse = {
  escrow_id: string;
  status: string;
  is_valid_waybill: boolean;
  tracking_number: string | null;
  courier: string | null;
};

type AdjudicationResponse = {
  escrow_id: string;
  status: string;
  confidence_score: number;
  verdict: "MATCH" | "FRAUD";
  reasoning: string;
};

type UploadSignatureResponse = {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  allowedFormats: string;
  publicId: string;
  uploadUrl: string;
};

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

interface EscrowDetailPageProps {
  params: { id: string };
}

export default function EscrowDetailPage({ params }: EscrowDetailPageProps) {
  const { id } = params;
  const { user, isAuthLoading, get, post } = useAuthedApi();
  const {
    data: escrow,
    error: fetchError,
    isLoading,
    mutate: refreshEscrow,
  } = useSWR<EscrowDetail>(
    !isAuthLoading && user ? ["escrow-detail", user.uid, id] : null,
    async () => get<EscrowDetail>(`/api/escrow/${id}`),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );
  const error = useMemo(() => (fetchError ? normalizeApiError(fetchError) : null), [fetchError]);
  const [waybillUrl, setWaybillUrl] = useState("");
  const [waybillFile, setWaybillFile] = useState<File | null>(null);
  const [isWaybillSubmitting, setIsWaybillSubmitting] = useState(false);
  const [waybillResult, setWaybillResult] = useState<WaybillResponse | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [receivedUrl, setReceivedUrl] = useState("");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [receivedFile, setReceivedFile] = useState<File | null>(null);
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [adjudicationResult, setAdjudicationResult] = useState<AdjudicationResponse | null>(null);
  const [isDeliveryUpdating, setIsDeliveryUpdating] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [operationError, setError] = useState<UiError | null>(null);

  const canVerifyWaybill = escrow?.status === "FUNDS_LOCKED";
  const canSimulateDelivery = escrow?.status === "FUNDS_LOCKED";
  const canAdjudicate = escrow?.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION";
  const canConfirmDelivery = escrow?.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION";

  const uploadToCloudinary = async (file: File, purpose: string): Promise<string> => {
    if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
      throw new Error("Unsupported file type. Use JPG, PNG, WEBP, or PDF.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      throw new Error("File exceeds 6MB limit.");
    }

    const signature = await post<UploadSignatureResponse>("/api/uploads/signature", {
      purpose,
      escrow_id: id,
    });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("signature", signature.signature);
    formData.append("folder", signature.folder);
    formData.append("allowed_formats", signature.allowedFormats);
    formData.append("public_id", signature.publicId);

    const response = await fetch(signature.uploadUrl, {
      method: "POST",
      body: formData,
    });

    const payload = (await response.json().catch(() => null)) as
      | { secure_url?: string; error?: { message?: string } }
      | null;

    if (!response.ok || !payload?.secure_url) {
      throw new Error(payload?.error?.message ?? "Cloudinary upload failed.");
    }

    return payload.secure_url;
  };

  const handleSimulateDelivery = async () => {
    if (!user) return;

    setIsDeliveryUpdating(true);
    setError(null);

    try {
      await post("/api/logistics/simulate", { escrow_id: id });
      await refreshEscrow();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsDeliveryUpdating(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!user || !canConfirmDelivery) return;

    setIsConfirming(true);
    setError(null);

    try {
      await post("/api/escrow/confirm-delivery", {
        escrow_id: id,
        ...(confirmationNotes.trim() ? { notes: confirmationNotes.trim() } : {}),
      });
      setConfirmationNotes("");
      await refreshEscrow();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleWaybillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!waybillUrl.trim() && !waybillFile) return;

    setIsWaybillSubmitting(true);
    setError(null);

    try {
      const finalWaybillUrl = waybillFile
        ? await uploadToCloudinary(waybillFile, "waybill")
        : waybillUrl.trim();
      const response = await post<WaybillResponse>("/api/escrow/verify-waybill", {
        escrow_id: id,
        waybill_url: finalWaybillUrl,
      });
      setWaybillResult(response);
      await refreshEscrow();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsWaybillSubmitting(false);
    }
  };

  const handleAdjudicateSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if ((!originalUrl.trim() && !originalFile) || (!receivedUrl.trim() && !receivedFile)) return;

    setIsAdjudicating(true);
    setError(null);

    try {
      const finalOriginalUrl = originalFile
        ? await uploadToCloudinary(originalFile, "product_reference")
        : originalUrl.trim();
      const finalReceivedUrl = receivedFile
        ? await uploadToCloudinary(receivedFile, "delivery_proof")
        : receivedUrl.trim();
      const response = await post<AdjudicationResponse>("/api/escrow/analyze", {
        escrow_id: id,
        original_product_url: finalOriginalUrl,
        buyer_received_url: finalReceivedUrl,
      });
      setAdjudicationResult(response);
      await refreshEscrow();
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsAdjudicating(false);
    }
  };

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Escrow {id}</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Track the escrow state and upload evidence when prompted.
        </p>
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--ink-muted)">Sign in to view this escrow.</p>
        )}
      </header>

      <section className="panel p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Escrow snapshot</h2>
          <button
            className="btn-secondary px-3 py-1 text-xs"
            onClick={() => void refreshEscrow()}
            type="button"
          >
            {isLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {escrow ? (
          <div className="mt-4 grid gap-3 text-sm text-(--ink-muted)">
            <div className="panel-muted px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Status</p>
              <p className="mt-2 font-semibold text-foreground">{escrow.status}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel-muted px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Amount</p>
                <p className="mt-2 font-semibold text-foreground">
                  {escrow.amount} {escrow.currency}
                </p>
              </div>
              <div className="panel-muted px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Buyer</p>
                <p className="mt-2 font-semibold text-foreground">{escrow.buyer_email}</p>
              </div>
            </div>
            {escrow.description && (
              <div className="panel-muted px-4 py-3">
                <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Description</p>
                <p className="mt-2 font-semibold text-foreground">{escrow.description}</p>
              </div>
            )}
            {escrow.checkout_url && (
              <a
                className="btn-primary inline-flex items-center justify-center px-4 py-3 text-sm"
                href={escrow.checkout_url}
                rel="noreferrer"
                target="_blank"
              >
                Open checkout link
              </a>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-(--ink-muted)">
            {isLoading ? "Loading escrow..." : "Escrow details not available."}
          </p>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Delivery status</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Logistics updates move the escrow into buyer confirmation. Use the simulator for demo runs.
        </p>

        <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
          <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Latest delivery signal</p>
          {escrow?.delivery ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">Delivered</p>
              <p>Source: {escrow.delivery.source}</p>
              <p>Delivered at: {escrow.delivery.delivered_at}</p>
              {escrow.delivery.notes && <p>Notes: {escrow.delivery.notes}</p>}
            </div>
          ) : (
            <p className="mt-2">Awaiting delivery confirmation.</p>
          )}
        </div>

        <button
          className="btn-secondary mt-4 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!user || !canSimulateDelivery || isDeliveryUpdating}
          onClick={handleSimulateDelivery}
          type="button"
        >
          {isDeliveryUpdating ? "Updating delivery..." : "Simulate delivery update"}
        </button>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Buyer confirmation</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Confirm delivery to move this escrow to admin finalization.
        </p>

        <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
          <p className="text-xs uppercase tracking-[0.2em] text-(--ink-soft)">Status</p>
          {escrow?.buyer_confirmation ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">Confirmed</p>
              <p>Confirmed at: {escrow.buyer_confirmation.confirmed_at}</p>
              {escrow.buyer_confirmation.notes && <p>Notes: {escrow.buyer_confirmation.notes}</p>}
            </div>
          ) : (
            <p className="mt-2">Awaiting buyer confirmation.</p>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <textarea
            className="textarea-field min-h-24"
            placeholder="Optional confirmation notes"
            value={confirmationNotes}
            onChange={(event) => setConfirmationNotes(event.target.value)}
          />
          <button
            className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!user || !canConfirmDelivery || isConfirming}
            onClick={handleConfirmDelivery}
            type="button"
          >
            {isConfirming ? "Confirming..." : "Confirm delivery"}
          </button>
        </div>
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Waybill verification</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Upload a waybill image or paste a hosted link. Available after funds are locked.
        </p>

        <form className="mt-4 grid gap-3" onSubmit={handleWaybillSubmit}>
          <input
            className="input-field"
            placeholder="https://.../waybill.jpg"
            value={waybillUrl}
            onChange={(event) => setWaybillUrl(event.target.value)}
          />
          <input
            className="input-field"
            type="file"
            accept="image/*,application/pdf"
            aria-label="Upload waybill file"
            onChange={(event) => setWaybillFile(event.target.files?.[0] ?? null)}
          />
          <button
            className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              !user ||
              !canVerifyWaybill ||
              (!waybillUrl.trim() && !waybillFile) ||
              isWaybillSubmitting
            }
            type="submit"
          >
            {isWaybillSubmitting ? "Uploading and checking..." : "Verify waybill"}
          </button>
        </form>

        {waybillResult && (
          <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
            <p className="font-semibold text-foreground">Waybill result</p>
            <p className="mt-2">Valid: {waybillResult.is_valid_waybill ? "Yes" : "No"}</p>
            <p>Tracking: {waybillResult.tracking_number ?? "N/A"}</p>
            <p>Courier: {waybillResult.courier ?? "N/A"}</p>
          </div>
        )}
      </section>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">AI advisory</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Upload or paste the original product image and the buyer received image for AI analysis.
          Available after delivery confirmation.
        </p>

        <form className="mt-4 grid gap-3" onSubmit={handleAdjudicateSubmit}>
          <input
            className="input-field"
            placeholder="https://.../original.jpg"
            value={originalUrl}
            onChange={(event) => setOriginalUrl(event.target.value)}
          />
          <input
            className="input-field"
            type="file"
            accept="image/*,application/pdf"
            aria-label="Upload original product file"
            onChange={(event) => setOriginalFile(event.target.files?.[0] ?? null)}
          />
          <input
            className="input-field"
            placeholder="https://.../received.jpg"
            value={receivedUrl}
            onChange={(event) => setReceivedUrl(event.target.value)}
          />
          <input
            className="input-field"
            type="file"
            accept="image/*,application/pdf"
            aria-label="Upload buyer received file"
            onChange={(event) => setReceivedFile(event.target.files?.[0] ?? null)}
          />
          <button
            className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={
              !user ||
              !canAdjudicate ||
              (!originalUrl.trim() && !originalFile) ||
              (!receivedUrl.trim() && !receivedFile) ||
              isAdjudicating
            }
            type="submit"
          >
            {isAdjudicating ? "Uploading and analyzing..." : "Run AI analysis"}
          </button>
        </form>

        {adjudicationResult && (
          <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
            <p className="font-semibold text-foreground">Adjudication result</p>
            <p className="mt-2">Verdict: {adjudicationResult.verdict}</p>
            <p>Confidence: {adjudicationResult.confidence_score}</p>
            <p>{adjudicationResult.reasoning}</p>
          </div>
        )}
      </section>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft)">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
