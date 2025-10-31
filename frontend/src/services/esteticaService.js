// src/services/esteticaService.js
import api from './apiService';

/**
 * Servicio para gestionar citas de estética y grooming
 */
export const esteticaService = {
  // ========================================
  // CRUD BÁSICO DE CITAS DE ESTÉTICA
  // ========================================

  /**
   * Obtener todas las citas de estética
   */
  getAll: async () => {
    try {
      const response = await api.get('/estetica');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener citas de estética:', error);
      throw error;
    }
  },

  /**
   * Obtener citas de estética por fecha
   */
  getByDate: async (date) => {
    try {
      const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/estetica?fecha=${dateString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener una cita de estética por ID
   */
  getById: async (id) => {
    try {
      const response = await api.get(`/estetica/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Crear nueva cita de estética
   */
  create: async (citaData) => {
    try {
      const formattedData = {
        id_paciente: parseInt(citaData.id_paciente),
        id_estilista: citaData.id_estilista ? parseInt(citaData.id_estilista) : null,
        fecha: citaData.fecha instanceof Date
          ? citaData.fecha.toISOString().split('T')[0]
          : citaData.fecha,
        hora: citaData.hora,
        tipo_servicio: citaData.tipo_servicio,
        estilo_corte: citaData.estilo_corte?.trim() || null,
        duracion_estimada: citaData.duracion_estimada || 60,
        precio: citaData.precio ? parseFloat(citaData.precio) : null,
        notas: citaData.notas?.trim() || null
      };

      console.log('📤 Datos de cita de estética enviados:', formattedData);

      const response = await api.post('/estetica', formattedData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear cita de estética:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Actualizar cita de estética
   */
  update: async (id, citaData) => {
    try {
      const formattedData = {
        ...(citaData.fecha && {
          fecha: citaData.fecha instanceof Date
            ? citaData.fecha.toISOString().split('T')[0]
            : citaData.fecha
        }),
        ...(citaData.hora && { hora: citaData.hora }),
        ...(citaData.tipo_servicio && { tipo_servicio: citaData.tipo_servicio }),
        ...(citaData.estilo_corte !== undefined && { estilo_corte: citaData.estilo_corte?.trim() || null }),
        ...(citaData.duracion_estimada && { duracion_estimada: citaData.duracion_estimada }),
        ...(citaData.precio !== undefined && { precio: citaData.precio ? parseFloat(citaData.precio) : null }),
        ...(citaData.notas !== undefined && { notas: citaData.notas?.trim() || null }),
        ...(citaData.productos_usados !== undefined && { productos_usados: citaData.productos_usados }),
        ...(citaData.notas_comportamiento !== undefined && { notas_comportamiento: citaData.notas_comportamiento })
      };

      const response = await api.put(`/estetica/${id}`, formattedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Eliminar cita de estética
   */
  delete: async (id) => {
    try {
      const response = await api.delete(`/estetica/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // GESTIÓN DE ESTADOS
  // ========================================

  /**
   * Cambiar estado de la cita
   */
  updateStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`/estetica/${id}/estado`, { estado: newStatus });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Marcar cita como confirmada
   */
  confirm: async (id) => {
    try {
      const response = await api.patch(`/estetica/${id}/estado`, { estado: 'confirmada' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Marcar cita como en proceso
   */
  startService: async (id) => {
    try {
      const response = await api.patch(`/estetica/${id}/estado`, { estado: 'en_proceso' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Marcar cita como completada
   */
  complete: async (id) => {
    try {
      const response = await api.patch(`/estetica/${id}/estado`, { estado: 'completada' });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Cancelar cita
   */
  cancel: async (id, motivo = '') => {
    try {
      const response = await api.patch(`/estetica/${id}/estado`, {
        estado: 'cancelada',
        motivo_cancelacion: motivo
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // GALERÍA DE FOTOS
  // ========================================

  /**
   * Agregar foto a la galería
   */
  addPhoto: async (id_cita, photoData) => {
    try {
      const formattedData = {
        tipo_foto: photoData.tipo_foto, // 'antes', 'durante', 'despues'
        url_foto: photoData.url_foto,
        descripcion: photoData.descripcion?.trim() || null
      };

      const response = await api.post(`/estetica/${id_cita}/fotos`, formattedData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar foto:', error);
      throw error;
    }
  },

  /**
   * Obtener galería de fotos de una cita
   */
  getGallery: async (id_cita) => {
    try {
      const response = await api.get(`/estetica/${id_cita}/galeria`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // PERFILES DE ESTÉTICA
  // ========================================

  /**
   * Obtener perfil de estética de un paciente
   */
  getProfile: async (id_paciente) => {
    try {
      const response = await api.get(`/estetica/perfil/${id_paciente}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Actualizar perfil de estética
   */
  updateProfile: async (id_paciente, profileData) => {
    try {
      const formattedData = {
        ...(profileData.estilo_preferido !== undefined && { estilo_preferido: profileData.estilo_preferido }),
        ...(profileData.largo_preferido && { largo_preferido: profileData.largo_preferido }),
        ...(profileData.productos_favoritos !== undefined && { productos_favoritos: profileData.productos_favoritos }),
        ...(profileData.productos_evitar !== undefined && { productos_evitar: profileData.productos_evitar }),
        ...(profileData.sensibilidades !== undefined && { sensibilidades: profileData.sensibilidades }),
        ...(profileData.preferencias_especiales !== undefined && { preferencias_especiales: profileData.preferencias_especiales }),
        ...(profileData.frecuencia_recomendada_dias && { frecuencia_recomendada_dias: profileData.frecuencia_recomendada_dias })
      };

      const response = await api.put(`/estetica/perfil/${id_paciente}`, formattedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener historial de estética de un paciente
   */
  getHistory: async (id_paciente) => {
    try {
      const response = await api.get(`/estetica/historial/${id_paciente}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ========================================
  // UTILIDADES Y HELPERS
  // ========================================

  /**
   * Validar datos de cita antes de enviar
   */
  validate: (citaData) => {
    const errors = {};

    if (!citaData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!citaData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const fecha = new Date(citaData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        errors.fecha = 'No se pueden agendar citas en fechas pasadas';
      }
    }

    if (!citaData.hora) {
      errors.hora = 'La hora es obligatoria';
    }

    if (!citaData.tipo_servicio) {
      errors.tipo_servicio = 'El tipo de servicio es obligatorio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * Formatear datos para mostrar
   */
  formatForDisplay: (cita) => {
    return {
      ...cita,
      fecha_formateada: new Date(cita.fecha).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora_formateada: cita.hora.substring(0, 5),
      tipo_servicio_texto: getServiceTypeLabel(cita.tipo_servicio),
      estado_texto: getStatusLabel(cita.estado),
      duracion_texto: `${cita.duracion_estimada || 60} min`,
      precio_formateado: cita.precio ? `$${parseFloat(cita.precio).toFixed(2)}` : 'Sin precio'
    };
  },

  /**
   * Obtener tipos de servicio disponibles
   */
  getServiceTypes: () => {
    return [
      { value: 'baño', label: 'Baño Completo', icon: '🛁', color: '#3B82F6', duracion: 60 },
      { value: 'corte', label: 'Corte de Pelo', icon: '✂️', color: '#8B5CF6', duracion: 90 },
      { value: 'baño_corte', label: 'Baño y Corte', icon: '✨', color: '#EC4899', duracion: 120 },
      { value: 'uñas', label: 'Corte de Uñas', icon: '💅', color: '#F59E0B', duracion: 20 },
      { value: 'limpieza_dental', label: 'Limpieza Dental', icon: '🦷', color: '#10B981', duracion: 45 },
      { value: 'spa_premium', label: 'Spa Premium', icon: '💆', color: '#9333EA', duracion: 150 },
      { value: 'deslanado', label: 'Deslanado', icon: '🌬️', color: '#06B6D4', duracion: 90 },
      { value: 'tratamiento_pulgas', label: 'Tratamiento Anti-pulgas', icon: '🐛', color: '#EF4444', duracion: 45 },
      { value: 'otro', label: 'Otro Servicio', icon: '➕', color: '#6B7280', duracion: 60 }
    ];
  },

  /**
   * Obtener estados disponibles
   */
  getStates: () => {
    return [
      { value: 'programada', label: 'Programada', color: '#3B82F6', icon: '📅' },
      { value: 'confirmada', label: 'Confirmada', color: '#10B981', icon: '✓' },
      { value: 'en_proceso', label: 'En Proceso', color: '#F59E0B', icon: '⏳' },
      { value: 'completada', label: 'Completada', color: '#8B5CF6', icon: '✓✓' },
      { value: 'cancelada', label: 'Cancelada', color: '#EF4444', icon: '✕' },
      { value: 'no_asistio', label: 'No Asistió', color: '#6B7280', icon: '⚠' }
    ];
  }
};

// ========================================
// FUNCIONES HELPER
// ========================================

function getServiceTypeLabel(tipo) {
  const tipos = {
    'baño': 'Baño Completo',
    'corte': 'Corte de Pelo',
    'baño_corte': 'Baño y Corte',
    'uñas': 'Corte de Uñas',
    'limpieza_dental': 'Limpieza Dental',
    'spa_premium': 'Spa Premium',
    'deslanado': 'Deslanado',
    'tratamiento_pulgas': 'Tratamiento Anti-pulgas',
    'otro': 'Otro Servicio'
  };
  return tipos[tipo] || tipo;
}

function getStatusLabel(estado) {
  const estados = {
    'programada': 'Programada',
    'confirmada': 'Confirmada',
    'en_proceso': 'En Proceso',
    'completada': 'Completada',
    'cancelada': 'Cancelada',
    'no_asistio': 'No Asistió'
  };
  return estados[estado] || estado;
}

export default esteticaService;
