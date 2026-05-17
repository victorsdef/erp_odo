import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../constants/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import { getUsuarios, alternarActivo } from '../../services/adminService';

const ROLE_META = {
  ADMIN:        { label: 'Admin',         color: '#8B5CF6', bg: '#F5F3FF' },
  DENTIST:      { label: 'Dentista',      color: '#2563EB', bg: '#EFF6FF' },
  RECEPTIONIST: { label: 'Recepcionista', color: '#10B981', bg: '#ECFDF5' },
  PATIENT:      { label: 'Paciente',      color: '#F59E0B', bg: '#FFFBEB' },
};

function initials(name = '') {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

export default function AdminScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getUsuarios()
      .then(setUsers)
      .catch(() => Alert.alert('Error', 'No se pudieron cargar los usuarios'))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(load);

  const handleToggle = (user) => {
    const action = user.activo ? 'desactivar' : 'activar';
    Alert.alert(
      `¿${action.charAt(0).toUpperCase() + action.slice(1)} usuario?`,
      `${user.nombre} quedará ${user.activo ? 'inactivo' : 'activo'}.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: user.activo ? 'destructive' : 'default',
          onPress: () =>
            alternarActivo(user.id)
              .then((updated) =>
                setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
              )
              .catch(() => Alert.alert('Error', 'No se pudo cambiar el estado')),
        },
      ]
    );
  };

  const byRole = (role) => users.filter((u) => u.rol === role);
  const active = users.filter((u) => u.activo).length;

  const STATS = [
    { label: 'Dentistas',      count: byRole('DENTIST').length,      color: colors.primary,   bg: colors.primaryLight,   icon: 'medical' },
    { label: 'Recepcionistas', count: byRole('RECEPTIONIST').length, color: colors.secondary, bg: colors.secondaryLight, icon: 'headset' },
    { label: 'Activos',        count: active,                        color: colors.purple,    bg: colors.purpleLight,    icon: 'checkmark-circle' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Panel de Admin</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gestión de usuarios</Text>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('UserForm', { user: null })}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <View style={styles.statsRow}>
            {STATS.map((s) => (
              <View key={s.label} style={[styles.statCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <Text style={[styles.statCount, { color: s.color }]}>{s.count}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Quick access */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Herramientas</Text>
          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
              onPress={() => navigation.navigate('Treatments')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name="medical" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.textPrimary }]}>Tratamientos</Text>
              <Text style={[styles.toolSub, { color: colors.textMuted }]}>Gestionar catalogo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
              onPress={() => navigation.navigate('AuditLog')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIcon, { backgroundColor: colors.purpleLight }]}>
                <Ionicons name="shield-checkmark" size={22} color={colors.purple} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.textPrimary }]}>Auditoria</Text>
              <Text style={[styles.toolSub, { color: colors.textMuted }]}>Historial de acciones</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toolsRow}>
            <TouchableOpacity
              style={[styles.toolCard, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
              onPress={() => navigation.navigate('SystemConfig')}
              activeOpacity={0.8}
            >
              <View style={[styles.toolIcon, { backgroundColor: colors.warningLight }]}>
                <Ionicons name="settings-outline" size={22} color={colors.warning} />
              </View>
              <Text style={[styles.toolLabel, { color: colors.textPrimary }]}>Configuracion</Text>
              <Text style={[styles.toolSub, { color: colors.textMuted }]}>Nombre y logo del sistema</Text>
            </TouchableOpacity>
          </View>

          {/* User list */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Usuarios ({users.length})
          </Text>

          {users.map((user) => {
            const meta = ROLE_META[user.rol] ?? ROLE_META.RECEPTIONIST;
            return (
              <View key={user.id} style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}>
                {/* Avatar */}
                {user.fotoPerfil ? (
                  <Image
                    source={{ uri: `${API_BASE_URL}/profile/photo/${user.fotoPerfil}` }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: meta.bg }]}>
                    <Text style={[styles.avatarText, { color: meta.color }]}>{initials(user.nombre)}</Text>
                  </View>
                )}

                {/* Info */}
                <View style={styles.info}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                      {user.nombre}
                    </Text>
                    <View style={[styles.roleBadge, { backgroundColor: meta.bg }]}>
                      <Text style={[styles.roleText, { color: meta.color }]}>{meta.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.email, { color: colors.textSecondary }]} numberOfLines={1}>
                    {user.email}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: user.activo ? colors.secondary : colors.danger }]} />
                    <Text style={[styles.statusText, { color: colors.textMuted }]}>
                      {user.activo ? 'Activo' : 'Inactivo'}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primaryLight }]}
                    onPress={() => navigation.navigate('UserForm', { user })}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="pencil" size={15} color={colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: user.activo ? colors.dangerLight : colors.secondaryLight }]}
                    onPress={() => handleToggle(user)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={user.activo ? 'ban-outline' : 'checkmark-circle-outline'}
                      size={15}
                      color={user.activo ? colors.danger : colors.secondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          <View style={{ height: 32 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1 },
  title:       { fontSize: 22, fontWeight: '700' },
  subtitle:    { fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  addBtn:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  addBtnText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  statsRow:    { flexDirection: 'row', gap: 10, padding: 20 },
  statCard:    { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  statIcon:    { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statCount:   { fontSize: 24, fontWeight: '800' },
  statLabel:   { fontSize: 11, fontWeight: '500', textAlign: 'center' },
  sectionTitle:{ fontSize: 15, fontWeight: '700', marginHorizontal: 20, marginBottom: 10, marginTop: 4 },
  toolsRow:    { flexDirection: 'row', gap: 12, marginHorizontal: 20, marginBottom: 20 },
  toolCard:    { flex: 1, borderRadius: 14, padding: 16, gap: 6 },
  toolIcon:    { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  toolLabel:   { fontSize: 14, fontWeight: '700' },
  toolSub:     { fontSize: 11 },
  card:        { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14, marginHorizontal: 20, marginBottom: 10 },
  avatar:      { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 16, fontWeight: '800' },
  info:        { flex: 1, gap: 3 },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:        { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  roleBadge:   { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  roleText:    { fontSize: 10, fontWeight: '700' },
  email:       { fontSize: 12, },
  statusRow:   { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 1 },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  statusText:  { fontSize: 11 },
  actions:     { gap: 8 },
  actionBtn:   { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
});
