/**
 * Central mapping from backend status enums → human-readable labels,
 * status-chip CSS classes, and tonal colour hints.
 *
 * Import from "@/lib/status-labels" everywhere — never surface raw enums.
 */

export type StatusMeta = {
  /** Short human label, e.g. "Awaiting Payment" */
  label: string;
  /** CSS classes to apply to a .status-chip element */
  chipClass: string;
  /** Tailwind tonal background + text for inline badges */
  tone: string;
};

const ESCROW_STATUS_MAP: Record<string, StatusMeta> = {
  AWAITING_PAYMENT: {
    label: "Awaiting Payment",
    chipClass: "status-chip status-awaiting-payment",
    tone: "bg-(--warning)/10 text-(--warning)",
  },
  FUNDS_LOCKED: {
    label: "Funds Locked",
    chipClass: "status-chip status-funds-locked",
    tone: "bg-(--info)/10 text-(--info)",
  },
  DELIVERED_AWAITING_BUYER_CONFIRMATION: {
    label: "Awaiting Confirmation",
    chipClass: "status-chip status-delivered",
    tone: "bg-(--warning)/10 text-(--warning)",
  },
  AWAITING_ADMIN_FINALIZATION: {
    label: "Under Review",
    chipClass: "status-chip status-admin-finalization",
    tone: "bg-(--info)/10 text-(--info)",
  },
  DISBURSED: {
    label: "Paid Out",
    chipClass: "status-chip status-disbursed",
    tone: "bg-(--success)/10 text-(--success)",
  },
  REFUNDED: {
    label: "Refunded",
    chipClass: "status-chip status-refunded",
    tone: "bg-(--danger)/10 text-(--danger)",
  },
};

const PAYOUT_STATUS_MAP: Record<string, StatusMeta> = {
  PENDING: {
    label: "Pending",
    chipClass: "status-chip status-awaiting-payment",
    tone: "bg-(--warning)/10 text-(--warning)",
  },
  PROCESSING: {
    label: "Processing",
    chipClass: "status-chip status-funds-locked",
    tone: "bg-(--info)/10 text-(--info)",
  },
  COMPLETED: {
    label: "Completed",
    chipClass: "status-chip status-disbursed",
    tone: "bg-(--success)/10 text-(--success)",
  },
  FAILED: {
    label: "Failed",
    chipClass: "status-chip status-refunded",
    tone: "bg-(--danger)/10 text-(--danger)",
  },
};

const DISPUTE_STATUS_MAP: Record<string, StatusMeta> = {
  OPEN: {
    label: "Open",
    chipClass: "status-chip status-awaiting-payment",
    tone: "bg-(--warning)/10 text-(--warning)",
  },
  RESOLVED: {
    label: "Resolved",
    chipClass: "status-chip status-disbursed",
    tone: "bg-(--success)/10 text-(--success)",
  },
  APPEALED: {
    label: "Appealed",
    chipClass: "status-chip status-admin-finalization",
    tone: "bg-(--info)/10 text-(--info)",
  },
};

const FALLBACK_META = (raw: string): StatusMeta => ({
  label: raw
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" "),
  chipClass: "status-chip",
  tone: "bg-(--ink-soft)/10 text-(--ink-soft)",
});

export function getEscrowStatusMeta(status: string): StatusMeta {
  return ESCROW_STATUS_MAP[status] ?? FALLBACK_META(status);
}

export function getPayoutStatusMeta(status: string): StatusMeta {
  return PAYOUT_STATUS_MAP[status] ?? FALLBACK_META(status);
}

export function getDisputeStatusMeta(status: string): StatusMeta {
  return DISPUTE_STATUS_MAP[status] ?? FALLBACK_META(status);
}
