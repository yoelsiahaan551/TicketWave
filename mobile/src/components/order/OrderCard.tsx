import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CalendarDays, ChevronRight, CreditCard, Ticket } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { BookingDetailResponse } from '../../types';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface OrderCardProps {
  item: BookingDetailResponse;
  onPayNow?: (url: string) => void;
  onCancel?: (code: string) => void;
}

export function OrderCard({ item, onPayNow, onCancel }: OrderCardProps) {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const { booking, event, ticket_type } = item;
  const isPending = booking.status === 'pending_payment';
  const payUrl = booking.payment_url;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>NO. PESANAN</Text>
          <Text style={[styles.bookingCode, { color: colors.text }]}>
            {booking.booking_code}
          </Text>
        </View>
        <Badge status={booking.status} />
      </View>

      {/* Main Info */}
      <View style={[styles.body, { borderTopColor: colors.border }]}>
        <Text style={[styles.eventName, { color: colors.text }]} numberOfLines={1}>
          {event?.name || 'Event TicketWave'}
        </Text>

        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Kategori</Text>
            <Text style={[styles.metaVal, { color: colors.textSecondary }]} numberOfLines={1}>
              {ticket_type?.name || 'Reguler'}
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Jumlah</Text>
            <Text style={[styles.metaVal, { color: colors.textSecondary }]}>
              {booking.quantity} Tiket
            </Text>
          </View>

          <View style={styles.metaItem}>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>Tanggal</Text>
            <View style={styles.dateRow}>
              <CalendarDays size={12} color={brand.primary} />
              <Text style={[styles.metaVal, { color: colors.textSecondary }]}>
                {formatTanggalSingkat(booking.created_at)}
              </Text>
            </View>
          </View>
        </View>

        {/* Total Price Row */}
        <View style={[styles.totalRow, { backgroundColor: colors.surfaceElevated }]}>
          <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total Pembayaran</Text>
          <Text style={[styles.totalPrice, { color: brand.primary }]}>
            {formatRupiah(booking.total_price)}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push(`/order/${booking.booking_code}` as any)}
          style={[styles.detailBtn, { backgroundColor: brand.primary }]}
        >
          <Text style={styles.detailBtnText}>Lihat Detail</Text>
          <ChevronRight size={14} color="#FFFFFF" />
        </TouchableOpacity>

        {isPending && payUrl && onPayNow && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onPayNow(payUrl)}
            style={[styles.payBtn, { backgroundColor: '#10B981' }]}
          >
            <CreditCard size={13} color="#FFFFFF" />
            <Text style={styles.payBtnText}>Bayar Sekarang</Text>
          </TouchableOpacity>
        )}

        {isPending && onCancel && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onCancel(booking.booking_code)}
            style={[styles.cancelBtn, { borderColor: brand.danger }]}
          >
            <Text style={[styles.cancelBtnText, { color: brand.danger }]}>Batalkan</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  bookingCode: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  body: {
    borderTopWidth: 1,
    paddingTop: 12,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 12,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  metaVal: {
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  detailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  detailBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
