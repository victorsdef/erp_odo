import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Modal, FlatList, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export const COUNTRIES = [
  { code: '+593', flag: '🇪🇨', name: 'Ecuador',    digits: 9  },
  { code: '+51',  flag: '🇵🇪', name: 'Peru',       digits: 9  },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia',   digits: 10 },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina',  digits: 10 },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico',     digits: 10 },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia',    digits: 8  },
  { code: '+56',  flag: '🇨🇱', name: 'Chile',      digits: 9  },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay',    digits: 8  },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay',   digits: 9  },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela',  digits: 10 },
  { code: '+55',  flag: '🇧🇷', name: 'Brasil',     digits: 11 },
  { code: '+1',   flag: '🇺🇸', name: 'USA / Canada', digits: 10 },
  { code: '+34',  flag: '🇪🇸', name: 'Espana',     digits: 9  },
  { code: '+44',  flag: '🇬🇧', name: 'Reino Unido', digits: 10 },
];

export function parsePhone(full = '') {
  if (!full) return { country: COUNTRIES[0], number: '' };
  const sorted = [...COUNTRIES].sort((a, b) => b.code.length - a.code.length);
  for (const c of sorted) {
    if (full.startsWith(c.code)) {
      return { country: c, number: full.slice(c.code.length) };
    }
  }
  return { country: COUNTRIES[0], number: full.replace(/^\+?0*/, '') };
}

export function buildPhone(country, number) {
  const digits = number.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${country.code}${digits}` : '';
}

export default function PhoneInput({ value, onChange, error, label = 'Telefono', required }) {
  const { colors } = useTheme();
  const parsed = parsePhone(value);

  const [country,     setCountry]     = useState(parsed.country);
  const [localNumber, setLocalNumber] = useState(parsed.number);
  const [showPicker,  setShowPicker]  = useState(false);
  const [focused,     setFocused]     = useState(false);

  const handleCountry = (c) => {
    setCountry(c);
    setShowPicker(false);
    onChange(buildPhone(c, localNumber));
  };

  const handleNumber = (text) => {
    const digits = text.replace(/[^\d\s\-()]/g, '');
    setLocalNumber(digits);
    onChange(buildPhone(country, digits));
  };

  const borderColor = error ? colors.danger : focused ? colors.borderFocus : colors.border;
  const bg          = focused ? colors.primaryLight : colors.inputBg;

  return (
    <View style={styles.wrap}>
      {label && (
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}

      <View style={[styles.row, { borderColor, backgroundColor: bg, borderWidth: 1.5, borderRadius: 12 }]}>
        {/* Country picker button */}
        <TouchableOpacity
          style={[styles.prefix, { borderRightColor: colors.border }]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.flag}>{country.flag}</Text>
          <Text style={[styles.code, { color: colors.textPrimary }]}>{country.code}</Text>
          <Ionicons name="chevron-down" size={13} color={colors.textMuted} />
        </TouchableOpacity>

        {/* Number input */}
        <TextInput
          style={[styles.input, { color: colors.textPrimary }]}
          value={localNumber}
          onChangeText={handleNumber}
          placeholder={`${'X'.repeat(country.digits)}`}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          maxLength={country.digits + 2}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {localNumber.length > 0 && (
          <TouchableOpacity onPress={() => handleNumber('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      )}

      {/* Digit hint */}
      {!error && localNumber.length > 0 && (
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          {localNumber.replace(/\D/g, '').replace(/^0+/, '').length}/{country.digits} digitos
          {' · '}Guardara como {buildPhone(country, localNumber)}
        </Text>
      )}

      {/* Country picker modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.modal, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Seleccionar pais</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(c) => c.code}
              renderItem={({ item }) => {
                const active = item.code === country.code;
                return (
                  <TouchableOpacity
                    style={[
                      styles.countryRow,
                      { borderBottomColor: colors.border },
                      active && { backgroundColor: colors.primaryLight },
                    ]}
                    onPress={() => handleCountry(item)}
                  >
                    <Text style={styles.countryFlag}>{item.flag}</Text>
                    <Text style={[styles.countryName, { color: colors.textPrimary }]}>{item.name}</Text>
                    <Text style={[styles.countryCode, { color: colors.textMuted }]}>{item.code}</Text>
                    {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:        { marginBottom: 16 },
  label:       { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  error:       { fontSize: 12, marginTop: 4 },
  hint:        { fontSize: 11, marginTop: 4 },
  row:         { flexDirection: 'row', alignItems: 'center', minHeight: 48 },
  prefix:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 12, borderRightWidth: 1 },
  flag:        { fontSize: 18 },
  code:        { fontSize: 13, fontWeight: '700' },
  input:       { flex: 1, fontSize: 15, paddingHorizontal: 12, paddingVertical: 12 },
  clearBtn:    { paddingRight: 12 },
  overlay:     { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modal:       { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle:  { fontSize: 18, fontWeight: '700' },
  countryRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  countryFlag: { fontSize: 22 },
  countryName: { flex: 1, fontSize: 15, fontWeight: '500' },
  countryCode: { fontSize: 14, fontWeight: '600' },
});
