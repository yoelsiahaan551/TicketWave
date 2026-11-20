"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import {
  inspectTicketCodeAsync,
  formatTicketCodeForDisplay,
} from "@/app/lib/officerService";
import {
  Camera,
  Flashlight,
  RefreshCw,
  Search,
  CheckCircle2,
  ShieldCheck,
  VideoOff,
  MapPin,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SlidersHorizontal,
  Lock,
  Upload,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  XCircle,
  Ban,
  Ticket,
  User,
  Calendar,
  History,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Html5Qrcode } from "html5-qrcode";

function normalizeUtcIso(rawIso) {
  if (typeof rawIso !== "string" || !rawIso.trim()) return null;
  const trimmed = rawIso.trim();
  return /Z$|[+-]\d{2}:?\d{2}$/.test(trimmed) ? trimmed : `${trimmed}Z`;
}

export default function OfficerScanPage() {
  const { user } = useAuth();

  // Input manual state
  const [manualCode, setManualCode] = useState("");

  // Scanner & Camera state
  const [isScanning, setIsScanning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(true);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [cameraDevices, setCameraDevices] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [permissionState, setPermissionState] = useState("unknown");
  const [secureContext, setSecureContext] = useState(true);
  const [showCameraTech, setShowCameraTech] = useState(false);

  // Scanned / validated result state
  const [scannedResult, setScannedResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [fileScanError, setFileScanError] = useState(null);

  // Refs for scanner lifecycle and concurrency control
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);
  const validationRequestRef = useRef(0);
  const processingRef = useRef(false);
  const resultHeldRef = useRef(false);
  const lastScannedRef = useRef({ code: "", timestamp: 0 });
  const isStartingRef = useRef(false);
  const isMountedRef = useRef(true);
  const activeSessionIdRef = useRef(0);
  const handleQrDetectedRef = useRef(null);

  const assignedGate = user?.assigned_gate || "Belum dapat diverifikasi";

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

  // Unified server validation for camera scan, QR image upload, and manual code input
  const validateTicketCode = useCallback(
    async (rawCode, source = "camera") => {
      const cleanCode = typeof rawCode === "string" ? rawCode.trim() : "";
      if (!cleanCode) return;

      if (source === "camera") {
        if (processingRef.current || resultHeldRef.current) return;
        const now = Date.now();
        if (
          lastScannedRef.current.code === cleanCode &&
          now - lastScannedRef.current.timestamp < 3500
        ) {
          return;
        }
        lastScannedRef.current = { code: cleanCode, timestamp: now };

        if (
          typeof navigator !== "undefined" &&
          navigator.vibrate &&
          navigator.userActivation?.isActive
        ) {
          try {
            navigator.vibrate([80, 40, 80]);
          } catch {}
        }
        playBeepSound();
      } else {
        if (processingRef.current) return;
        setFileScanError(null);
        resultHeldRef.current = false;
        lastScannedRef.current = { code: cleanCode, timestamp: Date.now() };
        if (source === "file") {
          playBeepSound();
        }
      }

      setIsProcessing(true);
      processingRef.current = true;
      const request = ++validationRequestRef.current;
      setScannedResult(null);

      try {
        const ticketInfo = await inspectTicketCodeAsync(cleanCode);
        if (!isMountedRef.current || request !== validationRequestRef.current) return;
        resultHeldRef.current = true;
        setScannedResult({
          ...ticketInfo,
          rawCode: cleanCode,
          source,
          timestamp: new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });
      } finally {
        processingRef.current = false;
        if (isMountedRef.current) setIsProcessing(false);
      }
    },
    [playBeepSound]
  );

  // Sync ref for live camera callback
  useEffect(() => {
    handleQrDetectedRef.current = (decodedText) =>
      validateTicketCode(decodedText, "camera");
  }, [validateTicketCode]);

  // Stop all active MediaStream tracks on any video element in the QR container
  const stopAllMediaTracks = useCallback(() => {
    if (typeof document === "undefined") return;
    const container = document.getElementById("ticketwave-qr-reader");
    if (container) {
      const videos = container.querySelectorAll("video");
      videos.forEach((video) => {
        if (video.srcObject && typeof video.srcObject.getTracks === "function") {
          video.srcObject.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {}
          });
          video.srcObject = null;
        }
      });
    }
  }, []);

  // Stop camera scanner safely
  const stopScanner = useCallback(async () => {
    activeSessionIdRef.current++;
    isStartingRef.current = false;

    if (scannerRef.current) {
      const instance = scannerRef.current;
      scannerRef.current = null;
      try {
        if (instance.isScanning) {
          await instance.stop();
        }
      } catch (err) {
        console.warn("Scanner stop warning:", err);
      }
      try {
        instance.clear();
      } catch (err) {
        console.warn("Scanner clear warning:", err);
      }
    }

    stopAllMediaTracks();

    if (isMountedRef.current) {
      setCameraActive(false);
      setCameraLoading(false);
      setTorchOn(false);
    }
  }, [stopAllMediaTracks]);

  // Start HTML5 QR Code Scanner
  const startScanner = useCallback(async () => {
    if (isStartingRef.current) {
      return;
    }

    const sessionId = ++activeSessionIdRef.current;
    isStartingRef.current = true;
    setCameraLoading(true);
    setCameraError(null);

    if (scannerRef.current) {
      const prevInstance = scannerRef.current;
      scannerRef.current = null;
      try {
        if (prevInstance.isScanning) {
          await prevInstance.stop();
        }
      } catch {}
      try {
        prevInstance.clear();
      } catch {}
    }
    stopAllMediaTracks();

    if (sessionId !== activeSessionIdRef.current || !isMountedRef.current) {
      isStartingRef.current = false;
      return;
    }

    if (typeof window !== "undefined") {
      const isSec =
        window.isSecureContext ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      setSecureContext(isSec);
      if (!isSec) {
        setCameraError({
          type: "insecure",
          title: "Koneksi Tidak Aman untuk Kamera",
          message:
            "Buka melalui localhost atau HTTPS, atau gunakan Pindai Gambar QR / Input Manual.",
        });
        setCameraLoading(false);
        setCameraActive(false);
        isStartingRef.current = false;
        return;
      }
    }

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setCameraError({
        type: "unsupported",
        title: "Kamera Tidak Didukung Browser",
        message:
          "Browser ini tidak mendukung akses kamera langsung. Gunakan Pindai Gambar QR atau Input Manual.",
      });
      setCameraLoading(false);
      setCameraActive(false);
      isStartingRef.current = false;
      return;
    }

    const readerElement = document.getElementById("ticketwave-qr-reader");
    if (!readerElement) {
      setCameraLoading(false);
      setCameraActive(false);
      isStartingRef.current = false;
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.permissions?.query) {
        try {
          const perm = await navigator.permissions.query({ name: "camera" });
          if (isMountedRef.current) {
            setPermissionState(perm.state);
            perm.onchange = () => {
              if (isMountedRef.current) setPermissionState(perm.state);
            };
          }
        } catch {}
      }

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0 && isMountedRef.current) {
          setCameraDevices(devices);
        }
      } catch {}

      if (sessionId !== activeSessionIdRef.current || !isMountedRef.current) {
        isStartingRef.current = false;
        return;
      }

      const html5QrCode = new Html5Qrcode("ticketwave-qr-reader");
      scannerRef.current = html5QrCode;

      const cameraConfig = selectedCameraId
        ? { deviceId: { exact: selectedCameraId } }
        : { facingMode };

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
        async (decodedText) => {
          if (processingRef.current || resultHeldRef.current) return;
          if (handleQrDetectedRef.current) {
            handleQrDetectedRef.current(decodedText);
          }
        },
        () => {}
      );

      if (sessionId !== activeSessionIdRef.current || !isMountedRef.current) {
        try {
          if (html5QrCode.isScanning) await html5QrCode.stop();
        } catch {}
        try {
          html5QrCode.clear();
        } catch {}
        stopAllMediaTracks();
        return;
      }

      setCameraActive(true);
      setCameraLoading(false);
      setIsPaused(false);
      setPermissionState("granted");
      setCameraError(null);

      try {
        const capabilities = html5QrCode.getRunningTrackCameraCapabilities?.();
        if (capabilities && capabilities.torchFeature?.().isSupported()) {
          setTorchSupported(true);
        }
      } catch {}
    } catch (err) {
      console.warn("Camera startup error caught:", err);

      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {}
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
      stopAllMediaTracks();

      if (!isMountedRef.current || sessionId !== activeSessionIdRef.current) {
        return;
      }

      setCameraActive(false);
      setCameraLoading(false);

      const errName = err?.name || "";
      const errMsg = String(err?.message || err || "");
      const lowerMsg = (errName + " " + errMsg).toLowerCase();

      if (
        errName === "NotAllowedError" ||
        errName === "PermissionDeniedError" ||
        lowerMsg.includes("permission")
      ) {
        setPermissionState("denied");
        setCameraError({
          type: "denied",
          title: "Izin Kamera Ditolak",
          message:
            "Aktifkan izin kamera pada pengaturan browser untuk memindai langsung, atau gunakan Pindai Gambar QR / Input Manual.",
        });
      } else if (
        errName === "NotFoundError" ||
        errName === "DevicesNotFoundError" ||
        lowerMsg.includes("not found") ||
        lowerMsg.includes("no camera")
      ) {
        setCameraError({
          type: "not_found",
          title: "Kamera Tidak Ditemukan",
          message:
            "Tidak ada perangkat kamera aktif. Gunakan Pindai Gambar QR atau Input Manual di bawah.",
        });
      } else if (
        errName === "NotReadableError" ||
        errName === "TrackStartError" ||
        lowerMsg.includes("in use") ||
        lowerMsg.includes("could not start")
      ) {
        setCameraError({
          type: "in_use",
          title: "Kamera Sedang Digunakan",
          message:
            "Tutup aplikasi lain yang menggunakan webcam lalu coba lagi, atau gunakan Pindai Gambar QR / Input Manual.",
        });
      } else if (
        errName === "OverconstrainedError" ||
        errName === "ConstraintNotSatisfiedError" ||
        lowerMsg.includes("constraint")
      ) {
        setCameraError({
          type: "overconstrained",
          title: "Lensa Kamera Tidak Didukung",
          message:
            "Pengaturan kamera tidak cocok dengan perangkat ini. Beralih ke kamera depan atau pilih lensa lain.",
        });
      } else {
        setCameraError({
          type: "generic",
          title: "Kamera Gagal Diaktifkan",
          message:
            errMsg ||
            "Kendala mengaktifkan kamera. Gunakan Pindai Gambar QR atau Input Manual.",
        });
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [facingMode, selectedCameraId, stopAllMediaTracks]);

  const handleRetryScanner = useCallback(() => {
    setCameraError(null);
    setIsScanning(true);
    startScanner();
  }, [startScanner]);

  const handleFallbackCamera = () => {
    setSelectedCameraId(null);
    setFacingMode("user");
    setCameraError(null);
    setIsScanning(true);
  };

  useEffect(() => {
    isMountedRef.current = true;

    const timer = setTimeout(() => {
      if (isScanning) startScanner();
      else stopScanner();
    }, 0);

    return () => {
      clearTimeout(timer);
      isMountedRef.current = false;
      stopScanner();
    };
  }, [isScanning, facingMode, selectedCameraId, startScanner, stopScanner]);

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

  const handleFlipCamera = () => {
    setSelectedCameraId(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

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

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCode.trim() || isProcessing) return;
    await validateTicketCode(manualCode, "manual");
  };

  const handleScanImageFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setFileScanError(null);
    setIsDecodingFile(true);
    let fileScanner = null;
    try {
      fileScanner = new Html5Qrcode("ticketwave-qr-file-reader");
      const decodedText = await fileScanner.scanFile(file, false);
      await validateTicketCode(decodedText, "file");
    } catch {
      setFileScanError(
        "QR tidak terbaca dari gambar tersebut. Pastikan gambar QR TicketWave utuh dan kontras jelas."
      );
    } finally {
      try {
        fileScanner?.clear();
      } catch {}
      if (isMountedRef.current) setIsDecodingFile(false);
    }
  };

  const handleResetResult = () => {
    validationRequestRef.current++;
    resultHeldRef.current = false;
    lastScannedRef.current = { code: "", timestamp: 0 };
    setScannedResult(null);
    setManualCode("");
    setFileScanError(null);
  };

  const isResultValid =
    scannedResult?.status === "VALID" && Boolean(scannedResult?.server_verified);
  const isResultUsed = scannedResult?.status === "SUDAH DIGUNAKAN";
  const isResultCancelled = scannedResult?.status === "DIBATALKAN";
  const normalizedFirstCheckInAt = normalizeUtcIso(scannedResult?.first_checked_in_at);

  const validationTargetHref = scannedResult
    ? `/officer/validation?code=${encodeURIComponent(
        scannedResult.ticket?.ticket_code || scannedResult.rawCode
      )}`
    : "/officer/scan";

  return (
    <div className="w-full max-w-none min-w-0 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            Scan &amp; Validasi Tiket
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-normal">
            Pindai QR melalui kamera, unggah gambar QR, atau masukkan kode tiket secara manual untuk memvalidasi sebelum check-in.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {cameraActive ? "Kamera aktif" : cameraLoading ? "Memuat kamera..." : "Kamera siaga"}
          </span>
          <Link
            href="/officer/history"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            <History size={14} />
            <span>Riwayat Check-in</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Camera Focus (Left) + Latest Validation Result (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-none">
        {/* Left Column: Primary Camera Scanner + Manual Input Alternative */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6 min-w-0">
          {/* Primary Camera Viewfinder Card */}
          <div className="w-full overflow-hidden rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs">
            <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
              <div
                id="ticketwave-qr-reader"
                className={`absolute inset-0 h-full w-full ${
                  cameraActive && !cameraError ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              />
              <div id="ticketwave-qr-file-reader" className="hidden" aria-hidden="true" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/*"
                onChange={handleScanImageFile}
                aria-label="Unggah gambar QR tiket"
                className="hidden"
              />

              {cameraLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/90 text-white p-6 text-center backdrop-blur-xs">
                  <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-700 border-t-[#0080f2] mb-3" />
                  <p className="text-sm font-semibold text-slate-200">
                    Menghubungkan ke Kamera...
                  </p>
                </div>
              )}

              {!cameraActive && !cameraLoading && (
                <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-900/95 p-6 text-center text-white backdrop-blur-xs">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl mb-3 ${
                      cameraError && cameraError.type !== "denied"
                        ? "bg-red-950/60 text-red-400 border border-red-900/50"
                        : "bg-slate-800 text-slate-200 border border-slate-700/60"
                    }`}
                  >
                    {cameraError && cameraError.type !== "denied" ? (
                      <Camera size={22} />
                    ) : (
                      <Lock size={22} className="text-slate-300" />
                    )}
                  </div>

                  <p className="text-sm font-semibold text-slate-200">
                    {cameraError ? cameraError.title : "Kamera Nonaktif"}
                  </p>

                  <p className="mt-1.5 text-xs text-slate-300 max-w-md leading-relaxed font-normal">
                    {cameraError
                      ? cameraError.message
                      : "Aktifkan kamera untuk memindai QR, atau gunakan Pindai Gambar QR / Input Manual."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleRetryScanner}
                      disabled={cameraLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0080f2] px-4 py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs disabled:opacity-50"
                    >
                      <RotateCcw size={14} className={cameraLoading ? "animate-spin" : ""} />
                      <span>{cameraLoading ? "Menghubungkan..." : "Aktifkan Kamera"}</span>
                    </button>

                    {cameraError?.type === "overconstrained" && (
                      <button
                        type="button"
                        onClick={handleFallbackCamera}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
                      >
                        <Camera size={14} />
                        <span>Kamera Depan</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isDecodingFile}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/50 bg-blue-950/60 px-4 py-2 text-xs font-medium text-blue-200 hover:bg-blue-900/70 transition disabled:opacity-50"
                    >
                      <Upload size={14} />
                      <span>{isDecodingFile ? "Membaca QR..." : "Pindai Gambar QR"}</span>
                    </button>
                  </div>
                </div>
              )}

              {cameraActive && !cameraError && (
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="relative flex h-48 w-48 sm:h-60 sm:w-60 md:h-64 md:w-64 items-center justify-center">
                    <div className="absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#0080f2] rounded-tl-sm shadow-[0_0_8px_#0080f2]" />
                    <div className="absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#0080f2] rounded-tr-sm shadow-[0_0_8px_#0080f2]" />
                    <div className="absolute bottom-0 left-0 h-6 w-6 border-l-2 border-b-2 border-[#0080f2] rounded-bl-sm shadow-[0_0_8px_#0080f2]" />
                    <div className="absolute right-0 bottom-0 h-6 w-6 border-r-2 border-b-2 border-[#0080f2] rounded-br-sm shadow-[0_0_8px_#0080f2]" />

                    {!isPaused && (
                      <div className="absolute left-2 right-2 h-0.5 bg-[#0080f2] shadow-[0_0_10px_#0080f2] top-1/2 -translate-y-1/2 opacity-90 animate-pulse" />
                    )}

                    <div className="absolute -bottom-9 rounded-full bg-slate-900/90 px-3.5 py-1 text-[11px] font-medium text-slate-200 border border-slate-700/60 backdrop-blur-xs shadow-xs flex items-center gap-1.5 whitespace-nowrap">
                      {isProcessing ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                          <span>Memvalidasi Tiket...</span>
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
                </div>
              )}
            </div>

            {/* Camera Controls Bar */}
            <div className="flex flex-wrap items-center justify-between border-t border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-3.5 dark:border-slate-800 dark:bg-slate-900/60 gap-3">
              <div className="flex flex-wrap items-center gap-2">
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
                    onClick={handleRetryScanner}
                    disabled={cameraLoading}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0080f2] px-3.5 py-2 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs disabled:opacity-50"
                  >
                    <Camera size={14} />
                    <span>{cameraLoading ? "Menghubungkan..." : "Aktifkan Kamera"}</span>
                  </button>
                )}

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

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isDecodingFile || isProcessing}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition disabled:opacity-50"
                >
                  <Upload size={14} />
                  <span>{isDecodingFile ? "Membaca..." : "Pindai Gambar QR"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
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

            {fileScanError && (
              <div
                role="alert"
                className="border-t border-rose-200/70 bg-rose-50/80 px-4 sm:px-6 py-2.5 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300"
              >
                {fileScanError}
              </div>
            )}

            {cameraDevices.length > 1 && (
              <div className="border-t border-slate-100 bg-slate-50/50 px-4 sm:px-6 py-2.5 dark:border-slate-800/80 dark:bg-slate-900/40 flex items-center justify-between text-xs gap-3">
                <label
                  htmlFor="officer-camera-lens"
                  className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium shrink-0"
                >
                  <SlidersHorizontal size={13} />
                  <span>Pilih Lensa Kamera:</span>
                </label>
                <select
                  id="officer-camera-lens"
                  value={selectedCameraId || ""}
                  onChange={(e) => setSelectedCameraId(e.target.value || null)}
                  className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 outline-none max-w-xs truncate"
                >
                  <option value="">
                    Otomatis ({facingMode === "environment" ? "Belakang" : "Depan"})
                  </option>
                  {cameraDevices.map((dev, idx) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Single Manual Input Alternative */}
          <div
            id="manual"
            className="w-full rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs"
          >
            <div className="flex items-center gap-2 mb-1">
              <Search size={16} className="text-[#0080f2]" />
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Input Kode Manual
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3.5 font-normal">
              Alternatif apabila kamera tidak dapat membaca QR Code pengunjung.
            </p>

            <form
              onSubmit={handleManualSubmit}
              className="flex flex-col sm:flex-row gap-2.5 w-full"
            >
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                disabled={isProcessing}
                placeholder="Masukkan kode tiket (cth: TKT-...) atau token QR"
                autoCapitalize="none"
                autoCorrect="off"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-mono text-slate-900 placeholder:normal-case placeholder:font-sans placeholder:text-slate-400 focus:border-[#0080f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0080f2] dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-[#0080f2] dark:focus:ring-[#0080f2] dark:focus:bg-slate-900 disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={isProcessing || !manualCode.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#0070d4] transition shadow-xs shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ShieldCheck size={16} />
                <span>{isProcessing ? "Memvalidasi..." : "Validasi Kode"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Latest Scan & Validation Result + Collapsible Technical Info */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6 min-w-0">
          {/* Latest Scan Result Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Hasil Scan &amp; Validasi Terbaru
              </h2>
              {scannedResult && (
                <span className="font-mono text-[11px] text-slate-400">
                  {scannedResult.timestamp}
                </span>
              )}
            </div>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0080f2]" />
                <p role="status" className="mt-2.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                  Memvalidasi tiket ke server...
                </p>
              </div>
            ) : scannedResult ? (
              <div className="space-y-3.5">
                {/* Masked / Ticket Identifier */}
                <div className="rounded-lg border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/40 flex items-center justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400">
                    Kode Tiket
                  </span>
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-white break-all text-right">
                    {formatTicketCodeForDisplay(
                      scannedResult.rawCode,
                      scannedResult.ticket?.ticket_code
                    )}
                  </span>
                </div>

                {/* Validation Status Box */}
                <div
                  role={isResultValid ? "status" : "alert"}
                  className={`rounded-xl border p-4 space-y-1.5 ${
                    isResultValid
                      ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : isResultUsed
                      ? "border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200"
                      : isResultCancelled
                      ? "border-slate-300 bg-slate-100 text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                      : "border-rose-200 bg-rose-50/80 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-xs uppercase tracking-wider">
                    {isResultValid ? (
                      <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : isResultUsed ? (
                      <AlertTriangle size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
                    ) : isResultCancelled ? (
                      <Ban size={16} className="shrink-0 text-slate-500" />
                    ) : (
                      <XCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>{scannedResult.status}</span>
                  </div>
                  <p className="text-xs leading-relaxed">
                    {scannedResult.message}
                  </p>
                  {isResultUsed && normalizedFirstCheckInAt && (
                    <p className="text-[11px] pt-1 flex items-center gap-1.5 font-medium">
                      <Clock size={12} className="shrink-0" />
                      <span>
                        Check-in pertama:{" "}
                        {new Date(normalizedFirstCheckInAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        WIB
                        {scannedResult.first_checked_in_by
                          ? ` oleh ${scannedResult.first_checked_in_by}`
                          : ""}
                      </span>
                    </p>
                  )}
                </div>

                {/* Ticket Summary (shown when server returned ticket data) */}
                {scannedResult.ticket && (
                  <div className="rounded-lg border border-slate-100 bg-white p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/20 space-y-2">
                    <div className="flex items-start justify-between gap-2 py-0.5">
                      <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                        <Calendar size={12} /> Event
                      </span>
                      <span className="font-medium text-slate-900 dark:text-white text-right">
                        {scannedResult.ticket.event_name || "—"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 py-0.5">
                      <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                        <Ticket size={12} /> Kategori
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-right">
                        {scannedResult.ticket.ticket_type || "—"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 py-0.5">
                      <span className="text-slate-400 flex items-center gap-1.5 shrink-0">
                        <User size={12} /> Pemilik
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-right">
                        {scannedResult.ticket.attendee_name || "Pemegang Tiket"}
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-2 py-0.5">
                      <span className="text-slate-400">Status</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {isResultValid
                          ? "Valid / Siap Check-in"
                          : scannedResult.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-1 flex flex-col gap-2">
                  {isResultValid && (
                    <Link
                      href={validationTargetHref}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0080f2] px-4 py-2.5 text-xs font-medium text-white hover:bg-[#0070d4] transition shadow-xs"
                    >
                      <span>Lanjutkan Konfirmasi Check-in</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}

                  {isResultUsed && scannedResult.ticket?.ticket_code && (
                    <Link
                      href={validationTargetHref}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200 transition"
                    >
                      <span>Lihat Rincian Tiket</span>
                      <ArrowRight size={13} />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={handleResetResult}
                    className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                  >
                    <span>Bersihkan &amp; Scan Berikutnya</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-6 text-center dark:border-slate-800 dark:bg-slate-800/20">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-2.5">
                  <Camera size={20} />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Belum ada tiket dipindai
                </p>
                <p className="mt-1 text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed font-normal">
                  Arahkan kamera ke QR, unggah gambar QR, atau masukkan kode manual.
                </p>
              </div>
            )}
          </div>

          {/* Collapsible Technical Camera Info Card */}
          <div className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-xs overflow-hidden">
            <button
              type="button"
              onClick={() => setShowCameraTech((prev) => !prev)}
              aria-expanded={showCameraTech}
              className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-slate-400 shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Informasi Teknis Kamera
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                    cameraActive
                      ? "border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {cameraActive ? "Sensor Live" : "Sensor Siaga"}
                </span>
                {showCameraTech ? (
                  <ChevronUp size={15} className="text-slate-400" />
                ) : (
                  <ChevronDown size={15} className="text-slate-400" />
                )}
              </div>
            </button>

            {showCameraTech && (
              <div className="border-t border-slate-100 px-5 py-3.5 space-y-2 text-xs dark:border-slate-800">
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Izin Kamera</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {permissionState === "granted"
                      ? "Diizinkan"
                      : permissionState === "denied"
                      ? "Ditolak"
                      : "Prompt"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Lensa Aktif</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    {facingMode === "environment" ? "Kamera Belakang" : "Kamera Depan"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Secure Context</span>
                  <span className="font-medium text-slate-900 dark:text-white flex items-center gap-1">
                    <Lock size={11} className="text-emerald-600" />
                    {secureContext ? "Aktif" : "Tidak Aman"}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">Decoder</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                    html5-qrcode
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin size={11} /> Gate
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                    {assignedGate}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
