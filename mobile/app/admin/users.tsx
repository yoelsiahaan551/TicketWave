import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Building2, Info, Mail, Phone, RefreshCw } from 'lucide-react-native';

import { useAppTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { fetchAdminAgencies } from '@/src/api/endpoints';
import { Agency } from '@/src/types';
import { Header } from '@/src/components/common/Header';
import { Badge } from '@/src/components/common/Badge';
import { Skeleton } from '@/src/components/common/Skeleton';
import { Typography } from '@/src/constants/Typography';

export default function AdminUsersScreen() {
  const { colors, brand } = useAppTheme();
  const { user } = useAuth();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchAdminAgencies({ page: 1, per_page: 50 })
      .then((res) => {
        if (!ignore) {
          setAgencies(res.data?.items || []);
        }
      })
      .catch(() => {
        if (!ignore) {
          setAgencies([]);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminAgencies({ page: 1, per_page: 50 })
      .then((res) => {
        setAgencies(res.data?.items || []);
      })
      .catch(() => {
        setAgencies([]);
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Users &amp; Officers"
        subtitle="Status akun admin &amp; agency officer"
        rightAction={
          <TouchableOpacity
            onPress={onRefresh}
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
            onRefresh={onRefresh}
            tintColor={brand.primary}
          />
        }
      >
        {/* Backend Limitation Notice */}
        <View style={[styles.noticeCard, { backgroundColor: brand.primarySoft, borderColor: brand.primary }]}>
          <Info size={18} color={brand.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[Typography.h4, styles.noticeTitle, { color: colors.text }]}>
              Catatan Keterbatasan Endpoint Backend
            </Text>
            <Text style={[Typography.caption, styles.noticeDesc, { color: colors.textSecondary }]}>
              Backend TicketWave saat ini belum menyediakan endpoint GET /api/users untuk daftar seluruh user. Halaman ini menampilkan akun Admin aktif dari GET /api/auth/me dan status officer per agency dari GET /api/agencies.
            </Text>
          </View>
        </View>

        {/* Active Admin Card */}
        {user && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[Typography.h3, styles.sectionTitle, { color: colors.text }]}>
              Admin Aktif (GET /api/auth/me)
            </Text>
            <View style={styles.adminRow}>
              <View style={[styles.avatar, { backgroundColor: brand.primary }]}>
                <Text style={styles.avatarText}>{user.name?.charAt(0).toUpperCase() || 'A'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h3, styles.userName, { color: colors.text }]}>{user.name}</Text>
                <View style={styles.metaRow}>
                  <Mail size={13} color={brand.primary} />
                  <Text style={[Typography.caption, styles.metaText, { color: colors.textSecondary }]}>
                    {user.email}
                  </Text>
                </View>
                {user.phone && (
                  <View style={styles.metaRow}>
                    <Phone size={13} color={brand.primary} />
                    <Text style={[Typography.caption, styles.metaText, { color: colors.textSecondary }]}>
                      {user.phone}
                    </Text>
                  </View>
                )}
              </View>
              <Badge label={`Role: ${user.role?.toUpperCase()}`} variant="primary" />
            </View>
          </View>
        )}

        {/* Agencies Officer Status */}
        <Text style={[Typography.h3, styles.listTitle, { color: colors.text }]}>
          Status Officer Agency ({agencies.length})
        </Text>

        {loading ? (
          <View style={{ gap: 10 }}>
            {[1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.agencyRowCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Skeleton width={38} height={38} borderRadius={12} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
            ))}
          </View>
        ) : (
          agencies.map((ag) => (
            <View
              key={ag.id}
              style={[styles.agencyRowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={[styles.agIcon, { backgroundColor: colors.surfaceElevated }]}>
                <Building2 size={18} color={brand.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h4, styles.agName, { color: colors.text }]}>{ag.name}</Text>
                <Text style={[Typography.caption, styles.agPic, { color: colors.textSecondary }]}>
                  PIC: {ag.pic_name} • {ag.email}
                </Text>
              </View>
              <Badge
                label={ag.has_officer_account ? 'Officer Aktif' : 'Belum Ada'}
                variant={ag.has_officer_account ? 'success' : 'neutral'}
              />
            </View>
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
  noticeCard: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
  },
  noticeTitle: {
    marginBottom: 3,
  },
  noticeDesc: {
    lineHeight: 16,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  adminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  userName: {
    fontSize: 16,
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 12,
  },
  listTitle: {
    marginBottom: 12,
  },
  agencyRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 10,
    gap: 10,
  },
  agIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agName: {
    fontSize: 14,
  },
  agPic: {
    marginTop: 2,
  },
});
