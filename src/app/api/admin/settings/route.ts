import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const session = await requirePermission("read_settings");
    if (session instanceof NextResponse) return session;

    const settings = await prisma.appSetting.findMany();
    
    // Convert array of key-value pairs to an object
    const settingsObject = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({ data: settingsObject });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Gagal mengambil pengaturan" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await requirePermission("manage_settings");
    if (session instanceof NextResponse) return session;

    const body = await req.json();
    
    // Expected body: { landing_hero_label: "...", landing_hero_title: "..." }
    const entries = Object.entries(body);
    
    // We use a transaction to safely upsert all settings
    await prisma.$transaction(
      entries.map(([key, value]) => 
        prisma.appSetting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) }
        })
      )
    );

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan pengaturan" },
      { status: 500 }
    );
  }
}
