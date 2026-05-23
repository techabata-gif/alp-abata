import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const data = await request.json();

    const updated = await prisma.campaign.update({
      where: { id: params.id },
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        programId: data.programId || null,
        shortDescription: data.shortDescription,
        description: data.description,
        targetAmount: BigInt(data.targetAmount),
        beneficiaryTarget: data.beneficiaryTarget ? parseInt(data.beneficiaryTarget) : null,
        beneficiaryLabel: data.beneficiaryLabel,
        picContact: data.picContact,
        coverImageUrl: data.coverImageUrl,
        status: data.status,
        endDate: data.endDate ? new Date(data.endDate) : null
      }
    });

    return NextResponse.json({
      ...updated,
      targetAmount: updated.targetAmount.toString(),
      collectedAmount: updated.collectedAmount.toString()
    });
  } catch (error: any) {
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

    if (campaign._count.donations > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus campaign yang memiliki donasi masuk. Coba ubah statusnya menjadi CLOSED." }, { status: 400 });
    }

    await prisma.campaign.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus campaign" }, { status: 500 });
  }
}
