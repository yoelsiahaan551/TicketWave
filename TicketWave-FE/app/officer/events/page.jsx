"use client";

import { useState } from "react";
import Link from "next/link";
import { getAssignedEvents } from "@/app/lib/officerService";
import {
  Calendar,
  Clock,
  MapPin,
  Shield,
  ScanLine,
  ArrowRight,
  Radio,
  Phone,
  Users,
} from "lucide-react";

export default function OfficerEventsPage() {
  const [events] = useState(() => getAssignedEvents());

  const activeEvent = events.find((e) => e.status === "ACTIVE") || events[0];
  const upcomingEvents = events.filter((e) => e.status !== "ACTIVE");

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Event yang Ditugaskan
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
          Jadwal operasional pemeriksaan tiket dan lokasi gate tempat Anda bertugas.
        </p>
      </div>

      {/* Featured Active Event Card */}
      {activeEvent && (
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-500 dark:bg-slate-400" />
                Penugasan Aktif Hari Ini
              </span>
              <span className="rounded-full border border-slate-200/80 bg-slate-50/70 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                {activeEvent.shift}
              </span>
            </div>

            <span className="font-mono text-xs text-slate-400">ID: {activeEvent.id}</span>
          </div>

          <h2 className="mt-3 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">
            {activeEvent.name}
          </h2>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-slate-400 shrink-0" />
              <span>Waktu: <span className="font-medium text-slate-900 dark:text-white">{activeEvent.time}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-slate-400 shrink-0" />
              <span className="truncate">Lokasi: <span className="font-medium text-slate-900 dark:text-white">{activeEvent.venue}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={15} className="text-slate-400 shrink-0" />
              <span>Gate: <span className="font-medium text-slate-900 dark:text-white">{activeEvent.assigned_gate}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={15} className="text-slate-400 shrink-0" />
              <span>Koordinator: <span className="font-medium text-slate-900 dark:text-white">{activeEvent.coordinator}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Radio size={15} className="text-slate-400 shrink-0" />
              <span>Radio HT: <span className="font-medium text-slate-900 dark:text-white">{activeEvent.channel}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Users size={15} className="text-slate-400 shrink-0" />
              <span>Progres Gate: <span className="font-medium text-slate-700 dark:text-slate-300">{activeEvent.quota_checked} / {activeEvent.quota_total} Masuk</span></span>
            </div>
          </div>

          {activeEvent.notes && (
            <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 pt-3 dark:border-slate-800/80 font-normal">
              Instruksi Khusus: &quot;{activeEvent.notes}&quot;
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link
              href="/officer/scan"
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition shadow-xs"
            >
              <ScanLine size={15} />
              <span>Buka Scanner Gate</span>
            </Link>
            <Link
              href="/officer/history"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
            >
              <span>Riwayat Gate ({activeEvent.quota_checked})</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Upcoming Events Heading & List */}
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-3">
          Jadwal Penugasan Mendatang
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="rounded-xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between mb-2.5">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Terjadwal
                </span>
                <span className="font-mono text-xs text-slate-400">{evt.id}</span>
              </div>

              <h4 className="text-base font-semibold text-slate-900 dark:text-white">{evt.name}</h4>

              <div className="mt-3 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={13} className="text-slate-400 shrink-0" />
                  <span>Tanggal: <span className="font-medium text-slate-800 dark:text-slate-200">{evt.date}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={13} className="text-slate-400 shrink-0" />
                  <span>Jam: <span className="font-medium text-slate-800 dark:text-slate-200">{evt.time}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>Venue: <span className="font-medium text-slate-800 dark:text-slate-200">{evt.venue}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-slate-400 shrink-0" />
                  <span>Rencana Gate: <span className="font-medium text-slate-800 dark:text-slate-200">{evt.assigned_gate}</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>Koordinator: <span className="font-medium text-slate-800 dark:text-slate-200">{evt.coordinator}</span></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
