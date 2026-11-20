import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Building2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { deleteAdminAgency, fetchAdminAgencies } from '../../src/api/endpoints';
import { Agency } from '../../src/types';
import { Header } from '../../src/components/common/Header';
import { Input } from '../../src/components/common/Input';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Skeleton } from '../../src/components/common/Skeleton';
import { Typography } from '../../src/constants/Typography';

export default function AdminAgenciesScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let ignore = false;
    fetchAdminAgencies({
      search: search.trim() || undefined,
      page: 1,
      per_page: 50,
    })
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
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAdminAgencies({
      search: search.trim() || undefined,
      page: 1,
      per_page: 50,
    })
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

  const handleDelete = (agency: Agency) => {
    Alert.alert(
      'Hapus Agency',
      `Hapus agency "${agency.name}"? Agency yang memiliki event terkait tidak dapat dihapus (HTTP 409).`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminAgency(agency.id);
              setAgencies((prev) => prev.filter((a) => a.id !== agency.id));
            } catch (err: any) {
              Alert.alert('Gagal Menghapus', err?.message || 'Agency masih memiliki event terkait.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Kelola Agency"
        subtitle={`${agencies.length} promotor terdaftar`}
        rightAction={
          <TouchableOpacity
            onPress={() => router.push('/admin/agency/create' as any)}
            style={[styles.addBtn, { backgroundColor: brand.primary }]}
          >
            <Plus size={18} color="#FFFFFF" />
          </TouchableOpacity>
        }
      />

      <View style={styles.searchWrap}>
        <Input
          placeholder="Cari nama agency promotor..."
          value={search}
          onChangeText={setSearch}
          leftIcon={<Search size={16} color={brand.primary} />}
          containerStyle={{ marginBottom: 0 }}
        />
      </View>

      {loading ? (
        <View style={styles.loadingList}>
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Skeleton width={48} height={48} borderRadius={14} />
                <View style={{ flex: 1, gap: 6 }}>
                  <Skeleton width="70%" height={18} />
                  <Skeleton width="45%" height={14} />
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={agencies}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brand.primary}
            />
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.logoBox, { backgroundColor: colors.surfaceElevated }]}>
                  {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} style={styles.logoImg} />
                  ) : (
                    <Building2 size={24} color={brand.primary} />
                  )}
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h3, styles.agencyName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[Typography.caption, styles.picText, { color: colors.textSecondary }]}>
                    PIC: {item.pic_name}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Mail size={14} color={brand.primary} />
                <Text style={[Typography.caption, styles.infoText, { color: colors.textSecondary }]}>
                  {item.email}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Phone size={14} color={brand.primary} />
                <Text style={[Typography.caption, styles.infoText, { color: colors.textSecondary }]}>
                  {item.phone}
                </Text>
              </View>
              {item.address && (
                <View style={styles.infoRow}>
                  <MapPin size={14} color={brand.primary} />
                  <Text style={[Typography.caption, styles.infoText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.address}
                  </Text>
                </View>
              )}

              <View style={[styles.actionsRow, { borderTopColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => router.push(`/admin/agency/${item.id}/edit` as any)}
                  style={styles.actionBtn}
                >
                  <Pencil size={14} color={brand.primary} />
                  <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionBtn}>
                  <Trash2 size={14} color={brand.danger} />
                  <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <EmptyState
              icon={<Building2 size={28} color={brand.primary} />}
              title="Belum Ada Agency"
              description="Tambahkan agency promotor musik pertama Anda."
              actionLabel="Tambah Agency"
              onAction={() => router.push('/admin/agency/create' as any)}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  loadingList: {
    padding: 16,
    gap: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  agencyName: {
    fontSize: 16,
  },
  picText: {
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  infoText: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 18,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
