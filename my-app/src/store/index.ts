import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import userReducer from './slices/userSlice';
import combustionsReducer from './slices/applicationsSlice';
import fuelsReducer from './slices/fuelsSlice';

// Создаем главное почтовое отделение
export const store = configureStore({
  reducer: {
    filters: filtersReducer,     // Отдел фильтров
    user: userReducer,           // Отдел пользователей (НОВЫЙ)
    combustions: combustionsReducer, // Отдел заявок (НОВЫЙ)
    fuels: fuelsReducer,
  },
});

// Типы для TypeScript (как документы на отделение)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;