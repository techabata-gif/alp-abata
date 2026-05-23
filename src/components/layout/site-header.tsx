import Link from "next/link";
import { BarChart3, HeartHandshake, LayoutDashboard } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink/10 bg-cloud/92 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-leaf text-white">
            <HeartHandshake size={19} aria-hidden="true" />
          </span>
          <span>DanaAmanah</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-ink/72">
          <Link
            href="/#campaign"
            className="hidden rounded-lg px-3 py-2 transition hover:bg-mint hover:text-ink sm:inline-flex"
          >
            Campaign
          </Link>
          <Link
            href="/#transparansi"
            className="hidden rounded-lg px-3 py-2 transition hover:bg-mint hover:text-ink sm:inline-flex"
          >
            Transparansi
          </Link>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-lg border border-ink/10 bg-white px-3 py-2 text-ink shadow-sm transition hover:border-leaf/30 hover:text-leaf"
          >
            <LayoutDashboard size={16} aria-hidden="true" />
            Admin
          </Link>
          <Link
            href="/donate"
            className="inline-flex items-center gap-2 rounded-lg bg-leaf px-3 py-2 text-white shadow-sm transition hover:bg-ink"
          >
            <BarChart3 size={16} aria-hidden="true" />
            Donasi
          </Link>
        </nav>
      </div>
    </header>
  );
}
