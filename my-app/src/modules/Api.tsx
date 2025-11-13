// src/modules/Api.tsx
import { type Fuel, type FuelFilter } from './types';
import { FUELS_MOCK } from './mockData';
import { API_BASE_URL } from '../target_config';

// Проверяем, работаем ли мы в Tauri
const isTauri = typeof window !== 'undefined' && window.__TAURI__ !== undefined;

export const getFuels = async (filters?: FuelFilter): Promise<Fuel[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.searchQuery) queryParams.append('title', filters.searchQuery);

    let response: Response;

    if (isTauri) {
      // Для Tauri используем плагин HTTP
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(`${API_BASE_URL}/fuels?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      // Для веба используем стандартный fetch
      response = await fetch(`${API_BASE_URL}/fuels?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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
    let response: Response;

    if (isTauri) {
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(`${API_BASE_URL}/fuels/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      response = await fetch(`${API_BASE_URL}/fuels/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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
    let response: Response;

    if (isTauri) {
      const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http');
      response = await tauriFetch(`${API_BASE_URL}/combustions/cart-icon`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } else {
      response = await fetch(`${API_BASE_URL}/combustions/cart-icon`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

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