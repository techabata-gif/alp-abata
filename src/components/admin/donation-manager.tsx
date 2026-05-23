"use client";

import { useState } from "react";
import { HandCoins, Pencil, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";

export function DonationManager({ initialDonations }: { initialDonations: any[] }) {
  const router = useRouter();
  const [donations, setDonations] = useState(initialDonations);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [status, setStatus] = useState("PENDING");
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  const openEditModal = (donation: any) => {
    setEditingDonation(donation);
    setStatus(donation.status);
    setAmount(donation.amount.toString());
    setDonorName(donation.donorName);
    setPaymentProofUrl(donation.paymentProofUrl || null);
    setNewFile(null);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDonation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { status, amount, donorName, paymentProofUrl };

    try {
      if (newFile) {
        const compressed = await compressImage(newFile);
        const formData = new FormData();
        formData.append("file", compressed);
        
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        
        if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal mengunggah foto.");
        payload.paymentProofUrl = uploadData.secure_url;
      }

      const res = await fetch(`/api/admin/donations/${editingDonation.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      setDonations(donations.map(d => d.id === editingDonation.id ? { ...d, ...payload } : d));
      
      toast.success("Donasi berhasil diperbarui.");
      closeModal();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
            <h2 className="font-semibold text-ink">Manajemen Laporan Transaksi</h2>
          </div>
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
                  <td className="px-5 py-4 font-medium text-ink">{d.campaign?.title}</td>
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-ink">
                Verifikasi / Edit Donasi
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nama Donatur
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={e => setDonorName(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Nominal
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Status
                <select
                  required
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                >
                  <option value="PENDING">Pending (Menunggu Verifikasi)</option>
                  <option value="VERIFIED">Verified (Terverifikasi)</option>
                  <option value="REJECTED">Rejected (Ditolak)</option>
                </select>
              </label>

              <div className="grid gap-2 text-sm font-medium">
                Bukti Transfer / Pembayaran
                {paymentProofUrl && !newFile && (
                  <div className="relative mb-2 inline-block w-fit">
                    <img src={paymentProofUrl} alt="Bukti transfer" className="h-24 w-auto rounded border" />
                    <button
                      type="button"
                      onClick={() => setPaymentProofUrl(null)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                      title="Hapus Bukti"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition overflow-hidden"
                />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-ink/70 hover:bg-cloud rounded-lg">Batal</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-leaf text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
