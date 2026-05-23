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

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
  };

  const openCreateModal = () => {
    setEditingProgram(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (prog: any) => {
    setEditingProgram(prog);
    setTitle(prog.title);
    setSlug(prog.slug);
    setDescription(prog.description || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProgram(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { title, slug, description };

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
                  <td className="px-5 py-4 font-medium text-ink">{prog.title}</td>
                  <td className="px-5 py-4 text-ink/60">/{prog.slug}</td>
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
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

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
