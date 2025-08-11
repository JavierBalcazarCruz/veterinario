// src/services/authService.js - VERSIÓN CORREGIDA
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// ✅ CORREGIDO: Usar localStorage en lugar de cookies para mejor compatibilidad
const TOKEN_KEY = 'mollyvet_token';

// ✅ Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ CORREGIDO: Interceptor mejorado para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
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

// ✅ CORREGIDO: Interceptor mejorado para manejar respuestas y errores
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response exitoso:', response.status);
    return response;
  },
  (error) => {
    console.error('❌ Error en response:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.log('🚫 Token inválido, removiendo y redirigiendo...');
      // Token expirado o inválido
      authService.removeToken();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // ✅ CORREGIDO: Guardar token en localStorage
  setToken: (token) => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('💾 Token guardado en localStorage');
    } catch (error) {
      console.error('❌ Error al guardar token:', error);
    }
  },

  // ✅ CORREGIDO: Obtener token de localStorage
  getToken: () => {
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      console.log('🔍 Token obtenido:', token ? 'Existe' : 'No existe');
      return token;
    } catch (error) {
      console.error('❌ Error al obtener token:', error);
      return null;
    }
  },

  // ✅ CORREGIDO: Eliminar token de localStorage
  removeToken: () => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      console.log('🗑️ Token eliminado');
    } catch (error) {
      console.error('❌ Error al eliminar token:', error);
    }
  },

  // ✅ Login
  login: async (credentials) => {
    try {
      console.log('📤 Enviando login request...');
      const response = await api.post('/veterinarios/login', credentials);
      console.log('✅ Login response recibido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en login service:', error.response?.data);
      throw error;
    }
  },

  // ✅ Registro
  register: async (userData) => {
    try {
      console.log('📤 Enviando register request...');
      const response = await api.post('/veterinarios', userData);
      console.log('✅ Register response recibido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en register service:', error.response?.data);
      throw error;
    }
  },

  // ✅ CORREGIDO: Obtener perfil con mejor manejo de errores
  getProfile: async () => {
    try {
      console.log('📤 Obteniendo perfil...');
      const response = await api.get('/veterinarios/perfil');
      console.log('✅ Perfil obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error.response?.data);
      throw error;
    }
  },

  // ✅ Confirmar cuenta
  confirmAccount: async (token) => {
    try {
      console.log('📤 Confirmando cuenta con token:', token);
      const response = await api.get(`/veterinarios/confirmar/${token}`);
      console.log('✅ Cuenta confirmada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al confirmar cuenta:', error.response?.data);
      throw error;
    }
  },

  // ✅ Olvide password
  forgotPassword: async (email) => {
    try {
      console.log('📤 Solicitando reset password para:', email);
      const response = await api.post('/veterinarios/olvide-password', { email });
      console.log('✅ Reset password solicitado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en forgot password:', error.response?.data);
      throw error;
    }
  },

  // ✅ Verificar token de reset
  verifyResetToken: async (token) => {
    try {
      console.log('📤 Verificando reset token:', token);
      const response = await api.get(`/veterinarios/olvide-password/${token}`);
      console.log('✅ Reset token verificado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al verificar reset token:', error.response?.data);
      throw error;
    }
  },

  // ✅ Nuevo password
  resetPassword: async (token, password) => {
    try {
      console.log('📤 Restableciendo password...');
      const response = await api.post(`/veterinarios/olvide-password/${token}`, { password });
      console.log('✅ Password restablecido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al restablecer password:', error.response?.data);
      throw error;
    }
  },

  // ✅ Reenviar verificación
  resendVerification: async (email) => {
    try {
      console.log('📤 Reenviando verificación para:', email);
      const response = await api.post('/veterinarios/reenviar-verificacion', { email });
      console.log('✅ Verificación reenviada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al reenviar verificación:', error.response?.data);
      throw error;
    }
  },

  // ✅ Verificar si el usuario está autenticado
  isAuthenticated: () => {
    const token = authService.getToken();
    const isAuth = !!token;
    console.log('🔐 Usuario autenticado:', isAuth);
    return isAuth;
  }
};

// ✅ EXPORTAR INSTANCIA DE API CORRECTAMENTE
export { api as default };