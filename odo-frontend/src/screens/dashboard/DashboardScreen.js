import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Bienvenido, {user?.name || 'Usuario'}</Text>
      <Text style={styles.role}>{user?.role}</Text>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.background },
  welcome: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, marginTop: 20 },
  role: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 32 },
  logout: { backgroundColor: COLORS.danger, borderRadius: 8, padding: 14, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600' },
});
