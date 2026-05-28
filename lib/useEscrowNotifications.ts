/**
 * Hook to detect escrow status changes and trigger notifications.
 * Monitors escrow data and fires notifications when key status transitions occur.
 */
"use client";

import { useEffect, useRef } from "react";
import { EscrowDetail } from "@/lib/api/types";
import {
  notifyPaymentReceived,
  notifyDeliveryConfirmed,
  notifyAdminDecision,
} from "@/lib/notifications";

type EscrowStatus = EscrowDetail["status"];

export function useEscrowNotifications(escrow: EscrowDetail | undefined) {
  const prevStatusRef = useRef<EscrowStatus | null>(null);

  useEffect(() => {
    if (!escrow) return;

    const prevStatus = prevStatusRef.current;
    const currentStatus = escrow.status;

    // Payment received
    if (prevStatus === "AWAITING_PAYMENT" && currentStatus === "FUNDS_LOCKED") {
      notifyPaymentReceived(escrow.id, escrow.amount);
    }

    // Delivery confirmed by buyer
    if (
      prevStatus === "FUNDS_LOCKED" &&
      currentStatus === "DELIVERED_AWAITING_BUYER_CONFIRMATION"
    ) {
      notifyDeliveryConfirmed(escrow.id);
    }

    // Admin decision made
    if (
      (prevStatus === "AWAITING_ADMIN_FINALIZATION" ||
        prevStatus === "DISPUTE_ADJUDICATION") &&
      (currentStatus === "DISBURSED" || currentStatus === "REFUNDED")
    ) {
      notifyAdminDecision(escrow.id, currentStatus === "DISBURSED" ? "disbursed" : "refunded");
    }

    prevStatusRef.current = currentStatus;
  }, [escrow]);
}
