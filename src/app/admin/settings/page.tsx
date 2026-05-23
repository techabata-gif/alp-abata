import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  return (
    <AdminShell
      title="Pengaturan Sistem"
      description="Konfigurasi sistem, integrasi, dan preferensi aplikasi."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-4xl">
        <section className="rounded-lg border border-ink/10 bg-white p-8 shadow-soft text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cloud text-ink/40 mb-4">
            <Settings size={32} />
          </div>
          <h2 className="text-xl font-semibold text-ink">Pengaturan Sistem</h2>
          <p className="mt-2 text-ink/60 max-w-md mx-auto">
            Halaman pengaturan sistem sedang dalam tahap pengembangan. Nantinya Anda dapat mengatur integrasi payment gateway dan preferensi notifikasi email dari sini.
          </p>
        </section>
      </div>
    </AdminShell>
  );
}
