import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  AlertTriangle,
  Clock,
  RefreshCw,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { fetchScanHistoryWithMeta } from '../../src/api/endpoints';
import {
  formatWibDateTime,
  getOfficerStatusBadgeVariant,
} from '../../src/utils/formatters';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Skeleton } from '../../src/components/common/Skeleton';
import { Typography } from '../../src/constants/Typography';

const HISTORY_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'success', label: 'Berhasil' },
  { id: 'failed', label: 'Ditolak' },
];

export default function OfficerHistoryScreen() {
  const { colors, brand } = useAppTheme();

  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetchScanHistoryWithMeta();
      if (res.success) {
        setHistoryItems(res.data || []);
        setError(null);
      } else {
        setError(res.error || 'Gagal memuat riwayat scan.');
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat riwayat.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchScanHistoryWithMeta()
      .then((res) => {
        if (ignore) return;
        if (res.success) {
          setHistoryItems(res.data || []);
          setError(null);
        } else {
          setError(res.error || 'Gagal memuat riwayat scan.');
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err?.message || 'Gagal memuat riwayat.');
        }
      })
      .finally(() => {
        if (!ignore) {
          hasLoadedRef.current = true;
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) return;
      loadHistory();
    }, [loadHistory])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const filteredItems = historyItems.filter((item) => {
    if (filter === 'all') return true;
    const st = String(item?.status || '').toLowerCase();
    if (filter === 'success') {
      return (
        !st.includes('tidak') &&
        (st === 'valid' ||
          st.includes('berhasil') ||
          st.includes('sukses') ||
          st.includes('selesai'))
      );
    }
    if (filter === 'failed') {
      return (
        st.includes('tidak') ||
        st.includes('ditolak') ||
        st.includes('invalid') ||
        st.includes('used') ||
        st.includes('sudah')
      );
    }
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Riwayat Scan Tiket"
        subtitle="Daftar tiket yang telah dipindai"
        rightAction={
          <TouchableOpacity
            onPress={onRefresh}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <RefreshCw size={17} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {HISTORY_FILTERS.map((f) => {
          const isActive = filter === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              activeOpacity={0.7}
              onPress={() => setFilter(f.id)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: isActive ? brand.primary : colors.surface,
                  borderColor: isActive ? brand.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: isActive ? '#FFFFFF' : colors.textSecondary },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error Alert Banner (if error) */}
      {error && (
        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={[styles.alertCard, { backgroundColor: brand.warningSoft, borderColor: brand.warning }]}>
            <AlertTriangle size={20} color={brand.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, { color: brand.warning }]}>
                Gagal Memuat Riwayat
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {error}
              </Text>
              <TouchableOpacity
                onPress={onRefresh}
                disabled={loading}
                style={[styles.retryBtn, { borderColor: brand.warning }]}
              >
                <Text style={[styles.retryBtnText, { color: brand.warning }]}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {loading ? (
        <View style={{ padding: 16, gap: 10 }}>
          <Skeleton width="100%" height={80} borderRadius={18} />
          <Skeleton width="100%" height={80} borderRadius={18} />
          <Skeleton width="100%" height={80} borderRadius={18} />
        </View>
      ) : filteredItems.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState
            title="Belum Ada Riwayat Scan"
            description="Tiket yang berhasil dipindai atau diverifikasi akan muncul dalam riwayat ini."
            icon={<Clock size={36} color={brand.primary} />}
          />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item, index) => item.id || String(index)}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />}
          renderItem={({ item }) => (
            <View style={[styles.itemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.itemHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.itemCode, { color: colors.text }]}>
                    {item.ticket_code || 'Tiket'}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    {formatWibDateTime(item.scanned_at || item.checked_in_at || item.timestamp)}
                  </Text>
                </View>
                <Badge
                  label={item.status || 'Berhasil'}
                  variant={getOfficerStatusBadgeVariant(item.status)}
                />
              </View>

              <View style={[styles.itemFooter, { borderTopColor: colors.border }]}>
                <View style={styles.footerCol}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Event: {item.event_name || '-'} ({item.ticket_type_name || item.ticket_type || 'Standard'})
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Pembeli: {item.buyer_name || item.attendee_name || '-'}
                    {item.booking_code ? ` • ${item.booking_code}` : ''}
                  </Text>
                  {item.officer_name ? (
                    <Text style={[Typography.caption, { color: colors.textMuted }]}>
                      Petugas: {item.officer_name}
                    </Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  alertCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  retryBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 10,
  },
  itemCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemCode: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemFooter: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  footerCol: {
    gap: 2,
  },
});
