import api from './api';
import { ENDPOINTS } from '../constants/api';

export const getPatients = () => api.get(ENDPOINTS.PATIENTS);
export const getPatientById = (id) => api.get(ENDPOINTS.PATIENT_BY_ID(id));
export const createPatient = (data) => api.post(ENDPOINTS.PATIENTS, data);
export const updatePatient = (id, data) => api.put(ENDPOINTS.PATIENT_BY_ID(id), data);
export const deletePatient = (id) => api.delete(ENDPOINTS.PATIENT_BY_ID(id));
