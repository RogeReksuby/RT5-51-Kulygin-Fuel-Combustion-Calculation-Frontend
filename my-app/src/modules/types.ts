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