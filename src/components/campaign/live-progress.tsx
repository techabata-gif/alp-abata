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

  const isQuantity = campaign.isQuantity && !!campaign.quantityPrice;
  const targetQuantity = isQuantity ? Math.floor(campaign.targetAmount / campaign.quantityPrice!) : 0;
  const collectedQuantity = isQuantity ? Math.floor(campaign.collectedAmount / campaign.quantityPrice!) : 0;
  const missingAmount = Math.max(0, campaign.targetAmount - campaign.collectedAmount);
  const unit = campaign.quantityUnit || "paket";

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          {progress >= 100 ? (
            <span className="inline-flex items-center rounded-lg bg-mint px-2.5 py-1 text-xs font-semibold text-leaf">
              Terpenuhi
            </span>
          ) : (
            <span className="inline-flex items-center rounded-lg bg-sun/20 px-2.5 py-1 text-xs font-semibold text-amber-800">
              Berjalan
            </span>
          )}
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

      {isQuantity && (
        <div className="mb-5 rounded-xl bg-mint/15 border border-mint/30 p-4 flex flex-col">
           <span className="text-sm font-semibold text-leaf mb-1">Biaya per {unit}</span>
           <span className="text-3xl font-bold text-ink">{formatRupiah(campaign.quantityPrice!)}</span>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-leaf">Progress realtime</p>
        <h2 className={`mt-1 font-bold text-ink ${isQuantity ? 'text-2xl' : 'text-3xl'}`}>
          {formatRupiah(campaign.collectedAmount)}
        </h2>
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
        <div className="mt-2 flex items-center justify-between text-xs text-ink/58">
          <span>Target {formatRupiah(campaign.targetAmount)}</span>
          {isQuantity ? (
            <span className={progress >= 100 ? "font-semibold text-leaf" : "font-medium text-red-600"}>
              {collectedQuantity}/{targetQuantity} {unit} terpenuhi
            </span>
          ) : (
            <span className={progress >= 100 ? "font-semibold text-leaf" : "font-medium text-red-600"}>
              {progress >= 100 ? "Target terpenuhi" : `Kurang: ${formatRupiah(missingAmount)}`}
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
