import type { CampaignDTO } from "@/lib/types";
import { formatRupiah, getProgressPercentage } from "@/lib/utils";

type AdminDonationChartProps = {
  campaigns: CampaignDTO[];
};

export function AdminDonationChart({ campaigns }: AdminDonationChartProps) {
  // We use the campaign's progress percentage for the width now.

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-lg font-semibold text-ink">Grafik donasi</h2>
        <p className="text-sm text-ink/60">Progress terkumpul per campaign.</p>
      </div>
      <div className="mt-6 space-y-5">
        {campaigns.map((campaign) => {
          const progress = getProgressPercentage(
            campaign.collectedAmount,
            campaign.targetAmount
          );
          const width = Math.max(8, Math.min(100, progress));

          return (
            <div key={campaign.id}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-ink">{campaign.title}</span>
                <span className="shrink-0 text-ink/58">
                  {formatRupiah(campaign.collectedAmount)}
                </span>
              </div>
              <div className="h-11 rounded-lg bg-cloud p-1">
                <div
                  className="flex h-full items-center justify-end rounded-lg bg-leaf px-3 text-xs font-bold text-white transition-all"
                  style={{ width: `${width}%` }}
                >
                  {progress}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
