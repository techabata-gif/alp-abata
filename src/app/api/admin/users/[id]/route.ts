import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, getUserSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { name, username, email, password, roleId } = await request.json();

    if (!name || !username || !email || !roleId) {
      return NextResponse.json({ error: "Nama, Username, Email, dan Role wajib diisi" }, { status: 400 });
    }

    const dataToUpdate: any = {
      name,
      username,
      email,
      roleId
    };

    if (password && password.trim() !== "") {
      dataToUpdate.passwordHash = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { role: true }
    });

    return NextResponse.json({
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email atau Username sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memperbarui pengguna" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const session = await getUserSession();
  if (session?.id === id) {
    return NextResponse.json({ error: "Anda tidak dapat menghapus akun Anda sendiri" }, { status: 403 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    // Optional: Mencegah delete jika dia adalah satu-satunya super admin
    if (user.role?.name === "SUPER_ADMIN") {
      const superAdminCount = await prisma.user.count({
        where: { role: { name: "SUPER_ADMIN" } }
      });
      if (superAdminCount <= 1) {
        return NextResponse.json({ error: "Tidak dapat menghapus satu-satunya SUPER_ADMIN" }, { status: 400 });
      }
    }

    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus pengguna" }, { status: 500 });
  }
}
