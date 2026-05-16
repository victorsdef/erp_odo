import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator, Modal,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import {
  getAllTreatments, createTreatment, updateTreatment,
  toggleTreatmentActive, deleteTreatment,
} from '../../services/treatmentService';

const EMPTY_FORM = { name: '', description: '', defaultPrice: '', durationMinutes: '' };

export default function TreatmentScreen() {
  const { colors, isDark } = useTheme();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getAllTreatments()
      .then(setTreatments)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los tratamientos'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description ?? '',
      defaultPrice: String(t.defaultPrice ?? ''),
      durationMinutes: String(t.durationMinutes ?? ''),
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return Alert.alert('Requerido', 'Ingresa el nombre del tratamiento');
    const price = parseFloat(form.defaultPrice);
    if (isNaN(price) || price <= 0) return Alert.alert('Requerido', 'Ingresa un precio válido');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        defaultPrice: price,
        durationMinutes: parseInt(form.durationMinutes) || null,
      };
      if (editing) {
        const updated = await updateTreatment(editing.id, payload);
        setTreatments((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      } else {
        const created = await createTreatment(payload);
        setTreatments((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      Alert.alert('Error', 'No se pudo guardar el tratamiento');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = (t) => {
    Alert.alert(
      t.active ? 'Desactivar tratamiento' : 'Activar tratamiento',
      `¿${t.active ? 'Desactivar' : 'Activar'} "${t.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: () =>
            toggleTreatmentActive(t.id)
              .then((updated) =>
                setTreatments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
              )
              .catch(() => Alert.alert('Error', 'No se pudo cambiar el estado')),
        },
      ]
    );
  };

  const handleDelete = (t) => {
    Alert.alert(
      'Eliminar tratamiento',
      `¿Eliminar "${t.name}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () =>
            deleteTreatment(t.id)
              .then(() => setTreatments((prev) => prev.filter((x) => x.id !== t.id)))
              .catch(() => Alert.alert('Error', 'No se pudo eliminar el tratamiento')),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Tratamientos</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {treatments.length} registrados
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={openCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.list}>
          {treatments.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="medical-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin tratamientos registrados</Text>
            </View>
          ) : (
            treatments.map((t) => (
              <View key={t.id} style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
                <View style={[styles.iconBox, { backgroundColor: t.active ? colors.primaryLight : colors.border + '30' }]}>
                  <Ionicons name="medical" size={20} color={t.active ? colors.primary : colors.textMuted} />
                </View>

                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                      {t.name}
                    </Text>
                    {!t.active && (
                      <View style={[styles.badge, { backgroundColor: colors.dangerLight }]}>
                        <Text style={[styles.badgeText, { color: colors.danger }]}>Inactivo</Text>
                      </View>
                    )}
                  </View>
                  {t.description ? (
                    <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={1}>
                      {t.description}
                    </Text>
                  ) : null}
                  <View style={styles.metaRow}>
                    <Text style={[styles.price, { color: colors.primary }]}>S/ {parseFloat(t.defaultPrice).toFixed(2)}</Text>
                    {t.durationMinutes ? (
                      <Text style={[styles.duration, { color: colors.textMuted }]}>· {t.durationMinutes} min</Text>
                    ) : null}
                  </View>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => openEdit(t)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={15} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: t.active ? colors.dangerLight : colors.secondaryLight }]}
                    onPress={() => handleToggle(t)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={t.active ? 'ban-outline' : 'checkmark-circle-outline'}
                      size={15}
                      color={t.active ? colors.danger : colors.secondary}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]}
                    onPress={() => handleDelete(t)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="trash-outline" size={15} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 32 }} />
        </ScrollView>
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={[styles.modal, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                  {editing ? 'Editar tratamiento' : 'Nuevo tratamiento'}
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <FormInput label="Nombre *" value={form.name} onChangeText={set('name')}
                  placeholder="Ej. Limpieza dental" icon="medical-outline" />
                <FormInput label="Descripción" value={form.description} onChangeText={set('description')}
                  placeholder="Descripción opcional..." icon="document-text-outline" />
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <FormInput label="Precio (S/) *" value={form.defaultPrice} onChangeText={set('defaultPrice')}
                      placeholder="0.00" icon="cash-outline" keyboardType="decimal-pad" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FormInput label="Duración (min)" value={form.durationMinutes} onChangeText={set('durationMinutes')}
                      placeholder="30" icon="time-outline" keyboardType="number-pad" />
                  </View>
                </View>
              </ScrollView>

              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
                activeOpacity={0.85}
              >
                {saving
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>{editing ? 'Guardar cambios' : 'Crear tratamiento'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title:       { fontSize: 22, fontWeight: '700' },
  subtitle:    { fontSize: 12, marginTop: 2 },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  list:        { padding: 20 },
  empty:       { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
  card:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginBottom: 10 },
  iconBox:     { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  info:        { flex: 1, gap: 3 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:        { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  badge:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  badgeText:   { fontSize: 10, fontWeight: '700' },
  desc:        { fontSize: 12 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  price:       { fontSize: 14, fontWeight: '700' },
  duration:    { fontSize: 12 },
  actions:     { gap: 8 },
  actionBtn:   { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  overlay:     { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modal:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:  { fontSize: 18, fontWeight: '700' },
  row:         { flexDirection: 'row', gap: 12 },
  saveBtn:     { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
