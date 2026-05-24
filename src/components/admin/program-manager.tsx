"use client";

import { useState } from "react";
import { FolderKanban, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProgramManager({ initialPrograms }: { initialPrograms: any[] }) {
  const router = useRouter();
  const [programs, setPrograms] = useState(initialPrograms);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [targetAmount, setTargetAmount] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const openCreateModal = () => {
    setEditingProgram(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setTargetAmount("");
    setIsActive(true);
    setIsFeatured(false);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prog: any) => {
    setEditingProgram(prog);
    setTitle(prog.title);
    setSlug(prog.slug);
    setDescription(prog.description || "");
    setImageUrl(prog.imageUrl || "");
    setTargetAmount(prog.targetAmount ? prog.targetAmount.toString() : "");
    setIsActive(prog.isActive ?? true);
    setIsFeatured(prog.isFeatured ?? false);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
  };

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal upload gambar");
      const data = await res.json();
      setImageUrl(data.secure_url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { 
      title, 
      slug, 
      description,
      imageUrl: imageUrl || null,
      targetAmount: targetAmount ? Number(targetAmount) : null,
      isActive,
      isFeatured
    };

    try {
      const url = editingProgram ? `/api/admin/programs/${editingProgram.id}` : "/api/admin/programs";
      const method = editingProgram ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (editingProgram) {
        setPrograms(programs.map(p => p.id === editingProgram.id ? { ...p, ...payload } : p));
      } else {
        setPrograms([{ ...data, _count: { campaigns: 0 } }, ...programs]);
      }
      
      closeModal();
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus Program ini? (Tindakan ini tidak bisa dibatalkan)")) return;
    
    try {
      const res = await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setPrograms(programs.filter(p => p.id !== id));
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
              <FolderKanban size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Program</h2>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-leaf px-3 py-1.5 text-sm font-medium text-white hover:bg-ink transition"
          >
            <Plus size={16} /> Tambah Program
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama Program</th>
                <th className="px-5 py-3 font-semibold">Slug URL</th>
                <th className="px-5 py-3 font-semibold">Deskripsi</th>
                <th className="px-5 py-3 font-semibold text-center">Jumlah Campaign</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {programs.map((prog) => (
                <tr key={prog.id}>
                  <td className="px-5 py-4 font-medium text-ink">
                    <div className="flex items-center gap-3">
                      {prog.imageUrl ? (
                        <img src={prog.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-ink/10 flex items-center justify-center"><FolderKanban size={16} className="text-ink/40" /></div>
                      )}
                      <div>
                        {prog.title}
                        <div className="flex gap-2 mt-1">
                          {prog.isFeatured && <span className="text-[10px] bg-sun text-ink px-1.5 py-0.5 rounded font-bold">Featured</span>}
                          {!prog.isActive && <span className="text-[10px] bg-ink/10 text-ink/60 px-1.5 py-0.5 rounded font-bold">Inactive</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink/60">/p/{prog.slug}</td>
                  <td className="px-5 py-4 truncate max-w-xs">{prog.description || "-"}</td>
                  <td className="px-5 py-4 text-center font-medium">{prog._count?.campaigns || 0}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(prog)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(prog.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {programs.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-ink/50">Belum ada program.</td></tr>
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
                {editingProgram ? "Edit Program" : "Tambah Program Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nama Program (Contoh: Qurban 2026)
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!editingProgram) setSlug(generateSlug(e.target.value));
                  }}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Slug URL
                <div className="flex rounded-lg border border-ink/15 focus-within:border-leaf focus-within:ring-4 focus-within:ring-mint overflow-hidden">
                  <span className="flex items-center px-3 bg-cloud text-ink/60 border-r border-ink/15">/p/</span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    className="w-full px-3 py-2.5 outline-none"
                  />
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Target Dana (Opsional)
                  <input
                    type="number"
                    value={targetAmount}
                    onChange={e => setTargetAmount(e.target.value)}
                    className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                    placeholder="Contoh: 1000000000"
                  />
                </label>
                <div className="grid gap-2 text-sm font-medium">
                  Cover Image
                  {imageUrl ? (
                    <div className="relative w-fit">
                      <img src={imageUrl} alt="Cover" className="h-10 w-auto rounded object-cover" />
                      <button type="button" onClick={() => setImageUrl("")} className="absolute -right-2 -top-2 rounded-full bg-red-600 p-0.5 text-white"><X size={12} /></button>
                    </div>
                  ) : (
                    <input type="file" accept="image/*" disabled={uploading} onChange={handleImageUpload} className="text-xs" />
                  )}
                  {uploading && <span className="text-xs text-leaf">Uploading...</span>}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 p-3 border border-ink/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-leaf" />
                  <span className="text-sm font-medium">Program Aktif</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-ink/10 rounded-lg cursor-pointer">
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} className="w-4 h-4 text-leaf" />
                  <span className="text-sm font-medium">Jadikan Unggulan (Featured)</span>
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Deskripsi
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="resize-none rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-ink/70 hover:bg-cloud rounded-lg">Batal</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-leaf text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-ink">
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
