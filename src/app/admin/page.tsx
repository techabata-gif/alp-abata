import {
  CircleDollarSign,
  Clock3,
  Flag,
  ReceiptText,
  Users
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminDonationChart } from "@/components/admin/admin-donation-chart";
import { AdminDashboardFilter } from "@/components/admin/admin-dashboard-filter";
import { formatNumber, formatRupiah } from "@/lib/utils";
import { getAdminDashboardData } from "@/lib/data";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ program?: string }>;
}) {
  const session = await getUserSession();
  
  if (!session) {
    redirect("/login");
  }

  const { program } = await searchParams;

  const programs = await prisma.program.findMany({
    select: { id: true, title: true },
    orderBy: { createdAt: "desc" }
  });

  const { summary, campaigns } = await getAdminDashboardData(program);

  const stats = [
    {
      label: "Dana verified",
      value: formatRupiah(summary.totalCollected),
      icon: CircleDollarSign
    },
    {
      label: "Transaksi",
      value: formatNumber(summary.totalTransactions),
      icon: ReceiptText
    },
    {
      label: "Donatur",
      value: formatNumber(summary.totalDonors),
      icon: Users
    },
    {
      label: "Pending",
      value: formatNumber(summary.pendingDonations),
      icon: Clock3
    }
  ];

  return (
    <AdminShell
      title="Dashboard admin"
      description="Monitoring pertumbuhan donasi dan statistik keseluruhan."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex justify-end">
          <AdminDashboardFilter programs={programs} />
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <article
                key={stat.label}
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-ink/60">{stat.label}</p>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-leaf">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                </div>
                <p className="mt-4 text-2xl font-semibold text-ink">
                  {stat.value}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-8">
          <AdminDonationChart campaigns={campaigns} />
        </section>
      </div>
    </AdminShell>
  );
}
