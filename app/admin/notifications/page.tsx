"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type NotificationEvent = {
  event_id: string;
  user_id: string;
  event_type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  read_at?: string;
};

type NotificationPreference = {
  user_id: string;
  event_type: string;
  channels: ("EMAIL" | "PUSH" | "IN_APP" | "WEBHOOK")[];
  enabled: boolean;
  updated_at: string;
};

type NotificationStatistics = {
  total_notifications: number;
  read_count: number;
  unread_count: number;
  read_percentage: number;
  event_type_breakdown: Record<string, number>;
  period_days: number;
};

type TabType = "unread" | "all" | "preferences" | "statistics";

export default function NotificationsRealtimePage() {
  const { user, profile, isAuthLoading, get, patch, post, delete: del, put } = useAuthedApi();

  const [activeTab, setActiveTab] = useState<TabType>("unread");
  const [error, setError] = useState<UiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Unread tab
  const [unreadNotifications, setUnreadNotifications] = useState<NotificationEvent[]>([]);
  const [isLoadingUnread, setIsLoadingUnread] = useState(false);

  // All notifications tab
  const [allNotifications, setAllNotifications] = useState<NotificationEvent[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(false);
  const [dayFilter, setDayFilter] = useState(30);

  // Preferences tab
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [editingPreference, setEditingPreference] = useState<NotificationPreference | null>(null);

  // Statistics tab
  const [statistics, setStatistics] = useState<NotificationStatistics | null>(null);
  const [isLoadingStatistics, setIsLoadingStatistics] = useState(false);
  const [statsDay, setStatsDay] = useState(30);

  // Load unread
  const loadUnread = useCallback(async () => {
    setIsLoadingUnread(true);
    setError(null);

    try {
      const response = await get<any>("/api/notifications/unread?limit=50");
      setUnreadNotifications(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingUnread(false);
    }
  }, [get]);

  // Load all notifications
  const loadAllNotifications = useCallback(async () => {
    setIsLoadingAll(true);
    setError(null);

    try {
      const response = await get<any>(`/api/notifications?limit=100&days=${dayFilter}`);
      setAllNotifications(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingAll(false);
    }
  }, [get, dayFilter]);

  // Load preferences
  const loadPreferences = useCallback(async () => {
    setIsLoadingPreferences(true);
    setError(null);

    try {
      const response = await get<any>("/api/notifications/preferences");
      setPreferences(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [get]);

  // Load statistics
  const loadStatistics = useCallback(async () => {
    setIsLoadingStatistics(true);
    setError(null);

    try {
      const response = await get<NotificationStatistics>(`/api/notifications/statistics?days=${statsDay}`);
      setStatistics(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingStatistics(false);
    }
  }, [get, statsDay]);

  // Mark as read
  const markAsRead = async (eventId: string) => {
    try {
      await patch(`/api/notifications/${eventId}/read`, {});
      await loadUnread();
      await loadAllNotifications();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await post("/api/notifications/read-all", {});
      await loadUnread();
      await loadAllNotifications();
      setSuccess("All notifications marked as read");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Delete notification
  const deleteNotification = async (eventId: string) => {
    try {
      await del(`/api/notifications/${eventId}`);
      await loadUnread();
      await loadAllNotifications();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Save preference
  const savePreference = async (eventType: string, channels: string[], enabled: boolean) => {
    try {
      await put(`/api/notifications/preferences/${eventType}`, {
        channels,
        enabled,
      });
      await loadPreferences();
      setSuccess("Preference updated");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "unread") {
      loadUnread();
    }
  }, [activeTab, loadUnread]);

  useEffect(() => {
    if (activeTab === "all") {
      loadAllNotifications();
    }
  }, [activeTab, loadAllNotifications]);

  useEffect(() => {
    if (activeTab === "preferences") {
      loadPreferences();
    }
  }, [activeTab, loadPreferences]);

  useEffect(() => {
    if (activeTab === "statistics") {
      loadStatistics();
    }
  }, [activeTab, loadStatistics]);

  if (isAuthLoading) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading...
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Notifications & Real-time Updates</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Manage notifications, preferences, and real-time communication.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {success && (
        <section className="panel-outline p-5 text-sm bg-(--success-soft)">
          <p className="font-semibold text-(--success)">{success}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border) overflow-x-auto">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "unread"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("unread")}
          type="button"
        >
          Unread
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "all"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("all")}
          type="button"
        >
          All Notifications
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "preferences"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("preferences")}
          type="button"
        >
          Preferences
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "statistics"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("statistics")}
          type="button"
        >
          Statistics
        </button>
      </div>

      {/* Unread Tab */}
      {activeTab === "unread" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Unread Notifications</h2>
              {unreadNotifications.length > 0 && (
                <button
                  className="btn-secondary text-sm px-3 py-2"
                  onClick={markAllAsRead}
                  type="button"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            {isLoadingUnread ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading notifications...</p>
            ) : unreadNotifications.length > 0 ? (
              <div className="mt-6 space-y-3">
                {unreadNotifications.map((notif) => (
                  <div key={notif.event_id} className="rounded-lg border border-(--action-soft) bg-(--surface-soft) p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{notif.title}</p>
                        <p className="mt-1 text-sm text-(--ink-muted)">{notif.message}</p>
                        <p className="mt-2 text-xs text-(--ink-soft)">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn-secondary text-xs px-2 py-1"
                          onClick={() => markAsRead(notif.event_id)}
                          type="button"
                        >
                          Mark Read
                        </button>
                        <button
                          className="btn-tertiary text-xs px-2 py-1"
                          onClick={() => deleteNotification(notif.event_id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--success)">✓ No unread notifications</p>
            )}
          </div>
        </section>
      )}

      {/* All Notifications Tab */}
      {activeTab === "all" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">All Notifications</h2>
              <select
                className="select-field text-sm"
                value={dayFilter}
                onChange={(e) => setDayFilter(parseInt(e.target.value))}
                aria-label="Notification period"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </div>

            {isLoadingAll ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading notifications...</p>
            ) : allNotifications.length > 0 ? (
              <div className="mt-6 space-y-3">
                {allNotifications.map((notif) => (
                  <div
                    key={notif.event_id}
                    className={`rounded-lg p-4 ${
                      notif.read ? "border border-(--ink-border) bg-background" : "border border-(--action-soft) bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{notif.title}</p>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-(--action)"></span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-(--ink-muted)">{notif.message}</p>
                        <p className="mt-2 text-xs text-(--ink-soft)">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        className="btn-tertiary text-xs px-2 py-1"
                        onClick={() => deleteNotification(notif.event_id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No notifications</p>
            )}
          </div>
        </section>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Notification Preferences</h2>

            {isLoadingPreferences ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading preferences...</p>
            ) : preferences.length > 0 ? (
              <div className="mt-6 space-y-4">
                {preferences.map((pref) => (
                  <div key={pref.event_type} className="rounded-lg border border-(--ink-border) p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground capitalize">
                          {pref.event_type.replace(/_/g, " ")}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-muted)">
                          Channels: {pref.channels.join(", ")}
                        </p>
                        <p className={`mt-1 text-xs font-semibold ${
                          pref.enabled ? "text-(--success)" : "text-(--ink-soft)"
                        }`}>
                          {pref.enabled ? "✓ Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <input
                          className="w-4 h-4 rounded"
                          type="checkbox"
                          checked={pref.enabled}
                          onChange={(e) => savePreference(pref.event_type, pref.channels, e.target.checked)}
                          aria-label={`Toggle ${pref.event_type}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">
                No notification preferences configured yet
              </p>
            )}
          </div>
        </section>
      )}

      {/* Statistics Tab */}
      {activeTab === "statistics" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Notification Statistics</h2>
              <select
                className="select-field text-sm"
                value={statsDay}
                onChange={(e) => setStatsDay(parseInt(e.target.value))}
                aria-label="Statistics period"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </div>

            {isLoadingStatistics ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading statistics...</p>
            ) : statistics ? (
              <div className="mt-6 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="rounded-lg bg-(--surface-soft) p-4">

                    <p className="mt-2 text-3xl font-bold text-foreground">{statistics.total_notifications}</p>
                  </div>

                  <div className="rounded-lg bg-(--success-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--success)">Read</p>
                    <p className="mt-2 text-3xl font-bold text-(--success)">{statistics.read_count}</p>
                  </div>

                  <div className="rounded-lg bg-(--warn-soft) p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-(--warn)">Unread</p>
                    <p className="mt-2 text-3xl font-bold text-(--warn)">{statistics.unread_count}</p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">

                    <p className="mt-2 text-3xl font-bold text-foreground">
                      {Math.round(statistics.read_percentage)}%
                    </p>
                  </div>

                  <div className="rounded-lg bg-(--surface-soft) p-4">

                    <p className="mt-2 text-3xl font-bold text-foreground">{statistics.period_days}d</p>
                  </div>
                </div>

                {Object.keys(statistics.event_type_breakdown).length > 0 && (
                  <div className="rounded-lg bg-(--surface-soft) p-4">
                    <p className="font-semibold text-foreground">Event Type Breakdown</p>
                    <div className="mt-3 space-y-2">
                      {Object.entries(statistics.event_type_breakdown).map(([type, count]) => (
                        <div key={type} className="flex justify-between text-sm">
                          <span className="text-(--ink-muted) capitalize">{type.replace(/_/g, " ")}</span>
                          <span className="font-semibold text-foreground">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </section>
      )}
    </main>
  );
}
