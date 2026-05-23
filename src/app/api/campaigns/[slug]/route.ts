import { NextResponse } from "next/server";
import { getCampaignBySlug } from "@/lib/data";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const data = await getCampaignBySlug(slug);

  if (!data) {
    return NextResponse.json(
      { error: "Campaign tidak ditemukan." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data });
}
