import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { API_BASE_URL } from '../constants/api';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useBreakpoint } from '../utils/responsive';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PatientListScreen from '../screens/patients/PatientListScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import PatientFormScreen from '../screens/patients/PatientFormScreen';
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentFormScreen from '../screens/appointments/AppointmentFormScreen';
import OdontogramScreen from '../screens/odontogram/OdontogramScreen';
import InvoiceListScreen from '../screens/billing/InvoiceListScreen';
import InvoiceFormScreen from '../screens/billing/InvoiceFormScreen';
import AdminScreen from '../screens/admin/AdminScreen';
import UserFormScreen from '../screens/admin/UserFormScreen';
import TreatmentScreen from '../screens/admin/TreatmentScreen';
import AuditLogScreen from '../screens/admin/AuditLogScreen';
import SystemConfigScreen from '../screens/admin/SystemConfigScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ThemeToggle() {
  const { colors, isDark, toggleTheme } = useTheme();
  return (
    <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16, padding: 4 }} activeOpacity={0.7}>
      <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={22} color={colors.primary} />
    </TouchableOpacity>
  );
}

function UserHeaderLeft() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const initials = (name = '') => name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 4 }}>
      {user?.fotoPerfil ? (
        <Image
          source={{ uri: `${API_BASE_URL}/profile/photo/${user.fotoPerfil}` }}
          style={{ width: 32, height: 32, borderRadius: 16 }}
        />
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary + '33', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: '800', color: colors.primary }}>{initials(user?.nombre)}</Text>
        </View>
      )}
      <Text style={{ fontSize: 14, fontWeight: '700', color: colors.textPrimary }}>
        {user?.nombre?.split(' ')[0]}
      </Text>
    </View>
  );
}

function headerOptions(colors) {
  return {
    headerStyle:      { backgroundColor: colors.surface },
    headerTintColor:  colors.textPrimary,
    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
    headerShadowVisible: false,
    headerBackTitle:  '',
    headerRight:      () => <ThemeToggle />,
  };
}

function PatientsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={headerOptions(colors)}>
      <Stack.Screen name="PatientList"  component={PatientListScreen}  options={{ title: 'Pacientes', headerLeft: () => <UserHeaderLeft /> }} />
      <Stack.Screen name="PatientDetail"component={PatientDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="PatientForm"  component={PatientFormScreen}  options={{ title: 'Paciente' }} />
      <Stack.Screen name="Odontogram"   component={OdontogramScreen}   options={{ title: 'Odontograma' }} />
    </Stack.Navigator>
  );
}

function BillingStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={headerOptions(colors)}>
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Facturacion', headerLeft: () => <UserHeaderLeft /> }} />
      <Stack.Screen name="InvoiceForm" component={InvoiceFormScreen} options={{ title: 'Nueva factura' }} />
    </Stack.Navigator>
  );
}

function AppointmentsStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={headerOptions(colors)}>
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Agenda', headerLeft: () => <UserHeaderLeft /> }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Nueva cita' }} />
    </Stack.Navigator>
  );
}

function DashboardStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: true, title: 'Mi perfil', ...headerOptions(colors) }}
      />
    </Stack.Navigator>
  );
}

function AdminStack() {
  const { colors } = useTheme();
  return (
    <Stack.Navigator screenOptions={headerOptions(colors)}>
      <Stack.Screen name="AdminMain"   component={AdminScreen}     options={{ headerShown: false }} />
      <Stack.Screen name="UserForm"    component={UserFormScreen}  options={({ route }) => ({
        title: route.params?.user ? 'Editar usuario' : 'Nuevo usuario',
      })} />
      <Stack.Screen name="Treatments"    component={TreatmentScreen}    options={{ title: 'Tratamientos' }} />
      <Stack.Screen name="AuditLog"      component={AuditLogScreen}     options={{ title: 'Auditoria' }} />
      <Stack.Screen name="SystemConfig"  component={SystemConfigScreen} options={{ title: 'Configuracion del sistema' }} />
    </Stack.Navigator>
  );
}

