import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Flame,
  Globe,
  Headphones,
  HelpCircle,
  LogIn,
  MapPin,
  Music,
  Music2,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react-native';

import { useAppTheme } from '../src/context/ThemeContext';
import { fetchPublicCities, fetchPublicEvents } from '../src/api/endpoints';
import { EventItem } from '../src/types';
import { EventCard } from '../src/components/event/EventCard';
import { EventCardSkeleton } from '../src/components/common/Skeleton';
import { Button } from '../src/components/common/Button';
import { Typography } from '../src/constants/Typography';
import { FALLBACK_EVENT_IMAGE } from '../src/constants/Config';

const FAQS = [
  {
    q: 'Bagaimana cara membeli tiket di TicketWave Mobile?',
    a: 'Pilih event yang Anda inginkan, tentukan kategori tiket dan jumlah kuota, isi data identitas pemesan, lalu selesaikan transaksi melalui tautan pembayaran resmi.',
  },
  {
    q: 'Apakah saya perlu login untuk memesan tiket?',
    a: 'Tidak wajib. TicketWave mendukung Guest Checkout sehingga Anda dapat langsung memesan menggunakan email aktif Anda tanpa registrasi akun terlebih dahulu.',
  },
  {
    q: 'Di mana saya bisa melihat e-ticket dan kode QR saya?',
    a: 'Setelah checkout berhasil, booking Anda otomatis tersimpan di tab "Tiket Saya" dan "Pesanan Saya", lengkap dengan kode QR beresolusi tinggi untuk verifikasi gate.',
  },
  {
    q: 'Bisakah saya membatalkan pesanan yang belum dibayar?',
    a: 'Ya, selama status pesanan masih "Menunggu Pembayaran", Anda dapat membatalkannya melalui tombol Batalkan di detail pesanan.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Rian Pratama',
    role: 'Music Enthusiast, Jakarta',
    comment: 'Beli tiket konser Coldplay di TicketWave lancar banget! E-ticket langsung keluar dengan QR Code jelas dan aman.',
    stars: 5,
  },
  {
    name: 'Sarah Amanda',
    role: 'Festival Goer, Bandung',
    comment: 'Pemberitahuan fase harga Early Bird dan Presale sangat transparan. Aplikasi mobile-nya cepat, modern, dan sangat responsif.',
    stars: 5,
  },
  {
    name: 'Dimas Setiawan',
    role: 'Concert Regular, Surabaya',
    comment: 'Fitur pelacakan booking code langsung dari aplikasi sangat mempermudah pengambilan tiket gate pass.',
    stars: 5,
  },
];

