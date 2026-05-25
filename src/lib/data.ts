import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";
import { mapCampaign, mapDonation, mapReport, mapProgram } from "@/lib/mappers";
import type { AdminSummary, CampaignDTO, DonationDTO, ReportDTO } from "@/lib/types";

type LandingData = {
  campaigns: CampaignDTO[];
  recentDonations: DonationDTO[];
  reports: ReportDTO[];
  settings: Record<string, string>;
  programs: import("@/lib/types").ProgramDTO[];
};

export async function getLandingData(): Promise<LandingData> {
  noStore();

  try {
    const [campaigns, donations, reports, settings, programs] = await Promise.all([
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
      }),
      (prisma.appSetting ? prisma.appSetting.findMany() : Promise.resolve([])),
      prisma.program.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { campaigns: true } } }
      })
    ]);

    const settingsObject = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const mappedCampaigns = campaigns.map(mapCampaign);
    mappedCampaigns.sort((a, b) => {
      const aFulfilled = a.collectedAmount >= a.targetAmount;
      const bFulfilled = b.collectedAmount >= b.targetAmount;
      if (aFulfilled && !bFulfilled) return 1;
      if (!aFulfilled && bFulfilled) return -1;
      return 0;
    });

    return {
      campaigns: mappedCampaigns,
      recentDonations: donations.map(mapDonation),
      reports: reports.map(mapReport),
      settings: settingsObject,
      programs: programs.map(mapProgram)
    };
  } catch (error) {
    console.error("Error fetching landing data:", error);
    return {
      campaigns: [],
      recentDonations: [],
      reports: [],
      settings: {},
      programs: []
    };
  }
}

export async function getProgramBySlug(slug: string) {
  noStore();
  try {
    const program = await prisma.program.findUnique({
      where: { slug },
      include: {
        _count: { select: { campaigns: true } },
        campaigns: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { donations: true } } }
        }
      }
    });

    if (!program || !program.isActive) return null;

    const mappedProgram = mapProgram(program);
    const mappedCampaigns = program.campaigns.map(mapCampaign);

    let totalTarget = mappedProgram.targetAmount || 0;
    let totalCollected = 0;

    mappedCampaigns.forEach(c => {
      if (!mappedProgram.targetAmount) {
        totalTarget += c.targetAmount;
      }
      totalCollected += c.collectedAmount;
    });

    return {
      program: {
        ...mappedProgram,
        aggregatedTarget: totalTarget,
        aggregatedCollected: totalCollected
      },
      campaigns: mappedCampaigns
    };
  } catch {
    return null;
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

    const [donations, reports, settings] = await Promise.all([
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
      }),
      (prisma.appSetting ? prisma.appSetting.findMany() : Promise.resolve([]))
    ]);

    const settingsObject = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      campaign: mapCampaign(campaign),
      donations: donations.map(mapDonation),
      reports: reports.map(mapReport),
      settings: settingsObject
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

export async function getAdminDashboardData(programId?: string) {
  noStore();

  try {
    const campaignWhere = programId ? { programId } : {};
    const donationWhere = programId ? { campaign: { programId } } : {};

    const [campaigns, donations, verifiedDonors, totalTransactions, pendingDonations] =
      await Promise.all([
        prisma.campaign.findMany({
          where: campaignWhere,
          orderBy: { createdAt: "desc" },
          include: { _count: { select: { donations: true } } }
        }),
        prisma.donation.findMany({
          where: donationWhere,
          orderBy: { createdAt: "desc" },
          take: 20,
          include: { campaign: { select: { title: true } } }
        }),
        prisma.donation.findMany({
          where: { ...donationWhere, status: "VERIFIED" },
          select: { donorName: true }
        }),
        prisma.donation.count({ where: donationWhere }),
        prisma.donation.count({ where: { ...donationWhere, status: "PENDING" } })
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
