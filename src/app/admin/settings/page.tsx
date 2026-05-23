import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsManager } from "@/components/admin/settings-manager";
import { getLandingData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getUserSession();
  if (!session) redirect("/login");

  const { settings } = await getLandingData();

  return (
    <AdminShell
      title="Pengaturan Sistem"
      description="Konfigurasi tampilan aplikasi dan referensi lainnya."
      user={{
        name: session.name,
        email: session.email,
        role: session.role?.name || "Admin",
        initials: session.name.substring(0, 2).toUpperCase()
      }}
    >
      <div className="mx-auto max-w-4xl">
        <SettingsManager initialSettings={settings} />
      </div>
    </AdminShell>
  );
}
