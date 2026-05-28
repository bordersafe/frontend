"use client";

import { useCallback, useEffect, useState } from "react";
import { normalizeApiError } from "@/lib/api";
import { useAuthedApi } from "@/lib/api/auth-client";

type Anomaly = { type: string; [key: string]: any };

type Alert = {
  alert_id: string;
  service_name: string;
  alert_type: string;
  severity: string;
  message: string;
  created_at: string;
  resolved_at?: string | null;
};

export default function MonitoringPage() {
  const { user, profile, isAuthLoading, get, post, patch } = useAuthedApi();
  const isAdminUser = profile?.roles?.includes("admin") || profile?.roles?.includes("hitl");
  const isSuperAdmin = profile?.roles?.includes("super_admin");

  const [activeTab, setActiveTab] = useState<"alerts" | "anomalies" | "remediation">("alerts");
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hours, setHours] = useState(1);

  const loadAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await get<any>("/api/admin/monitoring/alerts");
      setAlerts(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const loadAnomalies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await get<any>(`/api/admin/monitoring/anomalies?hours=${hours}`);
      setAnomalies(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [get, hours]);

  const runAnomalyChecks = async () => {
    try {
      await post("/api/admin/monitoring/run-anomaly-checks", {});
      await loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const remediate = async (serviceId: string) => {
    try {
      await post(`/api/admin/monitoring/remediate/${serviceId}`, { reason: "operator_initiated" });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (activeTab === "anomalies") loadAnomalies();
  }, [activeTab, loadAnomalies]);

  if (isAuthLoading) return <div>Loading...</div>;
  if (!isAdminUser) return <div>Access Denied</div>;

  return (
    <main className="p-6">
      <header className="mb-4">
        <h1 className="heading-1">Monitoring</h1>
      </header>

      <div className="flex gap-2 mb-4">
        <button className={`px-3 py-2 ${activeTab === "alerts" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("alerts")}>
          Alerts
        </button>
        <button className={`px-3 py-2 ${activeTab === "anomalies" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("anomalies")}>
          Anomalies
        </button>
        <button className={`px-3 py-2 ${activeTab === "remediation" ? "btn-primary" : "btn-secondary"}`} onClick={() => setActiveTab("remediation")}>
          Remediation
        </button>
      </div>

      {activeTab === "alerts" && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-2">Recent Alerts</h2>
            <button className="btn-secondary" onClick={() => loadAlerts()}>
              Refresh
            </button>
          </div>

          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a.alert_id} className="p-3 rounded bg-(--surface-soft)">
                <div className="flex justify-between">
                  <div>
                    <p className="font-semibold">{a.message}</p>
                    <p className="text-xs text-(--ink-muted)">{a.service_name} • {a.alert_type}</p>
                  </div>
                  <div className="flex gap-2">
                    {!a.resolved_at && (
                      <button className="btn-secondary text-sm" onClick={async () => { await patch(`/api/admin/monitoring/alerts/${a.alert_id}/resolve`, {}); await loadAlerts(); }}>
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "anomalies" && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-2">Anomalies</h2>
            <div className="flex gap-2">
              <select aria-label="Anomaly period" value={hours} onChange={(e) => setHours(parseInt(e.target.value))} className="select-field">
                <option value={1}>Last 1 hour</option>
                <option value={6}>Last 6 hours</option>
                <option value={24}>Last 24 hours</option>
              </select>
              <button className="btn-secondary" onClick={loadAnomalies}>Check</button>
              {isSuperAdmin && <button className="btn-primary" onClick={runAnomalyChecks}>Run Scheduled Checks</button>}
            </div>
          </div>

          <div className="space-y-2">
            {anomalies.length === 0 && <p className="text-(--ink-muted)">No anomalies detected</p>}
            {anomalies.map((an, idx) => (
              <div key={idx} className="p-3 rounded bg-(--surface-soft)">
                <p className="font-semibold">{an.type}</p>
                <pre className="mt-2 text-xs text-(--ink-muted)">{JSON.stringify(an, null, 2)}</pre>
                {an.endpoint && <div className="mt-2"><button className="btn-secondary" onClick={() => remediate(an.endpoint)}>Remediate</button></div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "remediation" && (
        <section>
          <h2 className="heading-2">Remediation Tasks</h2>
          <p className="text-sm text-(--ink-muted)">Tasks are created when remediation is scheduled.</p>
        </section>
      )}
    </main>
  );
}
