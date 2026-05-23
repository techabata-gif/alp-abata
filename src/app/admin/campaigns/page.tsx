import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CampaignManager } from "@/components/admin/campaign-manager";
import { getAdminDashboardData } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCampaignsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const { campaigns } = await getAdminDashboardData();
  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true }
  });

  return (
    <AdminShell
      title="Manajemen Campaign"
      description="Buat dan pantau daftar campaign yang sedang aktif."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-6xl">
        <CampaignManager initialCampaigns={campaigns} programs={programs} />
      </div>
    </AdminShell>
  );
}
