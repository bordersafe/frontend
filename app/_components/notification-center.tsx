/**
 * Notification display component for seller notifications.
 * Renders as dismissible toast panels in the bottom-right corner.
 */
"use client";

import Link from "next/link";
import { useNotifications } from "@/lib/useNotifications";
import { Notification } from "@/lib/notifications";

// ─── Notification type config ─────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: string; panelClass: string; accentClass: string }
> = {
  payment:        { icon: "💰", panelClass: "bg-(--success-soft) border-(--success)/25",  accentClass: "border-(--success)" },
  delivery:       { icon: "📦", panelClass: "bg-(--info-soft)    border-(--info)/25",      accentClass: "border-(--info)" },
  "admin-decision": { icon: "✅", panelClass: "bg-(--success-soft) border-(--success)/25", accentClass: "border-(--success)" },
  dispute:        { icon: "⚠️", panelClass: "bg-(--warning-soft) border-(--warning)/25",  accentClass: "border-(--warning)" },
  info:           { icon: "ℹ️", panelClass: "bg-(--info-soft)    border-(--info)/25",     accentClass: "border-(--info)" },
};

// ─── Single notification ──────────────────────────────────────────────────────

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const cfg = TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.info;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ${cfg.panelClass} border-l-4 ${cfg.accentClass} px-4 py-3.5 shadow-(--card-shadow) backdrop-blur animate-in`}
      style={{ animation: "reveal-up 0.3s cubic-bezier(0.18,0.86,0.26,1) both" }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{cfg.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">{notification.title}</p>
            <p className="mt-0.5 text-xs text-(--ink-muted) line-clamp-2">{notification.message}</p>
            {notification.action && (
              <Link
                href={notification.action.href}
                className="mt-1.5 inline-block text-xs font-semibold text-(--primary) hover:underline"
              >
                {notification.action.label} →
              </Link>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full text-xs text-(--ink-soft) hover:bg-black/8 hover:text-foreground transition-colors"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// ─── Toast stack ─────────────────────────────────────────────────────────────

export function NotificationCenter() {
  const { notifications, mark, remove } = useNotifications();
  const unread = notifications.filter((n) => !n.read);

  if (unread.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] space-y-2"
      // Push up on mobile to clear bottom nav
      style={{ bottom: "calc(var(--bottom-nav-height, 0px) + 1rem)" }}
      aria-live="polite"
      aria-label="Notifications"
    >
      {unread.slice(0, 3).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onDismiss={() => {
            mark(notification.id, true);
            remove(notification.id);
          }}
        />
      ))}
      {unread.length > 3 && (
        <div className="panel px-4 py-2 text-center">
          <p className="text-xs font-semibold text-(--ink-muted)">
            +{unread.length - 3} more notification{unread.length > 4 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Bell icon in header ──────────────────────────────────────────────────────

export function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="#notifications"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/80 text-(--ink-muted) hover:bg-white hover:text-foreground shadow-sm transition-all"
      title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "Notifications"}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V5a1 1 0 10-2 0v.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-(--danger) px-1 text-[10px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
