import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { prisma } from "@/lib/prisma";
import { UserManager } from "@/components/admin/user-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getUserSession();
  
  if (!session) {
    redirect("/login");
  }

  if (!session.permissions.includes("user:read") && !session.permissions.includes("*")) {
    return (
      <AdminShell title="Pengguna" user={{
        name: session.name, email: session.email, role: session.role?.name || "Admin", initials: session.name.substring(0, 2).toUpperCase()
      }}>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">Anda tidak memiliki izin untuk melihat halaman ini.</div>
      </AdminShell>
    );
  }

  const [usersList, roles] = await Promise.all([
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.role.findMany({
      select: { id: true, name: true }
    })
  ]);

  return (
    <AdminShell
      title="Manajemen Pengguna"
      description="Kelola akun admin dan pengguna sistem."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-5xl">
        <UserManager initialUsers={usersList} roles={roles} />
      </div>
    </AdminShell>
  );
}
