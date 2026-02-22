"use client";
import { useState } from "react";
import { IProject, IProjectUser, ICredential } from "@/types";
import { ChevronLeft, Plus, User, Key, Eye, EyeOff, RefreshCw, Trash2, Pencil, Copy, Check, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { AddUserModal } from "@/components/projects/AddUserModal";
import { AddCredentialModal } from "@/components/projects/AddCredentialModal";

const CRED_TYPE_LABELS: Record<string, string> = {
  mongo_url: "MongoDB", api_key: "API Key", api_secret: "API Secret",
  password: "Password", token: "Token", custom: "Custom"
};

export function ProjectDetailClient({ project: initial }: { project: IProject }) {
  const router = useRouter();
  const [project, setProject] = useState(initial);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [addCredForUser, setAddCredForUser] = useState<string | null>(null);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set(project.users.map(u => u._id!)));
  const [revealedCreds, setRevealedCreds] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  function toggleUser(userId: string) {
    setExpandedUsers(prev => {
      const n = new Set(prev);
      if (n.has(userId)) n.delete(userId);
      else n.add(userId);
      return n;
    });
  }

  async function deleteUser(userId: string) {
    if (!confirm("Remove this user and all their credentials?")) return;
    const res = await fetch(`/api/projects/${project._id}/users/${userId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setProject(data.data);
  }

  async function deleteCred(userId: string, credId: string) {
    if (!confirm("Delete this credential?")) return;
    const res = await fetch(`/api/projects/${project._id}/users/${userId}/credentials/${credId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.success) setProject(data.data);
  }

  async function revealCred(userId: string, credId: string) {
    const key = `${userId}:${credId}`;
    if (revealedCreds[key]) {
      setRevealedCreds(prev => { const n = { ...prev }; delete n[key]; return n; });
      return;
    }
    const res = await fetch(`/api/projects/${project._id}/users/${userId}/credentials/${credId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reveal" }),
    });
    const data = await res.json();
    if (data.success) {
      setRevealedCreds(prev => ({ ...prev, [key]: data.data.value }));
    }
  }

  async function copyToClipboard(userId: string, credId: string) {
    const key = `${userId}:${credId}`;
    let value = revealedCreds[key];
    if (!value) {
      const res = await fetch(`/api/projects/${project._id}/users/${userId}/credentials/${credId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reveal" }),
      });
      const data = await res.json();
      if (data.success) value = data.data.value;
    }
    if (value) {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    }
  }

  async function markRotation(userId: string, credId: string, needsRotation: boolean) {
    const res = await fetch(`/api/projects/${project._id}/users/${userId}/credentials/${credId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ needsRotation }),
    });
    const data = await res.json();
    if (data.success) setProject(data.data);
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Back */}
      <Link href="/dashboard/projects" className="flex items-center gap-1 mb-6 text-sm" style={{ color: "var(--text-secondary)", textDecoration: "none" }}>
        <ChevronLeft size={14} /> Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div style={{ width: 12, height: 12, borderRadius: "50%", background: project.color || "var(--accent)", flexShrink: 0, marginTop: 5 }} />
          <div>
            <h1 className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>{project.name}</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{project.clientName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge badge-${project.status}`}>{project.status}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setShowEdit(true)}>
            <Pencil size={13} /> Edit
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddUser(true)}>
            <Plus size={13} /> Add User
          </button>
        </div>
      </div>

      {project.description && (
        <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 20, lineHeight: 1.6, background: "var(--bg-2)", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border)" }}>
          {project.description}
        </p>
      )}

      {/* Tags */}
      {project.tags && project.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-6">
          {project.tags.map(t => (
            <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 100, background: "var(--bg-3)", color: "var(--text-muted)" }}>{t}</span>
          ))}
        </div>
      )}

      {/* Users */}
      {project.users.length === 0 ? (
        <div className="empty-state card">
          <User size={28} style={{ margin: "0 auto 8px", opacity: 0.2 }} />
          <p style={{ fontSize: 14, marginBottom: 4 }}>No users yet</p>
          <p style={{ fontSize: 13 }}>Add users to start managing credentials</p>
          <button className="btn btn-primary btn-sm mt-4 inline-flex" onClick={() => setShowAddUser(true)}>
            <Plus size={13} /> Add User
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {project.users.map((user) => (
            <div key={user._id} className="card">
              {/* User header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => toggleUser(user._id!)}
                style={{ userSelect: "none" }}
              >
                <div className="flex items-center gap-3">
                  {expandedUsers.has(user._id!) ? <ChevronDown size={14} style={{ color: "var(--text-muted)" }} /> : <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />}
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: "var(--bg-3)", border: "1px solid var(--border)" }}>
                    <User size={14} style={{ color: "var(--text-secondary)" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{user.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      {user.role && <span>{user.role}</span>}
                      {user.email && <span>{user.role ? " · " : ""}{user.email}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    <Key size={11} style={{ display: "inline", marginRight: 3 }} />
                    {user.credentials.length}
                  </span>
                  <button className="btn btn-primary btn-icon btn-sm" onClick={() => setAddCredForUser(user._id!)}>
                    <Plus size={13} />
                  </button>
                  <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteUser(user._id!)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Credentials */}
              {expandedUsers.has(user._id!) && (
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {user.credentials.length === 0 ? (
                    <div style={{ padding: "16px 20px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                      No credentials yet.{" "}
                      <button style={{ color: "var(--accent)", background: "none", border: "none", cursor: "pointer", fontSize: 13 }} onClick={() => setAddCredForUser(user._id!)}>
                        Add one →
                      </button>
                    </div>
                  ) : (
                    <div>
                      {user.credentials.map((cred: any, i: number) => {
                        const key = `${user._id}:${cred._id}`;
                        const revealed = revealedCreds[key];
                        const isCopied = copied === key;
                        return (
                          <div
                            key={cred._id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                              padding: "10px 16px 10px 20px",
                              borderBottom: i < user.credentials.length - 1 ? "1px solid var(--border)" : "none",
                            }}
                          >
                            {/* Cred info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
                                  {cred.label || cred.key}
                                </span>
                                <span className={`badge cred-${cred.type}`} style={{ fontSize: 10 }}>
                                  {CRED_TYPE_LABELS[cred.type]}
                                </span>
                                {cred.needsRotation && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#e05a5a" }}>
                                    <AlertTriangle size={10} /> Rotate
                                  </span>
                                )}
                              </div>
                              {cred.label && cred.label !== cred.key && (
                                <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{cred.key}</div>
                              )}
                              {/* Value display */}
                              <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-secondary)", marginTop: 4, wordBreak: "break-all" }}>
                                {revealed ? revealed : "•".repeat(24)}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1" style={{ flexShrink: 0 }}>
                              <button className="btn btn-ghost btn-icon btn-sm" title={revealed ? "Hide" : "Reveal"} onClick={() => revealCred(user._id!, cred._id!)}>
                                {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button className="btn btn-ghost btn-icon btn-sm" title="Copy" onClick={() => copyToClipboard(user._id!, cred._id!)}>
                                {isCopied ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
                              </button>
                              <button
                                className="btn btn-ghost btn-icon btn-sm"
                                title={cred.needsRotation ? "Clear rotation flag" : "Flag for rotation"}
                                onClick={() => markRotation(user._id!, cred._id!, !cred.needsRotation)}
                                style={{ color: cred.needsRotation ? "#e05a5a" : undefined }}
                              >
                                <RefreshCw size={13} />
                              </button>
                              <button className="btn btn-danger btn-icon btn-sm" title="Delete" onClick={() => deleteCred(user._id!, cred._id!)}>
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showEdit && (
        <CreateProjectModal
          onClose={() => setShowEdit(false)}
          onCreated={(p) => { setProject(p); setShowEdit(false); }}
          initial={project}
          projectId={project._id}
        />
      )}
      {showAddUser && (
        <AddUserModal
          projectId={project._id!}
          onClose={() => setShowAddUser(false)}
          onAdded={(p) => { setProject(p); setShowAddUser(false); }}
        />
      )}
      {addCredForUser && (
        <AddCredentialModal
          projectId={project._id!}
          userId={addCredForUser}
          onClose={() => setAddCredForUser(null)}
          onAdded={(p) => { setProject(p); setAddCredForUser(null); }}
        />
      )}
    </div>
  );
}
