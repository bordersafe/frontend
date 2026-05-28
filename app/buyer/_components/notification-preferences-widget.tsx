"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";

import { useAuthedApi } from "@/lib/api/auth-client";
import type {
  BuyerNotificationPreferenceItem,
  BuyerNotificationPreferencesResponse,
} from "@/lib/api";

type NotificationPreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  category: "order" | "security" | "promotions";
};

export function NotificationPreferencesWidget() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "order-shipped",
      label: "Order shipped",
      description: "Get notified when your seller ships the order",
      enabled: true,
      category: "order",
    },
    {
      id: "order-delivered",
      label: "Order delivered",
      description: "Get notified when your order arrives",
      enabled: true,
      category: "order",
    },
    {
      id: "dispute-updates",
      label: "Dispute updates",
      description: "Real-time updates on your dispute status and admin decisions",
      enabled: true,
      category: "order",
    },
    {
      id: "refund-processed",
      label: "Refund processed",
      description: "Notification when your refund is issued",
      enabled: true,
      category: "order",
    },
    {
      id: "seller-response",
      label: "Seller response",
      description: "When a seller responds to your dispute claim",
      enabled: true,
      category: "order",
    },
    {
      id: "security-alerts",
      label: "Security alerts",
      description: "New login, unusual activity, or suspicious transactions",
      enabled: true,
      category: "security",
    },
    {
      id: "new-seller-deals",
      label: "New seller deals",
      description: "Exclusive offers from your favorite sellers",
      enabled: false,
      category: "promotions",
    },
    {
      id: "buyer-campaigns",
      label: "Buyer campaigns",
      description: "Special buyer protections, discounts, and rewards programs",
      enabled: false,
      category: "promotions",
    },
  ]);

  const [savingPreferenceId, setSavingPreferenceId] = useState<string | null>(null);
  const { get, patch, user, isAuthLoading } = useAuthedApi();

  const { data, mutate } = useSWR<BuyerNotificationPreferencesResponse>(
    !isAuthLoading && user ? ["buyer-notification-preferences", user.uid] : null,
    async () => get<BuyerNotificationPreferencesResponse>("/api/escrow/buyer/notification-preferences"),
    { revalidateOnFocus: false }
  );

  useEffect(() => {
    if (!data?.items) {
      return;
    }

    const enabledMap = new Map<string, boolean>(
      data.items.map((item: BuyerNotificationPreferenceItem) => [item.id, item.enabled])
    );

    setPreferences((prev) =>
      prev.map((preference) => ({
        ...preference,
        enabled: enabledMap.has(preference.id)
          ? Boolean(enabledMap.get(preference.id))
          : preference.enabled,
      }))
    );
  }, [data]);

  const handleToggle = async (id: string) => {
    const previous = preferences;
    const updated = previous.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setPreferences(updated);

    const nextItem = updated.find((p) => p.id === id);
    if (!nextItem) {
      return;
    }

    try {
      setSavingPreferenceId(id);
      await patch("/api/escrow/buyer/notification-preferences", {
        id,
        enabled: nextItem.enabled,
      });
      await mutate();
    } catch {
      setPreferences(previous);
    } finally {
      setSavingPreferenceId(null);
    }
  };

  const groupedPreferences = {
    order: preferences.filter((p) => p.category === "order"),
    security: preferences.filter((p) => p.category === "security"),
    promotions: preferences.filter((p) => p.category === "promotions"),
  };

  return (
    <section className="space-y-6">
      {/* Order Notifications */}
      <div className="panel p-5">
        <h3 className="font-semibold text-foreground">Order & Dispute Notifications</h3>
        <p className="mt-1 text-xs text-(--ink-soft)">
          Stay updated on orders, shipments, and dispute progress
        </p>
        <div className="mt-4 space-y-3">
          {groupedPreferences.order.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                <p className="text-xs text-(--ink-muted)">{pref.description}</p>
              </div>
              <label className="ml-4 relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref.enabled}
                  onChange={() => handleToggle(pref.id)}
                  disabled={savingPreferenceId === pref.id}
                  aria-label={pref.label}
                  title={pref.label}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-(--primary) rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notifications */}
      <div className="panel p-5 border-l-4 border-l-red-500">
        <h3 className="font-semibold text-foreground">Security Alerts</h3>
        <p className="mt-1 text-xs text-(--ink-soft)">
          We always send security alerts—manage how you receive them
        </p>
        <div className="mt-4 space-y-3">
          {groupedPreferences.security.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                <p className="text-xs text-(--ink-muted)">{pref.description}</p>
              </div>
              <label className="ml-4 relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref.enabled}
                  onChange={() => handleToggle(pref.id)}
                  disabled
                  aria-label={pref.label}
                  title={pref.label}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-(--primary) rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary) disabled:opacity-75 disabled:cursor-not-allowed"></div>
              </label>
            </div>
          ))}
          <p className="rounded-lg bg-red-50 p-3 text-xs text-red-700">
            ℹ️ Security notifications cannot be disabled for your account protection.
          </p>
        </div>
      </div>

      {/* Promotional Notifications */}
      <div className="panel p-5">
        <h3 className="font-semibold text-foreground">Promotional & Campaign Emails</h3>
        <p className="mt-1 text-xs text-(--ink-soft)">
          New deals, buyer rewards, and platform updates
        </p>
        <div className="mt-4 space-y-3">
          {groupedPreferences.promotions.map((pref) => (
            <div key={pref.id} className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{pref.label}</p>
                <p className="text-xs text-(--ink-muted)">{pref.description}</p>
              </div>
              <label className="ml-4 relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={pref.enabled}
                  onChange={() => handleToggle(pref.id)}
                  disabled={savingPreferenceId === pref.id}
                  aria-label={pref.label}
                  title={pref.label}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-(--primary) rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-(--primary)"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
