"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

export default function EscalationReportsPage() {
  const { get } = useAuthedApi();
  const [states, setStates] = useState<any[]>([]);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  const loadStates = useCallback(async () => {
    const res = await get<any>("/api/admin/escalation/states");
    setStates(res.items || []);
  }, [get]);

  useEffect(() => {
    loadStates();
  }, [loadStates]);

  const loadDeliveries = useCallback(async (alertId: string) => {
    const res = await get<any>(`/api/admin/escalation/deliveries/${alertId}`);
    setSelectedAlertId(alertId);
    setDeliveries(res.items || []);
  }, [get]);

  const exportReport = useCallback((format: "csv" | "json") => {
    window.open(`/api/admin/escalation/reports/export?format=${format}`, "_blank", "noopener,noreferrer");
  }, []);

  return (
    <main className="p-6">
      <h1 className="heading-1">Escalation Audit Reports</h1>
      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={() => exportReport("csv")}>Export CSV</button>
        <button className="btn" onClick={() => exportReport("json")}>Export JSON</button>
      </div>
      <section className="mt-4">
        <h2 className="heading-2">Active States</h2>
        <div className="mt-3 space-y-2">
          {states.map((s) => (
            <div key={s.state_id} className="p-3 rounded bg-(--surface-soft)">
              <p className="font-semibold">{s.policy_id} • Step {s.current_step}</p>
              <p className="text-xs text-(--ink-muted)">Started: {new Date(s.started_at).toLocaleString()}</p>
              <p className="text-xs text-(--ink-muted)">Resolved: {s.resolved ? "Yes" : "No"}</p>
              {s.last_alert_id ? (
                <button className="btn mt-2" onClick={() => loadDeliveries(s.last_alert_id)}>View Deliveries</button>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="heading-2">Deliveries {selectedAlertId ? `(${selectedAlertId})` : ""}</h2>
        <div className="mt-3 space-y-2">
          {deliveries.map((d) => (
            <div key={d.delivery_id} className="p-3 rounded bg-(--surface-soft)">
              <p className="font-semibold">Recipient: {d.recipient_id}</p>
              <p className="text-xs text-(--ink-muted)">Confirmed: {d.confirmed_at ? new Date(d.confirmed_at).toLocaleString() : "No"}</p>
            </div>
          ))}
          {deliveries.length === 0 ? <p className="text-sm text-(--ink-muted)">No deliveries loaded.</p> : null}
        </div>
      </section>
    </main>
  );
}
