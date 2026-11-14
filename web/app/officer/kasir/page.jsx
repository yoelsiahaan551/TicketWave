"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/api";
import { getStoredEvents } from "@/app/lib/dummyApiHandler";
import {
  Receipt,
  Ticket,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Search,
  Printer,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Coins,
  CreditCard,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  X,
  ScanLine,
  ArrowRight,
} from "lucide-react";

export default function OfficerKasirPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Navigation tab: 'checkout' | 'history'
  const [activeTab, setActiveTab] = useState("checkout");

  // Events & Ticket types data
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedTicketTypeId, setSelectedTicketTypeId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Buyer form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [notes, setNotes] = useState("");

  // Cash payment state
  const [cashReceived, setCashReceived] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Success modal state
  const [issuedResult, setIssuedResult] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  // Transaction history state
  const [transactions, setTransactions] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState("");

  // Fetch events list
  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    try {
      let rawItems = [];
      try {
        const res = await api.get("/public/events", { page: 1, per_page: 20 }, { silent: true });
        if (res && res.data?.items?.length) {
          rawItems = res.data.items;
        }
      } catch {}

      if (!rawItems.length || !rawItems.some((e) => Array.isArray(e.ticket_types) && e.ticket_types.length > 0)) {
        rawItems = getStoredEvents();
      }

      // Pastikan setiap event memiliki ticket_types valid
      const sanitized = (rawItems || []).map((ev) => {
        const hasTypes = Array.isArray(ev.ticket_types) && ev.ticket_types.length > 0;
        return {
          ...ev,
          ticket_types: hasTypes
            ? ev.ticket_types
            : [
                {
                  id: Number(ev.id) * 10 + 1,
                  name: "Presale Festival",
                  price: 350000,
                  base_price: 350000,
                  quota: 150,
                  remaining: 85,
                  sold_count: 65,
                  description: "Akses reguler festival area standing",
                },
                {
                  id: Number(ev.id) * 10 + 2,
                  name: "VIP Early Entry",
                  price: 750000,
                  base_price: 750000,
                  quota: 50,
                  remaining: 22,
                  sold_count: 28,
                  description: "Akses barisan depan + lanyard eksklusif",
                },
              ],
        };
      });

      setEvents(sanitized);
      if (sanitized.length > 0) {
        const activeEv = selectedEventId
          ? sanitized.find((e) => e.id === Number(selectedEventId)) || sanitized[0]
          : sanitized[0];

        setSelectedEventId(activeEv.id);
        if (activeEv.ticket_types?.length > 0) {
          setSelectedTicketTypeId(activeEv.ticket_types[0].id);
        }
      }
    } catch {
      const fallback = getStoredEvents();
      setEvents(fallback);
      if (fallback.length > 0) {
        setSelectedEventId(fallback[0].id);
        if (fallback[0].ticket_types?.length > 0) {
          setSelectedTicketTypeId(fallback[0].ticket_types[0].id);
        }
      }
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedEventId]);

  // Fetch cashier transactions history
  const loadTransactions = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/kasir/transactions");
      if (res.success && res.data?.items) {
        setTransactions(res.data.items);
      }
    } catch {
      // ignore
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
    loadTransactions();
  }, [loadEvents, loadTransactions]);

  // Currently selected event & ticket type
  const selectedEvent = useMemo(() => {
    return events.find((e) => e.id === Number(selectedEventId)) || events[0] || null;
  }, [events, selectedEventId]);

  const selectedTicketType = useMemo(() => {
    if (!selectedEvent || !selectedEvent.ticket_types) return null;
    return (
      selectedEvent.ticket_types.find((t) => t.id === Number(selectedTicketTypeId)) ||
      selectedEvent.ticket_types[0] ||
      null
    );
  }, [selectedEvent, selectedTicketTypeId]);

  // Remaining quota
  const remainingQuota = useMemo(() => {
    if (!selectedTicketType) return 0;
    if (selectedTicketType.remaining !== undefined) return selectedTicketType.remaining;
    return Math.max(0, (selectedTicketType.quota || 0) - (selectedTicketType.sold_count || 0));
  }, [selectedTicketType]);

  // Pricing calculations
  const unitPrice = useMemo(() => {
    if (!selectedTicketType) return 0;
    return Number(selectedTicketType.price || selectedTicketType.base_price || 0);
  }, [selectedTicketType]);

  const totalAmount = unitPrice * quantity;
  const cashNum = Number(cashReceived || 0);
  const changeAmount = Math.max(0, cashNum - totalAmount);
  const isCashSufficient = cashNum >= totalAmount && totalAmount > 0;

  // Handle Event selection change
  const handleEventChange = (eventId) => {
    const numId = Number(eventId);
    setSelectedEventId(numId);
    const ev = events.find((e) => e.id === numId);
    if (ev && ev.ticket_types?.length > 0) {
      setSelectedTicketTypeId(ev.ticket_types[0].id);
    } else {
      setSelectedTicketTypeId(null);
    }
    setQuantity(1);
    setErrorMessage(null);
  };

  // Quick cash chips handler
  const handleQuickCash = (amount) => {
    setCashReceived(String(amount));
  };

  // Submit Cash Transaction
  const handleSubmitTransaction = async (e) => {
    e.preventDefault();
    if (!selectedEvent) {
      setErrorMessage("Silakan pilih event terlebih dahulu.");
      return;
    }
    if (!selectedTicketType) {
      setErrorMessage("Silakan pilih kategori tiket.");
      return;
    }
    if (!buyerName.trim()) {
      setErrorMessage("Nama lengkap pembeli wajib diisi.");
      return;
    }
    if (!buyerPhone.trim()) {
      setErrorMessage("No. WhatsApp / telepon pembeli wajib diisi.");
      return;
    }
    if (quantity <= 0) {
      setErrorMessage("Jumlah tiket minimal 1 tiket.");
      return;
    }
    if (quantity > remainingQuota) {
      setErrorMessage(`Jumlah melebihi sisa kuota yang tersedia (${remainingQuota} tiket).`);
      return;
    }
    if (!isCashSufficient) {
      setErrorMessage(
        `Uang tunai kurang. Total tagihan Rp ${totalAmount.toLocaleString("id-ID")}, uang diterima Rp ${cashNum.toLocaleString("id-ID")}.`
      );
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        event_id: selectedEvent.id,
        ticket_type_id: selectedTicketType.id,
        quantity,
        buyer_name: buyerName.trim(),
        buyer_phone: buyerPhone.trim(),
        buyer_email: buyerEmail.trim() || undefined,
        cash_received: cashNum,
        notes: notes.trim() || undefined,
      };

      const res = await api.post("/kasir/checkout", payload);
      if (res.success && res.data) {
        setIssuedResult(res.data);
        // Reset form
        setBuyerName("");
        setBuyerPhone("");
        setBuyerEmail("");
        setCashReceived("");
        setNotes("");
        setQuantity(1);
        // Refresh events and transactions
        loadEvents();
        loadTransactions();
      } else {
        setErrorMessage(res.message || "Gagal memproses transaksi kasir.");
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses transaksi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy code helper
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Filtered transactions for history tab
  const filteredTransactions = useMemo(() => {
    const q = searchHistory.toLowerCase().trim();
    if (!q) return transactions;
    return transactions.filter(
      (t) =>
        (t.buyer_name || "").toLowerCase().includes(q) ||
        (t.booking_code || "").toLowerCase().includes(q) ||
        (t.event_name || "").toLowerCase().includes(q)
    );
  }, [transactions, searchHistory]);

  // Aggregate stats
  const totalRevenueCollected = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.total_amount || 0), 0);
  }, [transactions]);

  const totalTicketsSoldKasir = useMemo(() => {
    return transactions.reduce((acc, t) => acc + (t.quantity || 0), 0);
  }, [transactions]);

  const officerName = user?.name || "Petugas Kasir";
  const gateName = user?.assigned_gate || "Gate A - Box Office";

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <Coins size={13} /> Box Office / Loket OTS
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
              Mode Simulasi Kasir
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Kasir Tunai &amp; Penerbitan Tiket
          </h1>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            Penjualan tiket on-the-spot di lokasi acara dengan pembayaran uang tunai langsung dan cetak e-tiket resmi.
          </p>
        </div>

        {/* Shift Badge & Actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/officer/scan"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ScanLine size={14} className="text-[#0080f2]" />
            <span>Buka Scanner Gate</span>
          </Link>
          <div className="rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-right shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <p className="text-[10px] text-slate-400">Kasir Aktif</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {officerName} • {gateName}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Uang Tunai Shift</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400">
              <Coins size={14} />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            Rp {totalRevenueCollected.toLocaleString("id-ID")}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total penerimaan tunai</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Tiket Terjual</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Ticket size={14} />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {totalTicketsSoldKasir} Tiket
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Diterbitkan via loket</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Total Transaksi</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Receipt size={14} />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {transactions.length} Selesai
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">Struk tunai tercatat</p>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Sisa Kuota Kategori</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-400">
              <Shield size={14} />
            </div>
          </div>
          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white sm:text-xl">
            {remainingQuota} / {selectedTicketType?.quota || 0}
          </p>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {selectedTicketType?.name || "Kategori aktif"}
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab("checkout")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "checkout"
              ? "border-[#0080f2] text-[#0080f2]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Coins size={16} />
          <span>Checkout Tunai Baru</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "history"
              ? "border-[#0080f2] text-[#0080f2]"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Receipt size={16} />
          <span>Riwayat Transaksi Kasir ({transactions.length})</span>
        </button>
      </div>

      {/* TAB 1: FORM CHECKOUT TUNAI */}
      {activeTab === "checkout" && (
        <form onSubmit={handleSubmitTransaction} className="grid gap-6 lg:grid-cols-3">
          {/* Kolom Kiri: Pemilihan Event, Kategori & Data Pembeli */}
          <div className="space-y-6 lg:col-span-2">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Section 1: Event Selector */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                1. Pilih Event Penjualan
              </label>
              <div className="mt-3">
                {loadingEvents ? (
                  <div className="py-4 text-center text-xs text-slate-400">Memuat event...</div>
                ) : (
                  <select
                    value={selectedEventId || ""}
                    onChange={(e) => handleEventChange(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                  >
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>
                        {ev.name} — {ev.city} ({ev.event_date || "2026"})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedEvent && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} className="text-[#0080f2]" />
                    {selectedEvent.event_date} {selectedEvent.event_time ? `• ${selectedEvent.event_time}` : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-[#0080f2]" />
                    {selectedEvent.venue}, {selectedEvent.city}
                  </span>
                </div>
              )}
            </div>

            {/* Section 2: Kategori Tiket & Kuota */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  2. Pilih Kategori &amp; Kuota Tiket
                </label>
                <span className="text-xs text-slate-400">Klik untuk memilih</span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(selectedEvent?.ticket_types || []).map((tt) => {
                  const isSelected = String(tt.id) === String(selectedTicketTypeId);
                  const rem = tt.remaining !== undefined ? tt.remaining : (tt.quota - (tt.sold_count || 0));
                  const isSoldOut = rem <= 0;

                  return (
                    <button
                      key={tt.id}
                      type="button"
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedTicketTypeId(tt.id);
                        setQuantity(1);
                        setErrorMessage(null);
                      }}
                      className={`relative flex flex-col justify-between rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-[#0080f2] bg-blue-50/40 shadow-xs dark:border-[#0080f2] dark:bg-blue-950/20"
                          : isSoldOut
                          ? "cursor-not-allowed border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/40"
                          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white text-sm">
                            {tt.name}
                          </p>
                          <p className="mt-1 text-base font-bold text-[#0080f2]">
                            Rp {Number(tt.price || tt.base_price || 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0080f2] text-white">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        <span>Sisa Kuota:</span>
                        <span className={`font-semibold ${rem < 10 ? "text-amber-600 dark:text-amber-400" : "text-slate-800 dark:text-slate-200"}`}>
                          {rem} tiket {isSoldOut && "(Habis)"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quantity Counter */}
              <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <div>
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">Jumlah Tiket</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Maksimal sesuai sisa kuota ({remainingQuota} tiket)
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Minus size={14} />
                  </button>

                  <span className="w-8 text-center text-base font-bold text-slate-900 dark:text-white">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    disabled={quantity >= remainingQuota}
                    onClick={() => setQuantity((q) => Math.min(remainingQuota, q + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Data Pengunjung */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                3. Identitas Pembeli
              </label>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Nama Lengkap Pembeli <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <User size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Budi Santoso"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    No. WhatsApp / Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1">
                    <Phone size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="081234567890"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Email Pengunjung (Opsional)
                  </label>
                  <div className="relative mt-1">
                    <Mail size={15} className="absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      placeholder="nama@email.com"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                    Catatan Kasir (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Tamu rombongan / loket 1"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Pembayaran Tunai & Kembalian */}
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                4. Pembayaran Tunai
              </label>

              {/* Rincian Harga */}
              <div className="mt-4 space-y-2 border-b border-slate-100 pb-4 text-xs dark:border-slate-800">
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Kategori Tiket</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedTicketType?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Harga Satuan</span>
                  <span>Rp {unitPrice.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-slate-400">
                  <span>Jumlah Tiket</span>
                  <span>x {quantity}</span>
                </div>
              </div>

              {/* Total Tagihan */}
              <div className="mt-4 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Total Tagihan:
                </span>
                <span className="text-xl font-extrabold text-[#0080f2]">
                  Rp {totalAmount.toLocaleString("id-ID")}
                </span>
              </div>

              {/* Input Uang Tunai Diterima */}
              <div className="mt-5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Uang Tunai Diterima (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-3 text-xs font-semibold text-slate-400">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="0"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-3 text-sm font-bold text-slate-900 focus:border-[#0080f2] focus:bg-white focus:outline-hidden dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
                  />
                </div>

                {/* Quick Cash Buttons */}
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(totalAmount)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(Math.ceil(totalAmount / 50000) * 50000 || 50000)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    +50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(Math.ceil(totalAmount / 100000) * 100000 || 100000)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                  >
                    +100.000
                  </button>
                </div>
              </div>

              {/* Box Kembalian */}
              <div
                className={`mt-4 rounded-xl border p-3.5 text-xs transition ${
                  cashNum === 0
                    ? "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400"
                    : isCashSufficient
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {cashNum === 0
                      ? "Status Pembayaran:"
                      : isCashSufficient
                      ? "Kembalian Uang Tunai:"
                      : "Uang Masih Kurang:"}
                  </span>
                  <span className="text-base font-bold">
                    {cashNum === 0
                      ? "Menunggu Input"
                      : isCashSufficient
                      ? `Rp ${changeAmount.toLocaleString("id-ID")}`
                      : `Rp ${(totalAmount - cashNum).toLocaleString("id-ID")}`}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isCashSufficient || remainingQuota < quantity}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0080f2] py-3 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0070d4] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Menerbitkan Tiket...</span>
                  </>
                ) : (
                  <>
                    <Printer size={15} />
                    <span>Proses Tunai &amp; Terbitkan Tiket</span>
                  </>
                )}
              </button>

              <p className="mt-2 text-center text-[10px] text-slate-400">
                Penerbitan resmi Box Office • Kuota tiket otomatis berkurang
              </p>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: RIWAYAT TRANSAKSI KASIR */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full max-w-sm">
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama pembeli, no. booking..."
                value={searchHistory}
                onChange={(e) => setSearchHistory(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#0080f2] focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <button
              type="button"
              onClick={loadTransactions}
              className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <RefreshCw size={13} className={loadingHistory ? "animate-spin" : ""} />
              <span>Muat Ulang</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {filteredTransactions.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Belum ada transaksi tunai tercatat pada sesi ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Waktu &amp; No. Transaksi</th>
                      <th className="px-4 py-3">Nama Pembeli</th>
                      <th className="px-4 py-3">Event &amp; Kategori</th>
                      <th className="px-4 py-3 text-center">Jumlah</th>
                      <th className="px-4 py-3 text-right">Total Tunai</th>
                      <th className="px-4 py-3 text-right">Kembalian</th>
                      <th className="px-4 py-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-4 py-3">
                          <p className="font-mono font-semibold text-slate-900 dark:text-white">
                            {tx.booking_code}
                          </p>
                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {new Date(tx.created_at).toLocaleTimeString("id-ID", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            WIB
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {tx.buyer_name}
                          </p>
                          <p className="text-[11px] text-slate-400">{tx.buyer_phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {tx.event_name}
                          </p>
                          <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-300">
                            {tx.ticket_type_name}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800 dark:text-slate-200">
                          {tx.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                          Rp {Number(tx.total_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400">
                          Rp {Number(tx.change_amount || 0).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setIssuedResult({
                                transaction: tx,
                                booking: {
                                  booking_code: tx.booking_code,
                                  event_name: tx.event_name,
                                  buyer_name: tx.buyer_name,
                                  total_amount: tx.total_amount,
                                },
                                tickets: tx.tickets || [],
                                change_amount: tx.change_amount || 0,
                              });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Ticket size={12} />
                            <span>Lihat Tiket</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL HASIL PENERBITAN TIKET (POPUP STRUK & TIKET OTS) */}
      {issuedResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Transaksi Tunai Berhasil!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tiket resmi on-the-spot telah diterbitkan dan siap diverifikasi di gate.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIssuedResult(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ringkasan Pembayaran */}
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40 sm:grid-cols-4">
              <div>
                <p className="text-[10px] text-slate-400">No. Booking</p>
                <p className="font-mono font-bold text-slate-900 dark:text-white">
                  {issuedResult.booking?.booking_code}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Pembeli</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {issuedResult.booking?.buyer_name}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Total Pembayaran</p>
                <p className="font-bold text-[#0080f2]">
                  Rp {Number(issuedResult.booking?.total_amount || 0).toLocaleString("id-ID")}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400">Kembalian</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  Rp {Number(issuedResult.change_amount || 0).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Kartu Tiket yang Diterbitkan */}
            <div className="mt-5 space-y-3">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Daftar E-Tiket Diterbitkan ({(issuedResult.tickets || []).length} Tiket):
              </p>

              <div className="space-y-2.5">
                {(issuedResult.tickets || []).map((t, idx) => (
                  <div
                    key={t.ticket_code || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-900/60"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                          {t.ticket_code}
                        </span>
                        <span className="rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                          VALID
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {t.attendee_name || issuedResult.booking?.buyer_name} • Gate Masuk A
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyCode(t.ticket_code)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        {copiedCode === t.ticket_code ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Salin Kode</span>
                          </>
                        )}
                      </button>

                      <Link
                        href={`/officer/validation?code=${encodeURIComponent(t.ticket_code)}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0080f2] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#0070d4] transition"
                      >
                        <ScanLine size={12} />
                        <span>Test Validasi Gate</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <Printer size={14} />
                <span>Simulasi Cetak Struk Kasir</span>
              </button>

              <button
                type="button"
                onClick={() => setIssuedResult(null)}
                className="w-full sm:w-auto rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 transition"
              >
                Selesai &amp; Transaksi Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
