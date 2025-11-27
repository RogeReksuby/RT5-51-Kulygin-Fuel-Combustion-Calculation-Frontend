import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { DsCombustionResponse } from '../../api/Api';

// Интерфейс для данных корзины
interface CartData {
  app_id?: number;
  count?: number;
}

// Состояние заявок
interface ApplicationsState {
  // Данные для иконки корзины
  cart: CartData;
  // Список всех заявок пользователя
  applications: DsCombustionResponse[];
  // Текущая заявка (черновик)
  currentApplication: DsCombustionResponse | null;
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  cart: {
    app_id: undefined,
    count: undefined,
  },
  applications: [],
  currentApplication: null,
  loading: false,
  error: null,
};

// Получить данные для иконки корзины
export const getCartData = createAsyncThunk(
  'applications/getCartData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsCartIconList();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины');
    }
  }
);

// Добавить топливо в заявку
export const addFuelToApplication = createAsyncThunk(
  'applications/addFuel',
  async (fuelId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsAddToCombCreate(fuelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления топлива');
    }
  }
);

// Получить список заявок пользователя
export const getApplicationsList = createAsyncThunk(
  'applications/getList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsList();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки заявок');
    }
  }
);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.cart = { app_id: undefined, count: undefined };
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение данных корзины
      .addCase(getCartData.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCartData.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(getCartData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Добавление топлива
      .addCase(addFuelToApplication.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFuelToApplication.fulfilled, (state) => {
        state.loading = false;
        // После добавления обновляем данные корзины
        // В реальном приложении здесь можно обновить count
      })
      .addCase(addFuelToApplication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Получение списка заявок
      .addCase(getApplicationsList.fulfilled, (state, action) => {
        state.applications = Object.values(action.payload).flat();
      });
  },
});

export const { clearError, clearCart } = applicationsSlice.actions;
export default applicationsSlice.reducer;