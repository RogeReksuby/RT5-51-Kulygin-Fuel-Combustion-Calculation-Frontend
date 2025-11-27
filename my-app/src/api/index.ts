import { API_BASE_URL } from '../target_config';
import { Api } from './Api';

// Создаем инстанс API с настройками
export const api = new Api({
  baseURL: API_BASE_URL, // ваш бэкенд
});

// Функция для установки токена авторизации
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.instance.defaults.headers.common['Authorization'];
  }
};