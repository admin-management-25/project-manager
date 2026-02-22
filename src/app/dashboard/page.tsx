import { getServerSession } from "next-auth";
import { projectService } from "@/services/project.service";
import Link from "next/link";
import { FolderOpen, Users, Key, AlertTriangle, ArrowRight } from "lucide-react";
import { authOptions } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session!.user as any).id;
  const projects = await projectService.getProjects(userId);

  const totalUsers = projects.reduce((sum, p) => sum + p.users.length, 0);
  const totalCreds = projects.reduce((sum, p) => sum + p.users.reduce((s, u) => s + u.credentials.length, 0), 0);
  const needsRotation = projects.reduce((sum, p) => sum + p.users.reduce((s, u) => s + u.credentials.filter((c: any) => c.needsRotation).length, 0), 0);
  const activeProjects = projects.filter(p => p.status === "active").length;

  const stats = [
    { label: "Active Projects", value: activeProjects, icon: FolderOpen, color: "#4caf83" },
    { label: "Total Users", value: totalUsers, icon: Users, color: "#4c8fca" },
    { label: "Credentials", value: totalCreds, icon: Key, color: "var(--accent)" },
    { label: "Need Rotation", value: needsRotation, icon: AlertTriangle, color: needsRotation > 0 ? "#e05a5a" : "var(--text-muted)" },
  ];

  const recentProjects = [...projects].slice(0, 5);

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl mb-1" style={{ color: "var(--text-primary)" }}>
          Good day, {session!.user?.name?.split(" ")[0]}
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Here's an overview of your workspace</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <span style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>{s.label}</span>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <div className="font-display text-3xl" style={{ color: "var(--text-primary)" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="card">
        <div className="flex items-center justify-between p-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>Recent Projects</h2>
          <Link href="/dashboard/projects" className="flex items-center gap-1 text-xs" style={{ color: "var(--accent)" }}>
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="empty-state">
            <FolderOpen size={28} style={{ margin: "0 auto 8px", opacity: 0.3 }} />
            <p>No projects yet</p>
            <Link href="/dashboard/projects" className="btn btn-primary btn-sm mt-3 inline-flex">Create Project</Link>
          </div>
        ) : (
          <div>
            {recentProjects.map((p, i) => (
              <Link key={p._id} href={`/dashboard/projects/${p._id}`}
                className="flex items-center justify-between px-5 py-3 transition-all"
                style={{
                  borderBottom: i < recentProjects.length - 1 ? "1px solid var(--border)" : "none",
                  textDecoration: "none",
                }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color || "var(--accent)", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{p.clientName}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.users.length} users</span>
                  <span className={`badge badge-${p.status}`}>{p.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
