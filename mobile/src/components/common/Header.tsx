import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Moon, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { PublicThemePalette } from '../../constants/Colors';
import { useAppTheme } from '../../context/ThemeContext';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showThemeToggle?: boolean;
  forcePublicTheme?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  showThemeToggle = true,
  forcePublicTheme = false,
  rightAction,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const appTheme = useAppTheme();
  const isDark = forcePublicTheme ? true : appTheme.isDark;
  const colors = forcePublicTheme ? PublicThemePalette : appTheme.colors;
  const toggleTheme = appTheme.toggleTheme;
  const shouldShowThemeToggle = forcePublicTheme ? false : showThemeToggle;

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 10) + 6,
          paddingLeft: Math.max(insets.left, 16),
          paddingRight: Math.max(insets.right, 16),
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            accessibilityLabel="Kembali"
          >
            <ArrowLeft size={18} color={colors.text} />
          </TouchableOpacity>
        )}

        {showLogo ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)')}
            style={styles.logoWrap}
          >
            <Image
              source={require('../../../assets/images/ticketwave.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={[styles.logoTitle, { color: colors.text }]}>TicketWave</Text>
          </TouchableOpacity>
        ) : (
          title && (
            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          )
        )}
      </View>

      <View style={styles.rightRow}>
        {rightAction}
        {shouldShowThemeToggle && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
            accessibilityLabel="Toggle theme"
          >
            {isDark ? (
              <Sun size={17} color="#FBBF24" />
            ) : (
              <Moon size={17} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    zIndex: 30,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoImage: {
    width: 30,
    height: 30,
  },
  logoTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
});
