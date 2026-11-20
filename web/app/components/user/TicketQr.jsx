"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function TicketQr({
  value,
  ticketCode = "",
  size = 240,
  showCode = true,
}) {
  const [image, setImage] = useState(null);
  const [failedValue, setFailedValue] = useState(null);

  const normalizedValue = typeof value === "string" ? value.trim() : "";

  useEffect(() => {
    let active = true;
    if (!normalizedValue) return;

    QRCode.toDataURL(normalizedValue, {
      width: size,
      margin: 4,
      errorCorrectionLevel: "M",
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    })
      .then((src) => {
        if (active) setImage({ value: normalizedValue, src });
      })
      .catch(() => {
        if (active) setFailedValue(normalizedValue);
      });

    return () => {
      active = false;
    };
  }, [normalizedValue, size]);

  if (!normalizedValue || failedValue === normalizedValue) {
    return (
      <p role="alert" className="text-xs text-slate-700">
        QR tidak tersedia. Gunakan kode tiket untuk pemeriksaan petugas.
      </p>
    );
  }

  if (image?.value !== normalizedValue) {
    return (
      <div
        style={{ width: size, height: size }}
        className="flex max-w-full items-center justify-center rounded-lg bg-white text-xs text-slate-700"
      >
        Menyiapkan QR...
      </div>
    );
  }

  return (
    <div className="inline-flex max-w-full flex-col items-center rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* A local data URL prevents sending ticket credentials to an external QR service. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        data-testid="ticket-qr-image"
        src={image.src}
        width={size}
        height={size}
        alt="QR tiket resmi untuk pemeriksaan petugas"
        className="block h-auto max-w-full bg-white"
      />
      {showCode && ticketCode && (
        <p
          data-testid="ticket-qr-code-label"
          className="mt-2.5 text-center font-mono text-xs font-bold tracking-wider text-slate-900"
        >
          {ticketCode}
        </p>
      )}
    </div>
  );
}
