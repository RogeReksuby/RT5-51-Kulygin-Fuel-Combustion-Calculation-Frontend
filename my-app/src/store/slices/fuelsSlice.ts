// store/slices/fuelsSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { Fuel } from '../../modules/types';

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

// store/slices/fuelsSlice.ts

// 1. Получить список топлива
// store/slices/fuelsSlice.ts

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
      
      // Удаление топлива
      .addCase(deleteFuel.fulfilled, (state, action) => {
        state.fuels = state.fuels.filter(fuel => fuel.id !== action.payload.id);
      });
  },
});

export const { 
  clearError, 
  clearCurrentFuel,
  setCurrentFuel 
} = fuelsSlice.actions;
export default fuelsSlice.reducer;