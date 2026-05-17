import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Modal,
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import Skeleton, { SkeletonRow } from '../../components/common/Skeleton';
import FormInput from '../../components/forms/FormInput';
import { getInvoices, getInvoicesByPatient, registerPayment, cancelInvoice } from '../../services/invoiceService';
import { useAuth } from '../../context/AuthContext';

const STATUS = {
  PENDING:   { label: 'Pendiente', colorKey: 'warning',   icon: 'time-outline' },
  PARTIAL:   { label: 'Parcial',   colorKey: 'purple',    icon: 'pie-chart-outline' },
  PAID:      { label: 'Pagada',    colorKey: 'secondary', icon: 'checkmark-circle-outline' },
  CANCELLED: { label: 'Anulada',   colorKey: 'danger',    icon: 'close-circle-outline' },
};

function InvoiceSkeleton() {
  const { colors } = useTheme();
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.card, { backgroundColor: colors.surface, marginBottom: 10 }]}>
          <SkeletonRow style={{ marginBottom: 10 }}>
            <Skeleton width={40} height={40} borderRadius={10} />
            <View style={{ flex: 1, gap: 6 }}>
              <Skeleton width="55%" height={13} />
              <Skeleton width="35%" height={11} />
            </View>
            <Skeleton width={70} height={24} borderRadius={12} />
          </SkeletonRow>
          <SkeletonRow style={{ justifyContent: 'space-between' }}>
            <Skeleton width="30%" height={11} />
            <Skeleton width="25%" height={18} borderRadius={6} />
          </SkeletonRow>
        </View>
      ))}
    </>
  );
}

