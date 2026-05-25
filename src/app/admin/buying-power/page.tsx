import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { BuyingPowerClient } from "@/components/admin/buying-power-client";

export const dynamic = "force-dynamic";

export default async function AdminBuyingPowerPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  // Fetch all programs with their categories and campaigns
  const rawPrograms = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      categories: {
        orderBy: { name: "asc" }
      },
      campaigns: {
        orderBy: { title: "asc" }
      }
    }
  });

  // Serialize BigInt to Number for safe transfer to Client Component
  const programs = rawPrograms.map(prog => ({
    ...prog,
    targetAmount: prog.targetAmount ? Number(prog.targetAmount) : null,
    campaigns: prog.campaigns.map(camp => ({
      ...camp,
      targetAmount: Number(camp.targetAmount),
      collectedAmount: Number(camp.collectedAmount),
      quantityPrice: camp.quantityPrice ? Number(camp.quantityPrice) : null,
    }))
  }));

  return (
    <AdminShell
      title="Buying Power Calculator"
      description="Hitung estimasi alokasi dana program untuk pembelian paket (misal sapi, kambing)."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-6xl">
        <BuyingPowerClient programs={programs} />
      </div>
    </AdminShell>
  );
}
