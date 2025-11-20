// src/services/userService.js
import api from './apiService';

export const userService = {
  /**
   * Obtiene el perfil del usuario autenticado
   */
  getProfile: async () => {
    try {
      console.log('📤 Obteniendo perfil de usuario...');
      const response = await api.get('/veterinarios/perfil');
      console.log('✅ Perfil obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener perfil:', error.response?.data);
      throw error;
    }
  },

  /**
   * Actualiza el perfil del usuario autenticado
   * @param {Object} userData - Datos del usuario a actualizar (nombre, apellidos, email)
   */
  updateProfile: async (userData) => {
    try {
      console.log('📤 Actualizando perfil de usuario...', userData);
      const response = await api.put('/veterinarios/perfil', userData);
      console.log('✅ Perfil actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar perfil:', error.response?.data);
      throw error;
    }
  },

  /**
   * Cambia la contraseña del usuario autenticado
   * @param {Object} passwords - { passwordActual, passwordNuevo }
   */
  changePassword: async (passwords) => {
    try {
      console.log('📤 Cambiando contraseña...');
      const response = await api.put('/veterinarios/cambiar-password', passwords);
      console.log('✅ Contraseña cambiada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error.response?.data);
      throw error;
    }
  }
};

export default userService;
