import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { RoleManager } from "@/components/admin/role-manager";

export const dynamic = "force-dynamic";

export default async function AdminRolesPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect("/login");
  }

  // Cek akses
  if (!session.permissions.includes("user:read") && !session.permissions.includes("*")) {
    return (
      <AdminShell title="Hak Akses" user={{
        name: session.name, email: session.email, role: session.role?.name || "Admin", initials: session.name.substring(0, 2).toUpperCase()
      }}>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">Anda tidak memiliki izin untuk melihat halaman ini.</div>
      </AdminShell>
    );
  }

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" }
  });

  return (
    <AdminShell
      title="Manajemen Hak Akses (Role)"
      description="Kelola daftar role dan tingkat izin (PBAC) dalam sistem."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-5xl">
        <RoleManager initialRoles={roles} />
      </div>
    </AdminShell>
  );
}
