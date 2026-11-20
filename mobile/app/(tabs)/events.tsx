import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowUpDown, Check, ChevronDown, MapPin, Search, X } from 'lucide-react-native';
import { useLocalSearchParams } from 'expo-router';

import { useAppTheme } from '../../src/context/ThemeContext';
import { fetchPublicCities, fetchPublicEvents } from '../../src/api/endpoints';
import { EventItem } from '../../src/types';
import { Header } from '../../src/components/common/Header';
import { EventCard } from '../../src/components/event/EventCard';
import { Input } from '../../src/components/common/Input';
import { EmptyState } from '../../src/components/common/EmptyState';
import { EventCardSkeleton } from '../../src/components/common/Skeleton';

const SORT_OPTIONS = [
  { id: 'terdekat', label: 'Tanggal Terdekat' },
  { id: 'termurah', label: 'Harga Termurah' },
  { id: 'termahal', label: 'Harga Termahal' },
  { id: 'nama', label: 'Nama A - Z' },
];

const CATEGORIES = ['Semua', 'Single', 'Festival'];

export default function EventsScreen() {
  const localParams = useLocalSearchParams<{ search?: string; city?: string }>();
  const { colors, brand, isDark } = useAppTheme();

  const [search, setSearch] = useState(localParams.search || '');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [selectedCity, setSelectedCity] = useState(localParams.city || 'Semua');
  const [selectedSort, setSelectedSort] = useState('terdekat');

  const [cities, setCities] = useState<string[]>(['Semua']);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Cities
  useEffect(() => {
    fetchPublicCities()
      .then((res) => {
        if (res.data?.cities) {
          setCities(['Semua', ...res.data.cities]);
        }
      })
      .catch(() => {});
  }, []);

  const sortItems = useCallback(
    (raw: EventItem[]) => {
      return [...raw].sort((a, b) => {
        if (selectedSort === 'terdekat') {
          return new Date(a.event_date || 0).getTime() - new Date(b.event_date || 0).getTime();
        }
        if (selectedSort === 'termurah') {
          return (a.price_from || 0) - (b.price_from || 0);
        }
        if (selectedSort === 'termahal') {
          return (b.price_from || 0) - (a.price_from || 0);
        }
        if (selectedSort === 'nama') {
          return (a.name || '').localeCompare(b.name || '');
        }
        return 0;
      });
    },
    [selectedSort]
  );

  useEffect(() => {
    let ignore = false;
    const params: any = { per_page: 20 };
    if (search.trim()) params.search = search.trim();
    if (selectedCategory !== 'Semua') params.event_type = selectedCategory.toLowerCase();
    if (selectedCity !== 'Semua') params.city = selectedCity;

    fetchPublicEvents(params)
      .then((res) => {
        if (!ignore) {
          const items = res.data?.items || [];
          setEvents(sortItems(items));
          setError(null);
        }
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
  }, [search, selectedCategory, selectedCity, sortItems]);

  const onRefresh = () => {
    setRefreshing(true);
    const params: any = { per_page: 20 };
    if (search.trim()) params.search = search.trim();
    if (selectedCategory !== 'Semua') params.event_type = selectedCategory.toLowerCase();
    if (selectedCity !== 'Semua') params.city = selectedCity;

    fetchPublicEvents(params)
      .then((res) => {
        const items = res.data?.items || [];
        setEvents(sortItems(items));
        setError(null);
      })
      .catch((err: any) => {
        setError(err?.message || 'Gagal memuat katalog event.');
      })
      .finally(() => {
        setRefreshing(false);
      });
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('Semua');
    setSelectedCity('Semua');
    setSelectedSort('terdekat');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Katalog Event" subtitle="Eksplor tiket resmi on-sale" />

      {/* Top Filter Bar */}
      <View style={[styles.filterBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {/* Search Input */}
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Cari konser, festival, artis..."
          leftIcon={<Search size={16} color={brand.primary} />}
          rightElement={
            search ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ) : null
          }
          containerStyle={{ marginBottom: 12 }}
        />

        {/* Dropdown Filters Row */}
        <View style={styles.dropdownRow}>
          {/* City Dropdown Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setCityModalOpen(true)}
            style={[
              styles.filterPill,
              {
                backgroundColor: selectedCity !== 'Semua' ? (isDark ? 'rgba(0,128,242,0.2)' : 'rgba(0,128,242,0.08)') : colors.surfaceElevated,
                borderColor: selectedCity !== 'Semua' ? brand.primary : colors.border,
              },
            ]}
          >
            <MapPin size={13} color={selectedCity !== 'Semua' ? brand.primary : colors.textSecondary} />
            <Text
              style={[
                styles.filterPillText,
                { color: selectedCity !== 'Semua' ? brand.primary : colors.text },
              ]}
              numberOfLines={1}
            >
              {selectedCity === 'Semua' ? 'Semua Kota' : selectedCity}
            </Text>
            <ChevronDown size={13} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Sort Dropdown Trigger */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSortModalOpen(true)}
            style={[
              styles.filterPill,
              {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <ArrowUpDown size={13} color={colors.textSecondary} />
            <Text style={[styles.filterPillText, { color: colors.text }]} numberOfLines={1}>
              {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}
            </Text>
            <ChevronDown size={13} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Category Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.8}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: active ? brand.primary : colors.surfaceElevated,
                    borderColor: active ? brand.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryPillText,
                    { color: active ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results Header */}
      {error && (
        <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 12, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
          <Text style={{ color: '#EF4444', fontSize: 13 }}>{error}</Text>
        </View>
      )}
      <View style={styles.resultsInfoRow}>
        <Text style={[styles.resultsCount, { color: colors.textMuted }]}>
          Menampilkan <Text style={{ color: colors.text, fontWeight: '800' }}>{events.length}</Text> event aktif
        </Text>
        {(search || selectedCategory !== 'Semua' || selectedCity !== 'Semua') && (
          <TouchableOpacity onPress={handleResetFilters}>
            <Text style={[styles.resetText, { color: brand.primary }]}>Reset Filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Main List / Skeleton Loader */}
      {loading ? (
        <View style={styles.skeletonWrap}>
          <EventCardSkeleton />
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={brand.primary}
              colors={[brand.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Tidak Ada Event Ditemukan"
              description="Coba ubah kata kunci pencarian atau reset filter kota dan kategori."
              actionLabel="Reset Filter"
              onAction={handleResetFilters}
            />
          }
          renderItem={({ item }) => <EventCard event={item} />}
        />
      )}

      {/* City Picker Modal */}
      <Modal
        visible={cityModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCityModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setCityModalOpen(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Pilih Kota Penyelenggara</Text>
              <TouchableOpacity onPress={() => setCityModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 360 }}>
              {cities.map((city) => {
                const selected = selectedCity === city;
                return (
                  <TouchableOpacity
                    key={city}
                    onPress={() => {
                      setSelectedCity(city);
                      setCityModalOpen(false);
                    }}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: selected ? (isDark ? 'rgba(0,128,242,0.18)' : 'rgba(0,128,242,0.08)') : 'transparent',
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: selected ? brand.primary : colors.text, fontWeight: selected ? '800' : '500' },
                      ]}
                    >
                      {city === 'Semua' ? 'Semua Kota' : city}
                    </Text>
                    {selected && <Check size={16} color={brand.primary} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sort Picker Modal */}
      <Modal
        visible={sortModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSortModalOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setSortModalOpen(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Urutkan Event</Text>
              <TouchableOpacity onPress={() => setSortModalOpen(false)} style={styles.modalCloseBtn}>
                <X size={18} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View>
              {SORT_OPTIONS.map((opt) => {
                const selected = selectedSort === opt.id;
                return (
                  <TouchableOpacity
                    key={opt.id}
                    onPress={() => {
                      setSelectedSort(opt.id);
                      setSortModalOpen(false);
                    }}
                    style={[
                      styles.modalOption,
                      {
                        backgroundColor: selected ? (isDark ? 'rgba(0,128,242,0.18)' : 'rgba(0,128,242,0.08)') : 'transparent',
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        { color: selected ? brand.primary : colors.text, fontWeight: selected ? '800' : '500' },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {selected && <Check size={16} color={brand.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  dropdownRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  filterPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
    marginHorizontal: 6,
  },
  categoryScroll: {
    gap: 8,
    paddingTop: 2,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  resultsInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  resetText: {
    fontSize: 12,
    fontWeight: '800',
  },
  skeletonWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  modalOptionText: {
    fontSize: 14,
  },
});
