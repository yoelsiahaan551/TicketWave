import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogIn,
  LogOut,
  Phone,
  RefreshCw,
  ScanLine,
  Settings,
  ShieldAlert,
  Ticket,
  UserPlus,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { verifyEmailApi } from '../../src/api/endpoints';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Input } from '../../src/components/common/Input';
import { Skeleton } from '../../src/components/common/Skeleton';

export default function ProfileScreen() {
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();
  const { user, isAuthenticated, isAdmin, isOfficer, logout, refreshUser, loading } = useAuth();
  const { favoriteArtists, favoriteEventIds } = useFavorites();

  const [verifyToken, setVerifyToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('ticketwave_verification_token').then((t) => {
      if (t) setVerifyToken(t);
    });
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setRefreshing(false);
  };

  const handleVerifyEmail = async () => {
    const token = verifyToken.trim();
    if (!token) return;
    setVerifying(true);
    setVerifyMessage(null);

    try {
      const res = await verifyEmailApi(token);
      setVerifyMessage({
        type: 'success',
        text: res.message || 'Email Anda berhasil diverifikasi!',
      });
      await AsyncStorage.removeItem('ticketwave_verification_token');
      await refreshUser();
    } catch (err: any) {
      setVerifyMessage({
        type: 'error',
        text: err?.message || 'Token verifikasi tidak valid atau sudah kadaluarsa.',
      });
    } finally {
      setVerifying(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      await logout();
      router.replace('/landing');
      return;
    }
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar dari akun TicketWave?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/landing');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TW';

  const roleLabel = user
    ? user.role === 'admin'
      ? 'Administrator'
      : user.role === 'officer'
      ? 'Officer Agency'
      : 'Member TicketWave'
    : 'Guest Checkout';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Profil Pengguna"
        subtitle="Identitas & preferensi akun"
        rightAction={
          isAuthenticated ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleRefresh}
              style={[styles.refreshBtn, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}
            >
              <RefreshCw size={17} color={colors.text} />
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
            onRefresh={handleRefresh}
            tintColor={brand.primary}
          />
        }
      >
        {loading ? (
          <View style={{ gap: 14 }}>
            <Skeleton width="100%" height={160} borderRadius={24} />
            <Skeleton width="100%" height={100} borderRadius={20} />
            <Skeleton width="100%" height={200} borderRadius={24} />
          </View>
        ) : (
          <>
            {/* Identity Card */}
            <View
              style={[
                styles.profileCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  shadowColor: colors.cardShadow,
                },
              ]}
            >
              <View style={styles.profileHeader}>
                <LinearGradient
                  colors={[brand.blueGradientStart, brand.cyan]}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>

                <View style={styles.profileInfo}>
                  <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                    {user?.name || 'Mode Tamu (Guest)'}
                  </Text>
                  <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                    {user?.email || 'Belum masuk ke akun'}
                  </Text>

                  <View style={styles.roleRow}>
                    <Badge
                      label={roleLabel}
                      variant={user?.role === 'admin' ? 'primary' : 'cyan'}
                    />
                    {user?.email_verified && (
                      <View style={styles.verifiedPill}>
                        <CheckCircle2 size={12} color="#10B981" />
                        <Text style={styles.verifiedText}>Terverifikasi</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {user?.phone ? (
                <View style={[styles.phoneRow, { borderTopColor: colors.border }]}>
                  <Phone size={14} color={brand.primary} />
                  <Text style={[styles.phoneText, { color: colors.textSecondary }]}>
                    {user.phone}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Email Verification Banner if not verified */}
            {user && !user.email_verified && (
              <View style={[styles.verifyCard, { backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : '#FEF3C7', borderColor: '#F59E0B' }]}>
                <View style={styles.verifyHeader}>
                  <ShieldAlert size={18} color="#D97706" />
                  <Text style={[styles.verifyTitle, { color: isDark ? '#FBBF24' : '#92400E' }]}>
                    Email Belum Diverifikasi
                  </Text>
                </View>
                <Text style={[styles.verifyDesc, { color: isDark ? '#FDE68A' : '#78350F' }]}>
                  Masukkan token verifikasi yang dikirimkan saat pendaftaran akun.
                </Text>

                <View style={styles.verifyInputRow}>
                  <Input
                    placeholder="Token verifikasi..."
                    value={verifyToken}
                    onChangeText={setVerifyToken}
                    containerStyle={{ flex: 1, marginBottom: 0 }}
                  />
                  <Button
                    title="Verifikasi"
                    onPress={handleVerifyEmail}
                    loading={verifying}
                    size="sm"
                    style={{ marginLeft: 8 }}
                  />
                </View>

                {verifyMessage ? (
                  <Text
                    style={[
                      styles.verifyMsg,
                      { color: verifyMessage.type === 'success' ? '#059669' : '#DC2626' },
                    ]}
                  >
                    {verifyMessage.text}
                  </Text>
                ) : null}
              </View>
            )}

            {/* Stats Row */}
            <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: brand.primary }]}>
                  {favoriteArtists.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Artis Favorit</Text>
              </View>

              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: brand.cyan }]}>
                  {favoriteEventIds.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted }]}>Event Disimpan</Text>
              </View>
            </View>

            {/* Admin Panel Quick Entry if Admin */}
            {isAdmin && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push('/admin' as any)}
                style={[
                  styles.adminBanner,
                  {
                    backgroundColor: isDark ? 'rgba(0,128,242,0.18)' : '#EFF6FF',
                    borderColor: brand.primary,
                  },
                ]}
              >
                <View style={styles.adminBannerLeft}>
                  <LayoutDashboard size={20} color={brand.primary} />
                  <View>
                    <Text style={[styles.adminBannerTitle, { color: brand.primary }]}>
                      Panel Administrator
                    </Text>
                    <Text style={[styles.adminBannerSub, { color: colors.textSecondary }]}>
                      Kelola event, promotor, fase harga & tiket
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={brand.primary} />
              </TouchableOpacity>
            )}

            {/* Officer Portal Quick Entry if Officer */}
            {isOfficer && (
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => router.push('/officer' as any)}
                style={[
                  styles.adminBanner,
                  {
                    backgroundColor: isDark ? 'rgba(0,212,255,0.18)' : '#ECFEFF',
                    borderColor: brand.cyan,
                  },
                ]}
              >
                <View style={styles.adminBannerLeft}>
                  <ScanLine size={20} color={brand.cyan} />
                  <View>
                    <Text style={[styles.adminBannerTitle, { color: brand.cyan }]}>
                      Portal Petugas Lapangan
                    </Text>
                    <Text style={[styles.adminBannerSub, { color: colors.textSecondary }]}>
                      Scan QR tiket, validasi manual & cek-in gate
                    </Text>
                  </View>
                </View>
                <ChevronRight size={18} color={brand.cyan} />
              </TouchableOpacity>
            )}

            {/* Menu List */}
            <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/(tabs)/orders')}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconWrap, { backgroundColor: brand.primarySoft }]}>
                    <Ticket size={18} color={brand.primary} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>Pesanan Saya</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/favorites')}
                style={[styles.menuItem, { borderBottomColor: colors.border }]}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconWrap, { backgroundColor: brand.dangerSoft }]}>
                    <Heart size={18} color={brand.danger} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>Event & Musisi Favorit</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push('/settings')}
                style={styles.menuItem}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIconWrap, { backgroundColor: brand.cyanSoft }]}>
                    <Settings size={18} color={brand.cyan} />
                  </View>
                  <Text style={[styles.menuLabel, { color: colors.text }]}>Pengaturan Aplikasi & API</Text>
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Logout / Login CTA */}
            {isAuthenticated ? (
              <Button
                title="Keluar dari Akun"
                onPress={handleLogout}
                variant="outline"
                icon={<LogOut size={16} color={brand.danger} />}
                style={{ borderColor: brand.danger, marginTop: 8 }}
                textStyle={{ color: brand.danger }}
              />
            ) : (
              <View style={{ gap: 10, marginTop: 8 }}>
                <Button
                  title="Masuk ke Akun"
                  onPress={() => router.push('/login')}
                  variant="primary"
                  icon={<LogIn size={16} color="#FFFFFF" />}
                />
                <Button
                  title="Daftar Akun Baru"
                  onPress={() => router.push('/register')}
                  variant="outline"
                  icon={<UserPlus size={16} color={brand.primary} />}
                />
              </View>
            )}
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
  refreshBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0080F2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  email: {
    fontSize: 12.5,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  verifiedText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#15803D',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 12,
  },
  phoneText: {
    fontSize: 13,
    fontWeight: '600',
  },
  verifyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  verifyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  verifyTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  verifyDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  verifyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifyMsg: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
  },
  statsCard: {
    flexDirection: 'row',
    borderRadius: 20,
    borderWidth: 1,
    paddingVertical: 14,
    marginBottom: 14,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  adminBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    marginBottom: 14,
  },
  adminBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adminBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  adminBannerSub: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  menuCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 18,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
