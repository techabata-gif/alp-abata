import type { DonationStatus, CampaignStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: DonationStatus | CampaignStatus;
};

const labels: Record<string, string> = {
  ACTIVE: "Aktif",
  CLOSED: "Ditutup",
  DRAFT: "Draft",
  PENDING: "Pending",
  VERIFIED: "Terverifikasi",
  REJECTED: "Ditolak"
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold",
        status === "ACTIVE" || status === "VERIFIED"
          ? "bg-mint text-leaf"
          : status === "PENDING" || status === "DRAFT"
            ? "bg-sun/20 text-amber-800"
            : "bg-red-50 text-red-700"
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
