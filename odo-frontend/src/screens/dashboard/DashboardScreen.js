import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, Platform, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import DashboardSkeleton from '../../components/common/DashboardSkeleton';
import { getPatients } from '../../services/patientService';
import { getAppointments, getAppointmentsByPatient } from '../../services/appointmentService';
import { API_BASE_URL } from '../../constants/api';

const STATUS_COLOR_KEY = {
  SCHEDULED: 'warning',
  CONFIRMED: 'secondary',
  COMPLETED: 'primary',
  CANCELLED: 'danger',
  NO_SHOW:   'textMuted',
};

const STATUS_LABEL = {
  SCHEDULED:  'Agendada',
  CONFIRMED:  'Confirmada',
  COMPLETED:  'Completada',
  CANCELLED:  'Cancelada',
  NO_SHOW:    'No asistio',
};

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats,      setStats]      = useState({ patients: 0, today: 0, pending: 0, completed: 0 });
  const [upcoming,   setUpcoming]   = useState([]);
  const initialized = useRef(false);

  const isPatient = user?.rol === 'PATIENT';

  const STAT_CARDS = isPatient
    ? [
        { key: 'today',     label: 'Hoy',         icon: 'today',            color: colors.secondary, bg: colors.secondaryLight },
        { key: 'pending',   label: 'Pendientes',  icon: 'time',             color: colors.warning,   bg: colors.warningLight },
        { key: 'completed', label: 'Completadas', icon: 'checkmark-circle', color: colors.purple,    bg: colors.purpleLight },
      ]
    : [
        { key: 'patients',  label: 'Pacientes',   icon: 'people',           color: colors.primary,   bg: colors.primaryLight },
        { key: 'today',     label: 'Hoy',         icon: 'today',            color: colors.secondary, bg: colors.secondaryLight },
        { key: 'pending',   label: 'Pendientes',  icon: 'time',             color: colors.warning,   bg: colors.warningLight },
        { key: 'completed', label: 'Completadas', icon: 'checkmark-circle', color: colors.purple,    bg: colors.purpleLight },
      ];

  const loadData = useCallback(async () => {
    if (!initialized.current) setLoading(true);
    else setRefreshing(true);
    try {
      if (isPatient && user?.pacienteId) {
        const appointments = await getAppointmentsByPatient(user.pacienteId);
        const today = new Date().toDateString();
        setStats({
          today:     appointments.filter((a) => new Date(a.fechaHora).toDateString() === today).length,
          pending:   appointments.filter((a) => a.estado === 'SCHEDULED').length,
          completed: appointments.filter((a) => a.estado === 'COMPLETED').length,
        });
        setUpcoming(appointments.filter((a) => a.estado === 'SCHEDULED' || a.estado === 'CONFIRMED').slice(0, 5));
      } else {
        const [patients, appointments] = await Promise.all([getPatients(), getAppointments()]);
        const today = new Date().toDateString();
        setStats({
          patients:  patients.length,
          today:     appointments.filter((a) => new Date(a.fechaHora).toDateString() === today).length,
          pending:   appointments.filter((a) => a.estado === 'SCHEDULED').length,
          completed: appointments.filter((a) => a.estado === 'COMPLETED').length,
        });
        setUpcoming(appointments.slice(0, 5));
      }
    } catch {}
    finally {
      initialized.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [isPatient, user?.pacienteId]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  if (loading) return <DashboardSkeleton />;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadData} tintColor={colors.primary} />
      }
    >

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity activeOpacity={0.7} onPress={() => navigation.navigate('Profile')} style={styles.headerLeft}>
          {user?.fotoPerfil ? (
            <Image
              source={{ uri: `${API_BASE_URL}/profile/photo/${user.fotoPerfil}` }}
              style={styles.headerAvatar}
            />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarFallback, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.headerAvatarText, { color: colors.primary }]}>
                {user?.nombre?.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </Text>
            </View>
          )}
          <Text style={[styles.greeting, { color: colors.textPrimary }]} numberOfLines={1}>
            {user?.nombre?.split(' ')[0]}
          </Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {Platform.OS === 'web' && (
            <TouchableOpacity
              style={[styles.themeBtn, { backgroundColor: colors.primaryLight }]}
              onPress={loadData}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: colors.primaryLight }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.dangerLight }]}
            onPress={logout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stat cards */}
      <View style={styles.grid}>
        {STAT_CARDS.map(({ key, label, icon, color, bg }) => (
          <View key={key} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
            <View style={[styles.statIcon, { backgroundColor: bg }]}>
              <Ionicons name={icon} size={20} color={color} />
            </View>
            <Text style={[styles.statValue, { color }]}>{stats[key]}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
          </View>
        ))}
      </View>

      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Proximas citas</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Appointments')} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text>
        </TouchableOpacity>
      </View>

      {upcoming.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="calendar-outline" size={40} color={colors.border} />
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sin citas registradas</Text>
        </View>
      ) : (
        upcoming.map((appt) => {
          const statusColor = colors[STATUS_COLOR_KEY[appt.estado]] ?? colors.textMuted;
          return (
            <View key={appt.id} style={[styles.apptRow, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
              <View style={[styles.dateBox, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.dateDay, { color: colors.primary }]}>{new Date(appt.fechaHora).getDate()}</Text>
                <Text style={[styles.dateMon, { color: colors.primary }]}>
                  {new Date(appt.fechaHora).toLocaleString('es', { month: 'short' }).toUpperCase()}
                </Text>
              </View>
              <View style={styles.apptInfo}>
                <Text style={[styles.apptName, { color: colors.textPrimary }]} numberOfLines={1}>
                  {appt.paciente?.nombre} {appt.paciente?.apellido}
                </Text>
                <View style={styles.apptMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.textMuted} />
                  <Text style={[styles.apptTime, { color: colors.textMuted }]}>
                    {new Date(appt.fechaHora).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                <Text style={[styles.badgeText, { color: statusColor }]}>
                  {STATUS_LABEL[appt.status]}
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1 },
  header:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  headerLeft:          { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  headerAvatar:        { width: 44, height: 44, borderRadius: 22 },
  headerAvatarFallback:{ justifyContent: 'center', alignItems: 'center' },
  headerAvatarText:    { fontSize: 16, fontWeight: '800' },
  greeting:            { fontSize: 18, fontWeight: '700' },
  role:                { fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  headerActions:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  themeBtn:     { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoutBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  logoutText:   { fontWeight: '600', fontSize: 13 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 20 },
  statCard:     { flex: 1, minWidth: '44%', borderRadius: 16, padding: 16, alignItems: 'flex-start' },
  statIcon:     { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statValue:    { fontSize: 28, fontWeight: '800', lineHeight: 32 },
  statLabel:    { fontSize: 12, marginTop: 4, fontWeight: '500' },
  sectionHeader:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  seeAll:       { fontSize: 13, fontWeight: '600' },
  apptRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 10 },
  dateBox:      { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dateDay:      { fontSize: 17, fontWeight: '800' },
  dateMon:      { fontSize: 9, fontWeight: '600' },
  apptInfo:     { flex: 1 },
  apptName:     { fontSize: 14, fontWeight: '600' },
  apptMeta:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  apptTime:     { fontSize: 12 },
  badge:        { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  emptyBox:     { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:    { fontSize: 14 },
});
