import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import { getPatientById } from '../../services/patientService';
import { getAppointmentsByPatient } from '../../services/appointmentService';
import { getInvoicesByPatient } from '../../services/invoiceService';

const AVATAR_PALETTE = ['#2563EB', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];
function avatarColor(name) {
  return AVATAR_PALETTE[(name || '').charCodeAt(0) % AVATAR_PALETTE.length];
}

const APPT_STATUS = {
  SCHEDULED: { label: 'Agendada',   colorKey: 'warning' },
  CONFIRMED: { label: 'Confirmada', colorKey: 'secondary' },
  COMPLETED: { label: 'Completada', colorKey: 'primary' },
  CANCELLED: { label: 'Cancelada',  colorKey: 'danger' },
  NO_SHOW:   { label: 'No asistio', colorKey: 'textMuted' },
};

const INV_STATUS = {
  PENDING:   { label: 'Pendiente', colorKey: 'warning' },
  PARTIAL:   { label: 'Parcial',   colorKey: 'purple' },
  PAID:      { label: 'Pagado',    colorKey: 'secondary' },
  CANCELLED: { label: 'Cancelado', colorKey: 'danger' },
};

const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const TABS = [
  { key: 'resumen', label: 'Resumen',  icon: 'person-outline' },
  { key: 'citas',   label: 'Citas',    icon: 'calendar-outline' },
  { key: 'pagos',   label: 'Pagos',    icon: 'receipt-outline' },
];

const CITA_FILTERS = [
  { key: 'TODAS',     label: 'Todas' },
  { key: 'SCHEDULED', label: 'Agendadas' },
  { key: 'CONFIRMED', label: 'Confirmadas' },
  { key: 'COMPLETED', label: 'Completadas' },
  { key: 'CANCELLED', label: 'Canceladas' },
];

