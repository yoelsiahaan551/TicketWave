/**
 * TicketWave - Officer Service & Mock Database
 * 
 * Mengelola data operasional petugas, simulasi scanner QR, validasi tiket,
 * dan riwayat check-in gate secara lokal (Demo Mode).
 */

const STORAGE_KEY_OFFICER_HISTORY = 'ticketwave_officer_history';

// Basis data tiket awal untuk pengujian operasional lapangan
export const INITIAL_TICKETS = [
  {
    ticket_code: "TWV-JKT-001889",
    booking_code: "TW-202611-90021",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "VIP Pass",
    seat_section: "VIP Section A1",
    attendee_name: "Ahmad Rizky Pratama",
    attendee_email: "ahmad.rizky@example.com",
    gate: "Gate A - VIP & Early Bird",
    status: "valid", // 'valid', 'used', 'invalid'
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    ticket_code: "TWV-JKT-001890",
    booking_code: "TW-202611-90021",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "VIP Pass",
    seat_section: "VIP Section A2",
    attendee_name: "Siti Nurhaliza",
    attendee_email: "siti.nur@example.com",
    gate: "Gate A - VIP & Early Bird",
    status: "valid",
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    ticket_code: "TW-SF26-VIP-001",
    booking_code: "TW-202611-10045",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "VIP Pass + Backstage",
    seat_section: "Diamond Lounge",
    attendee_name: "Budi Dharmawan",
    attendee_email: "budi.dharma@example.com",
    gate: "Gate A - VIP & Early Bird",
    status: "valid",
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    ticket_code: "TW-SF26-REG-042",
    booking_code: "TW-202611-30018",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "Regular Standing",
    seat_section: "Festival B",
    attendee_name: "Dewi Lestari",
    attendee_email: "dewi.lestari@example.com",
    gate: "Gate B - Regular Entry",
    status: "valid",
    checked_in_at: null,
    checked_in_by: null,
  },
  {
    ticket_code: "TW-SF26-VIP-099",
    booking_code: "TW-202611-40092",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "VIP Pass",
    seat_section: "VIP Section B",
    attendee_name: "Farhan Mahendra",
    attendee_email: "farhan.m@example.com",
    gate: "Gate A - VIP & Early Bird",
    status: "used",
    checked_in_at: "2026-12-20T16:45:12.000Z",
    checked_in_by: "Petugas Scanner 02 (Gate A)",
  },
  {
    ticket_code: "TW-SF26-REG-105",
    booking_code: "TW-202611-50112",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "Regular Festival",
    seat_section: "Festival A",
    attendee_name: "Rian Aditya",
    attendee_email: "rian.adit@example.com",
    gate: "Gate B - Regular Entry",
    status: "used",
    checked_in_at: "2026-12-20T17:10:04.000Z",
    checked_in_by: "Petugas Scanner 03 (Gate B)",
  },
  {
    ticket_code: "TW-CANCEL-007",
    booking_code: "TW-202611-99881",
    event_name: "Soundfest Jakarta 2026",
    venue: "Gelora Bung Karno Senayan",
    event_date: "2026-12-20",
    ticket_type: "VIP Pass",
    seat_section: "VIP Section A3",
    attendee_name: "Rizky Dwi Chandra (Refund)",
    attendee_email: "rizky.dc@example.com",
    gate: "Gate A - VIP & Early Bird",
    status: "cancelled",
    cancelled_reason: "Pesanan dibatalkan (Refund telah diproses)",
  },
];

