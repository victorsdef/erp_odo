import React from 'react';
import { View, StyleSheet } from 'react-native';
import Skeleton, { SkeletonRow } from './Skeleton';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardSkeleton() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Skeleton width="50%" height={28} style={{ marginBottom: 6 }} />
      <Skeleton width="30%" height={14} style={{ marginBottom: 28 }} />

      <SkeletonRow style={{ marginBottom: 16 }}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={12} />
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={12} />
        </View>
      </SkeletonRow>

      <SkeletonRow style={{ marginBottom: 28 }}>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={12} />
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={40} height={40} borderRadius={20} style={{ marginBottom: 8 }} />
          <Skeleton width="70%" height={22} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={12} />
        </View>
      </SkeletonRow>

      <Skeleton width="45%" height={18} style={{ marginBottom: 12 }} />

      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.apptRow, { backgroundColor: colors.surface }]}>
          <Skeleton width={42} height={42} borderRadius={8} />
          <View style={{ flex: 1, gap: 6 }}>
            <Skeleton width="55%" height={13} />
            <Skeleton width="35%" height={11} />
          </View>
          <Skeleton width={72} height={26} borderRadius={13} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  statCard:  { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  apptRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 12, marginBottom: 10 },
});
