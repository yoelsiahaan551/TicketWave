import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  User,
} from 'lucide-react-native';

import { BrandColors, PublicThemePalette } from '../src/constants/Colors';
import { useAuth } from '../src/context/AuthContext';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = PublicThemePalette;
  const brand = BrandColors;
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [terms, setTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const horizontalPad = Math.max(insets.left, insets.right, 16);

  const handleRegister = async () => {
    setError(null);
    setSuccessMsg(null);

    if (!name.trim() || name.trim().length < 2) {
      setError('Nama lengkap wajib diisi (minimal 2 karakter).');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Masukkan alamat email yang valid.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Nomor telepon wajib diisi minimal 10 digit.');
      return;
    }
    if (!password || password.length < 8) {
      setError('Password minimal 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Password dan Konfirmasi Password tidak sama.');
      return;
    }
    if (!terms) {
      setError('Anda harus menyetujui Syarat & Ketentuan.');
      return;
    }

    setLoading(true);
    const res = await register(name.trim(), email.trim(), phone.trim(), password);
    setLoading(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else if (res.registered) {
      setSuccessMsg(res.message || 'Pendaftaran berhasil. Silakan masuk melalui halaman Login.');
    } else {
      setError(
        res.message ||
          'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.'
      );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.bgLayer} pointerEvents="none">
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200' }}
          style={styles.bgImage}
          resizeMode="cover"
        />
        <View
          style={[
            styles.bgOverlay,
            {
              backgroundColor: 'rgba(11, 15, 23, 0.92)',
            },
          ]}
        />
      </View>

      <Header showBack title="Daftar Akun" showThemeToggle={false} forcePublicTheme />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 16}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingLeft: horizontalPad,
              paddingRight: horizontalPad,
              paddingBottom: Math.max(insets.bottom, 24) + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandHero}>
            <Image
              source={require('../assets/images/ticketwave.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>Buat Akun Baru</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Daftar sekarang untuk memesan dan mengelola tiket event Anda.
            </Text>
          </View>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            {error && (
              <View
                style={[
                  styles.errorAlert,
                  { backgroundColor: brand.dangerSoft, borderColor: brand.danger },
                ]}
              >
                <ShieldAlert size={16} color={brand.danger} />
                <Text style={[styles.errorAlertText, { color: brand.danger }]}>
                  {error}
                </Text>
              </View>
            )}

            {successMsg && (
              <View
                style={[
                  styles.successAlert,
                  { backgroundColor: brand.successSoft, borderColor: brand.success },
                ]}
              >
                <CheckCircle2 size={16} color={brand.success} />
                <Text style={[styles.successAlertText, { color: brand.success }]}>
                  {successMsg}
                </Text>
              </View>
            )}

            <Input
              label="Nama Lengkap"
              placeholder="Masukkan nama lengkap"
              value={name}
              onChangeText={setName}
              forcePublicTheme
              leftIcon={<User size={17} color={colors.textMuted} />}
            />

            <Input
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              forcePublicTheme
              leftIcon={<Mail size={17} color={colors.textMuted} />}
            />

            <Input
              label="Nomor Telepon"
              placeholder="08123456789"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              forcePublicTheme
              leftIcon={<Phone size={17} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="Minimal 8 karakter"
              value={password}
              onChangeText={setPassword}
              isPassword
              forcePublicTheme
              leftIcon={<Lock size={17} color={colors.textMuted} />}
            />

            <Input
              label="Konfirmasi Password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              forcePublicTheme
              leftIcon={<Lock size={17} color={colors.textMuted} />}
            />

            <TouchableOpacity
              style={styles.termsRow}
              activeOpacity={0.8}
              onPress={() => setTerms(!terms)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: terms ? brand.primary : colors.borderStrong,
                    backgroundColor: terms ? brand.primary : 'transparent',
                  },
                ]}
              >
                {terms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                Saya menyetujui{' '}
                <Text style={{ color: colors.text, fontWeight: '700' }}>
                  Syarat &amp; Ketentuan
                </Text>{' '}
                layanan TicketWave.
              </Text>
            </TouchableOpacity>

            <Button
              title="Daftar"
              onPress={handleRegister}
              loading={loading}
              size="md"
              variant="primary"
              forcePublicTheme
              style={{ marginTop: 6 }}
            />
          </View>

          <View style={styles.loginWrap}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Sudah memiliki akun?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/login')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Text style={[Typography.bodyBold, { color: brand.cyan }]}>
                Masuk
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  bgLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
  },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: 20,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 18,
  },
  logoImage: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13.5,
    lineHeight: 19,
    textAlign: 'center',
    maxWidth: 320,
  },
  card: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  successAlertText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
    marginBottom: 10,
    minHeight: 44,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 44,
  },
});
