import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton, { SkeletonRow } from './Skeleton';
import { useTheme } from '../../context/ThemeContext';

function PatientCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <SkeletonRow>
        <Skeleton width={44} height={44} borderRadius={22} />
        <View style={styles.info}>
          <Skeleton width="60%" height={14} />
          <Skeleton width="40%" height={11} style={{ marginTop: 6 }} />
        </View>
        <Skeleton width={60} height={24} borderRadius={12} />
      </SkeletonRow>
    </View>
  );
}

export default function PatientListSkeleton({ count = 7 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <PatientCardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginBottom: 10 },
  info: { flex: 1, gap: 4 },
});
