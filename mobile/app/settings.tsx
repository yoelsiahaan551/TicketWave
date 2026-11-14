import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  CheckCircle2,
  KeyRound,
  Lock,
  Moon,
  Palette,
  RefreshCw,
  Server,
  Sun,
  XCircle,
} from 'lucide-react-native';

import { useAppTheme } from '../src/context/ThemeContext';
import { useAuth } from '../src/context/AuthContext';
import { requestPasswordResetApi, resetPasswordApi } from '../src/api/endpoints';
import api from '../src/api/client';
import { Header } from '../src/components/common/Header';
import { Input } from '../src/components/common/Input';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, brand, mode, setMode } = useAppTheme();
  const { user, isAuthenticated, logout } = useAuth();

  // Server health & base URL
  const [currentApiUrl, setCurrentApiUrl] = useState(api.getBaseUrl());
  const [inputApiUrl, setInputApiUrl] = useState(api.getBaseUrl());
  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<{ status: 'ok' | 'error'; message: string } | null>(null);

  // Security / Reset password
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);
  const [requestingToken, setRequestingToken] = useState(false);
  const [securityMsg, setSecurityMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    handlePingServer();
  }, []);

  const handlePingServer = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await api.checkHealth();
      setPingResult({
        status: 'ok',
        message: `${res.service || 'TicketWave Backend'} — Status: ${res.status}`,
      });
    } catch (err: any) {
      setPingResult({
        status: 'error',
        message: err?.message || 'Server backend tidak dapat dijangkau.',
      });
    } finally {
      setPinging(false);
    }
  };

  const handleSaveApiUrl = async () => {
    const trimmed = inputApiUrl.trim().replace(/\/+$/, '');
    await api.setBaseUrl(trimmed);
    setCurrentApiUrl(api.getBaseUrl());
    Alert.alert('Tersimpan', `Base URL API berhasil diatur ke: ${api.getBaseUrl()}`);
    handlePingServer();
  };

  const handleResetToDefaultUrl = async () => {
    await api.setBaseUrl(null);
    setCurrentApiUrl(api.getBaseUrl());
    setInputApiUrl(api.getBaseUrl());
    Alert.alert('Reset', `Base URL API dikembalikan ke default: ${api.getBaseUrl()}`);
    handlePingServer();
  };

  const handleRequestToken = async () => {
    if (!user?.email) {
      setSecurityMsg({ type: 'error', text: 'Anda harus login untuk meminta token reset.' });
      return;
    }
    setRequestingToken(true);
    setSecurityMsg(null);
    try {
      const res = await requestPasswordResetApi(user.email);
      if (res.data?.reset_token) {
        setResetToken(res.data.reset_token);
      }
      setSecurityMsg({
        type: 'success',
        text: res.data?.reset_token
          ? 'Token reset berhasil dibuat dan otomatis terisi di bawah.'
          : res.message || 'Permintaan reset berhasil dikirim.',
      });
    } catch (err: any) {
      setSecurityMsg({ type: 'error', text: err?.message || 'Gagal meminta token reset.' });
    } finally {
      setRequestingToken(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!resetToken.trim() || !newPassword) {
      setSecurityMsg({ type: 'error', text: 'Masukkan token reset dan password baru.' });
      return;
    }
    setSubmittingPassword(true);
    setSecurityMsg(null);
    try {
      const res = await resetPasswordApi(resetToken.trim(), newPassword);
      setSecurityMsg({
        type: 'success',
        text: res.message || 'Password berhasil diperbarui!',
      });
      setResetToken('');
      setNewPassword('');
    } catch (err: any) {
      setSecurityMsg({
        type: 'error',
        text: err?.message || 'Gagal memperbarui password.',
      });
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Pengaturan" subtitle="Tema, koneksi server &amp; keamanan" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Appearance Section */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Palette size={18} color={brand.primary} />
            <Text style={[Typography.h3, { color: colors.text }]}>Tema Tampilan</Text>
          </View>

          <View style={styles.themeRow}>
            <TouchableOpacity
              onPress={() => setMode('light')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: mode === 'light' ? brand.primarySoft : colors.surfaceElevated,
                  borderColor: mode === 'light' ? brand.primary : colors.border,
                },
              ]}
            >
              <Sun size={20} color={mode === 'light' ? brand.primary : colors.textSecondary} />
              <Text
                style={[
                  Typography.caption,
                  styles.themeBtnText,
                  { color: mode === 'light' ? brand.primary : colors.text },
                ]}
              >
                Terang (Light)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setMode('dark')}
              style={[
                styles.themeBtn,
                {
                  backgroundColor: mode === 'dark' ? brand.primarySoft : colors.surfaceElevated,
                  borderColor: mode === 'dark' ? brand.primary : colors.border,
                },
              ]}
            >
              <Moon size={20} color={mode === 'dark' ? brand.primary : colors.textSecondary} />
              <Text
                style={[
                  Typography.caption,
                  styles.themeBtnText,
                  { color: mode === 'dark' ? brand.primary : colors.text },
                ]}
              >
                Gelap (Dark)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server & Connectivity Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTitleRow}>
            <Server size={18} color={brand.primary} />
            <Text style={[Typography.h3, { color: colors.text }]}>Koneksi Backend API</Text>
          </View>

          <Text style={[Typography.caption, styles.cardDesc, { color: colors.textSecondary }]}>
            Konfigurasi endpoint untuk pengujian pada Android Emulator (10.0.2.2:5000) atau HP fisik via WiFi LAN.
          </Text>

          <Input
            label="Base API URL"
            value={inputApiUrl}
            onChangeText={setInputApiUrl}
            placeholder="http://10.0.2.2:5000/api"
            autoCapitalize="none"
          />

          <View style={styles.btnRow}>
            <Button
              title="Simpan URL"
              onPress={handleSaveApiUrl}
              size="sm"
              variant="primary"
            />
            <Button
              title="Cek /health"
              onPress={handlePingServer}
              loading={pinging}
              size="sm"
              variant="outline"
            />
            <Button
              title="Reset Default"
              onPress={handleResetToDefaultUrl}
              size="sm"
              variant="secondary"
            />
          </View>

          {pingResult && (
            <View
              style={[
                styles.pingBanner,
                {
                  backgroundColor:
                    pingResult.status === 'ok' ? brand.successSoft : brand.dangerSoft,
                  borderColor: pingResult.status === 'ok' ? brand.success : brand.danger,
                },
              ]}
            >
              {pingResult.status === 'ok' ? (
                <CheckCircle2 size={16} color={brand.success} />
              ) : (
                <XCircle size={16} color={brand.danger} />
              )}
              <Text
                style={[
                  Typography.caption,
                  styles.pingText,
                  { color: pingResult.status === 'ok' ? brand.success : brand.danger },
                ]}
              >
                {pingResult.message}
              </Text>
            </View>
          )}
        </View>

        {/* Security Section (If Logged In) */}
        {isAuthenticated && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardTitleRow}>
              <Lock size={18} color={brand.primary} />
              <Text style={[Typography.h3, { color: colors.text }]}>Ubah Password Akun</Text>
            </View>

            <Text style={[Typography.caption, styles.cardDesc, { color: colors.textSecondary }]}>
              Minta token reset keamanan dari server lalu masukkan password baru Anda.
            </Text>

            <Button
              title="Minta Token Reset Password"
              onPress={handleRequestToken}
              loading={requestingToken}
              variant="outline"
              size="sm"
              style={{ alignSelf: 'flex-start', marginBottom: 12 }}
            />

            <Input
              label="Token Reset dari Backend"
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
              onPress={handleUpdatePassword}
              loading={submittingPassword}
              variant="primary"
              size="md"
            />

            {securityMsg && (
              <Text
                style={[
                  Typography.caption,
                  styles.secMsgText,
                  { color: securityMsg.type === 'error' ? brand.danger : brand.success },
                ]}
              >
                {securityMsg.text}
              </Text>
            )}
          </View>
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
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  cardDesc: {
    lineHeight: 18,
    marginBottom: 14,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  themeBtnText: {
    fontWeight: '800',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  pingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
  },
  pingText: {
    flex: 1,
    fontWeight: '700',
  },
  secMsgText: {
    marginTop: 10,
    fontWeight: '700',
  },
});
