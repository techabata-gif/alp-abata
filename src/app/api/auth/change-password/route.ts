import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password lama dan password baru wajib diisi." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password baru minimal 8 karakter." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Akun tidak ditemukan atau tidak valid." }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: "Password lama yang Anda masukkan salah." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: newPasswordHash }
    });

    return NextResponse.json({ message: "Password berhasil diperbarui." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server saat memperbarui password." }, { status: 500 });
  }
}
