import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { name, description, permissions } = await request.json();

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    if (name === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Role SUPER_ADMIN tidak dapat diubah" }, { status: 403 });
    }

    const role = await prisma.role.findUnique({ where: { id } });
    if (role?.name === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Role SUPER_ADMIN tidak dapat diubah" }, { status: 403 });
    }

    const updatedRole = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions
      }
    });

    return NextResponse.json(updatedRole);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Nama role sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui role" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const role = await prisma.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } }
    });

    if (!role) {
      return NextResponse.json({ error: "Role tidak ditemukan" }, { status: 404 });
    }

    if (role.name === "SUPER_ADMIN") {
      return NextResponse.json({ error: "Role SUPER_ADMIN tidak dapat dihapus" }, { status: 403 });
    }

    if (role._count.users > 0) {
      return NextResponse.json({ error: "Tidak dapat menghapus Role yang masih digunakan oleh user" }, { status: 400 });
    }

    await prisma.role.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus role" }, { status: 500 });
  }
}
