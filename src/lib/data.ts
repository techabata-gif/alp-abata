import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mapCampaign, mapDonation, mapReport } from "@/lib/mappers";
import type { AdminSummary, CampaignDTO, DonationDTO, ReportDTO } from "@/lib/types";

type LandingData = {
  campaigns: CampaignDTO[];
  recentDonations: DonationDTO[];
  reports: ReportDTO[];
};

export async function getLandingData(): Promise<LandingData> {
  noStore();

  try {
    const [campaigns, donations, reports] = await Promise.all([
      prisma.campaign.findMany({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { donations: true } } }
      }),
      prisma.donation.findMany({
        where: { status: "VERIFIED" },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: { campaign: { select: { title: true } } }
      }),
      prisma.report.findMany({
        orderBy: { publishedAt: "desc" },
        take: 4
      })
    ]);

    return {
      campaigns: campaigns.map(mapCampaign),
      recentDonations: donations.map(mapDonation),
      reports: reports.map(mapReport)
    };
  } catch (error) {
    return {
      campaigns: [],
      recentDonations: [],
      reports: []
    };
  }
}

export async function getCampaignBySlug(slug: string) {
  noStore();

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug },
      include: { _count: { select: { donations: true } } }
    });

    if (!campaign) {
      return null;
    }

    const [donations, reports] = await Promise.all([
      prisma.donation.findMany({
        where: { campaignId: campaign.id, status: "VERIFIED" },
        orderBy: { createdAt: "desc" },
        take: 12,
        include: { campaign: { select: { title: true } } }
      }),
      prisma.report.findMany({
        where: { campaignId: campaign.id },
        orderBy: { publishedAt: "desc" },
        take: 6
      })
    ]);

    return {
      campaign: mapCampaign(campaign),
      donations: donations.map(mapDonation),
      reports: reports.map(mapReport)
    };
  } catch (error) {
    return null;
  }
}

export async function getDonationCampaignOptions() {
  noStore();

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { donations: true } } }
    });

    return campaigns.map(mapCampaign);
  } catch (error) {
    return [];
  }
}

export async function getAdminDashboardData() {
  noStore();

  try {
    const [campaigns, donations, verifiedDonors, totalTransactions, pendingDonations] =
      await Promise.all([
        prisma.campaign.findMany({
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { donations: true } } }
        }),
        prisma.donation.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { campaign: { select: { title: true } } }
        }),
        prisma.donation.findMany({
          where: { status: "VERIFIED" },
          select: { donorName: true }
        }),
        prisma.donation.count(),
        prisma.donation.count({ where: { status: "PENDING" } })
      ]);

    const uniqueDonors = new Set(
      verifiedDonors.map((donation) => donation.donorName.toLowerCase())
    );

    const summary: AdminSummary = {
      totalCollected: campaigns.reduce(
        (sum, campaign) => sum + Number(campaign.collectedAmount),
        0
      ),
      totalTransactions,
      totalDonors: uniqueDonors.size,
      activeCampaigns: campaigns.filter((campaign) => campaign.status === "ACTIVE").length,
      pendingDonations
    };

    return {
      summary,
      campaigns: campaigns.map(mapCampaign),
      donations: donations.map(mapDonation)
    };
  } catch (error) {
    return {
      summary: {
        totalCollected: 0,
        totalTransactions: 0,
        totalDonors: 0,
        activeCampaigns: 0,
        pendingDonations: 0
      },
      campaigns: [],
      donations: []
    };
  }
}
