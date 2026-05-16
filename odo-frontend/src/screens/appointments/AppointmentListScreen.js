import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import AppointmentListSkeleton from '../../components/common/AppointmentCardSkeleton';
import { getAppointments } from '../../services/appointmentService';

const STATUS = {
  SCHEDULED: { label: 'Agendada',   colorKey: 'warning' },
  CONFIRMED: { label: 'Confirmada', colorKey: 'secondary' },
  COMPLETED: { label: 'Completada', colorKey: 'primary' },
  CANCELLED: { label: 'Cancelada',  colorKey: 'danger' },
  NO_SHOW:   { label: 'No asistio', colorKey: 'textMuted' },
};

const STATUS_ICON = {
  SCHEDULED: 'time-outline',
  CONFIRMED: 'checkmark-circle-outline',
  COMPLETED: 'checkmark-done-outline',
  CANCELLED: 'close-circle-outline',
  NO_SHOW:   'ban-outline',
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

export default function AppointmentListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async () => {
    try { setAppointments(await getAppointments()); }
    catch { setAppointments([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetch(); }, []);
  const onRefresh = () => { setRefreshing(true); fetch(); };

  const renderItem = ({ item }) => {
    const dt   = new Date(item.dateTime);
    const stat = STATUS[item.status] ?? STATUS.SCHEDULED;
    const icon = STATUS_ICON[item.status] ?? 'time-outline';
    const color = colors[stat.colorKey] ?? colors.textMuted;
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
        activeOpacity={0.75}
        onPress={() => navigation.navigate('AppointmentForm', { id: item.id })}
      >
        <View style={[styles.dateCol, { backgroundColor: colors.primaryLight }]}>
          <Text style={[styles.dateDay, { color: colors.primary }]}>{dt.getDate()}</Text>
          <Text style={[styles.dateMon, { color: colors.primary }]}>{MONTHS[dt.getMonth()]}</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: color }]} />

        <View style={styles.info}>
          <Text style={[styles.patientName, { color: colors.textPrimary }]} numberOfLines={1}>
            {item.patient?.firstName} {item.patient?.lastName}
          </Text>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              {item.durationMinutes ? `  ·  ${item.durationMinutes} min` : ''}
            </Text>
          </View>
          {item.reason ? (
            <View style={styles.row}>
              <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.reason, { color: colors.textMuted }]} numberOfLines={1}>{item.reason}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.badge, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={12} color={color} />
          <Text style={[styles.badgeText, { color }]}>{stat.label}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {loading ? (
        <AppointmentListSkeleton count={6} />
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin citas registradas</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.lg(colors)]}
        onPress={() => navigation.navigate('AppointmentForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  list:        { padding: 16, paddingBottom: 100 },
  card:        { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateCol:     { width: 40, alignItems: 'center', borderRadius: 10, paddingVertical: 8 },
  dateDay:     { fontSize: 18, fontWeight: '800' },
  dateMon:     { fontSize: 10, fontWeight: '600' },
  divider:     { width: 3, height: 44, borderRadius: 2 },
  info:        { flex: 1, gap: 4 },
  patientName: { fontSize: 14, fontWeight: '700' },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time:        { fontSize: 12 },
  reason:      { fontSize: 12, flex: 1 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { fontSize: 10, fontWeight: '700' },
  emptyBox:    { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
  fab:         { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
