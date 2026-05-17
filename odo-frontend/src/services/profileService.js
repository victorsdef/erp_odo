import api from './api';

export const getProfile    = ()     => api.get('/profile');
export const updateProfile = (data) => api.put('/profile', data);

export const uploadProfilePhoto = (asset) => {
  const formData = new FormData();
  formData.append('foto', {
    uri:  asset.uri,
    type: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? 'profile.jpg',
  });
  return api.post('/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
