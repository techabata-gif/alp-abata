import { z } from "zod";

export const publicDonationSchema = z.object({
  campaignId: z.string().uuid("Campaign tidak valid"),
  donorName: z.string().trim().min(2, "Nama minimal 2 karakter"),
  donorPhone: z.string().trim().optional().or(z.literal("")),
  donorEmail: z.string().email("Email tidak valid").optional().or(z.literal("")),
  amount: z.coerce.number().int().min(10000, "Donasi minimal Rp10.000"),
  donationType: z.string().trim().min(3, "Jenis donasi wajib diisi"),
  visibility: z.enum(["PUBLIC", "ANONYMOUS"]).default("PUBLIC"),
  paymentMethod: z.string().trim().min(3).default("manual_transfer"),
  paymentReference: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().max(280).optional().or(z.literal(""))
});

export const adminDonationSchema = publicDonationSchema.extend({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"]).default("VERIFIED")
});

export const donationStatusSchema = z.object({
  status: z.enum(["PENDING", "VERIFIED", "REJECTED"])
});

export type PublicDonationInput = z.infer<typeof publicDonationSchema> & {
  donorPhone: string | null;
  donorEmail: string | null;
  paymentReference: string | null;
  message: string | null;
};

export type AdminDonationInput = z.infer<typeof adminDonationSchema> & {
  donorPhone: string | null;
  donorEmail: string | null;
  paymentReference: string | null;
  message: string | null;
};

export function normalizeDonationInput(
  input: unknown,
  admin: true
): AdminDonationInput;
export function normalizeDonationInput(
  input: unknown,
  admin?: false
): PublicDonationInput;
export function normalizeDonationInput(input: unknown, admin = false) {
  const parsed = admin
    ? adminDonationSchema.parse(input)
    : publicDonationSchema.parse(input);

  return {
    ...parsed,
    donorPhone: parsed.donorPhone || null,
    donorEmail: parsed.donorEmail || null,
    paymentReference: parsed.paymentReference || null,
    message: parsed.message || null
  };
}
