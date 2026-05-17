import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Alert, ActivityIndicator,
  Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import SectionTitle from '../../components/forms/SectionTitle';
import { getPatients } from '../../services/patientService';
import { createInvoice } from '../../services/invoiceService';
import { getActiveTreatments } from '../../services/treatmentService';

export default function InvoiceFormScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [patients, setPatients]     = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [form, setForm]             = useState({ patientId: null, patientName: '', items: [], installmentCount: '1' });
  const [showPatientPicker, setShowPatientPicker]     = useState(false);
  const [showTreatmentPicker, setShowTreatmentPicker] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [customLabel, setCustomLabel]   = useState('');
  const [saving, setSaving]             = useState(false);

  useEffect(() => {
    getPatients().then(setPatients).catch(() => {});
    getActiveTreatments()
      .then((data) => setTreatments(data.map((t) => ({ label: t.nombre, price: parseFloat(t.precioBase) }))))
      .catch(() => {});
  }, []);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const setInstallments = (val) => {
    const n = parseInt(val.replace(/[^0-9]/g, '')) || 1;
    setForm((f) => ({ ...f, installmentCount: String(Math.max(1, n)) }));
  };

  const addTreatment = (t) => {
    setForm((f) => ({ ...f, items: [...f.items, { ...t, qty: 1 }] }));
    setShowTreatmentPicker(false);
  };

  const addCustom = () => {
    const amount = parseFloat(customAmount);
    if (!customLabel.trim() || isNaN(amount) || amount <= 0)
      return Alert.alert('Error', 'Ingresa descripcion y monto valido');
    setForm((f) => ({ ...f, items: [...f.items, { label: customLabel, price: amount, qty: 1 }] }));
    setCustomLabel('');
    setCustomAmount('');
  };

  const removeItem = (i) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }));

  const changeQty = (i, delta) =>
    setForm((f) => ({
      ...f,
      items: f.items.map((it, idx) =>
        idx === i ? { ...it, qty: Math.max(1, it.qty + delta) } : it
      ),
    }));

  const subtotal = form.items.reduce((s, it) => s + it.price * it.qty, 0);
  const tax      = subtotal * 0.18;
  const total    = subtotal + tax;

  const handleSave = async () => {
    if (!form.patientId) return Alert.alert('Requerido', 'Selecciona un paciente');
    if (form.items.length === 0) return Alert.alert('Requerido', 'Agrega al menos un tratamiento');
    setSaving(true);
    try {
      await createInvoice({
        pacienteId: form.patientId,
        total: parseFloat(total.toFixed(2)),
        descripcion: form.items.map((it) => `${it.label} x${it.qty}`).join(', '),
        numeroCuotas: parseInt(form.installmentCount) || 1,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la factura');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <SectionTitle title="Paciente" />
        <FormInput
          label="Seleccionar paciente"
          value={form.patientName}
          placeholder="Buscar paciente..."
          icon="person-outline"
          rightIcon="chevron-down"
          editable={false}
          onPress={() => setShowPatientPicker(true)}
        />

        <SectionTitle title="Tratamientos" />

        {form.items.length === 0 ? (
          <View style={[styles.emptyItems, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="medical-outline" size={32} color={colors.border} />
            <Text style={[styles.emptyItemsText, { color: colors.textMuted }]}>Sin tratamientos agregados</Text>
          </View>
        ) : (
          form.items.map((item, i) => (
            <View key={i} style={[styles.itemRow, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                <Text style={[styles.itemPrice, { color: colors.textMuted }]}>S/ {item.price.toFixed(2)} c/u</Text>
              </View>
              <View style={styles.qtyRow}>
                <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.primaryLight }]} onPress={() => changeQty(i, -1)}>
                  <Ionicons name="remove" size={14} color={colors.primary} />
                </TouchableOpacity>
                <Text style={[styles.qtyText, { color: colors.textPrimary }]}>{item.qty}</Text>
                <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.primaryLight }]} onPress={() => changeQty(i, 1)}>
                  <Ionicons name="add" size={14} color={colors.primary} />
                </TouchableOpacity>
              </View>
              <Text style={[styles.itemTotal, { color: colors.primary }]}>S/ {(item.price * item.qty).toFixed(2)}</Text>
              <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
                <Ionicons name="trash-outline" size={16} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity
          style={[styles.addBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
          onPress={() => setShowTreatmentPicker(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.addBtnText, { color: colors.primary }]}>Agregar tratamiento</Text>
        </TouchableOpacity>

        <SectionTitle title="Item personalizado" />
        <View style={styles.customRow}>
          <View style={{ flex: 2 }}>
            <FormInput label="Descripcion" value={customLabel} onChangeText={setCustomLabel}
              placeholder="Concepto..." icon="create-outline" />
          </View>
          <View style={{ flex: 1 }}>
            <FormInput label="Monto" value={customAmount} onChangeText={setCustomAmount}
              placeholder="0.00" icon="cash-outline" keyboardType="decimal-pad" />
          </View>
        </View>
        <TouchableOpacity
          style={[styles.customAddBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
          onPress={addCustom}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={[styles.customAddText, { color: colors.primary }]}>Agregar item</Text>
        </TouchableOpacity>

        {form.items.length > 0 && (
          <>
            <SectionTitle title="Resumen" />
            <View style={[styles.summaryCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>S/ {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>IGV (18%)</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>S/ {tax.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryTotal, { borderTopColor: colors.border }]}>
                <Text style={[styles.summaryTotalLabel, { color: colors.textPrimary }]}>Total</Text>
                <Text style={[styles.summaryTotalValue, { color: colors.primary }]}>S/ {total.toFixed(2)}</Text>
              </View>
            </View>

            <SectionTitle title="Pago en cuotas" />
            <View style={[styles.cuotasCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
              <View style={styles.cuotasRow}>
                <View style={{ flex: 1 }}>
                  <FormInput
                    label="Numero de cuotas"
                    value={form.installmentCount}
                    onChangeText={setInstallments}
                    placeholder="1"
                    icon="layers-outline"
                    keyboardType="number-pad"
                  />
                </View>
                {parseInt(form.installmentCount) > 1 && (
                  <View style={[styles.cuotaHint, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.cuotaHintLabel, { color: colors.primary }]}>Por cuota</Text>
                    <Text style={[styles.cuotaHintValue, { color: colors.primary }]}>
                      S/ {(total / (parseInt(form.installmentCount) || 1)).toFixed(2)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.md(isDark)]}>
        <View style={styles.footerAmount}>
          <Text style={[styles.footerAmountLabel, { color: colors.textMuted }]}>Total a cobrar</Text>
          <Text style={[styles.footerAmountValue, { color: colors.textPrimary }]}>S/ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Ionicons name="receipt-outline" size={18} color="#fff" />
                <Text style={styles.saveBtnText}>Emitir factura</Text>
              </>
          }
        </TouchableOpacity>
      </View>

      {/* Patient picker */}
      <Modal visible={showPatientPicker} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }, SHADOWS.lg(colors)]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Seleccionar paciente</Text>
              <TouchableOpacity onPress={() => setShowPatientPicker(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={patients}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.pickerRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setForm((f) => ({ ...f, patientId: item.id, patientName: `${item.nombre} ${item.apellido}` }));
                    setShowPatientPicker(false);
                  }}
                >
                  <View style={[styles.pickerAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.pickerAvatarText, { color: colors.primary }]}>
                      {item.nombre?.[0]}{item.apellido?.[0]}
                    </Text>
                  </View>
                  <Text style={[styles.pickerName, { color: colors.textPrimary }]}>{item.nombre} {item.apellido}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin pacientes registrados</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* Treatment picker */}
      <Modal visible={showTreatmentPicker} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }, SHADOWS.lg(colors)]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Tratamientos</Text>
              <TouchableOpacity onPress={() => setShowTreatmentPicker(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={treatments}
              keyExtractor={(item) => item.label}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.treatmentRow, { borderBottomColor: colors.border }]}
                  onPress={() => addTreatment(item)}
                >
                  <View style={[styles.treatmentIcon, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="medical" size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.treatmentLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                  <Text style={[styles.treatmentPrice, { color: colors.primary }]}>S/ {item.price.toFixed(2)}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  scroll:           { padding: 20 },
  emptyItems:       { alignItems: 'center', paddingVertical: 24, gap: 8, borderRadius: 14, marginBottom: 12, borderWidth: 1.5, borderStyle: 'dashed' },
  emptyItemsText:   { fontSize: 13 },
  itemRow:          { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10 },
  itemInfo:         { flex: 1 },
  itemLabel:        { fontSize: 14, fontWeight: '600' },
  itemPrice:        { fontSize: 12, marginTop: 2 },
  qtyRow:           { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn:           { width: 26, height: 26, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  qtyText:          { fontSize: 14, fontWeight: '700', minWidth: 20, textAlign: 'center' },
  itemTotal:        { fontSize: 14, fontWeight: '700', minWidth: 70, textAlign: 'right' },
  removeBtn:        { padding: 4 },
  addBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 20 },
  addBtnText:       { fontWeight: '600', fontSize: 14 },
  customRow:        { flexDirection: 'row', gap: 12 },
  customAddBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  customAddText:    { fontWeight: '600', fontSize: 13 },
  cuotasCard:       { borderRadius: 14, padding: 16, marginBottom: 8 },
  cuotasRow:        { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  cuotaHint:        { borderRadius: 12, padding: 12, alignItems: 'center', marginBottom: 8, minWidth: 100 },
  cuotaHintLabel:   { fontSize: 11, fontWeight: '600' },
  cuotaHintValue:   { fontSize: 20, fontWeight: '800' },
  summaryCard:      { borderRadius: 14, padding: 16, gap: 12 },
  summaryRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel:     { fontSize: 14 },
  summaryValue:     { fontSize: 14, fontWeight: '600' },
  summaryTotal:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  summaryTotalLabel:{ fontSize: 16, fontWeight: '700' },
  summaryTotalValue:{ fontSize: 20, fontWeight: '800' },
  footer:           { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, borderTopWidth: 1, flexDirection: 'row', gap: 12, alignItems: 'center' },
  footerAmount:     { flex: 1 },
  footerAmountLabel:{ fontSize: 12 },
  footerAmountValue:{ fontSize: 22, fontWeight: '800' },
  saveBtn:          { borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  saveBtnText:      { color: '#fff', fontSize: 15, fontWeight: '700' },
  overlay:          { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modal:            { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '75%' },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:       { fontSize: 18, fontWeight: '700' },
  pickerRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  pickerAvatar:     { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  pickerAvatarText: { fontSize: 14, fontWeight: '700' },
  pickerName:       { flex: 1, fontSize: 15, fontWeight: '600' },
  treatmentRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  treatmentIcon:    { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  treatmentLabel:   { flex: 1, fontSize: 14, fontWeight: '600' },
  treatmentPrice:   { fontSize: 14, fontWeight: '700' },
  emptyText:        { textAlign: 'center', padding: 24 },
});
