// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../api';
import type { DsUsers, HandlerLoginRequest } from '../../api/Api';

interface UserState {
  user: DsUsers | null;
  isAuthenticated: boolean;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
  isAppInitialized: boolean; // Добавляем флаг инициализации
}

// Типы для ответа от API при успешном логине/регистрации
interface AuthSuccessResponse {
  user: DsUsers | null;
  isModerator: boolean;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isModerator: false,
  loading: false,
  error: null,
  isAppInitialized: false, // По умолчанию приложение не инициализировано
};

// Асинхронное действие для логина
export const loginUser = createAsyncThunk<
  AuthSuccessResponse,
  HandlerLoginRequest,
  { rejectValue: string }
>(
  'user/login',
  async (credentials: HandlerLoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      
      // Сохраняем токен в localStorage
      const token = response.data.access_token || null;
      setAuthToken(token);
      localStorage.setItem('token', token || '');
      
      // Определяем isModerator
      const userData = response.data.user || null;
      const isModerator = userData?.is_moderator || false;
      
      console.log('✅ Логин успешен, токен сохранен, isModerator:', isModerator);
      
      return {
        user: userData,
        isModerator: isModerator
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка авторизации');
    }
  }
);

// Выход из системы
export const logoutUser = createAsyncThunk<
  null,
  void,
  { rejectValue: string }
>(
  'user/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.api.usersLogoutCreate();
      // При выходе удаляем токен из localStorage
      setAuthToken(null);
      localStorage.removeItem('token');
      return null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка выхода');
    }
  }
);

// Проверка авторизации при ЗАГРУЗКЕ ПРИЛОЖЕНИЯ
export const checkInitialAuth = createAsyncThunk<
  AuthSuccessResponse,
  void,
  { rejectValue: string }
>(
  'user/checkInitialAuth',
  async (_, { rejectWithValue }) => {
    // Только для первоначальной загрузки приложения
    const token = localStorage.getItem('token');
    console.log('🔄 Проверка авторизации при загрузке приложения: токен', token ? 'есть' : 'нет');
    
    // Всегда сбрасываем авторизацию при ПЕРВОЙ загрузке
    setAuthToken(null);
    
    // Всегда возвращаем ошибку - это заставит пользователя войти заново
    return rejectWithValue('Требуется вход после перезагрузки');
  }
);

// Нормальная проверка авторизации (для использования в компонентах)
export const verifyAuth = createAsyncThunk<
  AuthSuccessResponse,
  void,
  { rejectValue: string }
>(
  'user/verifyAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('verifyAuth: токен не найден');
        return rejectWithValue('No token');
      }

      setAuthToken(token);
      const response = await api.api.usersProfileList();
      
      // Определяем isModerator из ответа
      const userData = response.data;
      const isModerator = userData?.is_moderator || false;
      
      console.log('✅ Проверка авторизации успешна, isModerator:', isModerator);
      
      return {
        user: userData,
        isModerator: isModerator
      };
    } catch (error: any) {
      console.error('verifyAuth: ошибка:', error);
      setAuthToken(null);
      return rejectWithValue('Токен устарел');
    }
  }
);

// Регистрация нового пользователя
export const registerUser = createAsyncThunk<
  AuthSuccessResponse,
  {
    login: string;
    password: string;
    name: string;
  },
  { rejectValue: string }
>(
  'user/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.api.usersRegisterCreate(userData);
      
      // Сохраняем токен
      const token = response.data.access_token || null;
      setAuthToken(token);
      localStorage.setItem('token', token || '');
      
      // Определяем isModerator
      const userDataResponse = response.data.user || null;
      const isModerator = userDataResponse?.is_moderator || false;
      
      console.log('👤 Регистрация успешна, isModerator:', isModerator);
      
      return {
        user: userDataResponse,
        isModerator: isModerator
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка регистрации');
    }
  }
);

// Обновление профиля пользователя
export const updateUserProfile = createAsyncThunk<
  any,
  {
    name?: string;
    login?: string;
  },
  { rejectValue: string }
>(
  'user/updateProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      // Устанавливаем токен перед запросом
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
      
      const response = await api.api.usersProfileUpdate(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления профиля');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Редюсер для принудительного сброса состояния (без удаления токена)
    resetAuthState: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isModerator = false;
      state.loading = false;
      state.error = null;
      // НЕ удаляем токен из localStorage!
      setAuthToken(null);
    },
    // Редюсер для обновления isModerator (если нужно вручную)
    setIsModerator: (state, action) => {
      state.isModerator = action.payload;
    },
    // Редюсер для установки флага инициализации
    setAppInitialized: (state) => {
      state.isAppInitialized = true;
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
        state.user = action.payload.user;
        state.isModerator = action.payload.isModerator;
        state.isAuthenticated = true;
        state.error = null;
        state.isAppInitialized = true; // Приложение инициализировано после логина
        console.log('✅ Пользователь авторизован, состояние обновлено');
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isModerator = false;
      })
      
      // Логаут
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isModerator = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Проверка авторизации при ЗАГРУЗКЕ - ВСЕГДА завершается с ошибкой
      .addCase(checkInitialAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInitialAuth.fulfilled, (state, action) => {
        // Эта ветка никогда не выполнится при текущей логике
        state.loading = false;
        state.user = action.payload.user;
        state.isModerator = action.payload.isModerator;
        state.isAuthenticated = true;
        state.isAppInitialized = true;
        state.error = null;
        console.log('Авторизация при загрузке успешна (не должно происходить)');
      })
      .addCase(checkInitialAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isModerator = false;
        state.isAppInitialized = true; // Важно: приложение инициализировано!
        state.error = null;
        console.log('✅ Авторизация сброшена при загрузке приложения (перезагрузка страницы)');
      })
      
      // Нормальная проверка авторизации
      .addCase(verifyAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isModerator = action.payload.isModerator;
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Авторизация проверена успешно');
      })
      .addCase(verifyAuth.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isModerator = false;
        state.error = null;
        console.log('❌ Авторизация недействительна');
      })
      
      // Регистрация
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isModerator = action.payload.isModerator;
        state.isAuthenticated = true;
        state.isAppInitialized = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обновление профиля
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (state.user) {
          state.user = { ...state.user, ...action.payload };
        }
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearError, 
  resetAuthState, 
  setIsModerator,
  setAppInitialized 
} = userSlice.actions;

export default userSlice.reducer;