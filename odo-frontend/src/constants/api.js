export const API_BASE_URL = 'http://localhost:8080/api';

export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',

  // Patients
  PATIENTS: '/patients',
  PATIENT_BY_ID: (id) => `/patients/${id}`,

  // Appointments
  APPOINTMENTS: '/appointments',
  APPOINTMENT_BY_ID: (id) => `/appointments/${id}`,
  APPOINTMENTS_BY_PATIENT: (id) => `/appointments/patient/${id}`,

  // Odontogram
  ODONTOGRAM: (patientId) => `/odontogram/${patientId}`,
  ODONTOGRAM_TOOTH: (patientId, toothNumber) => `/odontogram/${patientId}/tooth/${toothNumber}`,

  // Billing
  INVOICES: '/invoices',
  INVOICE_BY_ID: (id) => `/invoices/${id}`,
  INVOICES_BY_PATIENT: (id) => `/invoices/patient/${id}`,
};
