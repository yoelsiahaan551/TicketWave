import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, Music2, Sparkles, Trash2 } from 'lucide-react-native';

import { useAppTheme } from '../src/context/ThemeContext';
import { useFavorites } from '../src/context/FavoritesContext';
import { fetchPublicEvents } from '../src/api/endpoints';
import { EventItem } from '../src/types';
import { Header } from '../src/components/common/Header';
import { EventCard } from '../src/components/event/EventCard';
import { EventCardSkeleton } from '../src/components/common/Skeleton';
import { EmptyState } from '../src/components/common/EmptyState';
import { Typography } from '../src/constants/Typography';

export default function FavoritesScreen() {
  const router = useRouter();
  const { colors, brand } = useAppTheme();
  const { favoriteArtists, favoriteEventIds, toggleArtist } = useFavorites();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicEvents({ per_page: 50 })
      .then((res) => {
        const all = res.data?.items || [];
        setEvents(all.filter((ev) => favoriteEventIds.includes(ev.id)));
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [favoriteEventIds]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title="Favorit Saya" subtitle="Event &amp; musisi pilihan Anda" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Favorite Artists */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Music2 size={18} color={brand.primary} />
            <Text style={[Typography.h3, { color: colors.text }]}>
              Musisi Favorit ({favoriteArtists.length})
            </Text>
          </View>

          {favoriteArtists.length === 0 ? (
            <View style={[styles.emptyMini, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[Typography.caption, { color: colors.textMuted, textAlign: 'center' }]}>
                Belum ada musisi favorit yang diikuti. Tekan tombol "+ Ikuti" pada daftar musisi beranda.
              </Text>
            </View>
          ) : (
            <View style={styles.artistWrap}>
              {favoriteArtists.map((artist) => (
                <View
                  key={artist}
                  style={[
                    styles.artistChip,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push({ pathname: '/(tabs)/events', params: { search: artist } })
                    }
                  >
                    <Text style={[Typography.body, styles.artistChipText, { color: colors.text }]}>
                      {artist}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => toggleArtist(artist)}
                    hitSlop={8}
                    style={styles.trashBtn}
                  >
                    <Trash2 size={14} color={brand.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Favorite Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={18} color={brand.danger} />
            <Text style={[Typography.h3, { color: colors.text }]}>
              Event Disimpan ({events.length})
            </Text>
          </View>

          {loading ? (
            <View style={{ gap: 14 }}>
              {[1, 2].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </View>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Heart size={28} color={brand.danger} />}
              title="Belum Ada Event Favorit"
              description="Ketuk ikon hati pada kartu event atau halaman detail untuk menyimpannya di sini agar mudah dipantau."
              actionLabel="Jelajahi Event Sekarang"
              onAction={() => router.push('/(tabs)/events')}
            />
          ) : (
            <View style={{ gap: 16 }}>
              {events.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emptyMini: {
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
  },
  artistWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  artistChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingLeft: 14,
    paddingRight: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  artistChipText: {
    fontWeight: '700',
    fontSize: 13,
  },
  trashBtn: {
    padding: 4,
    borderRadius: 999,
  },
});
