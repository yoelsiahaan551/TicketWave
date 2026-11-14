import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  LayoutDashboard,
  Plus,
  RefreshCw,
  Settings,
  Sparkles,
  Ticket,
  Users,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { fetchAdminAgencies, fetchAdminEventDetail, fetchAdminEvents } from '../../src/api/endpoints';
import { EventItem } from '../../src/types';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { EventCardSkeleton, Skeleton } from '../../src/components/common/Skeleton';
import { Typography } from '../../src/constants/Typography';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalAgencies, setTotalAgencies] = useState(0);
  const [totalSold, setTotalSold] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setError(null);
      const [eventsRes, agenciesRes] = await Promise.all([
        fetchAdminEvents({ page: 1, per_page: 20 }),
        fetchAdminAgencies({ page: 1, per_page: 20 }),
      ]);

      const items = eventsRes.data?.items || [];
      setTotalEvents(eventsRes.data?.total_items ?? items.length);
      setTotalAgencies(agenciesRes.data?.total_items ?? (agenciesRes.data?.items || []).length);

      const detailList = await Promise.all(
        items.slice(0, 8).map((ev) =>
          fetchAdminEventDetail(ev.id)
            .then((r) => r.data)
            .catch(() => ev)
        )
      );

      let soldSum = 0;
      const enriched = items.map((ev) => {
        const det = detailList.find((d) => d?.id === ev.id) || ev;
        const tts = det?.ticket_types || [];
        const evSold = tts.reduce((acc, t) => acc + Number(t.sold_count || 0), 0);
        const evQuota = tts.reduce((acc, t) => acc + Number(t.quota || 0), 0);
        soldSum += evSold;
        return {
          ...ev,
          sold_count: evSold,
          total_quota: evQuota,
          ticket_types_count: tts.length,
        };
      });

      setEvents(enriched);
      setTotalSold(soldSum);
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data dashboard admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const onSaleCount = events.filter((e) => e.status === 'on_sale').length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Admin Dashboard"
        subtitle="Pusat kendali operasional TicketWave"
        rightAction={
          <TouchableOpacity
            onPress={() => {
              setRefreshing(true);
              loadDashboard();
            }}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <RefreshCw size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadDashboard();
            }}
            tintColor={brand.primary}
          />
        }
      >
        {error && (
          <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
            <Text style={[Typography.caption, styles.errorText, { color: brand.danger }]}>
              {error}
            </Text>
          </View>
        )}

        {/* Stats Grid matching TicketWave-FE */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: brand.primarySoft }]}>
              <Calendar size={20} color={brand.primary} />
            </View>
            <Text style={[Typography.price, styles.statNum, { color: colors.text }]}>
              {totalEvents}
            </Text>
            <Text style={[Typography.caption, styles.statLabel, { color: colors.text }]}>
              Total Event
            </Text>
            <Text style={[Typography.caption, styles.statSubtext, { color: colors.textMuted }]}>
              GET /api/events
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: brand.successSoft }]}>
              <CheckCircle2 size={20} color={brand.success} />
            </View>
            <Text style={[Typography.price, styles.statNum, { color: brand.success }]}>
              {onSaleCount}
            </Text>
            <Text style={[Typography.caption, styles.statLabel, { color: colors.text }]}>
              Event On Sale
            </Text>
            <Text style={[Typography.caption, styles.statSubtext, { color: colors.textMuted }]}>
              Katalog publik aktif
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: brand.cyanSoft }]}>
              <Building2 size={20} color={brand.cyan} />
            </View>
            <Text style={[Typography.price, styles.statNum, { color: colors.text }]}>
              {totalAgencies}
            </Text>
            <Text style={[Typography.caption, styles.statLabel, { color: colors.text }]}>
              Agency Promotor
            </Text>
            <Text style={[Typography.caption, styles.statSubtext, { color: colors.textMuted }]}>
              Penyelenggara resmi
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.statIcon, { backgroundColor: brand.warningSoft }]}>
              <Ticket size={20} color={brand.warning} />
            </View>
            <Text style={[Typography.price, styles.statNum, { color: brand.warning }]}>
              {totalSold}
            </Text>
            <Text style={[Typography.caption, styles.statLabel, { color: colors.text }]}>
              Tiket Terjual
            </Text>
            <Text style={[Typography.caption, styles.statSubtext, { color: colors.textMuted }]}>
              Akumulasi sold_count
            </Text>
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.quickActionRow}>
          <Button
            title="Buat Event Baru"
            onPress={() => router.push('/admin/event/create' as any)}
            variant="gradient"
            size="md"
            icon={<Plus size={16} color="#FFFFFF" />}
            style={{ flex: 1 }}
          />
          <Button
            title="Tambah Agency"
            onPress={() => router.push('/admin/agency/create' as any)}
            variant="outline"
            size="md"
            icon={<Plus size={16} color={brand.primary} />}
            style={{ flex: 1 }}
          />
        </View>

        {/* Admin Navigation Menu */}
        <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
          Menu Administrasi
        </Text>
        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/events' as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: brand.primarySoft }]}>
              <Calendar size={18} color={brand.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, styles.menuTitle, { color: colors.text }]}>
                Kelola Event &amp; Fase Tiket
              </Text>
              <Text style={[Typography.caption, styles.menuSub, { color: colors.textMuted }]}>
                Status event, kuota tiket, dan fase harga bertingkat
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/agencies' as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: brand.cyanSoft }]}>
              <Building2 size={18} color={brand.cyan} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, styles.menuTitle, { color: colors.text }]}>
                Kelola Agency Promotor
              </Text>
              <Text style={[Typography.caption, styles.menuSub, { color: colors.textMuted }]}>
                CRUD data agency, PIC promotor, dan upload logo
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/users' as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: brand.purpleSoft }]}>
              <Users size={18} color={brand.purple} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, styles.menuTitle, { color: colors.text }]}>
                Users &amp; Officers
              </Text>
              <Text style={[Typography.caption, styles.menuSub, { color: colors.textMuted }]}>
                Info akun administrator aktif dan status officer agency
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/admin/settings' as any)}
          >
            <View style={[styles.menuIconWrap, { backgroundColor: brand.successSoft }]}>
              <Settings size={18} color={brand.success} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[Typography.h4, styles.menuTitle, { color: colors.text }]}>
                Pengaturan &amp; Kesehatan Server
              </Text>
              <Text style={[Typography.caption, styles.menuSub, { color: colors.textMuted }]}>
                Status endpoint API backend secara real-time
              </Text>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Recent Events Section */}
        <View style={styles.recentHeader}>
          <Text style={[Typography.h3, { color: colors.text }]}>
            Event Terbaru
          </Text>
          <TouchableOpacity onPress={() => router.push('/admin/events' as any)}>
            <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>
              Semua Event
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.eventRowCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="75%" height={16} />
                  <Skeleton width="50%" height={12} />
                </View>
                <Skeleton width={64} height={22} borderRadius={999} />
              </View>
            ))}
          </View>
        ) : (
          events.slice(0, 6).map((ev) => (
            <TouchableOpacity
              key={ev.id}
              onPress={() => router.push(`/admin/event/${ev.id}` as any)}
              style={[styles.eventRowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h4, styles.evName, { color: colors.text }]} numberOfLines={1}>
                  {ev.name}
                </Text>
                <Text style={[Typography.caption, styles.evMeta, { color: colors.textSecondary }]}>
                  {ev.city} • {ev.sold_count || 0}/{ev.total_quota || 0} tiket terjual
                </Text>
              </View>
              <Badge status={ev.status} />
            </TouchableOpacity>
          ))
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
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorText: {
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNum: {
    fontSize: 22,
    lineHeight: 26,
  },
  statLabel: {
    fontWeight: '700',
    marginTop: 2,
  },
  statSubtext: {
    fontSize: 10,
    marginTop: 2,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  menuCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 22,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 14,
  },
  menuSub: {
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 68,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
  },
  evName: {
    fontSize: 14,
  },
  evMeta: {
    marginTop: 2,
  },
});
