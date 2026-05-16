import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../constants/api';

export const login = async (email, password) => {
  const data = await api.post(ENDPOINTS.LOGIN, { email, password });
  await AsyncStorage.setItem('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['token', 'user']);
};

export const getMe = async () => {
  return api.get(ENDPOINTS.ME);
};
