import React, { useMemo } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import QRCode from 'qrcode';
import Svg, { Rect, Path } from 'react-native-svg';
import * as Clipboard from 'expo-clipboard';
import { Calendar, Copy, MapPin, ShieldCheck, X } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { TicketItem } from '../../types';
import { formatTanggal, formatWaktu } from '../../utils/formatters';
import { Badge } from '../common/Badge';

interface QRCodeModalProps {
  visible: boolean;
  ticket: TicketItem | null;
  onClose: () => void;
}

function QrSvg({ value, size = 200 }: { value: string; size?: number }) {
  const pathData = useMemo(() => {
    try {
      const qr = QRCode.create(value || 'TICKETWAVE', { errorCorrectionLevel: 'M' });
      const modules = qr.modules;
      const count = modules.size;
      const cellSize = size / count;
      let d = '';
      for (let r = 0; r < count; r++) {
        for (let c = 0; c < count; c++) {
          if (modules.get(r, c)) {
            const x = (c * cellSize).toFixed(2);
            const y = (r * cellSize).toFixed(2);
            const w = cellSize.toFixed(2);
            d += `M${x},${y}h${w}v${w}h-${w}z`;
          }
        }
      }
      return d;
    } catch {
      return '';
    }
  }, [value, size]);

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Rect x={0} y={0} width={size} height={size} fill="#FFFFFF" rx={12} />
      <Path d={pathData} fill="#0F172A" />
    </Svg>
  );
}

export function QRCodeModal({ visible, ticket, onClose }: QRCodeModalProps) {
  const { colors, brand } = useAppTheme();

  if (!ticket) return null;

  const handleCopyToken = async () => {
    await Clipboard.setStringAsync(ticket.qr_token || ticket.ticket_code);
    Alert.alert('Disalin', 'Kode QR / Token tiket disalin ke clipboard.');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: brand.primary }]}>E-TICKET QR PASS</Text>
              <Text style={[styles.eventName, { color: colors.text }]} numberOfLines={2}>
                {ticket.event_name}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Meta */}
          <View style={[styles.metaCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.metaRow}>
              <Calendar size={14} color={brand.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                {formatTanggal(ticket.event_date)}
                {ticket.event_time ? ` • ${formatWaktu(ticket.event_time)}` : ''}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={14} color={brand.primary} />
              <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={2}>
                {ticket.venue}
              </Text>
            </View>
            <View style={styles.badgeLine}>
              <Badge label={ticket.ticket_type_name || 'Regular'} variant="primary" />
              <Badge status={ticket.status} />
            </View>
          </View>

          {/* QR Code Box */}
          <View style={styles.qrWrapper}>
            <View style={styles.qrBox}>
              <QrSvg value={ticket.qr_token || ticket.ticket_code} size={200} />
            </View>
            <Text style={[styles.ticketCode, { color: colors.text }]}>
              {ticket.ticket_code}
            </Text>
            <TouchableOpacity onPress={handleCopyToken} style={styles.copyBtn}>
              <Copy size={14} color={brand.primary} />
              <Text style={[styles.copyText, { color: brand.primary }]}>
                Salin QR Token ({ticket.qr_token?.slice(0, 12)}...)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Buyer & Note */}
          <View style={[styles.noteBox, { backgroundColor: brand.primarySoft }]}>
            <ShieldCheck size={18} color={brand.primary} />
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>
              Tunjukkan QR Pass ini kepada petugas gate saat check-in di lokasi event. Pemegang: {ticket.buyer_name || 'Pemilik Tiket'}.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    borderTopWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  eventName: {
    fontSize: 19,
    fontWeight: '900',
    marginTop: 2,
    maxWidth: 280,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCard: {
    borderRadius: 16,
    padding: 14,
    gap: 8,
    marginBottom: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 13,
    flex: 1,
  },
  badgeLine: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  qrWrapper: {
    alignItems: 'center',
    marginBottom: 18,
  },
  qrBox: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  ticketCode: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
    letterSpacing: 1,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  noteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
});