// Riwayat awal check-in
const INITIAL_HISTORY = [
  {
    id: "CHK-001",
    ticket_code: "TW-SF26-REG-105",
    booking_code: "TW-202611-50112",
    attendee_name: "Rian Aditya",
    ticket_type: "Regular Festival",
    gate: "Gate B - Regular Entry",
    status: "VALID", // 'VALID', 'SUDAH DIGUNAKAN', 'TIDAK VALID', 'DIBATALKAN'
    result: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    officer_name: "Petugas Scanner",
    notes: "Masuk Gate B dengan lancar",
  },
  {
    id: "CHK-002",
    ticket_code: "TW-SF26-VIP-099",
    booking_code: "TW-202611-40092",
    attendee_name: "Farhan Mahendra",
    ticket_type: "VIP Pass",
    gate: "Gate A - VIP & Early Bird",
    status: "VALID",
    result: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    officer_name: "Petugas Scanner",
    notes: "Gelang VIP & Lanyard diserahkan",
  },
  {
    id: "CHK-003",
    ticket_code: "TW-SF26-VIP-099",
    booking_code: "TW-202611-40092",
    attendee_name: "Farhan Mahendra (Percobaan Ulang)",
    ticket_type: "VIP Pass",
    gate: "Gate A - VIP & Early Bird",
    status: "SUDAH DIGUNAKAN",
    result: "rejected",
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    officer_name: "Petugas Scanner",
    notes: "QR scan ganda terdeteksi (tiket sudah masuk sebelumnya)",
  },
  {
    id: "CHK-004",
    ticket_code: "INVALID-CODE-999",
    booking_code: "-",
    attendee_name: "Tidak Dikenal",
    ticket_type: "-",
    gate: "Gate A - VIP & Early Bird",
    status: "TIDAK VALID",
    result: "rejected",
    timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    officer_name: "Petugas Scanner",
    notes: "Kode tiket tidak ditemukan dalam basis data sistem",
  },
  {
    id: "CHK-005",
    ticket_code: "TW-CANCEL-007",
    booking_code: "TW-202611-99881",
    attendee_name: "Rizky Dwi Chandra",
    ticket_type: "VIP Pass",
    gate: "Gate A - VIP & Early Bird",
    status: "DIBATALKAN",
    result: "rejected",
    timestamp: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
    officer_name: "Petugas Scanner",
    notes: "Tiket ditolak: Status tiket dibatalkan / refund",
  },
];

/**
 * Ambil riwayat check-in dari localStorage atau gunakan riwayat awal
 */
export function getOfficerHistory() {
  if (typeof window === 'undefined') return [...INITIAL_HISTORY];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OFFICER_HISTORY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY_OFFICER_HISTORY, JSON.stringify(INITIAL_HISTORY));
  } catch {
    // fallback
  }
  return [...INITIAL_HISTORY];
}

/**
 * Simpan riwayat check-in baru
 */
export function addOfficerCheckInRecord(record) {
  if (typeof window === 'undefined') return record;
  try {
    const current = getOfficerHistory();
    const newRecord = {
      id: `CHK-${Date.now().toString().slice(-6)}`,
      timestamp: new Date().toISOString(),
      ...record,
    };
    const updated = [newRecord, ...current];
    localStorage.setItem(STORAGE_KEY_OFFICER_HISTORY, JSON.stringify(updated));
    return newRecord;
  } catch {
    return record;
  }
}

/**
 * Hitung statistik check-in petugas
 */
export function getOfficerStats() {
  const history = getOfficerHistory();
  const total = history.length;
  const success = history.filter(h => h.status === 'VALID' || h.result === 'success').length;
  const rejected = history.filter(h => h.status === 'SUDAH DIGUNAKAN' || h.status === 'TIDAK VALID' || h.result === 'rejected').length;

  return {
    total_inspected: 142 + total - INITIAL_HISTORY.length,
    success_count: 138 + success - 2, // baseline + dynamic
    rejected_count: 4 + rejected - 2,
    active_event: "Soundfest Jakarta 2026",
    active_venue: "Gelora Bung Karno Senayan",
    assigned_gate: "Gate A - VIP & Early Bird",
    shift_hours: "15:00 - 23:00 WIB",
    gate_quota: 500,
  };
}

/**
 * Cari dan validasi tiket berdasarkan kode
 */
