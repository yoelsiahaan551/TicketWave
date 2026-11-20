import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { BrandColors, PublicThemePalette } from '../src/constants/Colors';
import { Typography } from '../src/constants/Typography';
import LandingScreen from './landing';

export default function IndexScreen() {
  const { user, isAuthenticated, isAdmin, isOfficer, loading } = useAuth();
  const colors = PublicThemePalette;
  const brand = BrandColors;

  // Show loading indicator while resolving stored authentication credentials
  if (loading) {
    return (
      <View style={[styles.centerWrap, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={brand.primary} />
        <Text style={[Typography.caption, styles.loadingText, { color: colors.textSecondary }]}>
          Memuat TicketWave...
        </Text>
      </View>
    );
  }

  // If authenticated, automatically direct user to their respective role dashboard
  if (isAuthenticated && user) {
    if (isAdmin) {
      return <Redirect href="/admin" />;
    }
    if (isOfficer) {
      return <Redirect href="/officer" />;
    }
    return <Redirect href="/(tabs)" />;
  }

  // If unauthenticated (guest), immediately present the public Landing Page
  return <LandingScreen />;
}

const styles = StyleSheet.create({
  centerWrap: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    letterSpacing: 0.2,
  },
});
