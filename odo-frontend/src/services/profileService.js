import { Platform } from 'react-native';
import api from './api';

export const getProfile    = ()     => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

export const uploadProfilePhoto = async (asset) => {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    // En web, asset.uri es un data: URL — convertir a Blob/File real
    const response = await fetch(asset.uri);
    const blob     = await response.blob();
    const ext      = (asset.mimeType ?? 'image/jpeg').split('/')[1] || 'jpg';
    formData.append('foto', new File([blob], `profile.${ext}`, { type: asset.mimeType ?? 'image/jpeg' }));
    // Content-Type: undefined elimina el default 'application/json' del api instance
    // y deja que el browser lo ponga como multipart/form-data con el boundary correcto
    return api.post('/profile/photo', formData, {
      headers: { 'Content-Type': undefined },
    });
  } else {
    // En nativo React Native, usar el objeto { uri, type, name }
    formData.append('foto', {
      uri:  asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? 'profile.jpg',
    });
    return api.post('/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};
