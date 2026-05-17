import api from './api';

export const getUsuarios    = ()        => api.get('/admin/users');
export const crearUsuario   = (data)    => api.post('/admin/users', data);
export const actualizarUsuario = (id, data) => api.put(`/admin/users/${id}`, data);
export const alternarActivo = (id)      => api.patch(`/admin/users/${id}/toggle-active`);
