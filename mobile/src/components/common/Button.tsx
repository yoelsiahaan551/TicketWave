import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}: ButtonProps) {
  const { colors, brand } = useAppTheme();

  const isDisabled = disabled || loading;

  const getSizeStyle = (): {
    paddingVertical: number;
    paddingHorizontal: number;
    borderRadius: number;
    fontSize: number;
  } => {
    if (size === 'sm') {
      return { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 12, fontSize: 12 };
    }
    if (size === 'lg') {
      return { paddingVertical: 15, paddingHorizontal: 24, borderRadius: 18, fontSize: 16 };
    }
    return { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 15, fontSize: 14 };
  };

  const { paddingVertical, paddingHorizontal, borderRadius, fontSize } = getSizeStyle();

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={isDisabled}
        style={[{ opacity: isDisabled ? 0.6 : 1 }, style]}
      >
        <LinearGradient
          colors={[brand.blueGradientStart, brand.cyan]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradientBtn,
            {
              paddingVertical,
              paddingHorizontal,
              borderRadius,
              shadowColor: brand.primary,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {icon && iconPosition === 'left' && <>{icon}</>}
              <Text
                style={[
                  styles.btnText,
                  { fontSize, color: '#FFFFFF', marginHorizontal: icon ? 6 : 0 },
                  textStyle,
                ]}
              >
                {title}
              </Text>
              {icon && iconPosition === 'right' && <>{icon}</>}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const getVariantStyles = (): { bg: string; border: string; text: string } => {
    switch (variant) {
      case 'secondary':
        return {
          bg: colors.surfaceElevated,
          border: colors.border,
          text: colors.text,
        };
      case 'outline':
        return {
          bg: 'transparent',
          border: brand.primary,
          text: brand.primary,
        };
      case 'danger':
        return {
          bg: brand.danger,
          border: brand.danger,
          text: '#FFFFFF',
        };
      case 'primary':
      default:
        return {
          bg: brand.primary,
          border: brand.primary,
          text: '#FFFFFF',
        };
    }
  };

  const v = getVariantStyles();

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.baseBtn,
        {
          paddingVertical,
          paddingHorizontal,
          borderRadius,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: variant === 'outline' ? 1.5 : 1,
          opacity: isDisabled ? 0.6 : 1,
          shadowColor: variant === 'primary' ? brand.primary : 'transparent',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: variant === 'primary' ? 0.22 : 0,
          shadowRadius: 8,
          elevation: variant === 'primary' ? 3 : 0,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon && iconPosition === 'left' && <>{icon}</>}
          <Text
            style={[
              styles.btnText,
              { fontSize, color: v.text, marginHorizontal: icon ? 6 : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && <>{icon}</>}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
    elevation: 4,
  },
  btnText: {
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
