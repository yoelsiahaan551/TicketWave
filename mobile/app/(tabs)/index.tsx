import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Clock,
  Flame,
  Heart,
  Music2,
  Receipt,
  Search,
  Sparkles,
  Ticket,
} from 'lucide-react-native';

import { useAppTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import { useFavorites } from '../../src/context/FavoritesContext';
import { fetchPublicCities, fetchPublicEvents } from '../../src/api/endpoints';
import { EventItem } from '../../src/types';
import { Header } from '../../src/components/common/Header';
import { EventCard } from '../../src/components/event/EventCard';
import { Button } from '../../src/components/common/Button';
import { EventCardSkeleton } from '../../src/components/common/Skeleton';

export default function UserHomeScreen() {
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();
  const { user } = useAuth();
  const { isArtistFavorite, toggleArtist } = useFavorites();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [citiesCount, setCitiesCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingCodeInput, setBookingCodeInput] = useState('');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    Promise.allSettled([
      fetchPublicEvents({ per_page: 8 }),
      fetchPublicCities(),
    ])
      .then(([eventsRes, citiesRes]) => {
        if (ignore) return;
        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          const items = eventsRes.value.data.items || [];
          setEvents(items);
          setTotalEvents(eventsRes.value.data.total_items || items.length);
        }
        if (citiesRes.status === 'fulfilled' && citiesRes.value?.data?.cities) {
          setCitiesCount(citiesRes.value.data.cities.length);
        }
        setError(null);
      })
      .catch((err: any) => {
        if (!ignore) {
          setError(err?.message || 'Gagal memuat katalog event.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
          setRefreshing(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.allSettled([
      fetchPublicEvents({ per_page: 8 }),
      fetchPublicCities(),
    ])
      .then(([eventsRes, citiesRes]) => {
        if (eventsRes.status === 'fulfilled' && eventsRes.value?.data) {
          const items = eventsRes.value.data.items || [];
          setEvents(items);
          setTotalEvents(eventsRes.value.data.total_items || items.length);
        }
        if (citiesRes.status === 'fulfilled' && citiesRes.value?.data?.cities) {
          setCitiesCount(citiesRes.value.data.cities.length);
        }
        setError(null);
      })
      .catch((err: any) => {
        setError(err?.message || 'Gagal memuat katalog event.');
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    router.push({
      pathname: '/(tabs)/events',
      params: q ? { search: q } : {},
    });
  };

  const handleQuickLookup = () => {
    const code = bookingCodeInput.trim().toUpperCase();
    if (!code) return;
    router.push(`/order/${encodeURIComponent(code)}` as any);
  };

  const featured = events[0] || null;
  const upcomingEvents = events.slice(1);

  // Lineup items dynamically derived from real events matching Next.js FavoriteArtist.jsx
  const lineupItems = events.slice(0, 5).map((ev) => ({
    name: ev.artist_name || (ev.event_type === 'festival' ? `Lineup Festival` : ev.name),
    genre: ev.event_type === 'festival' ? `Festival (${ev.days_count || 1} Hari)` : ev.city || 'Live Event',
    image: ev.poster_url || ev.banner_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=400',
    eventId: ev.id,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showLogo
        rightAction={
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/events')}
            style={[
              styles.headerSearchBtn,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Search size={18} color={colors.text} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
            colors={[brand.primary]}
          />
        }
      >
        {/* =========================================================
            HERO SECTION (Matching TicketWave-FE UserHero.jsx)
           ========================================================= */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['#020617', '#090D16', '#0F172A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroBackground}
          >
            {/* Background Glow Circles */}
            <View style={styles.glowCyan} />
            <View style={styles.glowBlue} />

            {/* Sparkles Trust Badge */}
            <View style={styles.heroTrustBadge}>
              <Sparkles size={14} color="#22D3EE" />
              <Text style={styles.heroTrustText} numberOfLines={1}>
                {user?.name
                  ? `Halo, ${user.name.split(' ')[0]}! Selamat Datang`
                  : 'Official Concert & Festival Ticketing'}
              </Text>
            </View>

            {/* Main Headline */}
            <Text style={styles.heroHeadline}>
              Temukan & Pesan{'\n'}
              <Text style={styles.heroHeadlineGradient}>Tiket Event Impianmu</Text>
            </Text>

            <Text style={styles.heroSubheadline}>
              Jelajahi konser tunggal dan festival musik terbaik di berbagai kota. Nikmati harga fase Early Bird & Presale resmi.
            </Text>

            {/* Search Input Bar (Matching Next.js search form) */}
            <View style={[styles.searchBox, { backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)' }]}>
              <View style={styles.searchInner}>
                <Search size={18} color={brand.primary} style={styles.searchIcon} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  onSubmitEditing={handleSearchSubmit}
                  placeholder="Cari konser atau artis..."
                  placeholderTextColor="#94A3B8"
                  style={[styles.searchInput, { color: isDark ? '#FFFFFF' : '#0F172A' }]}
                  returnKeyType="search"
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSearchSubmit}
                style={[styles.searchBtn, { backgroundColor: brand.primary }]}
              >
                <Text style={styles.searchBtnText}>Cari</Text>
                <ArrowRight size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Quick Booking Code Lookup (Matching Next.js lookup form) */}
            <View style={styles.quickLookupBox}>
              <Receipt size={15} color={brand.cyanLight} />
              <TextInput
                value={bookingCodeInput}
                onChangeText={setBookingCodeInput}
                onSubmitEditing={handleQuickLookup}
                placeholder="Punya kode booking? (cth: TKTW-20261103-...)"
                placeholderTextColor="#64748B"
                style={styles.quickLookupInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleQuickLookup}
                style={styles.quickLookupBtn}
              >
                <Text style={styles.quickLookupBtnText}>Cek</Text>
              </TouchableOpacity>
            </View>

            {/* Real Stats Row from Backend */}
            <View style={styles.statsRow}>
              <View style={styles.statCol}>
                <Text style={styles.statVal}>{totalEvents}</Text>
                <Text style={styles.statLabel}>Event On Sale</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={styles.statVal}>{citiesCount}</Text>
                <Text style={styles.statLabel}>Kota Tersedia</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statCol}>
                <Text style={[styles.statVal, { color: brand.cyanLight }]}>15m</Text>
                <Text style={styles.statLabel}>Garansi Kuota</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* =========================================================
            FEATURED EVENT HIGHLIGHT (If available)
           ========================================================= */}
        {featured ? (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={styles.titleRow}>
                <Flame size={20} color={brand.primary} />
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Event Terpopuler
                </Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
                <Text style={[styles.seeAllText, { color: brand.primary }]}>Lihat Semua</Text>
              </TouchableOpacity>
            </View>

            <EventCard event={featured} />
          </View>
        ) : null}

        {/* =========================================================
            LIVE ON SALE EVENTS (Matching TicketWave-FE UpcomingConcert.jsx)
           ========================================================= */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionEyebrow, { color: brand.primary }]}>
                LIVE ON SALE EVENTS
              </Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Event yang Sedang Dijual
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/events')}
              style={styles.seeAllBtn}
            >
              <Text style={[styles.seeAllText, { color: brand.primary }]}>Semua</Text>
              <ArrowRight size={14} color={brand.primary} />
            </TouchableOpacity>
          </View>

          {/* Skeleton Loading State (No gigantic spinner!) */}
          {loading ? (
            <View style={{ gap: 12 }}>
              <EventCardSkeleton />
              <EventCardSkeleton />
            </View>
          ) : error && events.length === 0 ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surface, borderColor: brand.danger }]}>
              <Text style={[styles.errorTitle, { color: brand.danger }]}>Koneksi Backend Terkendala</Text>
              <Text style={[styles.errorDesc, { color: colors.textSecondary }]}>{error}</Text>
              <Button
                title="Coba Muat Ulang"
                onPress={onRefresh}
                size="sm"
                style={{ marginTop: 12, alignSelf: 'center' }}
              />
            </View>
          ) : (
            <View>
              {upcomingEvents.map((ev) => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </View>
          )}
        </View>

        {/* =========================================================
            FEATURED LINEUP & PERFORMERS (Matching TicketWave-FE FavoriteArtist.jsx)
           ========================================================= */}
        {lineupItems.length > 0 && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View>
                <View style={styles.titleRow}>
                  <Music2 size={16} color={brand.primary} />
                  <Text style={[styles.sectionEyebrow, { color: brand.primary, marginLeft: 6 }]}>
                    FEATURED LINEUP & PERFORMERS
                  </Text>
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Penampil & Lineup Aktif
                </Text>
              </View>
            </View>

            <FlatList
              data={lineupItems}
              keyExtractor={(item) => String(item.eventId) + item.name}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
              renderItem={({ item }) => {
                const isFav = isArtistFavorite(item.name);
                return (
                  <TouchableOpacity
                    activeOpacity={0.88}
                    onPress={() => router.push(`/event/${item.eventId}` as any)}
                    style={[
                      styles.performerCard,
                      {
                        backgroundColor: colors.surface,
                        borderColor: isFav ? brand.primary : colors.border,
                        shadowColor: colors.cardShadow,
                      },
                    ]}
                  >
                    <Image source={{ uri: item.image }} style={styles.performerImg} />
                    <View style={styles.performerBody}>
                      <Text style={[styles.performerName, { color: colors.text }]} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={[styles.performerGenre, { color: colors.textMuted }]} numberOfLines={1}>
                        {item.genre}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => toggleArtist(item.name)}
                        style={[
                          styles.followBtn,
                          {
                            backgroundColor: isFav ? brand.dangerSoft : colors.surfaceElevated,
                            borderColor: isFav ? brand.danger : colors.border,
                          },
                        ]}
                      >
                        <Heart
                          size={12}
                          color={isFav ? brand.danger : colors.textSecondary}
                          fill={isFav ? brand.danger : 'transparent'}
                        />
                        <Text
                          style={[
                            styles.followBtnText,
                            { color: isFav ? brand.danger : colors.textSecondary },
                          ]}
                        >
                          {isFav ? 'Favorit' : 'Ikuti'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* =========================================================
            PROMO & FASE HARGA RESMI (Matching TicketWave-FE PromoSection.jsx)
           ========================================================= */}
        <View style={styles.sectionWrap}>
          <LinearGradient
            colors={['#0080F2', '#02509D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.promoCard}
          >
            <View style={styles.promoBadge}>
              <Sparkles size={13} color="#FFFFFF" />
              <Text style={styles.promoBadgeText}>FASE HARGA OTOMATIS TICKETWAVE</Text>
            </View>

            <Text style={styles.promoTitle}>
              Hemat Lebih Banyak di Fase Early Bird & Presale Resmi
            </Text>

            <Text style={styles.promoDesc}>
              Setiap kategori tiket di TicketWave mendukung fase harga Early Bird, Presale, dan Normal. Potongan harga diterapkan otomatis secara real-time.
            </Text>

            {/* Scheme mini cards */}
            <View style={styles.schemeWrap}>
              <View style={styles.schemeItem}>
                <View style={styles.schemeItemLeft}>
                  <Clock size={14} color="#22D3EE" />
                  <Text style={styles.schemeName}>Early Bird</Text>
                </View>
                <Text style={styles.schemeVal}>Diskon Fase Awal</Text>
              </View>

              <View style={styles.schemeItem}>
                <View style={styles.schemeItemLeft}>
                  <Clock size={14} color="#22D3EE" />
                  <Text style={styles.schemeName}>Presale</Text>
                </View>
                <Text style={styles.schemeVal}>Harga Spesial</Text>
              </View>

              <View style={styles.schemeItem}>
                <View style={styles.schemeItemLeft}>
                  <Ticket size={14} color="#FFFFFF" />
                  <Text style={styles.schemeName}>Normal</Text>
                </View>
                <Text style={styles.schemeVal}>Harga Standar</Text>
              </View>
            </View>

            {/* Action Button Row */}
            <View style={styles.promoActionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/(tabs)/events')}
                style={styles.promoPrimaryBtn}
              >
                <Text style={styles.promoPrimaryBtnText}>Eksplor Event On Sale</Text>
                <ArrowRight size={15} color="#0080F2" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push('/landing')}
                style={styles.promoOutlineBtn}
              >
                <Text style={styles.promoOutlineBtnText}>Tentang Kami</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSearchBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 32,
  },

  // HERO SECTION
  heroSection: {
    marginBottom: 20,
  },
  heroBackground: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 30,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  glowCyan: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(6, 182, 212, 0.18)',
  },
  glowBlue: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(0, 128, 242, 0.22)',
  },
  heroTrustBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0, 128, 242, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.3)',
    marginBottom: 16,
  },
  heroTrustText: {
    color: '#E0F2FE',
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    color: '#FFFFFF',
    letterSpacing: -0.6,
  },
  heroHeadlineGradient: {
    color: '#22D3EE',
  },
  heroSubheadline: {
    fontSize: 13.5,
    lineHeight: 20,
    color: '#94A3B8',
    fontWeight: '400',
    marginTop: 8,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 10,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    height: 40,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },
  searchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  quickLookupBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  quickLookupInput: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'monospace',
    color: '#FFFFFF',
    paddingVertical: 2,
  },
  quickLookupBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  quickLookupBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
    paddingTop: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  // SECTIONS
  sectionWrap: {
    paddingHorizontal: 18,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionEyebrow: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '800',
  },
  horizontalList: {
    paddingRight: 8,
    gap: 12,
  },

  // PERFORMER CARDS
  performerCard: {
    width: 145,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  performerImg: {
    width: '100%',
    height: 120,
    backgroundColor: '#0F172A',
  },
  performerBody: {
    padding: 10,
  },
  performerName: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  performerGenre: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
    marginBottom: 8,
  },
  followBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  followBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
  },

  // PROMO CARD
  promoCard: {
    borderRadius: 28,
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    marginBottom: 12,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 26,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  promoDesc: {
    fontSize: 12.5,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 8,
    marginBottom: 16,
  },
  schemeWrap: {
    gap: 8,
    marginBottom: 18,
  },
  schemeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  schemeItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  schemeName: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  schemeVal: {
    color: '#E0F2FE',
    fontSize: 11.5,
    fontWeight: '600',
  },
  promoActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoPrimaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
  },
  promoPrimaryBtnText: {
    color: '#0080F2',
    fontSize: 13,
    fontWeight: '800',
  },
  promoOutlineBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoOutlineBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // ERROR CARD
  errorCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  errorDesc: {
    fontSize: 12.5,
    textAlign: 'center',
    lineHeight: 18,
  },
});
