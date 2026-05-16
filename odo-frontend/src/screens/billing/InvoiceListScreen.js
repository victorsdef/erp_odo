import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import Skeleton, { SkeletonRow } from '../../components/common/Skeleton';

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
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const fetchInvoices = useCallback(async () => {
    try {
      setInvoices([]);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchInvoices(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchInvoices(); };

  const FILTERS = ['ALL', 'PENDING', 'PARTIAL', 'PAID', 'CANCELLED'];
  const filtered = filter === 'ALL' ? invoices : invoices.filter((inv) => inv.status === filter);

  const renderItem = ({ item }) => {
    const stat = STATUS[item.status] ?? STATUS.PENDING;
    const color = colors[stat.colorKey] ?? colors.warning;
    const paid = parseFloat(item.paid ?? 0);
    const total = parseFloat(item.total ?? 0);
    const pct = total > 0 ? Math.round((paid / total) * 100) : 0;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <View style={styles.cardTop}>
          <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
            <Ionicons name={stat.icon} size={20} color={color} />
          </View>
          <View style={styles.info}>
            <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.patient?.firstName} {item.patient?.lastName}
            </Text>
            <Text style={[styles.date, { color: colors.textMuted }]}>
              {new Date(item.createdAt).toLocaleDateString('es')}
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
      </View>
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

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.lg(colors)]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('InvoiceForm')}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
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
  emptyBox:      { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:     { fontSize: 14 },
  fab:           { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
