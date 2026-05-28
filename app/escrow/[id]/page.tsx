"use client";

import { useParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import useSWR from "swr";

import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import { useEscrowNotifications } from "@/lib/useEscrowNotifications";
import type { UiError, EscrowDetail } from "@/lib/api";
import { DisputeTimeline } from "./_components/dispute-timeline";
import { DisputeResponseForm } from "./_components/dispute-response-form";
import { AppealComponent } from "./_components/appeal-component";
import { DisputeDecisionForm } from "./_components/dispute-decision-form";
import { SellerRatingForm } from "./_components/seller-rating-form";
import { SellerMiniProfile } from "./_components/seller-mini-profile";
import { SellerReviews } from "./_components/seller-reviews";
import { RefundStatus } from "./_components/refund-status";
import { SellerComparisonCard } from "./_components/seller-comparison-card";
import { SaferAlternativesWidget } from "./_components/safer-alternatives-widget";
import { BuyerEscrowStatus } from "../_components/buyer-escrow-status";
import { DisputeForm } from "../_components/dispute-form";
import { Modal } from "@/app/_components/modal";
import { useConfirm } from "@/app/_components/confirm-dialog";
import { useToast } from "@/lib/toast-context";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/format";
import { getEscrowStatusMeta } from "@/lib/status-labels";

type WaybillResponse = {
  escrow_id: string;
  status: string;
  is_valid_waybill: boolean;
  tracking_number: string | null;
  courier: string | null;
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

type VerifyPaymentResponse = {
  transaction_ref: string;
  verified: boolean;
  transaction_status: string;
  message: string;
};

type AdminResolveResponse = {
  escrow_id: string;
  status: string;
  action: "approve" | "refund";
  decided_at: string;
  payout?: unknown;
  refund?: unknown;
};

const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;
const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default function EscrowDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user, profile, isAuthLoading, get, post, patch } = useAuthedApi();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const { toast } = useToast();
  const {
    data: escrow,
    error: fetchError,
    isLoading,
    mutate: refreshEscrow,
  } = useSWR<EscrowDetail>(
    !isAuthLoading && user && id ? ["escrow-detail", user.uid, id] : null,
    async () => get<EscrowDetail>(`/api/escrow/${id}`),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 15000,
      shouldRetryOnError: false,
    },
  );
  const error = useMemo(() => (fetchError ? normalizeApiError(fetchError) : null), [fetchError]);
  
  // Track status changes and fire notifications
  useEscrowNotifications(escrow);
  
  const [waybillUrl, setWaybillUrl] = useState("");
  const [waybillFile, setWaybillFile] = useState<File | null>(null);
  const [isWaybillSubmitting, setIsWaybillSubmitting] = useState(false);
  const [waybillResult, setWaybillResult] = useState<WaybillResponse | null>(null);
  const [waybillError, setWaybillError] = useState<UiError | null>(null);
  const [isDeliveryUpdating, setIsDeliveryUpdating] = useState(false);
  const [deliveryError, setDeliveryError] = useState<UiError | null>(null);
  const [confirmationNotes, setConfirmationNotes] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<UiError | null>(null);
  const [operationError, setError] = useState<UiError | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editBuyerEmail, setEditBuyerEmail] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<UiError | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState<UiError | null>(null);
  const [isAdminResolving, setIsAdminResolving] = useState(false);
  const [adminResolveResult, setAdminResolveResult] = useState<AdminResolveResponse | null>(null);
  const [adminResolveError, setAdminResolveError] = useState<UiError | null>(null);

  // Fetch disputes
  const {
    data: disputeData,
    mutate: refreshDisputes,
  } = useSWR<{ escrow_id: string; disputes: unknown[] }>(
    !isAuthLoading && user && escrow && id ? ["escrow-disputes", user.uid, id] : null,
    async () => get(`/api/escrow/${id}/dispute`),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      shouldRetryOnError: false,
    },
  );

  const disputes = (disputeData?.disputes ?? []) as Array<{
    id: string;
    initiated_by: "buyer" | "seller";
    reason: string;
    status: "OPEN" | "RESOLVED" | "APPEALED";
    created_at: string;
    responses: Array<{
      from: "buyer" | "seller";
      message: string;
      evidence: string[];
      created_at: string;
    }>;
    admin_decision?: {
      decision: "APPROVE_SELLER" | "APPROVE_BUYER";
      reasoning: string;
      decided_at: string;
      decided_by: string;
    } | null;
    appeal?: {
      reason: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
      created_at: string;
      resolved_at: string | null;
      decision: string | null;
    } | null;
  }>;

  const currentDispute = disputes[disputes.length - 1];
  const [isFilingDispute, setIsFilingDispute] = useState(false);
  const isAdmin = (profile?.roles ?? []).some((r) => ["admin", "super_admin", "hitl"].includes(r));

  const canVerifyWaybill = escrow?.status === "FUNDS_LOCKED";
  const canSimulateDelivery = escrow?.status === "FUNDS_LOCKED";
  const canConfirmDelivery = escrow?.status === "DELIVERED_AWAITING_BUYER_CONFIRMATION";
  const isBuyerOnEscrow =
    !!user?.email && !!escrow?.buyer_email && user.email.toLowerCase() === escrow.buyer_email.toLowerCase();
  const isVendorOnEscrow = !!user?.uid && !!escrow?.seller_id && user.uid === escrow.seller_id;
  const canViewBuyerSensitiveInfo = isBuyerOnEscrow || isAdmin;
  const canViewVendorTools = isVendorOnEscrow || isAdmin;
  const canRateSeller =
    isBuyerOnEscrow &&
    !!escrow?.seller_id &&
    ["DISBURSED", "AWAITING_ADMIN_FINALIZATION"].includes(escrow.status);

  const isArchivedOrDisabled = !!escrow?.disabled || !!escrow?.archived_at;
  const reviewDeadlineLabel = useMemo(() => {
    if (!escrow?.review_deadline_at) {
      return null;
    }

    const deadline = new Date(escrow.review_deadline_at);
    if (Number.isNaN(deadline.getTime())) {
      return null;
    }

    return deadline.toLocaleString("en-NG", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [escrow?.review_deadline_at]);

  const handleShareOrCopyFeedbackLink = async () => {
    const link = `${window.location.origin.replace(/\/$/, "")}/feedback/${id}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `BorderSafe escrow ${escrow?.id ?? id}`,
          text: "Use this link to track the escrow and see payment feedback.",
          url: link,
        });
        return;
      } catch {
        // Fall back to clipboard if the native share sheet is dismissed or unavailable.
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(link);
    }
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

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
    setDeliveryError(null);
    try {
      await post("/api/logistics/simulate", { escrow_id: id });
      await refreshEscrow();
      toast({ message: "Delivery simulated successfully.", variant: "info" });
    } catch (err) {
      setDeliveryError(normalizeApiError(err));
    } finally {
      setIsDeliveryUpdating(false);
    }
  };

  const handleConfirmDelivery = async () => {
    if (!user || !canConfirmDelivery) return;
    setIsConfirming(true);
    setConfirmError(null);
    try {
      await post("/api/escrow/confirm-delivery", {
        escrow_id: id,
        ...(confirmationNotes.trim() ? { notes: confirmationNotes.trim() } : {}),
      });
      setConfirmationNotes("");
      await refreshEscrow();
      toast({ message: "Delivery confirmed.", variant: "success" });
    } catch (err) {
      setConfirmError(normalizeApiError(err));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleWaybillSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!waybillUrl.trim() && !waybillFile) return;
    setIsWaybillSubmitting(true);
    setWaybillError(null);
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
      toast({ message: "Waybill submitted for verification.", variant: "success" });
    } catch (err) {
      setWaybillError(normalizeApiError(err));
    } finally {
      setIsWaybillSubmitting(false);
    }
  };

  const handleAdminResolve = async (action: "approve" | "refund") => {
    if (!user || !isAdmin || escrow?.status !== "AWAITING_ADMIN_FINALIZATION") return;

    const label = action === "approve" ? "Approve seller" : "Refund buyer";
    const ok = await confirm({
      title: `${label} — are you sure?`,
      description:
        action === "approve"
          ? "This will release held funds to the seller. This action is irreversible."
          : "This will refund the held amount to the buyer. This action is irreversible.",
      confirmLabel: label,
      variant: action === "approve" ? "default" : "danger",
    });
    if (!ok) return;

    setIsAdminResolving(true);
    setAdminResolveError(null);
    setAdminResolveResult(null);
    try {
      const response = await post<AdminResolveResponse>("/api/admin/resolve", {
        escrow_id: id,
        action,
        admin_reasoning: action === "approve" ? "Approved after review" : "Refunded after review",
        appeal_eligible: true,
      });
      setAdminResolveResult(response);
      await refreshEscrow();
      toast({ message: `Resolution recorded: ${label}.`, variant: "success" });
    } catch (err) {
      setAdminResolveError(normalizeApiError(err));
    } finally {
      setIsAdminResolving(false);
    }
  };

  const statusMeta = escrow ? getEscrowStatusMeta(escrow.status) : null;

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      {/* Render confirm dialog portal */}
      {ConfirmDialogComponent}

      <header className="panel p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="heading-1">
              {escrow?.transaction_ref ?? id}
            </h1>
            <p className="mt-2 text-sm text-(--ink-muted)">
              Track the escrow state and upload evidence when prompted.
            </p>
          </div>
          {/* Live badge */}
          <span className="flex items-center gap-1.5 rounded-full border border-(--success)/30 bg-(--success)/8 px-3 py-1 text-xs font-semibold text-(--success)">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-(--success)" />
            Live
          </span>
        </div>
        {reviewDeadlineLabel && (
          <p className="mt-2 text-xs text-(--warning) font-semibold">
            ⏱ Review window closes {reviewDeadlineLabel}
          </p>
        )}
        {!isAuthLoading && !user && (
          <p className="mt-3 text-sm text-(--warning)">Sign in to view this escrow.</p>
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
              <p className="kicker mb-1">Status</p>
              {statusMeta && <span className={statusMeta.chipClass}>{statusMeta.label}</span>}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="panel-muted px-4 py-3">
                <p className="kicker mb-1">Amount</p>
                <p className="mt-1 font-semibold text-foreground">
                  {formatCurrency(escrow.amount, escrow.currency)}
                </p>
              </div>
              <div className="panel-muted px-4 py-3">
                <p className="kicker mb-1">Buyer email</p>
                <p className="mt-1 font-semibold text-foreground">
                  {canViewBuyerSensitiveInfo
                    ? escrow.buyer_email
                    : "Only visible to the buyer and admin"}
                </p>
              </div>
            </div>
            {escrow.description && (
              <div className="panel-muted px-4 py-3">
                <p className="kicker mb-1">Description</p>
                <p className="mt-1 font-semibold text-foreground">{escrow.description}</p>
              </div>
            )}
            {escrow.payment_checkout_url && canViewBuyerSensitiveInfo && !isArchivedOrDisabled && (
              <a
                className="btn-primary inline-flex items-center justify-center px-4 py-3 text-sm"
                href={escrow.payment_checkout_url}
                rel="noreferrer"
                target="_blank"
              >
                Open Squad checkout
              </a>
            )}
            {isVendorOnEscrow && !isArchivedOrDisabled ? (
              escrow.status === "AWAITING_PAYMENT" ? (
                <>
                  <button
                    className="btn-secondary inline-flex items-center justify-center px-4 py-3 text-sm"
                    onClick={() => setShowPaymentModal(true)}
                    type="button"
                  >
                    View payment details
                  </button>
                  {showPaymentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="fixed inset-0 bg-black/40" onClick={() => setShowPaymentModal(false)} />
                      <div className="panel z-10 w-full max-w-lg p-6">
                        <h3 className="heading-2">Payment details</h3>
                        <div className="mt-4 space-y-3 text-sm text-(--ink-muted)">
                          <div>

                            <p className="font-semibold text-foreground mt-1">{escrow.transaction_ref}</p>
                          </div>
                          <div>

                            <p className="font-semibold text-foreground mt-1">{escrow.status}</p>
                          </div>
                          {escrow.virtual_account && (
                            <>
                              <div>

                                <p className="font-semibold text-foreground mt-1">{escrow.virtual_account.account_number}</p>
                              </div>
                              <div>

                                <p className="font-semibold text-foreground mt-1">{escrow.virtual_account.account_name ?? "-"}</p>
                              </div>
                              <div>

                                <p className="font-semibold text-foreground mt-1">{escrow.virtual_account.bank_name ?? "-"}</p>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="mt-6 flex gap-2">
                          {escrow.payment_checkout_url ? (
                            <a
                              className="btn-primary inline-flex items-center justify-center px-4 py-2 text-sm"
                              href={escrow.payment_checkout_url}
                              rel="noreferrer noopener"
                              target="_blank"
                            >
                              Open checkout
                            </a>
                          ) : null}

                          <button
                            className="btn-outline px-4 py-2 text-sm"
                            onClick={() => {
                              const link = escrow.payment_checkout_url ?? escrow.checkout_url ?? "";
                              if (!link) return;
                              void handleCopy(link);
                            }}
                            type="button"
                          >
                            {copied ? "Copied!" : "Copy link"}
                          </button>

                          <button
                            className="btn-secondary px-4 py-2 text-sm"
                            onClick={async () => {
                              const link = escrow.payment_checkout_url ?? escrow.checkout_url ?? "";
                              if (!link) return;
                              if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
                                try {
                                  await navigator.share({
                                    title: `BorderSafe escrow ${escrow?.id ?? id}`,
                                    text: "Use this checkout link to complete payment.",
                                    url: link,
                                  });
                                } catch {
                                  // ignore
                                }
                              } else {
                                void handleCopy(link);
                              }
                            }}
                            type="button"
                          >
                            Share
                          </button>

                          <button
                            className="btn-ghost ml-auto px-3"
                            onClick={() => setShowPaymentModal(false)}
                            type="button"
                          >
                            Close
                          </button>
                        </div>



                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="btn-secondary inline-flex items-center justify-center px-4 py-3 text-sm"
                  onClick={() => void handleShareOrCopyFeedbackLink()}
                  type="button"
                >
                  {typeof navigator !== "undefined" && typeof navigator.share === "function"
                    ? "Share feedback link"
                    : "Copy feedback link"}
                </button>
              )
            ) : null}
            {isArchivedOrDisabled && (
              <div className="panel-muted mt-3 px-4 py-3 text-sm text-(--ink-muted)">
                <p className="font-semibold text-foreground">This escrow is archived or disabled</p>
                <p className="mt-1">Actions are disabled for this escrow.</p>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-(--ink-muted)">
            {isLoading ? "Loading escrow..." : "Escrow details not available."}
          </p>
        )}
      </section>
      {canViewBuyerSensitiveInfo && escrow && !isArchivedOrDisabled ? (
        <BuyerEscrowStatus escrow={escrow} isBuyer={isBuyerOnEscrow} />
      ) : null}

      {escrow?.refund ? <RefundStatus refund={escrow.refund} /> : null}

      {canViewVendorTools && !isArchivedOrDisabled ? (
      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Delivery status</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Logistics updates move the escrow into buyer confirmation and keep the order flow moving.
        </p>

        <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
          {escrow?.delivery ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">Delivered</p>
              <p>Source: {escrow.delivery.source}</p>
              <p>Delivered at: {formatDate(escrow.delivery.delivered_at)}</p>
              {escrow.delivery.notes && <p>Notes: {escrow.delivery.notes}</p>}
            </div>
          ) : (
            <p className="mt-2">Awaiting delivery confirmation.</p>
          )}
        </div>

        {/* Dev-only simulation tool — clearly labelled */}
        <div className="mt-4 rounded-2xl border border-(--warning)/25 bg-(--warning)/5 p-3">
          <p className="text-xs font-semibold text-(--warning)">⚠ Dev tool — simulates a logistics webhook</p>
          <p className="mt-0.5 text-xs text-(--ink-soft)">This button triggers a simulated delivery update. Remove in production.</p>
          <button
            className="btn-secondary mt-3 px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!user || !canSimulateDelivery || isDeliveryUpdating}
            onClick={handleSimulateDelivery}
            type="button"
          >
            {isDeliveryUpdating ? "Updating…" : "Simulate delivery"}
          </button>
          {deliveryError && (
            <p className="mt-2 text-xs text-(--danger)" role="alert">{deliveryError.message}</p>
          )}
        </div>
      </section>
      ) : null}

      {/* Vendor-only section — buyers should NOT see edit/archive actions */}
      {canViewVendorTools ? (
      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Vendor actions</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">Edit mutable escrow fields or archive this escrow.</p>

        <div className="mt-4 grid gap-3">
          {!isEditing ? (
            <div className="flex gap-2">
              <button
                className="btn-secondary px-4 py-2 text-sm"
                onClick={() => {
                  setEditDescription(escrow?.description ?? "");
                  setEditBuyerEmail(escrow?.buyer_email ?? "");
                  setEditError(null);
                  setIsEditing(true);
                }}
                type="button"
              >
                Edit escrow
              </button>
              <button
                className="btn-outline px-4 py-2 text-sm"
                onClick={async () => {
                  const ok = await confirm({
                    title: "Archive this escrow?",
                    description: "This will soft-delete the escrow locally. Actions will be disabled.",
                    confirmLabel: "Archive",
                    variant: "warning",
                  });
                  if (!ok) return;
                  setIsArchiving(true);
                  setArchiveError(null);
                  try {
                    await post(`/api/escrow/${id}/archive`);
                    await refreshEscrow();
                    toast({ message: "Escrow archived.", variant: "info" });
                  } catch (err) {
                    setArchiveError(normalizeApiError(err));
                  } finally {
                    setIsArchiving(false);
                  }
                }}
                type="button"
                disabled={isArchiving}
              >
                {isArchiving ? "Archiving…" : "Archive escrow"}
              </button>
            </div>
          ) : (
            <form
              className="grid gap-3"
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSavingEdit(true);
                setEditError(null);
                try {
                  await patch(`/api/escrow/${id}`, {
                    description: editDescription.trim() || undefined,
                    buyer_email: editBuyerEmail.trim() || undefined,
                  });
                  setIsEditing(false);
                  await refreshEscrow();
                  toast({ message: "Escrow updated.", variant: "success" });
                } catch (err) {
                  setEditError(normalizeApiError(err));
                } finally {
                  setIsSavingEdit(false);
                }
              }}
            >
              <div>
                <label className="kicker block mb-1" htmlFor="edit-description">Description</label>
                <input
                  id="edit-description"
                  className="input-field"
                  placeholder="e.g. 5 units of raw cassava, bulk order"
                  value={editDescription}
                  onChange={(ev) => setEditDescription(ev.target.value)}
                />
              </div>
              <div>
                <label className="kicker block mb-1" htmlFor="edit-buyer-email">Buyer email</label>
                <input
                  id="edit-buyer-email"
                  className="input-field"
                  placeholder="buyer@example.com"
                  type="email"
                  value={editBuyerEmail}
                  onChange={(ev) => setEditBuyerEmail(ev.target.value)}
                />
              </div>
              {editError && (
                <p className="text-sm text-(--danger)" role="alert">{editError.message}</p>
              )}
              <div className="flex gap-2">
                <button className="btn-primary px-4 py-2 text-sm" type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? "Saving…" : "Save changes"}
                </button>
                <button
                  className="btn-outline px-4 py-2 text-sm"
                  type="button"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
          {archiveError && (
            <p className="text-sm text-(--danger)" role="alert">{archiveError.message}</p>
          )}
        </div>
      </section>
      ) : null}

      {canViewBuyerSensitiveInfo && !isArchivedOrDisabled ? (
      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Buyer confirmation</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Confirm delivery to move this escrow to admin finalization.
        </p>

        <div className="panel-muted mt-4 px-4 py-3 text-sm text-(--ink-muted)">
          {escrow?.buyer_confirmation ? (
            <div className="mt-2 space-y-1">
              <p className="font-semibold text-foreground">Confirmed ✓</p>
              <p>Confirmed at: {formatDate(escrow.buyer_confirmation.confirmed_at)}</p>
              {escrow.buyer_confirmation.notes && <p>Notes: {escrow.buyer_confirmation.notes}</p>}
            </div>
          ) : (
            <p className="mt-2">Awaiting buyer confirmation.</p>
          )}
        </div>

        <div className="mt-4 grid gap-3">
          <div>
            <label className="kicker block mb-1" htmlFor="confirmation-notes">Notes <span className="font-normal normal-case text-(--ink-soft)">(optional)</span></label>
            <textarea
              id="confirmation-notes"
              className="textarea-field min-h-24"
              placeholder="e.g. Received all 5 items in good condition."
              maxLength={500}
              value={confirmationNotes}
              onChange={(event) => setConfirmationNotes(event.target.value)}
            />
            <p className="mt-1 text-xs text-(--ink-soft)">{confirmationNotes.length}/500 characters</p>
          </div>
          <button
            className="btn-primary px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!user || !canConfirmDelivery || isConfirming}
            onClick={handleConfirmDelivery}
            type="button"
          >
            {isConfirming ? "Confirming…" : "Confirm delivery"}
          </button>
          {confirmError && (
            <p className="text-sm text-(--danger)" role="alert">{confirmError.message}</p>
          )}
        </div>
      </section>
      ) : null}

      {canViewVendorTools && !isArchivedOrDisabled ? (
      <section className="panel p-5">
        <h2 className="text-sm font-semibold text-foreground">Waybill verification</h2>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Upload a waybill image or paste a hosted link. Available after funds are locked.
        </p>

        <form className="mt-4 grid gap-3" onSubmit={handleWaybillSubmit}>
          <div>
            <label className="kicker block mb-1" htmlFor="waybill-url">Waybill URL <span className="font-normal normal-case text-(--ink-soft)">(optional)</span></label>
            <input
              id="waybill-url"
              className="input-field"
              placeholder="https://example.com/waybill.jpg"
              value={waybillUrl}
              onChange={(event) => setWaybillUrl(event.target.value)}
            />
          </div>
          <div>
            <label className="kicker block mb-1" htmlFor="waybill-file">Or upload file <span className="font-normal normal-case text-(--ink-soft)">(JPG, PNG, PDF · max 6 MB)</span></label>
            <input
              id="waybill-file"
              className="input-field"
              type="file"
              accept="image/*,application/pdf"
              onChange={(event) => setWaybillFile(event.target.files?.[0] ?? null)}
            />
          </div>
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
            {isWaybillSubmitting ? "Uploading…" : "Verify waybill"}
          </button>
          {waybillError && (
            <p className="text-sm text-(--danger)" role="alert">{waybillError.message}</p>
          )}
        </form>

        {waybillResult && (
          <div className="panel-success mt-4 px-4 py-3 text-sm">
            <p className="font-semibold text-(--success)">Waybill {waybillResult.is_valid_waybill ? "verified ✓" : "could not be verified"}</p>
            <p className="mt-2 text-(--ink-muted)">Tracking: {waybillResult.tracking_number ?? "N/A"}</p>
            <p className="text-(--ink-muted)">Courier: {waybillResult.courier ?? "N/A"}</p>
          </div>
        )}
      </section>
      ) : null}

      {isAdmin && escrow?.status === "AWAITING_ADMIN_FINALIZATION" && !isArchivedOrDisabled ? (
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">Admin finalization</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">
            Use the AI result or buyer confirmation to approve the seller or refund the buyer.
            Both actions are <strong>irreversible</strong> — a confirmation step will appear.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button
              className="btn-success px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isAdminResolving}
              onClick={() => void handleAdminResolve("approve")}
              type="button"
            >
              {isAdminResolving ? "Processing…" : "Approve seller"}
            </button>
            <button
              className="btn-danger px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isAdminResolving}
              onClick={() => void handleAdminResolve("refund")}
              type="button"
            >
              Refund buyer
            </button>
          </div>

          {adminResolveError && (
            <p className="mt-3 text-sm text-(--danger)" role="alert">{adminResolveError.message}</p>
          )}

          {adminResolveResult && (
            <div className="panel-success mt-4 px-4 py-3 text-sm">
              <p className="font-semibold text-(--success)">Resolution recorded ✓</p>
              <p className="mt-2 text-(--ink-muted)">Action: {adminResolveResult.action === "approve" ? "Seller approved" : "Buyer refunded"}</p>
              <p className="text-(--ink-muted)">Status: {getEscrowStatusMeta(adminResolveResult.status).label}</p>
              <p className="text-(--ink-muted)">Decided at: {formatDate(adminResolveResult.decided_at)}</p>
            </div>
          )}
        </section>
      ) : null}

      {canViewBuyerSensitiveInfo && escrow?.seller_id ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="space-y-3">
            <SellerMiniProfile sellerId={escrow.seller_id} />
            <SellerReviews sellerId={escrow.seller_id} />
          </div>
          <SellerRatingForm
            escrowId={id}
            sellerId={escrow.seller_id}
            isVisible={canRateSeller}
          />
        </div>
      ) : null}

      {canViewBuyerSensitiveInfo && escrow?.seller_id ? <SellerComparisonCard sellerId={escrow.seller_id} /> : null}

      {canViewBuyerSensitiveInfo ? <SaferAlternativesWidget currentSellerId={escrow?.seller_id ?? null} /> : null}

      {/* Disputes Section */}
      {canViewBuyerSensitiveInfo && escrow && !currentDispute && (
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">File a dispute</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">If something went wrong with your order, file a dispute and attach evidence to start the review.</p>

          {!isFilingDispute ? (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsFilingDispute(true)}
                className="btn-secondary px-4 py-3 text-sm"
              >
                File a dispute
              </button>
            </div>
          ) : (
            <div className="mt-6">
              <DisputeForm
                escrowId={id}
                onCancel={() => setIsFilingDispute(false)}
                onDisputeFiled={async () => {
                  setIsFilingDispute(false);
                  await refreshDisputes();
                  await refreshEscrow();
                }}
              />
            </div>
          )}
        </section>
      )}

      {currentDispute && (
        <section className="panel p-5">
          <h2 className="text-sm font-semibold text-foreground">Dispute</h2>
          <p className="mt-2 text-sm text-(--ink-muted)">
            Track the dispute timeline and respond with evidence if needed.
          </p>

          <div className="mt-6">
            <DisputeTimeline
              dispute={currentDispute as Parameters<typeof DisputeTimeline>[0]["dispute"]}
              userRole={user?.uid === escrow?.seller_id ? "seller" : "buyer"}
            />
          </div>

          {/* Dispute Response Form - only show if there's an open dispute and user is seller */}
          {currentDispute && user?.uid === escrow?.seller_id && currentDispute.status === "OPEN" && (
            <div className="mt-6">
              <DisputeResponseForm
                escrowId={id}
                isOpen={true}
                onSuccess={() => {
                  refreshDisputes();
                }}
              />
            </div>
          )}

          {/* Admin decision form - only visible to admins when dispute is open */}
          {currentDispute && isAdmin && currentDispute.status === "OPEN" && (
            <div className="mt-6">
              <DisputeDecisionForm
                escrowId={id}
                disputeId={currentDispute.id}
                onSuccess={async () => {
                  await refreshDisputes();
                  await refreshEscrow();
                }}
              />
            </div>
          )}

          {/* Appeal Component - only show if there's an admin decision and user is seller */}
          {user?.uid === escrow?.seller_id && (
            <div className="mt-6">
              <AppealComponent
                escrowId={id}
                hasAdminDecision={!!currentDispute.admin_decision}
                isAppealPending={currentDispute.appeal?.status === "PENDING"}
                onSuccess={() => {
                  refreshDisputes();
                }}
              />
            </div>
          )}
        </section>
      )}

      {error && (
        <section className="panel-danger p-5 text-sm" role="alert">
          <p className="font-semibold text-(--danger)">{error.title}</p>
          <p className="mt-1 text-(--ink-muted)">{error.message}</p>
          {error.correlationId && (
            <p className="mt-2 text-xs text-(--ink-soft) font-mono">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </section>
      )}
    </main>
  );
}
