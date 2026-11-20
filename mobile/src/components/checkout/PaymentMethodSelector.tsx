import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Building2, Check, CreditCard, QrCode } from 'lucide-react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { PaymentMethodId } from '../../types';
import { PAYMENT_METHOD_OPTIONS } from '../../utils/payment';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodId | null;
  onSelect: (method: PaymentMethodId) => void;
  disabled?: boolean;
}

const METHOD_ICONS: Record<PaymentMethodId, typeof Building2> = {
  transfer_bank: Building2,
  virtual_account: CreditCard,
  qris: QrCode,
};

export function PaymentMethodSelector({
  selectedMethod,
  onSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const { colors, brand, isDark } = useAppTheme();

  const accentBorder = isDark ? brand.cyan : brand.primary;
  const accentHighlight = isDark ? 'rgba(6, 182, 212, 0.14)' : 'rgba(8, 145, 178, 0.08)';
  const selectedBadgeBg = isDark ? 'rgba(6, 182, 212, 0.22)' : 'rgba(8, 145, 178, 0.14)';

  return (
    <View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Pilih metode pembayaran"
        style={styles.list}
      >
        {PAYMENT_METHOD_OPTIONS.map((option) => {
          const selected = selectedMethod === option.id;
          const IconComponent = METHOD_ICONS[option.id];

          return (
            <Pressable
              key={option.id}
              onPress={() => !disabled && onSelect(option.id)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected, disabled }}
              accessibilityLabel={`${option.label}, ${option.description}`}
              testID={`payment-method-${option.id}`}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: selected ? accentHighlight : colors.surfaceElevated,
                  borderColor: selected ? accentBorder : colors.border,
                  borderWidth: selected ? 2 : 1,
                  opacity: disabled ? 0.6 : pressed ? 0.88 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  {
                    backgroundColor: selected ? accentBorder : colors.surface,
                    borderColor: selected ? accentBorder : colors.border,
                  },
                ]}
              >
                <IconComponent
                  size={18}
                  color={selected ? '#FFFFFF' : isDark ? brand.cyanLight : brand.primary}
                />
              </View>

              <View style={styles.textWrap}>
                <Text style={[styles.optionLabel, { color: colors.text }]}>{option.label}</Text>
                <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                  {option.description}
                </Text>
              </View>

              {selected ? (
                <View style={[styles.selectedBadge, { backgroundColor: selectedBadgeBg }]}>
                  <Check size={13} color={accentBorder} strokeWidth={2.8} />
                  <Text style={[styles.selectedText, { color: accentBorder }]}>Dipilih</Text>
                </View>
              ) : (
                <View style={[styles.radioCircle, { borderColor: colors.borderStrong }]} />
              )}
            </Pressable>
          );
        })}
      </View>

      <Text style={[styles.helperNote, { color: colors.textMuted }]}>
        Pilihan akhir kanal bank atau e-wallet dikonfirmasi pada halaman pembayaran Midtrans.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
    marginTop: 12,
  },
  optionCard: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  optionDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  selectedText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  helperNote: {
    fontSize: 11.5,
    lineHeight: 16,
    marginTop: 10,
  },
});
