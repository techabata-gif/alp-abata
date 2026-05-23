import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DonationManager } from "@/components/admin/donation-manager";
import { getAdminDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const { donations } = await getAdminDashboardData();

  return (
    <AdminShell
      title="Laporan Donasi"
      description="Lihat daftar donasi masuk beserta status verifikasinya."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-7xl">
        <DonationManager initialDonations={donations} />
      </div>
    </AdminShell>
  );
}
