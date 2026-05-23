import { Suspense } from "react";
import { DonationForm } from "@/components/donation/donation-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getDonationCampaignOptions } from "@/lib/data";

export const dynamic = "force-dynamic";

type DonatePageProps = {
  searchParams: Promise<{
    campaign?: string;
  }>;
};

export default async function DonatePage({ searchParams }: DonatePageProps) {
  const [{ campaign }, campaigns] = await Promise.all([
    searchParams,
    getDonationCampaignOptions()
  ]);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <section className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-normal text-leaf">
            Donasi
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">
            Catat niat baik, biarkan admin memverifikasi dana masuk.
          </h1>
          <p className="mt-5 text-base leading-8 text-ink/66">
            Payment gateway belum diaktifkan pada fase MVP. Donatur tetap bisa
            mengisi nominal, metode transfer, dan referensi pembayaran untuk
            diverifikasi admin.
          </p>
        </section>
        <Suspense>
          <DonationForm campaigns={campaigns} defaultCampaignId={campaign} />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
