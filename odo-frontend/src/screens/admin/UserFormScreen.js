import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { crearUsuario, actualizarUsuario } from '../../services/adminService';

const ROLES = [
  { value: 'DENTIST',      label: 'Dentista',      icon: 'medical-outline' },
  { value: 'RECEPTIONIST', label: 'Recepcionista', icon: 'headset-outline' },
  { value: 'PATIENT',      label: 'Paciente',      icon: 'person-outline' },
  { value: 'ADMIN',        label: 'Admin',          icon: 'shield-checkmark-outline' },
];

export default function UserFormScreen({ route, navigation }) {
  const { colors, isDark } = useTheme();
  const editUser = route.params?.user ?? null;
  const isEdit   = editUser !== null;

  const [form, setForm] = useState({
    nombre:    editUser?.nombre ?? '',
    email:     editUser?.email  ?? '',
    contrasena: '',
    rol:       editUser?.rol    ?? 'DENTIST',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving]             = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.nombre.trim())  return Alert.alert('Requerido', 'El nombre es obligatorio');
    if (!form.email.trim()) return Alert.alert('Requerido', 'El email es obligatorio');
    if (!isEdit && !form.contrasena.trim()) return Alert.alert('Requerido', 'La contraseña es obligatoria');

    setSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email, rol: form.rol };
      if (form.contrasena.trim()) payload.contrasena = form.contrasena;

      if (isEdit) {
        await actualizarUsuario(editUser.id, payload);
      } else {
        await crearUsuario(payload);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.error ?? 'No se pudo guardar el usuario');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INFORMACIÓN PERSONAL</Text>

        <FormInput
          label="Nombre completo"
          value={form.nombre}
          onChangeText={set('nombre')}
          placeholder="Ej. Dr. Carlos López"
          icon="person-outline"
        />
        <FormInput
          label="Correo electrónico"
          value={form.email}
          onChangeText={set('email')}
          placeholder="correo@clinica.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label={isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          value={form.contrasena}
          onChangeText={set('contrasena')}
          placeholder={isEdit ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'}
          icon="lock-closed-outline"
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowPassword((v) => !v)}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ROL</Text>
        {ROLES.map((r) => {
          const active = form.rol === r.value;
          return (
            <TouchableOpacity
              key={r.value}
              style={[
                styles.roleRow,
                { borderColor: colors.border },
                active && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
              ]}
              onPress={() => set('rol')(r.value)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIcon, { backgroundColor: active ? colors.primary : colors.background }]}>
                <Ionicons name={r.icon} size={18} color={active ? '#fff' : colors.textMuted} />
              </View>
              <Text style={[styles.roleLabel, { color: active ? colors.primary : colors.textPrimary }, active && { fontWeight: '700' }]}>
                {r.label}
              </Text>
              {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.85}
      >
        {saving
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Ionicons name={isEdit ? 'save-outline' : 'person-add-outline'} size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{isEdit ? 'Guardar cambios' : 'Crear usuario'}</Text>
            </>
        }
      </TouchableOpacity>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  card:         { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  roleRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1.5, borderRadius: 12, padding: 12, marginBottom: 8 },
  roleIcon:     { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  roleLabel:    { flex: 1, fontSize: 15, fontWeight: '600' },
  saveBtn:      { borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText:  { color: '#fff', fontSize: 16, fontWeight: '700' },
});
