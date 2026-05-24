import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "ALP #Berdampak",
    template: "%s | Abata Leaderss Peduli"
  },
  description:
    "Platform transparansi Abata Leaderss Peduli dalam program Qurban, Bakti Sosial dan Program Sosial lainnya, terdiri dari laporan pengumpulan dana dan distribusi penerima manfaat.",
  openGraph: {
    title: "Abata Leaderss Peduli",
    description:
      "Pantau terus jejak kebaikan Anda. Progress penggalangan dana dan laporan penyaluran diperbarui secara aktual dan transparan.",
    type: "website"
  }
};

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
