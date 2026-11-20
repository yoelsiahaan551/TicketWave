import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { LogOut, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useAppTheme } from '../../src/context/ThemeContext';
import { Button } from '../../src/components/common/Button';
import { Typography } from '../../src/constants/Typography';

export default function AdminLayout() {
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isOfficer, loading, logout } = useAuth();
  const { colors, brand } = useAppTheme();

  if (loading) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <Text style={[Typography.caption, styles.statusText, { color: colors.textSecondary }]}>
          Memverifikasi hak akses Administrator...
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
            Panel Administrator hanya dapat diakses setelah masuk menggunakan akun Admin terverifikasi.
          </Text>
          <Button
            title="Ke Halaman Login"
            onPress={() => router.push({ pathname: '/login', params: { next: '/admin' } } as any)}
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

  if (!isAdmin) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <View style={[styles.authCard, { backgroundColor: colors.surface, borderColor: brand.danger }]}>
          <View style={[styles.iconWrap, { backgroundColor: brand.dangerSoft }]}>
            <ShieldAlert size={32} color={brand.danger} />
          </View>
          <Text style={[Typography.h2, styles.title, { color: colors.text }]}>
            Akses Ditolak (403)
          </Text>
          <Text style={[Typography.body, styles.desc, { color: colors.textSecondary }]}>
            Akun Anda memiliki role {user.role?.toUpperCase() || 'USER'}. Fitur administrasi hanya diizinkan untuk akun role ADMIN.
          </Text>
          <Button
            title={isOfficer ? 'Buka Portal Petugas' : 'Kembali ke Area Pengguna'}
            onPress={() => router.replace((isOfficer ? '/officer' : '/(tabs)') as any)}
            size="md"
            variant="primary"
            style={{ width: '100%', marginTop: 18 }}
          />
          <Button
            title="Keluar & Ganti Akun"
            onPress={async () => {
              await logout();
              router.replace({ pathname: '/login', params: { next: '/admin' } } as any);
            }}
            size="md"
            variant="outline"
            icon={<LogOut size={16} color={brand.danger} />}
            style={{ width: '100%', marginTop: 10 }}
          />
        </View>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="events" options={{ headerShown: false }} />
      <Stack.Screen name="event/create" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]/edit" options={{ headerShown: false }} />
      <Stack.Screen name="event/[id]/phases" options={{ headerShown: false }} />
      <Stack.Screen name="agencies" options={{ headerShown: false }} />
      <Stack.Screen name="agency/create" options={{ headerShown: false }} />
      <Stack.Screen name="agency/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="agency/[id]/edit" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="settings" options={{ headerShown: false }} />
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
    fontWeight: '600',
  },
  authCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 4,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
