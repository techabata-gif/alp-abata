import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import type { CampaignDTO } from "@/lib/types";
import {
  formatNumber,
  formatRupiah,
  getDaysLeft,
  getProgressPercentage
} from "@/lib/utils";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusBadge } from "@/components/ui/status-badge";

type CampaignCardProps = {
  campaign: CampaignDTO;
};

export function CampaignCard({ campaign }: CampaignCardProps) {
  const progress = getProgressPercentage(
    campaign.collectedAmount,
    campaign.targetAmount
  );
  const daysLeft = getDaysLeft(campaign.endDate);
  
  const isQuantity = campaign.isQuantity && !!campaign.quantityPrice;
  const targetQuantity = isQuantity ? Math.floor(campaign.targetAmount / campaign.quantityPrice!) : 0;
  const collectedQuantity = isQuantity ? Math.floor(campaign.collectedAmount / campaign.quantityPrice!) : 0;
  const missingAmount = Math.max(0, campaign.targetAmount - campaign.collectedAmount);
  const unit = campaign.quantityUnit || "paket";

  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-white shadow-soft">
      <div className="relative aspect-[16/9] bg-mint">
        <Image
          src={campaign.coverImageUrl ?? "/assets/hero-donation.png"}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-normal text-leaf">
              {campaign.category}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-ink">
              {campaign.title}
            </h3>
          </div>
          <StatusBadge status={campaign.status} />
        </div>
        <p className="min-h-12 text-sm leading-6 text-ink/68">
          {campaign.shortDescription ?? campaign.description}
        </p>
        <div>
          <div className="mb-4">
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

          {isQuantity && (
            <div className="mb-4 rounded-xl bg-mint/15 border border-mint/30 p-3 flex flex-col">
               <span className="text-xs font-semibold text-leaf mb-0.5">Biaya per {unit}</span>
               <span className="text-xl font-bold text-ink">{formatRupiah(campaign.quantityPrice!)}</span>
            </div>
          )}
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">
              {formatRupiah(campaign.collectedAmount)}
            </span>
            <span className="text-ink/60">{progress}%</span>
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
        <div className="grid grid-cols-2 gap-3 text-sm text-ink/68">
          <span className="inline-flex items-center gap-2">
            <Users size={16} aria-hidden="true" />
            {formatNumber(campaign.donationCount)} donatur
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} aria-hidden="true" />
            {daysLeft === null ? "Tanpa deadline" : `${daysLeft} hari`}
          </span>
        </div>
        <Link
          href={`/campaign/${campaign.slug}`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf"
        >
          Lihat campaign
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
