import Link from "next/link";
import { XCircle } from "lucide-react";

export default function PaymentFailedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cloud px-4">
      <section className="w-full max-w-md rounded-lg border border-ink/10 bg-white p-6 text-center shadow-soft">
        <XCircle className="mx-auto text-red-600" size={44} aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">
          Donasi belum tercatat
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink/64">
          Silakan ulangi pengisian donasi atau hubungi admin jika dana sudah
          ditransfer.
        </p>
        <Link
          href="/donate"
          className="mt-6 inline-flex rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf"
        >
          Isi ulang donasi
        </Link>
      </section>
    </main>
  );
}
