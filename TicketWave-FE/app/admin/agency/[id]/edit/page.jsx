"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import api from "@/app/lib/api";

export default function EditAgencyPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [name, setName] = useState("");
  const [picName, setPicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    api
      .get(`/agencies/${id}`)
      .then((res) => {
        if (ignore) return;
        const ag = res.data;
        if (ag) {
          setName(ag.name || "");
          setPicName(ag.pic_name || "");
          setEmail(ag.email || "");
          setPhone(ag.phone || "");
          setAddress(ag.address || "");
          setLogoPreview(ag.logo_url || null);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Gagal memuat detail agency.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await api.put(`/agencies/${id}`, {
        name: name.trim(),
        pic_name: picName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      });

      if (logoFile) {
        const formData = new FormData();
        formData.append("logo", logoFile);
        await api.upload(`/agencies/${id}/logo`, formData);
      }

      setSuccessMsg("Data agency berhasil diperbarui!");
      setTimeout(() => router.push("/admin/agency"), 900);
    } catch (err) {
      setError(err.message || "Gagal memperbarui agency.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 max-w-3xl animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

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
          Edit Agency #{id}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Perbarui informasi agency melalui <code className="font-mono">PUT /api/agencies/{id}</code> dan <code className="font-mono">POST /api/agencies/{id}/logo</code>.
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

        {successMsg && (
          <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Logo */}
        <div>
          <label className="mb-3 block text-sm font-bold text-slate-900 dark:text-white">
            Logo Agency
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
                Ganti Logo
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
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* PIC Name */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Nama PIC *
          </label>
          <input
            type="text"
            required
            value={picName}
            onChange={(e) => setPicName(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-[#0080f2] focus:ring-2 focus:ring-[#0080f2]/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
            Alamat
          </label>
          <textarea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
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
