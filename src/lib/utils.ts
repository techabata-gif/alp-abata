import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatRupiah(value: number | bigint) {
  const amount = typeof value === "bigint" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatNumber(value: number | bigint) {
  const amount = typeof value === "bigint" ? Number(value) : value;

  return new Intl.NumberFormat("id-ID").format(amount);
}

export function getProgressPercentage(collected: number, target: number) {
  if (target <= 0) {
    return 0;
  }

  return Math.min(100, Math.round((collected / target) * 100));
}

export function getDaysLeft(endDate?: string | Date | null) {
  if (!endDate) {
    return null;
  }

  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diff = end.getTime() - Date.now();

  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getOptimizedOpenGraphImage(url: string | null | undefined): string {
  if (!url) return "/assets/hero-donation.png"; // or any default
  
  // WhatsApp has a 300KB limit for OpenGraph images, and dimensions should be ~1200x630.
  // If the image is hosted on Cloudinary, we inject transformation parameters.
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    // If it already has transformations, we could replace them, but usually they are raw uploads.
    return url.replace("/upload/", "/upload/c_fill,w_1200,h_630,q_auto,f_jpg/");
  }

  return url;
}
