import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays, FileText, Users } from "lucide-react";
import { LiveProgress } from "@/components/campaign/live-progress";
import { StatusBadge } from "@/components/ui/status-badge";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNumber, formatRupiah, getDaysLeft } from "@/lib/utils";
import { getCampaignBySlug } from "@/lib/data";
import { CopyButton } from "@/components/ui/copy-button";
import { BackButton } from "@/components/ui/back-button";

import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const data = await getCampaignBySlug(params.slug);
  
  if (!data) return {};

  const title = `${data.campaign.title} - Abata Leaderss Peduli`;
  const description = data.campaign.shortDescription || "Mari berdonasi dan wujudkan kebaikan bersama Abata Leaderss Peduli.";
  const imageUrl = data.campaign.coverImageUrl || "/logo.png";

  return {
    metadataBase: new URL("https://alp.abata.sch.id"),
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: imageUrl }],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

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

  const { campaign, donations, reports, settings } = data;
  const daysLeft = getDaysLeft(campaign.endDate);
  const publicDonationEnabled = settings?.public_donation_enabled !== "false";
  
  let banks = [];
  try {
    banks = settings?.bank_accounts ? JSON.parse(settings.bank_accounts) : [];
  } catch (e) {}
  const alertText = settings?.donation_alert_text || "Silakan hubungi WhatsApp di bawah ini untuk informasi donasi dan konfirmasi:";
  const whatsappNumber = campaign.picContact;
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber.replace(/\D/g, "")}` : null;

  const isQuantity = campaign.isQuantity && !!campaign.quantityPrice;

  // Templates
  const defaultQtyGuide = "Harap transfer dengan nominal **{nominal}** atau berlaku kelipatan untuk donasi {unit}.";
  const defaultNonQtyGuide = "Nominal donasi tidak ditentukan (bebas).";

  const rawQtyGuide = settings?.nominal_guide_quantity || defaultQtyGuide;
  const qtyGuide = rawQtyGuide
    .replace("{nominal}", formatRupiah(campaign.quantityPrice!))
    .replace("{unit}", campaign.quantityUnit || "paket");

  const nonQtyGuide = settings?.nominal_guide_non_quantity || defaultNonQtyGuide;

  const showAnyManualDonation = campaign.showPicContact || campaign.showDonationGuide || campaign.showBankAccounts;

  const formattedNominal = campaign.quantityPrice ? formatRupiah(campaign.quantityPrice) : null;

  const renderGuideText = (text: string, nominalToCopy?: string | null, rawNominal?: number | null) => {
    const injectNominal = (str: string, isBold: boolean) => {
      if (!nominalToCopy || !rawNominal || !str.includes(nominalToCopy)) {
        return isBold ? <strong className="font-bold">{str}</strong> : str;
      }
      
      const subParts = str.split(nominalToCopy);
      return (
        <>
          {subParts.map((sub, j) => (
            <span key={j}>
              {isBold ? <strong className="font-bold">{sub}</strong> : sub}
              {j < subParts.length - 1 && (
                <span className="inline-flex items-center">
                  <strong className="font-bold">{nominalToCopy}</strong>
                  <span className="inline-flex translate-y-1 ml-1">
                    <CopyButton textToCopy={rawNominal.toString()} />
                  </span>
                </span>
              )}
            </span>
          ))}
        </>
      );
    };

    const parts = text.split(/\*\*(.*?)\*\*/g);
    return (
      <span className="text-ink leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {injectNominal(part, i % 2 === 1)}
          </span>
        ))}
      </span>
    );
  };

  return (
    <>
      <SiteHeader publicDonationEnabled={publicDonationEnabled} />
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
            <BackButton />
            <div className="mt-10 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-normal text-sun">
                {campaign.category}
              </p>
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                  {campaign.title}
                </h1>
                <StatusBadge status={campaign.status} />
              </div>
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
              {campaign.status === "ACTIVE" ? (
                publicDonationEnabled && (
                  <Link
                    href={`/donate?campaign=${campaign.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink"
                  >
                    Donasi untuk campaign ini
                    <ArrowRight size={17} aria-hidden="true" />
                  </Link>
                )
              ) : (
                <div className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink/10 px-4 py-3 text-sm font-semibold text-ink/50 cursor-not-allowed">
                  {campaign.status === "CLOSED" ? "Campaign telah ditutup" : "Campaign belum aktif"}
                </div>
              )}

              {/* Manual Donation / Warning Info */}
              {showAnyManualDonation && (
                <div className="mt-6 rounded-lg bg-sun/10 border border-sun/30 p-5">
                  <p className="text-sm font-medium leading-relaxed text-amber-900 mb-4 whitespace-pre-wrap">
                    {alertText}
                  </p>
                  
                  {campaign.showDonationGuide && (
                    <div className="mb-4 rounded-md bg-white p-4 border border-sun/20 text-sm">
                      {isQuantity ? (
                        renderGuideText(qtyGuide, formattedNominal, campaign.quantityPrice)
                      ) : (
                        renderGuideText(nonQtyGuide)
                      )}
                    </div>
                  )}

                  {campaign.showPicContact && whatsappLink && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#20bd5a] mb-4"
                    >
                      Hubungi via WhatsApp
                    </a>
                  )}

                  {campaign.showBankAccounts && banks.length > 0 && (
                    <div className="space-y-3">
                      {banks.map((bank: any) => (
                        <div key={bank.id} className="flex items-center gap-4 rounded-md bg-white p-4 border border-sun/20">
                          {bank.logoUrl && (
                            <div className="h-8 w-12 shrink-0 flex items-center justify-center bg-white">
                              <img src={bank.logoUrl} alt={bank.bankName} className="max-h-full max-w-full object-contain" />
                            </div>
                          )}
                          <div className="text-sm flex-grow">
                            <div className="font-semibold text-ink flex items-center gap-2">
                              {bank.bankName} - {bank.accountNumber}
                              <CopyButton textToCopy={bank.accountNumber} />
                            </div>
                            <p className="text-ink/60">a.n {bank.accountName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
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
