import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';
import type { DsCombustionResponse } from '../../api/Api';
import type { RootState } from '../index';

// Интерфейс для данных корзины - ВНЕШНИЙ ИНТЕРФЕЙС ОСТАЕТСЯ ПРЕЖНИМ
interface CartData {
  app_id?: number;      // Внешнее имя - остается как было
  count?: number;       // Внешнее имя - остается как было
}

// Внутренний интерфейс для ответа API
interface ApiCartResponse {
  id_combustion?: number;
  items_count?: number;
}

// Состояние расчетов горения
interface CombustionsState {
  // Данные для иконки корзины
  cart: CartData;
  // Список всех расчетов пользователя
  combustions: DsCombustionResponse[];
  // Текущий расчет (черновик)
  currentCombustion: DsCombustionResponse | null;
  // Детали конкретного расчета
  combustionDetails: Record<string, any> | null;
  loading: boolean;
  error: string | null;
}

const initialState: CombustionsState = {
  cart: {
    app_id: undefined,
    count: undefined,
  },
  combustions: [],
  currentCombustion: null,
  combustionDetails: null,
  loading: false,
  error: null,
};

// ============ THUNKS ============

// 1. Получить данные для иконки корзины
export const getCombustionCartCount = createAsyncThunk(
  'combustions/getCartCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsCartIconList();
      const apiData = response.data as ApiCartResponse;
      
      // ПРЕОБРАЗУЕМ ДАННЫЕ ИЗ API ВО ВНУТРЕННИЙ ФОРМАТ
      return {
        app_id: apiData.id_combustion,
        count: apiData.items_count
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки корзины');
    }
  }
);

// 2. Добавить топливо в расчет
export const addFuelToCombustion = createAsyncThunk(
  'combustions/addFuel',
  async (fuelId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelsAddToCombCreate(fuelId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка добавления топлива');
    }
  }
);

// 3. Получить список расчетов
export const getCombustionsList = createAsyncThunk(
  'combustions/getList',
  async (
    params: {
      status?: "черновик" | "сформирован" | "завершён" | "отклонён" | "удалён";
      start_date?: string;
      end_date?: string;
    } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await api.api.combustionsList(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки расчетов');
    }
  }
);

// 4. Получить детали расчета по ID
export const getCombustionById = createAsyncThunk(
  'combustions/getById',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsDetail(id);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка загрузки расчета');
    }
  }
);

// 5. Удалить текущий расчет (черновик)
export const deleteCurrentCombustion = createAsyncThunk(
  'combustions/deleteCurrent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsDelete();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления расчета');
    }
  }
);

// 6. Обновить молярный объем расчета
export const updateCombustionMolarVolume = createAsyncThunk(
  'combustions/updateMolarVolume',
  async ({ id, molarVolume }: { id: number; molarVolume: number }, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsUpdate(id, { molar_volume: molarVolume });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления молярного объема');
    }
  }
);

// 7. Сформировать расчет (перевести из черновика в сформированный)
export const formCombustion = createAsyncThunk(
  'combustions/form',
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsFormUpdate(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка формирования расчета');
    }
  }
);

// 8. Модерировать расчет (завершить/отклонить)
export const moderateCombustion = createAsyncThunk(
  'combustions/moderate',
  async ({ id, isComplete }: { id: number; isComplete: boolean }, { rejectWithValue }) => {
    try {
      const response = await api.api.combustionsModerateUpdate(id, { is_complete: isComplete });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка модерации расчета');
    }
  }
);

// 9. Обновить объем топлива в расчете
export const updateFuelVolumeInCombustion = createAsyncThunk(
  'combustions/updateFuelVolume',
  async ({ fuelId, fuelVolume }: { fuelId: number; fuelVolume: number }, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelCombustionsUpdate({
        fuel_id: fuelId,
        fuel_volume: fuelVolume
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка обновления объема топлива');
    }
  }
);

// 10. Удалить топливо из расчета
export const deleteFuelFromCombustion = createAsyncThunk(
  'combustions/deleteFuel',
  async (fuelId: number, { rejectWithValue }) => {
    try {
      const response = await api.api.fuelCombustionsDelete({ fuel_id: fuelId });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.description || 'Ошибка удаления топлива из расчета');
    }
  }
);

const combustionsSlice = createSlice({
  name: 'combustions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCart: (state) => {
      state.cart = { app_id: undefined, count: undefined };
    },
    clearCombustionDetails: (state) => {
      state.combustionDetails = null;
    },
    setCurrentCombustion: (state, action) => {
      state.currentCombustion = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Получение данных корзины
      .addCase(getCombustionCartCount.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCombustionCartCount.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload; // Данные уже преобразованы
      })
      .addCase(getCombustionCartCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Добавление топлива
      .addCase(addFuelToCombustion.pending, (state) => {
        state.loading = true;
      })
      .addCase(addFuelToCombustion.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addFuelToCombustion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Получение списка расчетов
      .addCase(getCombustionsList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCombustionsList.fulfilled, (state, action) => {
        state.loading = false;
        // Бэкенд возвращает Record<string, DsCombustionResponse[]>
        // Преобразуем в плоский массив
        const data = action.payload as Record<string, DsCombustionResponse[]>;
        state.combustions = Object.values(data).flat();
      })
      .addCase(getCombustionsList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Получение деталей расчета
      .addCase(getCombustionById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCombustionById.fulfilled, (state, action) => {
        state.loading = false;
        state.combustionDetails = action.payload.data;
      })
      .addCase(getCombustionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Удаление расчета
      .addCase(deleteCurrentCombustion.fulfilled, (state) => {
        state.currentCombustion = null;
        state.cart = { app_id: undefined, count: undefined };
      });
  },
});

export const { 
  clearError, 
  clearCart, 
  clearCombustionDetails,
  setCurrentCombustion 
} = combustionsSlice.actions;

export default combustionsSlice.reducer;

// Селекторы - ВОЗВРАЩАЮТ ВНЕШНИЕ ИМЕНА
export const selectCartData = (state: RootState) => state.combustions.cart;
export const selectCartCount = (state: RootState) => state.combustions.cart.count || 0;
export const selectCartId = (state: RootState) => state.combustions.cart.app_id;
export const selectCombustions = (state: RootState) => state.combustions.combustions;
export const selectCombustionDetails = (state: RootState) => state.combustions.combustionDetails;
export const selectCombustionsLoading = (state: RootState) => state.combustions.loading;
export const selectCombustionsError = (state: RootState) => state.combustions.error;