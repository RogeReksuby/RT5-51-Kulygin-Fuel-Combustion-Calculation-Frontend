import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api, setAuthToken } from '../../api';
import type { DsUsers, HandlerLoginRequest } from '../../api/Api';

interface UserState {
  user: DsUsers | null;
  isAuthenticated: boolean;
  isModerator: boolean;  // Заменяем role на isModerator
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isModerator: false,  // По умолчанию не модератор
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
      
      // Возвращаем user и определяем isModerator
      const userData = response.data.user || null;
      const isModerator = userData?.is_moderator || userData?.is_moderator || false; // Проверяем разные варианты названия поля
      
      console.log('👤 Пользователь isModerator:', isModerator);
      
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
      
      // Определяем isModerator из ответа
      const userData = response.data;
      const isModerator = userData?.is_moderator || userData?.isModerator || false;
      
      console.log('Проверка авторизации, isModerator:', isModerator);
      
      return {
        user: userData,
        isModerator: isModerator
      };
    } catch (error: any) {
      console.error('checkAuth: ошибка:', error);
      setAuthToken(null);
      localStorage.removeItem('token');
      return rejectWithValue('Токен устарел');
    }
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (userData: {
    login: string;
    password: string;
    name: string;
  }, { rejectWithValue }) => {
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
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (profileData: {
    name?: string;
    login?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.api.usersProfileUpdate(profileData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления профиля');
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
      state.isModerator = false;  // Сбрасываем isModerator
      state.loading = false;
      state.error = null;
      setAuthToken(null);
    },
    // Редюсер для обновления isModerator (если нужно вручную)
    setIsModerator: (state, action) => {
      state.isModerator = action.payload;
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
        state.isModerator = action.payload.isModerator;  // Сохраняем isModerator
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Логин успешен, isModerator:', action.payload.isModerator);
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isModerator = false;  // Сбрасываем isModerator при ошибке
      })
      
      // Логаут
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isModerator = false;  // Сбрасываем isModerator
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
        state.user = action.payload.user;
        state.isModerator = action.payload.isModerator;  // Сохраняем isModerator
        state.isAuthenticated = true;
        state.error = null;
        console.log('✅ Авторизация проверена, isModerator:', action.payload.isModerator);
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.isModerator = false;  // Сбрасываем isModerator
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.isModerator = action.payload.isModerator;
      state.isAuthenticated = true;
      state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
      });
    },
});

export const { clearError, resetAuthState, setIsModerator } = userSlice.actions;
export default userSlice.reducer;