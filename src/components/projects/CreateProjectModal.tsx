"use client";
import { useState } from "react";
import { X, Plus } from "lucide-react";
import { IProject } from "@/types";

const COLORS = ["#c9a84c", "#4caf83", "#4c8fca", "#a064e0", "#e05a5a", "#f97316", "#ec4899", "#6ee7b7"];

interface Props {
  onClose: () => void;
  onCreated: (project: IProject) => void;
  initial?: Partial<IProject>;
  projectId?: string;
}

export function CreateProjectModal({ onClose, onCreated, initial, projectId }: Props) {
  const isEdit = !!projectId;
  const [name, setName] = useState(initial?.name || "");
  const [clientName, setClientName] = useState(initial?.clientName || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [status, setStatus] = useState<string>(initial?.status || "active");
  const [color, setColor] = useState(initial?.color || COLORS[0]);
  const [tags, setTags] = useState<string[]>(initial?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addTag(e: React.KeyboardEvent) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const url = isEdit ? `/api/projects/${projectId}` : "/api/projects";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clientName, description, status, color, tags }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onCreated(data.data);
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
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)" }}>
            {isEdit ? "Edit Project" : "New Project"}
          </h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={15} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-md px-4 py-3 text-sm" style={{ background: "rgba(224,90,90,0.1)", color: "var(--danger)", border: "1px solid rgba(224,90,90,0.2)" }}>
              {error}
            </div>
          )}

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="input-label">Project Name *</label>
              <input className="input" placeholder="My SaaS App" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div>
              <label className="input-label">Client Name *</label>
              <input className="input" placeholder="Acme Corp" value={clientName} onChange={e => setClientName(e.target.value)} required />
            </div>
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea className="input" rows={2} placeholder="Short description…" value={description} onChange={e => setDescription(e.target.value)} style={{ resize: "vertical" }} />
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
            <div>
              <label className="input-label">Status</label>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="input-label">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      background: c,
                      border: color === c ? "2px solid white" : "2px solid transparent",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="input-label">Tags (press Enter)</label>
            <input
              className="input"
              placeholder="react, node, typescript…"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={addTag}
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map(t => (
                  <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "var(--bg-3)", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving…" : isEdit ? "Save Changes" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
