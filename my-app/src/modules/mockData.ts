import { type Fuel } from './types';
import defaultImage from "../assets/DefaultImage.jpg";

export const FUELS_MOCK: Fuel[] = [
  {
    id: 1,
    title: "Природный газ",
    heat: 35.0,
    molar_mass: 16.04,
    density: 0.68,
    card_image: defaultImage,
    short_desc: "Основной компонент - метан",
    full_desc: "Природный газ состоит преимущественно из метана...",
    is_gas: true,
    is_delete: false
  },
  {
    id: 2,
    title: "Бензин",
    heat: 44.0,
    molar_mass: 114.23,
    density: 0.75,
    card_image: "http://127.0.0.1:9000/ripimages/petrol.jpg",
    short_desc: "Жидкое топливо для ДВС",
    full_desc: "Бензин - легковоспламеняющаяся жидкость...",
    is_gas: false,
    is_delete: false
  }
  
];