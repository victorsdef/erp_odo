import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, RefreshControl, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import AppointmentListSkeleton from '../../components/common/AppointmentCardSkeleton';
import { getAppointments, getAppointmentsByPatient } from '../../services/appointmentService';
import { useAuth } from '../../context/AuthContext';

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
  const { user } = useAuth();
  const isPatient = user?.rol === 'PATIENT';

  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);
  const initialized = useRef(false);

  const fetch = useCallback(async () => {
    if (!initialized.current) setLoading(true);
    else setRefreshing(true);
    try {
      const data = isPatient && user?.pacienteId
        ? await getAppointmentsByPatient(user.pacienteId)
        : await getAppointments();
      setAppointments(data);
    } catch {
      setAppointments([]);
    } finally {
      initialized.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPatient, user?.pacienteId]);

  useFocusEffect(useCallback(() => { fetch(); }, [fetch]));

  const renderItem = ({ item }) => {
    const dt    = new Date(item.fechaHora);
    const stat  = STATUS[item.estado] ?? STATUS.SCHEDULED;
    const icon  = STATUS_ICON[item.estado] ?? 'time-outline';
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
            {item.paciente?.nombre} {item.paciente?.apellido}
          </Text>
          <View style={styles.row}>
            <Ionicons name="time-outline" size={12} color={colors.textMuted} />
            <Text style={[styles.time, { color: colors.textMuted }]}>
              {dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              {item.duracionMinutos ? `  ·  ${item.duracionMinutos} min` : ''}
            </Text>
          </View>
          {item.motivo ? (
            <View style={styles.row}>
              <Ionicons name="document-text-outline" size={12} color={colors.textMuted} />
              <Text style={[styles.reason, { color: colors.textMuted }]} numberOfLines={1}>{item.motivo}</Text>
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
      {Platform.OS === 'web' && (
        <View style={[styles.webBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.webBarTitle, { color: colors.textMuted }]}>
            {appointments.length} cita{appointments.length !== 1 ? 's' : ''}
          </Text>
          <TouchableOpacity
            onPress={fetch}
            activeOpacity={0.7}
            style={[styles.refreshBtn, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="refresh-outline" size={17} color={colors.primary} />
            <Text style={[styles.refreshText, { color: colors.primary }]}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetch}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin citas registradas</Text>
            </View>
          }
        />
      )}

      {!isPatient && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.lg(colors)]}
          onPress={() => navigation.navigate('AppointmentForm')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  webBar:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1 },
  webBarTitle:  { fontSize: 13, fontWeight: '500' },
  refreshBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  refreshText:  { fontSize: 13, fontWeight: '600' },
  list:         { padding: 16, paddingBottom: 100 },
  card:         { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateCol:      { width: 40, alignItems: 'center', borderRadius: 10, paddingVertical: 8 },
  dateDay:      { fontSize: 18, fontWeight: '800' },
  dateMon:      { fontSize: 10, fontWeight: '600' },
  divider:      { width: 3, height: 44, borderRadius: 2 },
  info:         { flex: 1, gap: 4 },
  patientName:  { fontSize: 14, fontWeight: '700' },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 4 },
  time:         { fontSize: 12 },
  reason:       { fontSize: 12, flex: 1 },
  badge:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 20 },
  badgeText:    { fontSize: 10, fontWeight: '700' },
  emptyBox:     { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:    { fontSize: 14 },
  fab:          { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
