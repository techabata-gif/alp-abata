import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { mapCampaign } from "@/lib/mappers";
import { normalizeCampaignInput } from "@/validators/campaign";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { donations: true } } }
    });

    return NextResponse.json({ data: campaigns.map(mapCampaign) });
  } catch {
    return NextResponse.json(
      { error: "Gagal mengambil daftar campaign." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const input = normalizeCampaignInput(await request.json());

    const campaign = await prisma.campaign.create({
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
        status: input.status,
        endDate: input.endDate
      },
      include: { _count: { select: { donations: true } } }
    });

    return NextResponse.json({ data: mapCampaign(campaign) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Data campaign belum valid.", issues: error.flatten() },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat campaign. Pastikan slug belum dipakai." },
      { status: 500 }
    );
  }
}
