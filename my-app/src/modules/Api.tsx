import { type Fuel, type FuelFilter } from './types';
import { FUELS_MOCK } from './mockData';

const API_BASE = '/api';

export const getFuels = async (filters?: FuelFilter): Promise<Fuel[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (filters?.searchQuery) queryParams.append('title', filters.searchQuery);
    
    
    const response = await fetch(`/api/fuels?${queryParams}`);
    
    if (!response.ok) throw new Error('API request failed');
    
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
    const response = await fetch(`/api/fuels/${id}`);
    if (!response.ok) throw new Error('API request failed');
    const result = await response.json();
    return result.data; 
  } catch (error) {
    console.warn('Using mock data due to API error:', error);
    return FUELS_MOCK.find(fuel => fuel.id === id) || FUELS_MOCK[0];
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