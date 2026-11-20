import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ShieldCheck,
  Ticket,
  User,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { executeCheckIn, inspectTicketCodeAsync } from '../../src/api/endpoints';
import {
  formatTanggalSingkat,
  formatWibDateTime,
  getOfficerStatusBadgeVariant,
} from '../../src/utils/formatters';
import { Header } from '../../src/components/common/Header';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { Input } from '../../src/components/common/Input';
import { Typography } from '../../src/constants/Typography';

export default function OfficerValidationScreen() {
  const { code: paramCode } = useLocalSearchParams<{ code?: string }>();
  const { colors, brand } = useAppTheme();

  const [codeOverride, setCodeOverride] = useState<{ param?: string; value: string } | null>(null);
  const ticketCode =
    codeOverride && codeOverride.param === paramCode ? codeOverride.value : paramCode || '';
  const setTicketCode = (val: string) => setCodeOverride({ param: paramCode, value: val });
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmittingCheckIn, setIsSubmittingCheckIn] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [checkedInSuccess, setCheckedInSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const checkInLockRef = useRef(false);

  const runValidation = async (codeToTest?: string) => {
    const target = (codeToTest ?? ticketCode).trim();
    if (!target) {
      setFeedbackError('Kode tiket atau token QR wajib diisi.');
      return;
    }

    setIsValidating(true);
    setResult(null);
    setCheckedInSuccess(false);
    setFeedbackError(null);

    try {
      const res = await inspectTicketCodeAsync(target);
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        status: 'GAGAL MEMERIKSA',
        code: target,
        server_verified: false,
        message: err?.message || 'Gagal menghubungi server.',
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (!paramCode || !paramCode.trim()) return;
    let ignore = false;
    const target = paramCode.trim();

    inspectTicketCodeAsync(target)
      .then((res) => {
        if (!ignore) {
          setResult(res);
          setIsValidating(false);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setResult({
            success: false,
            status: 'GAGAL MEMERIKSA',
            code: target,
            server_verified: false,
            message: err?.message || 'Gagal menghubungi server.',
          });
          setIsValidating(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [paramCode]);

  const handleConfirmCheckIn = async () => {
    if ((!result?.ticket && !result?.code) || checkInLockRef.current || isSubmittingCheckIn) {
      return;
    }

    const buyer = result.ticket?.buyer_name || result.ticket?.attendee_name || 'Pengunjung';
    const codeLabel = result.ticket?.ticket_code || result.code || ticketCode.trim();

    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        !window.confirm(
          `Konfirmasi Check-In Pengunjung?\n• Kode: ${codeLabel}\n• Nama: ${buyer}`
        )
      ) {
        return;
      }
    }

    checkInLockRef.current = true;
    setIsSubmittingCheckIn(true);
    setFeedbackError(null);

    try {
      const ticketParam = result.ticket || result.code;
      const res = await executeCheckIn(ticketParam);
      if (res.success) {
        setCheckedInSuccess(true);
        setResult((prev: any) => ({
          ...prev,
          success: true,
          status: 'CHECK-IN SELESAI',
          server_verified: true,
          message: res.message || 'Check-in berhasil dikonfirmasi.',
          ticket: {
            ...(prev?.ticket || {}),
            ...(res.ticket || {}),
            status: 'used',
          },
        }));
      } else {
        setResult((prev: any) => ({
          ...prev,
          ...res,
        }));
        setFeedbackError(res.message || 'Check-in ditolak sistem.');
        if (Platform.OS !== 'web') {
          Alert.alert('Gagal Check-In', res.message || 'Check-in ditolak sistem.');
        }
      }
    } catch (err: any) {
      const msg = err?.message || 'Terjadi kesalahan sistem saat check-in.';
      setFeedbackError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal Check-In', msg);
      }
    } finally {
      checkInLockRef.current = false;
      setIsSubmittingCheckIn(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Validasi Kode Tiket"
        subtitle="Pemeriksaan status & konfirmasi check-in"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Input Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.h4, styles.cardTitle, { color: colors.text }]}>
            Masukkan Kode Tiket / QR Token
          </Text>

          <Input
            placeholder="TKT-XXXXXXXX atau token QR"
            value={ticketCode}
            onChangeText={(txt) => {
              setTicketCode(txt);
              if (feedbackError) setFeedbackError(null);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            leftIcon={<Ticket size={18} color={brand.primary} />}
          />

          {feedbackError && (
            <Text style={{ color: brand.danger, fontSize: 12, fontWeight: '700', marginTop: 8 }}>
              {feedbackError}
            </Text>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <Button
              title="Periksa Validitas"
              onPress={() => runValidation()}
              loading={isValidating}
              size="md"
              style={{ flex: 1 }}
              icon={<Search size={16} color="#FFFFFF" />}
            />
            {ticketCode ? (
              <Button
                title="Bersihkan"
                onPress={() => {
                  setTicketCode('');
                  setResult(null);
                  setCheckedInSuccess(false);
                }}
                variant="outline"
                size="md"
              />
            ) : null}
          </View>
        </View>

        {/* Validation Result Box */}
        {result && (
          <View
            style={[
              styles.resultCard,
              {
                backgroundColor: colors.surface,
                borderColor:
                  result.status === 'VALID'
                    ? brand.success
                    : result.status === 'CHECK-IN SELESAI'
                    ? brand.cyan
                    : result.status === 'SUDAH DIGUNAKAN'
                    ? brand.warning
                    : brand.danger,
              },
            ]}
          >
            <View style={styles.resultHeader}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.resultCode, { color: colors.text }]}>
                  {result.ticket?.ticket_code || result.code || ticketCode}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                  Status Verifikasi Server
                </Text>
              </View>
              <Badge label={result.status} variant={getOfficerStatusBadgeVariant(result.status)} />
            </View>

            {result.message ? (
              <Text style={[styles.resultMsg, { color: colors.textSecondary }]}>
                {result.message}
              </Text>
            ) : null}

            {/* Server Verification Pill */}
            <View style={styles.serverPillRow}>
              {result.server_verified ? (
                <View style={[styles.serverPill, { backgroundColor: brand.successSoft }]}>
                  <ShieldCheck size={14} color={brand.success} />
                  <Text style={[styles.serverPillText, { color: brand.success }]}>
                    Diverifikasi Server Backend
                  </Text>
                </View>
              ) : (
                <View style={[styles.serverPill, { backgroundColor: brand.warningSoft }]}>
                  <AlertTriangle size={14} color={brand.warning} />
                  <Text style={[styles.serverPillText, { color: brand.warning }]}>
                    Belum Terkonfirmasi Server
                  </Text>
                </View>
              )}
            </View>

            {/* Ticket Metadata */}
            {result.ticket && (
              <View style={[styles.metadataWrap, { borderTopColor: colors.border }]}>
                <View style={styles.metaRow}>
                  <User size={15} color={brand.primary} />
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Nama Pembeli:</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {result.ticket.buyer_name || result.ticket.attendee_name || '-'}
                  </Text>
                </View>

                {result.ticket.booking_code && (
                  <View style={styles.metaRow}>
                    <Ticket size={15} color={brand.primary} />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Kode Booking:</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {result.ticket.booking_code}
                    </Text>
                  </View>
                )}

                <View style={styles.metaRow}>
                  <Ticket size={15} color={brand.primary} />
                  <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Kategori:</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>
                    {result.ticket.ticket_type_name || result.ticket.ticket_type || '-'}
                  </Text>
                </View>

                {result.ticket.event_name && (
                  <View style={styles.metaRow}>
                    <Calendar size={15} color={brand.primary} />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Event:</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {result.ticket.event_name}
                      {result.ticket.event_date ? ` (${formatTanggalSingkat(result.ticket.event_date)})` : ''}
                    </Text>
                  </View>
                )}

                {result.ticket.venue && (
                  <View style={styles.metaRow}>
                    <MapPin size={15} color={brand.primary} />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Venue:</Text>
                    <Text style={[styles.metaValue, { color: colors.text }]}>
                      {result.ticket.venue}
                    </Text>
                  </View>
                )}

                {result.first_checked_in_at && (
                  <View style={styles.metaRow}>
                    <Clock size={15} color={brand.warning} />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Check-In Awal:</Text>
                    <Text style={[styles.metaValue, { color: brand.warning }]}>
                      {formatWibDateTime(result.first_checked_in_at)}
                      {result.first_checked_in_by ? ` (${result.first_checked_in_by})` : ''}
                    </Text>
                  </View>
                )}

                {result.ticket.checked_in_at && result.status === 'CHECK-IN SELESAI' && (
                  <View style={styles.metaRow}>
                    <Clock size={15} color={brand.success} />
                    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>Waktu Check-In:</Text>
                    <Text style={[styles.metaValue, { color: brand.success }]}>
                      {formatWibDateTime(result.ticket.checked_in_at)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Check-In Confirmation Action */}
            {result.status === 'VALID' && (
              <Button
                title="Konfirmasi Check-In Pengunjung"
                onPress={handleConfirmCheckIn}
                loading={isSubmittingCheckIn}
                size="lg"
                variant="gradient"
                style={{ marginTop: 16 }}
                icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              />
            )}

            {checkedInSuccess && (
              <View style={[styles.successBanner, { backgroundColor: brand.successSoft }]}>
                <CheckCircle2 size={18} color={brand.success} />
                <Text style={[styles.successBannerText, { color: brand.success }]}>
                  Pengunjung diizinkan masuk gate acara.
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 12,
  },
  resultCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultCode: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultMsg: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  serverPillRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  serverPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metadataWrap: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaLabel: {
    fontSize: 12,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  successBannerText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
