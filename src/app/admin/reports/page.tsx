import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ReportManager } from "@/components/admin/report-manager";
import { getAdminDashboardData, getLandingData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const { campaigns } = await getAdminDashboardData();
  const { reports } = await getLandingData();

  return (
    <AdminShell
      title="Aktivitas Penyaluran"
      description="Catat dan publikasikan dokumentasi penyaluran dana ke halaman utama."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-7xl">
        <ReportManager initialReports={reports} campaigns={campaigns} />
      </div>
    </AdminShell>
  );
}
