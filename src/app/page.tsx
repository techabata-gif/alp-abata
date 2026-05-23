import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  FileText,
  HeartHandshake,
  ShieldCheck,
  Users
} from "lucide-react";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatNumber, formatRupiah } from "@/lib/utils";
import { getLandingData } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { campaigns, recentDonations, reports, settings } = await getLandingData();
  const totalCollected = campaigns.reduce(
    (sum, campaign) => sum + campaign.collectedAmount,
    0
  );
  const totalDonors = campaigns.reduce(
    (sum, campaign) => sum + campaign.donationCount,
    0
  );

  const publicDonationEnabled = settings.public_donation_enabled !== "false";

  return (
    <>
      <SiteHeader publicDonationEnabled={publicDonationEnabled} />
      <main>
        <section className="relative min-h-[78vh] overflow-hidden bg-ink text-white">
          <Image
            src={settings.landing_hero_image || "/assets/hero-donation.png"}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-ink/58" />
          <div className="relative mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/12 px-3 py-2 text-sm font-semibold backdrop-blur">
                <ShieldCheck size={17} aria-hidden="true" />
                {settings.landing_hero_label || "Transparansi dana untuk campaign sosial"}
              </div>
              <h1 className="text-5xl font-semibold leading-tight sm:text-6xl lg:text-7xl">
                {settings.landing_hero_title || "ALP #Berdampak"}
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82 whitespace-pre-line">
                {settings.landing_hero_description || "Platform penggalangan dana untuk yayasan, sekolah, DKM, komunitas, dan program sosial lain dengan pencatatan manual yang terhubung ke database."}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {publicDonationEnabled && (
                  <Link
                    href="/donate"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-sun px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
                  >
                    <HeartHandshake size={18} aria-hidden="true" />
                    Mulai donasi
                  </Link>
                )}
                <Link
                  href="#campaign"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-ink"
                >
                  Lihat campaign
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="text-sm text-white/68">Dana terverifikasi</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatRupiah(totalCollected)}
                </p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="text-sm text-white/68">Total donatur</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(totalDonors)}
                </p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="text-sm text-white/68">Campaign aktif</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatNumber(campaigns.length)}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          id="campaign"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-leaf">
                Campaign
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Program yang sedang berjalan
              </h2>
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </section>

        <section id="transparansi" className="bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-leaf">
                Transparansi
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Donasi terbaru
              </h2>
              <div className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10">
                {recentDonations.map((donation) => (
                  <div
                    key={donation.id}
                    className="flex items-start justify-between gap-4 p-4"
                  >
                    <div>
                      <p className="font-semibold text-ink">{donation.donorName}</p>
                      <p className="mt-1 text-sm text-ink/60">
                        {donation.campaignTitle} - {donation.donationType}
                      </p>
                    </div>
                    <p className="shrink-0 font-semibold text-leaf">
                      {formatRupiah(donation.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-clay">
                Laporan
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Aktivitas penyaluran
              </h2>
              <div className="mt-6 space-y-4">
                {reports.map((report) => (
                  <article
                    key={report.id}
                    className="rounded-lg border border-ink/10 bg-cloud p-5"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-leaf">
                        <FileText size={17} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-semibold text-ink">{report.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-ink/66">
                          {report.description}
                        </p>
                        {report.amountUsed ? (
                          <p className="mt-3 text-sm font-semibold text-clay">
                            Dana digunakan {formatRupiah(report.amountUsed)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            {
              icon: BadgeCheck,
              title: "Verifikasi manual",
              body: "Donasi publik masuk pending, lalu admin memverifikasi dana masuk."
            },
            {
              icon: Clock,
              title: "Progress berkala",
              body: "Detail campaign melakukan polling API untuk memperbarui nominal terkumpul."
            },
            {
              icon: Users,
              title: "Campaign fleksibel",
              body: "Program dapat dipakai untuk qurban, beasiswa, bantuan bencana, atau dana komunitas."
            }
          ].map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
              >
                <Icon className="text-leaf" size={24} aria-hidden="true" />
                <h3 className="mt-4 font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink/64">{item.body}</p>
              </article>
            );
          })}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
