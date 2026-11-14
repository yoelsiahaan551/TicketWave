"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle2, Upload } from "lucide-react";
import api from "@/app/lib/api";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [eventType, setEventType] = useState("single");
  const [name, setName] = useState("");
  const [artistName, setArtistName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [daysCount, setDaysCount] = useState(1);
  const [venue, setVenue] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    api
      .get(`/events/${id}`)
      .then((res) => {
        if (ignore) return;
        const ev = res.data;
        if (ev) {
          setEventType(ev.event_type || "single");
          setName(ev.name || "");
          setArtistName(ev.artist_name || "");
          setEventDate(ev.event_date || "");
          setEventTime(ev.event_time ? ev.event_time.slice(0, 5) : "");
          setDaysCount(ev.days_count || 1);
          setVenue(ev.venue || "");
          setCity(ev.city || "");
          setDescription(ev.description || "");
          setStatus(ev.status || "draft");
          if (ev.poster_url) setPosterPreview(ev.poster_url);
          if (ev.banner_url) setBannerPreview(ev.banner_url);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || "Gagal memuat data event.");
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

    const payload = {
      name: name.trim(),
      venue: venue.trim(),
      city: city.trim(),
      description: description.trim(),
      status,
    };

    if (eventType === "single") {
      payload.artist_name = artistName.trim();
      if (eventDate) payload.event_date = eventDate;
      if (eventTime) payload.event_time = eventTime;
    } else {
      payload.days_count = Number(daysCount);
    }

    try {
      await api.put(`/events/${id}`, payload);
      if (posterFile) {
        const fd = new FormData();
        fd.append("poster", posterFile);
        await api.upload(`/events/${id}/poster`, fd);
      }
      if (bannerFile) {
        const fd = new FormData();
        fd.append("banner", bannerFile);
        await api.upload(`/events/${id}/banner`, fd);
      }
      setSuccessMsg("Data event berhasil diperbarui!");
      setTimeout(() => router.push(`/admin/event/${id}`), 800);
    } catch (err) {
      setError(err.message || "Gagal menyimpan perubahan event.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="h-[480px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 xl:col-span-8" />
          <div className="h-[380px] animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800 xl:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link
            href={`/admin/event/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft size={14} />
            Kembali ke Detail Event
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            Edit Event #{id}
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Perbarui informasi event melalui endpoint <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300">PUT /api/events/{id}</code>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Tipe: {eventType}
          </span>
          <span className="rounded-full border border-slate-200/80 bg-slate-50 px-2.5 py-0.5 text-[11px] font-medium capitalize text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            Status: {status.replace("_", " ")}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Main Details (Left 8 columns) */}
          <div className="space-y-6 xl:col-span-8">
            <div className="space-y-5 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Informasi Utama Event
              </h2>

              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <AlertCircle size={16} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2.5 rounded-xl border border-slate-300 bg-slate-100 p-3 text-xs font-medium text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <CheckCircle2 size={16} className="shrink-0 text-slate-500 dark:text-slate-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Nama Event *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                />
              </div>

              {eventType === "single" ? (
                <>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                      Nama Artis Utama
                    </label>
                    <input
                      type="text"
                      value={artistName}
                      onChange={(e) => setArtistName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Tanggal Event
                      </label>
                      <input
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Jam Mulai
                      </label>
                      <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Jumlah Hari Festival (1 – 10)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={daysCount}
                    onChange={(e) => setDaysCount(e.target.value)}
                    className="w-32 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  />
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Kota *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Deskripsi Event
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan deskripsi lengkap mengenai event, syarat & ketentuan, atau rundown..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Side Panel (Right 4 columns) */}
          <div className="space-y-6 xl:col-span-4">
            {/* Status & Actions Card (Sticky on desktop) */}
            <div className="space-y-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs xl:sticky xl:top-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Status &amp; Publikasi
              </h3>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Status Event Saat Ini
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 outline-none transition focus:border-slate-500 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-slate-400 dark:focus:ring-slate-400"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="on_sale">On Sale</option>
                  <option value="sales_closed">Sales Closed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="finished">Finished</option>
                  <option value="archived">Archived</option>
                </select>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                  Event berstatus <strong>On Sale</strong> otomatis muncul di katalog publik.
                </p>
              </div>

              <div className="space-y-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white shadow-xs transition hover:bg-[#0070d4] disabled:opacity-50"
                >
                  <Save size={15} />
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
                <Link
                  href={`/admin/event/${id}`}
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Batal
                </Link>
              </div>
            </div>

            {/* Poster Upload Card */}
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Poster Event (POST /events/{id}/poster)
              </label>
              <label className="flex h-52 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500">
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Poster"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-slate-400" />
                    <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      Klik untuk mengganti Poster
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      JPG, PNG, WEBP (maks. 5MB)
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPosterFile(f);
                      setPosterPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>

            {/* Banner Upload Card */}
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Banner Event (POST /events/{id}/banner)
              </label>
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 transition hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={24} className="text-slate-400" />
                    <span className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      Klik untuk mengganti Banner
                    </span>
                    <span className="mt-0.5 text-[11px] text-slate-400">
                      Rekomendasi rasio 16:9
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setBannerFile(f);
                      setBannerPreview(URL.createObjectURL(f));
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
