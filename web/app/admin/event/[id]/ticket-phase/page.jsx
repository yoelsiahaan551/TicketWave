"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
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
    null
  );
  const [phases, setPhases] = useState([]);
  const [phaseTotal, setPhaseTotal] = useState(null);
  const requestVersion = useRef(0);
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
          const initialId = tts.some((tt) => String(tt.id) === queryTicketTypeId)
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
    const version = ++requestVersion.current;
    await Promise.resolve();
    setPhasesLoading(true);
    setMessage(null);
    setPhaseTotal(null);
    setPhases([]);
    setPhaseTicketTypeMeta(null);
    try {
      const res = await api.get(`/ticket-types/${ttId}/phases`);
      if (version !== requestVersion.current) return;
      const list = res.data?.phases || [];
      setPhases(list);
      setPhaseTotal(res.data?.total ?? list.length);
      setPhaseTicketTypeMeta(res.data?.ticket_type || null);
    } catch (err) {
      if (version !== requestVersion.current) return;
      setMessage({
        type: "error",
        text: err.message || "Gagal memuat daftar fase tiket.",
      });
      setPhases([]);
      setPhaseTotal(null);
      setPhaseTicketTypeMeta(null);
    } finally {
      if (version === requestVersion.current) setPhasesLoading(false);
    }
  }, []);

  const invalidatePhases = useCallback(() => { requestVersion.current++; }, []);

  useEffect(() => {
    if (selectedTicketTypeId) {
      const t = setTimeout(() => {
        fetchPhases(selectedTicketTypeId);
      }, 0);
      return () => { clearTimeout(t); invalidatePhases(); };
    }
  }, [selectedTicketTypeId, fetchPhases, invalidatePhases]);

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
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${eventId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
      >
        <ArrowLeft size={14} />
        Kembali ke Detail Event ({event?.name || `#${eventId}`})
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Pricing Phase Management
          </span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Fase Harga Tiket
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Terhubung dengan <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">GET / POST /api/ticket-types/&lt;id&gt;/phases</code> serta <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">PUT / DELETE /api/phases/&lt;id&gt;</code>.
          </p>
        </div>

        {selectedTicketTypeId && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchPhases(selectedTicketTypeId)}
              className="rounded-xl border border-slate-200/80 bg-white p-2 text-slate-700 shadow-xs hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
              title="Refresh"
            >
              <RefreshCw
                size={15}
                className={phasesLoading ? "animate-spin" : ""}
              />
            </button>
            <Link
              href={`/admin/event/${eventId}/ticket-phase/create?ticketTypeId=${selectedTicketTypeId}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-xs transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              <Plus size={15} />
              Tambah Fase Baru
            </Link>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-medium ${
            message.type === "error"
              ? "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Ticket Type Selector Tabs */}
      {ticketTypes.length > 0 ? (
        <div className="flex flex-wrap gap-2.5">
          {ticketTypes.map((tt) => {
            const active = Number(selectedTicketTypeId) === tt.id;
            return (
              <button
                key={tt.id}
                type="button"
                onClick={() => setSelectedTicketTypeId(tt.id)}
                className={`rounded-xl border px-4 py-2 text-left transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white shadow-xs dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                    : "border-slate-200/80 bg-white text-slate-700 hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600"
                }`}
              >
                <p className="text-xs font-semibold">{tt.name}</p>
                <p
                  className={`mt-0.5 text-[11px] ${
                    active ? "text-white/90" : "text-slate-500 dark:text-slate-400"
                  }`}
                >
                  Harga: {formatPrice(tt.base_price)} • Kuota: {tt.quota}
                </p>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Event ini belum memiliki kategori tiket.
          </p>
        </div>
      )}

      {/* Phases Table */}
      {selectedTicketType && message?.type !== "error" && (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-5 py-3.5 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Daftar Fase untuk Kategori:{" "}
              {phaseTicketTypeMeta?.name || selectedTicketType.name} (ID #
              {phaseTicketTypeMeta?.id || selectedTicketType.id})
            </h2>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Total Fase: {phaseTotal ?? "—"} • Dasar:{" "}
              {formatPrice(
                phaseTicketTypeMeta?.base_price ?? selectedTicketType.base_price
              )}
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">Nama Fase</th>
                  <th className="px-5 py-3">Tanggal Mulai</th>
                  <th className="px-5 py-3">Tanggal Berakhir</th>
                  <th className="px-5 py-3">Diskon</th>
                  <th className="px-5 py-3">Estimasi Harga</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {phasesLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">
                      Memuat fase harga...
                    </td>
                  </tr>
                ) : phases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                      Belum ada fase harga untuk kategori tiket ini. Klik{" "}
                      <strong className="text-slate-700 dark:text-slate-300">Tambah Fase Baru</strong> di kanan atas.
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
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Ticket
                              size={15}
                              className="text-slate-400"
                            />
                            <span className="font-medium capitalize text-slate-900 dark:text-white">
                              {phase.phase_name?.replace("_", " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                          {phase.start_date}
                        </td>
                        <td className="px-5 py-3.5 text-slate-600 dark:text-slate-300">
                          {phase.end_date}
                        </td>
                        <td className="px-5 py-3.5">
                          {disc > 0 ? (
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              {disc}% OFF
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              0% (Normal)
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 font-semibold text-slate-900 dark:text-white">
                          {formatPrice(calcPrice)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/admin/event/${eventId}/ticket-phase/${phase.id}/edit`}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                              title="Edit Fase"
                            >
                              <Pencil size={13} />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDeletePhase(phase)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                              title="Hapus Fase"
                            >
                              <Trash2 size={13} />
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

          {/* Mobile Card List View (< md) */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
            {phasesLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Memuat fase harga...
              </div>
            ) : phases.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada fase harga untuk kategori tiket ini.
              </div>
            ) : (
              phases.map((phase) => {
                const base = Number(selectedTicketType.base_price || 0);
                const disc = Number(phase.discount_percent || 0);
                const calcPrice = Math.round(base * (1 - disc / 100));

                return (
                  <div key={phase.id} className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Ticket size={15} className="text-slate-400 shrink-0" />
                        <span className="font-semibold capitalize text-xs text-slate-900 dark:text-white">
                          {phase.phase_name?.replace("_", " ")}
                        </span>
                      </div>
                      {disc > 0 ? (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {disc}% OFF
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Normal</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{phase.start_date} s/d {phase.end_date}</span>
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {formatPrice(calcPrice)}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/admin/event/${eventId}/ticket-phase/${phase.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                      >
                        <Pencil size={12} />
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDeletePhase(phase)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      >
                        <Trash2 size={12} />
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })
            )}
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
        <div className="py-12 text-center text-xs text-slate-500">
          Memuat fase tiket...
        </div>
      }
    >
      <TicketPhaseListContent />
    </Suspense>
  );
}
