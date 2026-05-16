import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  Text, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import SectionTitle from '../../components/forms/SectionTitle';
import DatePickerModal from '../../components/forms/DatePickerModal';
import { createPatient, updatePatient, getPatientById } from '../../services/patientService';

export default function PatientFormScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const editId = route?.params?.id;
  const isEdit = !!editId;

  const [form, setForm] = useState({
    firstName: '', lastName: '', dni: '',
    phone: '', email: '', address: '',
    birthDate: null, notes: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPatientById(editId)
      .then((p) => setForm({
        firstName: p.firstName ?? '',
        lastName:  p.lastName  ?? '',
        dni:       p.dni       ?? '',
        phone:     p.phone     ?? '',
        email:     p.email     ?? '',
        address:   p.address   ?? '',
        birthDate: p.birthDate ? new Date(p.birthDate) : null,
        notes:     p.notes     ?? '',
      }))
      .finally(() => setLoading(false));
  }, [editId]);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Requerido';
    if (!form.lastName.trim())  e.lastName  = 'Requerido';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Correo invalido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const payload = {
      ...form,
      birthDate: form.birthDate ? form.birthDate.toISOString().split('T')[0] : null,
    };
    try {
      if (isEdit) await updatePatient(editId, payload);
      else        await createPatient(payload);
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el paciente');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (d) => d
    ? d.toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Seleccionar fecha';

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        <SectionTitle title="Datos personales" />
        <View style={styles.row}>
          <View style={styles.half}>
            <FormInput label="Nombre" value={form.firstName} onChangeText={set('firstName')}
              placeholder="Juan" icon="person-outline" error={errors.firstName} />
          </View>
          <View style={styles.half}>
            <FormInput label="Apellido" value={form.lastName} onChangeText={set('lastName')}
              placeholder="Perez" icon="person-outline" error={errors.lastName} />
          </View>
        </View>

        <FormInput label="DNI / Cedula" value={form.dni} onChangeText={set('dni')}
          placeholder="12345678" icon="card-outline" keyboardType="numeric" />

        <FormInput
          label="Fecha de nacimiento"
          value={formatDate(form.birthDate)}
          icon="calendar-outline"
          rightIcon="chevron-down"
          editable={false}
          onPress={() => setShowDatePicker(true)}
        />

        <SectionTitle title="Contacto" />
        <FormInput label="Telefono" value={form.phone} onChangeText={set('phone')}
          placeholder="+51 999 999 999" icon="call-outline" keyboardType="phone-pad" />

        <FormInput label="Correo electronico" value={form.email} onChangeText={set('email')}
          placeholder="correo@ejemplo.com" icon="mail-outline"
          keyboardType="email-address" error={errors.email} />

        <FormInput label="Direccion" value={form.address} onChangeText={set('address')}
          placeholder="Av. Principal 123" icon="location-outline" />

        <SectionTitle title="Notas clinicas" />
        <FormInput label="Observaciones" value={form.notes} onChangeText={set('notes')}
          placeholder="Alergias, antecedentes, etc." icon="document-text-outline"
          multiline numberOfLines={4} />

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }, SHADOWS.md(isDark)]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name={isEdit ? 'save-outline' : 'person-add-outline'} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? 'Guardar cambios' : 'Registrar paciente'}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <DatePickerModal
        visible={showDatePicker}
        value={form.birthDate}
        maximumDate={new Date()}
        onConfirm={(date) => { set('birthDate')(date); setShowDatePicker(false); }}
        onCancel={() => setShowDatePicker(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1 },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll:         { padding: 20 },
  row:            { flexDirection: 'row', gap: 12 },
  half:           { flex: 1 },
  footer:         { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 28, borderTopWidth: 1 },
  saveBtn:        { borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnDisabled:{ opacity: 0.6 },
  saveBtnText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});
