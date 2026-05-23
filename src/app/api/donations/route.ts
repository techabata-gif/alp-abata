import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { mapDonation } from "@/lib/mappers";
import { normalizeDonationInput } from "@/validators/donation";

export async function POST(request: Request) {
  try {
    const input = normalizeDonationInput(await request.json());

    const campaign = await prisma.campaign.findUnique({
      where: { id: input.campaignId }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign tidak valid." }, { status: 400 });
    }

    let finalAmount = BigInt(input.amount);
    let finalQuantity: number | null = null;

    if (campaign.isQuantity && campaign.quantityPrice) {
      finalQuantity = input.quantity ?? 1;
      finalAmount = campaign.quantityPrice * BigInt(finalQuantity);
    }

    const donation = await prisma.donation.create({
      data: {
        campaignId: input.campaignId,
        donorName: input.donorName,
        donorPhone: input.donorPhone,
        donorEmail: input.donorEmail,
        amount: finalAmount,
        quantity: finalQuantity,
        donationType: input.donationType,
        visibility: input.visibility,
        status: "PENDING",
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentReference,
        paymentProofUrl: (input as any).paymentProofUrl,
        message: input.message,
        paymentLogs: {
          create: {
            provider: "manual",
            status: "PENDING",
            payload: {
              source: "public_form",
              paymentMethod: input.paymentMethod,
              paymentReference: input.paymentReference
            }
          }
        }
      },
      include: { campaign: { select: { title: true } } }
    });

    return NextResponse.json(
      {
        data: mapDonation(donation),
        message:
          "Donasi tercatat. Admin akan memverifikasi dana masuk sebelum progress publik bertambah."
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Data donasi belum valid.", issues: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Gagal mencatat donasi. Periksa koneksi database." },
      { status: 500 }
    );
  }
}
