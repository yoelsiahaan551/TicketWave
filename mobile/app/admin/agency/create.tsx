import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Building2, Upload } from 'lucide-react-native';

import { useAppTheme } from '@/src/context/ThemeContext';
import { createAdminAgency, uploadAgencyLogo } from '@/src/api/endpoints';
import { Header } from '@/src/components/common/Header';
import { Input } from '@/src/components/common/Input';
import { Button } from '@/src/components/common/Button';
import { Typography } from '@/src/constants/Typography';

export default function AdminCreateAgencyScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();

  const [name, setName] = useState('');
  const [picName, setPicName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin Galeri', 'Aplikasi memerlukan izin untuk memilih foto logo.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setLogoUri(res.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim() || !picName.trim() || !email.trim() || !phone.trim()) {
      setError('Nama agency, nama PIC, email, dan nomor telepon wajib diisi.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createAdminAgency({
        name: name.trim(),
        pic_name: picName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
      });

      const agencyId = res.data?.id;
      if (agencyId && logoUri) {
        try {
          console.log(`[Upload] Uploading logo for agency ${agencyId}...`);
          await uploadAgencyLogo(agencyId, logoUri);
          console.log('[Upload] Logo upload succeeded!');
        } catch (uploadErr: any) {
          console.warn('[Upload Blocker ISSUE-03] Logo upload failed (BLOCKED-BY-BACKEND):', uploadErr?.message);
          setError(`Upload Logo Gagal (BLOCKED-BY-BACKEND ISSUE-03 Cloudinary HTTP 500): ${uploadErr?.message}`);
          return;
        }
      }

      Alert.alert('Sukses', `Agency "${name}" berhasil ditambahkan!`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      setError(err?.message || 'Gagal menambahkan agency.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Tambah Agency" subtitle="POST /api/agencies" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {error && (
            <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
              <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>{error}</Text>
            </View>
          )}

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Logo Picker */}
            <Text style={[Typography.caption, styles.label, { color: colors.textSecondary }]}>
              Logo Agency (Opsional)
            </Text>
            <View style={styles.logoRow}>
              <View style={[styles.logoPreview, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                {logoUri ? (
                  <Image source={{ uri: logoUri }} style={styles.logoImg} />
                ) : (
                  <Building2 size={28} color={brand.primary} />
                )}
              </View>
              <Button
                title={logoUri ? 'Ganti Logo' : 'Pilih Logo'}
                onPress={handlePickLogo}
                size="sm"
                variant="secondary"
                icon={<Upload size={14} color={colors.text} />}
              />
            </View>

            <Input
              label="Nama Agency *"
              placeholder="Contoh: Ismaya Live"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Nama PIC / Penanggung Jawab *"
              placeholder="Nama penanggung jawab"
              value={picName}
              onChangeText={setPicName}
            />

            <Input
              label="Email Agency *"
              placeholder="agency@domain.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Nomor Telepon *"
              placeholder="081234567890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Input
              label="Alamat Kantor (Opsional)"
              placeholder="Alamat lengkap promotor"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />

            <Button
              title="Simpan Agency"
              onPress={handleSubmit}
              loading={submitting}
              variant="gradient"
              size="lg"
              style={{ marginTop: 10 }}
            />
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
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  logoPreview: {
    width: 60,
    height: 60,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
});
