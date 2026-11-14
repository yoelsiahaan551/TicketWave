import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  Calendar,
  MapPin,
  Pencil,
  Tag,
  Ticket,
  Trash2,
  Upload,
} from 'lucide-react-native';

import { useAppTheme } from '@/src/context/ThemeContext';
import {
  deleteAdminEvent,
  fetchAdminEventDetail,
  updateAdminEventStatus,
  uploadEventMedia,
} from '@/src/api/endpoints';
import { EventItem, EventStatus } from '@/src/types';
import { formatRupiah, formatTanggal } from '@/src/utils/formatters';
import { Header } from '@/src/components/common/Header';
import { Badge } from '@/src/components/common/Badge';
import { Button } from '@/src/components/common/Button';
import { Skeleton } from '@/src/components/common/Skeleton';
import { Typography } from '@/src/constants/Typography';
import { FALLBACK_EVENT_IMAGE } from '@/src/constants/Config';

const STATUS_TRANSITIONS: EventStatus[] = [
  'published',
  'on_sale',
  'sales_closed',
  'ongoing',
  'finished',
  'archived',
];

export default function AdminEventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await fetchAdminEventDetail(id);
      setEvent(res.data || null);
    } catch {
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  const handleUploadMedia = async (type: 'poster' | 'banner') => {
    if (!id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Ditolak', 'Aplikasi memerlukan izin akses galeri foto untuk mengunggah gambar.');
      return;
    }

    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (picked.canceled || !picked.assets?.[0]?.uri) return;

    setUploading(true);
    try {
      await uploadEventMedia(id, type, picked.assets[0].uri);
      Alert.alert('Sukses', `${type === 'poster' ? 'Poster' : 'Banner'} berhasil diunggah.`);
      await loadDetail();
    } catch (err: any) {
      Alert.alert('Gagal Upload', err?.message || `Gagal mengunggah ${type}.`);
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (st: EventStatus) => {
    if (!id) return;
    try {
      await updateAdminEventStatus(id, st);
      Alert.alert('Status Diperbarui', `Status event diubah menjadi "${st}".`);
      await loadDetail();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Gagal mengubah status.');
    }
  };

  const handleDelete = () => {
    if (!event) return;
    Alert.alert(
      'Hapus Event',
      `Hapus event "${event.name}" secara permanen?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminEvent(event.id);
              router.replace('/admin/events' as any);
            } catch (err: any) {
              Alert.alert('Gagal', err?.message || 'Event yang sudah terjual tidak dapat dihapus.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Detail Event (Admin)" />
        <View style={{ padding: 16, gap: 14 }}>
          <Skeleton width="100%" height={170} borderRadius={20} />
          <Skeleton width="100%" height={120} borderRadius={20} />
          <Skeleton width="100%" height={140} borderRadius={20} />
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Detail Event (Admin)" />
        <View style={styles.centerWrap}>
          <Text style={[Typography.body, { color: brand.danger, fontWeight: '700' }]}>
            Event tidak ditemukan
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Detail Event"
        subtitle={`#${event.id} • ${event.event_type.toUpperCase()}`}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push(`/admin/event/${event.id}/edit` as any)}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <Pencil size={17} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Media Preview & Upload */}
        <View style={styles.mediaCard}>
          <Image
            source={{ uri: event.banner_url || event.poster_url || FALLBACK_EVENT_IMAGE }}
            style={styles.bannerImg}
          />
          <View style={styles.mediaBtnRow}>
            <Button
              title={uploading ? 'Mengunggah...' : 'Upload Poster'}
              onPress={() => handleUploadMedia('poster')}
              disabled={uploading}
              size="sm"
              variant="secondary"
              icon={<Upload size={14} color={colors.text} />}
              style={{ flex: 1 }}
            />
            <Button
              title={uploading ? 'Mengunggah...' : 'Upload Banner'}
              onPress={() => handleUploadMedia('banner')}
              disabled={uploading}
              size="sm"
              variant="secondary"
              icon={<Upload size={14} color={colors.text} />}
              style={{ flex: 1 }}
            />
          </View>
        </View>

        {/* Event Info */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerRow}>
            <Badge status={event.status} />
            <Badge label={event.event_type} variant="purple" />
          </View>
          <Text style={[Typography.h2, styles.evName, { color: colors.text }]}>{event.name}</Text>
          {event.artist_name && (
            <Text style={[Typography.body, styles.artistText, { color: brand.primary, fontWeight: '700' }]}>
              {event.artist_name}
            </Text>
          )}

          <View style={styles.metaRow}>
            <Calendar size={15} color={colors.textMuted} />
            <Text style={[Typography.caption, styles.metaText, { color: colors.textSecondary }]}>
              {event.event_date ? formatTanggal(event.event_date) : `Festival ${event.days_count} Hari`}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <MapPin size={15} color={colors.textMuted} />
            <Text style={[Typography.caption, styles.metaText, { color: colors.textSecondary }]}>
              {event.venue}, {event.city}
            </Text>
          </View>
        </View>

        {/* Status Transition */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
            Transisi Status Event
          </Text>
          <View style={styles.statusGrid}>
            {STATUS_TRANSITIONS.map((st) => {
              const active = event.status === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => handleStatusChange(st)}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: active ? brand.primary : colors.surfaceElevated,
                      borderColor: active ? brand.primary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color: active ? '#FFFFFF' : colors.textSecondary,
                        fontWeight: '700',
                        textTransform: 'capitalize',
                      },
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Ticket Types & Phases */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.ttHeaderRow}>
            <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Kategori Tiket &amp; Fase Harga
            </Text>
            <TouchableOpacity
              onPress={() => router.push(`/admin/event/${event.id}/phases` as any)}
            >
              <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>
                Kelola Fase
              </Text>
            </TouchableOpacity>
          </View>

          {(event.ticket_types || []).length === 0 ? (
            <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 10 }]}>
              Tidak ada kategori tiket terdaftar.
            </Text>
          ) : (
            (event.ticket_types || []).map((tt) => (
              <View
                key={tt.id}
                style={[styles.ttRow, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h4, styles.ttName, { color: colors.text }]}>{tt.name}</Text>
                  <Text style={[Typography.caption, styles.ttMeta, { color: colors.textSecondary }]}>
                    {formatRupiah(tt.base_price)} • Terjual {tt.sold_count}/{tt.quota}
                  </Text>
                  <Text style={[Typography.caption, styles.ttPhases, { color: brand.primary, fontWeight: '700' }]}>
                    {tt.phases?.length || 0} fase harga terdaftar
                  </Text>
                </View>
                <Button
                  title="Fase"
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: `/admin/event/${event.id}/phases` as any,
                      params: { ticketTypeId: String(tt.id) },
                    })
                  }
                />
              </View>
            ))
          )}
        </View>

        <Button
          title="Hapus Event Ini"
          onPress={handleDelete}
          variant="danger"
          size="md"
          icon={<Trash2 size={16} color="#FFFFFF" />}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  mediaCard: {
    marginBottom: 16,
  },
  bannerImg: {
    width: '100%',
    height: 170,
    borderRadius: 22,
    marginBottom: 10,
    backgroundColor: '#0F172A',
  },
  mediaBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  evName: {
    fontSize: 20,
    lineHeight: 26,
    marginBottom: 4,
  },
  artistText: {
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  metaText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  ttHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ttRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  ttName: {
    fontSize: 14,
  },
  ttMeta: {
    marginTop: 2,
  },
  ttPhases: {
    marginTop: 3,
  },
});
