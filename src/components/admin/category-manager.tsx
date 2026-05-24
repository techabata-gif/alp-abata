"use client";

import { useState } from "react";
import { Tags, Pencil, Trash2, X, Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CategoryManager({ initialCategories, programs = [] }: { initialCategories: any[], programs: any[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("");
  const [description, setDescription] = useState("");
  const [programId, setProgramId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName("");
    setIcon("");
    setDescription("");
    setProgramId("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon || "");
    setDescription(cat.description || "");
    setProgramId(cat.programId || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = { 
      name,
      icon,
      description,
      programId: programId || null
    };

    try {
      const url = editingCategory ? `/api/admin/categories/${editingCategory.id}` : "/api/admin/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (editingCategory) {
        setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...data } : c));
      } else {
        setCategories([{ ...data, _count: { campaigns: 0 } }, ...categories]);
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
    if (!confirm("Apakah Anda yakin ingin menghapus Kategori ini? Pastikan tidak ada campaign yang menggunakannya.")) return;
    
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setCategories(categories.filter(c => c.id !== id));
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
              <Tags size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Kategori</h2>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-leaf px-3 py-1.5 text-sm font-medium text-white hover:bg-ink transition"
          >
            <Plus size={16} /> Tambah Kategori
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama Kategori</th>
                <th className="px-5 py-3 font-semibold">Program Terkait</th>
                <th className="px-5 py-3 font-semibold text-center">Digunakan di Campaign</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-5 py-4 font-medium text-ink">
                    {cat.name}
                  </td>
                  <td className="px-5 py-4 text-ink/80">
                    {cat.program ? (
                      <span className="inline-flex items-center gap-1 rounded bg-mint/30 px-2 py-0.5 text-leaf font-medium text-xs">
                        {cat.program.title}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-ink/10 px-2 py-0.5 text-ink/60 font-medium text-xs">
                        Global
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center font-medium">{cat._count?.campaigns || 0}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cat.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-ink/50">Belum ada kategori.</td></tr>
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
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nama Kategori
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="Contoh: Sapi, Domba, Zakat Fitrah"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Ikon (Emoji / Teks)
                <input
                  type="text"
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="Contoh: 🐑 atau URL Gambar"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Deskripsi Singkat (Opsional)
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="Contoh: 1 ekor untuk 1 orang - Syariat Sunnah"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Ikat ke Program (Opsional)
                <select
                  value={programId}
                  onChange={e => setProgramId(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                >
                  <option value="">-- Berlaku Global --</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
                <span className="text-xs text-ink/60">Jika dikosongkan, kategori ini bisa dipakai di program mana saja.</span>
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
