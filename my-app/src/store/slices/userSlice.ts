import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../api';
import type { DsUsers, HandlerLoginRequest } from '../../api/Api';

interface UserState {
  user: DsUsers | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

// Флаг для определения первой загрузки
let isFirstLoad = true;

// Асинхронное действие для логина
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: HandlerLoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      
      // Сохраняем токен
      const token = response.data.access_token || null;
      setAuthToken(token);
      
      console.log('🔐 Токен получен:', token);
      console.log('💾 Сохраняем в localStorage...');
      
      localStorage.setItem('token', token || '');
      
      return response.data.user || null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка авторизации');
    }
  }
);

// Выход из системы
export const logoutUser = createAsyncThunk(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.api.usersLogoutCreate();
      setAuthToken(null);
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка выхода');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'user/checkAuth',
  async (_, { rejectWithValue }) => {
    // Если это первая загрузка - ВСЕГДА возвращаем ошибку
    if (isFirstLoad) {
      isFirstLoad = false;
      console.log('🔄 Первая загрузка приложения - сбрасываем авторизацию');
      localStorage.removeItem('token'); // Очищаем токен
      setAuthToken(null); // Сбрасываем токен в axios
      return rejectWithValue('Требуется вход после перезагрузки');
    }
    
    // Для последующих проверок (при переходе между страницами) работаем как обычно
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('checkAuth: токен не найден');
        return rejectWithValue('No token');
      }

      setAuthToken(token);
      const response = await api.api.usersProfileList();
      
      return response.data;
    } catch (error: any) {
      console.error('checkAuth: ошибка:', error);
      setAuthToken(null);
      localStorage.removeItem('token');
      return rejectWithValue('Токен устарел');
    }
  }
);

// Функция для принудительного сброса флага (на случай если нужно перезагрузить)
export const resetFirstLoad = () => {
  isFirstLoad = true;
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Редюсер для принудительного сброса состояния при перезагрузке
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      setAuthToken(null);
    }
  },
  extraReducers: (builder) => {
    builder
      // Логин
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
      // Логаут
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Проверка авторизации
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, resetAuthState } = userSlice.actions;
export default userSlice.reducer;