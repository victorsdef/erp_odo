import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

export default function FormInput({
  label, value, onChangeText, placeholder,
  icon, keyboardType = 'default', secureTextEntry,
  multiline, numberOfLines = 1, editable = true,
  onPress, rightIcon, error,
}) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <View style={styles.wrap}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <Container
        {...containerProps}
        style={[
          styles.input,
          { backgroundColor: colors.inputBg, borderColor: colors.border },
          multiline && styles.inputMulti,
          focused && { borderColor: colors.borderFocus, backgroundColor: colors.primaryLight },
          error && { borderColor: colors.danger },
          !editable && styles.inputDisabled,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={17}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[styles.text, { color: colors.textPrimary }, multiline && { height: numberOfLines * 22 }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          multiline={multiline}
          editable={editable && !onPress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          numberOfLines={multiline ? numberOfLines : 1}
        />
        {rightIcon && (
          <Ionicons name={rightIcon} size={17} color={colors.textMuted} />
        )}
      </Container>
      {error && <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:         { marginBottom: 16 },
  label:        { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  input:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 14, minHeight: 48, gap: 10 },
  inputMulti:   { alignItems: 'flex-start', paddingVertical: 12 },
  inputDisabled:{ opacity: 0.6 },
  icon:         { flexShrink: 0 },
  text:         { flex: 1, fontSize: 15 },
  error:        { fontSize: 12, marginTop: 4 },
});
