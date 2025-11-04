import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';

// Создаем главное почтовое отделение
export const store = configureStore({
  reducer: {
    filters: filtersReducer, // Отдел "фильтры" в нашем отделении
  },
});

// Типы для TypeScript (как документы на отделение)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;