import type { MetadataRoute } from "next";
import { getLandingData } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { campaigns } = await getLandingData();

  return [
    {
      url: baseUrl,
      lastModified: new Date()
    },
    ...campaigns.map((campaign) => ({
      url: `${baseUrl}/campaign/${campaign.slug}`,
      lastModified: new Date(campaign.createdAt)
    }))
  ];
}
