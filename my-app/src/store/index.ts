import { configureStore } from '@reduxjs/toolkit';
import filtersReducer from './slices/filtersSlice';
import userReducer from './slices/userSlice';
import applicationsReducer from './slices/applicationsSlice';

// Создаем главное почтовое отделение
export const store = configureStore({
  reducer: {
    filters: filtersReducer,     // Отдел фильтров
    user: userReducer,           // Отдел пользователей (НОВЫЙ)
    applications: applicationsReducer, // Отдел заявок (НОВЫЙ)
  },
});

// Типы для TypeScript (как документы на отделение)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;