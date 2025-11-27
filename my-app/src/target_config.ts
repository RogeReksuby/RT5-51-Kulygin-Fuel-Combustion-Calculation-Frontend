// src/target_config.ts
// 
//const target_tauri = true

// export const API_BASE_URL = target_tauri 
//   ? 'https://192.168.1.173:8443/api'  // Для Tauri - прямой IP
//   //? 'http://localhost:8080'
//   : '/api';                       // Для веб - proxy

// export const IMAGE_BASE_URL = target_tauri
//   ? 'http://192.168.1.173:9000'  // Для Tauri - прямой IP
//   //? 'http://localhost:9000'
//   : '';                          // Для веб - относительные пути

// export const BASE_PATH = target_tauri 
//   ? '/web_rip_front/' 
//   : '/web_rip_front/';

//const target_tauri = false; // Для GitHub Pages

export const BASE_URL = 'https://95a1821d1af05e.lhr.life'
export const API_BASE_URL = BASE_URL; // Прямой URL к твоему бекенду
export const IMAGE_BASE_URL = BASE_URL + '/minio';
export const BASE_PATH = '/web_rip_front';

export const transformImageUrl = (imagePath: string | null | undefined): string | null => {
  // Проверяем что imagePath существует и это строка
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }

  // Если путь уже полный URL, возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Если путь начинается с /, убираем его
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;

  return `${IMAGE_BASE_URL}/${cleanPath}`;
};