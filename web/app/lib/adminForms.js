export function validateEventCreate(payload) {
  const length = (value, min, max) => typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
  if (!Number.isInteger(payload.agency_id) || payload.agency_id < 1 || !length(payload.name, 3, 200) || !length(payload.venue, 3, 200) || !length(payload.city, 2, 100)) {
    throw new Error('Periksa agency, nama event (3–200), venue (3–200), dan kota (2–100 karakter).');
  }
  if (payload.event_type === 'single') {
    if (!length(payload.artist_name, 2, 200) || !payload.event_date || !payload.event_time) throw new Error('Lengkapi artis, tanggal, dan waktu event.');
  } else if (payload.event_type === 'festival') {
    if (!Number.isInteger(payload.days_count) || payload.days_count < 1 || payload.days_count > 10 || !payload.festival_artists?.length || payload.festival_artists.some(a => !length(a.artist_name, 2, 150) || !Number.isInteger(a.day_number) || a.day_number < 1 || a.day_number > payload.days_count)) throw new Error('Lengkapi lineup dan hari festival (1–10 hari).');
  } else throw new Error('Tipe event tidak valid.');
  for (const ticket of payload.ticket_types || []) {
    if (!length(ticket.name, 2, 100) || !Number.isFinite(ticket.base_price) || ticket.base_price < 0 || !Number.isInteger(ticket.quota) || ticket.quota < 1) throw new Error('Lengkapi kategori tiket, harga minimal 0, dan kuota bilangan bulat minimal 1.');
    const phases = [...(ticket.phases || [])].sort((a, b) => a.start_date.localeCompare(b.start_date));
    phases.forEach((phase, index) => {
      if (!['early_bird', 'presale', 'normal'].includes(phase.phase_name) || !phase.start_date || !phase.end_date || phase.start_date >= phase.end_date || !Number.isFinite(phase.discount_percent) || phase.discount_percent < 0 || phase.discount_percent > 100) throw new Error('Lengkapi fase tiket: tanggal akhir setelah tanggal mulai, diskon 0–100%.');
      if (index && phases[index - 1].end_date >= phase.start_date) throw new Error('Tanggal fase dalam kategori yang sama tidak boleh tumpang tindih.');
    });
  }
  return payload;
}

// Clear each confirmed upload immediately so a later failure cannot replay it.
export async function uploadPendingMedia(api, resource, entries) {
  const failures = [];
  for (const { field, file, onSaved } of entries) {
    if (!file) continue;
    try {
      const body = new FormData();
      body.append(field, file);
      await api.upload(`${resource}/${field}`, body);
      onSaved();
    } catch (error) {
      failures.push(`${field}: ${error.message || 'Unggahan gagal.'}`);
    }
  }
  return failures;
}
