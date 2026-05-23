import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { title, slug, description } = await request.json();

    const program = await prisma.program.update({
      where: { id },
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
    return NextResponse.json({ error: "Gagal memperbarui program" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("campaign:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const program = await prisma.program.findUnique({
      where: { id },
      include: { _count: { select: { campaigns: true } } }
    });

    if (!program) {
      return NextResponse.json({ error: "Program tidak ditemukan" }, { status: 404 });
    }

    if (program._count.campaigns > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus Program yang memiliki Campaign." }, { status: 400 });
    }

    await prisma.program.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus program" }, { status: 500 });
  }
}
