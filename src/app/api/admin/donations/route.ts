import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { mapDonation } from "@/lib/mappers";
import { normalizeDonationInput } from "@/validators/donation";

export async function POST(request: Request) {
  try {
    const input = normalizeDonationInput(await request.json(), true);

    const donation = await prisma.$transaction(async (tx) => {
      const created = await tx.donation.create({
        data: {
          campaignId: input.campaignId,
          donorName: input.donorName,
          donorPhone: input.donorPhone,
          donorEmail: input.donorEmail,
          amount: BigInt(input.amount),
          donationType: input.donationType,
          visibility: input.visibility,
          status: input.status,
          paymentMethod: input.paymentMethod,
          paymentReference: input.paymentReference,
          message: input.message,
          verifiedAt: input.status === "VERIFIED" ? new Date() : null,
          paymentLogs: {
            create: {
              provider: "manual",
              status: input.status,
              payload: {
                source: "admin_manual_entry",
                paymentMethod: input.paymentMethod,
                paymentReference: input.paymentReference
              }
            }
          }
        },
        include: { campaign: { select: { title: true } } }
      });

      if (input.status === "VERIFIED") {
        await tx.campaign.update({
          where: { id: input.campaignId },
          data: { collectedAmount: { increment: BigInt(input.amount) } }
        });
      }

      return created;
    });

    return NextResponse.json({ data: mapDonation(donation) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Data donasi manual belum valid.", issues: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Gagal mencatat donasi manual." },
      { status: 500 }
    );
  }
}
