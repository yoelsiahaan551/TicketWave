import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, Eye, Pencil, Plus, Search, Trash2, X } from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import {
  deleteAdminEvent,
  fetchAdminEvents,
  updateAdminEventStatus,
} from '../../src/api/endpoints';
import { EventItem, EventStatus } from '../../src/types';
import { formatTanggalSingkat } from '../../src/utils/formatters';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Skeleton } from '../../src/components/common/Skeleton';
import { Typography } from '../../src/constants/Typography';

const STATUS_OPTIONS: EventStatus[] = [
  'published',
  'on_sale',
  'sales_closed',
  'ongoing',
  'finished',
  'archived',
];

export default function AdminEventsScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [statusTarget, setStatusTarget] = useState<EventItem | null>(null);

  const refreshEvents = useCallback(async () => {
    try {
      const params: any = { page: 1, per_page: 50 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await fetchAdminEvents(params);
      setEvents(res.data?.items || []);
    } catch {
      setEvents([]);
    } finally {
      setRefreshing(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let ignore = false;
    const params: any = { page: 1, per_page: 50 };
    if (search.trim()) params.search = search.trim();
    if (statusFilter !== 'all') params.status = statusFilter;

    fetchAdminEvents(params)
      .then((res) => {
        if (!ignore) {
          setEvents(res.data?.items || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setEvents([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [search, statusFilter]);

  const onRefresh = () => {
    setRefreshing(true);
    refreshEvents();
  };

  const handleStatusUpdate = async (newStatus: EventStatus) => {
    if (!statusTarget) return;
    try {
      await updateAdminEventStatus(statusTarget.id, newStatus);
      setStatusTarget(null);
      await refreshEvents();
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Gagal memperbarui status event.');
    }
  };

  const handleDelete = (ev: EventItem) => {
    Alert.alert(
      'Hapus Event',
      `Apakah Anda yakin ingin menghapus event "${ev.name}"? Event yang sudah memiliki tiket terjual tidak dapat dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminEvent(ev.id);
              await refreshEvents();
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err?.message || 'Event sudah memiliki tiket terjual.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Kelola Event"
        subtitle={`${events.length} event terdaftar`}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/admin/event/create' as any)}
            style={[styles.addBtn, { backgroundColor: brand.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.filterSection}>
        <Input
          placeholder="Cari nama event atau kota..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={brand.primary} />}
          containerStyle={{ marginBottom: 8 }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScroll}
        >
          {['all', 'draft', ...STATUS_OPTIONS].map((st) => {
            const active = statusFilter === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setStatusFilter(st)}
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
                    styles.statusChipText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {st === 'all' ? 'Semua' : st}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingList}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={{ gap: 8 }}>
                <Skeleton width="80%" height={18} />
                <Skeleton width="50%" height={14} />
              </View>
              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                <Skeleton width={80} height={20} />
                <Skeleton width={50} height={20} />
                <Skeleton width={50} height={20} />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brand.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h3, styles.evName, { color: colors.text }]} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={[Typography.caption, styles.evMeta, { color: colors.textSecondary }]}>
                    {item.event_type.toUpperCase()} • {item.city} •{' '}
                    {item.event_date ? formatTanggalSingkat(item.event_date) : `${item.days_count || 1} Hari`}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => setStatusTarget(item)}>
                  <Badge status={item.status} />
                </TouchableOpacity>
              </View>

              <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/event/${item.id}` as any)}
                  style={styles.actionLink}
                >
                  <Eye size={15} color={brand.primary} />
                  <Text style={[Typography.caption, styles.actionLinkText, { color: brand.primary }]}>
                    Detail &amp; Fase
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push(`/admin/event/${item.id}/edit` as any)}
                  style={styles.actionLink}
                >
                  <Pencil size={15} color={colors.textSecondary} />
                  <Text style={[Typography.caption, styles.actionLinkText, { color: colors.textSecondary }]}>
                    Edit
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.actionLink}
                >
                  <Trash2 size={15} color={brand.danger} />
                  <Text style={[Typography.caption, styles.actionLinkText, { color: brand.danger }]}>
                    Hapus
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Calendar size={28} color={brand.primary} />}
              title="Belum Ada Event"
              description="Buat event pertama Anda sekarang."
              actionLabel="Buat Event Baru"
              onAction={() => router.push('/admin/event/create' as any)}
            />
          }
        />
      )}

      {/* Status Transition Modal */}
      <Modal visible={!!statusTarget} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setStatusTarget(null)}
        >
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.h3, styles.modalTitle, { color: colors.text }]} numberOfLines={1}>
                Status: {statusTarget?.name}
              </Text>
              <TouchableOpacity onPress={() => setStatusTarget(null)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            {STATUS_OPTIONS.map((st) => (
              <TouchableOpacity
                key={st}
                onPress={() => handleStatusUpdate(st)}
                style={[
                  styles.statusOpt,
                  statusTarget?.status === st && { backgroundColor: brand.primarySoft },
                ]}
              >
                <Text
                  style={[
                    Typography.body,
                    styles.statusOptText,
                    { color: statusTarget?.status === st ? brand.primary : colors.text },
                  ]}
                >
                  {st}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  statusScroll: {
    gap: 8,
    paddingBottom: 10,
  },
  statusChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusChipText: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  loadingList: {
    padding: 16,
    gap: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  evName: {
    fontSize: 16,
    marginBottom: 4,
  },
  evMeta: {
    fontSize: 12,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  actionLinkText: {
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    flex: 1,
    marginRight: 10,
  },
  statusOpt: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 4,
  },
  statusOptText: {
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
