"use client";

import { useState } from "react";
import { Shield, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function RoleManager({ initialRoles }: { initialRoles: any[] }) {
  const router = useRouter();
  const [roles, setRoles] = useState(initialRoles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissionsStr, setPermissionsStr] = useState("");

  const openCreateModal = () => {
    setEditingRole(null);
    setName("");
    setDescription("");
    setPermissionsStr("");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || "");
    setPermissionsStr(role.permissions.join(", "));
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const permissions = permissionsStr.split(",").map(p => p.trim()).filter(p => p !== "");
    const payload = { name, description, permissions };

    try {
      const url = editingRole ? `/api/admin/roles/${editingRole.id}` : "/api/admin/roles";
      const method = editingRole ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      // Refresh data
      if (editingRole) {
        setRoles(roles.map(r => r.id === editingRole.id ? { ...r, ...payload } : r));
      } else {
        setRoles([{ ...data, _count: { users: 0 } }, ...roles]);
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
    if (!confirm("Apakah Anda yakin ingin menghapus Role ini?")) return;
    
    try {
      const res = await fetch(`/api/admin/roles/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setRoles(roles.filter(r => r.id !== id));
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
              <Shield size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Role</h2>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-leaf px-3 py-1.5 text-sm font-medium text-white hover:bg-ink transition"
          >
            <Plus size={16} /> Tambah Role
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama Role</th>
                <th className="px-5 py-3 font-semibold">Deskripsi</th>
                <th className="px-5 py-3 font-semibold">Jumlah Pengguna</th>
                <th className="px-5 py-3 font-semibold">Permissions</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {roles.map((role) => (
                <tr key={role.id}>
                  <td className="px-5 py-4 font-medium text-ink">{role.name}</td>
                  <td className="px-5 py-4">{role.description}</td>
                  <td className="px-5 py-4">{role._count?.users || 0}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.map((p: string) => (
                        <span key={p} className="rounded bg-cloud px-2 py-0.5 text-xs text-ink/70 border border-ink/10">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(role)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(role.id)}
                        className="p-1.5 text-ink/60 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
                {editingRole ? "Edit Role" : "Tambah Role Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nama Role
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="e.g. FINANCE_ADMIN"
                  disabled={editingRole?.name === "SUPER_ADMIN"}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Deskripsi
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Permissions (pisahkan dengan koma)
                <textarea
                  required
                  value={permissionsStr}
                  onChange={e => setPermissionsStr(e.target.value)}
                  rows={3}
                  className="resize-none rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  placeholder="user:read, user:write, campaign:read, *"
                  disabled={editingRole?.name === "SUPER_ADMIN"}
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
