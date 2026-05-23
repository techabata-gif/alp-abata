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
  initialData?: any;
  onSuccess?: () => void;
};

export function AdminDonationForm({ campaigns, initialData, onSuccess }: AdminDonationFormProps) {
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
    defaultValues: initialData ? {
      campaignId: initialData.campaignId,
      donorName: initialData.donorName,
      donorPhone: initialData.donorPhone || "",
      donorEmail: initialData.donorEmail || "",
      amount: Number(initialData.amount),
      quantity: Number(initialData.quantity || 1),
      donationType: initialData.donationType || "Donasi umum",
      visibility: initialData.visibility || "PUBLIC",
      paymentMethod: initialData.paymentMethod || "transfer_bank",
      paymentReference: initialData.paymentReference || "",
      message: initialData.message || "",
      status: initialData.status || "VERIFIED"
    } : {
      campaignId: campaigns[0]?.id,
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      amount: campaigns[0]?.isQuantity ? Number(campaigns[0].quantityPrice || 0) : 100000,
      quantity: 1,
      donationType: "Donasi umum",
      visibility: "PUBLIC",
      paymentMethod: "transfer_bank",
      paymentReference: "",
      message: "",
      status: "VERIFIED"
    }
  });

  const visibility = watch("visibility");
  const selectedCampaignId = watch("campaignId");
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId);
  const isQuantity = selectedCampaign?.isQuantity;
  const quantityPrice = Number(selectedCampaign?.quantityPrice || 0);
  const quantityUnit = selectedCampaign?.quantityUnit || "Item";

  async function onSubmit(values: AdminDonationFormValues) {
    setUploading(true);
    let paymentProofUrl = initialData?.paymentProofUrl;

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

      const url = initialData ? `/api/admin/donations/${initialData.id}` : "/api/admin/donations";
      const method = initialData ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Donasi manual belum berhasil dicatat.");
      }

      toast.success(initialData ? "Donasi manual berhasil diperbarui." : "Donasi manual berhasil dicatat.");
      reset({
        ...values,
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        amount: campaigns[0]?.isQuantity ? Number(campaigns[0].quantityPrice || 0) : 100000,
        paymentReference: "",
        message: ""
      });
      setFile(null);
      const fileInput = document.getElementById("adminPaymentProof") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      router.refresh();
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white p-2"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-mint text-leaf">
          <Banknote size={20} aria-hidden="true" />
        </span>
        <h2 className="text-lg font-semibold text-ink">{initialData ? "Edit donasi" : "Input dana masuk"}</h2>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium overflow-hidden">
          Campaign
          <select
            {...register("campaignId")}
            className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
            onChange={(e) => {
              setValue("campaignId", e.target.value);
              const c = campaigns.find(cam => cam.id === e.target.value);
              if (c?.isQuantity) {
                const q = watch("quantity") || 1;
                setValue("amount", q * Number(c.quantityPrice || 0));
              }
            }}
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
          
          {isQuantity ? (
            <div className="grid gap-4 grid-cols-[1fr_1fr]">
              <label className="grid gap-2 text-sm font-medium overflow-hidden">
                Jumlah ({quantityUnit})
                <input
                  {...register("quantity")}
                  type="number"
                  min="1"
                  className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                  onChange={(e) => {
                    const q = Number(e.target.value);
                    setValue("quantity", q);
                    setValue("amount", q * quantityPrice, { shouldValidate: true });
                  }}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium overflow-hidden">
                Nominal
                <input
                  {...register("amount")}
                  readOnly
                  className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-ink/5 cursor-not-allowed"
                />
              </label>
            </div>
          ) : (
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
          )}
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

        <div className="grid gap-2 text-sm font-medium overflow-hidden">
          Bukti Transfer
          {initialData?.paymentProofUrl && !file && (
            <div className="relative mb-2 inline-block w-fit">
              <img src={initialData.paymentProofUrl} alt="Bukti transfer" className="h-24 w-auto rounded border" />
              <button
                type="button"
                onClick={() => {
                  // In a real app we might want to also remove it from DB immediately or on save
                  // For now, setting file=null doesn't delete the old URL. 
                  // If we want to allow removing, we'd need a state for it.
                  // Since we didn't add a state for paymentProofUrl in form, we'll just show it.
                  alert("Untuk mengganti bukti transfer, cukup pilih file baru.");
                }}
                className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700 hidden"
                title="Hapus Bukti"
              >
                X
              </button>
            </div>
          )}
          <input
            id="adminPaymentProof"
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full block text-sm text-ink/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition overflow-hidden file:cursor-pointer truncate"
          />
        </div>

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
        {initialData ? "Simpan Perubahan" : "Simpan donasi"}
      </button>
    </form>
  );
}
