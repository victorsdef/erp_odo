import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Image, Platform, Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import FormInput from '../../components/forms/FormInput';
import { useSystemConfig } from '../../context/SystemConfigContext';
import { updateSystemConfig, uploadSystemLogo, systemLogoUrl } from '../../services/configService';

export default function SystemConfigScreen() {
  const { colors, isDark } = useTheme();
  const { config, setConfig } = useSystemConfig();

  const [nombre,         setNombre]         = useState(config.nombre ?? 'ODO Clinic');
  const [saving,         setSaving]         = useState(false);
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [error,          setError]          = useState('');

  const handleSave = async () => {
    if (!nombre.trim()) { setError('El nombre no puede estar vacío'); return; }
    setSaving(true);
    try {
      const updated = await updateSystemConfig(nombre.trim());
      setConfig(updated);
      Alert.alert('Listo', 'Configuracion actualizada');
    } catch {
      Alert.alert('Error', 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const pickLogo = async (fromCamera) => {
    setShowLogoPicker(false);
    try {
      let result;
      if (fromCamera) {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) return;
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      } else {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) return;
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      }
      if (!result.canceled && result.assets?.[0]) {
        setUploadingLogo(true);
        try {
          const updated = await uploadSystemLogo(result.assets[0]);
          setConfig(updated);
        } catch {
          Alert.alert('Error', 'No se pudo subir el logo');
        } finally {
          setUploadingLogo(false);
        }
      }
    } catch {
      Alert.alert('Error', 'No se pudo acceder a la galeria');
    }
  };

  const logoUri = systemLogoUrl(config.logoArchivo);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Logo section */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>LOGO DEL SISTEMA</Text>

        <View style={styles.logoRow}>
          <TouchableOpacity onPress={() => setShowLogoPicker(true)} activeOpacity={0.8} style={styles.logoWrap}>
            {uploadingLogo ? (
              <View style={[styles.logoBox, { backgroundColor: colors.primaryLight }]}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : logoUri ? (
              <Image source={{ uri: logoUri }} style={styles.logoBox} />
            ) : (
              <View style={[styles.logoBox, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="tooth-outline" size={32} color={colors.primary} />
              </View>
            )}
            <View style={[styles.editBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#fff" />
            </View>
          </TouchableOpacity>

          <View style={styles.logoHint}>
            <Text style={[styles.logoHintTitle, { color: colors.textPrimary }]}>Logo del sistema</Text>
            <Text style={[styles.logoHintSub, { color: colors.textMuted }]}>
              Aparece en el sidebar y como icono de la app. Recomendado: imagen cuadrada PNG.
            </Text>
            <TouchableOpacity onPress={() => setShowLogoPicker(true)} activeOpacity={0.7}>
              <Text style={[styles.changeLogoText, { color: colors.primary }]}>Cambiar logo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Name section */}
      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>NOMBRE DEL SISTEMA</Text>
        <FormInput
          label="Nombre de la clinica"
          required
          value={nombre}
          onChangeText={(v) => { setNombre(v); setError(''); }}
          placeholder="ODO Clinic"
          icon="business-outline"
          error={error}
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

      {/* Logo picker modal */}
      <Modal visible={showLogoPicker} transparent animationType="slide">
        <TouchableOpacity style={styles.pickerOverlay} activeOpacity={1} onPress={() => setShowLogoPicker(false)}>
          <View style={[styles.pickerSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.pickerHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.pickerTitle, { color: colors.textPrimary }]}>Seleccionar logo</Text>

            {Platform.OS !== 'web' && (
              <TouchableOpacity style={[styles.pickerOption, { borderBottomColor: colors.border }]} onPress={() => pickLogo(true)} activeOpacity={0.7}>
                <View style={[styles.pickerIcon, { backgroundColor: colors.primaryLight }]}>
                  <Ionicons name="camera-outline" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.pickerOptionText, { color: colors.textPrimary }]}>Tomar foto</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={[styles.pickerOption, { borderBottomColor: colors.border }]} onPress={() => pickLogo(false)} activeOpacity={0.7}>
              <View style={[styles.pickerIcon, { backgroundColor: colors.secondaryLight ?? colors.primaryLight }]}>
                <Ionicons name="image-outline" size={20} color={colors.secondary ?? colors.primary} />
              </View>
              <Text style={[styles.pickerOptionText, { color: colors.textPrimary }]}>Elegir de galeria</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.cancelBtn, { backgroundColor: colors.background }]} onPress={() => setShowLogoPicker(false)}>
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
  content:         { padding: 20, maxWidth: 600, alignSelf: 'center', width: '100%' },
  card:            { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionLabel:    { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 14, textTransform: 'uppercase' },
  logoRow:         { flexDirection: 'row', alignItems: 'center', gap: 16 },
  logoWrap:        { position: 'relative' },
  logoBox:         { width: 72, height: 72, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  editBadge:       { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  logoHint:        { flex: 1, gap: 4 },
  logoHintTitle:   { fontSize: 14, fontWeight: '700' },
  logoHintSub:     { fontSize: 12, lineHeight: 17 },
  changeLogoText:  { fontSize: 13, fontWeight: '600', marginTop: 4 },
  saveBtn:         { borderRadius: 14, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  saveBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  pickerOverlay:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#00000066', justifyContent: 'flex-end' },
  pickerSheet:     { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  pickerHandle:    { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  pickerTitle:     { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  pickerOption:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1 },
  pickerIcon:      { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  pickerOptionText:{ flex: 1, fontSize: 15, fontWeight: '500' },
  cancelBtn:       { borderRadius: 14, marginTop: 12, height: 48, justifyContent: 'center', alignItems: 'center' },
  cancelText:      { fontSize: 15, fontWeight: '600' },
});
