"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, LogOut, Shield, Settings } from "lucide-react";

interface Props {
  user: { id: string; name: string; email: string };
}

export function SidebarNav({ user }: Props) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/dashboard/projects", icon: FolderKanban, label: "Projects" },
  ];

  return (
    <aside style={{ width: 220, background: "var(--bg-2)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", padding: "20px 12px", position: "sticky", top: 0, height: "100vh" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg"
          style={{ background: "var(--accent-dim)", border: "1px solid rgba(201,168,76,0.3)" }}>
          <Shield size={16} style={{ color: "var(--accent)" }} />
        </div>
        <span className="font-display text-lg" style={{ color: "var(--text-primary)" }}>Vault</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {links.map(({ href, icon: Icon, label }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
              style={{
                color: active ? "var(--accent)" : "var(--text-secondary)",
                background: active ? "var(--accent-dim)" : "transparent",
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User + sign out */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 12 }}>
        <div className="px-2 mb-3">
          <div className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{user.name}</div>
          <div className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/login" })}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm transition-all"
          style={{ color: "var(--text-secondary)", background: "transparent" }}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
