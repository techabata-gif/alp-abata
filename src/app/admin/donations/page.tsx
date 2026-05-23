import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { DonationManager } from "@/components/admin/donation-manager";
import { getAdminDashboardData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminDonationsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const { campaigns, donations } = await getAdminDashboardData();

  return (
    <AdminShell
      title="Input Donasi Manual"
      description="Catat dana yang masuk melalui transfer manual atau tunai."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-7xl">
        <DonationManager initialDonations={donations} campaigns={campaigns} />
      </div>
    </AdminShell>
  );
}
