import { CategoryManager } from "@/components/admin/category-manager";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { program: { select: { title: true } }, _count: { select: { campaigns: true } } }
  });

  const programs = await prisma.program.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true }
  });

  return (
    <AdminShell
      title="Master Kategori"
      description="Kelola kategori secara global atau spesifik per program."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-6xl">
        <CategoryManager initialCategories={categories} programs={programs} />
      </div>
    </AdminShell>
  );
}
