import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, FileText, Users } from "lucide-react";
import { LiveProgress } from "@/components/campaign/live-progress";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNumber, formatRupiah, getDaysLeft } from "@/lib/utils";
import { getCampaignBySlug } from "@/lib/data";

export const dynamic = "force-dynamic";

type CampaignPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const data = await getCampaignBySlug(slug);

  if (!data) {
    notFound();
  }

  const { campaign, donations, reports } = data;
  const daysLeft = getDaysLeft(campaign.endDate);

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-ink text-white">
          <Image
            src={campaign.coverImageUrl ?? "/assets/hero-donation.png"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-ink/64" />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
            >
              <ArrowLeft size={17} aria-hidden="true" />
              Kembali
            </Link>
            <div className="mt-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-normal text-sun">
                {campaign.category}
              </p>
              <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
                {campaign.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-white/80">
                {campaign.description}
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <Users size={19} aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">
                  {formatNumber(campaign.donationCount)}
                </p>
                <p className="text-sm text-white/68">Donatur</p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <CalendarDays size={19} aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">
                  {daysLeft === null ? "-" : daysLeft}
                </p>
                <p className="text-sm text-white/68">Hari tersisa</p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <FileText size={19} aria-hidden="true" />
                <p className="mt-3 text-2xl font-semibold">{reports.length}</p>
                <p className="text-sm text-white/68">Laporan</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="space-y-6">
            <LiveProgress initialCampaign={campaign} />
            <div className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-ink">Target manfaat</h2>
              <p className="mt-3 text-3xl font-semibold text-leaf">
                {campaign.beneficiaryTarget
                  ? `${formatNumber(campaign.beneficiaryTarget)} ${campaign.beneficiaryLabel ?? "penerima"}`
                  : "Fleksibel"}
              </p>
              <p className="mt-3 text-sm leading-6 text-ink/64">
                Semua donasi terverifikasi terhubung ke campaign ini dan dapat
                dipantau dari dashboard admin.
              </p>
              <Link
                href={`/donate?campaign=${campaign.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
              >
                Donasi untuk campaign ini
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="space-y-8">
            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-ink">Donasi terbaru</h2>
              <div className="mt-4 divide-y divide-ink/10">
                {donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-start justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-semibold text-ink">{donation.donorName}</p>
                      <p className="mt-1 text-sm text-ink/58">
                        {donation.donationType}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-leaf">
                      {formatRupiah(donation.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft">
              <h2 className="text-lg font-semibold text-ink">Laporan penggunaan</h2>
              <div className="mt-4 space-y-4">
                {reports.map((report) => (
                  <article key={report.id} className="rounded-lg bg-cloud p-4">
                    <h3 className="font-semibold text-ink">{report.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink/64">
                      {report.description}
                    </p>
                    {report.amountUsed ? (
                      <p className="mt-3 text-sm font-semibold text-clay">
                        {formatRupiah(report.amountUsed)}
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
