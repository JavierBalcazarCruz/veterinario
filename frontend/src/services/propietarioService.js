// src/services/propietarioService.js - Servicio para gestión de propietarios
import api from './apiService';

export const propietarioService = {
  /**
   * ✅ FLUJO 2: Actualizar datos del propietario
   * ⚠️ IMPORTANTE: Afecta a TODAS las mascotas del propietario
   *
   * @param {number} id - ID del propietario
   * @param {object} ownerData - Datos del propietario a actualizar
   * @returns {Promise} Respuesta con propietario actualizado y contador de mascotas afectadas
   */
  update: async (id, ownerData) => {
    try {
      console.log('🔧 [propietarioService.update] Iniciando actualización para ID:', id);
      console.log('🔧 [propietarioService.update] Datos recibidos:', ownerData);

      // Formatear datos para el backend
      const formattedData = {
        // Datos del propietario (obligatorios)
        nombre: ownerData.nombre?.trim(),
        apellidos: ownerData.apellidos?.trim(),
        email: ownerData.email?.trim().toLowerCase() || null,

        // Datos de teléfono
        telefono: ownerData.telefono?.replace(/\D/g, ''), // Solo números
        tipo_telefono: ownerData.tipo_telefono || 'celular',

        // Datos de dirección (opcionales)
        calle: ownerData.calle?.trim() || null,
        numero_ext: ownerData.numero_ext?.trim() || null,
        numero_int: ownerData.numero_int?.trim() || null,
        codigo_postal: ownerData.codigo_postal?.trim() || null,
        colonia: ownerData.colonia?.trim() || null,
        id_municipio: parseInt(ownerData.id_municipio) || 1,
        referencias: ownerData.referencias?.trim() || null
      };

      console.log('📤 [propietarioService.update] Datos formateados para enviar:', formattedData);
      console.log('🌐 [propietarioService.update] Haciendo PUT a: /pacientes/propietarios/' + id);

      const response = await api.put(`/pacientes/propietarios/${id}`, formattedData);

      console.log('✅ [propietarioService.update] Respuesta del servidor:', response);
      console.log('✅ [propietarioService.update] Status:', response.status);
      console.log('✅ [propietarioService.update] Data:', response.data);

      // ⚠️ El backend devuelve total_mascotas para mostrar advertencia
      if (response.data.total_mascotas) {
        console.log(`⚠️ [propietarioService.update] ${response.data.total_mascotas} mascota(s) afectada(s)`);
      }

      return response.data;
    } catch (error) {
      console.error('❌ [propietarioService.update] Error al actualizar propietario:', error);
      console.error('❌ [propietarioService.update] Error response:', error.response?.data);
      console.error('❌ [propietarioService.update] Error status:', error.response?.status);
      console.error('❌ [propietarioService.update] Error message:', error.message);
      throw error;
    }
  },

  /**
   * ✅ Obtener datos del propietario por ID
   * Incluye información de sus mascotas
   *
   * @param {number} id - ID del propietario
   * @returns {Promise} Datos del propietario
   */
  getById: async (id) => {
    try {
      console.log('🔍 [propietarioService.getById] Obteniendo propietario ID:', id);

      const response = await api.get(`/pacientes/propietarios/${id}`);

      console.log('✅ [propietarioService.getById] Propietario obtenido:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ [propietarioService.getById] Error al obtener propietario:', error);
      throw error;
    }
  },

  /**
   * ✅ Validar datos del propietario antes de enviar
   *
   * @param {object} ownerData - Datos del propietario
   * @returns {object} { isValid: boolean, errors: object }
   */
  validate: (ownerData) => {
    const errors = {};

    // Validaciones obligatorias
    if (!ownerData.nombre?.trim()) {
      errors.nombre = 'El nombre del propietario es obligatorio';
    } else if (ownerData.nombre.trim().length < 2) {
      errors.nombre = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!ownerData.apellidos?.trim()) {
      errors.apellidos = 'Los apellidos del propietario son obligatorios';
    } else if (ownerData.apellidos.trim().length < 2) {
      errors.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
    }

    if (!ownerData.telefono?.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (ownerData.telefono.replace(/\D/g, '').length < 10) {
      errors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    // Validaciones opcionales
    if (ownerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerData.email)) {
      errors.email = 'Email inválido';
    }

    if (ownerData.codigo_postal && ownerData.codigo_postal.trim().length !== 5) {
      errors.codigo_postal = 'El código postal debe tener 5 dígitos';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * ✅ Obtener todas las mascotas de un propietario
   *
   * @param {number} id - ID del propietario
   * @returns {Promise} Lista de mascotas
   */
  getPets: async (id) => {
    try {
      console.log('🐾 [propietarioService.getPets] Obteniendo mascotas del propietario:', id);

      const response = await api.get(`/pacientes/propietario/${id}`);

      console.log('✅ [propietarioService.getPets] Mascotas obtenidas:', response.data);

      return response.data;
    } catch (error) {
      console.error('❌ [propietarioService.getPets] Error al obtener mascotas:', error);
      throw error;
    }
  }
};

export default propietarioService;
