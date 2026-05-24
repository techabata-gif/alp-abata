import { notFound } from "next/navigation";
import { getProgramBySlug } from "@/lib/data";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CampaignCard } from "@/components/campaign/campaign-card";
import { BackButton } from "@/components/ui/back-button";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProgramPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const data = await getProgramBySlug(params.slug);

  if (!data) {
    notFound();
  }

  const { program, campaigns } = data;
  const progressPercent = program.aggregatedTarget > 0 
    ? Math.min(100, Math.round((program.aggregatedCollected / program.aggregatedTarget) * 100))
    : 0;

  // Extract unique categories for anchor navigation
  const uniqueCategories = Array.from(
    new Map(campaigns.map((c: any) => [c.categoryModel?.id || c.category, c.categoryModel || { name: c.category }])).values()
  );

  const appSettings = await prisma.appSetting.findMany();
  const publicDonationEnabled = appSettings.find(s => s.key === "public_donation_enabled")?.value !== "false";

  return (
    <div className="flex min-h-screen flex-col bg-cloud">
      <SiteHeader publicDonationEnabled={publicDonationEnabled} />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full bg-ink text-white pt-16 pb-20 overflow-hidden">
          {program.imageUrl && (
            <div className="absolute inset-0 z-0">
              <img 
                src={program.imageUrl} 
                alt={program.title} 
                className="w-full h-full object-cover opacity-30"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent"></div>
            </div>
          )}
          <div className="container relative z-10 mx-auto px-4 lg:px-8 mt-12 max-w-5xl">
            <div className="mb-6">
              <BackButton />
            </div>
            <div className="max-w-3xl">
              <span className="inline-block bg-mint text-leaf text-xs font-bold px-3 py-1 rounded-full mb-4">
                PROGRAM SPESIAL
              </span>
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl tracking-tight mb-4 sm:mb-6">
                {program.title}
              </h1>
              
              {program.description && (
                <div 
                  className="prose prose-invert text-base sm:prose-lg text-white/90 max-w-none mb-8 sm:mb-10 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: program.description }}
                />
              )}
            </div>

            {/* Aggregated Progress Card */}
            <div className="bg-white text-ink rounded-2xl p-6 md:p-8 shadow-xl max-w-xl border border-ink/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-mint/20 rounded-bl-full -z-0"></div>
              <h3 className="font-semibold text-lg mb-2 relative z-10">Total Dana Terkumpul</h3>
              <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-3 mb-4 relative z-10">
                <span className="text-3xl md:text-4xl font-bold text-leaf leading-tight">
                  Rp {program.aggregatedCollected.toLocaleString("id-ID")}
                </span>
                {program.aggregatedTarget > 0 && (
                  <span className="text-ink/60 font-medium sm:mb-1.5">
                    dari Rp {program.aggregatedTarget.toLocaleString("id-ID")}
                  </span>
                )}
              </div>
              
              {program.aggregatedTarget > 0 && (
                <div className="relative z-10">
                  <div className="h-3 w-full rounded-full bg-cloud overflow-hidden">
                    <div 
                      className="h-full bg-leaf rounded-full transition-all duration-1000 relative"
                      style={{ width: `${progressPercent}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm font-medium">
                    <span className="text-leaf">{progressPercent}% Tercapai</span>
                    <span className="text-ink/60">{program.campaignCount} Campaign Berjalan</span>
                  </div>
                </div>
              )}
            </div>

            {/* Category Anchor Buttons */}
            {uniqueCategories.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-3 relative z-10">
                {uniqueCategories.map((cat: any, index: number) => (
                  <a
                    key={cat.id || cat.name}
                    href={`#category-${cat.id || cat.name}`}
                    className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition ${
                      index === 0 
                        ? "bg-[#83c65c] text-ink hover:bg-[#72b04f]" // Green like the reference
                        : "bg-transparent border-2 border-white/30 text-white hover:border-white hover:bg-white/10" // Outline blue-ish like reference
                    }`}
                  >
                    {cat.name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Campaigns List */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-ink mb-4">Pilih Campaign</h2>
              <p className="text-ink/60 max-w-2xl mx-auto">
                Salurkan donasi Anda pada campaign spesifik di bawah naungan program {program.title}.
              </p>
            </div>
            
            {campaigns.length > 0 ? (
              <div className="flex flex-col gap-16">
                {uniqueCategories.map((cat: any) => (
                  <div key={cat.id || cat.name} id={`category-${cat.id || cat.name}`} className="scroll-mt-24">
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
                        .map((campaign: any) => (
                          <CampaignCard key={campaign.id} campaign={campaign} />
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-cloud rounded-2xl border border-ink/5">
                <p className="text-ink/60">Belum ada campaign aktif di program ini.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
