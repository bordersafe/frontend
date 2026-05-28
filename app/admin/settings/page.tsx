"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type TabType = "preferences" | "notifications" | "activity";

type AdminConfig = {
  admin_id: string;
  auto_approve_threshold?: number;
  sla_queue_timeout_minutes?: number;
  sla_review_timeout_minutes?: number;
  high_risk_threshold?: number;
  fraud_watchlist_auto_add_score?: number;
  bulk_operation_max_size?: number;
  daily_workload_limit?: number;
  enable_ai_suggestions?: boolean;
  enable_auto_escalation?: boolean;
  enable_fraud_screening?: boolean;
  preferred_decision_quality?: "SPEED" | "ACCURACY";
};

type ActivitySummary = {
  admin_id: string;
  period_days: number;
  cases_resolved: number;
  avg_resolution_time_minutes: number;
  cases_by_decision: Record<string, number>;
  sla_attainment_percent: number;
  total_disputes_handled: number;
  override_count: number;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  event_type: string;
  read: boolean;
  created_at: string;
};

export default function AdminSettingsPage() {
  const { user, profile, isAuthLoading, get, patch, put } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("preferences");
  const [error, setError] = useState<UiError | null>(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Preferences tab state
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [configForm, setConfigForm] = useState<Partial<AdminConfig>>({});

  // Notifications tab state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<"EMAIL" | "SLACK" | "WEBHOOK">("EMAIL");
  const [channelConfig, setChannelConfig] = useState<any>(null);

  // Activity tab state
  const [activity, setActivity] = useState<ActivitySummary | null>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityDays, setActivityDays] = useState(7);

  // Load config
  const loadConfig = useCallback(async () => {
    setIsLoadingConfig(true);
    setError(null);

    try {
      const response = await get<AdminConfig>("/api/admin/settings/config");
      setConfig(response);
      setConfigForm(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingConfig(false);
    }
  }, [get]);

  // Save config
  const saveConfig = async () => {
    setIsSavingConfig(true);
    setError(null);

    try {
      const response = await patch<AdminConfig>("/api/admin/settings/config", configForm);
      setConfig(response);
      setSuccessMessage("Settings saved successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsSavingConfig(false);
    }
  };

  // Load notifications
  const loadNotifications = useCallback(async () => {
    setIsLoadingNotifications(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/notifications?unread_only=false&limit=20");
      setNotifications(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingNotifications(false);
    }
  }, [get]);

  // Load activity
  const loadActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    setError(null);

    try {
      const response = await get<ActivitySummary>(`/api/admin/activity-summary?days=${activityDays}`);
      setActivity(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingActivity(false);
    }
  }, [get, activityDays]);

  // Load channel config
  const loadChannelConfig = useCallback(
    async (channel: string) => {
      try {
        const response = await get<any>(`/api/admin/settings/notifications/${channel}`);
        setChannelConfig(response);
      } catch (err) {
        setError(normalizeApiError(err));
      }
    },
    [get]
  );

  // Save channel config
  const saveChannelConfig = async () => {
    try {
      const response = await put<any>(`/api/admin/settings/notifications/${selectedChannel}`, channelConfig);
      setChannelConfig(response);
      setSuccessMessage("Notification settings saved");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "preferences" && !config) {
      loadConfig();
    }
  }, [activeTab, config, loadConfig]);

  useEffect(() => {
    if (activeTab === "notifications" && notifications.length === 0) {
      loadNotifications();
    }
  }, [activeTab, notifications.length, loadNotifications]);

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivity();
    }
  }, [activeTab, loadActivity]);

  useEffect(() => {
    if (showNotificationSettings && !channelConfig) {
      loadChannelConfig(selectedChannel);
    }
  }, [showNotificationSettings, selectedChannel, channelConfig, loadChannelConfig]);

  if (isAuthLoading) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6 text-center text-sm text-(--ink-muted)">
          Loading...
        </section>
      </main>
    );
  }

  if (!isAdminUser) {
    return (
      <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
        <section className="panel p-6">
          <h1 className="heading-1">Access Denied</h1>
          <p className="mt-2 text-sm text-(--ink-muted)">
            You don't have permission to access admin settings.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-full flex-col gap-6 px-4 py-6 sm:px-8 lg:px-10">
      <header className="panel p-6">
        <h1 className="heading-1">Admin Settings</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Manage your preferences, notifications, and view activity summary.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {successMessage && (
        <section className="panel-success p-5 text-sm">
          <p className="font-semibold">{successMessage}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border)">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
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
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "notifications"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("notifications")}
          type="button"
        >
          Notifications
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === "activity"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("activity")}
          type="button"
        >
          Activity
        </button>
      </div>

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
        <section className="space-y-6">
          {isLoadingConfig ? (
            <div className="panel p-6 text-center text-sm text-(--ink-muted)">
              Loading preferences...
            </div>
          ) : (
            <div className="panel p-6">
              <h2 className="heading-2">Decision & Review Settings</h2>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                {/* Auto-Approve Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Auto-Approve Confidence Threshold
                  </label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Auto-approve confidence threshold"
                    value={configForm.auto_approve_threshold || 95}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        auto_approve_threshold: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-(--ink-muted)">
                    Cases with confidence above this % will auto-approve
                  </p>
                </div>

                {/* Decision Quality */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Preferred Decision Quality
                  </label>
                  <select
                    className="select-field mt-2 text-sm"
                    value={configForm.preferred_decision_quality || "ACCURACY"}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        preferred_decision_quality: e.target.value as any,
                      })
                    }
                    aria-label="Select decision quality preference"
                  >
                    <option value="ACCURACY">Accuracy (thorough review)</option>
                    <option value="SPEED">Speed (faster processing)</option>
                  </select>
                </div>

                {/* Queue Timeout */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Queue Timeout (minutes)
                  </label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    min="30"
                    max="480"
                    aria-label="Queue timeout in minutes"
                    value={configForm.sla_queue_timeout_minutes || 120}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        sla_queue_timeout_minutes: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-(--ink-muted)">
                    Time before case escalation from queue
                  </p>
                </div>

                {/* Review Timeout */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Review Timeout (minutes)
                  </label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    min="30"
                    max="240"
                    aria-label="Review timeout in minutes"
                    value={configForm.sla_review_timeout_minutes || 60}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        sla_review_timeout_minutes: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-(--ink-muted)">
                    Time before escalation during review
                  </p>
                </div>

                {/* High Risk Threshold */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    High Risk Threshold
                  </label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="High risk threshold"
                    value={configForm.high_risk_threshold || 50}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        high_risk_threshold: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-(--ink-muted)">
                    Seller risk score requiring manual review
                  </p>
                </div>

                {/* Fraud Watchlist Score */}
                <div>
                  <label className="block text-sm font-semibold text-foreground">
                    Fraud Auto-Watchlist Score
                  </label>
                  <input
                    className="input-field mt-2 text-sm"
                    type="number"
                    min="0"
                    max="100"
                    aria-label="Fraud auto-watchlist score"
                    value={configForm.fraud_watchlist_auto_add_score || 70}
                    onChange={(e) =>
                      setConfigForm({
                        ...configForm,
                        fraud_watchlist_auto_add_score: parseInt(e.target.value),
                      })
                    }
                  />
                  <p className="mt-1 text-xs text-(--ink-muted)">
                    Auto-add to watchlist if fraud risk ≥ this score
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3 border-t border-(--ink-border) pt-6">
                <h3 className="heading-3">Feature Toggles</h3>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">AI Suggestions</p>
                    <p className="text-xs text-(--ink-muted)">Enable AI-powered decision suggestions</p>
                  </div>
                  <button
                    className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
                      configForm.enable_ai_suggestions
                        ? "bg-(--action) text-(--action-ink)"
                        : "bg-(--surface-soft) text-foreground"
                    }`}
                    onClick={() =>
                      setConfigForm({
                        ...configForm,
                        enable_ai_suggestions: !configForm.enable_ai_suggestions,
                      })
                    }
                    type="button"
                  >
                    {configForm.enable_ai_suggestions ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Auto Escalation</p>
                    <p className="text-xs text-(--ink-muted)">Auto-escalate based on SLA thresholds</p>
                  </div>
                  <button
                    className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
                      configForm.enable_auto_escalation
                        ? "bg-(--action) text-(--action-ink)"
                        : "bg-(--surface-soft) text-foreground"
                    }`}
                    onClick={() =>
                      setConfigForm({
                        ...configForm,
                        enable_auto_escalation: !configForm.enable_auto_escalation,
                      })
                    }
                    type="button"
                  >
                    {configForm.enable_auto_escalation ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">Fraud Screening</p>
                    <p className="text-xs text-(--ink-muted)">Analyze fraud risk on all escrows</p>
                  </div>
                  <button
                    className={`px-4 py-2 text-xs font-semibold rounded transition-colors ${
                      configForm.enable_fraud_screening
                        ? "bg-(--action) text-(--action-ink)"
                        : "bg-(--surface-soft) text-foreground"
                    }`}
                    onClick={() =>
                      setConfigForm({
                        ...configForm,
                        enable_fraud_screening: !configForm.enable_fraud_screening,
                      })
                    }
                    type="button"
                  >
                    {configForm.enable_fraud_screening ? "Enabled" : "Disabled"}
                  </button>
                </div>
              </div>

              <button
                className="btn-primary mt-6 px-4 py-2 text-sm disabled:opacity-60"
                onClick={saveConfig}
                disabled={isSavingConfig}
                type="button"
              >
                {isSavingConfig ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <section className="space-y-6">
          {showNotificationSettings ? (
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="heading-2">{selectedChannel} Notifications</h2>
                <button
                  className="btn-outline text-xs px-3 py-2"
                  onClick={() => setShowNotificationSettings(false)}
                  type="button"
                >
                  Back
                </button>
              </div>

              {channelConfig && (
                <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground">Enable {selectedChannel}</label>
                    <div className="mt-2 flex gap-2">
                      <button
                        className={`px-3 py-2 text-xs font-semibold rounded ${
                          channelConfig.enabled
                            ? "bg-(--action) text-(--action-ink)"
                            : "bg-(--surface-soft) text-foreground"
                        }`}
                        onClick={() =>
                          setChannelConfig({
                            ...channelConfig,
                            enabled: !channelConfig.enabled,
                          })
                        }
                        type="button"
                      >
                        {channelConfig.enabled ? "Enabled" : "Disabled"}
                      </button>
                    </div>
                  </div>

                  {selectedChannel === "EMAIL" && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground">Email Address</label>
                      <input
                        className="input-field mt-2 text-sm"
                        type="email"
                        aria-label="Email address for notifications"
                        value={channelConfig.config?.email || ""}
                        onChange={(e) =>
                          setChannelConfig({
                            ...channelConfig,
                            config: {
                              ...channelConfig.config,
                              email: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}

                  {selectedChannel === "SLACK" && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground">Slack Webhook URL</label>
                      <input
                        className="input-field mt-2 text-sm font-mono"
                        type="text"
                        placeholder="https://hooks.slack.com/..."
                        aria-label="Slack webhook URL"
                        value={channelConfig.config?.slack_webhook_url || ""}
                        onChange={(e) =>
                          setChannelConfig({
                            ...channelConfig,
                            config: {
                              ...channelConfig.config,
                              slack_webhook_url: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-foreground">Event Types</label>
                    <div className="mt-3 space-y-2">
                      {(channelConfig.event_types || []).map((evt: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            className="w-4 h-4 rounded"
                            type="checkbox"
                            aria-label={`Enable ${evt.event} notifications`}
                            checked={evt.enabled}
                            onChange={(e) => {
                              const updated = [...channelConfig.event_types];
                              updated[idx].enabled = e.target.checked;
                              setChannelConfig({
                                ...channelConfig,
                                event_types: updated,
                              });
                            }}
                          />
                          <span className="text-sm text-foreground">{evt.event}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn-primary px-4 py-2 text-sm"
                    onClick={saveChannelConfig}
                    type="button"
                  >
                    Save Notification Settings
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="panel p-6">
              <h2 className="heading-2">Notification Preferences</h2>

              {isLoadingNotifications ? (
                <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading notifications...</p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {["EMAIL", "SLACK", "IN_APP", "WEBHOOK"].map((channel) => (
                    <div
                      key={channel}
                      className="rounded-lg border border-(--ink-border) p-4"
                    >
                      <h3 className="font-semibold text-foreground">{channel}</h3>
                      <button
                        className="btn-secondary mt-3 w-full text-xs py-2"
                        onClick={() => {
                          setSelectedChannel(channel as any);
                          setShowNotificationSettings(true);
                          setChannelConfig(null);
                        }}
                        type="button"
                      >
                        Configure
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 border-t border-(--ink-border) pt-6">
                <h3 className="heading-3">Recent Notifications</h3>
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="mt-3 rounded-lg bg-(--surface-soft) p-3">
                    <p className="text-sm font-semibold text-foreground">{notif.title}</p>
                    <p className="text-xs text-(--ink-muted)">{notif.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Activity Tab */}
      {activeTab === "activity" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Activity Summary</h2>
              <select
                className="select-field text-sm"
                value={activityDays}
                onChange={(e) => setActivityDays(parseInt(e.target.value))}
                aria-label="Select period for activity"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            {isLoadingActivity ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading activity...</p>
            ) : activity ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">{activity.cases_resolved}</p>
                </div>
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {activity.avg_resolution_time_minutes}m
                  </p>
                </div>
                <div className="rounded-lg bg-(--success-soft) p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-(--success)">SLA Attainment</p>
                  <p className="mt-2 text-3xl font-bold text-(--success)">
                    {activity.sla_attainment_percent}%
                  </p>
                </div>
                <div className="rounded-lg bg-(--surface-soft) p-4">

                  <p className="mt-2 text-3xl font-bold text-foreground">
                    {activity.total_disputes_handled}
                  </p>
                </div>
              </div>
            ) : null}

            {activity && (
              <div className="mt-6 border-t border-(--ink-border) pt-6">
                <h3 className="heading-3">Decision Breakdown</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {Object.entries(activity.cases_by_decision).map(([decision, count]: [string, any]) => (
                    <div key={decision} className="flex justify-between rounded-lg bg-(--surface-soft) p-3">
                      <span className="text-sm font-semibold text-foreground">{decision}</span>
                      <span className="text-sm font-bold text-(--action)">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
