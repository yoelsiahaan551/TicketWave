"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import api from "@/app/lib/api";
import {
  Heart,
  Calendar,
  CalendarDays,
  MapPin,
  Trash2,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
  Ticket,
  CheckCircle2,
  Music2,
} from "lucide-react";

export default function UserFavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // 'all' | 'artist' | 'event'
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState(null);

  // New favorite artist modal/input
  const [showAddModal, setShowAddModal] = useState(false);
  const [newArtistName, setNewArtistName] = useState("");
  const [newArtistGenre, setNewArtistGenre] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadFavorites = useCallback(async () => {
    await Promise.resolve();
    setLoading(true);
    try {
      const res = await api.get("/user/favorites");
      if (res && res.success && res.data?.items) {
        setFavorites(res.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadFavorites();
    }, 0);
    return () => clearTimeout(t);
  }, [loadFavorites]);

  const handleRemoveFavorite = async (id, name) => {
    try {
      await api.delete(`/user/favorites/${encodeURIComponent(id)}`);
      setFavorites((prev) => prev.filter((f) => String(f.id) !== String(id)));
      setFeedback({ type: "success", text: `"${name}" berhasil dihapus dari daftar favorit.` });
      setTimeout(() => setFeedback(null), 3000);
    } catch {
      setFeedback({ type: "error", text: "Gagal menghapus favorit." });
    }
  };

  const handleAddArtist = async (e) => {
    e.preventDefault();
    if (!newArtistName.trim() || submitting) return;

    setSubmitting(true);
    try {
      const payload = {
        name: newArtistName.trim(),
        type: "artist",
        genre: newArtistGenre.trim() || "Pop / Alternative",
        image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
      };

      const res = await api.post("/user/favorites", payload);
      if (res.success && res.data) {
        setFavorites((prev) => [res.data, ...prev]);
        setNewArtistName("");
        setNewArtistGenre("");
        setShowAddModal(false);
        setFeedback({ type: "success", text: `Artis "${res.data.name}" berhasil ditambahkan ke favorit!` });
        setTimeout(() => setFeedback(null), 3000);
      }
    } catch {
      setFeedback({ type: "error", text: "Gagal menambahkan artis favorit." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter((item) => {
      if (activeTab !== "all" && item.type !== activeTab) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchGenre = (item.genre || "").toLowerCase().includes(q);
        const matchVenue = (item.venue || "").toLowerCase().includes(q);
        const matchCity = (item.city || "").toLowerCase().includes(q);
        if (!matchName && !matchGenre && !matchVenue && !matchCity) return false;
      }
      return true;
    });
  }, [favorites, activeTab, searchQuery]);

  const artistCount = favorites.filter((f) => f.type === "artist").length;
  const eventCount = favorites.filter((f) => f.type === "event").length;

  const formatRupiah = (val) => {
    if (!val) return null;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 md:pb-16 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0080f2]">
                <Heart size={14} className="fill-[#0080f2]" /> Favorit Pengguna
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                Tersimpan di Akun
              </span>
            </div>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Artis &amp; Event Favorit
            </h1>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 sm:text-sm max-w-2xl leading-relaxed">
              Daftar artis pujaan dan event musik pilihan Anda untuk kemudahan memantau jadwal konser, notifikasi tiket, dan pemesanan cepat.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0070d4] active:scale-[0.98] shrink-0"
          >
            <Plus size={16} />
            <span>Tambah Artis Favorit</span>
          </button>
        </div>

        {/* Toast Feedback */}
        {feedback && (
          <div
            className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-medium transition duration-200 ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{feedback.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Bar & Search */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                activeTab === "all"
                  ? "bg-[#0080f2] text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <span>Semua</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === "all"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {favorites.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("artist")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                activeTab === "artist"
                  ? "bg-[#0080f2] text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Music2 size={13} />
              <span>Artis</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === "artist"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {artistCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("event")}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-medium transition ${
                activeTab === "event"
                  ? "bg-[#0080f2] text-white shadow-xs font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Calendar size={13} />
              <span>Event</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  activeTab === "event"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {eventCount}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari artis, genre, atau kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#0080f2] focus:bg-white focus:ring-1 focus:ring-[#0080f2] dark:border-slate-800 dark:bg-slate-800/50 dark:text-white dark:focus:border-[#0080f2]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-44 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-5 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-2.5 h-3.5 w-1/2 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="mt-5 h-9 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/40">
              <Heart size={28} className="fill-[#0080f2]" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              {searchQuery ? "Favorit tidak ditemukan" : "Belum ada favorit yang disimpan"}
            </h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {searchQuery
                ? `Tidak ada artis atau event yang cocok dengan kata kunci "${searchQuery}". Coba gunakan kata kunci lain.`
                : "Tandai artis atau event yang Anda sukai dengan ikon hati agar lebih mudah ditemukan dan dipantau jadwal konsernya."}
            </p>
            <div className="mt-5 flex justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 transition"
                >
                  Reset Pencarian
                </button>
              ) : (
                <Link
                  href="/user/event"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0070d4]"
                >
                  <Ticket size={14} />
                  <span>Jelajahi Event</span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFavorites.map((item) => {
              const isArtist = item.type === "artist";
              const formattedPrice = formatRupiah(item.price_from);

              return (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div>
                    {/* Media Image Banner */}
                    <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />

                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md shadow-xs ${
                            isArtist
                              ? "bg-slate-900/80 text-purple-300 border border-purple-800/40"
                              : "bg-slate-900/80 text-blue-300 border border-blue-800/40"
                          }`}
                        >
                          {isArtist ? <Music2 size={12} /> : <Calendar size={12} />}
                          <span>{isArtist ? "Artis Pujaan" : "Event Disimpan"}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveFavorite(item.id, item.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-slate-300 shadow-xs backdrop-blur-md transition hover:bg-red-500 hover:text-white dark:bg-slate-900/80"
                          title="Hapus dari favorit"
                          aria-label={`Hapus ${item.name} dari favorit`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Bottom Banner Info */}
                      <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs text-white">
                        {isArtist ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-medium backdrop-blur-xs">
                            <Sparkles size={11} className="text-amber-300" />
                            {item.genre || "Pop / Alternative"}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-200">
                            <MapPin size={12} className="text-[#0080f2]" />
                            <span className="truncate max-w-[200px]">
                              {item.city ? `${item.city} • ${item.venue || ""}` : item.venue || "Indonesia"}
                            </span>
                          </span>
                        )}

                        {!isArtist && item.date && (
                          <span className="text-[11px] font-medium text-slate-300">
                            {item.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 sm:p-5">
                      <h3 className="text-base font-bold text-slate-900 transition-colors group-hover:text-[#0080f2] dark:text-white line-clamp-1">
                        {item.name}
                      </h3>

                      {isArtist ? (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          Artis favorit tersimpan. Dapatkan kabar saat jadwal konser dan penjualan tiket resmi dibuka di TicketWave.
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          {formattedPrice && (
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                              Mulai dari <span className="text-[#0080f2]">{formattedPrice}</span>
                            </p>
                          )}
                          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <CalendarDays size={12} />
                            <span>{item.date || "Jadwal Resmi Diumumkan"}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-5">
                    {isArtist ? (
                      <Link
                        href={`/user/event?search=${encodeURIComponent(item.name)}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2]"
                      >
                        <Search size={13} />
                        <span>Cari Jadwal Konser</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/user/event/${item.event_id || 1}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0080f2] py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0070d4] active:scale-[0.99]"
                      >
                        <Ticket size={13} />
                        <span>Pesan Tiket Sekarang</span>
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Modal Tambah Artis Favorit */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0080f2] dark:bg-blue-950/50">
                  <Music2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tambah Artis Favorit
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Koleksi musisi pujaan Anda
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddArtist} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Nama Artis / Grup Musik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sal Priadi, Tulus, Sheila on 7"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#0080f2] focus:bg-white focus:ring-1 focus:ring-[#0080f2] dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Genre Musik (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pop, Indie Rock, Jazz, R&amp;B"
                  value={newArtistGenre}
                  onChange={(e) => setNewArtistGenre(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none transition focus:border-[#0080f2] focus:bg-white focus:ring-1 focus:ring-[#0080f2] dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:border-[#0080f2]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newArtistName.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0080f2] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-50"
                >
                  <Plus size={14} />
                  <span>{submitting ? "Menyimpan..." : "Simpan Artis"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
