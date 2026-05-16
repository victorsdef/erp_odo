import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { route: 'Dashboard',    label: 'Inicio',      icon: 'home-outline',                   iconActive: 'home' },
  { route: 'Patients',     label: 'Pacientes',   icon: 'people-outline',                 iconActive: 'people' },
  { route: 'Appointments', label: 'Agenda',      icon: 'calendar-outline',               iconActive: 'calendar' },
  { route: 'Billing',      label: 'Cobros',      icon: 'receipt-outline',                iconActive: 'receipt' },
];

const ADMIN_ITEM = { route: 'Admin', label: 'Admin', icon: 'shield-checkmark-outline', iconActive: 'shield-checkmark' };

export default function Sidebar({ activeRoute, onNavigate, collapsed = false, isAdmin = false }) {
  const { colors, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.sidebar, width: collapsed ? 72 : 220 }]}>
      {/* Logo area */}
      <View style={styles.logoArea}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="tooth-outline" size={22} color="#fff" />
        </View>
        {!collapsed && (
          <Text style={[styles.logoText, { color: colors.sidebarText }]}>ODO Clinic</Text>
        )}
      </View>

      <View style={styles.divider} />

      {/* Nav items */}
      <View style={styles.nav}>
        {[...NAV_ITEMS, ...(isAdmin ? [ADMIN_ITEM] : [])].map((item) => {
          const isActive = activeRoute === item.route;
          return (
            <TouchableOpacity
              key={item.route}
              style={[
                styles.navItem,
                isActive && { backgroundColor: colors.sidebarActive + '22' },
                collapsed && styles.navItemCollapsed,
              ]}
              onPress={() => onNavigate(item.route)}
              activeOpacity={0.75}
            >
              <View style={[styles.iconWrap, isActive && { backgroundColor: colors.sidebarActive + '33' }]}>
                <Ionicons
                  name={isActive ? item.iconActive : item.icon}
                  size={20}
                  color={isActive ? colors.sidebarActive : colors.sidebarText}
                />
              </View>
              {!collapsed && (
                <Text style={[
                  styles.navLabel,
                  { color: isActive ? colors.sidebarActive : colors.sidebarText },
                  isActive && styles.navLabelActive,
                ]}>
                  {item.label}
                </Text>
              )}
              {isActive && !collapsed && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.sidebarActive }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom: theme toggle */}
      <View style={styles.bottom}>
        <View style={styles.divider} />
        <TouchableOpacity style={[styles.navItem, collapsed && styles.navItemCollapsed]} onPress={toggleTheme} activeOpacity={0.75}>
          <View style={styles.iconWrap}>
            <Ionicons
              name={isDark ? 'sunny-outline' : 'moon-outline'}
              size={20}
              color={colors.sidebarText}
            />
          </View>
          {!collapsed && (
            <Text style={[styles.navLabel, { color: colors.sidebarText }]}>
              {isDark ? 'Modo claro' : 'Modo oscuro'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar:       { height: '100%', paddingVertical: 16, paddingHorizontal: 8 },
  logoArea:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, paddingVertical: 8, marginBottom: 8 },
  logoIcon:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  logoText:      { fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  divider:       { height: 1, backgroundColor: '#ffffff18', marginVertical: 8, marginHorizontal: 4 },
  nav:           { flex: 1, gap: 2 },
  navItem:       { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 10 },
  navItemCollapsed: { justifyContent: 'center', paddingHorizontal: 0 },
  iconWrap:      { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '600' },
  navLabelActive:{ fontWeight: '700' },
  activeIndicator: { width: 4, height: 4, borderRadius: 2 },
  bottom:        { paddingBottom: 8 },
});
