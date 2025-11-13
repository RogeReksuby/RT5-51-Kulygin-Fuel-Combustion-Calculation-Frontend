// src/config/api.ts
import { API_BASE_URL } from '../target_config';

export const getApiBaseUrl = (): string => {
  return API_BASE_URL+'/api';
};

export const getTauriApiBaseUrl = (): string => {
  return 'http://192.168.1.172:8080/api';
};
