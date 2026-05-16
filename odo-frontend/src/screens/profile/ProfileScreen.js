import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { updateProfile } from '../../services/profileService';

const ROLE_META = {
  ADMIN:        { label: 'Administrador', color: '#8B5CF6', bg: '#F5F3FF' },
  DENTIST:      { label: 'Dentista',      color: '#2563EB', bg: '#EFF6FF' },
  RECEPTIONIST: { label: 'Recepcionista', color: '#10B981', bg: '#ECFDF5' },
  PATIENT:      { label: 'Paciente',      color: '#F59E0B', bg: '#FFFBEB' },
};

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function ProfileScreen() {
  const { colors, isDark } = useTheme();
  const { user, updateUser, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', style: 'destructive', onPress: logout },
      ]
    );
  };

  const meta = ROLE_META[user?.role] ?? ROLE_META.DENTIST;

  const [form, setForm] = useState({
    name:            user?.name  ?? '',
    email:           user?.email ?? '',
    currentPassword: '',
    newPassword:     '',
  });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [saving,      setSaving]      = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim())  return Alert.alert('Requerido', 'El nombre no puede estar vacío');
    if (!form.email.trim()) return Alert.alert('Requerido', 'El email no puede estar vacío');

    if (form.newPassword && !form.currentPassword) {
      return Alert.alert('Requerido', 'Ingresa tu contraseña actual para cambiarla');
    }

    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email };
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword     = form.newPassword;
      }
      const updated = await updateProfile(payload);
      await updateUser(updated);
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
      Alert.alert('Listo', 'Perfil actualizado correctamente');
    } catch (err) {
      Alert.alert('Error', err?.error ?? 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ padding: 20 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar card */}
      <View style={[styles.avatarCard, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
          <Text style={[styles.avatarText, { color: meta.color }]}>{initials(user?.name)}</Text>
        </View>
        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.name}</Text>
        <View style={[styles.roleBadge, { backgroundColor: meta.bg }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={meta.color} />
          <Text style={[styles.roleText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
      </View>

      {/* Info form */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INFORMACIÓN PERSONAL</Text>
        <FormInput
          label="Nombre completo"
          value={form.name}
          onChangeText={set('name')}
          placeholder="Tu nombre"
          icon="person-outline"
        />
        <FormInput
          label="Correo electrónico"
          value={form.email}
          onChangeText={set('email')}
          placeholder="tu@correo.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password change */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CAMBIAR CONTRASEÑA</Text>
        <Text style={[styles.hint, { color: colors.textMuted }]}>
          Deja los campos en blanco si no deseas cambiarla.
        </Text>
        <FormInput
          label="Contraseña actual"
          value={form.currentPassword}
          onChangeText={set('currentPassword')}
          placeholder="••••••••"
          icon="lock-closed-outline"
          secureTextEntry={!showCurrent}
          rightIcon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowCurrent((v) => !v)}
        />
        <FormInput
          label="Nueva contraseña"
          value={form.newPassword}
          onChangeText={set('newPassword')}
          placeholder="Mínimo 8 caracteres"
          icon="lock-open-outline"
          secureTextEntry={!showNew}
          rightIcon={showNew ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowNew((v) => !v)}
        />
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
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>Guardar cambios</Text>
            </>
        }
      </TouchableOpacity>

      {/* Logout — only on mobile (desktop has sidebar button) */}
      {Platform.OS !== 'web' && (
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#ef4444' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  avatarCard:  { alignItems: 'center', borderRadius: 20, padding: 24, marginBottom: 16, gap: 8 },
  avatar:      { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  avatarText:  { fontSize: 28, fontWeight: '800' },
  userName:    { fontSize: 20, fontWeight: '700' },
  roleBadge:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  roleText:    { fontSize: 12, fontWeight: '700' },
  userEmail:   { fontSize: 13 },
  card:        { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  hint:        { fontSize: 12, marginBottom: 12 },
  saveBtn:     { borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, height: 50, marginTop: 12 },
  logoutText:  { color: '#ef4444', fontSize: 15, fontWeight: '700' },
});
