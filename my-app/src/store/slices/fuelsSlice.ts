// store/slices/fuelsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { Fuel } from '../../modules/types';
import type { RootState } from '../../store';

// Состояние топлива
interface FuelsState {
  fuels: Fuel[];
  currentFuel: Fuel | null;
  loading: boolean;
  error: string | null;
}

const initialState: FuelsState = {
  fuels: [],
  currentFuel: null,
  loading: false,
  error: null,
};

// ============ THUNKS ============

// 1. Получить список топлива
export const getFuelsList = createAsyncThunk(
  'fuels/getList',
  async (
    params: {
      title?: string;
    } = {}, // Параметры фильтрации, по умолчанию пустой объект
    { rejectWithValue }
  ) => {
    try {
      const response = await api.api.fuelsList(params);
      // Бэкенд возвращает { data: Fuel[], count: number }
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки топлива');
    }
  }
);

// 2. Получить топливо по ID
export const getFuelById = createAsyncThunk(
  'fuels/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsDetail(id);
      // Бэкенд возвращает { data: Fuel }
      return response.data.data || null;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки топлива');
    }
  }
);

// 3. Создать новое топливо (только для модераторов)
export const createFuel = createAsyncThunk(
  'fuels/create',
  async (fuelData: {
    title: string;
    heat: number;
    density?: number;
    full_desc?: string;
    is_gas?: boolean;
    molar_mass?: number;
    short_desc?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsCreate(fuelData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка создания топлива');
    }
  }
);

// 4. Обновить топливо (только для модераторов)
export const updateFuel = createAsyncThunk(
  'fuels/update',
  async ({ id, fuelData }: { 
    id: number; 
    fuelData: {
      card_image?: string;
      full_desc?: string;
      heat?: number;
      is_gas?: boolean;
      molar_mass?: number;
      short_desc?: string;
      title?: string;
    }
  }, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsUpdate(id, fuelData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления топлива');
    }
  }
);

// 5. Удалить топливо (только для модераторов)
export const deleteFuel = createAsyncThunk(
  'fuels/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsDelete(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления топлива');
    }
  }
);

// 6. Загрузить изображение для топлива (только для модераторов)
export const uploadFuelImage = createAsyncThunk(
  'fuels/uploadImage',
  async ({ id, image }: { id: number; image: File }, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsImageCreate(id, { image });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки изображения');
    }
  }
);

const fuelsSlice = createSlice({
  name: 'fuels',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentFuel: (state) => {
      state.currentFuel = null;
    },
    setCurrentFuel: (state, action) => {
      state.currentFuel = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение списка топлива
      .addCase(getFuelsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFuelsList.fulfilled, (state, action) => {
        state.loading = false;
        state.fuels = action.payload;
      })
      .addCase(getFuelsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Получение топлива по ID
      .addCase(getFuelById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getFuelById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentFuel = action.payload;
      })
      .addCase(getFuelById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Создание топлива
      .addCase(createFuel.pending, (state) => {
        state.loading = true;
      })
      .addCase(createFuel.fulfilled, (state, action) => {
        state.loading = false;
        // Добавляем новое топливо в список
        if (action.payload?.data) {
          state.fuels.push(action.payload.data);
        }
      })
      .addCase(createFuel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Обновление топлива
      .addCase(updateFuel.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateFuel.fulfilled, (state, action) => {
        state.loading = false;
        // Обновляем топливо в списке
        if (action.payload?.data) {
          const index = state.fuels.findIndex(fuel => fuel.id === action.payload.data.id);
          if (index !== -1) {
            state.fuels[index] = action.payload.data;
          }
        }
      })
      .addCase(updateFuel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Удаление топлива
      .addCase(deleteFuel.fulfilled, (state, action) => {
        // Удаляем топливо из списка (или помечаем как удаленное)
        const index = state.fuels.findIndex(fuel => fuel.id === action.payload.id);
        if (index !== -1) {
          // Мягкое удаление - помечаем флагом
          state.fuels[index] = { ...state.fuels[index], is_delete: true };
        }
      })
      .addCase(deleteFuel.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

// ============ SELECTORS ============

export const selectFuels = (state: RootState) => state.fuels.fuels;
export const selectCurrentFuel = (state: RootState) => state.fuels.currentFuel;
export const selectFuelsLoading = (state: RootState) => state.fuels.loading;
export const selectFuelsError = (state: RootState) => state.fuels.error;

// Селектор для активных (не удаленных) видов топлива
export const selectActiveFuels = (state: RootState) => 
  state.fuels.fuels.filter(fuel => !fuel.is_delete);

// Селектор для удаленных видов топлива
export const selectDeletedFuels = (state: RootState) => 
  state.fuels.fuels.filter(fuel => fuel.is_delete);

export const { 
  clearError, 
  clearCurrentFuel,
  setCurrentFuel 
} = fuelsSlice.actions;
export default fuelsSlice.reducer;