import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  Building2,
  Calendar,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserCheck,
} from 'lucide-react-native';

import { useAppTheme } from '../../../../src/context/ThemeContext';
import { deleteAdminAgency, fetchAdminAgencyDetail } from '../../../../src/api/endpoints';
import { Agency } from '../../../../src/types';
import { Header } from '../../../../src/components/common/Header';
import { Badge } from '../../../../src/components/common/Badge';
import { Button } from '../../../../src/components/common/Button';
import { Skeleton } from '../../../../src/components/common/Skeleton';
import { Typography } from '../../../../src/constants/Typography';

export default function AdminAgencyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [agency, setAgency] = useState<Agency | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const hasLoadedRef = useRef(false);

  const onRefresh = useCallback(() => {
    if (!id) return;
    setRefreshing(true);
    fetchAdminAgencyDetail(id)
      .then((res) => {
        if (res.data) {
          setAgency(res.data);
          setError(null);
        } else {
          setError('Data agency tidak ditemukan.');
        }
      })
      .catch((err: any) => {
        setError(err?.message || 'Gagal memuat detail agency.');
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;
    fetchAdminAgencyDetail(id)
      .then((res) => {
        if (!ignore) {
          if (res.data) {
            setAgency(res.data);
            setError(null);
          } else {
            setError('Data agency tidak ditemukan.');
          }
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err?.message || 'Gagal memuat detail agency.');
        }
      })
      .finally(() => {
        if (!ignore) {
          hasLoadedRef.current = true;
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (!hasLoadedRef.current) return;
      onRefresh();
    }, [onRefresh])
  );

  const performDelete = async () => {
    if (!agency) return;
    setActionError(null);
    try {
      await deleteAdminAgency(agency.id);
      router.replace('/admin/agencies' as any);
    } catch (err: any) {
      const msg = err?.message || 'Agency tidak dapat dihapus.';
      setActionError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Gagal Menghapus', msg);
      }
    }
  };

  const handleDelete = () => {
    if (!agency) return;
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        !window.confirm(
          `Apakah Anda yakin ingin menghapus agency "${agency.name}"? Agency yang memiliki event terkait tidak dapat dihapus.`
        )
      ) {
        return;
      }
      performDelete();
      return;
    }

    Alert.alert(
      'Hapus Agency',
      `Apakah Anda yakin ingin menghapus agency "${agency.name}"? Agency yang memiliki event terkait tidak dapat dihapus.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => performDelete(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Detail Agency"
        subtitle={agency?.name || 'Informasi promotor'}
        rightAction={
          agency ? (
            <TouchableOpacity
              onPress={() => router.push(`/admin/agency/${agency.id}/edit` as any)}
              style={[styles.editBtn, { backgroundColor: brand.primary }]}
            >
              <Pencil size={16} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
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
        {loading ? (
          <View style={{ gap: 14 }}>
            <Skeleton width="100%" height={160} borderRadius={24} />
            <Skeleton width="100%" height={200} borderRadius={20} />
          </View>
        ) : error || !agency ? (
          <View style={[styles.centerBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.errorText, { color: brand.danger }]}>{error || 'Agency tidak ditemukan'}</Text>
            <Button
              title="Coba Lagi"
              onPress={onRefresh}
              size="md"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <>
            {/* Header Identity Card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.topRow}>
                <View style={[styles.logoWrap, { backgroundColor: colors.surfaceElevated }]}>
                  {agency.logo_url ? (
                    <Image source={{ uri: agency.logo_url }} style={styles.logoImg} />
                  ) : (
                    <Building2 size={32} color={brand.primary} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h2, styles.name, { color: colors.text }]}>
                    {agency.name}
                  </Text>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    ID Agensi: #{agency.id}
                  </Text>
                  <View style={{ marginTop: 6 }}>
                    <Badge
                      label={agency.has_officer_account ? 'Akun Officer Terhubung' : 'Belum Ada Akun Officer'}
                      variant={agency.has_officer_account ? 'success' : 'neutral'}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Information Grid Card */}
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 }]}>
              <Text style={[Typography.h4, styles.sectionTitle, { color: colors.text }]}>
                Informasi Kontak & Operasional
              </Text>

              <View style={styles.infoRow}>
                <UserCheck size={16} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>Penanggung Jawab (PIC)</Text>
                  <Text style={[styles.valText, { color: colors.text }]}>{agency.pic_name || '—'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Mail size={16} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>Email Resmi</Text>
                  <Text style={[styles.valText, { color: colors.text }]}>{agency.email || '—'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Phone size={16} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>Nomor Telepon</Text>
                  <Text style={[styles.valText, { color: colors.text }]}>{agency.phone || '—'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={16} color={brand.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>Alamat Kantor</Text>
                  <Text style={[styles.valText, { color: colors.text }]}>{agency.address || '—'}</Text>
                </View>
              </View>

              {agency.created_at && (
                <View style={styles.infoRow}>
                  <Calendar size={16} color={brand.cyan} />
                  <View style={{ flex: 1 }}>
                    <Text style={[Typography.caption, { color: colors.textSecondary }]}>Terdaftar Sejak</Text>
                    <Text style={[styles.valText, { color: colors.text }]}>
                      {new Date(agency.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Actions */}
            {actionError && (
              <View style={{ marginTop: 14, padding: 12, borderRadius: 12, backgroundColor: brand.dangerSoft, borderWidth: 1, borderColor: brand.danger }}>
                <Text style={{ color: brand.danger, fontSize: 12, fontWeight: '700' }}>{actionError}</Text>
              </View>
            )}
            <View style={{ marginTop: 20, gap: 10 }}>
              <Button
                title="Edit Profil Agency"
                onPress={() => router.push(`/admin/agency/${agency.id}/edit` as any)}
                variant="gradient"
                size="md"
                icon={<Pencil size={16} color="#FFFFFF" />}
              />
              <Button
                title="Hapus Agency"
                onPress={handleDelete}
                variant="outline"
                size="md"
                icon={<Trash2 size={16} color={brand.danger} />}
              />
            </View>
          </>
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
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: 64,
    height: 64,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  sectionTitle: {
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  valText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  centerBox: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
