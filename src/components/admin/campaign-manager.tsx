"use client";

import { useState } from "react";
import { Flag, Pencil, Trash2, X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/lib/utils";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { campaignSchema } from "@/validators/campaign";
import { toast } from "sonner";

type CampaignFormValues = z.infer<typeof campaignSchema>;

export function CampaignManager({ initialCampaigns, programs = [], categories = [] }: { initialCampaigns: any[], programs?: any[], categories?: any[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [targetQty, setTargetQty] = useState<string>("");
  const [filterProgramId, setFilterProgramId] = useState<string>("ALL");
  const [filterCategoryId, setFilterCategoryId] = useState<string>("ALL");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      title: "",
      slug: "",
      category: "",
      programId: "",
      shortDescription: "",
      description: "",
      targetAmount: 50000000,
      beneficiaryTarget: undefined,
      beneficiaryLabel: "",
      status: "ACTIVE",
      endDate: "",
      picContact: "",
      coverImageUrl: "",
      isQuantity: false,
      quantityPrice: undefined,
      quantityUnit: "",
      showPicContact: true,
      showDonationGuide: true,
      showBankAccounts: true
    }
  });

  const watchProgramId = watch("programId");
  const filteredCategories = categories.filter(c => !c.programId || c.programId === watchProgramId);
  const currentIsQuantity = watch("isQuantity");
  const currentCoverImageUrl = watch("coverImageUrl");

  const openCreateModal = () => {
    setEditingCampaign(null);
    reset({
      title: "",
      slug: "",
      category: "",
      programId: "",
      shortDescription: "",
      description: "",
      targetAmount: 50000000,
      beneficiaryTarget: undefined,
      beneficiaryLabel: "",
      status: "ACTIVE",
      endDate: "",
      picContact: "",
      coverImageUrl: "",
      isQuantity: false,
      quantityPrice: undefined,
      quantityUnit: "",
      showPicContact: true,
      showDonationGuide: true,
      showBankAccounts: true
    });
    setTargetQty("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (campaign: any) => {
    setEditingCampaign(campaign);
    reset({
      ...campaign,
      targetAmount: Number(campaign.targetAmount),
      beneficiaryTarget: campaign.beneficiaryTarget ? Number(campaign.beneficiaryTarget) : undefined,
      quantityPrice: campaign.quantityPrice ? Number(campaign.quantityPrice) : undefined,
      endDate: campaign.endDate ? new Date(campaign.endDate).toISOString().slice(0, 16) : undefined,
      programId: campaign.programId || "",
      category: campaign.category || "",
      shortDescription: campaign.shortDescription || "",
      coverImageUrl: campaign.coverImageUrl || "",
      isQuantity: campaign.isQuantity || false,
      quantityUnit: campaign.quantityUnit || "",
      showPicContact: campaign.showPicContact ?? true,
      showDonationGuide: campaign.showDonationGuide ?? true,
      showBankAccounts: campaign.showBankAccounts ?? true
    });

    if (campaign.isQuantity && campaign.quantityPrice) {
      setTargetQty(String(Math.floor(Number(campaign.targetAmount) / Number(campaign.quantityPrice))));
    } else {
      setTargetQty("");
    }

    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

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
      setValue("coverImageUrl", data.secure_url, { shouldValidate: true });
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = async (values: CampaignFormValues) => {
    setError(null);
    try {
      const url = editingCampaign ? `/api/admin/campaigns/${editingCampaign.id}` : "/api/campaigns";
      const method = editingCampaign ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (editingCampaign) {
        setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, ...data.data } : c));
        toast.success("Campaign berhasil diperbarui!");
      } else {
        setCampaigns([data.data, ...campaigns]);
        toast.success("Campaign berhasil dibuat!");
      }
      
      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const onError = (errors: any) => {
    console.log("Form Validation Errors:", errors);
    toast.error("Gagal menyimpan. Ada isian yang belum lengkap atau salah, silakan cek form yang berwarna merah.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Campaign ini? Seluruh data yang berkaitan juga akan terhapus. (Tindakan ini tidak bisa dibatalkan)")) return;
    
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setCampaigns(campaigns.filter(c => c.id !== id));
      toast.success("Campaign berhasil dihapus!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchProgram = filterProgramId === "ALL" || c.programId === filterProgramId;
    const matchCategory = filterCategoryId === "ALL" || (c.categoryId === filterCategoryId);
    return matchProgram && matchCategory;
  });

  return (
    <>
      <section className="rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-leaf">
              <Flag size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Campaign</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterProgramId}
              onChange={(e) => {
                setFilterProgramId(e.target.value);
                setFilterCategoryId("ALL");
              }}
              className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-cloud/50"
            >
              <option value="ALL">Semua Program</option>
              {programs?.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="rounded-lg border border-ink/15 px-3 py-1.5 text-sm outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-cloud/50"
            >
              <option value="ALL">Semua Kategori</option>
              {categories
                ?.filter(c => filterProgramId === "ALL" || !c.programId || c.programId === filterProgramId)
                .map(c => <option key={c.id} value={c.id}>{c.name}</option>)
              }
            </select>

            <button 
              onClick={openCreateModal}
              className="flex items-center gap-2 rounded-lg bg-leaf px-3 py-1.5 text-sm font-medium text-white hover:bg-ink transition shrink-0"
            >
              <Plus size={16} /> Tambah Campaign
            </button>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Informasi Campaign</th>
                <th className="px-5 py-3 font-semibold">Target & Pendanaan</th>
                <th className="px-5 py-3 font-semibold">Detail Opsional</th>
                <th className="px-5 py-3 font-semibold">Status & PIC</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {filteredCampaigns.map((c) => (
                <tr key={c.id} className="hover:bg-cloud/30 transition">
                  <td className="px-5 py-4 align-top">
                    <div className="flex items-start gap-3">
                      {c.coverImageUrl ? (
                        <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-ink/5">
                          <img src={c.coverImageUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-md bg-ink/5 text-ink/40">
                          <Flag size={16} />
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-ink line-clamp-2 max-w-[200px]" title={c.title}>{c.title}</div>
                        <div className="text-xs text-ink/60 mt-1">
                          <span className="font-medium">Kategori:</span> {c.category}
                        </div>
                        <div className="text-xs text-ink/60 truncate max-w-[200px]" title={`/${c.slug}`}>
                          <span className="font-medium">Slug:</span> /{c.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top min-w-[220px]">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-semibold text-leaf">{formatRupiah(Number(c.collectedAmount))}</span>
                      <span className="text-ink/60">/ {formatRupiah(Number(c.targetAmount))}</span>
                    </div>
                    <div className="w-full bg-ink/10 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-leaf h-full rounded-full" 
                        style={{ width: `${Math.min(100, (Number(c.collectedAmount) / Number(c.targetAmount)) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-ink/60 mt-2">
                      {c.isQuantity ? (
                        <span className="inline-flex items-center gap-1 rounded bg-mint/50 px-1.5 py-0.5 text-leaf font-medium">
                          Paket: {formatRupiah(Number(c.quantityPrice))} / {c.quantityUnit || 'item'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-ink/5 px-1.5 py-0.5 text-ink/60">
                          Donasi Bebas
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top max-w-[200px]">
                    <div className="text-xs text-ink/80 truncate mb-1" title={c.shortDescription}>{c.shortDescription || '-'}</div>
                    <div className="text-xs text-ink/60 mt-1">
                      <span className="font-medium">Tenggat:</span> {c.endDate ? new Date(c.endDate).toLocaleDateString("id-ID") : 'Tanpa batas'}
                    </div>
                    <div className="text-xs text-ink/60 mt-0.5">
                      <span className="font-medium">Penerima:</span> {c.beneficiaryTarget ? `${c.beneficiaryTarget} ${c.beneficiaryLabel || ''}` : '-'}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <StatusBadge status={c.status} />
                    <div className="text-xs text-ink/60 mt-2 truncate max-w-[150px]">
                      <span className="font-medium">PIC:</span> {c.picContact || '-'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right align-top">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded transition"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCampaigns.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-ink/50">Tidak ada campaign yang ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Form: Scrollable on Y-axis for Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4 py-6 overflow-hidden">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl flex flex-col max-h-full">
            <div className="flex items-center justify-between p-5 border-b border-ink/10 shrink-0 bg-white rounded-t-xl z-10">
              <h3 className="text-lg font-semibold text-ink">
                {editingCampaign ? "Edit Campaign" : "Campaign Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink transition">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="overflow-y-auto p-5 grow">
              <form id="campaignForm" onSubmit={handleSubmit(onSubmit, onError)} className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium">
                    Judul
                    <input
                      {...register("title")}
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                    />
                    {errors.title && <span className="text-xs text-red-600">{errors.title.message}</span>}
                  </label>
                  
                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Slug
                    <input
                      {...register("slug")}
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                      placeholder="otomatis dari judul"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Program (Opsional)
                    <select
                      {...register("programId")}
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                    >
                      <option value="">-- Tidak ada Program --</option>
                      {programs.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Kategori
                    <select
                      {...register("categoryId")}
                      onChange={(e) => {
                        const cat = categories.find(c => c.id === e.target.value);
                        setValue("category", cat ? cat.name : "Donasi Umum");
                        setValue("categoryId", e.target.value);
                      }}
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                    >
                      <option value="">-- Pilih Kategori --</option>
                      {filteredCategories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-ink/10 bg-cloud px-4 py-4 text-sm font-medium shadow-sm">
                  <div className="flex items-center justify-between w-full gap-3">
                    <span className="text-ink/80">Donasi Berbasis Paket / Barang Tertentu (Contoh: Qurban, Sembako)</span>
                    <label className="relative inline-flex cursor-pointer items-center shrink-0">
                      <input
                        type="checkbox"
                        {...register("isQuantity")}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-ink/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint"></div>
                    </label>
                  </div>
                </div>

                {currentIsQuantity && (
                  <div className="grid gap-4 sm:grid-cols-2 rounded-lg border border-leaf/20 bg-mint/10 p-4">
                    <label className="grid gap-2 text-sm font-medium overflow-hidden">
                      Harga per Paket / Item
                      <input
                        {...register("quantityPrice")}
                        inputMode="numeric"
                        className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                        placeholder="Contoh: 3500000"
                        onChange={(e) => {
                          const val = e.target.value;
                          setValue("quantityPrice", val ? Number(val) : undefined);
                          if (targetQty) {
                            setValue("targetAmount", Number(targetQty) * Number(val || 0), { shouldValidate: true });
                          }
                        }}
                      />
                      {errors.quantityPrice && <span className="text-xs text-red-600">{errors.quantityPrice.message}</span>}
                    </label>
                    <label className="grid gap-2 text-sm font-medium overflow-hidden">
                      Nama Satuan
                      <input
                        {...register("quantityUnit")}
                        className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                        placeholder="Contoh: Ekor, Paket, Kotak"
                      />
                    </label>
                  </div>
                )}

                <label className="grid gap-2 text-sm font-medium overflow-hidden">
                  Ringkasan Singkat
                  <input
                    {...register("shortDescription")}
                    className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium overflow-hidden">
                  Deskripsi Lengkap
                  <textarea
                    {...register("description")}
                    rows={4}
                    className="w-full resize-none rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  />
                  {errors.description && <span className="text-xs text-red-600">{errors.description.message}</span>}
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  {currentIsQuantity ? (
                    <label className="grid gap-2 text-sm font-medium overflow-hidden">
                      Target Jumlah {watch("quantityUnit") ? `(${watch("quantityUnit")})` : "Item"}
                      <input
                        type="number"
                        min="1"
                        value={targetQty}
                        className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                        onChange={(e) => {
                          setTargetQty(e.target.value);
                          const qty = Number(e.target.value);
                          const price = Number(watch("quantityPrice") || 0);
                          setValue("targetAmount", qty * price, { shouldValidate: true });
                        }}
                      />
                      {errors.targetAmount && <span className="text-xs text-red-600">Target keseluruhan minimal Rp10.000. Pastikan Harga per Paket sudah diisi.</span>}
                      {watch("quantityPrice") && targetQty ? (
                        <span className="text-xs text-leaf">
                          Setara dengan {formatRupiah(Number(targetQty) * Number(watch("quantityPrice")))}
                        </span>
                      ) : null}
                    </label>
                  ) : (
                    <label className="grid gap-2 text-sm font-medium overflow-hidden">
                      Target Dana (Rp)
                      <input
                        {...register("targetAmount")}
                        inputMode="numeric"
                        className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                      />
                      {errors.targetAmount && <span className="text-xs text-red-600">{errors.targetAmount.message}</span>}
                    </label>
                  )}
                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Deadline (Tenggat Waktu)
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
                  <div className="grid gap-2 text-sm font-medium overflow-hidden">
                    Cover Image
                    {currentCoverImageUrl ? (
                      <div className="relative mb-2 inline-block w-fit">
                        <img src={currentCoverImageUrl} alt="Cover" className="h-24 w-auto rounded border object-cover" />
                        <button
                          type="button"
                          onClick={() => setValue("coverImageUrl", "", { shouldValidate: true })}
                          className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                          title="Hapus Gambar"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploading}
                        onChange={handleImageUpload}
                        className="w-full block text-sm text-ink/70 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition file:cursor-pointer truncate"
                      />
                    )}
                    {uploading && <span className="text-xs text-leaf mt-1 block">Mengunggah...</span>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Target manfaat (Angka)
                    <input
                      {...register("beneficiaryTarget")}
                      inputMode="numeric"
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                    />
                  </label>
                  <label className="grid gap-2 text-sm font-medium overflow-hidden">
                    Label manfaat
                    <input
                      {...register("beneficiaryLabel")}
                      className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                      placeholder="paket, anak, keluarga"
                    />
                  </label>
                </div>

                <label className="grid gap-2 text-sm font-medium overflow-hidden">
                  Status
                  <select
                    {...register("status")}
                    className="w-full rounded-lg border border-ink/15 px-3 py-3 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                  >
                    <option value="ACTIVE">Aktif (Dapat Dilihat Publik)</option>
                    <option value="DRAFT">Draft (Disembunyikan)</option>
                    <option value="CLOSED">Ditutup (Telah Selesai)</option>
                  </select>
                </label>

                {/* Section Informasi Donasi Manual */}
                <div className="rounded-lg border border-ink/10 bg-cloud/50 p-4 mt-2">
                  <h4 className="text-sm font-semibold text-ink mb-3">Informasi Donasi Manual</h4>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                      <span className="text-sm text-ink/80 font-medium">Kontak PIC</span>
                      <label className="relative inline-flex cursor-pointer items-center shrink-0">
                        <input type="checkbox" {...register("showPicContact")} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-ink/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                      <span className="text-sm text-ink/80 font-medium">Panduan Nominal</span>
                      <label className="relative inline-flex cursor-pointer items-center shrink-0">
                        <input type="checkbox" {...register("showDonationGuide")} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-ink/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-2 p-3 bg-white rounded-lg border border-ink/5 shadow-sm">
                      <span className="text-sm text-ink/80 font-medium">Perbankan</span>
                      <label className="relative inline-flex cursor-pointer items-center shrink-0">
                        <input type="checkbox" {...register("showBankAccounts")} className="peer sr-only" />
                        <div className="peer h-6 w-11 rounded-full bg-ink/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-ink/10 p-5 shrink-0 flex justify-end gap-3 bg-cloud/30 rounded-b-xl z-10">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-4 py-2.5 text-sm font-medium text-ink/70 hover:bg-ink/10 rounded-lg transition"
              >
                Batal
              </button>
              <button 
                type="submit" 
                form="campaignForm"
                disabled={isSubmitting || uploading} 
                className="flex items-center gap-2 bg-leaf text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-ink transition disabled:opacity-60"
              >
                {isSubmitting || uploading ? <Loader2 size={16} className="animate-spin" /> : null}
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
