import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowRight, CalendarDays, Heart, MapPin, Music2, Sparkles } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BrandColors, PublicThemePalette } from '../../constants/Colors';
import { useAppTheme } from '../../context/ThemeContext';
import { useFavorites } from '../../context/FavoritesContext';
import { EventItem } from '../../types';
import { formatRupiah, formatTanggalSingkat } from '../../utils/formatters';
import { FALLBACK_EVENT_IMAGE } from '../../constants/Config';

interface EventCardProps {
  event: EventItem;
  style?: ViewStyle;
  compact?: boolean;
  forcePublicTheme?: boolean;
}

export function EventCard({ event, style, compact = false, forcePublicTheme = false }: EventCardProps) {
  const router = useRouter();
  const appTheme = useAppTheme();
  const colors = forcePublicTheme ? PublicThemePalette : appTheme.colors;
  const brand = forcePublicTheme ? BrandColors : appTheme.brand;
  const { isEventFavorite, toggleEvent } = useFavorites();

  const isFav = isEventFavorite(event.id);
  const imageUri = event.poster_url || event.banner_url || FALLBACK_EVENT_IMAGE;

  const dateText = event.event_date
    ? formatTanggalSingkat(event.event_date)
    : event.event_type === 'festival'
    ? `Festival ${event.days_count || 1} Hari`
    : 'Jadwal Segera';

  const locationText = [event.venue, event.city].filter(Boolean).join(', ') || 'Lokasi Segera';

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/event/${event.id}` as any)}
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: colors.cardShadow,
        },
        compact && styles.cardCompact,
        style,
      ]}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, compact && styles.imageContainerCompact]}>
        <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(15, 23, 42, 0.4)', 'rgba(15, 23, 42, 0.85)']}
          style={styles.imageOverlay}
        />

        {/* Top Badges */}
        <View style={styles.topBadgeRow}>
          <View style={styles.typeBadge}>
            <Sparkles size={11} color={brand.primary} />
            <Text style={styles.typeBadgeText}>
              {event.event_type === 'festival'
                ? `Festival (${event.days_count || 1}H)`
                : 'Konser'}
            </Text>
          </View>

          {event.status === 'on_sale' ? (
            <View style={styles.onSaleBadge}>
              <Text style={styles.onSaleText}>ON SALE</Text>
            </View>
          ) : event.status ? (
            <View style={[styles.statusBadge, { backgroundColor: 'rgba(239, 68, 68, 0.9)' }]}>
              <Text style={styles.onSaleText}>{event.status.toUpperCase()}</Text>
            </View>
          ) : null}
        </View>

        {/* Floating Favorite Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.favBtn, { backgroundColor: isFav ? 'rgba(239, 68, 68, 0.25)' : 'rgba(0,0,0,0.45)' }]}
          onPress={() => toggleEvent(event.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Heart
            size={16}
            color={isFav ? brand.danger : '#FFFFFF'}
            fill={isFav ? brand.danger : 'transparent'}
          />
        </TouchableOpacity>

        {/* Artist on Image Bottom */}
        {event.artist_name ? (
          <View style={styles.artistOverlay}>
            <Music2 size={13} color={brand.cyanLight} />
            <Text style={styles.artistOverlayText} numberOfLines={1}>
              {event.artist_name}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Body Content */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {event.name}
        </Text>

        <View style={styles.metaCol}>
          <View style={styles.metaRow}>
            <CalendarDays size={14} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {dateText}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <MapPin size={14} color={colors.textMuted} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {locationText}
            </Text>
          </View>
        </View>

        {/* Bottom Price & Action */}
        <View style={[styles.footerRow, { borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.pricePrefix, { color: colors.textMuted }]}>Mulai dari</Text>
            <Text style={[styles.priceText, { color: brand.primary }]}>
              {event.price_from ? formatRupiah(event.price_from) : 'Cek Tiket'}
            </Text>
          </View>

          <View
            style={[
              styles.buyBtn,
              {
                backgroundColor: brand.primary,
                shadowColor: brand.primary,
              },
            ]}
          >
            <Text style={styles.buyBtnText}>Beli Tiket</Text>
            <ArrowRight size={13} color="#FFFFFF" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 14,
  },
  cardCompact: {
    width: 248,
    marginRight: 12,
    marginBottom: 0,
  },
  imageContainer: {
    height: 180,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  imageContainerCompact: {
    height: 135,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  topBadgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  onSaleBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 999,
  },
  onSaleText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  favBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  artistOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  artistOverlayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: -0.3,
  },
  metaCol: {
    marginTop: 10,
    gap: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 12.5,
    fontWeight: '500',
    flex: 1,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  pricePrefix: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginTop: 1,
  },
  buyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  buyBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
