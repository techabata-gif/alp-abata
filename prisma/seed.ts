import {
  CampaignStatus,
  DonationStatus,
  DonationVisibility,
  PrismaClient
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: {
      name: "SUPER_ADMIN",
      description: "Super Administrator with full access",
      permissions: ["*"]
    }
  });

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@danaamanah.local" },
    update: {},
    create: {
      name: "Admin DanaAmanah",
      username: "admin",
      email: "admin@danaamanah.local",
      passwordHash,
      roleId: adminRole.id
    }
  });

  const campaign = await prisma.campaign.upsert({
    where: { slug: "bantuan-paket-pangan" },
    update: {},
    create: {
      title: "Bantuan Paket Pangan",
      slug: "bantuan-paket-pangan",
      category: "Kemanusiaan",
      shortDescription:
        "Menghimpun paket pangan untuk keluarga rentan dan pekerja harian.",
      description:
        "Campaign ini membantu menyediakan paket pangan berisi beras, minyak, telur, dan kebutuhan pokok lain untuk keluarga rentan. Semua dana yang terverifikasi akan tampil pada progress publik.",
      targetAmount: 75000000n,
      collectedAmount: 18500000n,
      beneficiaryTarget: 300,
      beneficiaryLabel: "paket",
      coverImageUrl: "/assets/hero-donation.png",
      status: CampaignStatus.ACTIVE,
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-06-30T23:59:59.000Z")
    }
  });

  const educationCampaign = await prisma.campaign.upsert({
    where: { slug: "beasiswa-anak-yatim" },
    update: {},
    create: {
      title: "Beasiswa Anak Yatim",
      slug: "beasiswa-anak-yatim",
      category: "Pendidikan",
      shortDescription:
        "Dukungan biaya belajar, seragam, dan perlengkapan sekolah.",
      description:
        "Dana campaign digunakan untuk membantu kebutuhan pendidikan anak yatim dan dhuafa. Admin dapat mencatat donasi masuk secara manual dan mempublikasikan laporan penggunaan dana.",
      targetAmount: 120000000n,
      collectedAmount: 32000000n,
      beneficiaryTarget: 80,
      beneficiaryLabel: "anak",
      coverImageUrl: "/assets/hero-donation.png",
      status: CampaignStatus.ACTIVE,
      startDate: new Date("2026-05-15T00:00:00.000Z"),
      endDate: new Date("2026-08-15T23:59:59.000Z")
    }
  });

  await prisma.donation.createMany({
    data: [
      {
        campaignId: campaign.id,
        donorName: "Ahmad Hidayat",
        donorPhone: "081234567890",
        amount: 500000n,
        donationType: "Paket pangan",
        visibility: DonationVisibility.PUBLIC,
        status: DonationStatus.VERIFIED,
        paymentMethod: "transfer_bank",
        paymentReference: "BCA-1021",
        message: "Semoga berkah dan bermanfaat.",
        verifiedAt: new Date()
      },
      {
        campaignId: campaign.id,
        donorName: "Hamba Allah",
        amount: 1000000n,
        donationType: "Donasi umum",
        visibility: DonationVisibility.ANONYMOUS,
        status: DonationStatus.VERIFIED,
        paymentMethod: "cash",
        verifiedAt: new Date()
      },
      {
        campaignId: educationCampaign.id,
        donorName: "Siti Aminah",
        donorEmail: "siti@example.com",
        amount: 750000n,
        donationType: "Beasiswa",
        visibility: DonationVisibility.PUBLIC,
        status: DonationStatus.PENDING,
        paymentMethod: "manual_transfer",
        message: "Mohon dikonfirmasi setelah transfer."
      }
    ],
    skipDuplicates: true
  });

  await prisma.report.createMany({
    data: [
      {
        campaignId: campaign.id,
        title: "Distribusi tahap pertama",
        description:
          "Sebanyak 60 paket pangan telah disalurkan kepada warga prioritas di sekitar lokasi program.",
        amountUsed: 15000000n
      },
      {
        campaignId: educationCampaign.id,
        title: "Pendataan penerima manfaat",
        description:
          "Tim relawan menyelesaikan verifikasi awal calon penerima beasiswa untuk semester berjalan."
      }
    ],
    skipDuplicates: true
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
