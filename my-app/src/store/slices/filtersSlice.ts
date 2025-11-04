import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';

// Какие данные храним в отделе фильтров
interface FiltersState {
  searchQuery: string;     // Поисковый запрос
}

// Начальное состояние - пустые ящики
const initialState: FiltersState = {
  searchQuery: '',
};

// Создаем отдел фильтров
const filtersSlice = createSlice({
  name: 'filters', // Название отдела
  initialState,    // Начальное состояние
  reducers: {
    // Почтальон, который меняет поисковый запрос
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload; // action.payload = что написано в письме
    },
        
    // Почтальон, который очищает все фильтры
    resetFilters: (state) => {
      state.searchQuery = '';
    },
  },
});

// Создаем "читателей" - они могут читать данные из ящиков
export const useSearchQuery = () =>
  useSelector((state: { filters: FiltersState }) => state.filters.searchQuery);


// Создаем "почтовые марки" - способы отправки писем
export const {
  setSearchQuery,
  resetFilters,
} = filtersSlice.actions;

// Экспортируем почтальонов
export default filtersSlice.reducer;