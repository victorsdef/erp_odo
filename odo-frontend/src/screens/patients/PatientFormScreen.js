import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

export default function PatientFormScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Formulario de Paciente</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  text: { fontSize: 18, color: COLORS.textPrimary },
});
