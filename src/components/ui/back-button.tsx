"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
    >
      <ArrowLeft size={17} aria-hidden="true" />
      Kembali
    </button>
  );
}
