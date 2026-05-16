import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SHADOWS } from '../../constants/theme';

export default function LoginScreen() {
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Campos requeridos', 'Ingresa tu correo y contrasena');
    setLoading(true);
    try {
      await login(email, password);
    } catch {
      Alert.alert('Error de acceso', 'Correo o contrasena incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.logoBox}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="medical" size={36} color={colors.primary} />
        </View>
        <Text style={[styles.logoTitle, { color: colors.textPrimary }]}>ODO</Text>
        <Text style={[styles.logoSub, { color: colors.textSecondary }]}>Sistema Odontologico</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }, SHADOWS.md(isDark)]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Iniciar sesion</Text>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Correo electronico</Text>
          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
            focused === 'email' && { borderColor: colors.borderFocus, backgroundColor: colors.primaryLight },
          ]}>
            <Ionicons name="mail-outline" size={18} color={focused === 'email' ? colors.primary : colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
            />
          </View>
        </View>

        <View style={styles.fieldWrap}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Contrasena</Text>
          <View style={[
            styles.inputWrap,
            { backgroundColor: colors.inputBg, borderColor: colors.border },
            focused === 'password' && { borderColor: colors.borderFocus, backgroundColor: colors.primaryLight },
          ]}>
            <Ionicons name="lock-closed-outline" size={18} color={focused === 'password' ? colors.primary : colors.textMuted} />
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused('')}
            />
            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }, SHADOWS.md(isDark), loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Ingresar</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, justifyContent: 'center', padding: 24 },
  logoBox:       { alignItems: 'center', marginBottom: 32 },
  logoIcon:      { width: 72, height: 72, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  logoTitle:     { fontSize: 34, fontWeight: '800', letterSpacing: 2 },
  logoSub:       { fontSize: 13, marginTop: 4 },
  card:          { borderRadius: 20, padding: 24 },
  cardTitle:     { fontSize: 20, fontWeight: '700', marginBottom: 24 },
  fieldWrap:     { marginBottom: 18 },
  label:         { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, height: 50 },
  input:         { flex: 1, fontSize: 15 },
  button:        { borderRadius: 12, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 },
  buttonDisabled:{ opacity: 0.6 },
  buttonText:    { color: '#fff', fontSize: 16, fontWeight: '700' },
});
