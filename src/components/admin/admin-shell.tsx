"use client";

import { FormEvent, ReactNode, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bell,
  Calculator,
  ChevronDown,
  FileText,
  Flag,
  FolderKanban,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShieldCheck,
  Tags,
  UserRound,
  Users,
  X
} from "lucide-react";

type SessionData = {
  name: string;
  email: string;
  role: string;
  initials: string;
};

type AdminShellProps = {
  children: ReactNode;
  title: string;
  description?: string;
  user: SessionData;
};

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/programs", label: "Program", icon: FolderKanban },
  { href: "/admin/categories", label: "Kategori", icon: Tags },
  { href: "/admin/campaigns", label: "Campaign", icon: Flag },
  { href: "/admin/donations", label: "Donasi", icon: HandCoins },
  { href: "/admin/reports", label: "Laporan", icon: FileText },
  { href: "/admin/users", label: "Pengguna", icon: Users },
  { href: "/admin/roles", label: "Hak Akses", icon: Shield },
  { href: "/admin/buying-power", label: "Buying Power", icon: Calculator },
  { href: "/admin/settings", label: "Pengaturan", icon: Settings }
];

export function AdminShell({ children, title, description, user }: AdminShellProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  async function submitPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmittingPassword) return; // Prevent double submission
    
    const form = event.currentTarget; // Grab form reference synchronously
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const nextPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (!currentPassword) {
      setPasswordMessage({ type: 'error', text: "Password lama wajib diisi." });
      return;
    }

    if (nextPassword.length < 8) {
      setPasswordMessage({ type: 'error', text: "Password baru minimal 8 karakter." });
      return;
    }

    if (nextPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: "Konfirmasi password belum sama." });
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: nextPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordMessage({ type: 'error', text: data.error || "Gagal memperbarui password." });
        return;
      }

      setPasswordMessage({ type: 'success', text: "Password berhasil diperbarui." });
      form.reset(); // Use the safely stored reference
    } catch (error) {
      console.error("Frontend password submit error:", error);
      setPasswordMessage({ type: 'error', text: "Terjadi kesalahan server atau jaringan." });
    } finally {
      setIsSubmittingPassword(false);
    }
  }

  async function logout() {
    setProfileOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-cloud text-ink md:grid md:grid-cols-[280px_1fr]">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Tutup sidebar"
          className="fixed inset-0 z-30 bg-ink/35 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={
          sidebarOpen
            ? "fixed inset-y-0 left-0 z-40 flex w-72 translate-x-0 flex-col border-r border-ink/10 bg-ink text-white transition md:sticky md:top-0 md:h-screen"
            : "fixed inset-y-0 left-0 z-40 flex w-72 -translate-x-full flex-col border-r border-ink/10 bg-ink text-white transition md:sticky md:top-0 md:h-screen md:translate-x-0"
        }
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
          <Link href="/" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf overflow-hidden">
              <img src="/logo.png" alt="Abata Logo" className="h-full w-full object-contain" />
            </span>
            <span>ALP #Berdampak</span>
          </Link>
          <button
            type="button"
            title="Tutup sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white/72 transition hover:bg-white/10 hover:text-white md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
              >
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-lg bg-white/8 p-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-white/50">
              RBAC aktif
            </p>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sun text-sm font-bold text-ink">
                {user.initials}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/55">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b border-ink/10 bg-white/94 backdrop-blur">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              title="Buka sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10 text-ink transition hover:border-leaf hover:text-leaf md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={19} aria-hidden="true" />
            </button>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-normal text-leaf">
                Admin panel
              </p>
              <h1 className="truncate text-lg font-semibold text-ink sm:text-xl">
                {title}
              </h1>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                title="Notifikasi"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink/72 transition hover:border-leaf hover:text-leaf"
              >
                <Bell size={18} aria-hidden="true" />
              </button>

              <div className="relative">
                <button
                  type="button"
                  aria-expanded={profileOpen}
                  className="inline-flex items-center gap-3 rounded-lg border border-ink/10 bg-white px-2 py-2 text-left shadow-sm transition hover:border-leaf"
                  onClick={() => setProfileOpen((value) => !value)}
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf text-sm font-bold text-white">
                    {user.initials}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {user.name}
                    </span>
                    <span className="block truncate text-xs text-ink/55">
                      {user.role}
                    </span>
                  </span>
                  <ChevronDown size={16} aria-hidden="true" />
                </button>

                {profileOpen ? (
                  <div className="absolute right-0 mt-2 w-72 rounded-lg border border-ink/10 bg-white p-2 shadow-soft">
                    <div className="flex items-center gap-3 border-b border-ink/10 px-3 py-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-mint text-sm font-bold text-leaf">
                        {user.initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-ink/55">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-3">
                      <div className="flex items-center justify-between rounded-lg bg-cloud px-3 py-2 text-sm">
                        <span className="inline-flex items-center gap-2 font-medium text-ink/72">
                          <UserRound size={16} aria-hidden="true" />
                          Role
                        </span>
                        <span className="rounded-lg bg-mint px-2 py-1 text-xs font-bold text-leaf">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-ink/72 transition hover:bg-mint hover:text-leaf"
                      onClick={() => {
                        setProfileOpen(false);
                        setPasswordOpen(true);
                        setPasswordMessage(null);
                      }}
                    >
                      <KeyRound size={17} aria-hidden="true" />
                      Change password
                    </button>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut size={17} aria-hidden="true" />
                      Logout
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          {description ? (
            <div className="border-t border-ink/8 px-4 py-3 text-sm text-ink/58 sm:px-6 lg:px-8">
              {description}
            </div>
          ) : null}
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>

      {passwordOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 px-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-password-title"
            className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="change-password-title" className="text-xl font-semibold">
                  Change password
                </h2>
                <p className="mt-1 text-sm text-ink/58">
                  Update kredensial admin untuk akun {user.role}.
                </p>
              </div>
              <button
                type="button"
                title="Tutup"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink/60 transition hover:bg-cloud hover:text-ink"
                onClick={() => setPasswordOpen(false)}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={submitPassword} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Password lama
                <input
                  name="currentPassword"
                  type="password"
                  className="rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Password baru
                <input
                  name="newPassword"
                  type="password"
                  className="rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Konfirmasi password
                <input
                  name="confirmPassword"
                  type="password"
                  className="rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              {passwordMessage ? (
                <div className={`rounded-lg px-3 py-3 text-sm font-medium ${passwordMessage.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-mint text-leaf'}`}>
                  {passwordMessage.text}
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={isSubmittingPassword}
                  className="rounded-lg border border-ink/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf disabled:opacity-50"
                  onClick={() => setPasswordOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-50"
                >
                  {isSubmittingPassword ? "Menyimpan..." : "Simpan password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </div>
  );
}
