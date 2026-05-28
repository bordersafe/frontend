"use client";

import Link from "next/link";
import type { EscrowDetail } from "@/lib/api/types";

type BuyerEscrowStatusProps = {
  escrow: EscrowDetail;
  isBuyer: boolean;
};

const STATUS_PHASES: Record<
  string,
  {
    label: string;
    description: string;
    protection: string;
    daysExpected: number | null;
  }
> = {
  FUNDS_LOCKED: {
    label: "Payment Secured",
    description: "Your funds are locked in escrow. Seller is preparing shipment.",
    protection:
      "Your money is 100% protected and cannot be released without your confirmation.",
    daysExpected: 3,
  },
  DELIVERED_AWAITING_BUYER_CONFIRMATION: {
    label: "Goods Arrived",
    description: "Goods have been delivered. You have 48 hours to confirm or dispute.",
    protection: "Confirm only after inspecting goods. If they don't match, open a dispute instead.",
    daysExpected: null,
  },
  DISBURSED: {
    label: "Order Complete",
    description:
      "Payment released to seller. You can still open a dispute within 30 days if issues arise.",
    protection: "Disputes filed after 30 days may not be eligible for auto-refund.",
    daysExpected: null,
  },
  AWAITING_ADMIN_FINALIZATION: {
    label: "Under Review",
    description: "Our team is finalizing this order. Updates will be sent shortly.",
    protection:
      "If disputes are pending, they will be reviewed within 24 hours per our SLA.",
    daysExpected: null,
  },
};

function getNextAction(status: string): string {
  if (status === "FUNDS_LOCKED") {
    return "Wait for delivery. Track shipment in the order timeline.";
  }

  if (status === "DELIVERED_AWAITING_BUYER_CONFIRMATION") {
    return "Confirm delivery after inspecting goods. You have 48 hours.";
  }

  if (status === "AWAITING_ADMIN_FINALIZATION") {
    return "Our team is working on this. Check back for updates.";
  }

  return "Order complete.";
}

function getDaysRemaining(status: string, createdAt: string | null): string | null {
  if (!createdAt || !["FUNDS_LOCKED", "DELIVERED_AWAITING_BUYER_CONFIRMATION"].includes(status)) {
    return null;
  }

  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const daysElapsed = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (status === "FUNDS_LOCKED") {
    const daysRemaining = Math.max(0, 7 - daysElapsed);
    return daysRemaining > 0 ? `${daysRemaining} days before auto-escalation` : "Auto-escalation triggered";
  }

  if (status === "DELIVERED_AWAITING_BUYER_CONFIRMATION") {
    const daysRemaining = Math.max(0, 2 - Math.ceil((diffMs - 3 * 24 * 60 * 60 * 1000) / (1000 * 60 * 60 * 24)));
    return daysRemaining > 0 ? `${daysRemaining} days to confirm` : "Confirmation window expired";
  }

  return null;
}

export function BuyerEscrowStatus({ escrow, isBuyer }: BuyerEscrowStatusProps) {
  if (!isBuyer) {
    return null;
  }

  const statusInfo = STATUS_PHASES[escrow.status];
  if (!statusInfo) {
    return null;
  }

  const daysRemaining = getDaysRemaining(escrow.status, escrow.created_at);

  return (
    <section className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50 to-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>

          <h3 className="mt-2 text-lg font-semibold text-foreground">{statusInfo.label}</h3>
          <p className="mt-1 text-sm text-(--ink-muted)">{statusInfo.description}</p>
        </div>
        <div className="rounded-lg bg-sky-500 px-3 py-1 text-xs font-semibold text-white">
          Protected
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-sky-100 bg-sky-100/50 p-3">
        <p className="text-sm font-semibold text-sky-900">🛡️ {statusInfo.protection}</p>
      </div>

      {daysRemaining && (
        <p className="mt-3 text-xs text-(--ink-muted)">
          <span className="font-semibold text-(--ink-primary)">{daysRemaining}</span>
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-sm text-(--ink-muted)">
          <strong>Next action:</strong> {getNextAction(escrow.status)}
        </p>
        <Link
          href="/trust-center"
          className="text-xs font-semibold text-(--primary) hover:underline"
        >
          Learn More
        </Link>
      </div>
    </section>
  );
}
