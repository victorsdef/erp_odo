import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton, { SkeletonRow } from './Skeleton';
import { useTheme } from '../../context/ThemeContext';

function AppointmentCardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <SkeletonRow style={{ marginBottom: 10 }}>
        <Skeleton width={36} height={36} borderRadius={8} />
        <View style={styles.info}>
          <Skeleton width="50%" height={13} />
          <Skeleton width="30%" height={11} style={{ marginTop: 5 }} />
        </View>
        <Skeleton width={80} height={26} borderRadius={13} />
      </SkeletonRow>
      <Skeleton width="90%" height={11} />
    </View>
  );
}

export default function AppointmentListSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <AppointmentCardSkeleton key={i} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, padding: 14, marginBottom: 10 },
  info: { flex: 1, gap: 4 },
});
