import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Email/Username dan password wajib diisi." }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier }
        ]
      },
      include: { role: true }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Kredensial tidak valid." }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: "Kredensial tidak valid." }, { status: 401 });
    }

    await createSession({
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      permissions: user.role?.permissions || []
    });

    return NextResponse.json({ message: "Login berhasil" });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
