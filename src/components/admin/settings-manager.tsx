"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";

type SettingsManagerProps = {
  initialSettings: Record<string, string>;
};

export function SettingsManager({ initialSettings }: SettingsManagerProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [banks, setBanks] = useState<{ id: string; bankName: string; accountName: string; accountNumber: string; logoUrl: string }[]>(() => {
    try {
      return initialSettings.bank_accounts ? JSON.parse(initialSettings.bank_accounts) : [];
    } catch {
      return [];
    }
  });

  const [paymentSteps, setPaymentSteps] = useState<{ id: string; title: string; description: string }[]>(() => {
    try {
      return initialSettings.payment_steps ? JSON.parse(initialSettings.payment_steps) : [
        { id: "1", title: "Pilih Paket", description: "Pilih paket donasi yang tersedia atau masukkan nominal donasi bebas." },
        { id: "2", title: "Transfer ke Rekening Tertera", description: "Lakukan transfer tepat sesuai nominal yang diinstruksikan beserta kode unik (jika ada)." },
        { id: "3", title: "Konfirmasi ke Narahubung", description: "Kirimkan bukti transfer melalui WhatsApp narahubung yang tertera." },
        { id: "4", title: "Verifikasi Dana & Input Data", description: "Admin akan memverifikasi dana yang masuk dan menginputkan data donasi Anda ke sistem." },
        { id: "5", title: "Progress Terupdate", description: "Donasi Anda akan tercatat secara transparan di platform ini." }
      ];
    } catch {
      return [];
    }
  });

  const handleBankChange = (id: string, field: string, value: string) => {
    setBanks(banks.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const handleBankImageUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Gagal mengunggah logo bank");
      const data = await res.json();
      handleBankChange(id, "logoUrl", data.secure_url);
      toast.success("Logo bank berhasil diunggah!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const addBank = () => {
    setBanks([...banks, { id: Date.now().toString(), bankName: "", accountName: "", accountNumber: "", logoUrl: "" }]);
  };

  const removeBank = (id: string) => {
    setBanks(banks.filter((b) => b.id !== id));
  };

  const handlePaymentStepChange = (id: string, field: string, value: string) => {
    setPaymentSteps(paymentSteps.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addPaymentStep = () => {
    setPaymentSteps([...paymentSteps, { id: Date.now().toString(), title: "", description: "" }]);
  };

  const removePaymentStep = (id: string) => {
    setPaymentSteps(paymentSteps.filter((s) => s.id !== id));
  };

  const movePaymentStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...paymentSteps];
    if (direction === 'up' && index > 0) {
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
    } else if (direction === 'down' && index < newSteps.length - 1) {
      [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]];
    }
    setPaymentSteps(newSteps);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error("Gagal mengunggah gambar");
      const data = await res.json();
      
      setSettings({ ...settings, landing_hero_image: data.secure_url });
      toast.success("Gambar berhasil diunggah!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...settings,
        bank_accounts: JSON.stringify(banks),
        payment_steps: JSON.stringify(paymentSteps)
      };

      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");
      
      toast.success("Pengaturan berhasil disimpan!");
      // window.location.reload() would refresh to see changes on public page, but not strictly necessary here
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-ink mb-4">Pengaturan Landing Page</h2>
        
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Label Header (Pita Teks Atas)
            <input
              type="text"
              name="landing_hero_label"
              value={settings.landing_hero_label || ""}
              onChange={handleChange}
              placeholder="Contoh: Transparansi dana untuk campaign sosial"
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Judul Utama
            <input
              type="text"
              name="landing_hero_title"
              value={settings.landing_hero_title || ""}
              onChange={handleChange}
              placeholder="Contoh: ALP #Berdampak"
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint text-xl font-bold"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Deskripsi Landing Page
            <textarea
              name="landing_hero_description"
              value={settings.landing_hero_description || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Contoh: Platform penggalangan dana untuk yayasan, sekolah..."
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
            />
          </label>

          <div className="grid gap-2 text-sm font-medium">
            Gambar Background (Cover)
            {settings.landing_hero_image && (
              <div className="relative aspect-[21/9] w-full max-w-xl overflow-hidden rounded-lg bg-ink/5 mb-2">
                <img src={settings.landing_hero_image} alt="Header Cover" className="object-cover w-full h-full" />
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cloud px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink/10 w-max">
              <ImageIcon size={16} />
              {uploading ? "Mengunggah..." : "Pilih Gambar Baru"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div className="grid gap-2 text-sm font-medium border-t border-ink/10 pt-5 mt-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base font-semibold text-ink">Donasi Publik</p>
                <p className="text-sm font-normal text-ink/68">
                  Izinkan publik untuk berdonasi melalui website ini. Jika dimatikan, navigasi dan tombol donasi di halaman publik akan disembunyikan.
                </p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="public_donation_enabled"
                  checked={settings.public_donation_enabled !== "false"}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      public_donation_enabled: e.target.checked ? "true" : "false"
                    })
                  }
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-ink/20 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-leaf peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-mint"></div>
              </label>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft mt-6">
        <h2 className="text-lg font-semibold text-ink mb-4">Pengaturan Informasi Donasi</h2>
        
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm font-medium">
            Pesan Peringatan / Instruksi Donasi
            <textarea
              name="donation_alert_text"
              value={settings.donation_alert_text || ""}
              onChange={handleChange}
              rows={3}
              placeholder="Contoh: Silakan hubungi WhatsApp di bawah ini untuk Donasi dan Konfirmasi..."
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Panduan Nominal (Campaign Berbasis Paket)
            <textarea
              name="nominal_guide_quantity"
              value={settings.nominal_guide_quantity || ""}
              onChange={handleChange}
              rows={2}
              placeholder="Contoh: Harap transfer dengan nominal {nominal} atau berlaku kelipatan untuk donasi {unit}."
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
            />
            <span className="text-xs text-ink/60 font-normal">Gunakan <code className="bg-ink/5 px-1 rounded">{'{nominal}'}</code> dan <code className="bg-ink/5 px-1 rounded">{'{unit}'}</code> sebagai variabel dinamis.</span>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            Panduan Nominal (Campaign Non-Paket / Bebas)
            <textarea
              name="nominal_guide_non_quantity"
              value={settings.nominal_guide_non_quantity || ""}
              onChange={handleChange}
              rows={2}
              placeholder="Contoh: Nominal donasi tidak ditentukan (bebas)."
              className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
            />
          </label>
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Tata Cara Pembayaran (Manual)</h2>
          <button
            type="button"
            onClick={addPaymentStep}
            className="inline-flex items-center gap-2 rounded-lg bg-cloud px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-ink/10"
          >
            + Tambah Langkah
          </button>
        </div>
        
        <div className="space-y-4">
          {paymentSteps.map((step, index) => (
            <div key={step.id} className="relative rounded-lg border border-ink/15 p-4 bg-white grid gap-4 items-start">
              <div className="absolute top-2 right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => movePaymentStep(index, 'up')}
                  disabled={index === 0}
                  className="text-ink/40 hover:text-ink/80 p-1 disabled:opacity-30"
                  title="Naikkan urutan"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => movePaymentStep(index, 'down')}
                  disabled={index === paymentSteps.length - 1}
                  className="text-ink/40 hover:text-ink/80 p-1 disabled:opacity-30"
                  title="Turunkan urutan"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removePaymentStep(step.id)}
                  className="text-red-500 hover:text-red-700 p-1 ml-1"
                  title="Hapus Langkah"
                >
                  &times;
                </button>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-leaf/10 text-leaf font-bold rounded-full flex items-center justify-center mt-1">
                  {index + 1}
                </div>
                <div className="flex-grow grid gap-3 pr-16">
                  <label className="grid gap-1.5 text-sm font-medium">
                    Judul Langkah
                    <input
                      value={step.title}
                      onChange={(e) => handlePaymentStepChange(step.id, "title", e.target.value)}
                      placeholder="Contoh: Pilih Paket"
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint font-semibold"
                    />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium">
                    Deskripsi
                    <textarea
                      value={step.description}
                      onChange={(e) => handlePaymentStepChange(step.id, "description", e.target.value)}
                      rows={2}
                      placeholder="Contoh: Pilih paket donasi yang tersedia..."
                      className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint resize-none"
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
          {paymentSteps.length === 0 && (
            <p className="text-sm text-ink/60 text-center py-4 border border-dashed border-ink/20 rounded-lg">
              Belum ada langkah tata cara pembayaran.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white p-6 shadow-soft mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Daftar Rekening Bank (Manual)</h2>
          <button
            type="button"
            onClick={addBank}
            className="inline-flex items-center gap-2 rounded-lg bg-cloud px-3 py-1.5 text-sm font-medium text-ink transition hover:bg-ink/10"
          >
            + Tambah Rekening
          </button>
        </div>
        
        <div className="space-y-4">
          {banks.map((bank) => (
            <div key={bank.id} className="relative rounded-lg border border-ink/15 p-4 bg-white grid gap-4 sm:grid-cols-2 items-start">
              <button
                type="button"
                onClick={() => removeBank(bank.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                title="Hapus Rekening"
              >
                &times;
              </button>

              <label className="grid gap-2 text-sm font-medium">
                Nama Bank
                <input
                  value={bank.bankName}
                  onChange={(e) => handleBankChange(bank.id, "bankName", e.target.value)}
                  placeholder="Contoh: BSI"
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Nomor Rekening
                <input
                  value={bank.accountNumber}
                  onChange={(e) => handleBankChange(bank.id, "accountNumber", e.target.value)}
                  placeholder="Contoh: 1234567890"
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Atas Nama
                <input
                  value={bank.accountName}
                  onChange={(e) => handleBankChange(bank.id, "accountName", e.target.value)}
                  placeholder="Contoh: Yayasan ALP"
                  className="w-full rounded-lg border border-ink/15 px-3 py-2 outline-none focus:border-leaf focus:ring-4 focus:ring-mint"
                />
              </label>

              <div className="grid gap-2 text-sm font-medium">
                Logo Bank
                <div className="flex items-center gap-3">
                  {bank.logoUrl && (
                    <div className="h-10 w-16 shrink-0 rounded border border-ink/10 bg-white p-1 overflow-hidden flex items-center justify-center">
                      <img src={bank.logoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-cloud px-3 py-2 text-xs font-medium text-ink transition hover:bg-ink/10">
                    <ImageIcon size={14} />
                    {uploading ? "..." : "Upload Logo"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleBankImageUpload(bank.id, e)}
                    />
                  </label>
                </div>
              </div>
            </div>
          ))}
          {banks.length === 0 && (
            <p className="text-sm text-ink/60 text-center py-4 border border-dashed border-ink/20 rounded-lg">
              Belum ada rekening yang ditambahkan.
            </p>
          )}
        </div>
      </section>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="flex items-center gap-2 rounded-lg bg-leaf px-6 py-2.5 text-sm font-medium text-white transition hover:bg-ink disabled:opacity-60"
        >
          {saving && <Loader2 size={16} className="animate-spin" />}
          <Save size={16} />
          Simpan Perubahan
        </button>
      </div>
    </div>
  );
}
