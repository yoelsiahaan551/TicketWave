"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Building2, RefreshCw } from "lucide-react";
import api from "@/app/lib/api";

export default function AgencyDetailPage() {
  const { id } = useParams();
  const [result, setResult] = useState({ id: null, agency: null, error: null });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    api.get(`/agencies/${id}`).then((response) => {
      if (!response.data?.id) throw new Error("Detail agency tidak tersedia.");
      if (active) setResult({ id, agency: response.data, error: null });
    }).catch((error) => {
      if (active) setResult({ id, agency: null, error: error.message || "Gagal memuat agency." });
    });
    return () => { active = false; };
  }, [id, attempt]);
  const loading = result.id !== id;
  const agency = loading ? null : result.agency;
  return (
    <div className="space-y-6">
      <Link href="/admin/agency" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-[#0080f2]"><ArrowLeft size={15} />Kembali ke Daftar Agency</Link>
      {loading && <p role="status" className="text-sm text-slate-500">Memuat detail agency…</p>}
      {!loading && result.error && <div role="alert" className="rounded-xl border border-slate-200 p-5 dark:border-slate-800"><p>{result.error}</p><button type="button" onClick={() => { setResult({ id: null, agency: null, error: null }); setAttempt(value => value + 1); }} className="mt-3 inline-flex items-center gap-2 text-sm text-[#0080f2]"><RefreshCw size={15} />Coba lagi</button></div>}
      {agency && <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          {agency.logo_url ? <Image src={agency.logo_url} width={64} height={64} unoptimized alt={agency.name} className="h-16 w-16 rounded-xl object-cover" /> : <Building2 size={40} className="text-[#0080f2]" />}
          <div className="flex-1"><h1 className="text-2xl font-bold text-slate-900 dark:text-white">{agency.name}</h1><p className="text-xs text-slate-500">Agency #{agency.id}</p></div>
          <Link href={`/admin/agency/${agency.id}/edit`} className="rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-medium text-white">Edit Agency</Link>
        </div>
        <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
          {[["Penanggung jawab", agency.pic_name], ["Email", agency.email], ["Telepon", agency.phone], ["Alamat", agency.address], ["Akun petugas", agency.has_officer_account ? "Terhubung" : "Belum terhubung"], ["Terdaftar", agency.created_at ? new Date(agency.created_at).toLocaleDateString("id-ID") : null]].map(([label, value]) => <div key={label}><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-slate-900 dark:text-slate-100">{value || "—"}</dd></div>)}
        </dl>
      </section>}
    </div>
  );
}
