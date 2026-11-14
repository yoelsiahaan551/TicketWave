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
  ArrowLeft,
  Check,
  CheckCircle2,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
  Sparkles,
  Ticket,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { requestPasswordResetApi, resetPasswordApi } from '../src/api/endpoints';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';

export default function LoginScreen() {
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Section
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Masukkan alamat email dan password Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email.trim(), password);

    if (res.success && res.user) {
      if (res.user.role === 'admin') {
        router.replace('/admin' as any);
      } else {
        router.replace('/(tabs)');
      }
    } else {
      setError(res.message || 'Login gagal.');
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    const target = (resetEmail || email || '').trim();
    if (!target) {
      setResetMessage({ type: 'error', text: 'Masukkan alamat email terlebih dahulu.' });
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await requestPasswordResetApi(target);
      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
      }
      setResetMessage({
        type: 'success',
        text: res.data?.reset_token
          ? 'Token reset berhasil dibuat dan telah terisi otomatis di bawah.'
          : res.message || 'Permintaan reset password berhasil diproses.',
      });
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err?.message || 'Gagal mengirim permintaan reset password.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async () => {
    if (!resetToken.trim() || !newPassword) {
      setResetMessage({ type: 'error', text: 'Masukkan token reset dan password baru.' });
      return;
    }

    setResetLoading(true);
    setResetMessage(null);
    try {
      const res = await resetPasswordApi(resetToken.trim(), newPassword);
      setResetMessage({
        type: 'success',
        text: res.message || 'Password berhasil direset! Silakan login dengan password baru Anda.',
      });
      setResetToken('');
      setNewPassword('');
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text: err?.message || 'Token tidak valid atau format password belum sesuai.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Masuk Akun"
        subtitle="Akses akun TicketWave Anda"
      />

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

            {/* Brand Header */}
            <View style={styles.brandHero}>
              <LinearGradient
                colors={[brand.blueGradientStart, brand.blueGradientEnd]}
                style={styles.logoBadge}
              >
                <Ticket size={28} color="#FFFFFF" />
              </LinearGradient>
              <Text style={[Typography.h1, styles.title]}>Welcome Back 👋</Text>
              <Text style={[Typography.body, styles.subtitle]}>
                Masuk untuk melanjutkan ke akun TicketWave Anda.
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

              <Input
                label="Email Address"
                placeholder="nama@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon={<Mail size={18} color={brand.primary} />}
              />

              <Input
                label="Password"
                placeholder="Masukkan password Anda"
                value={password}
                onChangeText={setPassword}
                isPassword
                leftIcon={<Lock size={18} color={brand.primary} />}
              />

              <View style={styles.rememberForgotRow}>
                <TouchableOpacity
                  style={styles.rememberBox}
                  activeOpacity={0.8}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: rememberMe ? brand.primary : colors.border,
                        backgroundColor: rememberMe ? brand.primary : 'transparent',
                      },
                    ]}
                  >
                    {rememberMe && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                  <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                    Ingat saya
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setShowForgot(!showForgot)}>
                  <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>
                    {showForgot ? 'Tutup Reset' : 'Lupa Password?'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Expandable Forgot Password Box */}
              {showForgot && (
                <View
                  style={[
                    styles.forgotBox,
                    { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.forgotHeader}>
                    <KeyRound size={16} color={brand.primary} />
                    <Text style={[Typography.h4, { color: colors.text }]}>Reset Password</Text>
                  </View>

                  <Input
                    label="Email Terdaftar"
                    placeholder="nama@email.com"
                    value={resetEmail || email}
                    onChangeText={setResetEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  <Button
                    title="Minta Token Reset"
                    onPress={handleRequestReset}
                    loading={resetLoading}
                    variant="outline"
                    size="sm"
                    style={{ marginBottom: 12 }}
                  />

                  <Input
                    label="Token Reset dari Server"
                    placeholder="Paste token di sini..."
                    value={resetToken}
                    onChangeText={setResetToken}
                  />
                  <Input
                    label="Password Baru"
                    placeholder="Minimal 8 karakter..."
                    value={newPassword}
                    onChangeText={setNewPassword}
                    isPassword
                  />
                  <Button
                    title="Simpan Password Baru"
                    onPress={handleConfirmReset}
                    loading={resetLoading}
                    size="sm"
                  />

                  {resetMessage && (
                    <Text
                      style={[
                        Typography.caption,
                        styles.resetMsgText,
                        { color: resetMessage.type === 'error' ? brand.danger : brand.success },
                      ]}
                    >
                      {resetMessage.text}
                    </Text>
                  )}
                </View>
              )}

              <Button
                title="Masuk Sekarang"
                onPress={handleLogin}
                loading={loading}
                size="lg"
                variant="gradient"
                style={{ marginTop: 14 }}
              />
            </View>

            {/* Bottom Link to Register */}
            <View style={styles.registerWrap}>
              <Text style={[Typography.body, { color: 'rgba(255, 255, 255, 0.75)' }]}>
                Belum punya akun TicketWave?{' '}
              </Text>
              <TouchableOpacity onPress={() => router.push('/register')}>
                <Text style={[Typography.body, { color: '#22D3EE', fontWeight: '800' }]}>
                  Daftar Sekarang
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
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  rememberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotBox: {
    marginTop: 10,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  forgotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  resetMsgText: {
    marginTop: 10,
    fontWeight: '700',
  },
  registerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    position: 'relative',
    zIndex: 1,
  },
});
