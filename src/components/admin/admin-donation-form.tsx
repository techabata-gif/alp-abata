"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Banknote, Loader2, Plus } from "lucide-react";
import type { CampaignDTO } from "@/lib/types";
import { adminDonationSchema } from "@/validators/donation";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";

type AdminDonationFormValues = z.infer<typeof adminDonationSchema>;

type AdminDonationFormProps = {
  campaigns: CampaignDTO[];
};

export function AdminDonationForm({ campaigns }: AdminDonationFormProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AdminDonationFormValues>({
    resolver: zodResolver(adminDonationSchema),
    defaultValues: {
      campaignId: campaigns[0]?.id,
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      amount: 100000,
      donationType: "Donasi umum",
      visibility: "PUBLIC",
      paymentMethod: "transfer_bank",
      paymentReference: "",
      message: "",
      status: "VERIFIED"
    }
  });

  const visibility = watch("visibility");

  async function onSubmit(values: AdminDonationFormValues) {
    setUploading(true);
    let paymentProofUrl = undefined;

    try {
      if (file) {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressed);
        
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal mengunggah foto.");
        paymentProofUrl = uploadData.secure_url;
      }

      const payloadToSend = {
        ...values,
        paymentProofUrl
      };

      const response = await fetch("/api/admin/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Donasi manual belum berhasil dicatat.");
      }

      toast.success("Donasi manual berhasil dicatat.");
      reset({
        ...values,
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        amount: 100000,
        paymentReference: "",
        message: ""
      });
      setFile(null);
      const fileInput = document.getElementById("adminPaymentProof") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
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
          <Banknote size={20} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-ink">Input dana masuk</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium overflow-hidden">
          Campaign
          <select
            {...register("campaignId")}
            className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Nama
            <input
              {...register("donorName")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
            {errors.donorName ? (
              <span className="text-xs text-red-600">{errors.donorName.message}</span>
            ) : null}
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Nominal
            <input
              {...register("amount")}
              inputMode="numeric"
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
            {errors.amount ? (
              <span className="text-xs text-red-600">{errors.amount.message}</span>
            ) : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Jenis donasi
            <input
              {...register("donationType")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Status
            <select
              {...register("status")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
            >
              <option value="VERIFIED">Terverifikasi</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Ditolak</option>
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Metode
            <select
              {...register("paymentMethod")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
            >
              <option value="transfer_bank">Transfer bank</option>
              <option value="cash">Tunai</option>
              <option value="internal_qris">QRIS internal</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium overflow-hidden">
            Referensi
            <input
              {...register("paymentReference")}
              className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="Nomor referensi (opsional)"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm font-medium overflow-hidden">
          Cover Image
          <input
            id="adminPaymentProof"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full block text-sm text-ink/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition overflow-hidden file:cursor-pointer truncate"
          />
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-ink/10 bg-cloud px-3 py-3 text-sm font-medium">
          <input
            type="checkbox"
            checked={visibility === "ANONYMOUS"}
            onChange={(event) =>
              setValue("visibility", event.target.checked ? "ANONYMOUS" : "PUBLIC")
            }
            className="h-4 w-4 accent-leaf"
          />
          Tampilkan sebagai Hamba Allah
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:opacity-60"
      >
        {isSubmitting || uploading ? (
          <Loader2 className="animate-spin" size={17} aria-hidden="true" />
        ) : (
          <Plus size={17} aria-hidden="true" />
        )}
        Simpan donasi
      </button>
    </form>
  );
}
