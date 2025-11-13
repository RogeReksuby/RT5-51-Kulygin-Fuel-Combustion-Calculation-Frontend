// src/target_config.ts
const target_tauri = true

export const API_BASE_URL = target_tauri 
  ? 'http://192.168.1.172:8080/api'  // Для Tauri - прямой IP
  //? 'http://localhost:8080'
  : '/api';                       // Для веб - proxy

export const IMAGE_BASE_URL = target_tauri
  ? 'http://192.168.1.172:9000'  // Для Tauri - прямой IP
  //? 'http://localhost:9000'
  : '';                          // Для веб - относительные пути

export const BASE_PATH = target_tauri 
  ? '' 
  : '/web_rip_front';
