"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthedApi } from "@/lib/api/auth-client";

export default function OncallPage() {
  const { get, post, put, delete: deleteReq } = useAuthedApi();
  const [rotations, setRotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await get<any>("/api/admin/oncall/rotations");
      setRotations(res.items || []);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    load();
  }, [load]);

  async function notify(rotationId: string) {
    await post(`/api/admin/oncall/notify/${rotationId}`, { subject: "Test paging", message: "This is a test" });
    alert("Notified (queued)");
  }

  async function sync(rotationId: string) {
    await post(`/api/admin/oncall/rotations/${rotationId}/sync`, {});
    alert("Sync requested");
  }

  async function removeRotation(rotationId: string) {
    if (!confirm("Delete this rotation?")) return;
    await deleteReq(`/api/admin/oncall/rotations/${rotationId}`);
    await load();
  }

  async function saveName(rotationId: string) {
    const name = editingName.trim();
    if (!name) return;
    await put(`/api/admin/oncall/rotations/${rotationId}`, { name });
    setEditingId(null);
    setEditingName("");
    await load();
  }

  return (
    <main className="p-6">
      <h1 className="heading-1">On-call Rotations</h1>
      {loading && <p>Loading...</p>}
      <div className="mt-4 space-y-3">
        {rotations.map((r) => (
          <div key={r.rotation_id} className="p-3 rounded bg-(--surface-soft)">
            <div className="flex justify-between items-center">
              <div>
                {editingId === r.rotation_id ? (
                  <div className="flex items-center gap-2">
                    <input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="rounded border px-2 py-1"
                      aria-label="Rotation name"
                    />
                    <button onClick={() => saveName(r.rotation_id)} className="btn">Save</button>
                    <button onClick={() => { setEditingId(null); setEditingName(""); }} className="btn">Cancel</button>
                  </div>
                ) : (
                  <p className="font-semibold">{r.name}</p>
                )}
                <p className="text-xs text-(--ink-muted)">Members: {r.members?.length || 0}</p>
              </div>
              <div className="space-x-2">
                <button onClick={() => notify(r.rotation_id)} className="btn btn-primary">Notify</button>
                <button onClick={() => sync(r.rotation_id)} className="btn">Sync PD</button>
                <button onClick={() => { setEditingId(r.rotation_id); setEditingName(r.name || ""); }} className="btn">Rename</button>
                <button onClick={() => removeRotation(r.rotation_id)} className="btn">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
