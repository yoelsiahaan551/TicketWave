"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Ticket,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/app/lib/api";

function TicketPhaseListContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params?.id;
  const queryTicketTypeId = searchParams.get("ticketTypeId");

  const [event, setEvent] = useState(null);
  const [ticketTypes, setTicketTypes] = useState([]);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(
    queryTicketTypeId ? Number(queryTicketTypeId) : null
  );
  const [phases, setPhases] = useState([]);
  const [phaseTotal, setPhaseTotal] = useState(0);
  const [phaseTicketTypeMeta, setPhaseTicketTypeMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    let ignore = false;
    api
      .get(`/events/${eventId}`)
      .then((res) => {
        if (ignore) return;
        const ev = res.data;
        setEvent(ev);
        const tts = ev?.ticket_types || [];
        setTicketTypes(tts);
        if (tts.length > 0) {
          const initialId = queryTicketTypeId
            ? Number(queryTicketTypeId)
            : tts[0].id;
          setSelectedTicketTypeId(initialId);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!ignore) {
          setMessage({
            type: "error",
            text: err.message || "Gagal memuat detail event.",
          });
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [eventId, queryTicketTypeId]);

  const fetchPhases = useCallback(async (ttId) => {
    if (!ttId) return;
    await Promise.resolve();
    setPhasesLoading(true);
    try {
      const res = await api.get(`/ticket-types/${ttId}/phases`);
      const list = res.data?.phases || [];
      setPhases(list);
      setPhaseTotal(res.data?.total ?? list.length);
      setPhaseTicketTypeMeta(res.data?.ticket_type || null);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat daftar fase tiket.",
      });
      setPhases([]);
      setPhaseTotal(0);
      setPhaseTicketTypeMeta(null);
    } finally {
      setPhasesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicketTypeId) {
      const t = setTimeout(() => {
        fetchPhases(selectedTicketTypeId);
      }, 0);
      return () => clearTimeout(t);
    }
  }, [selectedTicketTypeId, fetchPhases]);

  const handleDeletePhase = async (phase) => {
    const confirmed = window.confirm(
      `Hapus fase "${phase.phase_name?.replace("_", " ")}" (${phase.start_date} s/d ${phase.end_date})?`
    );
    if (!confirmed) return;

    setMessage(null);
    try {
      await api.delete(`/phases/${phase.id}`);
      setMessage({
        type: "success",
        text: "Fase harga berhasil dihapus.",
      });
      await fetchPhases(selectedTicketTypeId);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Gagal menghapus fase tiket.",
      });
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(p || 0);

  const selectedTicketType = ticketTypes.find(
    (t) => t.id === Number(selectedTicketTypeId)
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${eventId}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Detail Event ({event?.name || `#${eventId}`})
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#0080f2] dark:text-[#0080f2]">
            Pricing Phase Management
          </span>
          <h1 className="mt-1 text-3xl font-black text-slate-900 dark:text-white">
            Fase Harga Tiket
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Terhubung dengan <code className="font-mono">GET / POST /api/ticket-types/&lt;id&gt;/phases</code> serta <code className="font-mono">PUT / DELETE /api/phases/&lt;id&gt;</code>.
          </p>
        </div>

        {selectedTicketTypeId && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchPhases(selectedTicketTypeId)}
              className="rounded-2xl border border-slate-200 bg-white p-3 text-slate-700 shadow-sm hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              <RefreshCw
                size={18}
                className={phasesLoading ? "animate-spin" : ""}
              />
            </button>
            <Link
              href={`/admin/event/${eventId}/ticket-phase/create?ticketTypeId=${selectedTicketTypeId}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-6 py-3 font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105"
            >
              <Plus size={18} />
              Tambah Fase Baru
            </Link>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-2xl border p-4 text-sm font-semibold ${
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
          }`}
        >
          <AlertCircle size={18} className="shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Ticket Type Selector Tabs */}
      {ticketTypes.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {ticketTypes.map((tt) => {
            const active = Number(selectedTicketTypeId) === tt.id;
            return (
              <button
                key={tt.id}
                type="button"
                onClick={() => setSelectedTicketTypeId(tt.id)}
                className={`rounded-2xl border px-5 py-3 text-left transition ${
                  active
                    ? "border-[#0080f2] bg-[#0080f2] text-white shadow-md"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#0080f2] dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                }`}
              >
                <p className="text-sm font-black">{tt.name}</p>
                <p
                  className={`text-xs ${
                    active ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Harga Dasar: {formatPrice(tt.base_price)} • Kuota: {tt.quota}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            Event ini belum memiliki kategori tiket.
          </p>
        </div>
      )}

      {/* Phases Table */}
      {selectedTicketType && (
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <h2 className="font-black text-slate-900 dark:text-white">
              Daftar Fase untuk Kategori:{" "}
              {phaseTicketTypeMeta?.name || selectedTicketType.name} (ID #
              {phaseTicketTypeMeta?.id || selectedTicketType.id})
            </h2>
            <span className="rounded-full bg-[#0080f2]/10 px-3 py-1 text-xs font-bold text-[#0080f2] dark:bg-[#0080f2]/20 dark:text-[#0080f2]">
              Total Fase: {phaseTotal} • Harga Dasar:{" "}
              {formatPrice(
                phaseTicketTypeMeta?.base_price ?? selectedTicketType.base_price
              )}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-4">Nama Fase</th>
                  <th className="px-6 py-4">Tanggal Mulai</th>
                  <th className="px-6 py-4">Tanggal Berakhir</th>
                  <th className="px-6 py-4">Diskon</th>
                  <th className="px-6 py-4">Estimasi Harga</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {phasesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Memuat fase harga...
                    </td>
                  </tr>
                ) : phases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Belum ada fase harga untuk kategori tiket ini. Klik{" "}
                      <strong>Tambah Fase Baru</strong> di kanan atas.
                    </td>
                  </tr>
                ) : (
                  phases.map((phase) => {
                    const base = Number(selectedTicketType.base_price || 0);
                    const disc = Number(phase.discount_percent || 0);
                    const calcPrice = Math.round(base * (1 - disc / 100));

                    return (
                      <tr
                        key={phase.id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Ticket
                              size={17}
                              className="text-[#0080f2] dark:text-[#0080f2]"
                            />
                            <span className="font-bold capitalize text-slate-900 dark:text-white">
                              {phase.phase_name?.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {phase.start_date}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {phase.end_date}
                        </td>
                        <td className="px-6 py-4">
                          {disc > 0 ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              {disc}% OFF
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">
                              0% (Harga Normal)
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-bold text-[#0080f2] dark:text-[#0080f2]">
                          {formatPrice(calcPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Link
                              href={`/admin/event/${eventId}/ticket-phase/${phase.id}/edit`}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 text-slate-600 transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:text-slate-300"
                              title="Edit Fase"
                            >
                              <Pencil size={15} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeletePhase(phase)}
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300 text-red-500 transition hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/30"
                              title="Hapus Fase"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TicketPhaseListPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 text-center text-slate-500">
          Memuat fase tiket...
        </div>
      }
    >
      <TicketPhaseListContent />
    </Suspense>
  );
}
