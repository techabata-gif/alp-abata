export type CampaignStatus = "DRAFT" | "ACTIVE" | "CLOSED";
export type DonationStatus = "PENDING" | "VERIFIED" | "REJECTED";
export type DonationVisibility = "PUBLIC" | "ANONYMOUS";

export type CampaignDTO = {
  id: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string | null;
  description: string;
  targetAmount: number;
  collectedAmount: number;
  beneficiaryTarget: number | null;
  beneficiaryLabel: string | null;
  picContact: string | null;
  coverImageUrl: string | null;
  status: CampaignStatus;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  donationCount: number;
  isQuantity: boolean;
  quantityPrice: number | null;
  quantityUnit: string | null;
  showPicContact: boolean;
  showDonationGuide: boolean;
  showBankAccounts: boolean;
};

export type DonationDTO = {
  id: string;
  campaignId: string;
  campaignTitle?: string;
  donorName: string;
  donorPhone: string | null;
  donorEmail: string | null;
  amount: number;
  quantity: number;
  donationType: string;
  visibility: DonationVisibility;
  status: DonationStatus;
  paymentMethod: string;
  paymentReference: string | null;
  paymentProofUrl: string | null;
  message: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export type ReportDTO = {
  id: string;
  campaignId: string | null;
  title: string;
  description: string;
  imageUrl: string | null;
  amountUsed: number | null;
  publishedAt: string;
};

export type AdminSummary = {
  totalCollected: number;
  totalTransactions: number;
  totalDonors: number;
  activeCampaigns: number;
  pendingDonations: number;
};
