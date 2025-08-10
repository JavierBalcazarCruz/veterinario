// src/services/patientService.js
import api from './authService';

export const patientService = {
  // Obtener todos los pacientes
  getAll: async () => {
    try {
      const response = await api.get('/pacientes');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nuevo paciente
  create: async (patientData) => {
    try {
      const response = await api.post('/pacientes', patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar paciente
  update: async (id, patientData) => {
    try {
      const response = await api.put(`/pacientes/${id}`, patientData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar paciente
  delete: async (id) => {
    try {
      const response = await api.delete(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar pacientes
  search: async (searchTerm) => {
    try {
      const response = await api.get(`/pacientes/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener pacientes por propietario
  getByOwner: async (ownerId) => {
    try {
      const response = await api.get(`/pacientes/propietario/${ownerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener historial médico de un paciente
  getMedicalHistory: async (patientId) => {
    try {
      const response = await api.get(`/pacientes/${patientId}/historial`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener vacunas de un paciente
  getVaccinations: async (patientId) => {
    try {
      const response = await api.get(`/pacientes/${patientId}/vacunas`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar vacuna a un paciente
  addVaccination: async (patientId, vaccinationData) => {
    try {
      const response = await api.post(`/pacientes/${patientId}/vacunas`, vaccinationData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener desparasitaciones de un paciente
  getDewormings: async (patientId) => {
    try {
      const response = await api.get(`/pacientes/${patientId}/desparasitaciones`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Agregar desparasitación a un paciente
  addDeworming: async (patientId, dewormingData) => {
    try {
      const response = await api.post(`/pacientes/${patientId}/desparasitaciones`, dewormingData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Subir foto del paciente
  uploadPhoto: async (patientId, photoFile) => {
    try {
      const formData = new FormData();
      formData.append('photo', photoFile);
      
      const response = await api.post(`/pacientes/${patientId}/foto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de pacientes
  getStats: async () => {
    try {
      const response = await api.get('/pacientes/estadisticas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener pacientes recientes
  getRecent: async (limit = 5) => {
    try {
      const response = await api.get(`/pacientes/recientes?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrar pacientes
  filter: async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/pacientes/filtrar?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener razas disponibles
  getRaces: async () => {
    try {
      const response = await api.get('/razas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener especies disponibles
  getSpecies: async () => {
    try {
      const response = await api.get('/especies');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validar datos del paciente
  validate: (patientData) => {
    const errors = {};

    if (!patientData.nombre_mascota?.trim()) {
      errors.nombre_mascota = 'El nombre de la mascota es obligatorio';
    }

    if (!patientData.nombre_propietario?.trim()) {
      errors.nombre_propietario = 'El nombre del propietario es obligatorio';
    }

    if (!patientData.telefono?.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (patientData.telefono.replace(/\D/g, '').length < 10) {
      errors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (!patientData.peso || patientData.peso <= 0) {
      errors.peso = 'El peso debe ser mayor a 0';
    }

    if (!patientData.id_raza) {
      errors.id_raza = 'Selecciona una raza';
    }

    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      errors.email = 'Email inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Formatear datos del paciente para envío
  formatForSubmission: (patientData) => {
    return {
      ...patientData,
      telefono: patientData.telefono?.replace(/\D/g, ''),
      peso: parseFloat(patientData.peso),
      email: patientData.email?.trim().toLowerCase() || null,
      nombre_mascota: patientData.nombre_mascota?.trim(),
      nombre_propietario: patientData.nombre_propietario?.trim(),
      apellidos_propietario: patientData.apellidos_propietario?.trim() || '',
    };
  }
};