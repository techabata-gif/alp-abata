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
          <p className="mt-2 text-xs text-ink/58">
            Target {formatRupiah(campaign.targetAmount)}
          </p>
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
