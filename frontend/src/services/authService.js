// src/services/authService.js
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      authService.removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Configuración de tokens
  TOKEN_KEY: 'mollyvet_token',
  
  // Guardar token
  setToken: (token) => {
    Cookies.set(authService.TOKEN_KEY, token, { 
      expires: 30, // 30 días
      secure: true,
      sameSite: 'strict'
    });
  },

  // Obtener token
  getToken: () => {
    return Cookies.get(authService.TOKEN_KEY);
  },

  // Eliminar token
  removeToken: () => {
    Cookies.remove(authService.TOKEN_KEY);
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/veterinarios/login', credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Registro
  register: async (userData) => {
    try {
      const response = await api.post('/veterinarios', userData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener perfil
  getProfile: async () => {
    try {
      const response = await api.get('/veterinarios/perfil');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirmar cuenta
  confirmAccount: async (token) => {
    try {
      const response = await api.get(`/veterinarios/confirmar/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Olvide password
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/veterinarios/olvide-password', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar token de reset
  verifyResetToken: async (token) => {
    try {
      const response = await api.get(`/veterinarios/olvide-password/${token}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Nuevo password
  resetPassword: async (token, password) => {
    try {
      const response = await api.post(`/veterinarios/olvide-password/${token}`, { password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reenviar verificación
  resendVerification: async (email) => {
    try {
      const response = await api.post('/veterinarios/reenviar-verificacion', { email });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!authService.getToken();
  }
};

export default api;