export interface Fuel {
  id: number;
  title: string;
  heat: number;
  molar_mass: number;
  density: number;
  card_image: string;
  short_desc: string;
  full_desc: string;
  is_gas: boolean;
  is_delete: boolean;
}

export interface FuelFilter {
  searchQuery?: string;
}

// Добавь в конец файла:

export interface ServiceFormData {
  title: string;
  heat: number;
  molar_mass?: number;
  density?: number;
  short_desc?: string;
  full_desc?: string;
  is_gas?: boolean;
}

export interface Service extends ServiceFormData {
  id: number;
  card_image?: string;
  is_delete: boolean;
}