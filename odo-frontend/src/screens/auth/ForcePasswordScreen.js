import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { updateProfile } from '../../services/profileService';

export default function ForcePasswordScreen() {
  const { colors, isDark } = useTheme();
  const { user, updateUser } = useAuth();

  const [nueva, setNueva]         = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [showNueva, setShowNueva]         = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!nueva.trim())        e.nueva = 'Ingresa una nueva contraseña';
    else if (nueva.length < 8) e.nueva = 'Mínimo 8 caracteres';
    if (!confirmar.trim())    e.confirmar = 'Confirma tu contraseña';
    else if (nueva !== confirmar) e.confirmar = 'Las contraseñas no coinciden';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const updated = await updateProfile({
        nombre: user.nombre,
        email:  user.email,
        nuevaContrasena: nueva,
      });
      await updateUser(updated);
    } catch (err) {
      Alert.alert('Error', err?.message ?? err?.error ?? 'No se pudo actualizar la contraseña');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.warningLight }]}>
          <Ionicons name="lock-open-outline" size={32} color={colors.warning} />
        </View>

        <Text style={[styles.title, { color: colors.textPrimary }]}>
          Actualiza tu contraseña
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Por seguridad debés establecer una contraseña personal antes de continuar.
        </Text>

        <View style={styles.field}>
          <FormInput
            label="Nueva contraseña"
            value={nueva}
            onChangeText={(v) => { setNueva(v); setErrors((e) => ({ ...e, nueva: undefined })); }}
            placeholder="Mínimo 8 caracteres"
            icon="lock-closed-outline"
            secureTextEntry={!showNueva}
            rightIcon={showNueva ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowNueva((v) => !v)}
          />
          {errors.nueva && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.nueva}</Text>
            </View>
          )}
        </View>

        <View style={styles.field}>
          <FormInput
            label="Confirmar contraseña"
            value={confirmar}
            onChangeText={(v) => { setConfirmar(v); setErrors((e) => ({ ...e, confirmar: undefined })); }}
            placeholder="Repite la contraseña"
            icon="checkmark-circle-outline"
            secureTextEntry={!showConfirmar}
            rightIcon={showConfirmar ? 'eye-off-outline' : 'eye-outline'}
            onRightIconPress={() => setShowConfirmar((v) => !v)}
          />
          {errors.confirmar && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={13} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{errors.confirmar}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving
            ? <ActivityIndicator color="#fff" size="small" />
            : <>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Guardar contraseña</Text>
              </>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content:   { flex: 1, justifyContent: 'center', padding: 24 },
  card:      { borderRadius: 20, padding: 24, alignItems: 'center', gap: 12 },
  iconWrap:  { width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  title:     { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  subtitle:  { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 8 },
  field:     { width: '100%' },
  errorRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, paddingHorizontal: 4 },
  errorText: { fontSize: 12, fontWeight: '500' },
  btn:       { width: '100%', height: 54, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 8 },
  btnText:   { color: '#fff', fontSize: 16, fontWeight: '700' },
});