const CATEGORIES = [
  { name: 'Semua', icon: Sparkles },
  { name: 'Konser Musik', icon: Music2 },
  { name: 'Festival', icon: Flame },
  { name: 'Pertunjukan', icon: Headphones },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, brand, isDark } = useAppTheme();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const [keyword, setKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchPublicEvents({ per_page: 8 })
        .then((res) => setEvents(res.data?.items || []))
        .catch(() => setEvents([])),
      fetchPublicCities()
        .then((res) => setCities(res.data?.cities || []))
        .catch(() => setCities([])),
    ]).finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = () => {
    router.push({
      pathname: '/(tabs)/events',
      params: {
        search: keyword.trim() || undefined,
        city: selectedCity || undefined,
        category: selectedCategory !== 'Semua' ? selectedCategory : undefined,
      },
    });
  };

  const featured = events[0] || null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Navbar matching TicketWave-FE */}
      <View
        style={[
          styles.navbar,
          {
            paddingTop: Math.max(insets.top, 12) + 6,
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.navLogo}>
          <LinearGradient
            colors={[brand.blueGradientStart, brand.blueGradientEnd]}
            style={styles.logoIcon}
          >
            <Ticket size={20} color="#FFFFFF" />
          </LinearGradient>
          <View>
            <Text style={[Typography.brand, styles.navBrand, { color: colors.text }]}>
              TicketWave
            </Text>
            <Text style={[Typography.eyebrow, styles.navTagline, { color: brand.primary }]}>
              OFFICIAL TICKETING
            </Text>
          </View>
        </View>

        <View style={styles.navActions}>
          <Button
            title="Masuk"
            onPress={() => router.push('/login')}
            variant="outline"
            size="sm"
          />
          <Button
            title="Katalog"
            onPress={() => router.push('/(tabs)/events')}
            variant="primary"
            size="sm"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section matching Hero.jsx */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200' }}
            style={styles.heroBgImage}
          />
          <LinearGradient
            colors={['rgba(9, 13, 22, 0.88)', 'rgba(9, 13, 22, 0.96)']}
            style={styles.heroOverlay}
          />

          {/* Background Glows */}
          <View style={styles.cyanGlow} pointerEvents="none" />
          <View style={styles.blueGlow} pointerEvents="none" />

          <View style={styles.heroContent}>
            <View style={styles.trustBadge}>
              <Ticket size={14} color="#22D3EE" />
              <Text style={styles.trustBadgeText}>Trusted by 150K+ Ticket Buyers</Text>
            </View>

            <Text style={[Typography.h1, styles.heroHeadline]}>
              Discover{'\n'}
              <Text style={{ color: '#22D3EE' }}>Amazing Events</Text>
            </Text>

            <Text style={[Typography.body, styles.heroSubheadline]}>
              Platform resmi pemesanan tiket konser, festival musik, dan pertunjukan langsung di seluruh kota Indonesia.
            </Text>

            {/* In-Hero Search Box */}
            <View style={styles.heroSearchBox}>
              <View style={styles.heroInputWrap}>
                <Search size={18} color="#94A3B8" />
                <TextInput
                  style={[Typography.body, styles.heroSearchInput]}
                  placeholder="Cari musisi, band, atau nama event..."
                  placeholderTextColor="#64748B"
                  value={keyword}
                  onChangeText={setKeyword}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                />
              </View>

              {cities.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.heroCityScroll}
                >
                  <TouchableOpacity
                    onPress={() => setSelectedCity('')}
                    style={[
                      styles.heroCityPill,
                      selectedCity === '' && styles.heroCityPillActive,
                    ]}
                  >
                    <Text
                      style={[
                        Typography.caption,
                        styles.heroCityText,
                        selectedCity === '' && styles.heroCityTextActive,
                      ]}
                    >
                      Semua Kota
                    </Text>
                  </TouchableOpacity>

                  {cities.slice(0, 6).map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setSelectedCity(c === selectedCity ? '' : c)}
                      style={[
                        styles.heroCityPill,
                        selectedCity === c && styles.heroCityPillActive,
                      ]}
                    >
                      <MapPin size={11} color={selectedCity === c ? '#FFFFFF' : '#94A3B8'} />
                      <Text
                        style={[
                          Typography.caption,
                          styles.heroCityText,
                          selectedCity === c && styles.heroCityTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              <Button
                title="Cari Tiket Event"
                onPress={handleSearchSubmit}
                variant="gradient"
                size="md"
                icon={<ArrowRight size={16} color="#FFFFFF" />}
                iconPosition="right"
                style={{ marginTop: 10 }}
              />
            </View>
          </View>
        </View>

        {/* Categories Shortcut */}
        <View style={styles.sectionWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const active = selectedCategory === cat.name;
              return (
                <TouchableOpacity
                  key={cat.name}
                  onPress={() => {
                    setSelectedCategory(cat.name);
                    router.push({
                      pathname: '/(tabs)/events',
                      params: { category: cat.name !== 'Semua' ? cat.name : undefined },
                    });
                  }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: active ? brand.primary : colors.surface,
                      borderColor: active ? brand.primary : colors.border,
                    },
                  ]}
                >
                  <IconComp size={16} color={active ? '#FFFFFF' : brand.primary} />
                  <Text
                    style={[
                      Typography.caption,
                      styles.categoryText,
                      { color: active ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Trending Events Section */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <TrendingUp size={20} color={brand.primary} />
              <Text style={[Typography.h3, { color: colors.text }]}>Trending Events</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/events')}>
              <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>
                Lihat Semua
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 14 }}
            >
              {[1, 2, 3].map((i) => (
                <View key={i} style={{ width: 280 }}>
                  <EventCardSkeleton />
                </View>
              ))}
            </ScrollView>
          ) : events.length > 0 ? (
            <FlatList
              data={events}
              keyExtractor={(item) => String(item.id)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
              renderItem={({ item }) => <EventCard event={item} compact />}
            />
          ) : null}
        </View>

        {/* Why Choose TicketWave matching WhyChoose.jsx */}
        <View style={[styles.featuresSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[Typography.eyebrow, { color: brand.primary, marginBottom: 4 }]}>
            KEUNGGULAN KAMI
          </Text>
          <Text style={[Typography.h3, { color: colors.text, marginBottom: 16 }]}>
            Kenapa Memilih TicketWave?
          </Text>

          <View style={styles.featureGrid}>
            <View style={[styles.featureCard, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.featureIconWrap, { backgroundColor: brand.primarySoft }]}>
                <ShieldCheck size={22} color={brand.primary} />
              </View>
              <Text style={[Typography.h4, { color: colors.text, marginBottom: 4 }]}>
                Tiket 100% Resmi
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Bekerja sama langsung dengan promotor dan agency terverifikasi se-Indonesia.
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.featureIconWrap, { backgroundColor: brand.cyanSoft }]}>
                <QrCode size={22} color={brand.cyan} />
              </View>
              <Text style={[Typography.h4, { color: colors.text, marginBottom: 4 }]}>
                Instant QR Pass
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                E-ticket langsung terbit dengan token QR siap scan di pintu masuk venue.
              </Text>
            </View>

            <View style={[styles.featureCard, { backgroundColor: colors.surfaceElevated }]}>
              <View style={[styles.featureIconWrap, { backgroundColor: brand.successSoft }]}>
                <CreditCard size={22} color={brand.success} />
              </View>
              <Text style={[Typography.h4, { color: colors.text, marginBottom: 4 }]}>
                Pembayaran Fleksibel &amp; Aman
              </Text>
              <Text style={[Typography.caption, { color: colors.textSecondary }]}>
                Mendukung Virtual Account, QRIS, dan Kartu Kredit dengan auto-release kuota bila dibatalkan.
              </Text>
            </View>
          </View>
        </View>

        {/* Featured Showcase */}
        {featured && (
          <View style={styles.sectionWrap}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame size={20} color={brand.primary} />
                <Text style={[Typography.h3, { color: colors.text }]}>Spotlight Event</Text>
              </View>
            </View>

            <View style={{ paddingHorizontal: 16 }}>
              <EventCard event={featured} />
            </View>
          </View>
        )}

        {/* Testimonials */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Star size={20} color="#F59E0B" fill="#F59E0B" />
              <Text style={[Typography.h3, { color: colors.text }]}>Kata Pembeli Tiket</Text>
            </View>
          </View>

          <View style={styles.testiContainer}>
            {TESTIMONIALS.map((t, i) => (
              <View
                key={i}
                style={[
                  styles.testiCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.starsRow}>
                  {[...Array(t.stars)].map((_, idx) => (
                    <Star key={idx} size={14} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </View>
                <Text style={[Typography.body, styles.testiComment, { color: colors.textSecondary }]}>
                  "{t.comment}"
                </Text>
                <Text style={[Typography.h4, { color: colors.text }]}>{t.name}</Text>
                <Text style={[Typography.caption, { color: colors.textMuted }]}>{t.role}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FAQ Accordion */}
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <HelpCircle size={20} color={brand.primary} />
              <Text style={[Typography.h3, { color: colors.text }]}>Pertanyaan Umum (FAQ)</Text>
            </View>
          </View>

          <View style={{ paddingHorizontal: 16, gap: 10 }}>
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.88}
                  onPress={() => setActiveFaq(isOpen ? null : idx)}
                  style={[
                    styles.faqCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[Typography.h4, styles.faqQuestion, { color: colors.text }]}>
                      {faq.q}
                    </Text>
                    {isOpen ? (
                      <ChevronUp size={18} color={brand.primary} />
                    ) : (
                      <ChevronDown size={18} color={colors.textMuted} />
                    )}
                  </View>
                  {isOpen && (
                    <Text style={[Typography.body, styles.faqAnswer, { color: colors.textSecondary }]}>
                      {faq.a}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom CTA Banner */}
        <View style={styles.bottomCtaWrapper}>
          <LinearGradient
            colors={[brand.blueGradientStart, '#02509D']}
            style={styles.bottomCtaCard}
          >
            <Text style={[Typography.h2, styles.bottomCtaTitle]}>
              Siap Nonton Musisi Favoritmu?
            </Text>
            <Text style={[Typography.body, styles.bottomCtaDesc]}>
              Beli tiket sekarang dan simpan e-ticket resmi langsung di smartphone Anda.
            </Text>
            <Button
              title="Mulai Jelajahi Event"
              onPress={() => router.push('/(tabs)/events')}
              variant="secondary"
              size="lg"
              style={{ marginTop: 16, backgroundColor: '#FFFFFF', alignSelf: 'stretch' }}
              textStyle={{ color: '#0080F2', fontWeight: '800' }}
            />
          </LinearGradient>
        </View>

        {/* Mobile Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <View style={styles.footerBrandRow}>
            <LinearGradient
              colors={[brand.blueGradientStart, brand.blueGradientEnd]}
              style={styles.footerLogo}
            >
              <Ticket size={16} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[Typography.h4, { color: colors.text }]}>TicketWave Mobile</Text>
          </View>
          <Text style={[Typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: 6 }]}>
            © 2026 TicketWave. Platform Resmi Tiket Konser &amp; Festival Musik Indonesia.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  navLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBrand: {
    fontSize: 18,
    lineHeight: 22,
  },
  navTagline: {
    fontSize: 8,
    letterSpacing: 1.2,
  },
  navActions: {
    flexDirection: 'row',
    gap: 8,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroSection: {
    position: 'relative',
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  heroBgImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
  },
  cyanGlow: {
    position: 'absolute',
    top: -40,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(6, 182, 212, 0.22)',
  },
  blueGlow: {
    position: 'absolute',
    bottom: 20,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(0, 128, 242, 0.22)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 1,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  trustBadgeText: {
    color: '#22D3EE',
    fontSize: 11,
    fontWeight: '700',
  },
  heroHeadline: {
    color: '#FFFFFF',
    fontSize: 34,
    lineHeight: 40,
    marginBottom: 12,
  },
  heroSubheadline: {
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  heroSearchBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 22,
    padding: 14,
    backdropFilter: 'blur(20px)',
  },
  heroInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroSearchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  heroCityScroll: {
    gap: 8,
    paddingVertical: 10,
  },
  heroCityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroCityPillActive: {
    backgroundColor: '#0080F2',
    borderColor: '#0080F2',
  },
  heroCityText: {
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroCityTextActive: {
    color: '#FFFFFF',
  },
  sectionWrap: {
    marginTop: 24,
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryText: {
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featuresSection: {
    marginHorizontal: 16,
    marginTop: 26,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  featureGrid: {
    gap: 12,
  },
  featureCard: {
    padding: 16,
    borderRadius: 18,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  testiContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  testiCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  testiComment: {
    lineHeight: 21,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  faqCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
  },
  faqAnswer: {
    lineHeight: 20,
    marginTop: 10,
  },
  bottomCtaWrapper: {
    marginHorizontal: 16,
    marginTop: 28,
  },
  bottomCtaCard: {
    padding: 24,
    borderRadius: 26,
    alignItems: 'center',
  },
  bottomCtaTitle: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  bottomCtaDesc: {
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    marginTop: 36,
    paddingHorizontal: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerLogo: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
