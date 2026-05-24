import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  let heroImage = "/assets/hero-donation.png";
  let titleStr = "ALP #Berdampak";

  try {
    const settings = await prisma.appSetting.findMany();
    heroImage = settings.find(s => s.key === "landing_hero_image")?.value || heroImage;
    titleStr = settings.find(s => s.key === "landing_hero_title")?.value || titleStr;
  } catch (error) {
    console.warn("Database is unreachable during metadata generation, using fallback settings.");
  }

  return {
    title: {
      default: titleStr,
      template: "%s | Abata Leaderss Peduli"
    },
    description: "Platform transparansi Abata Leaderss Peduli dalam program Qurban, Bakti Sosial dan Program Sosial lainnya, terdiri dari laporan pengumpulan dana dan distribusi penerima manfaat.",
    openGraph: {
      title: "Abata Leaderss Peduli",
      description: "Pantau terus jejak kebaikan Anda. Progress penggalangan dana dan laporan penyaluran diperbarui secara aktual dan transparan.",
      type: "website",
      siteName: "Abata Leaderss Peduli",
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: "Abata Leaderss Peduli",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Abata Leaderss Peduli",
      description: "Platform transparansi penggalangan dana dan pelaporan penyaluran bantuan.",
      images: [heroImage],
    }
  };
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className={`${inter.className} bg-cloud text-ink selection:bg-leaf/20`}>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
