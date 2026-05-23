"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { CampaignDTO } from "@/lib/types";
import { formatRupiah, getProgressPercentage } from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";

type LiveProgressProps = {
  initialCampaign: CampaignDTO;
};

export function LiveProgress({ initialCampaign }: LiveProgressProps) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function refreshProgress() {
      try {
        const response = await fetch(`/api/campaigns/${initialCampaign.slug}`, {
          cache: "no-store"
        });
        const payload = await response.json();

        if (!cancelled && payload.data?.campaign) {
          setCampaign(payload.data.campaign);
          setUpdatedAt(new Date());
        }
      } catch {
        // Polling is best-effort; the server-rendered amount remains visible.
      }
    }

    const timer = window.setInterval(refreshProgress, 15000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [initialCampaign.slug]);

  const progress = getProgressPercentage(
    campaign.collectedAmount,
    campaign.targetAmount
  );

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-leaf">Progress realtime</p>
          <h2 className="mt-1 text-3xl font-semibold text-ink">
            {formatRupiah(campaign.collectedAmount)}
          </h2>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg bg-mint px-3 py-2 text-xs font-semibold text-leaf">
          <RefreshCw size={14} aria-hidden="true" />
          {updatedAt
            ? updatedAt.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit"
              })
            : "Live"}
        </span>
      </div>
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span>{progress}% tercapai</span>
          <span>Target {formatRupiah(campaign.targetAmount)}</span>
        </div>
        <ProgressBar
          collected={campaign.collectedAmount}
          target={campaign.targetAmount}
        />
      </div>
    </section>
  );
}
