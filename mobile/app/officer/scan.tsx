import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  BarcodeScanningResult,
  CameraType,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import {
  Camera,
  CheckCircle2,
  Flashlight,
  RotateCcw,
  ScanLine,
  Search,
  ShieldAlert,
  SwitchCamera,
  Ticket,
  Volume2,
  VolumeX,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { executeCheckIn, inspectTicketCodeAsync } from '../../src/api/endpoints';
import { Header } from '../../src/components/common/Header';
import { Button } from '../../src/components/common/Button';
import { Badge } from '../../src/components/common/Badge';
import { Input } from '../../src/components/common/Input';
import { Typography } from '../../src/constants/Typography';

export default function OfficerScanScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();
  const { user } = useAuth();

  // Camera permissions hook from expo-camera
  const [permission, requestPermission] = useCameraPermissions();

  // Scanner state
  const [facing, setFacing] = useState<CameraType>('back');
  const [torchOn, setTorchOn] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scannedLocked, setScannedLocked] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');

  // Input & validation state
  const [inputCode, setInputCode] = useState('');
  const [validating, setValidating] = useState(false);
  const [submittingCheckIn, setSubmittingCheckIn] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  // Concurrency & debounce ref
  const lastScanTimestampRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  // Perform validation on ticket code
  const handleValidate = useCallback(
    async (targetCode?: string) => {
      const code = (targetCode || inputCode).trim().toUpperCase();
      if (!code) {
        Alert.alert('Perhatian', 'Masukkan kode tiket atau token QR.');
        return;
      }

      setValidating(true);
      setResult(null);

      try {
        const res = await inspectTicketCodeAsync(code);
        setResult(res);
        setRecentScans((prev) => [
          { code, status: res.status, time: new Date().toLocaleTimeString() },
          ...prev.filter((item) => item.code !== code).slice(0, 4),
        ]);
      } catch (err: any) {
        setResult({
          success: false,
          status: 'GAGAL MEMERIKSA',
          code,
          message:
            err?.status === 404
              ? 'Endpoint scan belum aktif di Flask backend (/api/scan/validate - BLOCKED-BY-BACKEND).'
              : err?.message || 'Gagal menghubungi server backend.',
        });
      } finally {
        setValidating(false);
      }
    },
    [inputCode]
  );

  // Barcode scanned event from real camera
  const handleBarcodeScanned = useCallback(
    async (scanResult: BarcodeScanningResult) => {
      if (scannedLocked || isProcessingRef.current) return;

      const rawData = scanResult.data?.trim() || '';
      if (!rawData) return;

      const now = Date.now();
      // Debounce: prevent duplicate scan within 3 seconds for same code
      if (now - lastScanTimestampRef.current < 3000 && lastScannedCode === rawData) {
        return;
      }

      lastScanTimestampRef.current = now;
      isProcessingRef.current = true;
      setScannedLocked(true);
      setLastScannedCode(rawData);
      setInputCode(rawData);

      try {
        await handleValidate(rawData);
      } finally {
        isProcessingRef.current = false;
      }
    },
    [scannedLocked, lastScannedCode, handleValidate]
  );

  // Reset scanner to scan the next attendee
  const handleResetScanner = () => {
    setScannedLocked(false);
    setResult(null);
    setInputCode('');
  };

  // Confirm and execute check-in with prompt
  const handleConfirmCheckInPrompt = () => {
    if (!result?.ticket && !result?.code) return;
    const buyer = result.ticket?.buyer_name || 'Pengunjung';
    const code = result.code || inputCode;

    Alert.alert(
      'Konfirmasi Check-In Tiket',
      `Izinkan check-in untuk:\n• Kode: ${code}\n• Nama: ${buyer}\n\nTiket akan ditandai SUDAH DIGUNAKAN di database backend.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Konfirmasi Masuk Gate',
          style: 'default',
          onPress: () => performCheckIn(),
        },
      ]
    );
  };

  const performCheckIn = async () => {
    if (!result?.ticket && !result?.code) return;
    setSubmittingCheckIn(true);

    try {
      const ticketParam = result.ticket || result.code;
      const res = await executeCheckIn(ticketParam);
      if (res.success) {
        setResult((prev: any) => ({
          ...prev,
          status: 'CHECK-IN SELESAI',
          message: res.message || 'Check-in berhasil dikonfirmasi oleh sistem.',
          ticket: { ...(prev?.ticket || {}), status: 'used' },
        }));
        Alert.alert('Sukses Masuk Gate', 'Check-in tiket berhasil diverifikasi. Pengunjung diizinkan masuk.');
      } else {
        setResult((prev: any) => ({
          ...prev,
          ...res,
        }));
        Alert.alert('Check-In Ditolak', res.message || 'Gagal mengonfirmasi check-in.');
      }
    } catch (err: any) {
      Alert.alert(
        'Gagal Check-In',
        err?.status === 404
          ? 'Endpoint check-in belum aktif di Flask backend (/api/scan/check-in - BLOCKED-BY-BACKEND).'
          : err?.message || 'Terjadi kesalahan sistem saat check-in.'
      );
    } finally {
      setSubmittingCheckIn(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s.includes('VALID') || s.includes('SELESAI')) return 'success';
    if (s.includes('SUDAH') || s.includes('USED')) return 'warning';
    if (s.includes('DIBATALKAN') || s.includes('TIDAK') || s.includes('GAGAL')) return 'danger';
    return 'neutral';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Scanner QR Tiket"
        subtitle="Verifikasi & check-in tiket event"
        rightAction={
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <TouchableOpacity
              onPress={() => setTorchOn((v) => !v)}
              style={[
                styles.iconBtn,
                { backgroundColor: torchOn ? brand.primary : colors.surfaceElevated },
              ]}
            >
              <Flashlight size={16} color={torchOn ? '#FFFFFF' : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFacing((curr) => (curr === 'back' ? 'front' : 'back'))}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <SwitchCamera size={16} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSoundEnabled((v) => !v)}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              {soundEnabled ? (
                <Volume2 size={16} color={brand.primary} />
              ) : (
                <VolumeX size={16} color={colors.textMuted} />
              )}
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Real CameraView Box */}
        <View style={styles.cameraContainer}>
          {!permission ? (
            <View style={styles.permissionBox}>
              <Text style={{ color: '#FFFFFF', fontSize: 13 }}>Memeriksa izin kamera perangkat...</Text>
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionBox}>
              <ShieldAlert size={40} color={brand.warning} />
              <Text style={styles.permissionTitle}>Izin Kamera Diperlukan</Text>
              <Text style={styles.permissionDesc}>
                Untuk membaca QR code tiket secara otomatis, berikan izin akses kamera perangkat Anda.
              </Text>
              <Button
                title="Berikan Izin Kamera"
                onPress={requestPermission}
                size="md"
                variant="gradient"
                style={{ marginTop: 14 }}
                icon={<Camera size={16} color="#FFFFFF" />}
              />
              <Text style={styles.permissionSub}>
                Jika izin ditolak permanen, gunakan form input kode tiket manual di bawah.
              </Text>
            </View>
          ) : (
            <View style={styles.cameraWrap}>
              <CameraView
                facing={facing}
                enableTorch={torchOn}
                barcodeScannerSettings={{
                  barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={scannedLocked ? undefined : handleBarcodeScanned}
                style={StyleSheet.absoluteFill}
              />

              {/* Viewfinder Overlay Frame */}
              <View style={styles.overlayMask}>
                <View style={styles.viewfinderInner}>
                  <View style={styles.cornerTL} />
                  <View style={styles.cornerTR} />
                  <View style={styles.cornerBL} />
                  <View style={styles.cornerBR} />

                  {!scannedLocked && <View style={styles.laserLine} />}

                  <View style={styles.viewfinderCenter}>
                    {scannedLocked ? (
                      <View style={styles.lockedBadge}>
                        <CheckCircle2 size={32} color="#10B981" />
                        <Text style={styles.lockedText}>QR Code Terdeteksi!</Text>
                      </View>
                    ) : (
                      <ScanLine size={36} color="rgba(255,255,255,0.7)" />
                    )}
                  </View>
                </View>

                {/* Bottom Bar Controls inside camera */}
                <View style={styles.cameraBottomBar}>
                  <Text style={styles.cameraMetaText}>
                    Gate: {user?.assigned_gate || 'Utama'} • Mode: Kamera Aktif
                  </Text>
                  {scannedLocked && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={handleResetScanner}
                      style={[styles.resetScanBtn, { backgroundColor: brand.primary }]}
                    >
                      <RotateCcw size={14} color="#FFFFFF" />
                      <Text style={styles.resetScanText}>Scan Tiket Berikutnya</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Manual Code Input Box (Fallback) */}
        <View style={[styles.inputCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.h4, styles.inputTitle, { color: colors.text }]}>
            Input Kode Tiket Manual (Fallback)
          </Text>
          <Text style={[Typography.caption, styles.inputSub, { color: colors.textSecondary }]}>
            Gunakan jika QR Code kotor/rusak atau kamera dinonaktifkan
          </Text>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="Contoh: TCK-XXXXXX"
                value={inputCode}
                onChangeText={setInputCode}
                autoCapitalize="characters"
                leftIcon={<Ticket size={18} color={brand.primary} />}
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <Button
              title="Periksa Tiket"
              onPress={() => handleValidate()}
              loading={validating}
              size="md"
              style={{ flex: 1 }}
              icon={<Search size={16} color="#FFFFFF" />}
            />
            {inputCode ? (
              <Button
                title="Buka Validator"
                onPress={() =>
                  router.push({
                    pathname: '/officer/validation' as any,
                    params: { code: inputCode.trim() },
                  })
                }
                variant="outline"
                size="md"
              />
            ) : null}
          </View>
        </View>

        {/* Result Inspection Card */}
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
              <View>
                <Text style={[styles.resultCode, { color: colors.text }]}>
                  {result.code || inputCode}
                </Text>
                <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                  Hasil verifikasi backend
                </Text>
              </View>
              <Badge label={result.status} variant={getStatusBadgeVariant(result.status)} />
            </View>

            {result.message ? (
              <Text style={[styles.resultMsg, { color: colors.textSecondary }]}>
                {result.message}
              </Text>
            ) : null}

            {result.ticket && (
              <View style={[styles.ticketDetails, { borderTopColor: colors.border }]}>
                <Text style={[styles.detailRow, { color: colors.text }]}>
                  Nama: <Text style={{ fontWeight: '700' }}>{result.ticket.buyer_name || 'Pembeli'}</Text>
                </Text>
                <Text style={[styles.detailRow, { color: colors.text }]}>
                  Event: <Text style={{ fontWeight: '700' }}>{result.ticket.event_name || '-'}</Text>
                </Text>
                <Text style={[styles.detailRow, { color: colors.text }]}>
                  Kategori: <Text style={{ fontWeight: '700' }}>{result.ticket.ticket_type_name || '-'}</Text>
                </Text>
              </View>
            )}

            {/* Check-In CTA Button with Confirmation */}
            {result.status === 'VALID' && (
              <Button
                title="Konfirmasi Check-In Sekarang"
                onPress={handleConfirmCheckInPrompt}
                loading={submittingCheckIn}
                size="lg"
                variant="gradient"
                style={{ marginTop: 14 }}
                icon={<CheckCircle2 size={18} color="#FFFFFF" />}
              />
            )}

            {result.status === 'CHECK-IN SELESAI' && (
              <Button
                title="Scan Pengunjung Berikutnya"
                onPress={handleResetScanner}
                size="md"
                variant="outline"
                style={{ marginTop: 12 }}
                icon={<RotateCcw size={16} color={brand.primary} />}
              />
            )}
          </View>
        )}

        {/* Recent Scans in this session */}
        {recentScans.length > 0 && (
          <View style={[styles.recentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[Typography.h4, styles.recentTitle, { color: colors.text }]}>
              Kode Terakhir Diperiksa
            </Text>
            {recentScans.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => {
                  setInputCode(item.code);
                  handleValidate(item.code);
                }}
                style={[
                  styles.recentItem,
                  idx < recentScans.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View>
                  <Text style={[styles.recentCode, { color: colors.text }]}>{item.code}</Text>
                  <Text style={[Typography.caption, { color: colors.textMuted }]}>{item.time}</Text>
                </View>
                <Badge label={item.status} variant={getStatusBadgeVariant(item.status)} />
              </TouchableOpacity>
            ))}
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
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  cameraContainer: {
    height: 280,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cameraWrap: {
    flex: 1,
    position: 'relative',
  },
  permissionBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 8,
  },
  permissionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 6,
  },
  permissionDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  permissionSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
  overlayMask: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewfinderInner: {
    width: 200,
    height: 200,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0080F2',
  },
  cornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 28,
    height: 28,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0080F2',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0080F2',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0080F2',
  },
  laserLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: '50%',
    height: 2.5,
    backgroundColor: '#00D4FF',
    shadowColor: '#00D4FF',
    shadowRadius: 8,
    shadowOpacity: 0.9,
  },
  viewfinderCenter: {
    alignItems: 'center',
    gap: 8,
  },
  lockedBadge: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  lockedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraBottomBar: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraMetaText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },
  resetScanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  resetScanText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  inputCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  inputTitle: {
    marginBottom: 2,
  },
  inputSub: {
    marginBottom: 12,
  },
  inputRow: {
    marginBottom: 4,
  },
  resultCard: {
    padding: 16,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  resultMsg: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  ticketDetails: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 4,
  },
  detailRow: {
    fontSize: 13,
  },
  recentCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  recentTitle: {
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  recentCode: {
    fontSize: 13,
    fontWeight: '700',
  },
});
