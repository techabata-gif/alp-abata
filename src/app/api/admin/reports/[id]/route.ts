import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("manage_reports");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    const body = await req.json();
    const { title, description, imageUrl, amountUsed, campaignId } = body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        title,
        description,
        imageUrl,
        amountUsed: amountUsed ? BigInt(amountUsed) : null,
        campaignId: campaignId || null
      },
      include: { campaign: { select: { title: true } } }
    });

    return NextResponse.json({
      message: "Laporan berhasil diperbarui",
      report: { ...report, amountUsed: report.amountUsed?.toString() }
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui laporan" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requirePermission("manage_reports");
    if (session instanceof NextResponse) return session;

    const { id } = await params;
    await prisma.report.delete({ where: { id } });

    return NextResponse.json({ message: "Laporan berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus laporan" }, { status: 500 });
  }
}
