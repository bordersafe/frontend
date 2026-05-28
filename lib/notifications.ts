/**
 * Client-side notification store for seller events.
 * Tracks payment received, delivery confirmed, admin decisions, etc.
 */

export type NotificationType = "payment" | "delivery" | "admin-decision" | "dispute" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  escrowId?: string;
  read: boolean;
  action?: {
    label: string;
    href: string;
  };
}

class NotificationStore {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<() => void> = new Set();

  subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notify() {
    this.listeners.forEach((listener) => listener());
  }

  add(notification: Omit<Notification, "id" | "timestamp" | "read">): string {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const full: Notification = {
      ...notification,
      id,
      timestamp: new Date(),
      read: false,
    };
    this.notifications.set(id, full);
    this.notify();
    return id;
  }

  upsert(notification: Omit<Notification, "timestamp"> & { timestamp: string }) {
    const id = notification.id;
    const full: Notification = {
      ...notification,
      id,
      timestamp: new Date(notification.timestamp),
      read: !!notification.read,
    } as Notification;
    this.notifications.set(id, full);
    this.notify();
    return id;
  }

  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  getUnread(): Notification[] {
    return this.getAll().filter((n) => !n.read);
  }

  mark(id: string, read: boolean): void {
    const notif = this.notifications.get(id);
    if (notif) {
      notif.read = read;
      this.notify();
    }
  }

  remove(id: string): void {
    this.notifications.delete(id);
    this.notify();
  }

  clear(): void {
    this.notifications.clear();
    this.notify();
  }
}

export const notificationStore = new NotificationStore();

// Convenience helpers for common seller events
export const notifyPaymentReceived = (escrowId: string, amount: number) => {
  return notificationStore.add({
    type: "payment",
    title: "Payment Received",
    message: `Funds locked for ₦${amount.toLocaleString("en-NG")}. Awaiting delivery confirmation.`,
    escrowId,
    action: {
      label: "View Escrow",
      href: `/escrow/${escrowId}`,
    },
  });
};

export const notifyDeliveryConfirmed = (escrowId: string) => {
  return notificationStore.add({
    type: "delivery",
    title: "Delivery Confirmed",
    message: "Buyer confirmed receipt of goods. Awaiting final processing.",
    escrowId,
    action: {
      label: "View Escrow",
      href: `/escrow/${escrowId}`,
    },
  });
};

export const notifyAdminDecision = (
  escrowId: string,
  decision: "disbursed" | "refunded",
) => {
  const messages = {
    disbursed: "Your funds have been disbursed to your wallet.",
    refunded:
      "Admin issued a refund. Please check the details in your escrow.",
  };
  return notificationStore.add({
    type: "admin-decision",
    title: decision === "disbursed" ? "Funds Disbursed" : "Refund Issued",
    message: messages[decision],
    escrowId,
    action: {
      label: "View Escrow",
      href: `/escrow/${escrowId}`,
    },
  });
};

export const notifyDispute = (escrowId: string) => {
  return notificationStore.add({
    type: "dispute",
    title: "Dispute Raised",
    message: "The buyer has raised a dispute. Review the evidence and respond if needed.",
    escrowId,
    action: {
      label: "Review Dispute",
      href: `/escrow/${escrowId}`,
    },
  });
};
