"use client";

import { useState } from "react";
import { Users, Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserManager({ initialUsers, roles }: { initialUsers: any[], roles: any[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState("");

  const openCreateModal = () => {
    setEditingUser(null);
    setName("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRoleId(roles[0]?.id || "");
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setName(user.name);
    setUsername(user.username);
    setEmail(user.email);
    setPassword(""); // biarkan kosong, hanya isi jika mau diubah
    setRoleId(user.roleId || user.role?.id || "");
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: any = { name, username, email, roleId };
    if (!editingUser || password.trim() !== "") {
      payload.password = password;
    }

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : "/api/admin/users";
      const method = editingUser ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Terjadi kesalahan");

      if (editingUser) {
        setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...data } : u));
      } else {
        setUsers([data, ...users]);
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
    if (!confirm("Apakah Anda yakin ingin menghapus Pengguna ini?")) return;
    
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      setUsers(users.filter(u => u.id !== id));
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
              <Users size={16} />
            </span>
            <h2 className="font-semibold text-ink">Daftar Pengguna</h2>
          </div>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-leaf px-3 py-1.5 text-sm font-medium text-white hover:bg-ink transition"
          >
            <Plus size={16} /> Tambah Pengguna
          </button>
        </div>
        <div className="p-0 overflow-x-auto">
          <table className="w-full text-left text-sm text-ink/80">
            <thead className="bg-cloud text-ink/60">
              <tr>
                <th className="px-5 py-3 font-semibold">Nama</th>
                <th className="px-5 py-3 font-semibold">Username</th>
                <th className="px-5 py-3 font-semibold">Email</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {users.map((usr) => (
                <tr key={usr.id}>
                  <td className="px-5 py-4 font-medium text-ink">{usr.name}</td>
                  <td className="px-5 py-4 text-ink/70">@{usr.username}</td>
                  <td className="px-5 py-4">{usr.email}</td>
                  <td className="px-5 py-4">
                    <span className="rounded bg-cloud px-2 py-1 text-xs text-ink/80 border border-ink/10">
                      {usr.role?.name || "Tidak ada role"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEditModal(usr)}
                        className="p-1.5 text-ink/60 hover:text-leaf hover:bg-mint/50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(usr.id)}
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
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </h3>
              <button onClick={closeModal} className="text-ink/50 hover:text-ink">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Nama Lengkap
                <input type="text" required value={name} onChange={e => setName(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Username
                  <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
                    className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Email
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                  />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-medium">
                Password {editingUser && <span className="text-ink/50 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
                <input type={editingUser ? "password" : "text"} required={!editingUser} value={password} onChange={e => setPassword(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Role PBAC
                <select required value={roleId} onChange={e => setRoleId(e.target.value)}
                  className="rounded-lg border border-ink/15 px-3 py-2.5 outline-none focus:border-leaf focus:ring-4 focus:ring-mint bg-white"
                >
                  <option value="" disabled>Pilih role...</option>
                  {roles.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
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
