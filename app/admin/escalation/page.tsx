"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";
import { normalizeApiError } from "@/lib/api";

type Policy = {
  policy_id: string;
  name: string;
  service_name: string;
  steps: any[];
  enabled: boolean;
};

export default function EscalationPage() {
  const { get, post } = useAuthedApi();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newService, setNewService] = useState("");
  const [newStepsJson, setNewStepsJson] = useState("[]");

  const loadPolicies = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await get<any>("/api/admin/escalation/policies");
      setPolicies(res.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [get]);

  const createPolicy = async () => {
    try {
      const steps = JSON.parse(newStepsJson || "[]");
      await post("/api/admin/escalation/policies", { name: newName, service_name: newService, steps });
      setNewName("");
      setNewService("");
      setNewStepsJson("[]");
      await loadPolicies();
    } catch (err) {
      console.error(normalizeApiError(err));
    }
  };

  const trigger = async (policyId: string) => {
    try {
      await post(`/api/admin/escalation/trigger/${policyId}`, { reason: "operator" });
      alert("Escalation triggered");
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPolicies();
  }, [loadPolicies]);

  return (
    <main className="p-6">
      <header>
        <h1 className="heading-1">Escalation Policies</h1>
      </header>

      <section className="mt-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="panel p-4">
            <h2 className="heading-2">Create Policy</h2>
            <div className="mt-3 space-y-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Policy name" className="input-field" aria-label="Policy name" />
              <input value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Service name" className="input-field" aria-label="Service name" />
              <textarea value={newStepsJson} onChange={(e) => setNewStepsJson(e.target.value)} className="input-field" rows={6} aria-label="Policy steps JSON" />
              <div className="flex gap-2">
                <button className="btn-primary" onClick={createPolicy} type="button">Create</button>
              </div>
            </div>
          </div>

          <div className="panel p-4">
            <h2 className="heading-2">Existing Policies</h2>
            <div className="mt-3 space-y-2">
              {isLoading && <p>Loading...</p>}
              {!isLoading && policies.length === 0 && <p className="text-(--ink-muted)">No policies</p>}
              {policies.map((p) => (
                <div key={p.policy_id} className="rounded p-3 bg-(--surface-soft)">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-(--ink-muted)">{p.service_name}</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="btn-secondary" onClick={() => trigger(p.policy_id)}>Trigger</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
