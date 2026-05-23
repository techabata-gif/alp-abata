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
    "Platform penggalangan dana transparan untuk yayasan, sekolah, DKM, komunitas, dan campaign sosial.",
  openGraph: {
    title: "Abata Leaderss Peduli",
    description:
      "Kelola campaign, catat donasi manual, dan tampilkan progress dana secara transparan.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-cloud text-ink selection:bg-leaf/20`}>
        <NextTopLoader color="#16a34a" showSpinner={false} />
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
