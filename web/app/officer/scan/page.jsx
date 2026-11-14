"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { inspectTicketCode } from "@/app/lib/officerService";
import {
  Camera,
  Flashlight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  VideoOff,
  MapPin,
  Clock,
  Radio,
  Info,
  Calendar,
  Sparkles,
  RotateCcw,
  ExternalLink,
  ShieldAlert,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SlidersHorizontal,
  Lock,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

export default function OfficerScanPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Input manual state
  const [manualCode, setManualCode] = useState("");

  // Scanner & Camera state
  const [isScanning, setIsScanning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment"); // "environment" (belakang) atau "user" (depan)
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionState, setPermissionState] = useState("unknown"); // "prompt" | "granted" | "denied" | "unknown"
  const [secureContext, setSecureContext] = useState(true);

  // Scanned QR result state
  const [scannedResult, setScannedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs for scanner lifecycle
  const scannerRef = useRef(null);
  const lastScannedRef = useRef({ code: "", timestamp: 0 });
  const isStartingRef = useRef(false);

  const assignedGate = user?.assigned_gate || "Gate A - VIP & Early Bird";
  const shiftText = user?.shift || "Shift Sore (15:00 - 23:00 WIB)";

  // Synthesize audible beep upon decoding a QR code
  const playBeepSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // AudioContext policy
    }
  }, [soundEnabled]);

  // Handle successful QR code decode from camera stream
  const handleQrDetected = useCallback(
    (decodedText) => {
      if (!decodedText || !decodedText.trim()) return;
      const cleanCode = decodedText.trim();
      const now = Date.now();

      // Debounce: prevent duplicate scan within 3.5 seconds
      if (
        lastScannedRef.current.code === cleanCode &&
        now - lastScannedRef.current.timestamp < 3500
      ) {
        return;
      }
      lastScannedRef.current = { code: cleanCode, timestamp: now };

      // Haptic feedback if supported
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        try {
          navigator.vibrate([80, 40, 80]);
        } catch {}
      }

      playBeepSound();
      setIsProcessing(true);

      // Parse ticket format using officer service
      const ticketInfo = inspectTicketCode(cleanCode);

      setScannedResult({
        rawCode: cleanCode,
        timestamp: new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        ticket: ticketInfo?.ticket || null,
        status: ticketInfo?.status || "TERBACA",
        isFormatMatch:
          cleanCode.toUpperCase().startsWith("TW-") ||
          cleanCode.toUpperCase().startsWith("TWV-") ||
          cleanCode.toUpperCase().startsWith("TKT-") ||
          cleanCode.toUpperCase().startsWith("TKTW-"),
      });

      setTimeout(() => {
        setIsProcessing(false);
      }, 350);
    },
    [playBeepSound]
  );

  // Stop camera scanner safely
  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Scanner stop warning:", err);
      }
      scannerRef.current = null;
    }
    setCameraActive(false);
    setTorchOn(false);
  }, []);

  // Start HTML5 QR Code Scanner
  const startScanner = useCallback(async () => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setCameraLoading(true);
    setCameraError(null);

    // Check secure context
    if (typeof window !== "undefined") {
      const isSec =
        window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      setSecureContext(isSec);
      if (!isSec) {
        setCameraError({
          type: "insecure",
          title: "Koneksi Tidak Aman (Insecure Context)",
          message:
            "Akses kamera diblokir browser karena halaman tidak dibuka di localhost atau HTTPS.",
          instruction:
            "Buka aplikasi melalui http://localhost:3000 atau protokol HTTPS untuk mengizinkan akses sensor kamera.",
        });
        setCameraLoading(false);
        isStartingRef.current = false;
        return;
      }
    }

    // Check mediaDevices support
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError({
        type: "unsupported",
        title: "Perangkat Tidak Didukung",
        message:
          "Browser ini tidak mendukung MediaDevices API untuk membaca kamera.",
        instruction:
          "Gunakan browser modern seperti Google Chrome, Safari, atau Firefox versi terbaru.",
      });
      setCameraLoading(false);
      isStartingRef.current = false;
      return;
    }

    // Stop previous instance if any
    await stopScanner();

    // Check for container
    const readerElement = document.getElementById("ticketwave-qr-reader");
    if (!readerElement) {
      setCameraLoading(false);
      isStartingRef.current = false;
      return;
    }

    try {
      // Query permission status if available
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const perm = await navigator.permissions.query({ name: "camera" });
          setPermissionState(perm.state);
          perm.onchange = () => setPermissionState(perm.state);
        } catch {}
      }

      // Enumerate available video input devices
      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setCameraDevices(devices);
        }
      } catch {}

      const html5QrCode = new Html5Qrcode("ticketwave-qr-reader");
      scannerRef.current = html5QrCode;

      // Determine camera target config
      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode: facingMode };

      const config = {
        fps: 15,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          const size = Math.floor(minEdge * 0.72);
          return {
            width: Math.max(180, Math.min(size, 280)),
            height: Math.max(180, Math.min(size, 280)),
          };
        },
        disableFlip: false,
      };

      await html5QrCode.start(
        cameraConfig,
        config,
        (decodedText) => handleQrDetected(decodedText),
        () => {
          // Normal frame miss while seeking QR
        }
      );

      setCameraActive(true);
      setCameraLoading(false);
      setIsPaused(false);
      setPermissionState("granted");

      // Check torch capabilities
      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities?.();
        if (capabilities && capabilities.torchFeature?.().isSupported()) {
          setTorchSupported(true);
        }
      } catch {}
    } catch (err) {
      console.error("Camera startup error:", err);
      setCameraActive(false);
      setCameraLoading(false);

      const errName = err?.name || "";
      const errMsg = String(err?.message || err || "");

      if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        errMsg.toLowerCase().includes("permission") ||
        errMsg.toLowerCase().includes("not allowed")
      ) {
        setPermissionState("denied");
        setCameraError({
          type: "denied",
          title: "Izin Akses Kamera Ditolak",
          message:
            "Browser menolak akses ke sensor kamera. Anda perlu memberikan izin kamera agar pemindai dapat aktif.",
          instruction:
            "Klik ikon gembok / perizinan di sebelah URL http://localhost:3000 pada address bar browser Anda, pilih 'Izinkan Kamera' (Allow), lalu klik tombol 'Coba Akses Kamera Lagi' di bawah.",
        });
      } else if (
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError"
      ) {
        setCameraError({
          type: "not_found",
          title: "Kamera Tidak Terdeteksi",
          message:
            "Tidak ditemukan modul kamera fisik atau webcam aktif pada perangkat ini.",
          instruction:
            "Pastikan webcam terhubung dengan benar atau gunakan formulir input manual kode tiket di bawah.",
        });
      } else if (
        errName === "NotReadableError" ||
        errName === "TrackStartError"
      ) {
        setCameraError({
          type: "in_use",
          title: "Kamera Sedang Digunakan Aplikasi Lain",
          message:
            "Sensor kamera sedang terkunci oleh aplikasi lain (seperti Zoom, Google Meet, OBS, atau tab browser lain).",
          instruction:
            "Tutup aplikasi lain yang sedang mengakses kamera, lalu klik tombol 'Coba Akses Kamera Lagi' di bawah.",
        });
      } else {
        setCameraError({
          type: "generic",
          title: "Gagal Membuka Kamera",
          message: errMsg || "Terjadi kendala teknis saat menginisialisasi kamera.",
          instruction:
            "Muat ulang halaman atau coba pilih kamera alternatif melalui opsi kamera di bawah.",
        });
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [facingMode, selectedCameraId, handleQrDetected, stopScanner]);

  // Lifecycle: start scanner when mounting or when facingMode/camera changes
  useEffect(() => {
    let isMounted = true;

    if (isScanning) {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      isMounted = false;
      stopScanner();
    };
  }, [isScanning, facingMode, selectedCameraId, startScanner, stopScanner]);

  // Toggle pause/resume
  const handleTogglePause = () => {
    if (!scannerRef.current || !cameraActive) return;
    try {
      if (isPaused) {
        scannerRef.current.resume();
        setIsPaused(false);
      } else {
        scannerRef.current.pause(true);
        setIsPaused(true);
      }
    } catch (err) {
      console.warn("Toggle pause error:", err);
    }
  };

  // Flip camera between front and back
  const handleFlipCamera = () => {
    setSelectedCameraId(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Toggle flashlight / torch
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !cameraActive) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn("Torch constraint not supported:", err);
    }
  };

  // Manual code submit
  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    router.push(
      `/officer/validation?code=${encodeURIComponent(manualCode.trim())}`
    );
  };

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Scan QR Tiket Penonton
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Arahkan kamera perangkat ke QR Code e-tiket pengunjung untuk membaca kode tiket secara langsung.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Mode Simulasi Gate (Backend Endpoint Belum Tersedia)
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 text-xs font-medium text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
            <MapPin size={13} />
            Pos: {assignedGate.split(" - ")[0]}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
            <Clock size={13} />
            {shiftText.split(" ")[0]}
          </span>
        </div>
      </div>

      {/* Multi-Column Workstation Grid: Fills 100% of available width */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        {/* Left Column: Live Camera QR Scanner & Manual Input Form (lg:col-span-7 xl:col-span-8) */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {/* Main Viewfinder Card */}
          <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            {/* Viewport Frame */}
            <div className="relative aspect-[16/9] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
              {/* HTML5 QR Code DOM Target Element */}
              <div
                id="ticketwave-qr-reader"
                className={`absolute inset-0 h-full w-full ${
                  cameraActive && !cameraError ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />

              {/* Loading State Spinner */}
              {cameraLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 text-center backdrop-blur-xs">
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-700 border-t-[#0080f2] mb-3" />
                  <p className="text-sm font-semibold text-slate-200">
                    Menghubungkan ke Sensor Kamera...
                  </p>
                  <p className="mt-1 text-xs text-slate-400 font-normal">
                    Meminta izin akses dan mengaktifkan live video preview.
                  </p>
                </div>
              )}

              {/* Fallback View: Error or Inactive */}
              {!cameraActive && !cameraLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl mb-3.5 shadow-inner ${
                      cameraError
                        ? "bg-red-950/60 text-red-400 border border-red-900/50"
                        : "bg-slate-800/80 text-slate-300"
                    }`}
                  >
                    {cameraError ? <Camera size={26} /> : <VideoOff size={26} />}
                  </div>

                  <p className="text-sm font-semibold text-slate-200">
                    {cameraError ? cameraError.title : "Kamera Dinonaktifkan"}
                  </p>

                  <p className="mt-1.5 text-xs text-slate-300 max-w-md leading-relaxed font-normal">
                    {cameraError ? cameraError.message : "Pemindai sedang dijeda oleh petugas."}
                  </p>

                  {cameraError?.instruction && (
                    <div className="mt-3.5 max-w-md rounded-lg border border-slate-800 bg-slate-900/90 p-3 text-left text-[11px] text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-200 block mb-0.5 flex items-center gap-1">
                        <Info size={13} className="text-[#0080f2]" /> Petunjuk Mengaktifkan:
                      </span>
                      {cameraError.instruction}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanning(true);
                        startScanner();
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-4 py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
                    >
                      <RotateCcw size={14} />
                      <span>Coba Akses Kamera Lagi</span>
                    </button>
                    <a
                      href="#manual"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                    >
                      <Search size={14} />
                      <span>Input Kode Manual</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Viewfinder Overlay Box (Active only when camera is streaming) */}
              {cameraActive && !cameraError && (
                <div className="relative z-20 flex h-48 w-48 sm:h-60 sm:w-60 md:h-64 md:w-64 items-center justify-center pointer-events-none">
                  {/* Viewfinder Corners */}
                  <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#0080f2] rounded-tl-sm shadow-[0_0_8px_#0080f2]" />
                  <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#0080f2] rounded-tr-sm shadow-[0_0_8px_#0080f2]" />
                  <div className="absolute bottom-0 left-0 h-6 w-6 border-l-2 border-b-2 border-[#0080f2] rounded-bl-sm shadow-[0_0_8px_#0080f2]" />
                  <div className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-[#0080f2] rounded-br-sm shadow-[0_0_8px_#0080f2]" />

                  {/* Animated Laser Line */}
                  {!isPaused && (
                    <div className="absolute left-2 right-2 h-0.5 bg-[#0080f2] shadow-[0_0_10px_#0080f2] top-1/2 -translate-y-1/2 opacity-90 animate-pulse" />
                  )}

                  {/* Status Pill Overlay */}
                  <div className="absolute -bottom-9 rounded-full bg-slate-900/90 px-3.5 py-1 text-[11px] font-medium text-slate-200 border border-slate-700/60 backdrop-blur-xs shadow-xs flex items-center gap-1.5">
                    {isProcessing ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                        <span>Mendecode QR Code...</span>
                      </>
                    ) : isPaused ? (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <span>Pemindaian Dijeda</span>
                      </>
                    ) : (
                      <>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Live Scanner Aktif — Arahkan ke QR</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Controls Bar: Fills 100% width and aligns with viewfinder */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/60 gap-3">
              <div className="flex items-center gap-2">
                {cameraActive ? (
                  <button
                    type="button"
                    onClick={handleTogglePause}
                    className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-medium transition shadow-xs ${
                      isPaused
                        ? "bg-[#0080f2] text-white hover:bg-[#0070d4]"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    }`}
                  >
                    {isPaused ? <Play size={14} /> : <Pause size={14} />}
                    <span>{isPaused ? "Lanjutkan Pemindaian" : "Jeda Pemindai"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanning(true);
                      startScanner();
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0080f2] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
                  >
                    <Camera size={14} />
                    <span>Aktifkan Kamera</span>
                  </button>
                )}

                {/* Turn off completely button */}
                {cameraActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsScanning(false);
                      stopScanner();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                    title="Matikan sensor kamera"
                  >
                    <VideoOff size={14} />
                    <span className="hidden sm:inline">Matikan</span>
                  </button>
                )}
              </div>

              {/* Hardware Controls: Flip, Flashlight, Audio feedback */}
              <div className="flex items-center gap-2">
                {/* Audio Feedback Toggle */}
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition shadow-xs ${
                    soundEnabled
                      ? "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : "border-slate-200 bg-slate-100 text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500"
                  }`}
                  title={soundEnabled ? "Suara Beep Aktif" : "Suara Beep Dibisukan"}
                  aria-label="Toggle Sound"
                >
                  {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                </button>

                {/* Flashlight / Torch (if device supports) */}
                {torchSupported && cameraActive && (
                  <button
                    type="button"
                    onClick={handleToggleTorch}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition shadow-xs ${
                      torchOn
                        ? "border-[#0080f2] bg-blue-50 text-[#0080f2] dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                    title="Lampu Flash"
                    aria-label="Lampu Flash"
                  >
                    <Flashlight size={15} />
                  </button>
                )}

                {/* Flip Camera (Environment / User) */}
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition shadow-xs"
                  title="Ganti Kamera Depan/Belakang"
                  aria-label="Ganti Kamera"
                >
                  <RefreshCw size={13} />
                  <span className="hidden sm:inline">
                    {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                  </span>
                </button>
              </div>
            </div>

            {/* Multiple camera devices switcher if available */}
            {cameraDevices.length > 1 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/40 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                  <SlidersHorizontal size={13} /> Pilih Lensa Kamera:
                </span>
                <select
                  value={selectedCameraId || ""}
                  onChange={(e) => setSelectedCameraId(e.target.value || null)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 outline-none"
                >
                  <option value="">Otomatis ({facingMode === "environment" ? "Belakang" : "Depan"})</option>
                  {cameraDevices.map((dev, idx) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Form Input Manual Kode Tiket: Fills 100% width */}
          <div
            id="manual"
            className="w-full rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-1">
              <Search size={16} className="text-[#0080f2]" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Input Manual Kode Tiket
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 font-normal">
              Gunakan opsi ini jika QR Code pengunjung tergores, layar ponsel retak, atau kamera tidak dapat membaca kode.
            </p>

            <form
              onSubmit={handleManualSubmit}
              className="flex flex-col sm:flex-row gap-2.5 w-full"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                placeholder="Masukkan kode tiket (cth: TWV-JKT-001889 atau TW-SF26-VIP-001)"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-mono uppercase text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2] dark:focus:bg-slate-900"
              />

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0070d4] transition shadow-xs shrink-0"
              >
                <ShieldCheck size={16} />
                <span>Validasi Tiket</span>
              </button>
            </form>

            {/* Contoh Kode Cepat */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="text-slate-400 font-normal">Contoh Format Tiket:</span>
              {[
                "TWV-JKT-001889",
                "TW-SF26-VIP-099",
                "TW-CANCEL-007",
                "TW-SF26-REG-042",
              ].map((sample) => (
                <button
                  key={sample}
                  type="button"
                  onClick={() => setManualCode(sample)}
                  className="rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1 font-mono text-[11px] font-normal text-slate-600 hover:border-[#0080f2] hover:text-[#0080f2] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#0080f2] dark:hover:text-[#0080f2] transition"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Real Scanned Output, Device Diagnostics, Gate Status & SOP (lg:col-span-5 xl:col-span-4) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          {/* Hasil Pembacaan QR Kamera Terkini Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#0080f2]" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Hasil Scan Kamera Terkini
                </h2>
              </div>
              {scannedResult && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50">
                  <CheckCircle2 size={11} /> Terbaca
                </span>
              )}
            </div>

            {scannedResult ? (
              <div className="space-y-3 pt-1">
                {/* Raw QR Text Display */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      String QR Ter-decode:
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {scannedResult.timestamp}
                    </span>
                  </div>
                  <p className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all select-all">
                    {scannedResult.rawCode}
                  </p>
                </div>

                {/* Backend Blocker Alert Notice */}
                <div className="rounded-lg border border-amber-200/80 bg-amber-50/70 p-3.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>Status Integrasi Backend: Belum Tersedia</span>
                  </div>
                  <p className="text-[11px] font-normal">
                    Kamera berhasil mendecode QR secara nyata. Namun, backend <code>TicketWave-BE</code> saat ini belum mengimplementasikan endpoint check-in tiket (<code>POST /api/scan</code>). Tiket ini belum tercatat masuk di database server.
                  </p>
                </div>

                {/* Parsed Local Ticket Data (if format matches) */}
                {scannedResult.ticket && (
                  <div className="rounded-lg border border-slate-100 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/20 space-y-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-1.5 dark:border-slate-800/60">
                      Rincian Identitas Tiket (Format Lokal)
                    </span>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Pemegang:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {scannedResult.ticket.attendee_name || "Pemegang Tiket"}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Kategori:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {scannedResult.ticket.ticket_type}
                      </span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Pintu Gate:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {scannedResult.ticket.gate || assignedGate}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-1 flex flex-col gap-2">
                  <Link
                    href={`/officer/validation?code=${encodeURIComponent(scannedResult.rawCode)}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
                  >
                    <ExternalLink size={14} />
                    <span>Buka Lembar Validasi Lengkap</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setScannedResult(null)}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                  >
                    <span>Bersihkan &amp; Siap Scan Berikutnya</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-800/20">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-2.5">
                  <Camera size={22} />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Menunggu Pemindaian QR Kamera
                </p>
                <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-normal">
                  Arahkan kamera ke layar ponsel penonton. Hasil pembacaan QR sungguhan akan langsung ditampilkan pada panel ini.
                </p>
              </div>
            )}
          </div>

          {/* Status Sensor & Perangkat Kamera (Live Diagnostics Card) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-slate-400" /> Diagnostik Perangkat
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                  cameraActive
                    ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    cameraActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                  }`}
                />
                {cameraActive ? "Sensor Live" : "Sensor Siaga"}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Izin Kamera:</span>
                <span className="font-semibold text-slate-900 dark:text-white capitalize">
                  {permissionState === "granted"
                    ? "Diizinkan (Granted)"
                    : permissionState === "denied"
                    ? "Ditolak (Denied)"
                    : "Meminta Izin (Prompt)"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Lensa Aktif:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {facingMode === "environment" ? "Kamera Belakang (Environment)" : "Kamera Depan (User)"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Secure Context:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Lock size={11} /> {secureContext ? "Aktif (Localhost/HTTPS)" : "Tidak Aman"}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Mesin Decoder:</span>
                <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                  html5-qrcode v2.3.8
                </span>
              </div>
            </div>
          </div>

          {/* Info Gate & Shift Aktif Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-400" /> Parameter Gate Hari Ini
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-[#0080f2] dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0080f2]" />
                Siap Melayani
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Pintu Gate:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {assignedGate}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Shift Petugas:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  {shiftText}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-400">Koordinator Lapangan:</span>
                <span className="font-medium text-slate-900 dark:text-white">
                  Dani Prasetyo (HT Ch 03)
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Progres Pengunjung:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  139 / 500 Masuk <span className="text-[11px] text-slate-400 font-normal">(28%)</span>
                </span>
              </div>
            </div>

            {/* Gate capacity progress bar */}
            <div className="pt-1">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full bg-[#0080f2] transition-all duration-300"
                  style={{ width: "28%" }}
                />
              </div>
            </div>
          </div>

          {/* Panduan Singkat Petugas Scanner (SOP) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Info size={14} className="text-[#0080f2]" /> Petunjuk Operasional Scanner (SOP)
            </span>
            <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <p className="flex items-start gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">1</span>
                <span>Pastikan penonton menampilkan QR Code resmi dari aplikasi TicketWave dengan kecerahan layar cukup.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">2</span>
                <span>Arahkan kamera ke tengah QR dengan jarak sekitar 15–20 cm hingga terdengar suara konfirmasi beep.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shrink-0">3</span>
                <span>Bila tiket valid secara format, pasangkan gelang wristband resmi sebelum penonton dipersilakan masuk.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
