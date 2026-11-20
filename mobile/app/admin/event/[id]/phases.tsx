import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
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

  // Modal Form (Create or Edit Phase)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<TicketPhase | null>(null);
  const [phaseName, setPhaseName] = useState<'early_bird' | 'presale' | 'normal'>('early_bird');
  const [startDate, setStartDate] = useState('2026-11-01');
  const [endDate, setEndDate] = useState('2026-11-10');
  const [discountPercent, setDiscountPercent] = useState('15');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const refreshPhases = useCallback(async () => {
    if (!id) return;
    try {
      const evRes = await fetchAdminEventDetail(id);
      const ev = evRes.data || null;
      setEvent(ev);

      const tts = ev?.ticket_types || [];
      const activeTtId = selectedTtId || tts[0]?.id || null;
      setSelectedTtId(activeTtId);

      if (activeTtId) {
        const phRes = await fetchTicketPhases(activeTtId);
        setPhases(phRes.data?.phases || []);
      } else {
        setPhases([]);
      }
    } catch {
      setPhases([]);
    }
  }, [id, selectedTtId]);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    fetchAdminEventDetail(id)
      .then(async (evRes) => {
        if (ignore) return;
        const ev = evRes.data || null;
        setEvent(ev);

        const tts = ev?.ticket_types || [];
        const activeTtId = selectedTtId || tts[0]?.id || null;
        setSelectedTtId(activeTtId);

        if (activeTtId) {
          const phRes = await fetchTicketPhases(activeTtId);
          if (!ignore) {
            setPhases(phRes.data?.phases || []);
          }
        } else {
          setPhases([]);
        }
      })
      .catch(() => {
        if (!ignore) {
          setPhases([]);
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
  }, [id, selectedTtId]);

  const openCreateModal = () => {
    setEditingPhase(null);
    setPhaseName('early_bird');
    setStartDate('2026-11-01');
    setEndDate('2026-11-10');
    setDiscountPercent('15');
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: TicketPhase) => {
    setEditingPhase(p);
    setPhaseName(p.phase_name);
    setStartDate(p.start_date);
    setEndDate(p.end_date);
    setDiscountPercent(String(p.discount_percent));
    setFormError(null);
    setModalOpen(true);
  };

  const handleSavePhase = async () => {
    if (!selectedTtId) return;
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        phase_name: phaseName,
        start_date: startDate.trim(),
        end_date: endDate.trim(),
        discount_percent: Number(discountPercent) || 0,
      };

      if (editingPhase) {
        await updateTicketPhase(editingPhase.id, payload);
      } else {
        await createTicketPhase(selectedTtId, payload);
      }
      setModalOpen(false);
      await refreshPhases();
    } catch (err: any) {
      setFormError(err?.message || 'Gagal menyimpan fase harga.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhase = (p: TicketPhase) => {
    Alert.alert('Hapus Fase', `Hapus fase "${p.phase_name}" (${p.start_date} - ${p.end_date})?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTicketPhase(p.id);
            await refreshPhases();
          } catch (err: any) {
            Alert.alert('Error', err?.message || 'Gagal menghapus fase.');
          }
        },
      },
    ]);
  };

  const ticketTypes: TicketType[] = event?.ticket_types || [];

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

        {loading ? (
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
