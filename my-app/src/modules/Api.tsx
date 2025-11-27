import { api } from '../api';
import type { Fuel } from './types';

interface FuelsResponse {
  data: Fuel[];
  count: number;
}

interface FuelResponse {
  data: Fuel;
}

interface CartResponse {
  id_combustion: number;
  items_count: number;
}

export const getFuels = async (params: { searchQuery?: string }): Promise<Fuel[]> => {
  try {
    const response = await api.api.fuelsList({ title: params.searchQuery });
    
    // Бэкенд возвращает { data: Fuel[], count: number }
    const fuelsResponse = response.data as FuelsResponse;
    
    return fuelsResponse.data || [];
  } catch (error) {
    console.error('Ошибка загрузки топлива:', error);
    return [];
  }
};

export const getFuelById = async (id: number): Promise<Fuel | null> => {
  try {
    const response = await api.api.fuelsDetail(id);
    
    // Бэкенд возвращает { data: Fuel }
    const fuelResponse = response.data as FuelResponse;
    
    return fuelResponse.data || null;
  } catch (error) {
    console.error('Ошибка загрузки топлива:', error);
    return null;
  }
};

export const getCombustionCartCount = async (): Promise<{count?: number, app_id?: number}> => {
  try {
    const response = await api.api.combustionsCartIconList();
    
    // Бэкенд возвращает { id_combustion: number, items_count: number }
    const cartResponse = response.data as CartResponse;
    
    return {
      app_id: cartResponse.id_combustion,
      count: cartResponse.items_count
    };
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error);
    return { count: 0, app_id: undefined };
  }
};