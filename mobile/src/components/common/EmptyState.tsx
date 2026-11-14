import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { Button } from './Button';
import { Typography } from '../../constants/Typography';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionTitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionTitle,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const { colors, brand } = useAppTheme();
  const btnTitle = actionTitle || actionLabel;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      {icon && (
        <View style={[styles.iconCircle, { backgroundColor: brand.primarySoft }]}>
          {icon}
        </View>
      )}
      <Text style={[Typography.h3, styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[Typography.body, styles.desc, { color: colors.textSecondary }]}>
        {description}
      </Text>
      {btnTitle && onAction && (
        <Button
          title={btnTitle}
          onPress={onAction}
          variant="gradient"
          size="md"
          style={{ marginTop: 18 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginVertical: 12,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  desc: {
    textAlign: 'center',
    lineHeight: 20,
  },
});
