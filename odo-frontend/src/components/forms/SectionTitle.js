import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SectionTitle({ title }) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.line, { backgroundColor: colors.border }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 8 },
  line: { flex: 1, height: 1 },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase' },
});
