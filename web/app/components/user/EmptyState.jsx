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
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Icon size={24} />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">
        {judul}
      </h3>

      {deskripsi && (
        <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          {deskripsi}
        </p>
      )}

      {aksiLabel && aksiHref && (
        <Link
          href={aksiHref}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {aksiLabel}
        </Link>
      )}
    </div>
  );
}