export function inspectTicketCode(rawCode) {
  if (!rawCode) {
    return {
      status: "TIDAK VALID",
      message: "Kode tiket tidak boleh kosong.",
      ticket: null,
    };
  }

  const code = rawCode.trim().toUpperCase();

  // 1. Cek riwayat lokal untuk tiket yang sudah di-check in
  const history = getOfficerHistory();
  const alreadyCheckedIn = history.find(
    h => h.ticket_code?.toUpperCase() === code && (h.status === 'VALID' || h.result === 'success')
  );

  // 2. Cari di daftar tiket master
  const masterTicket = INITIAL_TICKETS.find(t => t.ticket_code.toUpperCase() === code);

  // Kasus DIBATALKAN
  if (masterTicket?.status === 'cancelled' || code.includes("CANCEL")) {
    return {
      status: "DIBATALKAN",
      code,
      message: "Tiket ini telah DIBATALKAN oleh pihak penyelenggara atau melalui pembatalan transaksi (Refund). Tiket tidak berlaku.",
      ticket: masterTicket || {
        ticket_code: code,
        booking_code: "TW-VOID-99881",
        event_name: "Soundfest Jakarta 2026",
        venue: "Gelora Bung Karno Senayan",
        event_date: "2026-12-20",
        ticket_type: "VIP Pass (Dibatalkan)",
        seat_section: "VIP Section A3",
        attendee_name: "Rizky Dwi Chandra (Refund)",
        attendee_email: "rizky.dc@example.com",
        gate: "Gate A - VIP & Early Bird",
        status: "cancelled",
        cancelled_reason: "Pesanan dibatalkan (Refund telah diproses)",
      },
    };
  }

  // Kasus SUDAH DIGUNAKAN
  if (alreadyCheckedIn || masterTicket?.status === 'used') {
    const checkInTime = alreadyCheckedIn ? alreadyCheckedIn.timestamp : masterTicket?.checked_in_at;
    const officer = alreadyCheckedIn ? alreadyCheckedIn.officer_name : masterTicket?.checked_in_by || "Petugas Gate";
    return {
      status: "SUDAH DIGUNAKAN",
      code,
      message: "Peringatan! Tiket ini sudah pernah digunakan untuk check-in sebelumnya.",
      ticket: masterTicket || {
        ticket_code: code,
        attendee_name: alreadyCheckedIn?.attendee_name || "Pemegang Tiket",
        ticket_type: alreadyCheckedIn?.ticket_type || "Tiket Masuk",
        event_name: "Soundfest Jakarta 2026",
        gate: alreadyCheckedIn?.gate || "Gate A - VIP & Early Bird",
      },
      first_checked_in_at: checkInTime,
      first_checked_in_by: officer,
    };
  }

  // Kasus VALID
  if (masterTicket) {
    return {
      status: "VALID",
      code,
      message: "Tiket terverifikasi asli dan belum pernah digunakan. Siap untuk check-in.",
      ticket: masterTicket,
    };
  }

  // Jika berformat TW-* atau TWV-* tetapi belum di master, kita perlakukan sebagai tiket baru yang valid untuk fleksibilitas demo
  if (code.startsWith("TW-") || code.startsWith("TWV-")) {
    return {
      status: "VALID",
      code,
      message: "Tiket berhasil diverifikasi secara sistem (Format Tiket Resmi).",
      ticket: {
        ticket_code: code,
        booking_code: `BK-${code.replace(/[^A-Z0-9]/g, '')}`,
        event_name: "Soundfest Jakarta 2026",
        venue: "Gelora Bung Karno Senayan",
        event_date: "2026-12-20",
        ticket_type: code.includes("VIP") ? "VIP Pass" : "Regular Pass",
        seat_section: code.includes("VIP") ? "VIP Gate Area" : "General Admission",
        attendee_name: "Tamu Terdaftar",
        attendee_email: "tamu@ticketwave.id",
        gate: "Gate A - VIP & Early Bird",
        status: "valid",
      },
    };
  }

  // Kasus TIDAK VALID
  return {
    status: "TIDAK VALID",
    code,
    message: "Kode tiket tidak ditemukan dalam database atau telah dibatalkan.",
    ticket: null,
  };
}

/**
 * Eksekusi Check-in resmi
 */
