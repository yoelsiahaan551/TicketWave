"use client";

import Link from "next/link";
import { Calendar, ScanLine } from "lucide-react";

export default function OfficerEventsPage() {
  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Event yang Ditugaskan</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Jadwal operasional pemeriksaan tiket dan lokasi gate penugasan.</p>
      </div>
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <Calendar size={24} className="text-[#0080f2]" />
        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">Penugasan belum dapat diverifikasi</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Data penugasan event, gate, shift, dan koordinator belum tersedia melalui sistem. Hubungi koordinator lapangan untuk memastikan lokasi dan jadwal tugas Anda.</p>
        <Link href="/officer/scan" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0080f2] px-4 py-2 text-sm font-medium text-white hover:bg-[#0070d4]"><ScanLine size={15} /> Buka Scanner</Link>
      </div>
    </div>
  );
}
