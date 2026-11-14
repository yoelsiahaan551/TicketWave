import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Moon, Sun, Ticket } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';
import { Typography } from '../../constants/Typography';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  showThemeToggle?: boolean;
  rightAction?: React.ReactNode;
}

export function Header({
  title,
  subtitle,
  showBack = false,
  showLogo = false,
  showThemeToggle = true,
  rightAction,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, brand, isDark, toggleTheme } = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 12) + 4,
          backgroundColor: colors.surface,
          borderBottomColor: colors.border,
          shadowColor: colors.cardShadow,
        },
      ]}
    >
      <View style={styles.leftRow}>
        {showBack && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={[
              styles.iconBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <ArrowLeft size={19} color={colors.text} />
          </TouchableOpacity>
        )}

        {showLogo ? (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)')}
            style={styles.logoWrap}
          >
            <LinearGradient
              colors={[brand.blueGradientStart, brand.cyan]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <Ticket size={20} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text style={[styles.logoTitle, { color: colors.text }]}>TicketWave</Text>
              <Text style={[styles.logoSub, { color: brand.primary }]}>OFFICIAL TICKETING</Text>
            </View>
          </TouchableOpacity>
        ) : (
          title && (
            <View style={styles.titleWrap}>
              <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
                {title}
              </Text>
              {subtitle ? (
                <Text style={[styles.subtitle, { color: colors.textMuted }]} numberOfLines={1}>
                  {subtitle}
                </Text>
              ) : null}
            </View>
          )
        )}
      </View>

      <View style={styles.rightRow}>
        {rightAction}
        {showThemeToggle && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={toggleTheme}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
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
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0080F2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  logoTitle: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  logoSub: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    lineHeight: 12,
    textTransform: 'uppercase',
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
});
