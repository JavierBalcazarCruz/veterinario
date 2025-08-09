// src/services/patientService.js
import api from './authService';

export const patientService = {
  // Obtener todos los pacientes
  getAll: async () => {
    const response = await api.get('/pacientes');
    return response.data;
  },

  // Obtener un paciente por ID
  getById: async (id) => {
    const response = await api.get(`/pacientes/${id}`);
    return response.data;
  },

  // Crear nuevo paciente
  create: async (patientData) => {
    const response = await api.post('/pacientes', patientData);
    return response.data;
  },

  // Actualizar paciente
  update: async (id, patientData) => {
    const response = await api.put(`/pacientes/${id}`, patientData);
    return response.data;
  },

  // Eliminar paciente
  delete: async (id) => {
    const response = await api.delete(`/pacientes/${id}`);
    return response.data;
  },

  // Buscar pacientes
  search: async (searchTerm) => {
    const response = await api.get(`/pacientes/search?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Obtener pacientes por propietario
  getByOwner: async (ownerId) => {
    const response = await api.get(`/pacientes/propietario/${ownerId}`);
    return response.data;
  },

  // Obtener historial médico de un paciente
  getMedicalHistory: async (patientId) => {
    const response = await api.get(`/pacientes/${patientId}/historial`);
    return response.data;
  },

  // Obtener vacunas de un paciente
  getVaccinations: async (patientId) => {
    const response = await api.get(`/pacientes/${patientId}/vacunas`);
    return response.data;
  },

  // Agregar vacuna a un paciente
  addVaccination: async (patientId, vaccinationData) => {
    const response = await api.post(`/pacientes/${patientId}/vacunas`, vaccinationData);
    return response.data;
  },

  // Obtener desparasitaciones de un paciente
  getDewormings: async (patientId) => {
    const response = await api.get(`/pacientes/${patientId}/desparasitaciones`);
    return response.data;
  },

  // Agregar desparasitación a un paciente
  addDeworming: async (patientId, dewormingData) => {
    const response = await api.post(`/pacientes/${patientId}/desparasitaciones`, dewormingData);
    return response.data;
  },

  // Subir foto del paciente
  uploadPhoto: async (patientId, photoFile) => {
    const formData = new FormData();
    formData.append('photo', photoFile);
    
    const response = await api.post(`/pacientes/${patientId}/foto`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obtener estadísticas de pacientes
  getStats: async () => {
    const response = await api.get('/pacientes/estadisticas');
    return response.data;
  },

  // Obtener pacientes recientes
  getRecent: async (limit = 5) => {
    const response = await api.get(`/pacientes/recientes?limit=${limit}`);
    return response.data;
  },

  // Filtrar pacientes
  filter: async (filters) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/pacientes/filtrar?${queryParams.toString()}`);
    return response.data;
  },

  // Obtener razas disponibles
  getRaces: async () => {
    const response = await api.get('/razas');
    return response.data;
  },

  // Obtener especies disponibles
  getSpecies: async () => {
    const response = await api.get('/especies');
    return response.data;
  },

  // Validar datos del paciente (sin cambios, ya que no hace llamadas a la API)
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

  // Formatear datos del paciente para envío (sin cambios)
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
