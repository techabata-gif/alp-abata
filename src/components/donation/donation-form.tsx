"use client";

import { useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, HandCoins, Loader2, Send } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { publicDonationSchema } from "@/validators/donation";
import { useDonationStore } from "@/store/donation-store";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";

type DonationFormValues = z.infer<typeof publicDonationSchema>;

type DonationFormProps = {
  campaigns: CampaignDTO[];
  defaultCampaignId?: string;
};

const amountPresets = [50000, 100000, 250000, 500000, 1000000];

export function DonationForm({
  campaigns,
  defaultCampaignId
}: DonationFormProps) {
  const { amount, setAmount } = useDonationStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DonationFormValues>({
    resolver: zodResolver(publicDonationSchema),
    defaultValues: {
      campaignId: defaultCampaignId ?? campaigns[0]?.id,
      donorName: "",
      donorPhone: "",
      donorEmail: "",
      amount,
      donationType: "Donasi umum",
      visibility: "PUBLIC",
      paymentMethod: "manual_transfer",
      paymentReference: "",
      message: ""
    }
  });

  const selectedCampaignId = watch("campaignId");
  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const isQuantityBased = selectedCampaign?.isQuantity;
  const quantityPrice = Number(selectedCampaign?.quantityPrice || 0);
  const quantityUnit = selectedCampaign?.quantityUnit || "Paket";
  const selectedAmount = watch("amount");
  const visibility = watch("visibility");
  const picContact = selectedCampaign?.picContact;

  useEffect(() => {
    setValue("campaignId", defaultCampaignId ?? campaigns[0]?.id);
  }, [defaultCampaignId, campaigns, setValue]);

  useEffect(() => {
    if (isQuantityBased) {
      const newAmount = quantity * quantityPrice;
      setValue("amount", newAmount);
      setAmount(newAmount);
    }
  }, [quantity, isQuantityBased, quantityPrice, setValue, setAmount]);

  function chooseAmount(nextAmount: number) {
    setAmount(nextAmount);
    setValue("amount", nextAmount, { shouldValidate: true });
  }

  async function onSubmit(values: DonationFormValues) {
    if (values.paymentMethod === "manual_transfer" && !file) {
      toast.error("Bukti transfer wajib diunggah untuk metode Transfer Manual.");
      return;
    }

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
        quantity: isQuantityBased ? quantity : 1,
        paymentProofUrl
      };

      const response = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadToSend)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Donasi belum berhasil dicatat.");
      }

      toast.success(payload.message ?? "Donasi berhasil dicatat.");
      reset({
        ...values,
        donorName: "",
        donorPhone: "",
        donorEmail: "",
        paymentReference: "",
        message: ""
      });
      setFile(null);
      const fileInput = document.getElementById("paymentProof") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
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
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mint text-leaf">
          <HandCoins size={20} aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-xl font-semibold text-ink">Form donasi</h2>
          <p className="mt-1 text-sm leading-6 text-ink/65">
            Dana masuk akan tampil di progress setelah diverifikasi admin.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-medium text-ink">
          Campaign
          <select
            {...register("campaignId")}
            className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
          >
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.title}
              </option>
            ))}
          </select>
          {errors.campaignId ? (
            <span className="text-xs text-red-600">{errors.campaignId.message}</span>
          ) : null}
        </label>

        {!isQuantityBased && (
          <div className="grid gap-2">
            <span className="text-sm font-medium text-ink">Nominal</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              {amountPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => chooseAmount(preset)}
                  className={
                    selectedAmount === preset
                      ? "rounded-lg bg-leaf px-3 py-3 text-sm font-semibold text-white"
                      : "rounded-lg border border-ink/10 bg-white px-3 py-3 text-sm font-semibold text-ink transition hover:border-leaf hover:text-leaf"
                  }
                >
                  {formatRupiah(preset)}
                </button>
              ))}
            </div>
            <input
              {...register("amount")}
              inputMode="numeric"
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="Nominal lain"
            />
            {errors.amount ? (
              <span className="text-xs text-red-600">{errors.amount.message}</span>
            ) : null}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Nama Anda
            <input
              {...register("donorName")}
              className="mt-2 rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="Nama lengkap"
            />
            {errors.donorName && (
              <span className="text-xs text-red-600">{errors.donorName.message}</span>
            )}
          </label>
          {isQuantityBased ? (
            <div className="grid gap-2 text-sm font-medium text-ink">
              Jumlah {quantityUnit}
              <div className="mt-2 flex items-center h-[46px] rounded-lg border border-ink/15 bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-full w-12 items-center justify-center bg-cloud hover:bg-ink/10 transition text-ink font-bold"
                >
                  -
                </button>
                <div className="flex-1 text-center font-semibold text-ink">
                  {quantity}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-full w-12 items-center justify-center bg-cloud hover:bg-ink/10 transition text-ink font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <label className="grid gap-2 text-sm font-medium text-ink">
              Jenis donasi
              <input
                {...register("donationType")}
                className="mt-2 rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
                placeholder="Donasi umum, zakat, qurban, beasiswa"
              />
              {errors.donationType ? (
                <span className="text-xs text-red-600">
                  {errors.donationType.message}
                </span>
              ) : null}
            </label>
          )}
        </div>

        {isQuantityBased && (
          <div className="rounded-lg bg-mint/20 p-4 border border-leaf/20 flex items-center justify-between">
            <span className="text-sm font-medium text-ink/80">Total Pembayaran:</span>
            <span className="text-lg font-bold text-leaf">{formatRupiah(quantity * quantityPrice)}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Nomor HP
            <input
              {...register("donorPhone")}
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="08..."
            />
          </label>
          <label className="grid gap-2 text-sm font-medium text-ink">
            Email
            <input
              {...register("donorEmail")}
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
              placeholder="nama@email.com"
            />
            {errors.donorEmail ? (
              <span className="text-xs text-red-600">{errors.donorEmail.message}</span>
            ) : null}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-ink">
            Metode
            <select
              {...register("paymentMethod")}
              className="rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
            >
              <option value="manual_transfer">Transfer manual</option>
              <option value="cash">Tunai</option>
              <option value="internal_qris">QRIS internal</option>
            </select>
          </label>
            <label className="grid gap-2 text-sm font-medium text-ink">
              Bukti Transfer *
              <input
                id="paymentProof"
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-ink/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition"
              />
            </label>
          </div>
          <div className="grid gap-2 mt-4">
            <label className="text-sm font-medium text-ink">
              Referensi pembayaran
              <input
                {...register("paymentReference")}
                className="mt-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
                placeholder="Nomor bukti/referensi (Opsional)"
              />
            </label>
          </div>

        <label className="grid gap-2 text-sm font-medium text-ink">
          Pesan
          <textarea
            {...register("message")}
            rows={3}
            className="resize-none rounded-lg border border-ink/15 bg-white px-3 py-3 text-sm outline-none transition focus:border-leaf focus:ring-4 focus:ring-mint"
            placeholder="Doa atau catatan"
          />
          {errors.message ? (
            <span className="text-xs text-red-600">{errors.message.message}</span>
          ) : null}
        </label>

        <label className="flex items-center gap-3 rounded-lg border border-ink/10 bg-cloud px-3 py-3 text-sm font-medium text-ink">
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

      <div className="mt-5 rounded-lg border border-sun bg-sun/10 px-4 py-4 text-sm text-ink/80">
        <p className="font-semibold text-ink">Informasi Transfer Manual</p>
        <p className="mt-1 leading-relaxed">
          Hubungi PIC untuk konfirmasi transfer dan verifikasi dana masuk.
          {picContact && (
            <>
              <br />
              <span className="font-bold">WhatsApp PIC: {picContact}</span>
            </>
          )}
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || uploading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-leaf px-4 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting || uploading ? (
          <Loader2 className="animate-spin" size={17} aria-hidden="true" />
        ) : (
          <Send size={17} aria-hidden="true" />
        )}
        Catat donasi
      </button>
    </form>
  );
}
