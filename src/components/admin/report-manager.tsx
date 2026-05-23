"use client";

import { useState } from "react";
import { FileText, Pencil, Plus, Trash2, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/utils";
import { compressImage } from "@/lib/image-compression";
import { toast } from "sonner";
import type { CampaignDTO } from "@/lib/types";

export function ReportManager({ initialReports, campaigns }: { initialReports: any[], campaigns: CampaignDTO[] }) {
  const router = useRouter();
  const [reports, setReports] = useState(initialReports);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [amountUsed, setAmountUsed] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const openAddModal = () => {
    setEditingReport(null);
    setTitle("");
    setDescription("");
    setCampaignId(campaigns[0]?.id || "");
    setAmountUsed("");
    setImageUrl(null);
    setFile(null);
    setIsModalOpen(true);
  };

  const openEditModal = (report: any) => {
    setEditingReport(report);
    setTitle(report.title);
    setDescription(report.description);
    setCampaignId(report.campaignId || "");
    setAmountUsed(report.amountUsed?.toString() || "");
    setImageUrl(report.imageUrl || null);
    setFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingReport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = imageUrl;
      if (file) {
        const compressed = await compressImage(file);
        const formData = new FormData();
        formData.append("file", compressed);
        
        const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) throw new Error(uploadData.error || "Gagal mengunggah foto.");
        finalImageUrl = uploadData.secure_url;
      }

      const payload = { title, description, imageUrl: finalImageUrl, amountUsed, campaignId };
      const url = editingReport ? `/api/admin/reports/${editingReport.id}` : "/api/admin/reports";
      const method = editingReport ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (editingReport) {
        setReports(reports.map(r => r.id === editingReport.id ? data.report : r));
      } else {
        setReports([data.report, ...reports]);
      }
      
      toast.success(data.message);
      closeModal();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus laporan ini?")) return;
    try {
      const res = await fetch(`/api/admin/reports/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setReports(reports.filter(r => r.id !== id));
      toast.success("Laporan berhasil dihapus.");
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
              <FileText size={16} />
            </span>
            <h2 className="font-semibold text-ink">Laporan Aktivitas Penyaluran</h2>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-lg bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink"
          >
            <Plus size={16} />
            Buat Laporan
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Judul</th>
                <th className="px-5 py-3 font-semibold">Campaign</th>
                <th className="px-5 py-3 font-semibold">Dana Disalurkan</th>
                <th className="px-5 py-3 font-semibold">Tanggal</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {reports.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-4 font-medium text-ink flex items-center gap-3">
                    {r.imageUrl && (
                      <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-ink/5 relative">
                        <img src={r.imageUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <span className="line-clamp-2 max-w-[200px]" title={r.title}>{r.title}</span>
                  </td>
                  <td className="px-5 py-4 text-ink/70 max-w-[200px] truncate" title={r.campaign?.title || "Umum"}>
                    {r.campaign?.title || "-"}
                  </td>
                  <td className="px-5 py-4 font-medium">{r.amountUsed ? formatRupiah(Number(r.amountUsed)) : "-"}</td>
                  <td className="px-5 py-4 text-ink/70">{new Date(r.publishedAt).toLocaleDateString("id-ID")}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(r)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit Laporan"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-ink/50">Belum ada laporan penyaluran.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-ink">
                {editingReport ? "Edit Laporan" : "Buat Laporan Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Judul Laporan
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="Misal: Distribusi Tahap Pertama"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Campaign Terkait (Opsional)
                <select
                  value={campaignId}
                  onChange={e => setCampaignId(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                >
                  <option value="">Pilih Campaign...</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Deskripsi
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
                  placeholder="Ceritakan detail penyaluran..."
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Dana yang disalurkan (Opsional)
                <input
                  type="number"
                  value={amountUsed}
                  onChange={e => setAmountUsed(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="Misal: 15000000"
                />
              </label>

              <div className="grid gap-2 text-sm font-medium">
                Foto Dokumentasi
                {imageUrl && !file && (
                  <div className="relative mb-2 inline-block w-fit">
                    <img src={imageUrl} alt="Dokumentasi" className="h-32 w-auto rounded border object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl(null)}
                      className="absolute -right-2 -top-2 rounded-full bg-red-600 p-1 text-white hover:bg-red-700"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="mt-1 block w-full text-sm text-ink/70 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-leaf file:text-white hover:file:bg-ink transition"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-ink/70 hover:bg-cloud rounded-lg">Batal</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-leaf text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Simpan Laporan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
