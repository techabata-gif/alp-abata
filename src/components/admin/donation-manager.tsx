"use client";

import { useState } from "react";
import { HandCoins, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";
import { AdminDonationForm } from "@/components/admin/admin-donation-form";
import type { CampaignDTO } from "@/lib/types";

export function DonationManager({ initialDonations, campaigns }: { initialDonations: any[], campaigns: CampaignDTO[] }) {
  const router = useRouter();
  const [donations, setDonations] = useState(initialDonations);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openEditModal = (donation: any) => {
    setEditingDonation(donation);
    setError(null);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingDonation(null);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus donasi ini? (Tindakan ini tidak bisa dibatalkan)")) return;
    
    try {
      const res = await fetch(`/api/admin/donations/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setDonations(donations.filter(d => d.id !== id));
      toast.success("Donasi berhasil dihapus.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <section className="rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-leaf">
              <HandCoins size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Donasi Masuk</h2>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
          >
            Tambah Donasi
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Campaign</th>
                <th className="px-5 py-3 font-semibold">Donatur</th>
                <th className="px-5 py-3 font-semibold">Nominal</th>
                <th className="px-5 py-3 font-semibold">Tipe</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {donations.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-4 font-medium text-ink">{d.campaignTitle || "Campaign Terhapus"}</td>
                  <td className="px-5 py-4">{d.donorName}</td>
                  <td className="px-5 py-4 font-medium">{formatRupiah(Number(d.amount))}</td>
                  <td className="px-5 py-4 text-ink/70">
                    <div className="flex items-center gap-2">
                      {d.paymentMethod === "manual_transfer" ? "Manual" : "Otomatis"}
                      {d.paymentProofUrl && (
                        <a href={d.paymentProofUrl} target="_blank" rel="noreferrer" title="Lihat Bukti Transfer" className="text-leaf hover:text-ink">
                          <ImageIcon size={16} />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={d.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(d)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Verifikasi / Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(d.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr><td colSpan={6} className="text-center py-6 text-ink/50">Belum ada donasi.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal Edit Donasi */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl scrollbar-hide">
            <div className="flex items-center justify-between mb-2">
              <div />
              <button onClick={closeEditModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <AdminDonationForm campaigns={campaigns} initialData={editingDonation} onSuccess={closeEditModal} />
          </div>
        </div>
      )}

      {/* Modal Tambah Donasi */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl scrollbar-hide">
            <div className="flex items-center justify-between mb-2">
              <div />
              <button onClick={closeAddModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>
            <AdminDonationForm campaigns={campaigns} onSuccess={closeAddModal} />
          </div>
        </div>
      )}
    </>
  );
}
