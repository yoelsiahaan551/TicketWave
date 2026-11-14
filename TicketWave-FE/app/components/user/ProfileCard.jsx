"use client";

import { User, Mail, Phone } from "lucide-react";

// ============================================================
// PROFILE CARD — component khusus User
// Kartu profil di halaman /user/profile. Data dari props
// (parent mengambil dari API auth/me — belum tersedia, jadi
// parent menampilkan state belum tersedia).
// ============================================================

export default function ProfileCard({ user }) {
  if (!user) return null;

  const initials = (user.nama || "U")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* Banner */}
      <div className="relative h-20 bg-slate-900 dark:bg-slate-800">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />
      </div>

      <div className="px-5 pb-5">
        {/* Avatar */}
        <div className="-mt-8 mb-3 flex h-14 w-14 items-center justify-center rounded-xl border-2 border-white bg-[#0080f2] text-lg font-bold text-white shadow-xs dark:border-slate-900">
          {initials}
        </div>

        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          {user.nama}
        </h2>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Anggota TicketWave
        </p>

        <div className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <Mail size={15} className="shrink-0 text-slate-400" />
            <span className="truncate">{user.email}</span>
          </div>

          {user.telepon && (
            <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
              <Phone size={15} className="shrink-0 text-slate-400" />
              {user.telepon}
            </div>
          )}

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <User size={15} className="shrink-0 text-slate-400" />
            Bergabung {user.bergabung || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
