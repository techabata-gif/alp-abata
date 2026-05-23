import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { ProgramManager } from "@/components/admin/program-manager";

export const dynamic = "force-dynamic";

export default async function AdminProgramsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { campaigns: true } }
    }
  });

  return (
    <AdminShell
      title="Manajemen Program"
      description="Kelompokkan campaign Anda ke dalam entitas Program yang lebih besar."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-5xl">
        <ProgramManager initialPrograms={programs} />
      </div>
    </AdminShell>
  );
}
