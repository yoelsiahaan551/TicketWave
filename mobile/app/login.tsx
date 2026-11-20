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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Check,
  KeyRound,
  Lock,
  Mail,
  ShieldAlert,
} from 'lucide-react-native';

import { BrandColors, PublicThemePalette } from '../src/constants/Colors';
import { useAuth } from '../src/context/AuthContext';
import { requestPasswordResetApi, resetPasswordApi } from '../src/api/endpoints';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';

function getSafeNextPath(rawNext?: string | string[]): string | null {
  const val = Array.isArray(rawNext) ? rawNext[0] : rawNext;
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
    return null;
  }
  return trimmed;
}

export default function LoginScreen() {
  const router = useRouter();
  const { next: rawNext } = useLocalSearchParams<{ next?: string }>();
  const insets = useSafeAreaInsets();
  const colors = PublicThemePalette;
  const brand = BrandColors;
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

  const horizontalPad = Math.max(insets.left, insets.right, 16);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Masukkan alamat email dan password Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await login(email.trim(), password, { remember: rememberMe });

    if (res.success && res.user) {
      const safeNext = getSafeNextPath(rawNext);
      if (res.user.role === 'admin') {
        router.replace((safeNext?.startsWith('/admin') || safeNext?.startsWith('/order') ? safeNext : '/admin') as any);
      } else if (res.user.role === 'officer') {
        router.replace((safeNext?.startsWith('/officer') ? safeNext : '/officer') as any);
      } else {
        const allowUserNext =
          safeNext && !safeNext.startsWith('/admin') && !safeNext.startsWith('/officer');
        router.replace((allowUserNext ? safeNext : '/(tabs)') as any);
      }
      setLoading(false);
    } else {
      setError(
        res.message ||
          'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.'
      );
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
          ? 'Token reset berhasil dibuat dan telah terisi di bawah.'
          : res.message || 'Permintaan reset password berhasil diproses.',
      });
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text:
          err?.status === 0
            ? 'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.'
            : err?.message || 'Gagal mengirim permintaan reset password.',
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
        text: res.message || 'Password berhasil diperbarui. Silakan masuk dengan password baru.',
      });
      setResetToken('');
      setNewPassword('');
    } catch (err: any) {
      setResetMessage({
        type: 'error',
        text:
          err?.status === 0
            ? 'Tidak dapat terhubung ke layanan TicketWave. Periksa koneksi Anda dan coba lagi.'
            : err?.message || 'Token tidak valid atau format password belum sesuai.',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Full-Viewport Background Layer outside ScrollView to prevent any right/bottom clipping */}
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

      <Header showBack title="Masuk" showThemeToggle={false} forcePublicTheme />

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
          {/* Brand Title Block */}
          <View style={styles.brandHero}>
            <Image
              source={require('../assets/images/ticketwave.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>
              Selamat Datang Kembali
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Masuk untuk mengakses tiket dan pesanan Anda di TicketWave.
            </Text>
          </View>

          {/* Compact Login Form Card */}
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
                <View style={styles.errorTextRow}>
                  <ShieldAlert size={16} color={brand.danger} />
                  <Text style={[styles.errorAlertText, { color: brand.danger }]}>
                    {error}
                  </Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={handleLogin}
                  style={[styles.retryBtn, { borderColor: brand.danger }]}
                >
                  <Text style={[styles.retryBtnText, { color: brand.danger }]}>
                    Coba Lagi
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Input
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) setError(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              forcePublicTheme
              leftIcon={<Mail size={17} color={colors.textMuted} />}
            />

            <Input
              label="Password"
              placeholder="Masukkan password Anda"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError(null);
              }}
              isPassword
              forcePublicTheme
              leftIcon={<Lock size={17} color={colors.textMuted} />}
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
                      borderColor: rememberMe ? brand.primary : colors.borderStrong,
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

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowForgot(!showForgot)}
                style={styles.forgotToggleBtn}
              >
                <Text style={[Typography.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                  {showForgot ? 'Tutup Reset' : 'Lupa password?'}
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
                  <KeyRound size={15} color={brand.cyan} />
                  <Text style={[Typography.bodyBold, { color: colors.text }]}>
                    Reset Password
                  </Text>
                </View>

                <Input
                  label="Email Terdaftar"
                  placeholder="nama@email.com"
                  value={resetEmail || email}
                  onChangeText={setResetEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  forcePublicTheme
                />
                <Button
                  title="Kirim Permintaan Reset"
                  onPress={handleRequestReset}
                  loading={resetLoading}
                  variant="secondary"
                  size="sm"
                  forcePublicTheme
                  style={{ marginBottom: 12 }}
                />

                <Input
                  label="Token Reset"
                  placeholder="Masukkan token reset"
                  value={resetToken}
                  onChangeText={setResetToken}
                  autoCapitalize="none"
                  forcePublicTheme
                />
                <Input
                  label="Password Baru"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  isPassword
                  forcePublicTheme
                />
                <Button
                  title="Simpan Password Baru"
                  onPress={handleConfirmReset}
                  loading={resetLoading}
                  variant="primary"
                  size="sm"
                  forcePublicTheme
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
              title="Masuk"
              onPress={handleLogin}
              loading={loading}
              size="md"
              variant="primary"
              forcePublicTheme
              style={styles.submitBtn}
            />
          </View>

          {/* Bottom Link to Register */}
          <View style={styles.registerWrap}>
            <Text style={[Typography.body, { color: colors.textSecondary }]}>
              Belum punya akun?{' '}
            </Text>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.push('/register')}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
            >
              <Text style={[Typography.bodyBold, { color: brand.cyan }]}>
                Daftar Sekarang
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
    justifyContent: 'space-between',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  errorTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorAlertText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  rememberForgotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 10,
  },
  rememberBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
  },
  forgotToggleBtn: {
    minHeight: 44,
    justifyContent: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  forgotBox: {
    marginTop: 6,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
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
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 6,
  },
  registerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 44,
  },
});
