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

// Асинхронное действие для логина
export const loginUser = createAsyncThunk(
  'user/login',
  async (credentials: HandlerLoginRequest, { rejectWithValue }) => {
    try {
      const response = await api.api.usersLoginCreate(credentials);
      
      // Сохраняем токен
       const token = response.data.access_token || null;
      setAuthToken(token);
      localStorage.setItem('token', response.data.access_token || '');
      
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
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
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Логаут
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;