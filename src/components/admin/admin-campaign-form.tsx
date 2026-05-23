"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Flag, Loader2, Plus } from "lucide-react";
import { campaignSchema } from "@/validators/campaign";

type CampaignFormValues = z.infer<typeof campaignSchema>;

export function AdminCampaignForm({ programs = [] }: { programs?: any[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "Donasi Umum",
      programId: undefined,
      shortDescription: "",
      description: "",
      targetAmount: 50000000,
      beneficiaryTarget: undefined,
      beneficiaryLabel: "",
      status: "ACTIVE",
      endDate: "",
      picContact: "",
      coverImageUrl: ""
    }
  });

  async function onSubmit(values: CampaignFormValues) {
    setError(null);
    const response = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    const payload = await response.json();

    if (!response.ok) {
      setError(payload.error ?? "Campaign belum berhasil dibuat.");
      return;
    }

    reset();
    router.refresh();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Gagal upload gambar");

      const data = await res.json();
      register("coverImageUrl").onChange({ target: { value: data.secure_url, name: "coverImageUrl" }});
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-ink/10 bg-white p-5 shadow-soft"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-leaf">
          <Flag size={20} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-ink">Campaign baru</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          Judul
          <input
            {...register("title")}
            className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          {errors.title ? (
            <span className="text-xs text-red-600">{errors.title.message}</span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Slug
            <input
              {...register("slug")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="otomatis dari judul"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Kategori
            <select
              {...register("category")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
            >
              <option value="Donasi Umum">Donasi Umum</option>
              <option value="Zakat">Zakat</option>
              <option value="Infaq">Infaq</option>
              <option value="Qurban">Qurban</option>
              <option value="Wakaf">Wakaf</option>
              <option value="Kemanusiaan">Kemanusiaan</option>
            </select>
            {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
          </label>
        </div>

        <div>
          <label htmlFor="programId" className="text-sm font-medium text-ink">
            Program (Opsional)
          </label>
          <select
            id="programId"
            {...register("programId")}
            className="mt-1 w-full rounded-lg border border-ink/20 px-3 py-2 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
          >
            <option value="">-- Tidak ada Program --</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Ringkasan
          <input
            {...register("shortDescription")}
            className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Deskripsi
          <textarea
            {...register("description")}
            rows={4}
            className="w-full resize-none rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
          />
          {errors.description ? (
            <span className="text-xs text-red-600">
              {errors.description.message}
            </span>
          ) : null}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Target dana
            <input
              {...register("targetAmount")}
              inputMode="numeric"
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
            {errors.targetAmount ? (
              <span className="text-xs text-red-600">
                {errors.targetAmount.message}
              </span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Deadline
            <input
              {...register("endDate")}
              type="date"
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Kontak PIC (WhatsApp)
            <input
              {...register("picContact")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="+62812..."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Cover Image
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleImageUpload}
              className="w-full block text-sm text-ink/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition file:cursor-pointer truncate"
            />
            {uploading && <span className="text-xs text-leaf">Mengunggah...</span>}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Target manfaat
            <input
              {...register("beneficiaryTarget")}
              inputMode="numeric"
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium sm:col-span-2 overflow-hidden">
            Label manfaat
            <input
              {...register("beneficiaryLabel")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="paket, anak, keluarga"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Status
          <select
            {...register("status")}
            className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
          >
            <option value="ACTIVE">Aktif</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Ditutup</option>
          </select>
        </label>
      </div>

      {error ? (
        <div className="mt-5 rounded-lg bg-red-50 px-3 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-leaf disabled:opacity-60"
      >
        {isSubmitting ? (
          <Loader2 className="animate-spin" size={17} aria-hidden="true" />
        ) : (
          <Plus size={17} aria-hidden="true" />
        )}
        Buat campaign
      </button>
    </form>
  );
}