export function executeCheckIn(ticket, officerName = "Petugas Scanner", gate = "Gate A - VIP & Early Bird") {
  const result = inspectTicketCode(ticket?.ticket_code || ticket);

  if (result.status === "VALID") {
    // Catat ke riwayat
    const record = addOfficerCheckInRecord({
      ticket_code: result.ticket.ticket_code,
      booking_code: result.ticket.booking_code || "-",
      attendee_name: result.ticket.attendee_name || "Pemegang Tiket",
      ticket_type: result.ticket.ticket_type || "Tiket Reguler",
      gate: gate,
      status: "VALID",
      result: "success",
      officer_name: officerName,
      notes: "Check-in berhasil via Portal Petugas",
    });

    return {
      success: true,
      status: "VALID",
      message: "Check-in berhasil dikonfirmasi! Pengunjung dipersilakan masuk.",
      record,
      ticket: result.ticket,
    };
  } else if (result.status === "SUDAH DIGUNAKAN") {
    addOfficerCheckInRecord({
      ticket_code: result.code,
      booking_code: result.ticket?.booking_code || "-",
      attendee_name: result.ticket?.attendee_name || "Pemegang Tiket",
      ticket_type: result.ticket?.ticket_type || "-",
      gate: gate,
      status: "SUDAH DIGUNAKAN",
      result: "rejected",
      officer_name: officerName,
      notes: "Ditolak: Tiket terdeteksi sudah pernah check-in",
    });

    return {
      success: false,
      status: "SUDAH DIGUNAKAN",
      message: "Check-in ditolak! Tiket sudah digunakan sebelumnya.",
      ticket: result.ticket,
    };
  } else {
    addOfficerCheckInRecord({
      ticket_code: result.code,
      booking_code: "-",
      attendee_name: "Tidak Dikenal",
      ticket_type: "-",
      gate: gate,
      status: "TIDAK VALID",
      result: "rejected",
      officer_name: officerName,
      notes: "Ditolak: Kode tiket tidak terdaftar",
    });

    return {
      success: false,
      status: "TIDAK VALID",
      message: "Check-in gagal! Kode tiket tidak valid.",
      ticket: null,
    };
  }
}

/**
 * Daftar event yang ditugaskan ke petugas ini
 */
export function getAssignedEvents() {
  return [
    {
      id: "EVT-SF26",
      name: "Soundfest Jakarta 2026",
      date: "20 Desember 2026",
      time: "15:00 - 23:00 WIB",
      venue: "Gelora Bung Karno Senayan (Plaza Barat)",
      assigned_gate: "Gate A - VIP & Early Bird",
      shift: "Shift Sore (15:00 - 23:00 WIB)",
      status: "ACTIVE", // 'ACTIVE', 'UPCOMING', 'COMPLETED'
      coordinator: "Dani Prasetyo (0812-9988-7711)",
      channel: "Channel 03 (Gate Team)",
      quota_checked: 138,
      quota_total: 500,
      notes: "Prioritaskan pengecekan wristband VIP dan pembagian lanyard penonton.",
    },
    {
      id: "EVT-JAZZ27",
      name: "Jazz Under The Stars 2026",
      date: "15 Januari 2027",
      time: "16:00 - 22:00 WIB",
      venue: "Hutan Kota GBK Senayan",
      assigned_gate: "Gate 2 - Regular Entry",
      shift: "Shift Sore (15:00 - 22:00 WIB)",
      status: "UPCOMING",
      coordinator: "Maya Anggraini (0813-2211-4455)",
      channel: "Channel 02",
      quota_checked: 0,
      quota_total: 600,
      notes: "Pemeriksaan tiket reguler dan scan barcode e-voucher.",
    },
    {
      id: "EVT-INDIE27",
      name: "Indie Ground Festival 2026",
      date: "28 Februari 2027",
      time: "13:00 - 23:00 WIB",
      venue: "Gambir Expo Kemayoran",
      assigned_gate: "Gate C - Festival Standing",
      shift: "Shift Siang-Malam (12:00 - 23:00 WIB)",
      status: "UPCOMING",
      coordinator: "Bambang Sudiro (0811-3344-5566)",
      channel: "Channel 05",
      quota_checked: 0,
      quota_total: 1000,
      notes: "Pintu masuk penonton festival & body checking tas bawaan.",
    },
  ];
}
