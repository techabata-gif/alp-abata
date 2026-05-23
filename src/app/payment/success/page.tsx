import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud px-4">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <CheckCircle2 className="mx-auto text-leaf" size={44} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Donasi tercatat</h1>
        <p className="mt-3 text-sm leading-6 text-ink/64">
          Terima kasih. Admin akan melakukan verifikasi sebelum dana tampil pada
          progress publik.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
        >
          Kembali ke beranda
        </Link>
      </section>
    </main>
  );
}
