import { z } from "zod";
import { slugify } from "@/lib/utils";

export const campaignSchema = z.object({
  title: z.string().trim().min(4, "Judul minimal 4 karakter"),
  slug: z.string().trim().optional().or(z.literal("")),
  category: z.string().trim().min(3, "Kategori wajib diisi"),
  categoryId: z.string().optional().or(z.literal("")),
  programId: z.string().optional().or(z.literal("")),
  shortDescription: z.string().trim().max(180).optional().or(z.literal("")),
  description: z.string().trim().min(20, "Deskripsi minimal 20 karakter"),
  targetAmount: z.coerce
    .number()
    .int()
    .min(10000, "Target minimal Rp10.000"),
  beneficiaryTarget: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.coerce.number().int().min(0).optional()
  ),
  beneficiaryLabel: z.string().trim().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "ACTIVE", "CLOSED"]).default("ACTIVE"),
  endDate: z.string().optional().or(z.literal("")),
  picContact: z.string().trim().optional().or(z.literal("")),
  coverImageUrl: z.string().optional().or(z.literal("")),
  isQuantity: z.boolean().default(false).optional(),
  quantityPrice: z.coerce.number().optional(),
  quantityUnit: z.string().optional(),
  showPicContact: z.boolean().default(true).optional(),
  showDonationGuide: z.boolean().default(true).optional(),
  showBankAccounts: z.boolean().default(true).optional(),
});

export type CampaignInput = z.infer<typeof campaignSchema>;

export function normalizeCampaignInput(input: unknown) {
  const parsed = campaignSchema.parse(input);
  const title = parsed.title;
  const slug = parsed.slug || slugify(title);

  return {
    ...parsed,
    slug,
    categoryId: parsed.categoryId || null,
    programId: parsed.programId || null,
    shortDescription: parsed.shortDescription || null,
    beneficiaryTarget: parsed.beneficiaryTarget ?? null,
    beneficiaryLabel: parsed.beneficiaryLabel || null,
    endDate: parsed.endDate ? new Date(parsed.endDate) : null,
    picContact: parsed.picContact || null,
    coverImageUrl: parsed.coverImageUrl || null
  };
}
