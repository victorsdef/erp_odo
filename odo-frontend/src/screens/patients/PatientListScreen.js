import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, TextInput, RefreshControl, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';
import PatientListSkeleton from '../../components/common/PatientCardSkeleton';
import { getPatients } from '../../services/patientService';

const AVATAR_PALETTE = ['#2563EB','#10B981','#8B5CF6','#F59E0B','#EF4444'];

function avatarColor(name) {
  return AVATAR_PALETTE[(name || '').charCodeAt(0) % AVATAR_PALETTE.length];
}

export default function PatientListScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const [patients,   setPatients]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search,     setSearch]     = useState('');
  const initialized = useRef(false);

  const fetchPatients = useCallback(async () => {
    if (!initialized.current) setLoading(true);
    else setRefreshing(true);
    try {
      setPatients(await getPatients());
    } catch {
      setPatients([]);
      if (!initialized.current)
        Alert.alert('Error', 'No se pudieron cargar los pacientes.');
    } finally {
      initialized.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchPatients(); }, [fetchPatients]));

  const filtered = patients.filter((p) =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(search.toLowerCase()) ||
    (p.dni || '').includes(search)
  );

  const renderItem = ({ item }) => {
    const color    = avatarColor(item.nombre);
    const initials = `${item.nombre?.[0] ?? ''}${item.apellido?.[0] ?? ''}`.toUpperCase();
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.sm(isDark)]}
        onPress={() => navigation.navigate('PatientDetail', { id: item.id })}
        activeOpacity={0.75}
      >
        <View style={[styles.avatar, { backgroundColor: color + '22' }]}>
          <Text style={[styles.avatarText, { color }]}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{item.nombre} {item.apellido}</Text>
          <View style={styles.meta}>
            {item.telefono ? (
              <>
                <Ionicons name="call-outline" size={11} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.telefono}</Text>
              </>
            ) : item.email ? (
              <>
                <Ionicons name="mail-outline" size={11} color={colors.textMuted} />
                <Text style={[styles.metaText, { color: colors.textMuted }]}>{item.email}</Text>
              </>
            ) : (
              <Text style={[styles.metaText, { color: colors.textMuted }]}>Sin contacto</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.border} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.searchWrap, { backgroundColor: colors.surface, borderColor: colors.border }, SHADOWS.sm(isDark)]}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.textPrimary }]}
          placeholder="Buscar por nombre o DNI..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
        {Platform.OS === 'web' && (
          <TouchableOpacity
            onPress={fetchPatients}
            activeOpacity={0.7}
            style={[styles.refreshBtn, { backgroundColor: colors.primaryLight }]}
          >
            <Ionicons name="refresh-outline" size={17} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {!loading && (
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {filtered.length} paciente{filtered.length !== 1 ? 's' : ''}
        </Text>
      )}

      {loading ? (
        <PatientListSkeleton count={7} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchPatients}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                {search ? 'Sin resultados para la busqueda' : 'No se encontraron pacientes'}
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }, SHADOWS.lg(colors)]}
        onPress={() => navigation.navigate('PatientForm')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1 },
  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, margin: 16, marginBottom: 8, paddingHorizontal: 14, height: 46, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 14 },
  refreshBtn:  { width: 30, height: 30, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  count:       { fontSize: 12, paddingHorizontal: 20, marginBottom: 8, fontWeight: '500' },
  list:        { paddingHorizontal: 16, paddingBottom: 100 },
  card:        { borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar:      { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  avatarText:  { fontSize: 16, fontWeight: '700' },
  info:        { flex: 1 },
  name:        { fontSize: 15, fontWeight: '600' },
  meta:        { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText:    { fontSize: 12 },
  emptyBox:    { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText:   { fontSize: 14 },
  fab:         { position: 'absolute', bottom: 24, right: 20, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});
