import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, FlatList, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useBreakpoint } from '../../utils/responsive';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { createAppointment } from '../../services/appointmentService';
import { getPatients } from '../../services/patientService';

const HOUR_H   = 60;
const TIME_COL = 48;
const HOURS    = Array.from({ length: 13 }, (_, i) => i + 7);  // 7–19
const DAYS_ES   = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function getWeekDays(base) {
  const monday = new Date(base);
  monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString();
}

export default function AppointmentFormScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const { isLarge, isDesktop, width } = useBreakpoint();

  // On large screens fit all 7 days without horizontal scroll
  const SIDEBAR_W = isDesktop ? 220 : isLarge ? 72 : 0;
  const availableW = isLarge ? width - SIDEBAR_W : width;
  const DAY_W  = isLarge ? Math.max(60, Math.floor((availableW - TIME_COL) / 7)) : 76;
  const TOTAL_W = TIME_COL + DAY_W * 7;

  const today = new Date();
  const [weekBase, setWeekBase]               = useState(today);
  const [days, setDays]                       = useState(getWeekDays(today));
  const [selected, setSelected]               = useState(null);
  const [appointments, setAppts]              = useState([]);
  const [patients, setPatients]               = useState([]);
  const [showModal, setShowModal]             = useState(false);
  const [showPatientPicker, setShowPatientPicker] = useState(false);
  const [showYearMonth, setShowYearMonth]     = useState(false);
  const [pickerYear, setPickerYear]           = useState(today.getFullYear());
  const [saving, setSaving]                   = useState(false);

  const STATUS_COLOR = {
    SCHEDULED: colors.warning,
    CONFIRMED: colors.secondary,
    COMPLETED: colors.primary,
    CANCELLED: colors.danger,
  };

  const [form, setForm] = useState({
    patientId: null, patientName: '',
    dentistId: 1,
    durationMinutes: 30,
    reason: '', notes: '',
  });

  const scrollRef = useRef(null);

  useEffect(() => { getPatients().then(setPatients).catch(() => {}); }, []);
  useEffect(() => { setDays(getWeekDays(weekBase)); }, [weekBase]);
  useEffect(() => {
    if (scrollRef.current)
      setTimeout(() => scrollRef.current?.scrollTo({ y: HOUR_H * 2, animated: true }), 300);
  }, []);

  const prevWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() - 7); setWeekBase(d); };
  const nextWeek = () => { const d = new Date(weekBase); d.setDate(d.getDate() + 7); setWeekBase(d); };
  const goToday  = () => setWeekBase(today);

  const openYearMonth  = () => { setPickerYear(weekBase.getFullYear()); setShowYearMonth(true); };
  const selectYearMonth = (year, month) => { setWeekBase(new Date(year, month, 1)); setShowYearMonth(false); };
  const handleSlotPress = (date, hour) => { setSelected({ date, hour }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.patientId) return Alert.alert('Requerido', 'Selecciona un paciente');
    const dt = new Date(selected.date);
    dt.setHours(selected.hour, 0, 0, 0);
    setSaving(true);
    try {
      await createAppointment({
        patientId: form.patientId,
        dentistId: form.dentistId,
        dateTime: dt.toISOString(),
        durationMinutes: form.durationMinutes,
        reason: form.reason,
        notes: form.notes,
      });
      setShowModal(false);
      setSelected(null);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar la cita');
    } finally {
      setSaving(false);
    }
  };

  const apptAt = (day, hour) =>
    appointments.find((a) => {
      const d = new Date(a.dateTime);
      return isSameDay(d, day) && d.getHours() === hour;
    });

  const monthLabel = `${MONTHS_ES[days[0].getMonth()]} ${days[0].getFullYear()}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── Navigation header ── */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.background }]} onPress={prevWeek}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={openYearMonth} style={styles.monthBtn} activeOpacity={0.7}>
          <Text style={[styles.monthText, { color: colors.textPrimary }]}>{monthLabel}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.background }]} onPress={nextWeek}>
          <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* ── Calendar: horizontal scroll on mobile, fixed width on large screens ── */}
      <ScrollView
        horizontal
        scrollEnabled={!isLarge}
        showsHorizontalScrollIndicator={!isLarge}
        style={{ flex: 1 }}
        contentContainerStyle={{ width: TOTAL_W, flexGrow: 1 }}
        nestedScrollEnabled
      >
        <View style={{ width: TOTAL_W, flex: 1 }}>

          {/* Day header row — lives inside horizontal scroll so it scrolls with grid */}
          <View style={[styles.dayHeaderRow, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <View style={{ width: TIME_COL }} />
            {days.map((d, i) => {
              const isToday = isSameDay(d, today);
              const isSel   = selected && isSameDay(d, selected.date);
              return (
                <View key={i} style={[styles.dayHeader, { width: DAY_W }]}>
                  <Text style={[styles.dayName, { color: colors.textMuted }, isToday && { color: colors.primary }]}>
                    {DAYS_ES[d.getDay()]}
                  </Text>
                  <View style={[
                    styles.dayNum,
                    isToday && { backgroundColor: colors.primaryLight },
                    isSel && { backgroundColor: colors.primary },
                  ]}>
                    <Text style={[
                      styles.dayNumText,
                      { color: colors.textPrimary },
                      isToday && { color: colors.primary },
                      isSel && { color: '#fff' },
                    ]}>
                      {d.getDate()}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Vertical scroll for time rows */}
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <View style={{ flexDirection: 'row', height: HOURS.length * HOUR_H }}>

              {/* Time labels column */}
              <View style={{ width: TIME_COL }}>
                {HOURS.map((h) => (
                  <View key={h} style={[styles.timeCell, { height: HOUR_H }]}>
                    <Text style={[styles.timeText, { color: colors.textMuted }]}>
                      {String(h).padStart(2, '0')}:00
                    </Text>
                  </View>
                ))}
              </View>

              {/* Day columns */}
              {days.map((day, di) => (
                <View key={di} style={{ width: DAY_W }}>
                  {HOURS.map((hour) => {
                    const appt    = apptAt(day, hour);
                    const isToday = isSameDay(day, today);
                    const isPast  = isToday && hour < today.getHours();
                    const isSel   = selected && isSameDay(day, selected.date) && selected.hour === hour;

                    return (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.cell,
                          { height: HOUR_H, borderColor: colors.border + '66' },
                          isToday && { backgroundColor: colors.primaryLight + '44' },
                          isPast  && { backgroundColor: colors.background },
                          isSel   && { backgroundColor: colors.primaryLight },
                        ]}
                        onPress={() => !isPast && handleSlotPress(day, hour)}
                        activeOpacity={isPast ? 1 : 0.6}
                      >
                        {appt && (
                          <View style={[styles.apptBlock, {
                            backgroundColor: STATUS_COLOR[appt.status] ?? colors.primary,
                            height: HOUR_H - 4,
                          }]}>
                            <Text style={styles.apptText} numberOfLines={1}>{appt.patient?.firstName}</Text>
                            <Text style={styles.apptSub} numberOfLines={1}>{appt.reason || appt.dentist?.name}</Text>
                          </View>
                        )}
                        {isSel && !appt && (
                          <View style={styles.selIndicator}>
                            <Ionicons name="add" size={16} color={colors.primary} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* ── New appointment modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={[styles.overlay, isLarge && styles.overlayPC]}>
          <View style={[styles.modal, isLarge && styles.modalPC, { backgroundColor: colors.surface }, SHADOWS.lg(colors)]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Nueva cita</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selected && (
              <View style={[styles.selectedTime, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="time-outline" size={16} color={colors.primary} />
                <Text style={[styles.selectedTimeText, { color: colors.primary }]}>
                  {selected.date.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {'  ·  '}{String(selected.hour).padStart(2, '0')}:00 h
                </Text>
              </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
              <FormInput
                label="Paciente"
                value={form.patientName}
                placeholder="Seleccionar paciente..."
                icon="person-outline"
                rightIcon="chevron-down"
                editable={false}
                onPress={() => setShowPatientPicker(true)}
              />

              <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Duracion</Text>
              <View style={styles.durationRow}>
                {[15, 30, 45, 60, 90].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.durationChip,
                      { borderColor: colors.border, backgroundColor: colors.background },
                      form.durationMinutes === m && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => setForm((f) => ({ ...f, durationMinutes: m }))}
                  >
                    <Text style={[
                      styles.durationText,
                      { color: colors.textSecondary },
                      form.durationMinutes === m && { color: colors.primary },
                    ]}>
                      {m} min
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <FormInput
                label="Motivo"
                value={form.reason}
                onChangeText={(v) => setForm((f) => ({ ...f, reason: v }))}
                placeholder="Limpieza, revision, extraccion..."
                icon="medical-outline"
              />
              <FormInput
                label="Notas"
                value={form.notes}
                onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
                placeholder="Observaciones adicionales..."
                icon="document-text-outline"
                multiline numberOfLines={3}
              />
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.85}
            >
              {saving
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name="calendar-outline" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Confirmar cita</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Year / Month picker ── */}
      <Modal visible={showYearMonth} animationType="fade" transparent>
        <View style={[styles.overlay, isLarge && styles.overlayPC]}>
          <View style={[styles.modal, isLarge && styles.modalPC, { backgroundColor: colors.surface, maxHeight: 440 }, SHADOWS.lg(colors)]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Seleccionar mes</Text>
              <TouchableOpacity onPress={() => setShowYearMonth(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={[styles.ymYearRow, { backgroundColor: colors.primaryLight }]}>
              <TouchableOpacity style={[styles.ymYearBtn, { backgroundColor: colors.surface }]} onPress={() => setPickerYear((y) => y - 1)}>
                <Ionicons name="chevron-back" size={18} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.ymYearText, { color: colors.primary }]}>{pickerYear}</Text>
              <TouchableOpacity style={[styles.ymYearBtn, { backgroundColor: colors.surface }]} onPress={() => setPickerYear((y) => y + 1)}>
                <Ionicons name="chevron-forward" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.ymGrid}>
              {MONTHS_ES.map((name, idx) => {
                const isCurrent = idx === weekBase.getMonth() && pickerYear === weekBase.getFullYear();
                const isNow     = idx === today.getMonth() && pickerYear === today.getFullYear();
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.ymMonth,
                      { backgroundColor: colors.background, borderColor: colors.border },
                      isCurrent && { backgroundColor: colors.primary, borderColor: colors.primary },
                      isNow && !isCurrent && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => selectYearMonth(pickerYear, idx)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.ymMonthText,
                      { color: colors.textSecondary },
                      isCurrent && { color: '#fff', fontWeight: '700' },
                      isNow && !isCurrent && { color: colors.primary, fontWeight: '700' },
                    ]}>
                      {name.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={[styles.ymTodayBtn, { borderColor: colors.primary, backgroundColor: colors.primaryLight }]}
              onPress={() => { setShowYearMonth(false); goToday(); }}
              activeOpacity={0.8}
            >
              <Ionicons name="today-outline" size={16} color={colors.primary} />
              <Text style={[styles.ymTodayText, { color: colors.primary }]}>Ir a hoy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Patient picker ── */}
      <Modal visible={showPatientPicker} animationType="slide" transparent>
        <View style={[styles.overlay, isLarge && styles.overlayPC]}>
          <View style={[styles.modal, isLarge && styles.modalPC, { backgroundColor: colors.surface }, SHADOWS.lg(colors)]}>
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
                    setForm((f) => ({ ...f, patientId: item.id, patientName: `${item.firstName} ${item.lastName}` }));
                    setShowPatientPicker(false);
                  }}
                >
                  <View style={[styles.pickerAvatar, { backgroundColor: colors.primaryLight }]}>
                    <Text style={[styles.pickerAvatarText, { color: colors.primary }]}>
                      {item.firstName?.[0]}{item.lastName?.[0]}
                    </Text>
                  </View>
                  <Text style={[styles.pickerName, { color: colors.textPrimary }]}>
                    {item.firstName} {item.lastName}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: colors.textMuted }]}>No hay pacientes registrados</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1 },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  navBtn:           { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  monthText:        { fontSize: 15, fontWeight: '700' },
  dayHeaderRow:     { flexDirection: 'row', borderBottomWidth: 1, paddingVertical: 8 },
  dayHeader:        { alignItems: 'center', gap: 4 },
  dayName:          { fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  dayNum:           { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  dayNumText:       { fontSize: 14, fontWeight: '700' },
  timeCell:         { justifyContent: 'flex-start', paddingTop: 4, paddingRight: 6, alignItems: 'flex-end' },
  timeText:         { fontSize: 10, fontWeight: '500' },
  cell:             { borderTopWidth: 1, borderLeftWidth: 1, position: 'relative' },
  apptBlock:        { position: 'absolute', top: 2, left: 2, right: 2, borderRadius: 6, padding: 4 },
  apptText:         { fontSize: 11, fontWeight: '700', color: '#fff' },
  apptSub:          { fontSize: 10, color: '#fff', opacity: 0.85 },
  selIndicator:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  overlay:          { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  overlayPC:        { justifyContent: 'center', alignItems: 'center', padding: 32 },
  modal:            { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  modalPC:          { borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, maxWidth: 520, width: '100%', maxHeight: '80%' },
  modalHeader:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:       { fontSize: 18, fontWeight: '700' },
  selectedTime:     { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginBottom: 16 },
  selectedTimeText: { fontSize: 13, fontWeight: '600' },
  subLabel:         { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  durationRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  durationChip:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  durationText:     { fontSize: 13, fontWeight: '600' },
  saveBtn:          { borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 },
  saveBtnText:      { color: '#fff', fontSize: 16, fontWeight: '700' },
  pickerRow:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  pickerAvatar:     { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  pickerAvatarText: { fontSize: 14, fontWeight: '700' },
  pickerName:       { flex: 1, fontSize: 15, fontWeight: '600' },
  emptyText:        { textAlign: 'center', padding: 24 },
  ymYearRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24, borderRadius: 12, paddingVertical: 12, marginBottom: 16 },
  ymYearBtn:        { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  ymYearText:       { fontSize: 22, fontWeight: '800', minWidth: 60, textAlign: 'center' },
  ymGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  ymMonth:          { width: '22%', aspectRatio: 1.6, justifyContent: 'center', alignItems: 'center', borderRadius: 10, borderWidth: 1 },
  ymMonthText:      { fontSize: 13, fontWeight: '600' },
  ymTodayBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  ymTodayText:      { fontSize: 14, fontWeight: '700' },
});
