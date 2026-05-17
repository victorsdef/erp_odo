import { Platform } from 'react-native';
import api from './api';
import { API_BASE_URL } from '../constants/api';

export const getSystemConfig = () => api.get('/admin/config');

export const updateSystemConfig = (nombre) => api.put('/admin/config', { nombre });

export const uploadSystemLogo = async (asset) => {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const response = await fetch(asset.uri);
    const blob     = await response.blob();
    const ext      = (asset.mimeType ?? 'image/png').split('/')[1] || 'png';
    formData.append('logo', new File([blob], `logo.${ext}`, { type: asset.mimeType ?? 'image/png' }));
    return api.post('/admin/config/logo', formData, { headers: { 'Content-Type': undefined } });
  } else {
    formData.append('logo', {
      uri:  asset.uri,
      type: asset.mimeType ?? 'image/png',
      name: asset.fileName ?? 'logo.png',
    });
    return api.post('/admin/config/logo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
};

export const systemLogoUrl = (filename) =>
  filename ? `${API_BASE_URL}/admin/config/logo/${filename}` : null;
