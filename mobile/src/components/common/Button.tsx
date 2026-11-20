import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { BrandColors, PublicThemePalette } from '../../constants/Colors';
import { useAppTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  loadingTitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  forcePublicTheme?: boolean;
  accessibilityLabel?: string;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  loadingTitle,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  forcePublicTheme = false,
  accessibilityLabel,
  testID,
  style,
  textStyle,
}: ButtonProps) {
  const appTheme = useAppTheme();
  const colors = forcePublicTheme ? PublicThemePalette : appTheme.colors;
  const brand = forcePublicTheme ? BrandColors : appTheme.brand;

  const isDisabled = disabled || loading;

  const getSizeStyle = (): {
    minHeight: number;
    paddingVertical: number;
    paddingHorizontal: number;
    borderRadius: number;
    fontSize: number;
  } => {
    if (size === 'sm') {
      return {
        minHeight: 44,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        fontSize: 13,
      };
    }
    if (size === 'lg') {
      return {
        minHeight: 50,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        fontSize: 15,
      };
    }
    return {
      minHeight: 48,
      paddingVertical: 11,
      paddingHorizontal: 18,
      borderRadius: 12,
      fontSize: 14,
    };
  };

  const { minHeight, paddingVertical, paddingHorizontal, borderRadius, fontSize } = getSizeStyle();

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
          border: colors.borderStrong,
          text: colors.text,
        };
      case 'danger':
        return {
          bg: brand.danger,
          border: brand.danger,
          text: '#FFFFFF',
        };
      case 'gradient':
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
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || (loading && loadingTitle ? loadingTitle : title)}
      testID={testID}
      style={[
        styles.baseBtn,
        {
          minHeight,
          paddingVertical,
          paddingHorizontal,
          borderRadius,
          backgroundColor: v.bg,
          borderColor: v.border,
          borderWidth: 1,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        loadingTitle ? (
          <>
            <ActivityIndicator size="small" color={v.text} />
            <Text style={[styles.btnText, { fontSize, color: v.text, marginLeft: 8 }, textStyle]}>
              {loadingTitle}
            </Text>
          </>
        ) : (
          <ActivityIndicator size="small" color={v.text} />
        )
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
  btnText: {
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
