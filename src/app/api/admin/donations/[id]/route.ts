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
      status: data.status,
      donorName: data.donorName,
      amount: BigInt(data.amount),
    };

    // If changing to VERIFIED and it wasn't verified before
    if (data.status === "VERIFIED" && donation.status !== "VERIFIED") {
      updateData.verifiedAt = new Date();
    } else if (data.status !== "VERIFIED") {
      updateData.verifiedAt = null;
    }

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
