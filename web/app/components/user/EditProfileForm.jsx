"use client";

import { useState } from "react";
import { Save, AlertCircle } from "lucide-react";

// ============================================================
// EDIT PROFILE FORM — component khusus User
// Form edit profil. onSubmit dipanggil parent; parent yang
// memutuskan apakah benar-benar menyimpan via API. Component
// hanya menangani state form + validasi sisi klien.
// ============================================================

export default function EditProfileForm({ user, onSubmit, saving }) {
  const [form, setForm] = useState({
    nama: user?.nama || "",
    email: user?.email || "",
    telepon: user?.telepon || "",
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.nama.trim()) e.nama = "Nama wajib diisi";
    if (!form.email.trim()) e.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Format email tidak valid";
    if (form.telepon && !/^[0-9+\-\s]{8,16}$/.test(form.telepon))
      e.telepon = "Nomor telepon tidak valid";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white outline-none transition focus:border-[#0080f2] focus:ring-1 focus:ring-[#0080f2] placeholder:text-slate-400";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900"
    >
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
        Edit Profil
      </h3>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Perubahan disimpan melalui API profile. Endpoint belum
        tersedia — tombol simpan akan menampilkan pesan bahwa
        backend belum siap.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Nama Lengkap
          </label>
          <input
            type="text"
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className={inputClass}
          />
          {errors.nama && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <AlertCircle size={13} />
              {errors.nama}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={inputClass}
          />
          {errors.email && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <AlertCircle size={13} />
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
            Nomor Telepon
          </label>
          <input
            type="tel"
            value={form.telepon}
            onChange={(e) => setForm({ ...form, telepon: e.target.value })}
            placeholder="Opsional"
            className={inputClass}
          />
          {errors.telepon && (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
              <AlertCircle size={13} />
              {errors.telepon}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0080f2] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-60"
      >
        <Save size={16} />
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </button>
    </form>
  );
}
