import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const check = await requirePermission("user:read");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(roles);
}

export async function POST(request: Request) {
  const check = await requirePermission("user:write");
  if (check.error) return NextResponse.json({ error: check.error }, { status: check.status });

  try {
    const { name, description, permissions } = await request.json();

    if (!name || !permissions || !Array.isArray(permissions)) {
      return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
    }

    const newRole = await prisma.role.create({
      data: {
        name,
        description,
        permissions
      }
    });

    return NextResponse.json(newRole, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Nama role sudah digunakan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal membuat role" }, { status: 500 });
  }
}
