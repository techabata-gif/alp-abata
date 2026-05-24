"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";
import type { DonationDTO, DonationStatus } from "@/lib/types";
import { formatRupiah } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

type DonationStatusTableProps = {
  donations: DonationDTO[];
};

const statusActions: Array<{
  status: DonationStatus;
  label: string;
  icon: ComponentType<{ size?: number; "aria-hidden"?: boolean }>;
}> = [
  { status: "VERIFIED", label: "Verifikasi", icon: CheckCircle2 },
  { status: "PENDING", label: "Pending", icon: Clock3 },
  { status: "REJECTED", label: "Tolak", icon: XCircle }
];

export function DonationStatusTable({ donations }: DonationStatusTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: DonationStatus) {
    setLoadingId(id);
    setError(null);

    const response = await fetch(`/api/admin/donations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    const payload = await response.json();
    setLoadingId(null);

    if (!response.ok) {
      setError(payload.error ?? "Status belum berhasil diperbarui.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Daftar Donasi</h2>
          <p className="text-sm text-ink/60">Verifikasi manual langsung mengubah progress.</p>
        </div>
      </div>
      {error ? (
        <div className="mt-4 rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase text-ink/55">
              <th className="py-3 pr-4 font-semibold">Donatur</th>
              <th className="py-3 pr-4 font-semibold">Campaign</th>
              <th className="py-3 pr-4 font-semibold">Nominal</th>
              <th className="py-3 pr-4 font-semibold">Status</th>
              <th className="py-3 pr-4 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.id} className="border-b border-ink/8 last:border-0">
                <td className="py-3 pr-4">
                  <div className="font-semibold text-ink">{donation.donorName}</div>
                  <div className="text-xs text-ink/55">{donation.donationType}</div>
                </td>
                <td className="py-3 pr-4 text-ink/68">
                  {donation.campaignTitle ?? "-"}
                </td>
                <td className="py-3 pr-4 font-semibold text-ink">
                  {formatRupiah(donation.amount)}
                </td>
                <td className="py-3 pr-4">
                  <StatusBadge status={donation.status} />
                </td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    {statusActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.status}
                          type="button"
                          title={action.label}
                          disabled={
                            loadingId === donation.id ||
                            donation.status === action.status
                          }
                          onClick={() => updateStatus(donation.id, action.status)}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-ink/10 bg-white text-ink/70 transition hover:border-leaf hover:text-leaf disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <Icon size={17} aria-hidden={true} />
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
