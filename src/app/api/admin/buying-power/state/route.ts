import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// Mendapatkan data simulasi
export async function GET() {
  try {
    const session = await verifySession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `buying_power_user_${session.id}`;
    const state = await prisma.appSetting.findUnique({
      where: { key }
    });

    if (!state) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: JSON.parse(state.value) });
  } catch (error) {
    console.error("Error GET buying power state:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Menyimpan data simulasi
export async function POST(request: Request) {
  try {
    const session = await verifySession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const key = `buying_power_user_${session.id}`;

    await prisma.appSetting.upsert({
      where: { key },
      update: { value: JSON.stringify(body) },
      create: { key, value: JSON.stringify(body) }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error POST buying power state:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Mereset data simulasi
export async function DELETE() {
  try {
    const session = await verifySession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const key = `buying_power_user_${session.id}`;

    await prisma.appSetting.delete({
      where: { key }
    }).catch(() => {
      // Abaikan jika key tidak ditemukan
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error DELETE buying power state:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
