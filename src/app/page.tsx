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
  const { campaigns, recentDonations, reports, settings, programs } = await getLandingData();
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
        <section className="relative w-full bg-ink text-white pt-16 pb-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={settings.landing_hero_image || "/assets/hero-donation.png"}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent"></div>
          </div>
          <div className="container relative z-10 mx-auto px-4 lg:px-8 mt-12 max-w-5xl">
            <div className="max-w-3xl">
              <span className="inline-block bg-mint text-leaf text-xs font-bold px-3 py-1 rounded-full mb-4 flex items-center w-fit gap-1.5">
                <ShieldCheck size={14} aria-hidden="true" />
                {settings.landing_hero_label || "TRANSAPARANSI DANA SOSIAL"}
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl tracking-tight mb-4 sm:mb-6">
                {settings.landing_hero_title || "ALP #Berdampak"}
              </h1>
              <div className="prose prose-invert text-base sm:prose-lg text-white/90 max-w-none mb-8 sm:mb-10 leading-relaxed whitespace-pre-line">
                {settings.landing_hero_description || "Platform penggalangan dana untuk yayasan, sekolah, DKM, komunitas, dan program sosial lain dengan pencatatan manual yang terhubung ke database."}
              </div>

              <div className="mb-4 flex flex-col gap-3 sm:flex-row relative z-10">
                {publicDonationEnabled && (
                  <Link
                    href="/donate"
                    className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-xl font-semibold transition bg-[#83c65c] text-ink hover:bg-[#72b04f]"
                  >
                    <HeartHandshake size={18} aria-hidden="true" className="mr-2" />
                    Mulai Donasi
                  </Link>
                )}
                <Link
                  href="#program"
                  className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-xl font-semibold transition bg-white text-ink hover:bg-cloud shadow-sm"
                >
                  Eksplor Program
                  <ArrowRight size={18} aria-hidden="true" className="ml-2" />
                </Link>
                <Link
                  href="#campaign"
                  className="inline-flex w-full sm:w-auto items-center justify-center px-6 py-3 rounded-xl font-semibold transition bg-transparent border-2 border-white/30 text-white hover:border-white hover:bg-white/10"
                >
                  Lihat Campaign
                </Link>
              </div>
            </div>

            {/* Subtle Stats Boxes */}
            <div className="mt-12 grid max-w-4xl gap-3 sm:grid-cols-2 relative z-10">
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="text-sm text-white/68">Program Saat Ini</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {programs?.length || 0} Program
                </p>
              </div>
              <div className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur">
                <p className="text-sm text-white/68">Campaign Aktif</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {campaigns.length} Campaign
                </p>
              </div>
            </div>
            </div>
        </section>

        {programs && programs.length > 0 && (
          <section id="program" className="bg-cloud py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <p className="text-sm font-semibold uppercase tracking-normal text-leaf">
                  Program Utama
                </p>
                <h2 className="mt-2 text-3xl font-bold text-ink sm:text-4xl">
                  Program Pilihan Saat Ini
                </h2>
                <p className="mt-4 text-lg text-ink/60 max-w-2xl mx-auto">
                  Pilih program unggulan kami dan temukan berbagai campaign yang dapat Anda bantu.
                </p>
              </div>
              
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((program) => (
                  <Link 
                    key={program.id} 
                    href={`/p/${program.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-white shadow-soft transition hover:shadow-lg flex flex-col h-full border border-ink/5"
                  >
                    <div className="relative h-48 w-full bg-ink/5 overflow-hidden">
                      {program.imageUrl ? (
                        <Image 
                          src={program.imageUrl} 
                          alt={program.title} 
                          fill 
                          className="object-cover transition duration-500 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-mint/30">
                          <HeartHandshake size={32} className="text-leaf/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="inline-block bg-white text-ink text-xs font-bold px-2.5 py-1 rounded-md mb-2 shadow-sm">
                          {program.campaignCount} Campaign
                        </span>
                        <h3 className="text-xl font-bold text-white">{program.title}</h3>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <p className="text-sm text-ink/70 line-clamp-2 mb-4 flex-1">
                        {program.description ? program.description.replace(/<[^>]+>/g, '') : "Mari bergabung dalam program kebaikan ini."}
                      </p>
                      <div className="flex items-center text-leaf font-medium text-sm group-hover:underline">
                        Lihat Program <ArrowRight size={16} className="ml-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

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
          <div className="mt-8 flex flex-col gap-16">
            {campaigns.length > 0 ? (
              Array.from(new Map(campaigns.map((c: any) => [c.categoryModel?.id || c.category, c.categoryModel || { name: c.category }])).values()).map((cat: any) => (
                <div key={cat.id || cat.name}>
                  <div className="mb-8 border-b border-ink/10 pb-4">
                    <div className="flex items-center gap-4">
                      {cat.icon && (
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-ink/5 text-2xl">
                          {cat.icon.startsWith("http") ? <img src={cat.icon} alt="" className="w-8 h-8 object-contain" /> : cat.icon}
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-blue-900 tracking-tight">{cat.name}</h3>
                        {cat.description && (
                          <p className="text-sm text-ink/50 mt-1 font-medium">{cat.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                    {campaigns
                      .filter((c: any) => (c.categoryModel?.id || c.category) === (cat.id || cat.name))
                      .map((campaign) => (
                        <CampaignCard key={campaign.id} campaign={campaign} />
                      ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-ink/50">Belum ada campaign berjalan.</div>
            )}
          </div>
        </section>

        <section id="transparansi" className="bg-white py-16">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-normal text-leaf">
                Transparansi
              </p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">
                Daftar Donasi
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
              title: "Amanah Terverifikasi",
              body: "Setiap donasi yang dititipkan akan diverifikasi secara seksama untuk memastikan niat baik Anda tersalurkan dengan tepat dan aman."
            },
            {
              icon: Clock,
              title: "Transparansi Real-time",
              body: "Pantau terus jejak kebaikan Anda. Progress penggalangan dana dan laporan penyaluran diperbarui secara aktual dan transparan."
            },
            {
              icon: Users,
              title: "Berdampak Luas",
              body: "Satu wadah untuk berbagai kepedulian—mulai dari ibadah qurban, tanggap bencana, hingga aksi sosial komunitas."
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
