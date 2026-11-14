import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  Ticket,
  User,
  XCircle,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { cancelBooking, fetchBookingDetail } from '../../src/api/endpoints';
import { saveBookingEntry } from '../../src/utils/storage';
import { BookingDetailResponse, TicketItem } from '../../src/types';
import { formatRupiah, formatTanggal, formatWaktu } from '../../src/utils/formatters';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { QRCodeModal } from '../../src/components/ticket/QRCodeModal';
import { Skeleton } from '../../src/components/common/Skeleton';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();

  const [detail, setDetail] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedQR, setSelectedQR] = useState<TicketItem | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      const res = await fetchBookingDetail(id);
      if (res.success && res.data?.booking) {
        setDetail(res.data);
        await saveBookingEntry({
          booking_code: res.data.booking.booking_code,
          payment_url: res.data.booking.payment_url || null,
          recipient_email:
            res.data.booking.recipient_email || res.data.booking.buyer_email,
          event_name: res.data.event?.name,
        });
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat detail pesanan.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCopyCode = async () => {
    if (!detail?.booking?.booking_code) return;
    await Clipboard.setStringAsync(detail.booking.booking_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCancelOrder = () => {
    if (!detail?.booking?.booking_code) return;
    Alert.alert(
      'Batalkan Pesanan',
      'Apakah Anda yakin ingin membatalkan pesanan ini? Stok tiket akan dikembalikan ke event.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Batalkan',
          style: 'destructive',
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelBooking(detail.booking.booking_code);
              await loadOrder();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Gagal membatalkan pesanan.');
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  };

  const handlePayNow = async () => {
    const url = detail?.booking?.payment_url;
    if (!url) return;
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Link Pembayaran', url);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Detail Pesanan" />
        <View style={{ padding: 18, gap: 14 }}>
          <Skeleton width="100%" height={90} borderRadius={20} />
          <Skeleton width="100%" height={140} borderRadius={24} />
          <Skeleton width="100%" height={180} borderRadius={24} />
        </View>
      </View>
    );
  }

  if (error || !detail) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <Header showBack title="Detail Pesanan" />
        <Text style={[styles.errorTitle, { color: brand.danger }]}>Pesanan Tidak Ditemukan</Text>
        <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>
          {error || `Kode booking "${id}" tidak ditemukan pada sistem.`}
        </Text>
        <Button
          title="Kembali ke Pesanan Saya"
          onPress={() => router.replace('/(tabs)/orders')}
          variant="outline"
          size="md"
          style={{ marginTop: 14 }}
        />
      </View>
    );
  }

  const { booking, event, ticket_type, tickets } = detail;
  const isPending = booking.status === 'pending_payment';
  const isPaid = booking.status === 'paid' || booking.status === 'lunas';
  const isCancelled = booking.status === 'cancelled' || booking.status === 'dibatalkan';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Detail Pesanan"
        subtitle={booking.booking_code}
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={loadOrder}
            style={[styles.refreshBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
          >
            <RefreshCw size={17} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadOrder}
            tintColor={brand.primary}
          />
        }
      >
        {/* Status Notification Banner */}
        {isPending && (
          <View style={[styles.statusBanner, { backgroundColor: isDark ? 'rgba(245,158,11,0.18)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
            <Clock size={20} color="#D97706" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                Menunggu Pembayaran
              </Text>
              <Text style={[styles.statusBannerDesc, { color: isDark ? '#FDE68A' : '#78350F' }]}>
                Harap selesaikan pembayaran sebelum batas waktu berakhir agar reservasi tiket Anda tidak hangus.
              </Text>
            </View>
          </View>
        )}

        {isPaid && (
          <View style={[styles.statusBanner, { backgroundColor: isDark ? 'rgba(16,185,129,0.18)' : '#DCFCE7', borderColor: '#10B981' }]}>
            <CheckCircle2 size={20} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: isDark ? '#34D399' : '#065F46' }]}>
                Pembayaran Berhasil!
              </Text>
              <Text style={[styles.statusBannerDesc, { color: isDark ? '#A7F3D0' : '#047857' }]}>
                Tiket resmi Anda telah diterbitkan. Tunjukkan kode QR pada gate venue acara.
              </Text>
            </View>
          </View>
        )}

        {isCancelled && (
          <View style={[styles.statusBanner, { backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : '#FEE2E2', borderColor: '#EF4444' }]}>
            <XCircle size={20} color="#DC2626" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusBannerTitle, { color: isDark ? '#F87171' : '#991B1B' }]}>
                Pesanan Dibatalkan
              </Text>
              <Text style={[styles.statusBannerDesc, { color: isDark ? '#FECACA' : '#7F1D1D' }]}>
                Pesanan ini telah dibatalkan dan kuota tiket telah dikembalikan ke sistem.
              </Text>
            </View>
          </View>
        )}

        {/* Booking Code Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: colors.textMuted }]}>KODE BOOKING PESANAN</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: brand.primary }]}>
              {booking.booking_code}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleCopyCode}
              style={[
                styles.copyBtn,
                { backgroundColor: copied ? '#10B981' : colors.surfaceElevated, borderColor: colors.border },
              ]}
            >
              {copied ? <Check size={14} color="#FFFFFF" /> : <Copy size={14} color={colors.text} />}
              <Text style={[styles.copyBtnText, { color: copied ? '#FFFFFF' : colors.text }]}>
                {copied ? 'Disalin' : 'Salin'}
              </Text>
            </TouchableOpacity>
          </View>

          {isPending && booking.payment_url && (
            <Button
              title="Bayar Sekarang (Midtrans)"
              onPress={handlePayNow}
              variant="gradient"
              icon={<CreditCard size={18} color="#FFFFFF" />}
              size="lg"
              style={{ marginTop: 14 }}
            />
          )}

          {isPending && (
            <Button
              title="Batalkan Pesanan"
              onPress={handleCancelOrder}
              variant="outline"
              loading={cancelling}
              style={{ borderColor: brand.danger, marginTop: 10 }}
              textStyle={{ color: brand.danger }}
            />
          )}
        </View>

        {/* Event Detail Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: brand.primary }]}>EVENT TICKETWAVE</Text>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {event?.name || 'Event TicketWave'}
          </Text>

          <View style={styles.metaCol}>
            {event?.event_date && (
              <View style={styles.metaRow}>
                <CalendarDays size={14} color={brand.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {formatTanggal(event.event_date)} {event.event_time ? `• ${formatWaktu(event.event_time)}` : ''}
                </Text>
              </View>
            )}

            {event?.venue && (
              <View style={styles.metaRow}>
                <MapPin size={14} color={brand.primary} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {event.venue}, {event.city}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Buyer Info Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: brand.primary }]}>DATA PEMESAN</Text>
          <View style={styles.buyerRow}>
            <User size={15} color={colors.textMuted} />
            <Text style={[styles.buyerVal, { color: colors.text }]}>{booking.buyer_name}</Text>
          </View>
          <View style={styles.buyerRow}>
            <Mail size={15} color={colors.textMuted} />
            <Text style={[styles.buyerVal, { color: colors.textSecondary }]}>{booking.buyer_email}</Text>
          </View>
          <View style={styles.buyerRow}>
            <Phone size={15} color={colors.textMuted} />
            <Text style={[styles.buyerVal, { color: colors.textSecondary }]}>{booking.buyer_phone}</Text>
          </View>
        </View>

        {/* Ticket Passes Preview */}
        {tickets && tickets.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardEyebrow, { color: brand.primary }]}>
              E-TICKET GATE PASS ({tickets.length} TIKET)
            </Text>

            <View style={{ gap: 10, marginTop: 10 }}>
              {tickets.map((t, idx) => (
                <View
                  key={t.id || idx}
                  style={[styles.ticketPassRow, { backgroundColor: colors.surfaceElevated }]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ticketPassCode, { color: colors.text }]}>
                      {t.ticket_code}
                    </Text>
                    <Text style={[styles.ticketPassStatus, { color: t.status === 'valid' ? '#10B981' : colors.textMuted }]}>
                      Status: {t.status.toUpperCase()}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      setSelectedQR({
                        ...t,
                        booking_code: booking.booking_code,
                        booking_status: booking.status,
                        event_name: event?.name,
                        event_date: event?.event_date,
                        event_time: event?.event_time,
                        venue: event?.venue,
                        ticket_type_name: ticket_type?.name,
                      } as any)
                    }
                    style={[styles.qrPassBtn, { backgroundColor: brand.primary }]}
                  >
                    <QrCode size={16} color="#FFFFFF" />
                    <Text style={styles.qrPassBtnText}>QR Gate</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Payment Summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardEyebrow, { color: brand.primary }]}>RINCIAN PEMBAYARAN</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              {ticket_type?.name || 'Tiket'} × {booking.quantity}
            </Text>
            <Text style={[styles.summaryVal, { color: colors.text }]}>
              {formatRupiah(booking.total_price)}
            </Text>
          </View>

          <View style={[styles.summaryTotalRow, { borderTopColor: colors.border }]}>
            <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.summaryTotalAmount, { color: brand.primary }]}>
              {formatRupiah(booking.total_price)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* QR Code Pass Modal */}
      <QRCodeModal
        visible={!!selectedQR}
        ticket={selectedQR}
        onClose={() => setSelectedQR(null)}
      />
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  statusBannerDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  metaCol: {
    marginTop: 10,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  buyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  buyerVal: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  ticketPassRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
  },
  ticketPassCode: {
    fontFamily: 'monospace',
    fontSize: 13.5,
    fontWeight: '800',
  },
  ticketPassStatus: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  qrPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  qrPassBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  summaryTotalAmount: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
});
