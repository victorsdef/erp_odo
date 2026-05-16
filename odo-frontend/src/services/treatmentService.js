import api from './api';
import { ENDPOINTS } from '../constants/api';

export const getActiveTreatments = () =>
  api.get(ENDPOINTS.TREATMENTS);

export const getAllTreatments = () =>
  api.get(ENDPOINTS.TREATMENTS_ALL);

export const createTreatment = (data) =>
  api.post(ENDPOINTS.TREATMENTS_ALL, data);

export const updateTreatment = (id, data) =>
  api.put(ENDPOINTS.TREATMENT_BY_ID(id), data);

export const toggleTreatmentActive = (id) =>
  api.patch(ENDPOINTS.TREATMENT_TOGGLE(id));

export const deleteTreatment = (id) =>
  api.delete(ENDPOINTS.TREATMENT_BY_ID(id));
