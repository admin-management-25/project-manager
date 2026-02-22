"use client";
import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { IProject } from "@/types";

const CRED_TYPES = [
  { value: "mongo_url", label: "MongoDB URL" },
  { value: "api_key", label: "API Key" },
  { value: "api_secret", label: "API Secret" },
  { value: "token", label: "Token" },
  { value: "password", label: "Password" },
  { value: "custom", label: "Custom" },
];

interface Props {
  projectId: string;
  userId: string;
  onClose: () => void;
  onAdded: (project: IProject) => void;
}

export function AddCredentialModal({ projectId, userId, onClose, onAdded }: Props) {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [type, setType] = useState("custom");
  const [description, setDescription] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [showValue, setShowValue] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/projects/${projectId}/users/${userId}/credentials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          label: label || key,
          value,
          type,
          description,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        }),
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

  // Auto-set key from type
  function onTypeChange(t: string) {
    setType(t);
    if (!key) setKey(t.toUpperCase().replace("_", "_"));
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>Add Credential</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md px-4 py-3 text-sm" style={{ background: "rgba(224,90,90,0.1)", color: "var(--danger)", border: "1px solid rgba(224,90,90,0.2)" }}>
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Type</label>
            <select className="input" value={type} onChange={e => onTypeChange(e.target.value)}>
              {CRED_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="input-label">Key *</label>
              <input className="input" placeholder="MONGO_URI" value={key} onChange={e => setKey(e.target.value)} required style={{ fontFamily: "var(--font-mono)", fontSize: 12 }} />
            </div>
            <div>
              <label className="input-label">Label</label>
              <input className="input" placeholder="Human-friendly name" value={label} onChange={e => setLabel(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="input-label">Value *</label>
            <div className="relative">
              <input
                type={showValue ? "text" : "password"}
                className="input pr-10"
                placeholder="Enter secret value…"
                value={value}
                onChange={e => setValue(e.target.value)}
                required
                style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}
              />
              <button type="button" onClick={() => setShowValue(!showValue)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                {showValue ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <input className="input" placeholder="What is this credential for?" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div>
            <label className="input-label">Expires At (optional)</label>
            <input type="date" className="input" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Add Credential"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
