import api from './api';
import { ENDPOINTS } from '../constants/api';

export const getInvoices = () =>
  api.get(ENDPOINTS.INVOICES);

export const getInvoiceById = (id) =>
  api.get(ENDPOINTS.INVOICE_BY_ID(id));

export const getInvoicesByPatient = (patientId) =>
  api.get(ENDPOINTS.INVOICES_BY_PATIENT(patientId));

export const createInvoice = (data) =>
  api.post(ENDPOINTS.INVOICES, data);

export const registerPayment = (id, data) =>
  api.post(ENDPOINTS.INVOICE_PAYMENTS(id), data);

export const cancelInvoice = (id) =>
  api.patch(ENDPOINTS.INVOICE_CANCEL(id));

export const deleteInvoice = (id) =>
  api.delete(ENDPOINTS.INVOICE_BY_ID(id));
