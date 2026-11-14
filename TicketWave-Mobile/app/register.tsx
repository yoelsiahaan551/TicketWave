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
import {
  Check,
  CheckCircle2,
  Lock,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles,
  Ticket,
  User,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';

export default function RegisterScreen() {
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();
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
      setSuccessMsg(res.message || 'Pendaftaran berhasil! Silakan masuk melalui halaman Login.');
    } else {
      setError(res.message || 'Pendaftaran gagal.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Daftar Akun" subtitle="Buat akun TicketWave baru" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Background visuals matching AuthLayout.jsx */}
          <View style={styles.authWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200' }}
              style={styles.bgImage}
            />
            <View style={styles.bgOverlay} />

            {/* Cyan and blue glow blurs */}
            <View style={styles.cyanGlow} pointerEvents="none" />
            <View style={styles.blueGlow} pointerEvents="none" />

            <View style={styles.brandHero}>
              <LinearGradient
                colors={[brand.blueGradientStart, brand.blueGradientEnd]}
                style={styles.logoBadge}
              >
                <Ticket size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[Typography.h1, styles.title]}>Create Account 🚀</Text>
              <Text style={[Typography.body, styles.subtitle]}>
                Daftar sekarang dan mulai temukan konser favoritmu.
              </Text>
            </View>

            {/* Form Card */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? 'rgba(17, 24, 39, 0.90)' : colors.surface,
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : colors.border,
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
                  <Text style={[Typography.caption, styles.errorAlertText, { color: brand.danger }]}>
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
                  <Text style={[Typography.caption, styles.successAlertText, { color: brand.success }]}>
                    {successMsg}
                  </Text>
                </View>
              )}

              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChangeText={setName}
                leftIcon={<User size={18} color={brand.primary} />}
              />

              <Input
                label="Email Address"
                placeholder="you@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={brand.primary} />}
              />

              <Input
                label="Phone Number"
                placeholder="08123456789"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                leftIcon={<Phone size={18} color={brand.primary} />}
              />

              <Input
                label="Password"
                placeholder="Minimal 8 karakter"
                value={password}
                onChangeText={setPassword}
                isPassword
                leftIcon={<Lock size={18} color={brand.primary} />}
              />

              <Input
                label="Confirm Password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                isPassword
                leftIcon={<Lock size={18} color={brand.primary} />}
              />

              {/* Terms Checkbox matching RegisterForm.jsx */}
              <TouchableOpacity
                style={styles.termsRow}
                activeOpacity={0.8}
                onPress={() => setTerms(!terms)}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: terms ? brand.primary : colors.border,
                      backgroundColor: terms ? brand.primary : 'transparent',
                    },
                  ]}
                >
                  {terms && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                </View>
                <Text style={[Typography.caption, { color: colors.textSecondary, flex: 1 }]}>
                  Saya menyetujui{' '}
                  <Text style={{ color: '#22D3EE', fontWeight: '700' }}>
                    Syarat &amp; Ketentuan
                  </Text>{' '}
                  resmi TicketWave.
                </Text>
              </TouchableOpacity>

              <Button
                title="Daftar Sekarang"
                onPress={handleRegister}
                loading={loading}
                size="lg"
                variant="gradient"
                style={{ marginTop: 14 }}
              />
            </View>

            {/* Bottom Link to Login */}
            <View style={styles.loginWrap}>
              <Text style={[Typography.body, { color: 'rgba(255, 255, 255, 0.75)' }]}>
                Sudah memiliki akun?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={[Typography.body, { color: '#22D3EE', fontWeight: '800' }]}>
                  Masuk Sekarang
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  authWrapper: {
    position: 'relative',
    minHeight: '100%',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  bgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  bgOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 13, 22, 0.90)',
  },
  cyanGlow: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(6, 182, 212, 0.20)',
  },
  blueGlow: {
    position: 'absolute',
    bottom: 50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 128, 242, 0.20)',
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    zIndex: 1,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0080F2',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 26,
    lineHeight: 32,
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
    zIndex: 1,
  },
  errorAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  errorAlertText: {
    flex: 1,
    fontWeight: '700',
  },
  successAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  successAlertText: {
    flex: 1,
    fontWeight: '700',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    position: 'relative',
    zIndex: 1,
  },
});
