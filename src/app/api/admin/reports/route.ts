import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requirePermission("read_reports");
    if (session instanceof NextResponse) return session;

    const reports = await prisma.report.findMany({
      orderBy: { publishedAt: "desc" },
      include: { campaign: { select: { title: true } } }
    });
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission("manage_reports");
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    const { title, description, imageUrl, amountUsed, campaignId } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Judul dan deskripsi wajib diisi" }, { status: 400 });
    }

    const report = await prisma.report.create({
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
      message: "Laporan berhasil ditambahkan",
      report: { ...report, amountUsed: report.amountUsed?.toString() }
    });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan laporan" }, { status: 500 });
  }
}
