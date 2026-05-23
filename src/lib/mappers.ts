import type { Campaign, Donation, Report } from "@prisma/client";
import type { CampaignDTO, DonationDTO, ReportDTO } from "@/lib/types";

type CampaignWithCount = Campaign & {
  _count?: {
    donations: number;
  };
};

type DonationWithCampaign = Donation & {
  campaign?: {
    title: string;
  };
};

export function mapCampaign(campaign: CampaignWithCount): CampaignDTO {
  return {
    id: campaign.id,
    title: campaign.title,
    slug: campaign.slug,
    category: campaign.category,
    shortDescription: campaign.shortDescription,
    description: campaign.description,
    targetAmount: Number(campaign.targetAmount),
    collectedAmount: Number(campaign.collectedAmount),
    beneficiaryTarget: campaign.beneficiaryTarget,
    beneficiaryLabel: campaign.beneficiaryLabel,
    picContact: campaign.picContact,
    coverImageUrl: campaign.coverImageUrl,
    status: campaign.status,
    startDate: campaign.startDate?.toISOString() ?? null,
    endDate: campaign.endDate?.toISOString() ?? null,
    createdAt: campaign.createdAt.toISOString(),
    donationCount: campaign._count?.donations ?? 0,
    isQuantity: campaign.isQuantity,
    quantityPrice: campaign.quantityPrice ? Number(campaign.quantityPrice) : null,
    quantityUnit: campaign.quantityUnit,
    // @ts-ignore
    showPicContact: campaign.showPicContact ?? true,
    // @ts-ignore
    showDonationGuide: campaign.showDonationGuide ?? true,
    // @ts-ignore
    showBankAccounts: campaign.showBankAccounts ?? true
  };
}

export function mapDonation(donation: DonationWithCampaign): DonationDTO {
  return {
    id: donation.id,
    campaignId: donation.campaignId,
    campaignTitle: donation.campaign?.title,
    donorName:
      donation.visibility === "ANONYMOUS" ? "Hamba Allah" : donation.donorName,
    donorPhone: donation.donorPhone,
    donorEmail: donation.donorEmail,
    amount: Number(donation.amount),
    quantity: Number(donation.quantity),
    donationType: donation.donationType,
    visibility: donation.visibility,
    status: donation.status,
    paymentMethod: donation.paymentMethod,
    paymentReference: donation.paymentReference,
    paymentProofUrl: donation.paymentProofUrl ?? null,
    message: donation.message,
    verifiedAt: donation.verifiedAt?.toISOString() ?? null,
    createdAt: donation.createdAt.toISOString()
  };
}

export function mapReport(report: Report): ReportDTO {
  return {
    id: report.id,
    campaignId: report.campaignId,
    title: report.title,
    description: report.description,
    imageUrl: report.imageUrl,
    amountUsed: report.amountUsed ? Number(report.amountUsed) : null,
    publishedAt: report.publishedAt.toISOString()
  };
}
