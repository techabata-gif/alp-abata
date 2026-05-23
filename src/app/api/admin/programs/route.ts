import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const check = await requirePermission("campaign:read"); // Reusing campaign read for now
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const programs = await prisma.program.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { campaigns: true } }
      }
    });
    return NextResponse.json(programs);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data program" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { title, slug, description } = await request.json();

    if (!title || !slug) {
      return NextResponse.json({ error: "Judul dan slug wajib diisi" }, { status: 400 });
    }

    const program = await prisma.program.create({
      data: {
        title,
        slug,
        description
      }
    });

    return NextResponse.json(program);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Slug sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat program" }, { status: 500 });
  }
}
