import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await requirePermission("donation:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const data = await request.json();

    const donation = await prisma.donation.findUnique({
      where: { id: params.id }
    });

    if (!donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      campaignId: data.campaignId !== undefined ? data.campaignId : donation.campaignId,
      status: data.status !== undefined ? data.status : donation.status,
      donorName: data.donorName !== undefined ? data.donorName : donation.donorName,
      amount: data.amount !== undefined ? BigInt(data.amount) : donation.amount,
      quantity: data.quantity !== undefined ? Number(data.quantity) : donation.quantity,
      donationType: data.donationType !== undefined ? data.donationType : donation.donationType,
      visibility: data.visibility !== undefined ? data.visibility : donation.visibility,
      paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : donation.paymentMethod,
      paymentReference: data.paymentReference !== undefined ? data.paymentReference : donation.paymentReference,
    };

    if (data.paymentProofUrl !== undefined) {
      updateData.paymentProofUrl = data.paymentProofUrl;
    }

    // If changing to VERIFIED and it wasn't verified before
    if (data.status === "VERIFIED" && donation.status !== "VERIFIED") {
      updateData.verifiedAt = new Date();
    } else if (data.status !== "VERIFIED") {
      updateData.verifiedAt = null;
    }

    const oldCampaignId = donation.campaignId;

    const updated = await prisma.$transaction(async (tx) => {
      const updatedDonation = await tx.donation.update({
        where: { id: params.id },
        data: updateData,
        include: { campaign: { select: { title: true } } }
      });

      // Recalculate campaign total collected amount
      const allVerified = await tx.donation.aggregate({
        where: { campaignId: updatedDonation.campaignId, status: "VERIFIED" },
        _sum: { amount: true }
      });

      await tx.campaign.update({
        where: { id: updatedDonation.campaignId },
        data: { collectedAmount: allVerified._sum.amount || 0n }
      });

      // If campaign changed, recalculate old campaign
      if (oldCampaignId !== updatedDonation.campaignId) {
        const allVerifiedOld = await tx.donation.aggregate({
          where: { campaignId: oldCampaignId, status: "VERIFIED" },
          _sum: { amount: true }
        });
        await tx.campaign.update({
          where: { id: oldCampaignId },
          data: { collectedAmount: allVerifiedOld._sum.amount || 0n }
        });
      }

      return updatedDonation;
    });

    return NextResponse.json({
      ...updated,
      amount: updated.amount.toString()
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memperbarui donasi" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await requirePermission("donation:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id }
    });

    if (!donation) {
      return NextResponse.json({ error: "Donasi tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.donation.delete({
        where: { id: params.id }
      });

      // Recalculate campaign total if it was verified
      if (donation.status === "VERIFIED") {
        const allVerified = await tx.donation.aggregate({
          where: { campaignId: donation.campaignId, status: "VERIFIED" },
          _sum: { amount: true }
        });

        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: { collectedAmount: allVerified._sum.amount || 0n }
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus donasi" }, { status: 500 });
  }
}
