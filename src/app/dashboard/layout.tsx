import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { authOptions } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="flex min-h-screen" style={{ position: "relative", zIndex: 1 }}>
      <SidebarNav user={session.user as any} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
