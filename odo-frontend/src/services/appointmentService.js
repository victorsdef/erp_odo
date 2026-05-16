import api from './api';
import { ENDPOINTS } from '../constants/api';

export const getAppointments = () => api.get(ENDPOINTS.APPOINTMENTS);
export const getAppointmentById = (id) => api.get(ENDPOINTS.APPOINTMENT_BY_ID(id));
export const getAppointmentsByPatient = (patientId) => api.get(ENDPOINTS.APPOINTMENTS_BY_PATIENT(patientId));
export const createAppointment = (data) => api.post(ENDPOINTS.APPOINTMENTS, data);
export const updateAppointment = (id, data) => api.put(ENDPOINTS.APPOINTMENT_BY_ID(id), data);
export const deleteAppointment = (id) => api.delete(ENDPOINTS.APPOINTMENT_BY_ID(id));
