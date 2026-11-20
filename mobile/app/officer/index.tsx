import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  QrCode,
  RefreshCw,
  ScanLine,
  ShieldCheck,
  User,
  XCircle,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import {
  fetchOfficerStatsAsync,
  fetchScanHistoryWithMeta,
} from '../../src/api/endpoints';
import { formatWibTime } from '../../src/utils/formatters';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { Skeleton } from '../../src/components/common/Skeleton';
import { Typography } from '../../src/constants/Typography';

export default function OfficerDashboardScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<{ checked_in: number; valid_or_used: number } | null>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const hasLoadedRef = useRef(false);

  const loadDashboard = useCallback(async () => {
    setStatsError(null);
    setHistoryError(null);

    try {
      setStatsLoading(true);
      const s = await fetchOfficerStatsAsync();
      setStats(s);
    } catch (err: any) {
      setStatsError(err?.message || 'Gagal memuat statistik petugas.');
    } finally {
      setStatsLoading(false);
    }

    try {
      setHistoryLoading(true);
      const h = await fetchScanHistoryWithMeta();
      if (h.success) {
        setRecentActivities((h.data || []).slice(0, 5));
      } else {
        setHistoryError(h.error || 'Gagal memuat riwayat scan.');
      }
    } catch (err: any) {
      setHistoryError(err?.message || 'Gagal memuat riwayat scan.');
    } finally {
      setHistoryLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    fetchOfficerStatsAsync()
      .then((s) => {
        if (!ignore) {
          setStats(s);
          setStatsError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setStatsError(err?.message || 'Gagal memuat statistik petugas.');
        }
      })
      .finally(() => {
        if (!ignore) setStatsLoading(false);
      });

    fetchScanHistoryWithMeta()
      .then((h) => {
        if (ignore) return;
        if (h.success) {
          setRecentActivities((h.data || []).slice(0, 5));
          setHistoryError(null);
        } else {
          setHistoryError(h.error || 'Gagal memuat riwayat scan.');
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setHistoryError(err?.message || 'Gagal memuat riwayat scan.');
        }
      })
      .finally(() => {
        if (!ignore) {
          hasLoadedRef.current = true;
          setHistoryLoading(false);
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
      loadDashboard();
    }, [loadDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboard();
  };

  const statCards = [
    {
      name: 'Total Diperiksa',
      value: '—',
      subtext: 'Jumlah pemeriksaan belum tersedia',
      icon: ScanLine,
      color: brand.primary,
      bg: brand.primarySoft,
    },
    {
      name: 'Check-in Berhasil',
      value: statsLoading ? '...' : stats?.checked_in !== undefined ? String(stats.checked_in) : '—',
      subtext: 'Seluruh event & petugas aktif',
      icon: CheckCircle2,
      color: brand.success,
      bg: brand.successSoft,
    },
    {
      name: 'Tiket Ditolak',
      value: '—',
      subtext: 'Jumlah penolakan belum tersedia',
      icon: XCircle,
      color: brand.danger,
      bg: brand.dangerSoft,
    },
    {
      name: 'Tiket Valid + Digunakan',
      value: statsLoading ? '...' : stats?.valid_or_used !== undefined ? String(stats.valid_or_used) : '—',
      subtext: 'Seluruh event terdaftar di backend',
      icon: ShieldCheck,
      color: brand.cyan,
      bg: brand.cyanSoft,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Dashboard Petugas"
        subtitle={`Halo, ${user?.name || 'Petugas Lapangan'}`}
        rightAction={
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={onRefresh}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <RefreshCw size={17} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/officer/profile' as any)}
              style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
            >
              <User size={17} color={brand.primary} />
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={brand.primary} />}
      >
        {/* Banner Penugasan Event */}
        <View style={[styles.assignmentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.assignmentIconWrap, { backgroundColor: brand.primarySoft }]}>
            <Calendar size={20} color={brand.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, styles.assignmentTitle, { color: colors.text }]}>
              Penugasan Belum Diverifikasi
            </Text>
            <Text style={[Typography.caption, styles.assignmentDesc, { color: colors.textSecondary }]}>
              Data event, gate, shift, dan kapasitas penugasan belum dikonfigurasi backend. Hubungi koordinator untuk instruksi operasional gate.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.push('/officer/events' as any)}
              style={styles.assignmentLink}
            >
              <Text style={[styles.assignmentLinkText, { color: brand.primary }]}>
                Lihat status penugasan &rarr;
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Error Banner (if error) */}
        {(statsError || historyError) && (
          <View style={[styles.alertCard, { backgroundColor: brand.warningSoft, borderColor: brand.warning }]}>
            <AlertTriangle size={20} color={brand.warning} />
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, { color: brand.warning }]}>
                Gagal Memuat Data Operasional
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                {statsError || historyError}
              </Text>
              <TouchableOpacity
                onPress={loadDashboard}
                disabled={statsLoading || historyLoading}
                style={[styles.retryBtn, { borderColor: brand.warning }]}
              >
                <Text style={[styles.retryBtnText, { color: brand.warning }]}>Coba Lagi</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Action Cards */}
        <Text style={[Typography.h4, styles.sectionTitle, { color: colors.text }]}>
          Menu Operasional Gate
        </Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/officer/scan' as any)}
            style={[styles.actionCard, { backgroundColor: brand.primary }]}
          >
            <View style={styles.actionIconWrap}>
              <ScanLine size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.actionTitle}>Mulai Scan QR</Text>
            <Text style={styles.actionSub}>Kamera & scanner kode tiket</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/officer/validation' as any)}
            style={[styles.actionCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: brand.cyanSoft }]}>
              <QrCode size={24} color={brand.cyan} />
            </View>
            <Text style={[styles.actionTitle, { color: colors.text }]}>Validasi Manual</Text>
            <Text style={[styles.actionSub, { color: colors.textSecondary }]}>Cek & check-in manual</Text>
          </TouchableOpacity>
        </View>

        {/* 4 Statistik Cards */}
        <Text style={[Typography.h4, styles.sectionTitle, { color: colors.text, marginTop: 18 }]}>
          Statistik Operasional
        </Text>
        <View style={styles.statsGrid}>
          {statCards.map((st, idx) => {
            const Icon = st.icon;
            return (
              <View
                key={idx}
                style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={styles.statHeader}>
                  <Text style={[Typography.caption, styles.statName, { color: colors.textSecondary }]}>
                    {st.name}
                  </Text>
                  <View style={[styles.statIcon, { backgroundColor: st.bg }]}>
                    <Icon size={16} color={st.color} />
                  </View>
                </View>
                <Text style={[Typography.h2, styles.statValue, { color: colors.text }]}>
                  {st.value}
                </Text>
                <Text style={[Typography.caption, styles.statSubtext, { color: colors.textMuted }]}>
                  {st.subtext}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Quick Links Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 18 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/officer/history' as any)}
            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <View style={styles.menuLeft}>
              <Clock size={18} color={brand.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Riwayat Scan Lengkap</Text>
            </View>
            <ArrowRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/officer/events' as any)}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Calendar size={18} color={brand.cyan} />
              <Text style={[styles.menuText, { color: colors.text }]}>Daftar Event Aktif (Publik)</Text>
            </View>
            <ArrowRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Recent Activity List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[Typography.h4, styles.sectionTitle, { color: colors.text }]}>
            Aktivitas Scan Terkini
          </Text>
          <TouchableOpacity onPress={() => router.push('/officer/history' as any)}>
            <Text style={{ color: brand.primary, fontSize: 12, fontWeight: '600' }}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {historyLoading ? (
          <View style={{ gap: 8, marginTop: 8 }}>
            <Skeleton width="100%" height={60} borderRadius={16} />
            <Skeleton width="100%" height={60} borderRadius={16} />
          </View>
        ) : recentActivities.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.textMuted, fontSize: 13, textAlign: 'center' }}>
              Belum ada riwayat aktivitas scan tiket pada sesi ini.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 8, marginTop: 8 }}>
            {recentActivities.map((act, index) => (
              <View
                key={act.id || index}
                style={[styles.activityItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.activityCode, { color: colors.text }]}>
                    {act.ticket_code || 'Tiket'}
                  </Text>
                  <Text style={[styles.activitySub, { color: colors.textMuted }]}>
                    {act.event_name || 'Event'} • {act.buyer_name || act.attendee_name || 'Pembeli'}
                    {act.scanned_at || act.timestamp
                      ? ` • ${formatWibTime(act.scanned_at || act.timestamp)}`
                      : ''}
                  </Text>
                </View>
                <Badge
                  label={act.status || 'Berhasil'}
                  variant={
                    String(act.status || '').toLowerCase().includes('berhasil') ||
                    String(act.status || '').toLowerCase().includes('valid')
                      ? 'success'
                      : 'neutral'
                  }
                />
              </View>
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
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  assignmentCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  assignmentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentTitle: {
    marginBottom: 4,
  },
  assignmentDesc: {
    lineHeight: 18,
  },
  assignmentLink: {
    marginTop: 8,
  },
  assignmentLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  alertCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 16,
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
  sectionTitle: {
    marginBottom: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    minHeight: 120,
    justifyContent: 'center',
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48.5%',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  statName: {
    flex: 1,
    marginRight: 6,
    fontSize: 11,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 10,
    lineHeight: 14,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  activityCode: {
    fontSize: 13,
    fontWeight: '700',
  },
  activitySub: {
    fontSize: 11,
    marginTop: 2,
  },
});
