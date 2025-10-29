import { type Fuel, type FuelFilter } from './types';
import { FUELS_MOCK } from './mockData';

const API_BASE = '/api';

export const getFuels = async (filters?: FuelFilter): Promise<Fuel[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.searchQuery) queryParams.append('search', filters.searchQuery);
    
    const response = await fetch(`${API_BASE}/fuels?${queryParams}`);
    
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to API error:', error);
    return filterMockFuels(FUELS_MOCK, filters);
  }
};

export const getFuelById = async (id: number): Promise<Fuel> => {
  try {
    const response = await fetch(`${API_BASE}/fuels/${id}`);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.warn('Using mock data due to API error:', error);
    return FUELS_MOCK.find(fuel => fuel.id === id) || FUELS_MOCK[0];
  }
};

export const addFuelToCombustion = async (fuelId: number): Promise<void> => {
  try {
    await fetch(`${API_BASE}/fuels/${fuelId}/add-to-comb`, {
      method: 'POST'
    });
  } catch (error) {
    console.warn('Failed to add fuel to combustion:', error);
  }
};

export const getCombustionCartCount = async (): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE}/combustions/cart-icon`);
    if (!response.ok) throw new Error('API request failed');
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