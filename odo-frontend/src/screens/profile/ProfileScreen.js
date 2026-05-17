import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Modal,
  TouchableOpacity, TouchableWithoutFeedback, Alert, ActivityIndicator,
  Platform, Image, useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { updateProfile, uploadProfilePhoto } from '../../services/profileService';
import { API_BASE_URL } from '../../constants/api';

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
  const { width } = useWindowDimensions();

  const meta = ROLE_META[user?.rol] ?? ROLE_META.DENTIST;
  const isWide = width >= 600;

  const [form, setForm] = useState({
    nombre:           user?.nombre ?? '',
    email:            user?.email  ?? '',
    contrasenaActual: '',
    nuevaContrasena:  '',
  });
  const [errors,         setErrors]         = useState({});
  const [showCurrent,    setShowCurrent]    = useState(false);
  const [showNew,        setShowNew]        = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showPhotoPicker, setShowPhotoPicker] = useState(false);
  const [showPhotoViewer, setShowPhotoViewer] = useState(false);

  const set = (key) => (val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.nombre.trim())  e.nombre = 'El nombre es requerido';
    if (!form.email.trim())   e.email  = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Correo invalido';
    if (form.nuevaContrasena && !form.contrasenaActual)
      e.contrasenaActual = 'Ingresa tu contraseña actual para cambiarla';
    if (form.nuevaContrasena && form.nuevaContrasena.length < 8)
      e.nuevaContrasena = 'Minimo 8 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { nombre: form.nombre, email: form.email };
      if (form.nuevaContrasena) {
        payload.contrasenaActual = form.contrasenaActual;
        payload.nuevaContrasena  = form.nuevaContrasena;
      }
      const updated = await updateProfile(payload);
      await updateUser(updated);
      setForm((f) => ({ ...f, contrasenaActual: '', nuevaContrasena: '' }));
      Alert.alert('Listo', 'Perfil actualizado correctamente');
    } catch (err) {
      const msg = err?.error ?? 'No se pudo actualizar el perfil';
      if (msg.toLowerCase().includes('contraseña actual')) {
        setErrors((e) => ({ ...e, contrasenaActual: 'La contraseña actual es incorrecta' }));
      } else if (msg.toLowerCase().includes('email')) {
        setErrors((e) => ({ ...e, email: 'Este email ya esta en uso' }));
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async (fromCamera) => {
    setShowPhotoPicker(false);
    try {
      let result;
      if (fromCamera) {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) { Alert.alert('Permiso denegado', 'Necesitas otorgar acceso a la camara'); return; }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) { Alert.alert('Permiso denegado', 'Necesitas otorgar acceso a la galeria'); return; }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.7,
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        setUploadingPhoto(true);
        try {
          const updated = await uploadProfilePhoto(result.assets[0]);
          await updateUser(updated);
        } catch {
          Alert.alert('Error', 'No se pudo subir la foto');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo acceder a la camara o galeria');
    }
  };

  const photoUrl = user?.fotoPerfil
    ? `${API_BASE_URL}/profile/photo/${user.fotoPerfil}`
    : null;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, isWide && styles.contentWide]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Avatar card */}
      <View style={[styles.avatarCard, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <TouchableOpacity
          onPress={() => setShowPhotoPicker(true)}
          onLongPress={() => photoUrl && setShowPhotoViewer(true)}
          activeOpacity={0.8}
          style={styles.avatarWrap}
        >
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarPhoto} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
              <Text style={[styles.avatarText, { color: meta.color }]}>{initials(user?.nombre)}</Text>
            </View>
          )}
          <View style={[styles.cameraOverlay, { backgroundColor: colors.primary }]}>
            {uploadingPhoto
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="camera" size={14} color="#fff" />
            }
          </View>
        </TouchableOpacity>

        <Text style={[styles.userName, { color: colors.textPrimary }]}>{user?.nombre}</Text>
        <View style={[styles.roleBadge, { backgroundColor: meta.bg }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={meta.color} />
          <Text style={[styles.roleText, { color: meta.color }]}>{meta.label}</Text>
        </View>
        <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
        <TouchableOpacity onPress={() => setShowPhotoPicker(true)} activeOpacity={0.7} style={styles.changePhotoBtn}>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>Cambiar foto</Text>
        </TouchableOpacity>
      </View>

      {/* Info form */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>INFORMACION PERSONAL</Text>
        <FormInput
          label="Nombre completo"
          required
          value={form.nombre}
          onChangeText={set('nombre')}
          placeholder="Tu nombre"
          icon="person-outline"
          error={errors.nombre}
        />
        <FormInput
          label="Correo electronico"
          required
          value={form.email}
          onChangeText={set('email')}
          placeholder="tu@correo.com"
          icon="mail-outline"
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
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
          value={form.contrasenaActual}
          onChangeText={set('contrasenaActual')}
          placeholder="••••••••"
          icon="lock-closed-outline"
          secureTextEntry={!showCurrent}
          rightIcon={showCurrent ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowCurrent((v) => !v)}
          error={errors.contrasenaActual}
        />
        <FormInput
          label="Nueva contraseña"
          value={form.nuevaContrasena}
          onChangeText={set('nuevaContrasena')}
          placeholder="Minimo 8 caracteres"
          icon="lock-open-outline"
          secureTextEntry={!showNew}
          rightIcon={showNew ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowNew((v) => !v)}
          error={errors.nuevaContrasena}
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

      {Platform.OS !== 'web' && (
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#ef4444' }]}
          onPress={() => Alert.alert('Cerrar sesion', '¿Seguro que deseas salir?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Salir', style: 'destructive', onPress: logout },
          ])}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#ef4444" />
          <Text style={styles.logoutText}>Cerrar sesion</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 40 }} />

      {/* Fullscreen photo viewer */}
      <Modal visible={showPhotoViewer} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPhotoViewer(false)}>
          <View style={styles.viewerOverlay}>
            <TouchableOpacity style={styles.viewerClose} onPress={() => setShowPhotoViewer(false)} activeOpacity={0.7}>
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {photoUrl && (
              <Image source={{ uri: photoUrl }} style={styles.viewerImage} resizeMode="contain" />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Photo picker modal — works on web, Android, iOS */}
      <Modal visible={showPhotoPicker} transparent animationType="slide">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPhotoPicker(false)}
        >
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Foto de perfil</Text>

            {photoUrl && (
              <TouchableOpacity
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
                onPress={() => { setShowPhotoPicker(false); setShowPhotoViewer(true); }}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="eye-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>Ver foto</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </TouchableOpacity>
            )}

            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={[styles.modalOption, { borderBottomColor: colors.border }]}
                onPress={() => pickImage(true)}
                activeOpacity={0.7}
              >
                <View style={[styles.modalOptionIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="camera-outline" size={22} color={colors.primary} />
                </View>
                <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>Tomar foto</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.border} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.modalOption, { borderBottomColor: colors.border }]}
              onPress={() => pickImage(false)}
              activeOpacity={0.7}
            >
              <View style={[styles.modalOptionIcon, { backgroundColor: colors.secondaryLight ?? colors.primaryLight }]}>
                <Ionicons name="image-outline" size={22} color={colors.secondary ?? colors.primary} />
              </View>
              <Text style={[styles.modalOptionText, { color: colors.textPrimary }]}>Elegir de galeria</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.border} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelOption, { backgroundColor: colors.background }]}
              onPress={() => setShowPhotoPicker(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1 },
  content:         { padding: 20 },
  contentWide:     { maxWidth: 600, alignSelf: 'center', width: '100%' },
  avatarCard:      { alignItems: 'center', borderRadius: 20, padding: 24, marginBottom: 16, gap: 8 },
  avatarWrap:      { position: 'relative', marginBottom: 4 },
  avatarPhoto:     { width: 90, height: 90, borderRadius: 45 },
  avatar:          { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  avatarText:      { fontSize: 32, fontWeight: '800' },
  cameraOverlay:   { position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  changePhotoBtn:  { marginTop: 4 },
  changePhotoText: { fontSize: 13, fontWeight: '600' },
  userName:        { fontSize: 20, fontWeight: '700' },
  roleBadge:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  roleText:        { fontSize: 12, fontWeight: '700' },
  userEmail:       { fontSize: 13 },
  card:            { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12, textTransform: 'uppercase' },
  hint:            { fontSize: 12, marginBottom: 12 },
  saveBtn:         { borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 14, height: 50, marginTop: 12 },
  logoutText:      { color: '#ef4444', fontSize: 15, fontWeight: '700' },
  // Photo viewer
  viewerOverlay:   { flex: 1, backgroundColor: '#000000ee', justifyContent: 'center', alignItems: 'center' },
  viewerClose:     { position: 'absolute', top: 48, right: 20, zIndex: 10, padding: 8 },
  viewerImage:     { width: '90%', height: '80%' },
  // Photo picker modal
  modalOverlay:    { flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  modalSheet:      { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle:     { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle:      { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  modalOption:     { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  modalOptionIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  modalOptionText: { flex: 1, fontSize: 15, fontWeight: '500' },
  cancelOption:    { borderRadius: 14, marginTop: 12, height: 50, justifyContent: 'center', alignItems: 'center' },
  cancelText:      { fontSize: 15, fontWeight: '600' },
});
