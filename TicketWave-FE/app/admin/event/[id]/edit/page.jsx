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
      <div className="space-y-4">
        <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-96 max-w-4xl animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/event/${id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition hover:text-[#0080f2] dark:text-slate-400"
      >
        <ArrowLeft size={17} />
        Kembali ke Detail Event
      </Link>

      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Edit Event #{id}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Perbarui informasi event melalui endpoint <code className="font-mono">PUT /api/events/{id}</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-6">
        <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Nama Event *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {eventType === "single" ? (
            <>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                  Nama Artis Utama
                </label>
                <input
                  type="text"
                  value={artistName}
                  onChange={(e) => setArtistName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Tanggal Event
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                Jumlah Hari Festival (1 – 10)
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={daysCount}
                onChange={(e) => setDaysCount(e.target.value)}
                className="w-36 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                Venue *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                Kota *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Deskripsi
            </label>
            <textarea
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
              Status Event
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="on_sale">On Sale</option>
              <option value="sales_closed">Sales Closed</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="grid gap-6 border-t border-slate-200 pt-6 sm:grid-cols-2 dark:border-slate-800">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                Ganti Poster Event (POST /api/events/{id}/poster)
              </label>
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 transition hover:border-[#0080f2] dark:border-slate-700">
                {posterPreview ? (
                  <img
                    src={posterPreview}
                    alt="Poster"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={26} className="text-slate-400" />
                    <span className="mt-2 text-xs font-semibold text-slate-500">
                      Klik untuk mengganti Poster
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

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-900 dark:text-white">
                Ganti Banner Event (POST /api/events/{id}/banner)
              </label>
              <label className="flex h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-300 transition hover:border-[#0080f2] dark:border-slate-700">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <>
                    <Upload size={26} className="text-slate-400" />
                    <span className="mt-2 text-xs font-semibold text-slate-500">
                      Klik untuk mengganti Banner
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#0080f2] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#0080f2]/20 transition hover:scale-105 disabled:opacity-50"
          >
            <Save size={18} />
            {submitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          <Link
            href={`/admin/event/${id}`}
            className="rounded-2xl border border-slate-300 px-8 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
