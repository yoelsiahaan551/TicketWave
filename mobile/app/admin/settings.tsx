import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, Moon, Palette, RefreshCw, Server, Sun, XCircle } from 'lucide-react-native';

import { useAppTheme } from '@/src/context/ThemeContext';
import { fetchAdminAgencies, fetchAdminEvents } from '@/src/api/endpoints';
import api from '@/src/api/client';
import { Header } from '@/src/components/common/Header';
import { Button } from '@/src/components/common/Button';
import { Skeleton } from '@/src/components/common/Skeleton';
import { Typography } from '@/src/constants/Typography';

export default function AdminSettingsScreen() {
  const { colors, brand, mode, setMode } = useAppTheme();

  const [checking, setChecking] = useState(true);
  const [health, setHealth] = useState<{ status: string; service?: string; error?: string } | null>(null);
  const [totalEvents, setTotalEvents] = useState<number | null>(null);
  const [totalAgencies, setTotalAgencies] = useState<number | null>(null);

  const checkSystem = useCallback(async () => {
    setChecking(true);
    try {
      const [hRes, evRes, agRes] = await Promise.allSettled([
        api.checkHealth(),
        fetchAdminEvents({ page: 1, per_page: 1 }),
        fetchAdminAgencies({ page: 1, per_page: 1 }),
      ]);

      if (hRes.status === 'fulfilled') {
        setHealth(hRes.value);
      } else {
        setHealth({ status: 'unreachable', error: hRes.reason?.message });
      }

      if (evRes.status === 'fulfilled') {
        setTotalEvents(evRes.value.data?.total_items ?? 0);
      }
      if (agRes.status === 'fulfilled') {
        setTotalAgencies(agRes.value.data?.total_items ?? 0);
      }
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkSystem();
  }, [checkSystem]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Admin Settings"
        subtitle="Tema &amp; kesehatan backend"
        rightAction={
          <TouchableOpacity
            onPress={checkSystem}
            style={[styles.iconBtn, { backgroundColor: colors.surfaceElevated }]}
          >
            <RefreshCw size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Theme Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Palette size={18} color={brand.primary} />
            <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>
              Tema Panel Admin
            </Text>
          </View>

          <View style={styles.themeRow}>
            <TouchableOpacity
              onPress={() => setMode('light')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: mode === 'light' ? brand.primarySoft : colors.surfaceElevated,
                  borderColor: mode === 'light' ? brand.primary : colors.border,
                },
              ]}
            >
              <Sun size={20} color={mode === 'light' ? brand.primary : colors.textSecondary} />
              <Text
                style={[
                  Typography.caption,
                  styles.themeBtnText,
                  { color: mode === 'light' ? brand.primary : colors.text },
                ]}
              >
                Terang (Light)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode('dark')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: mode === 'dark' ? brand.primarySoft : colors.surfaceElevated,
                  borderColor: mode === 'dark' ? brand.primary : colors.border,
                },
              ]}
            >
              <Moon size={20} color={mode === 'dark' ? brand.primary : colors.textSecondary} />
              <Text
                style={[
                  Typography.caption,
                  styles.themeBtnText,
                  { color: mode === 'dark' ? brand.primary : colors.text },
                ]}
              >
                Gelap (Dark)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server Health Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Server size={18} color={brand.primary} />
            <Text style={[Typography.h3, styles.cardTitle, { color: colors.text }]}>
              Status Server (GET /health)
            </Text>
          </View>

          <Text style={[Typography.caption, styles.urlLabel, { color: colors.textMuted }]}>
            Endpoint aktif: {api.getBaseUrl()}
          </Text>

          {checking ? (
            <Skeleton width="100%" height={56} borderRadius={16} style={{ marginBottom: 14 }} />
          ) : (
            <View
              style={[
                styles.healthBox,
                {
                  backgroundColor: health?.status === 'ok' ? brand.successSoft : brand.dangerSoft,
                  borderColor: health?.status === 'ok' ? brand.success : brand.danger,
                },
              ]}
            >
              {health?.status === 'ok' ? (
                <CheckCircle2 size={20} color={brand.success} />
              ) : (
                <XCircle size={20} color={brand.danger} />
              )}
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    Typography.caption,
                    {
                      color: health?.status === 'ok' ? brand.success : brand.danger,
                      fontWeight: '800',
                    },
                  ]}
                >
                  {health?.status === 'ok'
                    ? `${health.service || 'TicketWave Backend'} (ONLINE)`
                    : 'Backend Tidak Terhubung'}
                </Text>
                {health?.error && (
                  <Text style={[Typography.caption, { color: brand.danger, fontSize: 11, marginTop: 2 }]}>
                    {health.error}
                  </Text>
                )}
              </View>
            </View>
          )}

          <View style={styles.metricsRow}>
            <View style={[styles.metricPill, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[Typography.price, styles.metricNum, { color: colors.text }]}>
                {totalEvents ?? '-'}
              </Text>
              <Text style={[Typography.caption, styles.metricLabel, { color: colors.textMuted }]}>
                Total Events
              </Text>
            </View>
            <View style={[styles.metricPill, { backgroundColor: colors.surfaceElevated }]}>
              <Text style={[Typography.price, styles.metricNum, { color: colors.text }]}>
                {totalAgencies ?? '-'}
              </Text>
              <Text style={[Typography.caption, styles.metricLabel, { color: colors.textMuted }]}>
                Total Agencies
              </Text>
            </View>
          </View>

          <Button
            title="Cek Ulang Koneksi"
            onPress={checkSystem}
            loading={checking}
            variant="outline"
            size="md"
            style={{ marginTop: 14 }}
          />
        </View>
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
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  themeBtnText: {
    fontWeight: '800',
  },
  urlLabel: {
    marginBottom: 12,
  },
  healthBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricPill: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 22,
    lineHeight: 26,
  },
  metricLabel: {
    marginTop: 2,
  },
});
