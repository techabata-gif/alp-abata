"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

type Program = {
  id: string;
  title: string;
};

export function AdminDashboardFilter({ programs }: { programs: Program[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentProgram = searchParams.get("program") || "ALL";
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-ink/70">Filter berdasarkan Program:</span>
      <div className="relative">
        <select
          value={currentProgram}
          disabled={isPending}
          onChange={(e) => {
            const val = e.target.value;
            startTransition(() => {
              if (val === "ALL") {
                router.push("/admin");
              } else {
                router.push(`/admin?program=${val}`);
              }
            });
          }}
          className="rounded-lg border border-ink/15 pl-3 pr-9 py-1.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-cloud/50 min-w-[200px] disabled:opacity-50 appearance-none"
        >
          <option value="ALL">Semua Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title}
            </option>
          ))}
        </select>
        
        {/* Dropdown Chevron / Loader Icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {isPending ? (
            <Loader2 size={16} className="animate-spin text-leaf" />
          ) : (
            <svg className="h-4 w-4 text-ink/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
