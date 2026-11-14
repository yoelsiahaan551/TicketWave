import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const { isDark } = useAppTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Event Card Skeleton matching TicketWave-FE UpcomingConcert.jsx
 */
export function EventCardSkeleton({ compact = false }: { compact?: boolean }) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        compact && styles.cardCompact,
      ]}
    >
      <Skeleton
        width="100%"
        height={compact ? 130 : 180}
        borderRadius={16}
        style={{ marginBottom: 14 }}
      />
      <Skeleton width="40%" height={12} borderRadius={6} style={{ marginBottom: 8 }} />
      <Skeleton width="85%" height={18} borderRadius={6} style={{ marginBottom: 12 }} />
      <Skeleton width="60%" height={14} borderRadius={6} style={{ marginBottom: 14 }} />
      <View style={styles.footerRow}>
        <Skeleton width="45%" height={18} borderRadius={6} />
        <Skeleton width="30%" height={28} borderRadius={12} />
      </View>
    </View>
  );
}

/**
 * Order Card Skeleton
 */
export function OrderCardSkeleton() {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.orderCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.orderHeader}>
        <Skeleton width="40%" height={14} borderRadius={6} />
        <Skeleton width="25%" height={20} borderRadius={10} />
      </View>
      <Skeleton width="70%" height={18} borderRadius={6} style={{ marginVertical: 12 }} />
      <View style={styles.orderMeta}>
        <Skeleton width="30%" height={12} borderRadius={6} />
        <Skeleton width="30%" height={12} borderRadius={6} />
      </View>
      <View style={styles.orderFooter}>
        <Skeleton width="35%" height={20} borderRadius={6} />
        <Skeleton width="30%" height={32} borderRadius={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  cardCompact: {
    width: 240,
    marginRight: 14,
    marginBottom: 0,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  orderCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(148, 163, 184, 0.15)',
  },
});
