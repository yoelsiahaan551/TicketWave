import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';

import { useAppTheme } from '../../../src/context/ThemeContext';
import { createAdminEvent, fetchAdminAgencies } from '../../../src/api/endpoints';
import { Agency } from '../../../src/types';
import { Header } from '../../../src/components/common/Header';
import { Input } from '../../../src/components/common/Input';
import { Button } from '../../../src/components/common/Button';
import { Typography } from '../../../src/constants/Typography';

export default function AdminCreateEventScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState<number | null>(null);

  const [eventType, setEventType] = useState<'single' | 'festival'>('single');
  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');

  // Single
  const [artistName, setArtistName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('19:00:00');

  // Festival
  const [daysCount, setDaysCount] = useState('1');
  const [festivalArtists, setFestivalArtists] = useState<{ day_number: number; artist_name: string }[]>([
    { day_number: 1, artist_name: '' },
  ]);

  // Nested Ticket Types
  const [ticketTypes, setTicketTypes] = useState<
    { name: string; base_price: string; quota: string; description: string }[]
  >([{ name: 'Regular', base_price: '150000', quota: '500', description: 'General admission' }]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAdminAgencies({ per_page: 50 }).then((res) => {
      const items = res.data?.items || [];
      setAgencies(items);
      if (items.length > 0) setAgencyId(items[0].id);
    });
  }, []);

  const handleAddArtist = () => {
    setFestivalArtists((prev) => [
      ...prev,
      { day_number: Math.min(Number(daysCount) || 1, prev.length + 1), artist_name: '' },
    ]);
  };

  const handleRemoveArtist = (index: number) => {
    setFestivalArtists((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddTicketType = () => {
    setTicketTypes((prev) => [
      ...prev,
      { name: 'VIP', base_price: '350000', quota: '200', description: 'Priority access' },
    ]);
  };

  const handleRemoveTicketType = (index: number) => {
    setTicketTypes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!agencyId) {
      setError('Pilih agensi penyelenggara terlebih dahulu.');
      return;
    }
    if (!name.trim() || !venue.trim() || !city.trim()) {
      setError('Nama event, venue, dan kota wajib diisi.');
      return;
    }

    const payload: any = {
      agency_id: Number(agencyId),
      event_type: eventType,
      name: name.trim(),
      venue: venue.trim(),
      city: city.trim(),
      description: description.trim() || undefined,
    };

    if (eventType === 'single') {
      if (!artistName.trim() || !eventDate.trim() || !eventTime.trim()) {
        setError('Untuk Single event, nama artis, tanggal (YYYY-MM-DD), dan waktu (HH:MM:SS) wajib diisi.');
        return;
      }
      payload.artist_name = artistName.trim();
      payload.event_date = eventDate.trim();
      payload.event_time = eventTime.trim();
    } else {
      const parsedDays = Number(daysCount) || 1;
      const validArtists = festivalArtists.filter((a) => a.artist_name.trim().length > 0);
      if (validArtists.length === 0) {
        setError('Untuk Festival event, minimal 1 penampil artis wajib diisi.');
        return;
      }
      payload.days_count = parsedDays;
      payload.festival_artists = validArtists.map((a) => ({
        day_number: Number(a.day_number) || 1,
        artist_name: a.artist_name.trim(),
      }));
    }

    if (ticketTypes.length > 0) {
      payload.ticket_types = ticketTypes.map((t) => ({
        name: t.name.trim(),
        base_price: Number(t.base_price) || 0,
        quota: Number(t.quota) || 100,
        description: t.description.trim() || undefined,
      }));
    }

    setSubmitting(true);
    try {
      const res = await createAdminEvent(payload);
      Alert.alert('Sukses', `Event "${res.data?.name || name}" berhasil dibuat!`, [
        {
          text: 'Lihat Detail',
          onPress: () => router.replace(`/admin/event/${res.data?.id}` as any),
        },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Gagal membuat event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Buat Event Baru" subtitle="POST /api/events" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
              <Text style={[Typography.caption, styles.errorText, { color: brand.danger }]}>
                {error}
              </Text>
            </View>
          )}

          {/* Event Type Switcher */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>Tipe Format Event</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                onPress={() => setEventType('single')}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: eventType === 'single' ? brand.primarySoft : colors.surfaceElevated,
                    borderColor: eventType === 'single' ? brand.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.body,
                    styles.typeBtnText,
                    { color: eventType === 'single' ? brand.primary : colors.text },
                  ]}
                >
                  Single Concert
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setEventType('festival')}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: eventType === 'festival' ? brand.purpleSoft : colors.surfaceElevated,
                    borderColor: eventType === 'festival' ? brand.purple : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.body,
                    styles.typeBtnText,
                    { color: eventType === 'festival' ? brand.purple : colors.text },
                  ]}
                >
                  Festival Musik
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* General Information */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>Informasi Utama</Text>

            {/* Agency Selector */}
            <Text style={[Typography.caption, styles.inputLabel, { color: colors.textSecondary }]}>
              Pilih Agency Penyelenggara *
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.agencyScroll}>
              {agencies.map((a) => {
                const selected = agencyId === a.id;
                return (
                  <TouchableOpacity
                    key={a.id}
                    onPress={() => setAgencyId(a.id)}
                    style={[
                      styles.agencyChip,
                      {
                        backgroundColor: selected ? brand.primary : colors.surfaceElevated,
                        borderColor: selected ? brand.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.caption,
                        { color: selected ? '#FFFFFF' : colors.text, fontWeight: '700' },
                      ]}
                    >
                      {a.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <Input
              label="Nama Event *"
              placeholder="Contoh: Coldplay Music of the Spheres"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Venue Lokasi *"
              placeholder="Contoh: Gelora Bung Karno"
              value={venue}
              onChangeText={setVenue}
            />

            <Input
              label="Kota *"
              placeholder="Contoh: Jakarta"
              value={city}
              onChangeText={setCity}
            />

            <Input
              label="Deskripsi Event"
              placeholder="Ceritakan tentang konser ini..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Specific Type Fields */}
          {eventType === 'single' ? (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>Detail Single Concert</Text>
              <Input
                label="Nama Artis / Musisi *"
                placeholder="Contoh: Coldplay"
                value={artistName}
                onChangeText={setArtistName}
              />
              <Input
                label="Tanggal Event (YYYY-MM-DD) *"
                placeholder="2026-11-20"
                value={eventDate}
                onChangeText={setEventDate}
              />
              <Input
                label="Waktu Event (HH:MM:SS) *"
                placeholder="19:00:00"
                value={eventTime}
                onChangeText={setEventTime}
              />
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>Detail Festival</Text>
              <Input
                label="Jumlah Hari (Days Count) *"
                placeholder="Contoh: 3"
                value={daysCount}
                onChangeText={setDaysCount}
                keyboardType="number-pad"
              />

              <View style={styles.subHeaderRow}>
                <Text style={[Typography.h4, styles.subTitle, { color: colors.text }]}>Lineup Artis Festival</Text>
                <TouchableOpacity onPress={handleAddArtist} style={styles.addMiniBtn}>
                  <Plus size={14} color={brand.primary} />
                  <Text style={[Typography.caption, styles.addMiniText, { color: brand.primary }]}>Tambah Artis</Text>
                </TouchableOpacity>
              </View>

              {festivalArtists.map((fa, idx) => (
                <View key={idx} style={styles.dynamicRow}>
                  <Input
                    placeholder="Hari ke"
                    value={String(fa.day_number)}
                    onChangeText={(txt) => {
                      const next = [...festivalArtists];
                      next[idx].day_number = Number(txt) || 1;
                      setFestivalArtists(next);
                    }}
                    keyboardType="number-pad"
                    containerStyle={{ width: 80, marginBottom: 0 }}
                  />
                  <Input
                    placeholder="Nama artis festival"
                    value={fa.artist_name}
                    onChangeText={(txt) => {
                      const next = [...festivalArtists];
                      next[idx].artist_name = txt;
                      setFestivalArtists(next);
                    }}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                  />
                  <TouchableOpacity onPress={() => handleRemoveArtist(idx)} hitSlop={6}>
                    <Trash2 size={16} color={brand.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Nested Ticket Types */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.subHeaderRow}>
              <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>Kategori Tiket Awal</Text>
              <TouchableOpacity onPress={handleAddTicketType} style={styles.addMiniBtn}>
                <Plus size={14} color={brand.primary} />
                <Text style={[Typography.caption, styles.addMiniText, { color: brand.primary }]}>Kategori</Text>
              </TouchableOpacity>
            </View>

            {ticketTypes.map((tt, idx) => (
              <View
                key={idx}
                style={[
                  styles.ttBox,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <View style={styles.ttHeader}>
                  <Text style={[Typography.h4, styles.ttNumber, { color: brand.primary }]}>
                    Kategori #{idx + 1}
                  </Text>
                  {ticketTypes.length > 1 && (
                    <TouchableOpacity onPress={() => handleRemoveTicketType(idx)}>
                      <Trash2 size={16} color={brand.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                <Input
                  label="Nama Kategori"
                  value={tt.name}
                  onChangeText={(txt) => {
                    const next = [...ticketTypes];
                    next[idx].name = txt;
                    setTicketTypes(next);
                  }}
                  placeholder="VIP, Regular, Festival..."
                />
                <Input
                  label="Harga Dasar (Rp)"
                  value={tt.base_price}
                  onChangeText={(txt) => {
                    const next = [...ticketTypes];
                    next[idx].base_price = txt;
                    setTicketTypes(next);
                  }}
                  keyboardType="number-pad"
                />
                <Input
                  label="Kuota Tiket"
                  value={tt.quota}
                  onChangeText={(txt) => {
                    const next = [...ticketTypes];
                    next[idx].quota = txt;
                    setTicketTypes(next);
                  }}
                  keyboardType="number-pad"
                />
              </View>
            ))}
          </View>

          <Button
            title="Simpan &amp; Buat Event"
            onPress={handleSubmit}
            loading={submitting}
            variant="gradient"
            size="lg"
            style={{ marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  typeBtnText: {
    fontWeight: '800',
  },
  inputLabel: {
    fontWeight: '700',
    marginBottom: 8,
  },
  agencyScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  agencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8,
  },
  subHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subTitle: {
    fontWeight: '700',
  },
  addMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addMiniText: {
    fontWeight: '700',
  },
  dynamicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  ttBox: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  ttHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  ttNumber: {
    fontWeight: '800',
  },
});
