import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';

const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
];
const DAYS_HEADER = ['Lu','Ma','Mi','Ju','Vi','Sa','Do'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const offset   = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export default function DatePickerModal({ visible, value, onConfirm, onCancel, maximumDate }) {
  const { colors, isDark } = useTheme();
  const initial = value instanceof Date ? value : new Date(2000, 0, 1);
  const [viewYear,  setViewYear]  = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected,  setSelected]  = useState(value instanceof Date ? value : null);

  const today   = new Date();
  const maxDate = maximumDate ?? today;
  const cells   = buildCalendar(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const isDisabled = (day) => {
    if (!day) return true;
    return new Date(viewYear, viewMonth, day) > maxDate;
  };

  const isSelected = (day) =>
    day && selected &&
    selected.getDate() === day &&
    selected.getMonth() === viewMonth &&
    selected.getFullYear() === viewYear;

  const isToday = (day) =>
    day &&
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const handleDayPress = (day) => {
    if (!day || isDisabled(day)) return;
    setSelected(new Date(viewYear, viewMonth, day));
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: colors.surface }, SHADOWS.lg(colors)]}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.textPrimary }]}>
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, { backgroundColor: colors.background }]}>
              <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Year quick nav */}
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setViewYear((y) => y - 1)} style={[styles.yearBtn, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="remove" size={14} color={colors.primary} />
            </TouchableOpacity>
            <Text style={[styles.yearText, { color: colors.textSecondary }]}>{viewYear}</Text>
            <TouchableOpacity onPress={() => setViewYear((y) => y + 1)} style={[styles.yearBtn, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="add" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={styles.daysHeader}>
            {DAYS_HEADER.map((d) => (
              <Text key={d} style={[styles.dayHeader, { color: colors.textMuted }]}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={styles.grid}>
            {cells.map((day, i) => {
              const sel = isSelected(day);
              const dis = isDisabled(day);
              const tod = isToday(day);
              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.cell,
                    sel && { backgroundColor: colors.primary },
                    tod && !sel && { backgroundColor: colors.primaryLight },
                    (dis || !day) && styles.cellDisabled,
                  ]}
                  onPress={() => handleDayPress(day)}
                  activeOpacity={dis || !day ? 1 : 0.7}
                >
                  {day ? (
                    <Text style={[
                      styles.cellText,
                      { color: colors.textPrimary },
                      sel && styles.cellTextSelected,
                      tod && !sel && { color: colors.primary, fontWeight: '700' },
                      dis && { color: colors.textMuted },
                    ]}>
                      {day}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected display */}
          {selected && (
            <View style={[styles.selectedDisplay, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="calendar-outline" size={14} color={colors.primary} />
              <Text style={[styles.selectedText, { color: colors.primary }]}>
                {selected.toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })}
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.cancelBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, { backgroundColor: colors.primary }, !selected && styles.confirmBtnDisabled]}
              onPress={() => { if (selected) onConfirm(selected); }}
              disabled={!selected}
              activeOpacity={0.85}
            >
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const CELL_SIZE = 38;

const styles = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: '#00000066', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modal:          { borderRadius: 20, padding: 20, width: '100%', maxWidth: 360 },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navBtn:         { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  monthTitle:     { fontSize: 16, fontWeight: '700' },
  yearRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 },
  yearBtn:        { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  yearText:       { fontSize: 15, fontWeight: '700', minWidth: 44, textAlign: 'center' },
  daysHeader:     { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 6 },
  dayHeader:      { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', gap: 2 },
  cell:           { width: CELL_SIZE, height: CELL_SIZE, borderRadius: CELL_SIZE / 2, justifyContent: 'center', alignItems: 'center' },
  cellDisabled:   { opacity: 0.3 },
  cellText:       { fontSize: 14, fontWeight: '500' },
  cellTextSelected:{ color: '#fff', fontWeight: '700' },
  selectedDisplay:{ flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10, marginTop: 14 },
  selectedText:   { fontSize: 13, fontWeight: '600' },
  actions:        { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelBtn:      { flex: 1, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  cancelText:     { fontSize: 15, fontWeight: '600' },
  confirmBtn:     { flex: 1, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmText:    { fontSize: 15, fontWeight: '700', color: '#fff' },
});
