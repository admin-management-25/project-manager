"use client";
import { useState } from "react";
import Link from "next/link";
import { IProject } from "@/types";
import { Plus, Search, FolderOpen, Users, Key, MoreVertical, Pencil, Trash2, Archive } from "lucide-react";
import { CreateProjectModal } from "./CreateProjectModal";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  active: "#4caf83", paused: "#c9a84c", completed: "#4c8fca", archived: "#555"
};

export function ProjectsClient({ initialProjects }: { initialProjects: IProject[] }) {
  const router = useRouter();
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.clientName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || p.status === filter;
    return matchSearch && matchFilter;
  });

  async function deleteProject(id: string) {
    if (!confirm("Delete this project and all its data?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    setProjects(prev => prev.filter(p => p._id !== id));
  }

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/projects/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) {
      setProjects(prev => prev.map(p => p._id === id ? { ...p, status: status as any } : p));
    }
    setOpenMenu(null);
  }

  function onCreated(project: IProject) {
    setProjects(prev => [project, ...prev]);
    setShowCreate(false);
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl mb-1" style={{ color: "var(--text-primary)" }}>Projects</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={15} /> New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            className="input pl-9"
            placeholder="Search projects or clients…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          {["all", "active", "paused", "completed", "archived"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="btn btn-sm btn-ghost"
              style={{
                background: filter === f ? "var(--accent-dim)" : "transparent",
                color: filter === f ? "var(--accent)" : "var(--text-secondary)",
                borderColor: filter === f ? "rgba(201,168,76,0.3)" : "var(--border)",
                textTransform: "capitalize",
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state card">
          <FolderOpen size={32} style={{ margin: "0 auto 12px", opacity: 0.2 }} />
          <p style={{ fontSize: 15, marginBottom: 4 }}>No projects found</p>
          <p style={{ fontSize: 13 }}>
            {search ? "Try a different search" : "Create your first project"}
          </p>
          {!search && (
            <button className="btn btn-primary btn-sm mt-4 inline-flex" onClick={() => setShowCreate(true)}>
              <Plus size={13} /> Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map(p => (
            <div key={p._id} className="card fade-in" style={{ position: "relative" }}>
              {/* Color accent bar */}
              <div style={{ height: 3, background: p.color || "var(--accent)", borderRadius: "10px 10px 0 0" }} />

              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between mb-2">
                  <Link href={`/dashboard/projects/${p._id}`} style={{ textDecoration: "none" }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{p.clientName}</div>
                  </Link>
                  <div style={{ position: "relative" }}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpenMenu(openMenu === p._id ? null : p._id!)}>
                      <MoreVertical size={13} />
                    </button>
                    {openMenu === p._id && (
                      <div className="card" style={{ position: "absolute", right: 0, top: "100%", zIndex: 20, width: 160, padding: "4px 0", marginTop: 4 }}>
                        <Link href={`/dashboard/projects/${p._id}`}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)", textDecoration: "none" }}
                          onClick={() => setOpenMenu(null)}>
                          <Pencil size={13} /> Edit
                        </Link>
                        {p.status !== "archived" && (
                          <button onClick={() => updateStatus(p._id!, "archived")}
                            style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "var(--text-secondary)", background: "none", border: "none", width: "100%", cursor: "pointer" }}>
                            <Archive size={13} /> Archive
                          </button>
                        )}
                        <button onClick={() => deleteProject(p._id!)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", fontSize: 13, color: "var(--danger)", background: "none", border: "none", width: "100%", cursor: "pointer" }}>
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {p.description && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10, lineHeight: 1.5 }}>{p.description}</p>
                )}

                {/* Tags */}
                {p.tags && p.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.tags.map(t => (
                      <span key={t} style={{ fontSize: 11, padding: "1px 7px", borderRadius: 100, background: "var(--bg-3)", color: "var(--text-muted)" }}>{t}</span>
                    ))}
                  </div>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-between" style={{ borderTop: "1px solid var(--border)", paddingTop: 10, marginTop: 8 }}>
                  <div className="flex items-center gap-3">
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Users size={11} /> {p.users.length}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                      <Key size={11} /> {p.users.reduce((s, u) => s + u.credentials.length, 0)}
                    </span>
                  </div>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} onCreated={onCreated} />}
    </div>
  );
}
