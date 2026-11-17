"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function TicketQr({ value }) {
  const [image, setImage] = useState(null);
  const [failedValue, setFailedValue] = useState(null);
  useEffect(() => {
    let active = true;
    if (typeof value !== "string" || !value.trim()) return;
    QRCode.toDataURL(value, { width: 240, margin: 4, errorCorrectionLevel: "M" })
      .then((src) => { if (active) setImage({ value, src }); })
      .catch(() => { if (active) setFailedValue(value); });
    return () => { active = false; };
  }, [value]);
  if (typeof value !== "string" || !value.trim() || failedValue === value) return <p role="alert" className="text-xs text-slate-700">QR tidak tersedia. Gunakan kode tiket untuk pemeriksaan petugas.</p>;
  if (image?.value !== value) return <p className="text-xs text-slate-700">Menyiapkan QR...</p>;
  // A local data URL prevents sending ticket credentials to an external QR service.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={image.src} width={240} height={240} alt="QR tiket untuk pemeriksaan petugas" className="h-auto max-w-full" />;
}
