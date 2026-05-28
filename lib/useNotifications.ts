/**
 * React hook for consuming notifications from the store.
 * Subscribes to store changes and triggers re-render on notification updates.
 */
"use client";

import { useEffect, useState } from "react";
import { notificationStore, Notification } from "./notifications";
import { useAuthedApi } from "@/lib/api/auth-client";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { get, post } = useAuthedApi();

  useEffect(() => {
    // hydrate from local store
    setNotifications(notificationStore.getAll());

    // subscribe to local store updates
    const unsubscribe = notificationStore.subscribe(() => {
      setNotifications(notificationStore.getAll());
    });

    // fetch persisted notifications for the signed-in user and upsert into store
    (async () => {
      try {
        const res = await get<{
          notifications?: Array<{
            id: string | number;
            type: string;
            title: string;
            message: string;
            created_at: string;
            escrow_id?: string | null;
            read?: boolean;
          }>;
        }>("/api/notifications");

        if (res?.notifications && Array.isArray(res.notifications)) {
          for (const n of res.notifications) {
            // server returns ISO timestamp and read flag
            notificationStore.upsert({
              id: String(n.id),
              type: n.type,
              title: n.title,
              message: n.message,
              timestamp: n.created_at,
              escrowId: n.escrow_id ?? undefined,
              read: !!n.read,
            } as any);
          }
        }
      } catch (err) {
        // ignore fetch errors and keep using in-memory notifications
        console.debug("Failed to fetch persisted notifications:", err);
      }
    })();

    return unsubscribe;
  }, [get]);

  return {
    notifications,
    unread: notifications.filter((n) => !n.read),
    unreadCount: notifications.filter((n) => !n.read).length,
    mark: async (id: string, read: boolean) => {
      notificationStore.mark(id, read);
      try {
        await post(`/api/notifications/${id}/mark`, { read });
      } catch (err) {
        console.debug("Failed to mark notification on server:", err);
      }
    },
    remove: (id: string) => notificationStore.remove(id),
    clear: () => notificationStore.clear(),
  };
}
