"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Upload, AlertCircle } from "lucide-react";
import api from "@/app/lib/api";

export default function CreateAgencyPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [picName, setPicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await api.post("/agencies", {
        name: name.trim(),
        pic_name: picName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });

      const createdAgencyId = res.data?.id;
      if (createdAgencyId && logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        await api.upload(`/agencies/${createdAgencyId}/logo`, formData);
      }

      router.push("/admin/agency");
    } catch (err) {
      setError(err.message || "Gagal membuat agency baru.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link
        href="/admin/agency"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Daftar Agency
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Tambah Agency Baru
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Terhubung dengan <code className="font-mono">POST /api/agencies</code> dan <code className="font-mono">POST /api/agencies/&lt;id&gt;/logo</code>.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        {error && (
          <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Logo */}
        <div>
          <label className="mb-3 block text-sm font-bold text-slate-900 dark:text-white">
            Logo Agency (Opsional — JPG/PNG/WEBP maks. 5MB)
          </label>
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 size={32} className="text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <label className="cursor-pointer">
              <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-200">
                <Upload size={16} />
                Pilih File Logo
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Nama Agency *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Live Nation Indonesia"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* PIC Name */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Nama Penanggung Jawab (PIC) *
          </label>
          <input
            type="text"
            required
            value={picName}
            onChange={(e) => setPicName(e.target.value)}
            placeholder="Nama lengkap PIC"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Email Resmi *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="contact@agency.com"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Nomor Telepon *
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="081234567890"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Alamat Kantor
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Alamat lengkap agency"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-[#0080f2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105 disabled:opacity-50"
          >
            {submitting ? "Menyimpan..." : "Simpan Agency"}
          </button>
          <Link
            href="/admin/agency"
            className="rounded-2xl border border-slate-300 px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