export default function InvoiceListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const isPatient = user?.rol === 'PATIENT';
  const [invoices, setInvoices]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter]       = useState('ALL');

  // Payment modal state
  const [payModal, setPayModal]   = useState(false);
  const [selected, setSelected]   = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes]   = useState('');
  const [paying, setPaying]       = useState(false);

  // Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [detailInv, setDetailInv]     = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const data = isPatient && user?.pacienteId
        ? await getInvoicesByPatient(user.pacienteId)
        : await getInvoices();
      setInvoices(data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPatient, user?.pacienteId]);

  useFocusEffect(fetchInvoices);
  const onRefresh = () => { setRefreshing(true); fetchInvoices(); };

  const FILTERS = ['ALL', 'PENDING', 'PARTIAL', 'PAID', 'CANCELLED'];
  const filtered = filter === 'ALL' ? invoices : invoices.filter((inv) => inv.estado === filter);

  const openPayment = (inv) => {
    setSelected(inv);
    const balance = parseFloat(inv.saldo ?? 0);
    setPayAmount(String(balance.toFixed(2)));
    setPayNotes('');
    setPayModal(true);
  };

  const handlePay = async () => {
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0)
      return Alert.alert('Error', 'Ingresa un monto válido');
    setPaying(true);
    try {
      const updated = await registerPayment(selected.id, { monto: amount, notas: payNotes || null });
      setInvoices((prev) => prev.map((inv) => (inv.id === updated.id ? updated : inv)));
      setPayModal(false);
    } catch (e) {
      const msg = e?.message ?? 'No se pudo registrar el pago';
      Alert.alert('Error', msg);
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = (inv) => {
    Alert.alert(
      'Anular factura',
      '¿Anular esta factura? No se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Anular',
          style: 'destructive',
          onPress: () =>
            cancelInvoice(inv.id)
              .then(() => fetchInvoices())
              .catch(() => Alert.alert('Error', 'No se pudo anular la factura')),
        },
      ]
    );
  };

  const openDetail = (inv) => {
    setDetailInv(inv);
    setDetailModal(true);
  };

  const renderItem = ({ item }) => {
    const stat = STATUS[item.estado] ?? STATUS.PENDING;
    const color = colors[stat.colorKey] ?? colors.warning;
    const paid = parseFloat(item.pagado ?? 0);
    const total = parseFloat(item.total ?? 0);
    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
    const canPay = item.estado === 'PENDING' || item.estado === 'PARTIAL';

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
        onPress={() => openDetail(item)}
        activeOpacity={0.85}
      >
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
            <Ionicons name={stat.icon} size={20} color={color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.pacienteNombre}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(item.creadoEn).toLocaleDateString('es')}
              {item.numeroCuotas > 1 ? ` · ${item.numeroCuotas} cuotas` : ''}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[styles.badgeText, { color }]}>{stat.label}</Text>
          </View>
        </View>

        <View style={styles.cardBottom}>
          <View style={styles.progressWrap}>
            <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
            </View>
            <Text style={[styles.progressLabel, { color: colors.textMuted }]}>{pct}% pagado</Text>
          </View>
          <Text style={[styles.amount, { color: colors.textPrimary }]}>
            S/ {paid.toFixed(2)}
            <Text style={[styles.amountTotal, { color: colors.textMuted }]}> / {total.toFixed(2)}</Text>
          </Text>
        </View>

        {canPay && (
          <TouchableOpacity
            style={[styles.payBtn, { backgroundColor: colors.primary }]}
            onPress={() => openPayment(item)}
            activeOpacity={0.8}
          >
            <Ionicons name="cash-outline" size={14} color="#fff" />
            <Text style={styles.payBtnText}>Registrar pago</Text>
          </TouchableOpacity>
        )}

        {!isPatient && (item.estado === 'PENDING' || item.estado === 'PARTIAL') && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => handleCancel(item)}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelText, { color: colors.textMuted }]}>Anular</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.filterRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              styles.chip,
              { backgroundColor: colors.background, borderColor: colors.border },
              filter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
            ]}
            onPress={() => setFilter(f)}
            activeOpacity={0.75}
          >
            <Text style={[
              styles.chipText,
              { color: colors.textSecondary },
              filter === f && { color: '#fff' },
            ]}>
              {f === 'ALL' ? 'Todas' : STATUS[f]?.label ?? f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ padding: 16 }}><InvoiceSkeleton /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="receipt-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin facturas registradas</Text>
            </View>
          }
        />
      )}

      {!isPatient && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.lg(colors)]}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('InvoiceForm')}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Payment modal */}
      <Modal visible={payModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.overlay}>
            <View style={[styles.modal, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Registrar pago</Text>
                <TouchableOpacity onPress={() => setPayModal(false)}>
                  <Ionicons name="close" size={22} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              {selected && (
                <View style={[styles.balanceCard, { backgroundColor: colors.primaryLight }]}>
                  <Text style={[styles.balanceLabel, { color: colors.primary }]}>Saldo pendiente</Text>
                  <Text style={[styles.balanceAmount, { color: colors.primary }]}>
                    S/ {parseFloat(selected.saldo ?? 0).toFixed(2)}
                  </Text>
                  {selected.numeroCuotas > 1 && (
                    <Text style={[styles.installmentHint, { color: colors.primary }]}>
                      Cuota sugerida: S/ {parseFloat(selected.montoCuota ?? 0).toFixed(2)}
                    </Text>
                  )}
                </View>
              )}
              <FormInput
                label="Monto a pagar (S/)"
                value={payAmount}
                onChangeText={setPayAmount}
                placeholder="0.00"
                icon="cash-outline"
                keyboardType="decimal-pad"
              />
              <FormInput
                label="Notas (opcional)"
                value={payNotes}
                onChangeText={setPayNotes}
                placeholder="Ej. Pago en efectivo"
                icon="document-text-outline"
              />
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }, paying && { opacity: 0.6 }]}
                onPress={handlePay}
                disabled={paying}
                activeOpacity={0.85}
              >
                {paying
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>Confirmar pago</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Detail modal */}
      <Modal visible={detailModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Historial de pagos</Text>
              <TouchableOpacity onPress={() => setDetailModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            {detailInv?.pagos?.length === 0 ? (
              <Text style={[styles.noPayments, { color: colors.textMuted }]}>Sin pagos registrados</Text>
            ) : (
              detailInv?.pagos?.map((p, i) => (
                <View key={i} style={[styles.paymentRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.payIcon, { backgroundColor: colors.secondaryLight }]}>
                    <Ionicons name="cash-outline" size={14} color={colors.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.payAmount, { color: colors.textPrimary }]}>
                      S/ {parseFloat(p.monto).toFixed(2)}
                    </Text>
                    {p.notas ? <Text style={[styles.payNotes, { color: colors.textSecondary }]}>{p.notas}</Text> : null}
                    <Text style={[styles.payDate, { color: colors.textMuted }]}>
                      {new Date(p.pagadoEn).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  filterRow:     { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  chip:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:      { fontSize: 12, fontWeight: '600' },
  list:          { padding: 16, paddingBottom: 100 },
  card:          { borderRadius: 14, padding: 14, marginBottom: 10, gap: 12 },
  cardTop:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox:       { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  info:          { flex: 1 },
  patientName:   { fontSize: 14, fontWeight: '700' },
  date:          { fontSize: 12, marginTop: 2 },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  cardBottom:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  progressWrap:  { flex: 1, gap: 4 },
  progressBar:   { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 2 },
  progressLabel: { fontSize: 10 },
  amount:        { fontSize: 16, fontWeight: '800' },
  amountTotal:   { fontSize: 12, fontWeight: '400' },
  payBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10 },
  payBtnText:    { color: '#fff', fontWeight: '700', fontSize: 13 },
  cancelBtn:     { alignItems: 'center' },
  cancelText:    { fontSize: 12 },
  emptyBox:      { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:     { fontSize: 14 },
  fab:           { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  overlay:       { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modal:         { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 32, maxHeight: '80%' },
  modalHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:    { fontSize: 18, fontWeight: '700' },
  balanceCard:   { borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' },
  balanceLabel:  { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  balanceAmount: { fontSize: 28, fontWeight: '800' },
  installmentHint: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  saveBtn:       { borderRadius: 14, height: 52, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText:   { color: '#fff', fontSize: 15, fontWeight: '700' },
  noPayments:    { textAlign: 'center', padding: 24 },
  paymentRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  payIcon:       { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  payAmount:     { fontSize: 14, fontWeight: '700' },
  payNotes:      { fontSize: 12 },
  payDate:       { fontSize: 11 },
});
