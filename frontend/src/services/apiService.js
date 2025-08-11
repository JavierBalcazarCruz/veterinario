// src/services/apiService.js - NUEVO ARCHIVO PARA EVITAR IMPORTACIONES CIRCULARES
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'mollyvet_token';

// ✅ Funciones de token separadas para evitar circulares
const tokenUtils = {
  get: () => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
      return null;
    }
  },
  
  set: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('💾 Token guardado');
    } catch (error) {
      console.error('❌ Error al guardar token:', error);
    }
  },
  
  remove: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar token:', error);
    }
  }
};

// ✅ Instancia de API configurada
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.get();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔐 Token agregado al request');
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// ✅ Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitoso:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🚫 Token inválido, removiendo...');
      tokenUtils.remove();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ✅ Exportar la instancia de API y utils
export { api as default, tokenUtils };