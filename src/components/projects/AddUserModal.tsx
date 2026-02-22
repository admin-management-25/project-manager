"use client";
import { useState } from "react";
import { X } from "lucide-react";
import { IProject } from "@/types";

interface Props {
  projectId: string;
  onClose: () => void;
  onAdded: (project: IProject) => void;
}

export function AddUserModal({ projectId, onClose, onAdded }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onAdded(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Add User</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md px-4 py-3 text-sm" style={{ background: "rgba(224,90,90,0.1)", color: "var(--danger)", border: "1px solid rgba(224,90,90,0.2)" }}>
              {error}
            </div>
          )}
          <div>
            <label className="input-label">Name *</label>
            <input className="input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="input-label">Email</label>
              <input className="input" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Role</label>
              <input className="input" placeholder="Admin, Dev, Client…" value={role} onChange={e => setRole(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea className="input" rows={2} placeholder="Optional notes…" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: "vertical" }} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Adding…" : "Add User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
