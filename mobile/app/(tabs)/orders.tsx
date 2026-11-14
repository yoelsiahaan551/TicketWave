import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Receipt, RefreshCw, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { useAppTheme } from '../../src/context/ThemeContext';
import { cancelBooking, fetchBookingDetail } from '../../src/api/endpoints';
import {
  getSavedBookingEntries,
  removeSavedBookingEntry,
  saveBookingEntry,
} from '../../src/utils/storage';
import { BookingDetailResponse } from '../../src/types';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { Button } from '../../src/components/common/Button';
import { OrderCard } from '../../src/components/order/OrderCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { OrderCardSkeleton } from '../../src/components/common/Skeleton';

const ORDER_FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'pending_payment', label: 'Menunggu Bayar' },
  { id: 'paid', label: 'Lunas' },
  { id: 'cancelled', label: 'Dibatalkan' },
  { id: 'expired', label: 'Kedaluwarsa' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();

  const [bookings, setBookings] = useState<BookingDetailResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const [lookupCode, setLookupCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      const entries = await getSavedBookingEntries();
      if (entries.length === 0) {
        setBookings([]);
        return;
      }

      const settled = await Promise.allSettled(
        entries.map(async (entry): Promise<BookingDetailResponse> => {
          const res = await fetchBookingDetail(entry.booking_code);
          if (res.success && res.data?.booking) {
            return {
              ...res.data,
              booking: {
                ...res.data.booking,
                payment_url: res.data.booking.payment_url || entry.payment_url || null,
                recipient_email: res.data.booking.recipient_email || entry.recipient_email || null,
              },
            };
          }
          throw new Error('Not found');
        })
      );

      const valid = settled
        .filter((r): r is PromiseFulfilledResult<BookingDetailResponse> => r.status === 'fulfilled')
        .map((r) => r.value);

      setBookings(valid);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const handleLookup = async () => {
    const code = lookupCode.trim().toUpperCase();
    if (!code) return;

    setLookupLoading(true);
    setLookupMessage(null);
    try {
      const res = await fetchBookingDetail(code);
      if (res.success && res.data?.booking) {
        await saveBookingEntry({
          booking_code: res.data.booking.booking_code,
          payment_url: res.data.booking.payment_url || null,
          recipient_email: res.data.booking.recipient_email || res.data.booking.buyer_email,
          event_name: res.data.event?.name,
        });
        setLookupCode('');
        setLookupMessage({
          type: 'success',
          text: `Pesanan ${res.data.booking.booking_code} berhasil ditemukan.`,
        });
        await loadOrders();
      }
    } catch (err: any) {
      setLookupMessage({
        type: 'error',
        text: err?.message || `Kode booking "${code}" tidak ditemukan.`,
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const handleCancelOrder = (bookingCode: string) => {
    Alert.alert(
      'Batalkan Pesanan',
      `Yakin ingin membatalkan pesanan ${bookingCode}? Kuota tiket yang direservasi akan dikembalikan ke event.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            setLookupMessage(null);
            try {
              await cancelBooking(bookingCode);
              setLookupMessage({
                type: 'success',
                text: `Pesanan ${bookingCode} berhasil dibatalkan.`,
              });
              await loadOrders();
            } catch (err: any) {
              setLookupMessage({
                type: 'error',
                text: err?.message || `Gagal membatalkan pesanan ${bookingCode}.`,
              });
            }
          },
        },
      ]
    );
  };

  const handlePay = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Info Pembayaran', `Link pembayaran: ${url}`);
    }
  };

  const filteredBookings = bookings.filter((item) =>
    statusFilter === 'all' ? true : item.booking.status === statusFilter
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Pesanan Saya"
        subtitle="Pantau & kelola status transaksi"
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={onRefresh}
            style={[styles.refreshBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <RefreshCw size={17} color={colors.text} />
          </TouchableOpacity>
        }
      />

      {/* Lookup Card */}
      <View style={[styles.lookupCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.lookupTitle, { color: colors.text }]}>
          Lacak Kode Booking
        </Text>
        <View style={styles.lookupRow}>
          <Input
            placeholder="TKTW-YYYYMMDD-XXXXXX"
            value={lookupCode}
            onChangeText={setLookupCode}
            autoCapitalize="characters"
            leftIcon={<Search size={16} color={brand.primary} />}
            containerStyle={{ flex: 1, marginBottom: 0 }}
          />
          <Button
            title="Lacak"
            onPress={handleLookup}
            loading={lookupLoading}
            size="md"
            style={{ marginLeft: 8 }}
          />
        </View>
        {lookupMessage ? (
          <Text
            style={[
              styles.lookupFeedback,
              { color: lookupMessage.type === 'success' ? brand.success : brand.danger },
            ]}
          >
            {lookupMessage.text}
          </Text>
        ) : null}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {ORDER_FILTERS.map((f) => {
            const active = statusFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                activeOpacity={0.8}
                onPress={() => setStatusFilter(f.id)}
                style={[
                  styles.filterPill,
                  {
                    backgroundColor: active ? brand.primary : colors.surfaceElevated,
                    borderColor: active ? brand.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List / Skeleton */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.booking.booking_code}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brand.primary}
              colors={[brand.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={<Receipt size={32} color={brand.primary} />}
              title="Belum Ada Pesanan"
              description={
                statusFilter === 'all'
                  ? 'Belum ada transaksi tiket yang dibuat pada perangkat ini. Cari event favorit Anda dan pesan tiketnya sekarang.'
                  : `Tidak ada pesanan dengan status "${ORDER_FILTERS.find((f) => f.id === statusFilter)?.label}".`
              }
              actionLabel="Eksplor Event"
              onAction={() => router.push('/(tabs)/events')}
            />
          }
          renderItem={({ item }) => (
            <OrderCard
              item={item}
              onPayNow={handlePay}
              onCancel={handleCancelOrder}
            />
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
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lookupCard: {
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  lookupTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  lookupRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lookupFeedback: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  filterWrap: {
    marginTop: 4,
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '800',
  },
  skeletonWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 28,
  },
});
