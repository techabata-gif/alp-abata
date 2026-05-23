import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { mapCampaign } from "@/lib/mappers";
import { normalizeCampaignInput } from "@/validators/campaign";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const data = await request.json();
    const input = normalizeCampaignInput(data);

    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title: input.title,
        slug: input.slug,
        category: input.category || "Donasi Umum",
        programId: input.programId || null,
        shortDescription: input.shortDescription,
        description: input.description,
        targetAmount: BigInt(input.targetAmount),
        beneficiaryTarget: input.beneficiaryTarget,
        beneficiaryLabel: input.beneficiaryLabel,
        picContact: input.picContact,
        coverImageUrl: input.coverImageUrl,
        status: input.status,
        endDate: input.endDate,
        isQuantity: input.isQuantity || false,
        quantityPrice: input.quantityPrice ? BigInt(input.quantityPrice) : null,
        quantityUnit: input.quantityUnit || null,
        showPicContact: input.showPicContact ?? true,
        showDonationGuide: input.showDonationGuide ?? true,
        showBankAccounts: input.showBankAccounts ?? true
      },
      include: { _count: { select: { donations: true } } }
    });

    return NextResponse.json({ data: mapCampaign(updated) });
  } catch (error: any) {
    console.error("Error updating campaign:", error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Data campaign belum valid.", issues: error.flatten() },
        { status: 422 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui campaign" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { id: params.id },
      include: { _count: { select: { donations: true } } }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign tidak ditemukan" }, { status: 404 });
    }

    if (campaign.status === "ACTIVE" && campaign._count.donations > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus campaign ACTIVE yang memiliki donasi. Ubah status menjadi CLOSED atau DRAFT terlebih dahulu." }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus campaign" }, { status: 500 });
  }
}
