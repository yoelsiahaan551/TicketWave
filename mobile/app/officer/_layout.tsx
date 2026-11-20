import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { ArrowLeft, LogOut, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/common/Button';
import { Typography } from '../../src/constants/Typography';

export default function OfficerLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isOfficer, isAdmin, isUser, loading, logout } = useAuth();
  const { colors, brand } = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <Text style={[Typography.caption, styles.statusText, { color: colors.textSecondary }]}>
          Memverifikasi Otorisasi Petugas...
        </Text>
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.iconWrap, { backgroundColor: brand.warningSoft }]}>
            <ShieldAlert size={32} color={brand.warning} />
          </View>
          <Text style={[Typography.h2, styles.title, { color: colors.text }]}>
            Autentikasi Diperlukan (401)
          </Text>
          <Text style={[Typography.body, styles.desc, { color: colors.textSecondary }]}>
            Portal Petugas Lapangan hanya dapat diakses setelah masuk menggunakan akun Officer terdaftar.
          </Text>
          <Button
            title="Ke Halaman Login"
            onPress={() => router.push('/login')}
            size="md"
            variant="gradient"
            style={{ width: '100%', marginTop: 18 }}
          />
          <Button
            title="Kembali ke Beranda"
            onPress={() => router.replace('/(tabs)')}
            variant="outline"
            size="md"
            style={{ width: '100%', marginTop: 10 }}
          />
        </View>
      </View>
    );
  }

  // Jika login tapi BUKAN officer (Admin / User dilarang akses scan gate sesuai kebijakan Next.js)
  if (!isOfficer) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: brand.danger }]}>
          <View style={[styles.iconWrap, { backgroundColor: brand.dangerSoft }]}>
            <ShieldAlert size={32} color={brand.danger} />
          </View>
          <View style={[styles.badgePill, { backgroundColor: brand.dangerSoft }]}>
            <Text style={[styles.badgeText, { color: brand.danger }]}>Akses Ditolak (HTTP 403)</Text>
          </View>
          <Text style={[Typography.h2, styles.title, { color: colors.text }]}>
            Otorisasi Petugas Diperlukan
          </Text>
          <Text style={[Typography.body, styles.desc, { color: colors.textSecondary }]}>
            Portal ini dikhususkan bagi <Text style={{ fontWeight: '700' }}>Petugas Lapangan (Officer)</Text> untuk operasional gate & scanning tiket. Akun Anda saat ini masuk dengan role: <Text style={{ fontWeight: '700', textTransform: 'uppercase' }}>{user.role}</Text>.
          </Text>
          <Text style={[Typography.caption, styles.subDesc, { color: colors.textMuted }]}>
            Sesuai kebijakan keamanan, role Admin dan User tidak memiliki akses operasional gate di modul ini.
          </Text>

          <View style={{ width: '100%', gap: 10, marginTop: 20 }}>
            {isAdmin && (
              <Button
                title="Buka Panel Admin"
                onPress={() => router.replace('/admin')}
                size="md"
                variant="primary"
                icon={<ArrowLeft size={16} color="#FFFFFF" />}
              />
            )}
            {isUser && (
              <Button
                title="Buka Beranda Pengguna"
                onPress={() => router.replace('/(tabs)')}
                size="md"
                variant="primary"
                icon={<ArrowLeft size={16} color="#FFFFFF" />}
              />
            )}
            <Button
              title="Keluar & Ganti Akun"
              onPress={async () => {
                await logout();
                router.replace('/login');
              }}
              size="md"
              variant="outline"
              icon={<LogOut size={16} color={brand.danger} />}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="validation" />
      <Stack.Screen name="history" />
      <Stack.Screen name="events" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  statusText: {
    letterSpacing: 0.2,
  },
  authCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  desc: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  subDesc: {
    textAlign: 'center',
    lineHeight: 18,
  },
});
