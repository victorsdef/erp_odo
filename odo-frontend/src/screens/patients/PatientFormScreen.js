import React, { useState, useEffect } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity,
  Text, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import PhoneInput from '../../components/forms/PhoneInput';
import SectionTitle from '../../components/forms/SectionTitle';
import DatePickerModal from '../../components/forms/DatePickerModal';
import { createPatient, updatePatient, getPatientById } from '../../services/patientService';

export default function PatientFormScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const editId = route?.params?.id;
  const isEdit = !!editId;

  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '',
    telefono: '', email: '', direccion: '',
    fechaNacimiento: null, notas: '',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (!isEdit) return;
    getPatientById(editId)
      .then((p) => setForm({
        nombre:          p.nombre          ?? '',
        apellido:        p.apellido        ?? '',
        dni:             p.dni             ?? '',
        telefono:        p.telefono        ?? '',
        email:           p.email           ?? '',
        direccion:       p.direccion       ?? '',
        fechaNacimiento: p.fechaNacimiento ? new Date(p.fechaNacimiento) : null,
        notas:           p.notas           ?? '',
      }))
      .finally(() => setLoading(false));
  }, [editId]);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())   e.nombre   = 'El nombre es requerido';
    if (!form.apellido.trim()) e.apellido = 'El apellido es requerido';
    if (!form.dni.trim())      e.dni      = 'El DNI / cedula es requerido';
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
      fechaNacimiento: form.fechaNacimiento ? form.fechaNacimiento.toISOString().split('T')[0] : null,
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
            <FormInput label="Nombre" required value={form.nombre} onChangeText={set('nombre')}
              placeholder="Juan" icon="person-outline" error={errors.nombre} />
          </View>
          <View style={styles.half}>
            <FormInput label="Apellido" required value={form.apellido} onChangeText={set('apellido')}
              placeholder="Perez" icon="person-outline" error={errors.apellido} />
          </View>
        </View>

        <FormInput label="DNI / Cedula" required value={form.dni} onChangeText={set('dni')}
          placeholder="12345678" icon="card-outline" keyboardType="numeric" error={errors.dni} />

        <FormInput
          label="Fecha de nacimiento"
          value={formatDate(form.fechaNacimiento)}
          icon="calendar-outline"
          rightIcon="chevron-down"
          editable={false}
          onPress={() => setShowDatePicker(true)}
        />

        <SectionTitle title="Contacto" />
        <PhoneInput
          value={form.telefono}
          onChange={set('telefono')}
          error={errors.telefono}
        />

        <FormInput label="Correo electronico" value={form.email} onChangeText={set('email')}
          placeholder="correo@ejemplo.com" icon="mail-outline"
          keyboardType="email-address" error={errors.email} />

        <FormInput label="Direccion" value={form.direccion} onChangeText={set('direccion')}
          placeholder="Av. Principal 123" icon="location-outline" />

        <SectionTitle title="Notas clinicas" />
        <FormInput label="Observaciones" value={form.notas} onChangeText={set('notas')}
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
        value={form.fechaNacimiento}
        maximumDate={new Date()}
        onConfirm={(date) => { set('fechaNacimiento')(date); setShowDatePicker(false); }}
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
