import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { COLORS } from '../constants/colors';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import PatientListScreen from '../screens/patients/PatientListScreen';
import PatientDetailScreen from '../screens/patients/PatientDetailScreen';
import PatientFormScreen from '../screens/patients/PatientFormScreen';
import AppointmentListScreen from '../screens/appointments/AppointmentListScreen';
import AppointmentFormScreen from '../screens/appointments/AppointmentFormScreen';
import OdontogramScreen from '../screens/odontogram/OdontogramScreen';
import InvoiceListScreen from '../screens/billing/InvoiceListScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function PatientsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientList" component={PatientListScreen} options={{ title: 'Pacientes' }} />
      <Stack.Screen name="PatientDetail" component={PatientDetailScreen} options={{ title: 'Detalle' }} />
      <Stack.Screen name="PatientForm" component={PatientFormScreen} options={{ title: 'Paciente' }} />
      <Stack.Screen name="Odontogram" component={OdontogramScreen} options={{ title: 'Odontograma' }} />
    </Stack.Navigator>
  );
}

function AppointmentsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AppointmentList" component={AppointmentListScreen} options={{ title: 'Agenda' }} />
      <Stack.Screen name="AppointmentForm" component={AppointmentFormScreen} options={{ title: 'Cita' }} />
    </Stack.Navigator>
  );
}

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Inicio' }} />
      <Tab.Screen name="Patients" component={PatientsStack} options={{ title: 'Pacientes' }} />
      <Tab.Screen name="Appointments" component={AppointmentsStack} options={{ title: 'Agenda' }} />
      <Tab.Screen name="Billing" component={InvoiceListScreen} options={{ title: 'Facturación' }} />
    </Tab.Navigator>
  );
}
