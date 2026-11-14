import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react-native';

import { useAppTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { createCheckout } from '../src/api/endpoints';
import { saveBookingEntry } from '../src/utils/storage';
import { formatRupiah, formatTanggalSingkat } from '../src/utils/formatters';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';

const PAYMENT_METHODS = [
  { id: 'transfer_bank', label: 'Transfer Bank / Virtual Account', icon: Building2, desc: 'BCA, Mandiri, BNI, BRI' },
  { id: 'qris_ewallet', label: 'QRIS & E-Wallet', icon: Smartphone, desc: 'GoPay, OVO, DANA, ShopeePay' },
  { id: 'credit_card', label: 'Kartu Kredit / Debit', icon: CreditCard, desc: 'Visa, Mastercard, JCB' },
];

export default function CheckoutScreen() {
  const { payload } = useLocalSearchParams<{ payload?: string }>();
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();
  const { user } = useAuth();

  const checkoutData = useMemo(() => {
    try {
      return payload ? JSON.parse(payload) : null;
    } catch {
      return null;
    }
  }, [payload]);

  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('transfer_bank');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!checkoutData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header showBack title="Checkout Tiket" />
        <View style={styles.emptyWrap}>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Data Checkout Tidak Ditemukan</Text>
          <Text style={[styles.emptyDesc, { color: colors.textSecondary }]}>
            Silakan pilih event dan kategori tiket terlebih dahulu.
          </Text>
          <Button
            title="Cari Event"
            onPress={() => router.replace('/(tabs)/events')}
            style={{ marginTop: 14 }}
          />
        </View>
      </View>
    );
  }

  const handleConfirm = async () => {
    setError(null);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!buyerName.trim() || buyerName.trim().length < 2) {
      setError('Nama lengkap pembeli wajib diisi (minimal 2 karakter).');
      return;
    }
    if (!buyerEmail.trim() || !emailRegex.test(buyerEmail.trim())) {
      setError('Format email pembeli tidak valid.');
      return;
    }
    if (!buyerPhone.trim() || buyerPhone.trim().length < 10) {
      setError('Nomor telepon wajib diisi minimal 10 digit.');
      return;
    }
    if (recipientEmail.trim() && !emailRegex.test(recipientEmail.trim())) {
      setError('Format email penerima tiket tidak valid.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createCheckout({
        event_id: Number(checkoutData.eventId),
        ticket_type_id: Number(checkoutData.ticketTypeId),
        quantity: Number(checkoutData.quantity),
        buyer_name: buyerName.trim(),
        buyer_email: buyerEmail.trim(),
        buyer_phone: buyerPhone.trim(),
        ...(recipientEmail.trim() ? { recipient_email: recipientEmail.trim() } : {}),
      });

      if (res.success && res.data?.booking) {
        const booking = res.data.booking;
        const payUrl = res.data.payment_url || booking.payment_url || null;

        await saveBookingEntry({
          booking_code: booking.booking_code,
          payment_url: payUrl,
          recipient_email: recipientEmail.trim() || buyerEmail.trim(),
          event_name: checkoutData.eventName,
        });

        Alert.alert(
          'Pesanan Berhasil Dibuat!',
          `Kode Booking: ${booking.booking_code}\n\nSilakan selesaikan pembayaran dalam 15 menit agar kuota tiket Anda terjamin.`,
          [
            {
              text: 'Buka Pembayaran',
              onPress: async () => {
                if (payUrl) {
                  try {
                    await Linking.openURL(payUrl);
                  } catch {
                    // ignore
                  }
                }
                router.replace(`/order/${booking.booking_code}` as any);
              },
            },
            {
              text: 'Lihat Detail Pesanan',
              style: 'cancel',
              onPress: () => router.replace(`/order/${booking.booking_code}` as any),
            },
          ]
        );
      } else {
        setError(res.message || 'Gagal memproses pemesanan tiket.');
      }
    } catch (err: any) {
      setError(
        err?.status === 500
          ? `Terjadi kesalahan internal pada server (HTTP 500): ${err?.message}`
          : err?.message || 'Gagal memproses checkout. Silakan coba kembali.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const totalAmount = Number(checkoutData.unitPrice || 0) * Number(checkoutData.quantity || 1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Checkout Tiket" subtitle="Langkah 1 dari 2: Data Pemesan" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Step Badge */}
          <View style={styles.stepBadgeRow}>
            <View style={[styles.stepBadge, { backgroundColor: isDark ? 'rgba(0,128,242,0.18)' : '#EFF6FF', borderColor: brand.primary }]}>
              <Sparkles size={13} color={brand.primary} />
              <Text style={[styles.stepBadgeText, { color: brand.primary }]}>
                Garansi Kuota 15 Menit Aktif
              </Text>
            </View>
          </View>

          {/* Event Summary Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardEyebrow, { color: brand.primary }]}>RINGKASAN TIKET</Text>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{checkoutData.eventName}</Text>

            <View style={styles.eventMetaRow}>
              {checkoutData.eventDate && (
                <View style={styles.metaItem}>
                  <CalendarDays size={13} color={brand.primary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                    {formatTanggalSingkat(checkoutData.eventDate)}
                  </Text>
                </View>
              )}
              {checkoutData.venue && (
                <View style={styles.metaItem}>
                  <MapPin size={13} color={brand.primary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {checkoutData.venue}
                  </Text>
                </View>
              )}
            </View>

            <View style={[styles.tierRow, { backgroundColor: colors.surfaceElevated }]}>
              <View>
                <Text style={[styles.tierName, { color: colors.text }]}>
                  {checkoutData.ticketName}
                </Text>
                <Text style={[styles.tierUnitPrice, { color: colors.textMuted }]}>
                  {formatRupiah(checkoutData.unitPrice)} × {checkoutData.quantity} tiket
                </Text>
              </View>

              <Text style={[styles.tierSubtotal, { color: brand.primary }]}>
                {formatRupiah(totalAmount)}
              </Text>
            </View>
          </View>

          {/* Buyer Information Form */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardEyebrow, { color: brand.primary }]}>DATA PEMESAN</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Informasi Pembeli</Text>
            <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
              E-ticket dan konfirmasi pesanan akan dikirimkan ke kontak ini.
            </Text>

            <Input
              label="Nama Lengkap *"
              placeholder="Contoh: John Doe"
              value={buyerName}
              onChangeText={setBuyerName}
              leftIcon={<User size={16} color={brand.primary} />}
            />

            <Input
              label="Alamat Email *"
              placeholder="contoh: john@example.com"
              value={buyerEmail}
              onChangeText={setBuyerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={16} color={brand.primary} />}
            />

            <Input
              label="Nomor WhatsApp / Telepon *"
              placeholder="081234567890"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              keyboardType="phone-pad"
              leftIcon={<Phone size={16} color={brand.primary} />}
            />

            <Input
              label="Email Penerima Tiket (Opsional)"
              placeholder="Kosongkan jika sama dengan email pembeli"
              value={recipientEmail}
              onChangeText={setRecipientEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={16} color={colors.textMuted} />}
            />
          </View>

          {/* Payment Method Selector */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardEyebrow, { color: brand.primary }]}>METODE PEMBAYARAN</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Pilih Pembayaran</Text>

            <View style={{ gap: 10, marginTop: 12 }}>
              {PAYMENT_METHODS.map((method) => {
                const selected = paymentMethod === method.id;
                const IconComp = method.icon;
                return (
                  <TouchableOpacity
                    key={method.id}
                    activeOpacity={0.8}
                    onPress={() => setPaymentMethod(method.id)}
                    style={[
                      styles.methodCard,
                      {
                        backgroundColor: selected ? (isDark ? 'rgba(0,128,242,0.18)' : '#EFF6FF') : colors.surfaceElevated,
                        borderColor: selected ? brand.primary : colors.border,
                      },
                    ]}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: selected ? brand.primary : colors.surface }]}>
                      <IconComp size={18} color={selected ? '#FFFFFF' : brand.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                      <Text style={[styles.methodDesc, { color: colors.textMuted }]}>{method.desc}</Text>
                    </View>
                    {selected && <CheckCircle2 size={18} color={brand.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Price Breakdown / Summary Card */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardEyebrow, { color: brand.primary }]}>RINCIAN BIAYA</Text>
            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                Harga Tiket ({checkoutData.quantity}x)
              </Text>
              <Text style={[styles.breakdownVal, { color: colors.text }]}>
                {formatRupiah(totalAmount)}
              </Text>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>
                Biaya Layanan / Admin
              </Text>
              <Text style={[styles.breakdownVal, { color: '#10B981', fontWeight: '800' }]}>
                Bebas Biaya
              </Text>
            </View>

            <View style={[styles.totalDivider, { borderTopColor: colors.border }]}>
              <View style={styles.totalRow}>
                <View>
                  <Text style={[styles.totalLabel, { color: colors.textMuted }]}>Total Pembayaran</Text>
                  <Text style={[styles.totalAmount, { color: brand.primary }]}>
                    {formatRupiah(totalAmount)}
                  </Text>
                </View>
              </View>
            </View>

            {error ? (
              <View style={[styles.errorBox, { backgroundColor: isDark ? 'rgba(239,68,68,0.18)' : '#FEE2E2', borderColor: '#EF4444' }]}>
                <Text style={{ color: brand.danger, fontSize: 12.5, fontWeight: '700' }}>{error}</Text>
              </View>
            ) : null}

            <Button
              title="Konfirmasi & Bayar Sekarang"
              onPress={handleConfirm}
              variant="gradient"
              size="lg"
              loading={submitting}
              icon={<ArrowRight size={18} color="#FFFFFF" />}
              iconPosition="right"
              style={{ marginTop: 16 }}
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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  stepBadgeRow: {
    marginBottom: 12,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  stepBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  eventMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  tierName: {
    fontSize: 14,
    fontWeight: '800',
  },
  tierUnitPrice: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  tierSubtotal: {
    fontSize: 15,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  cardDesc: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 2,
    marginBottom: 14,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    gap: 12,
  },
  methodIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  methodDesc: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  breakdownVal: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  totalDivider: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
  },
});
