import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppTheme } from '@/src/context/ThemeContext';
import { fetchAdminEventDetail, updateAdminEvent } from '@/src/api/endpoints';
import { Header } from '@/src/components/common/Header';
import { Input } from '@/src/components/common/Input';
import { Button } from '@/src/components/common/Button';
import { Skeleton } from '@/src/components/common/Skeleton';
import { Typography } from '@/src/constants/Typography';

export default function AdminEditEventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [eventType, setEventType] = useState<'single' | 'festival'>('single');

  const [name, setName] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [artistName, setArtistName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [daysCount, setDaysCount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetchAdminEventDetail(id)
      .then((res) => {
        const ev = res.data;
        if (ev) {
          setEventType(ev.event_type);
          setName(ev.name || '');
          setVenue(ev.venue || '');
          setCity(ev.city || '');
          setDescription(ev.description || '');
          setArtistName(ev.artist_name || '');
          setEventDate(ev.event_date || '');
          setEventTime(ev.event_time || '');
          setDaysCount(ev.days_count ? String(ev.days_count) : '');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setError(null);
    setSubmitting(true);

    try {
      const payload: any = {
        name: name.trim(),
        venue: venue.trim(),
        city: city.trim(),
        description: description.trim() || null,
      };
      if (eventType === 'single') {
        if (artistName.trim()) payload.artist_name = artistName.trim();
        if (eventDate.trim()) payload.event_date = eventDate.trim();
        if (eventTime.trim()) payload.event_time = eventTime.trim();
      } else if (daysCount) {
        payload.days_count = Number(daysCount);
      }

      await updateAdminEvent(id, payload);
      Alert.alert('Tersimpan', 'Informasi event berhasil diperbarui.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Gagal memperbarui event.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Edit Event" />
        <View style={{ padding: 16, gap: 14 }}>
          <Skeleton width="100%" height={52} borderRadius={16} />
          <Skeleton width="100%" height={52} borderRadius={16} />
          <Skeleton width="100%" height={52} borderRadius={16} />
          <Skeleton width="100%" height={100} borderRadius={16} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Edit Event" subtitle={`PUT /api/events/${id}`} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
              <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>{error}</Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Input label="Nama Event" value={name} onChangeText={setName} />
            <Input label="Venue" value={venue} onChangeText={setVenue} />
            <Input label="Kota" value={city} onChangeText={setCity} />
            <Input
              label="Deskripsi"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {eventType === 'single' ? (
              <>
                <Input label="Nama Artis" value={artistName} onChangeText={setArtistName} />
                <Input
                  label="Tanggal Event (YYYY-MM-DD)"
                  value={eventDate}
                  onChangeText={setEventDate}
                />
                <Input
                  label="Waktu Event (HH:MM:SS)"
                  value={eventTime}
                  onChangeText={setEventTime}
                />
              </>
            ) : (
              <Input
                label="Jumlah Hari Festival"
                value={daysCount}
                onChangeText={setDaysCount}
                keyboardType="number-pad"
              />
            )}

            <Button
              title="Simpan Perubahan"
              onPress={handleSave}
              loading={submitting}
              variant="gradient"
              size="lg"
              style={{ marginTop: 8 }}
            />
          </View>
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
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
});
