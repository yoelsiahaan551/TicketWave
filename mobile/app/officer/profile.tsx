import React from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Phone,
  ScanLine,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { Header } from '../../src/components/common/Header';
import { Badge } from '../../src/components/common/Badge';
import { Button } from '../../src/components/common/Button';
import { Typography } from '../../src/constants/Typography';

export default function OfficerProfileScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      await logout();
      router.replace('/landing');
      return;
    }
    Alert.alert(
      'Keluar Akun Officer',
      'Apakah Anda yakin ingin keluar dari sesi petugas lapangan TicketWave?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/landing');
          },
        },
      ]
    );
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'OF';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Profil Petugas"
        subtitle="Identitas & sesi petugas lapangan"
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Officer Identity Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.profileHeader}>
            <LinearGradient
              colors={[brand.blueGradientStart, brand.cyan]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>

            <View style={styles.profileInfo}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {user?.name || 'Petugas Lapangan'}
              </Text>
              <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                {user?.email || 'officer@ticketwave.com'}
              </Text>
              <View style={styles.badgeRow}>
                <Badge label="OFFICER LAPANGAN" variant="cyan" />
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
              <Text style={[styles.phoneText, { color: colors.textSecondary }]}>{user.phone}</Text>
            </View>
          ) : null}
        </View>

        {/* Gate & Shift Operational Assignment Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 }]}>
          <Text style={[Typography.h4, styles.cardTitle, { color: colors.text }]}>
            Informasi Operasional Gate
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Peran Sistem:</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>Scanner Operator</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Penugasan Gate:</Text>
            <Text style={[styles.infoVal, { color: brand.primary }]}>
              {user?.assigned_gate || 'Belum diverifikasi'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Jadwal Shift:</Text>
            <Text style={[styles.infoVal, { color: colors.text }]}>
              {user?.shift || 'Sesuai instruksi koordinator'}
            </Text>
          </View>
        </View>

        {/* Quick Menu */}
        <View style={[styles.menuCard, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 14 }]}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/officer/scan' as any)}
            style={[styles.menuItem, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
          >
            <View style={styles.menuLeft}>
              <ScanLine size={18} color={brand.primary} />
              <Text style={[styles.menuText, { color: colors.text }]}>Mulai Scan QR</Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/officer/history' as any)}
            style={styles.menuItem}
          >
            <View style={styles.menuLeft}>
              <Calendar size={18} color={brand.cyan} />
              <Text style={[styles.menuText, { color: colors.text }]}>Riwayat Pemindaian</Text>
            </View>
            <ChevronRight size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Logout CTA */}
        <View style={{ marginTop: 24 }}>
          <Button
            title="Keluar dari Sesi Petugas"
            onPress={handleLogout}
            variant="outline"
            icon={<LogOut size={16} color={brand.danger} />}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    padding: 18,
    borderRadius: 24,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 2,
  },
  email: {
    fontSize: 13,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  phoneText: {
    fontSize: 13,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '600',
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
});
