"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";
import type { UiError } from "@/lib/api";

type UserSession = {
  session_id: string;
  user_id: string;
  ip_address: string;
  device_type: string;
  last_activity: string;
  created_at: string;
  expires_at: string;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
};

type ActivityLog = {
  activity_id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  status: string;
  timestamp: string;
  duration_ms: number;
};

type UserPresence = {
  user_id: string;
  status: "ONLINE" | "IDLE" | "OFFLINE";
  last_activity: string;
  current_route?: string;
};

type TabType = "sessions" | "activity" | "presence" | "online-users";

export default function UserActivityPage() {
  const { user, profile, isAuthLoading, get, post, delete: del } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");

  const [activeTab, setActiveTab] = useState<TabType>("sessions");
  const [error, setError] = useState<UiError | null>(null);

  // Sessions tab
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  // Activity tab
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityDays, setActivityDays] = useState(30);

  // Presence tab
  const [presence, setPresence] = useState<UserPresence | null>(null);
  const [isLoadingPresence, setIsLoadingPresence] = useState(false);

  // Online users tab
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([]);
  const [isLoadingOnlineUsers, setIsLoadingOnlineUsers] = useState(false);

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/sessions");
      setSessions(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingSessions(false);
    }
  }, [get]);

  // Load activity logs
  const loadActivityLogs = useCallback(async () => {
    setIsLoadingActivity(true);
    setError(null);

    try {
      const response = await get<any>(`/api/admin/activity-logs?limit=100&days=${activityDays}`);
      setActivities(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingActivity(false);
    }
  }, [get, activityDays]);

  // Load presence
  const loadPresence = useCallback(async () => {
    setIsLoadingPresence(true);
    setError(null);

    try {
      const response = await get<UserPresence>("/api/admin/presence");
      setPresence(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingPresence(false);
    }
  }, [get]);

  // Load online users
  const loadOnlineUsers = useCallback(async () => {
    if (!isAdminUser) return;

    setIsLoadingOnlineUsers(true);
    setError(null);

    try {
      const response = await get<any>("/api/admin/online-users");
      setOnlineUsers(response.items || []);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoadingOnlineUsers(false);
    }
  }, [get, isAdminUser]);

  // Terminate session
  const terminateSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to terminate this session?")) {
      return;
    }

    try {
      await del(`/api/admin/sessions/${sessionId}`);
      await loadSessions();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  // Terminate all sessions
  const terminateAllSessions = async () => {
    if (!confirm("This will terminate all your sessions. Are you sure?")) {
      return;
    }

    try {
      await post("/api/admin/sessions/terminate-all", {});
      await loadSessions();
    } catch (err) {
      setError(normalizeApiError(err));
    }
  };

  useEffect(() => {
    if (activeTab === "sessions") {
      loadSessions();
    }
  }, [activeTab, loadSessions]);

  useEffect(() => {
    if (activeTab === "activity") {
      loadActivityLogs();
    }
  }, [activeTab, loadActivityLogs]);

  useEffect(() => {
    if (activeTab === "presence") {
      loadPresence();
    }
  }, [activeTab, loadPresence]);

  useEffect(() => {
    if (activeTab === "online-users") {
      loadOnlineUsers();
    }
  }, [activeTab, loadOnlineUsers]);

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
        <h1 className="heading-1">User Activity & Sessions</h1>
        <p className="mt-2 text-sm text-(--ink-muted)">
          Monitor sessions, activity logs, and user presence.
        </p>
      </header>

      {error && (
        <section className="panel-outline p-5 text-sm text-(--ink-muted)">
          <p className="font-semibold text-foreground">{error.title}</p>
          <p className="mt-1">{error.message}</p>
        </section>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-(--ink-border) overflow-x-auto">
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "sessions"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("sessions")}
          type="button"
        >
          Sessions
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "activity"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("activity")}
          type="button"
        >
          Activity Logs
        </button>
        <button
          className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
            activeTab === "presence"
              ? "border-b-2 border-(--action) text-(--action)"
              : "text-(--ink-muted) hover:text-foreground"
          }`}
          onClick={() => setActiveTab("presence")}
          type="button"
        >
          Presence
        </button>
        {isAdminUser && (
          <button
            className={`px-4 py-3 text-sm font-semibold transition-colors whitespace-nowrap ${
              activeTab === "online-users"
                ? "border-b-2 border-(--action) text-(--action)"
                : "text-(--ink-muted) hover:text-foreground"
            }`}
            onClick={() => setActiveTab("online-users")}
            type="button"
          >
            Online Users
          </button>
        )}
      </div>

      {/* Sessions Tab */}
      {activeTab === "sessions" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Active Sessions</h2>
              {sessions.some((s) => s.status === "ACTIVE") && (
                <button
                  className="btn-secondary text-sm px-3 py-2"
                  onClick={terminateAllSessions}
                  type="button"
                >
                  Terminate All
                </button>
              )}
            </div>

            {isLoadingSessions ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading sessions...</p>
            ) : sessions.length > 0 ? (
              <div className="mt-6 space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.session_id}
                    className={`rounded-lg p-4 ${
                      session.status === "ACTIVE"
                        ? "border border-(--ink-border) bg-background"
                        : "border border-(--ink-border) bg-(--surface-soft)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{session.device_type}</p>
                          <span className={`rounded px-2 py-1 text-xs font-semibold ${
                            session.status === "ACTIVE"
                              ? "bg-(--success-soft) text-(--success)"
                              : "bg-(--surface-soft) text-(--ink-muted)"
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <p className="mt-2 text-xs font-mono text-(--ink-muted)">{session.ip_address}</p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Created: {new Date(session.created_at).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Last Activity: {new Date(session.last_activity).toLocaleString()}
                        </p>
                        <p className="mt-1 text-xs text-(--ink-soft)">
                          Expires: {new Date(session.expires_at).toLocaleString()}
                        </p>
                      </div>
                      {session.status === "ACTIVE" && (
                        <button
                          className="btn-tertiary text-xs px-3 py-2"
                          onClick={() => terminateSession(session.session_id)}
                          type="button"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No active sessions</p>
            )}
          </div>
        </section>
      )}

      {/* Activity Logs Tab */}
      {activeTab === "activity" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="heading-2">Activity Logs</h2>
              <select
                className="select-field text-sm"
                value={activityDays}
                onChange={(e) => setActivityDays(parseInt(e.target.value))}
                aria-label="Activity period"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
              </select>
            </div>

            {isLoadingActivity ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading activity logs...</p>
            ) : activities.length > 0 ? (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-(--ink-border)">
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Timestamp</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Action</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Resource</th>
                      <th className="px-3 py-2 text-left font-semibold text-foreground">Status</th>
                      <th className="px-3 py-2 text-right font-semibold text-foreground">Duration (ms)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activities.map((activity) => (
                      <tr key={activity.activity_id} className="border-b border-(--ink-border) hover:bg-(--surface-soft)">
                        <td className="px-3 py-2 text-xs text-(--ink-muted)">
                          {new Date(activity.timestamp).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 text-xs font-semibold text-foreground">
                          {activity.action}
                        </td>
                        <td className="px-3 py-2 text-xs text-(--ink-muted)">
                          {activity.resource_type} ({activity.resource_id})
                        </td>
                        <td className={`px-3 py-2 text-xs font-semibold ${
                          activity.status === "SUCCESS" ? "text-(--success)" : "text-(--danger)"
                        }`}>
                          {activity.status}
                        </td>
                        <td className="px-3 py-2 text-xs text-right text-(--ink-muted)">
                          {activity.duration_ms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No activity logs</p>
            )}
          </div>
        </section>
      )}

      {/* Presence Tab */}
      {activeTab === "presence" && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Your Presence</h2>

            {isLoadingPresence ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading presence...</p>
            ) : presence ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg bg-(--surface-soft) p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      presence.status === "ONLINE"
                        ? "bg-(--success)"
                        : presence.status === "IDLE"
                        ? "bg-(--warn)"
                        : "bg-(--ink-soft)"
                    }`} />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground capitalize">
                        {presence.status.toLowerCase()}
                      </p>
                      <p className="mt-1 text-xs text-(--ink-muted)">
                        Last activity: {new Date(presence.last_activity).toLocaleString()}
                      </p>
                      {presence.current_route && (
                        <p className="mt-1 text-xs text-(--ink-muted)">
                          Current route: {presence.current_route}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      )}

      {/* Online Users Tab */}
      {activeTab === "online-users" && isAdminUser && (
        <section className="space-y-6">
          <div className="panel p-6">
            <h2 className="heading-2">Online Users</h2>

            {isLoadingOnlineUsers ? (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">Loading online users...</p>
            ) : onlineUsers.length > 0 ? (
              <div className="mt-6 space-y-3">
                {onlineUsers.map((user) => (
                  <div key={user.user_id} className="rounded-lg border border-(--ink-border) p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          user.status === "ONLINE"
                            ? "bg-(--success)"
                            : user.status === "IDLE"
                            ? "bg-(--warn)"
                            : "bg-(--ink-soft)"
                        }`} />
                        <div>
                          <p className="font-semibold text-foreground text-sm">
                            {user.user_id}
                          </p>
                          <p className="mt-1 text-xs text-(--ink-muted)">
                            {user.status} • Last activity: {new Date(user.last_activity).toLocaleString()}
                          </p>
                          {user.current_route && (
                            <p className="mt-1 text-xs text-(--ink-soft)">
                              Route: {user.current_route}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-center text-sm text-(--ink-muted)">No users currently online</p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
