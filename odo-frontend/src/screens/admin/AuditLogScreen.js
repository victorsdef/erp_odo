import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import api from '../../services/api';
import { ENDPOINTS } from '../../constants/api';

const ACTION_META = {
  LOGIN:               { label: 'Login',        icon: 'log-in-outline',        colorKey: 'primary'    },
  LOGOUT:              { label: 'Logout',       icon: 'log-out-outline',       colorKey: 'textMuted'  },
  CREATE:              { label: 'Crear',        icon: 'add-circle-outline',    colorKey: 'secondary'  },
  UPDATE:              { label: 'Editar',       icon: 'pencil-outline',        colorKey: 'purple'     },
  DELETE:              { label: 'Eliminar',     icon: 'trash-outline',         colorKey: 'danger'     },
  PAYMENT_REGISTERED:  { label: 'Pago',         icon: 'cash-outline',          colorKey: 'secondary'  },
  STATUS_CHANGED:      { label: 'Estado',       icon: 'swap-horizontal-outline', colorKey: 'warning'  },
};

const ACTIONS = ['ALL', ...Object.keys(ACTION_META)];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
}

export default function AuditLogScreen() {
  const { colors, isDark } = useTheme();
  const [logs, setLogs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter]     = useState('ALL');
  const [page, setPage]         = useState(0);
  const [hasMore, setHasMore]   = useState(true);

  const fetchPage = useCallback(async (pageNum, actionFilter, replace) => {
    const params = { page: pageNum, size: 30 };
    if (actionFilter !== 'ALL') params.action = actionFilter;
    try {
      const res = await api.get(ENDPOINTS.AUDIT_LOGS, { params });
      const { content, last } = res;
      setLogs((prev) => replace ? content : [...prev, ...content]);
      setHasMore(!last);
      setPage(pageNum);
    } catch {
      // silently fail on pagination
    }
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    fetchPage(0, filter, true).finally(() => setLoading(false));
  }, [filter, fetchPage]);

  useFocusEffect(load);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPage(page + 1, filter, false);
    setLoadingMore(false);
  };

  const changeFilter = (f) => {
    setFilter(f);
    setPage(0);
    setHasMore(true);
  };

  const renderItem = ({ item }) => {
    const meta = ACTION_META[item.action] ?? ACTION_META.CREATE;
    const color = colors[meta.colorKey] ?? colors.primary;

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <View style={[styles.iconBox, { backgroundColor: color + '18' }]}>
          <Ionicons name={meta.icon} size={18} color={color} />
        </View>
        <View style={styles.info}>
          <View style={styles.topRow}>
            <Text style={[styles.userName, { color: colors.textPrimary }]} numberOfLines={1}>
              {item.userName}
            </Text>
            <View style={[styles.actionBadge, { backgroundColor: color + '18' }]}>
              <Text style={[styles.actionText, { color }]}>{meta.label}</Text>
            </View>
          </View>
          {item.description ? (
            <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <View style={styles.metaRow}>
            {item.userRole ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>{item.userRole}</Text>
            ) : null}
            {item.ipAddress ? (
              <Text style={[styles.meta, { color: colors.textMuted }]}>· {item.ipAddress}</Text>
            ) : null}
          </View>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Registro de Actividad</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Historial de acciones</Text>
        </View>
      </View>

      <View style={[styles.filterWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <FlatList
          horizontal
          data={ACTIONS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                { backgroundColor: colors.background, borderColor: colors.border },
                filter === f && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => changeFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[
                styles.chipText, { color: colors.textSecondary },
                filter === f && { color: '#fff' },
              ]}>
                {f === 'ALL' ? 'Todos' : (ACTION_META[f]?.label ?? f)}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator color={colors.primary} style={{ paddingVertical: 16 }} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin registros</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title:       { fontSize: 22, fontWeight: '700' },
  subtitle:    { fontSize: 12, marginTop: 2 },
  filterWrap:  { borderBottomWidth: 1 },
  filterRow:   { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingVertical: 12 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText:    { fontSize: 12, fontWeight: '600' },
  list:        { padding: 16, paddingBottom: 40 },
  card:        { flexDirection: 'row', gap: 12, borderRadius: 14, padding: 14, marginBottom: 8 },
  iconBox:     { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  info:        { flex: 1, gap: 3 },
  topRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  userName:    { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  actionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  actionText:  { fontSize: 10, fontWeight: '700' },
  description: { fontSize: 12 },
  metaRow:     { flexDirection: 'row', gap: 4 },
  meta:        { fontSize: 11 },
  date:        { fontSize: 11, marginTop: 2 },
  empty:       { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
});
