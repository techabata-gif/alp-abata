import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const check = await requirePermission("user:read");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const users = await prisma.user.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(users.map(user => ({
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  })));
}

export async function POST(request: Request) {
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { name, username, email, password, roleId } = await request.json();

    if (!name || !username || !email || !password || !roleId) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        roleId
      },
      include: { role: true }
    });

    return NextResponse.json({
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    }, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Email atau Username sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat pengguna" }, { status: 500 });
  }
}
