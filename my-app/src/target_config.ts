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

export const transformImageUrl = (originalUrl: string) => {
  return originalUrl.replace('http://127.0.0.1:9000', IMAGE_BASE_URL);
};

export const API_BASE_URL = 'https://52a775198ecc6c.lhr.life/api'; // Прямой URL к твоему бекенду

export const IMAGE_BASE_URL = 'https://52a775198ecc6c.lhr.life/minio';

export const BASE_PATH = '/web_rip_front';