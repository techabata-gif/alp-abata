"use client";

import { useState } from "react";
import { Flag, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatRupiah } from "@/lib/utils";

export function CampaignManager({ initialCampaigns, programs = [] }: { initialCampaigns: any[], programs?: any[] }) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states (simplified for editing essential info, since creation uses the detailed AdminCampaignForm)
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [targetAmount, setTargetAmount] = useState("");
  const [programId, setProgramId] = useState("");

  const openEditModal = (campaign: any) => {
    setEditingCampaign(campaign);
    setTitle(campaign.title);
    setStatus(campaign.status);
    setTargetAmount(campaign.targetAmount.toString());
    setProgramId(campaign.programId || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { 
      ...editingCampaign, // keep other fields intact
      title, 
      status, 
      targetAmount,
      programId: programId || null
    };

    try {
      const res = await fetch(`/api/admin/campaigns/${editingCampaign.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...c, title, status, targetAmount, programId: programId || null } : c));
      
      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Campaign ini? Seluruh data yang berkaitan juga akan terhapus. (Tindakan ini tidak bisa dibatalkan)")) return;
    
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setCampaigns(campaigns.filter(c => c.id !== id));
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <>
      <section className="rounded-lg border border-ink/10 bg-white shadow-soft">
        <div className="border-b border-ink/10 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-mint text-leaf">
              <Flag size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Campaign</h2>
          </div>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Judul Campaign</th>
                <th className="px-5 py-3 font-semibold">Target Dana</th>
                <th className="px-5 py-3 font-semibold">Terkumpul</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td className="px-5 py-4 font-medium text-ink max-w-[200px] truncate" title={c.title}>{c.title}</td>
                  <td className="px-5 py-4">{formatRupiah(Number(c.targetAmount))}</td>
                  <td className="px-5 py-4 font-medium text-leaf">{formatRupiah(Number(c.collectedAmount))}</td>
                  <td className="px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(c)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {campaigns.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-ink/50">Belum ada campaign.</td></tr>
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
                Edit Campaign Dasar
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Judul Campaign
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Target Dana
                <input
                  type="number"
                  required
                  value={targetAmount}
                  onChange={e => setTargetAmount(e.target.value)}
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
                  <option value="ACTIVE">Active (Berjalan)</option>
                  <option value="DRAFT">Draft (Disembunyikan)</option>
                  <option value="CLOSED">Closed (Selesai)</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Program (Opsional)
                <select
                  value={programId}
                  onChange={e => setProgramId(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                >
                  <option value="">-- Tidak ada Program --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </label>

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
