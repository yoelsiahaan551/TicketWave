import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Calendar, Pencil, Plus, Tag, Trash2, X } from 'lucide-react-native';

import { useAppTheme } from '@/src/context/ThemeContext';
import {
  createTicketPhase,
  deleteTicketPhase,
  fetchAdminEventDetail,
  fetchTicketPhaseDetail,
  fetchTicketPhases,
  updateTicketPhase,
} from '@/src/api/endpoints';
import { EventItem, TicketPhase, TicketType } from '@/src/types';
import { formatRupiah } from '@/src/utils/formatters';
import { Header } from '@/src/components/common/Header';
import { Input } from '@/src/components/common/Input';
import { Button } from '@/src/components/common/Button';
import { Skeleton } from '@/src/components/common/Skeleton';
import { Typography } from '@/src/constants/Typography';

const PHASE_NAMES: ('early_bird' | 'presale' | 'normal')[] = [
  'early_bird',
  'presale',
  'normal',
];

export default function AdminTicketPhasesScreen() {
  const { id, ticketTypeId } = useLocalSearchParams<{ id: string; ticketTypeId?: string }>();
  const { colors, brand } = useAppTheme();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [selectedTtId, setSelectedTtId] = useState<number | null>(
    ticketTypeId ? Number(ticketTypeId) : null
  );
  const [phases, setPhases] = useState<TicketPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [phasesLoading, setPhasesLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Modal Form (Create or Edit Phase)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TicketPhase | null>(null);
  const [phaseName, setPhaseName] = useState<'early_bird' | 'presale' | 'normal'>('early_bird');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-10');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadPhasesForTicketType = useCallback(async (ttId: number | null) => {
    if (!ttId) {
      setPhases([]);
      return;
    }
    setPhasesLoading(true);
    try {
      const phRes = await fetchTicketPhases(ttId);
      setPhases(phRes.data?.phases || []);
      setPageError(null);
    } catch (err: any) {
      setPhases([]);
      setPageError(err?.message || 'Gagal memuat daftar fase tiket.');
    } finally {
      setPhasesLoading(false);
    }
  }, []);

  // Load event metadata once per event id
  useEffect(() => {
    if (!id) return;
    let ignore = false;

    fetchAdminEventDetail(id)
      .then((evRes) => {
        if (ignore) return;
        const ev = evRes.data || null;
        setEvent(ev);
        const tts = ev?.ticket_types || [];
        setSelectedTtId((prev) => {
          if (prev && tts.some((t) => t.id === prev)) return prev;
          const fromParam = ticketTypeId ? Number(ticketTypeId) : null;
          if (fromParam && tts.some((t) => t.id === fromParam)) return fromParam;
          return tts[0]?.id || null;
        });
      })
      .catch((err: any) => {
        if (!ignore) {
          setPageError(err?.message || 'Gagal memuat detail event.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id, ticketTypeId]);

  // Fetch phases only when selectedTtId changes
  useEffect(() => {
    if (!selectedTtId) return;
    let ignore = false;

    fetchTicketPhases(selectedTtId)
      .then((phRes) => {
        if (!ignore) {
          setPhases(phRes.data?.phases || []);
          setPageError(null);
        }
      })
      .catch((err: any) => {
        if (!ignore) {
          setPhases([]);
          setPageError(err?.message || 'Gagal memuat daftar fase tiket.');
        }
      })
      .finally(() => {
        if (!ignore) {
          setPhasesLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedTtId]);

  const openCreateModal = () => {
    setEditingPhase(null);
    setPhaseName('early_bird');
    setStartDate('2026-11-25');
    setEndDate('2026-12-05');
    setDiscountPercent('15');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = async (p: TicketPhase) => {
    setEditingPhase(p);
    setPhaseName(p.phase_name);
    setStartDate(p.start_date);
    setEndDate(p.end_date);
    setDiscountPercent(String(p.discount_percent));
    setFormError(null);
    setModalOpen(true);

    // Hydrate latest phase details from GET /api/phases/<id>
    try {
      const detailRes = await fetchTicketPhaseDetail(p.id);
      if (detailRes.success && detailRes.data) {
        const fresh = detailRes.data;
        setEditingPhase(fresh);
        setPhaseName(fresh.phase_name);
        setStartDate(fresh.start_date);
        setEndDate(fresh.end_date);
        setDiscountPercent(String(fresh.discount_percent));
      }
    } catch {
      // keep existing phase values on fallback
    }
  };

  const handleSavePhase = async () => {
    if (!selectedTtId) return;
    setFormError(null);

    const sDate = startDate.trim();
    const eDate = endDate.trim();
    const disc = Number(discountPercent);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sDate) || !/^\d{4}-\d{2}-\d{2}$/.test(eDate)) {
      setFormError('Tanggal mulai dan berakhir harus berformat YYYY-MM-DD.');
      return;
    }
    if (sDate >= eDate) {
      setFormError('Tanggal berakhir harus setelah tanggal mulai.');
      return;
    }
    if (!Number.isFinite(disc) || disc < 0 || disc > 100) {
      setFormError('Persentase diskon harus antara 0 hingga 100.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        phase_name: phaseName,
        start_date: sDate,
        end_date: eDate,
        discount_percent: disc,
      };

      if (editingPhase) {
        await updateTicketPhase(editingPhase.id, payload);
      } else {
        await createTicketPhase(selectedTtId, payload);
      }
      setModalOpen(false);
      await loadPhasesForTicketType(selectedTtId);
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan fase harga.');
    } finally {
      setSaving(false);
    }
  };

  const performDeletePhase = async (p: TicketPhase) => {
    try {
      await deleteTicketPhase(p.id);
      await loadPhasesForTicketType(selectedTtId);
    } catch (err: any) {
      const msg = err?.message || 'Gagal menghapus fase.';
      setPageError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Error', msg);
      }
    }
  };

  const handleDeletePhase = (p: TicketPhase) => {
    if (Platform.OS === 'web') {
      if (
        typeof window !== 'undefined' &&
        !window.confirm(`Hapus fase "${p.phase_name}" (${p.start_date} - ${p.end_date})?`)
      ) {
        return;
      }
      performDeletePhase(p);
      return;
    }

    Alert.alert('Hapus Fase', `Hapus fase "${p.phase_name}" (${p.start_date} - ${p.end_date})?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () => performDeletePhase(p),
      },
    ]);
  };

  const ticketTypes: TicketType[] = event?.ticket_types || [];
  const selectedTt = ticketTypes.find((t) => t.id === selectedTtId) || null;
  const previewDiscount = Number(discountPercent);
  const previewFinalPrice =
    selectedTt && Number.isFinite(previewDiscount) && previewDiscount >= 0 && previewDiscount <= 100
      ? Math.round(Number(selectedTt.base_price || 0) * (1 - previewDiscount / 100))
      : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        showBack
        title="Fase Harga Tiket"
        subtitle={event?.name || `Event #${id}`}
        rightAction={
          selectedTtId ? (
            <TouchableOpacity
              onPress={openCreateModal}
              style={[styles.addBtn, { backgroundColor: brand.primary }]}
            >
              <Plus size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : undefined
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Ticket Type Tabs */}
        <Text style={[Typography.caption, styles.label, { color: colors.textSecondary }]}>
          Pilih Kategori Tiket
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.ttScroll}>
          {ticketTypes.map((tt) => {
            const active = selectedTtId === tt.id;
            return (
              <TouchableOpacity
                key={tt.id}
                onPress={() => setSelectedTtId(tt.id)}
                style={[
                  styles.ttChip,
                  {
                    backgroundColor: active ? brand.primary : colors.surface,
                    borderColor: active ? brand.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    Typography.caption,
                    { color: active ? '#FFFFFF' : colors.text, fontWeight: '700' },
                  ]}
                >
                  {tt.name} ({formatRupiah(tt.base_price)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {pageError && (
          <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
            <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>
              {pageError}
            </Text>
          </View>
        )}

        {loading || phasesLoading ? (
          <View style={{ gap: 12, marginTop: 14 }}>
            {[1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.phaseCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Skeleton width="60%" height={18} />
                <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
              </View>
            ))}
          </View>
        ) : phases.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[Typography.body, styles.emptyText, { color: colors.textSecondary }]}>
              Belum ada fase harga untuk kategori tiket ini.
            </Text>
            <Button
              title="Tambah Fase Pertama"
              onPress={openCreateModal}
              size="sm"
              variant="gradient"
              style={{ marginTop: 14 }}
            />
          </View>
        ) : (
          phases.map((p) => (
            <View
              key={p.id}
              style={[styles.phaseCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.phaseTop}>
                <View style={styles.phaseNameRow}>
                  <Tag size={15} color={brand.primary} />
                  <Text style={[Typography.h3, styles.phaseTitle, { color: colors.text }]}>
                    {p.phase_name.toUpperCase()}
                  </Text>
                </View>
                <View style={[styles.discountBadge, { backgroundColor: brand.successSoft }]}>
                  <Text style={[Typography.caption, styles.discountText, { color: brand.success }]}>
                    Diskon {p.discount_percent}%
                  </Text>
                </View>
              </View>

              <View style={styles.dateRow}>
                <Calendar size={14} color={colors.textMuted} />
                <Text style={[Typography.caption, styles.dateText, { color: colors.textSecondary }]}>
                  {p.start_date} s/d {p.end_date}
                </Text>
              </View>
              {selectedTt && (
                <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700', marginBottom: 10 }]}>
                  Estimasi Harga Fase:{' '}
                  {formatRupiah(
                    Math.round(Number(selectedTt.base_price || 0) * (1 - Number(p.discount_percent || 0) / 100))
                  )}
                </Text>
              )}

              <View style={[styles.actionRow, { borderTopColor: colors.border }]}>
                <TouchableOpacity onPress={() => openEditModal(p)} style={styles.actionBtn}>
                  <Pencil size={14} color={brand.primary} />
                  <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700' }]}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeletePhase(p)} style={styles.actionBtn}>
                  <Trash2 size={14} color={brand.danger} />
                  <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>Hapus</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal Create/Edit Phase */}
      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[Typography.h3, styles.modalTitle, { color: colors.text }]}>
                {editingPhase ? 'Edit Fase Harga' : 'Tambah Fase Baru'}
              </Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <X size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {formError && (
              <View style={[styles.errorBox, { backgroundColor: brand.dangerSoft, borderColor: brand.danger }]}>
                <Text style={[Typography.caption, { color: brand.danger, fontWeight: '700' }]}>{formError}</Text>
              </View>
            )}

            <Text style={[Typography.caption, styles.label, { color: colors.textSecondary }]}>Nama Fase</Text>
            <View style={styles.phaseNameChoiceRow}>
              {PHASE_NAMES.map((name) => {
                const active = phaseName === name;
                return (
                  <TouchableOpacity
                    key={name}
                    onPress={() => setPhaseName(name)}
                    style={[
                      styles.choiceChip,
                      {
                        backgroundColor: active ? brand.primary : colors.surfaceElevated,
                        borderColor: active ? brand.primary : colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        Typography.caption,
                        { color: active ? '#FFFFFF' : colors.text, fontWeight: '700' },
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Input
              label="Tanggal Mulai (YYYY-MM-DD)"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="2026-11-01"
            />
            <Input
              label="Tanggal Berakhir (YYYY-MM-DD)"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="2026-11-10"
            />
            <Input
              label="Persentase Diskon (%)"
              value={discountPercent}
              onChangeText={setDiscountPercent}
              keyboardType="number-pad"
              placeholder="15"
            />

            {previewFinalPrice !== null && (
              <Text style={[Typography.caption, { color: brand.primary, fontWeight: '700', marginTop: 4 }]}>
                Estimasi Harga Setelah Diskon: {formatRupiah(previewFinalPrice)}
              </Text>
            )}

            <Button
              title={saving ? 'Menyimpan...' : 'Simpan Fase'}
              onPress={handleSavePhase}
              loading={saving}
              variant="gradient"
              size="lg"
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontWeight: '700',
    marginBottom: 8,
  },
  ttScroll: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ttChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 8,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
  },
  phaseCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  phaseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  phaseNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  phaseTitle: {
    fontSize: 15,
  },
  discountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  discountText: {
    fontWeight: '800',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    flex: 1,
  },
  errorBox: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  phaseNameChoiceRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  choiceChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
});
