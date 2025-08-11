// src/services/authService.js - VERSIÓN CORREGIDA
import api, { tokenUtils } from './apiService';

export const authService = {
  // ✅ Métodos de token usando las utilidades separadas
  setToken: tokenUtils.set,
  getToken: tokenUtils.get,
  removeToken: tokenUtils.remove,

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

  // ✅ Obtener perfil
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
    const token = tokenUtils.get();
    const isAuth = !!token;
    console.log('🔐 Usuario autenticado:', isAuth);
    return isAuth;
  }
};

// ✅ EXPORTAR SOLO authService, NO la instancia de api
export default authService;