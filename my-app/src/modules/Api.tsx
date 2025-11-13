// src/modules/Api.tsx

import { type Fuel, type FuelFilter } from './types';
import { FUELS_MOCK } from './mockData';
import { API_BASE_URL } from '../target_config';

// Импортируем плагин HTTP из Tauri
import { fetch as tauriFetch } from '@tauri-apps/plugin-http';

// Убираем стандартный fetch — будем использовать tauriFetch

export const getFuels = async (filters?: FuelFilter): Promise<Fuel[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.searchQuery) queryParams.append('title', filters.searchQuery);

    // Используем tauriFetch вместо window.fetch
    const response = await tauriFetch(`${API_BASE_URL}/fuels?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();

    if (result && Array.isArray(result.data)) {
      return result.data;
    } else {
      console.warn('Unexpected API response format, using mock data');
      return filterMockFuels(FUELS_MOCK, filters);
    }
  } catch (error) {
    console.warn('Using mock data due to API error:', error);
    return filterMockFuels(FUELS_MOCK, filters);
  }
};

export const getFuelById = async (id: number): Promise<Fuel> => {
  try {
    const response = await tauriFetch(`${API_BASE_URL}/fuels/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.warn('Using mock data due to API error:', error);
    return FUELS_MOCK.find(fuel => fuel.id === id) || FUELS_MOCK[0];
  }
};

export const getCombustionCartCount = async (): Promise<number> => {
  try {
    const response = await tauriFetch(`${API_BASE_URL}/combustions/cart-icon`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.count || 0;
  } catch (error) {
    console.warn('Failed to get cart count:', error);
    return 0;
  }
};

const filterMockFuels = (fuels: Fuel[], filters?: FuelFilter): Fuel[] => {
  let filtered = fuels.filter(fuel => !fuel.is_delete);

  if (filters?.searchQuery) {
    filtered = filtered.filter(fuel =>
      fuel.title.toLowerCase().includes(filters.searchQuery!.toLowerCase())
    );
  }

  return filtered;
};