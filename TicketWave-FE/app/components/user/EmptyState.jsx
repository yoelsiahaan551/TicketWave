"use client";

import Link from "next/link";
import { CalendarX } from "lucide-react";

export default function EmptyState({
  icon: Icon = CalendarX,
  judul,
  deskripsi,
  aksiLabel,
  aksiHref,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={30} />
      </div>

      <h3 className="mt-5 text-lg font-black text-slate-900 dark:text-white">
        {judul}
      </h3>

      {deskripsi && (
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          {deskripsi}
        </p>
      )}

      {aksiLabel && aksiHref && (
        <Link
          href={aksiHref}
          className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3.5 font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-[1.03]"
        >
          {aksiLabel}
        </Link>
      )}
    </div>
  );
}