function InfoRow({ icon, label, value, colors }) {
  if (!value) return null;
  return (
    <View style={rowStyles.row}>
      <View style={[rowStyles.iconWrap, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[rowStyles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[rowStyles.value, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  iconWrap:{ width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  label:   { fontSize: 11, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  value:   { fontSize: 14, fontWeight: '600' },
});

export default function PatientDetailScreen({ route, navigation }) {
  const { id } = route.params ?? {};
  const { colors, isDark } = useTheme();

  const [patient, setPatient]       = useState(null);
  const [appointments, setAppts]    = useState([]);
  const [invoices, setInvoices]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState('resumen');
  const [citaFilter, setCitaFilter] = useState('TODAS');

  const load = useCallback(async () => {
    try {
      const [p, appts, invs] = await Promise.all([
        getPatientById(id),
        getAppointmentsByPatient(id),
        getInvoicesByPatient(id),
      ]);
      setPatient(p);
      setAppts(appts);
      setInvoices(invs);
    } catch {
      Alert.alert('Error', 'No se pudo cargar el paciente');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { load(); }, []);
  const onRefresh = () => { setRefreshing(true); load(); };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="person-circle-outline" size={48} color={colors.border} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Cargando...</Text>
      </View>
    );
  }

  if (!patient) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.danger} />
        <Text style={[styles.loadingText, { color: colors.textMuted }]}>Paciente no encontrado</Text>
      </View>
    );
  }

  const initials = `${patient.nombre?.[0] ?? ''}${patient.apellido?.[0] ?? ''}`.toUpperCase();
  const acColor  = avatarColor(patient.nombre);
  const age      = patient.fechaNacimiento
    ? Math.floor((Date.now() - new Date(patient.fechaNacimiento)) / (365.25 * 24 * 3600 * 1000))
    : null;

  const completed   = appointments.filter((a) => a.estado === 'COMPLETED').length;
  const pending     = appointments.filter((a) => a.estado === 'SCHEDULED' || a.estado === 'CONFIRMED').length;
  const totalPagado = invoices.reduce((s, i) => s + parseFloat(i.pagado ?? 0), 0);
  const totalSaldo  = invoices.reduce((s, i) => s + parseFloat(i.saldo ?? 0), 0);

  const filteredAppts = citaFilter === 'TODAS'
    ? appointments
    : appointments.filter((a) => a.estado === citaFilter);

  const goToCitas = (filter = 'TODAS') => {
    setActiveTab('citas');
    setCitaFilter(filter);
  };

  /* ── STAT CARDS ──────────────────────────────────────── */
  const STATS = [
    {
      label: 'Total citas', value: appointments.length,
      icon: 'calendar', color: colors.primary, bg: colors.primaryLight,
      onPress: () => goToCitas('TODAS'),
    },
    {
      label: 'Completadas', value: completed,
      icon: 'checkmark-done', color: colors.secondary, bg: colors.secondaryLight,
      onPress: () => goToCitas('COMPLETED'),
    },
    {
      label: 'Pendientes', value: pending,
      icon: 'time', color: colors.warning, bg: colors.warningLight,
      onPress: () => goToCitas('SCHEDULED'),
    },
    {
      label: 'Saldo', value: `S/ ${totalSaldo.toFixed(2)}`,
      icon: 'wallet-outline', color: totalSaldo > 0 ? colors.danger : colors.secondary,
      bg: totalSaldo > 0 ? colors.dangerLight : colors.secondaryLight,
      onPress: () => setActiveTab('pagos'),
    },
  ];

  /* ── RENDERS ─────────────────────────────────────────── */
  const renderResumen = () => (
    <>
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Informacion de contacto</Text>
        <InfoRow icon="call-outline"     label="Telefono"         value={patient.telefono}  colors={colors} />
        <InfoRow icon="mail-outline"     label="Email"            value={patient.email}     colors={colors} />
        <InfoRow icon="location-outline" label="Direccion"        value={patient.direccion} colors={colors} />
        <InfoRow icon="calendar-outline" label="Fecha nacimiento" value={
          patient.fechaNacimiento
            ? new Date(patient.fechaNacimiento).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
            : null
        } colors={colors} />
      </View>
      {patient.notas ? (
        <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Notas clinicas</Text>
          <Text style={[styles.notes, { color: colors.textSecondary }]}>{patient.notas}</Text>
        </View>
      ) : null}
      {/* Preview latest 3 appts */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ultimas citas</Text>
          {appointments.length > 0 && (
            <TouchableOpacity onPress={() => goToCitas('TODAS')} activeOpacity={0.7}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>Ver todas</Text>
            </TouchableOpacity>
          )}
        </View>
        {appointments.length === 0 ? (
          <EmptyBox icon="calendar-outline" text="Sin citas registradas" colors={colors} />
        ) : (
          [...appointments]
            .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
            .slice(0, 3)
            .map((a) => <ApptRow key={a.id} appt={a} colors={colors} />)
        )}
      </View>
    </>
  );

  const renderCitas = () => (
    <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {CITA_FILTERS.map((f) => {
            const active = citaFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[
                  styles.filterChip,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  active && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                ]}
                onPress={() => setCitaFilter(f.key)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: colors.textSecondary },
                  active && { color: colors.primary, fontWeight: '700' },
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <Text style={[styles.countLabel, { color: colors.textMuted }]}>
        {filteredAppts.length} {filteredAppts.length === 1 ? 'cita' : 'citas'}
      </Text>

      {filteredAppts.length === 0 ? (
        <EmptyBox icon="calendar-outline" text="Sin citas en esta categoria" colors={colors} />
      ) : (
        [...filteredAppts]
          .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
          .map((a) => <ApptRow key={a.id} appt={a} colors={colors} />)
      )}
    </View>
  );

  const renderPagos = () => (
    <>
      {/* Pagos summary row */}
      <View style={[styles.payRow, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <View style={styles.payCell}>
          <Text style={[styles.payCellValue, { color: colors.secondary }]}>S/ {totalPagado.toFixed(2)}</Text>
          <Text style={[styles.payCellLabel, { color: colors.textMuted }]}>Pagado</Text>
        </View>
        <View style={[styles.payDivider, { backgroundColor: colors.border }]} />
        <View style={styles.payCell}>
          <Text style={[styles.payCellValue, { color: totalSaldo > 0 ? colors.danger : colors.secondary }]}>
            S/ {totalSaldo.toFixed(2)}
          </Text>
          <Text style={[styles.payCellLabel, { color: colors.textMuted }]}>Saldo pendiente</Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Historial de cobros</Text>
        {invoices.length === 0 ? (
          <EmptyBox icon="receipt-outline" text="Sin cobros registrados" colors={colors} />
        ) : (
          [...invoices]
            .sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn))
            .map((inv) => <InvoiceRow key={inv.id} inv={inv} colors={colors} isDark={isDark} />)
        )}
      </View>
    </>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: acColor + '22', borderColor: acColor + '44' }]}>
          <Text style={[styles.avatarText, { color: acColor }]}>{initials}</Text>
        </View>
        <Text style={[styles.heroName, { color: colors.textPrimary }]}>
          {patient.nombre} {patient.apellido}
        </Text>
        {patient.dni ? (
          <Text style={[styles.heroDni, { color: colors.textMuted }]}>CI: {patient.dni}</Text>
        ) : null}
        <View style={styles.heroBadges}>
          {age !== null && (
            <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="calendar-outline" size={12} color={colors.primary} />
              <Text style={[styles.badgeText, { color: colors.primary }]}>{age} años</Text>
            </View>
          )}
          <View style={[styles.badge, {
            backgroundColor: patient.activo ? colors.secondaryLight : colors.dangerLight,
          }]}>
            <Ionicons
              name={patient.activo ? 'checkmark-circle-outline' : 'close-circle-outline'}
              size={12}
              color={patient.activo ? colors.secondary : colors.danger}
            />
            <Text style={[styles.badgeText, { color: patient.activo ? colors.secondary : colors.danger }]}>
              {patient.activo ? 'Activo' : 'Inactivo'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.editBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('PatientForm', { id: patient.id })}
          activeOpacity={0.85}
        >
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.editBtnText}>Editar paciente</Text>
        </TouchableOpacity>
      </View>

      {/* Stat cards — tappable */}
      <View style={styles.statsRow}>
        {STATS.map((s) => (
          <TouchableOpacity
            key={s.label}
            style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
            onPress={s.onPress}
            activeOpacity={0.75}
          >
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon} size={18} color={s.color} />
            </View>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tab, active && { borderBottomColor: colors.primary }]}
              onPress={() => setActiveTab(t.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={t.icon}
                size={16}
                color={active ? colors.primary : colors.textMuted}
              />
              <Text style={[
                styles.tabText,
                { color: active ? colors.primary : colors.textMuted },
                active && { fontWeight: '700' },
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Tab content */}
      <View style={styles.tabContent}>
        {activeTab === 'resumen' && renderResumen()}
        {activeTab === 'citas'   && renderCitas()}
        {activeTab === 'pagos'   && renderPagos()}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

/* ── Sub-components ────────────────────────────────────── */

function ApptRow({ appt, colors }) {
  const dt    = new Date(appt.fechaHora);
  const stat  = APPT_STATUS[appt.estado] ?? APPT_STATUS.SCHEDULED;
  const color = colors[stat.colorKey] ?? colors.textMuted;
  return (
    <View style={[apptStyles.row, { borderBottomColor: colors.border }]}>
      <View style={[apptStyles.dateBox, { backgroundColor: colors.primaryLight }]}>
        <Text style={[apptStyles.dateDay, { color: colors.primary }]}>{dt.getDate()}</Text>
        <Text style={[apptStyles.dateMon, { color: colors.primary }]}>{MONTHS[dt.getMonth()]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[apptStyles.time, { color: colors.textPrimary }]}>
          {dt.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          {appt.duracionMinutos ? `  ·  ${appt.duracionMinutos} min` : ''}
        </Text>
        {appt.motivo ? (
          <Text style={[apptStyles.motivo, { color: colors.textMuted }]} numberOfLines={1}>
            {appt.motivo}
          </Text>
        ) : null}
      </View>
      <View style={[apptStyles.badge, { backgroundColor: color + '18' }]}>
        <Text style={[apptStyles.badgeText, { color }]}>{stat.label}</Text>
      </View>
    </View>
  );
}

function InvoiceRow({ inv, colors }) {
  const stat  = INV_STATUS[inv.estado] ?? INV_STATUS.PENDING;
  const color = colors[stat.colorKey] ?? colors.textMuted;
  const dt    = inv.creadoEn ? new Date(inv.creadoEn) : null;
  const saldo = parseFloat(inv.saldo ?? 0);
  return (
    <View style={[invStyles.row, { borderBottomColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <View style={invStyles.topRow}>
          <Text style={[invStyles.desc, { color: colors.textPrimary }]} numberOfLines={1}>
            {inv.descripcion || `Factura #${inv.id}`}
          </Text>
          <View style={[invStyles.badge, { backgroundColor: color + '18' }]}>
            <Text style={[invStyles.badgeText, { color }]}>{stat.label}</Text>
          </View>
        </View>
        {dt && (
          <Text style={[invStyles.date, { color: colors.textMuted }]}>
            {dt.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        )}
        <View style={invStyles.amounts}>
          <View style={invStyles.amountItem}>
            <Text style={[invStyles.amountLabel, { color: colors.textMuted }]}>Total</Text>
            <Text style={[invStyles.amountValue, { color: colors.textPrimary }]}>
              S/ {parseFloat(inv.total ?? 0).toFixed(2)}
            </Text>
          </View>
          <View style={invStyles.amountItem}>
            <Text style={[invStyles.amountLabel, { color: colors.textMuted }]}>Pagado</Text>
            <Text style={[invStyles.amountValue, { color: colors.secondary }]}>
              S/ {parseFloat(inv.pagado ?? 0).toFixed(2)}
            </Text>
          </View>
          {saldo > 0 && (
            <View style={invStyles.amountItem}>
              <Text style={[invStyles.amountLabel, { color: colors.textMuted }]}>Saldo</Text>
              <Text style={[invStyles.amountValue, { color: colors.danger }]}>
                S/ {saldo.toFixed(2)}
              </Text>
            </View>
          )}
          {inv.numeroCuotas > 1 && (
            <View style={[invStyles.cuotaChip, { backgroundColor: colors.purpleLight }]}>
              <Ionicons name="layers-outline" size={11} color={colors.purple} />
              <Text style={[invStyles.cuotaText, { color: colors.purple }]}>
                {inv.numeroCuotas} cuotas
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

function EmptyBox({ icon, text, colors }) {
  return (
    <View style={emptyStyles.box}>
      <Ionicons name={icon} size={36} color={colors.border} />
      <Text style={[emptyStyles.text, { color: colors.textMuted }]}>{text}</Text>
    </View>
  );
}

/* ── Styles ────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container:   { flex: 1 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14 },

  hero:        { alignItems: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 20, borderBottomWidth: 1, gap: 6 },
  avatar:      { width: 80, height: 80, borderRadius: 40, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText:  { fontSize: 28, fontWeight: '800' },
  heroName:    { fontSize: 22, fontWeight: '800' },
  heroDni:     { fontSize: 13 },
  heroBadges:  { flexDirection: 'row', gap: 8, marginTop: 4 },
  badge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { fontSize: 12, fontWeight: '600' },
  editBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 },
  editBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  statsRow:    { flexDirection: 'row', gap: 8, padding: 14 },
  statCard:    { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', gap: 3 },
  statIcon:    { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 2 },
  statValue:   { fontSize: 18, fontWeight: '800' },
  statLabel:   { fontSize: 10, textAlign: 'center' },

  tabs:        { flexDirection: 'row', borderBottomWidth: 1, marginHorizontal: 16, borderRadius: 0 },
  tab:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:     { fontSize: 13, fontWeight: '600' },
  tabContent:  { paddingTop: 12 },

  card:        { marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:{ fontSize: 15, fontWeight: '700' },
  seeAll:      { fontSize: 13, fontWeight: '600' },
  notes:       { fontSize: 14, lineHeight: 20 },
  countLabel:  { fontSize: 12, marginBottom: 8 },

  filterScroll:{ marginBottom: 12 },
  filterRow:   { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  filterChip:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  filterChipText: { fontSize: 13, fontWeight: '600' },

  payRow:      { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16 },
  payCell:     { flex: 1, alignItems: 'center', gap: 4 },
  payCellValue:{ fontSize: 20, fontWeight: '800' },
  payCellLabel:{ fontSize: 12 },
  payDivider:  { width: 1, marginVertical: 4 },
});

const apptStyles = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1 },
  dateBox:  { width: 40, alignItems: 'center', borderRadius: 10, paddingVertical: 6 },
  dateDay:  { fontSize: 16, fontWeight: '800' },
  dateMon:  { fontSize: 10, fontWeight: '600' },
  time:     { fontSize: 13, fontWeight: '600' },
  motivo:   { fontSize: 12, marginTop: 2 },
  badge:    { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText:{ fontSize: 11, fontWeight: '700' },
});

const invStyles = StyleSheet.create({
  row:        { paddingVertical: 14, borderBottomWidth: 1 },
  topRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 },
  desc:       { flex: 1, fontSize: 14, fontWeight: '700' },
  date:       { fontSize: 12, marginBottom: 8 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
  amounts:    { flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'center' },
  amountItem: { gap: 1 },
  amountLabel:{ fontSize: 10, fontWeight: '500' },
  amountValue:{ fontSize: 14, fontWeight: '700' },
  cuotaChip:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  cuotaText:  { fontSize: 11, fontWeight: '600' },
});

const emptyStyles = StyleSheet.create({
  box:  { alignItems: 'center', paddingVertical: 28, gap: 8 },
  text: { fontSize: 13 },
});