function TabIcon({ name, focused, color }) {
  const { colors } = useTheme();
  return (
    <View style={styles.tabIconWrap}>
      {focused && <View style={[styles.tabIconPill, { backgroundColor: colors.primaryLight }]} />}
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

function TabLabel({ label, focused }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.textSecondary }]}>
      {label}
    </Text>
  );
}

function BottomTabsLayout() {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const isAdmin    = user?.rol === 'ADMIN';
  const isPatient  = user?.rol === 'PATIENT';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor:  colors.tabBarBorder,
          borderTopWidth:  1,
          height:          Platform.OS === 'ios' ? 82 : 62,
          paddingBottom:   Platform.OS === 'ios' ? 22 : 6,
          paddingTop:      6,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon:  ({ focused, color }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel label="Inicio" focused={focused} />,
        }}
      />
      {!isPatient && (
        <Tab.Screen
          name="Patients"
          component={PatientsStack}
          options={{
            tabBarIcon:  ({ focused, color }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} color={color} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Pacientes" focused={focused} />,
          }}
        />
      )}
      <Tab.Screen
        name="Appointments"
        component={AppointmentsStack}
        options={{
          tabBarIcon:  ({ focused, color }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} focused={focused} color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel label={isPatient ? 'Mis Citas' : 'Agenda'} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Billing"
        component={BillingStack}
        options={{
          tabBarIcon:  ({ focused, color }) => <TabIcon name={focused ? 'receipt' : 'receipt-outline'} focused={focused} color={color} />,
          tabBarLabel: ({ focused }) => <TabLabel label={isPatient ? 'Mis Pagos' : 'Cobros'} focused={focused} />,
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminStack}
          options={{
            tabBarIcon:  ({ focused, color }) => <TabIcon name={focused ? 'shield-checkmark' : 'shield-checkmark-outline'} focused={focused} color={color} />,
            tabBarLabel: ({ focused }) => <TabLabel label="Admin" focused={focused} />,
          }}
        />
      )}
    </Tab.Navigator>
  );
}

function SidebarLayout() {
  const { colors } = useTheme();
  const { user }   = useAuth();
  const { isDesktop } = useBreakpoint();
  const isAdmin    = user?.rol === 'ADMIN';
  const isPatient  = user?.rol === 'PATIENT';
  const [activeRoute, setActiveRoute] = useState('Dashboard');

  const SCREENS = {
    Dashboard:    <DashboardStack />,
    ...(!isPatient && { Patients: <PatientsStack /> }),
    Appointments: <AppointmentsStack />,
    Billing:      <BillingStack />,
    Profile:      <ProfileScreen />,
    ...(isAdmin && { Admin: <AdminStack /> }),
  };

  return (
    <View style={[styles.sidebarLayout, { backgroundColor: colors.background }]}>
      <Sidebar
        activeRoute={activeRoute}
        onNavigate={setActiveRoute}
        collapsed={!isDesktop}
        isAdmin={isAdmin}
      />
      <View style={[styles.sidebarContent, { backgroundColor: colors.background }]}>
        {SCREENS[activeRoute]}
      </View>
    </View>
  );
}

export default function MainNavigator() {
  const { isLarge } = useBreakpoint();
  if (isLarge) return <SidebarLayout />;
  return <BottomTabsLayout />;
}

const styles = StyleSheet.create({
  tabIconWrap:    { width: 48, height: 28, alignItems: 'center', justifyContent: 'center' },
  tabIconPill:    { position: 'absolute', width: 48, height: 28, borderRadius: 10 },
  tabLabel:       { fontSize: 11, fontWeight: '600', marginTop: 2 },
  sidebarLayout:  { flex: 1, flexDirection: 'row' },
  sidebarContent: { flex: 1 },
});
