// src/services/patientService.js - VERSIÓN CORREGIDA
import api from './apiService'; // ✅ Importar desde el nuevo archivo

export const patientService = {
  // ✅ Obtener todos los pacientes
  getAll: async () => {
    try {
      const response = await api.get('/pacientes');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener pacientes:', error);
      throw error;
    }
  },

  // ✅ Obtener un paciente por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Crear nuevo paciente - DATOS CORREGIDOS PARA COINCIDIR CON BACKEND
  create: async (patientData) => {
    try {
      // ✅ Formatear datos para coincidir con lo que espera el backend
      const formattedData = {
        // Datos del propietario
        nombre_propietario: patientData.nombre_propietario?.trim(),
        apellidos_propietario: patientData.apellidos_propietario?.trim() || '',
        email: patientData.email?.trim().toLowerCase() || null,
        telefono: patientData.telefono?.replace(/\D/g, ''), // Solo números
        tipo_telefono: patientData.tipo_telefono || 'celular',
        
        // Datos de dirección (opcionales)
        calle: patientData.calle?.trim() || null,
        numero_ext: patientData.numero_ext?.trim() || '1',
        numero_int: patientData.numero_int?.trim() || null,
        codigo_postal: patientData.codigo_postal?.trim() || null,
        colonia: patientData.colonia?.trim() || null,
        id_municipio: parseInt(patientData.id_municipio) || 1,
        referencias: patientData.referencias?.trim() || null,
        
        // Datos del paciente
        nombre_mascota: patientData.nombre_mascota?.trim(),
        fecha_nacimiento: patientData.fecha_nacimiento || null,
        peso: parseFloat(patientData.peso),
        id_raza: parseInt(patientData.id_raza),
        foto_url: patientData.foto_url || null
      };

      console.log('Datos enviados al backend:', formattedData); // Para debugging

      const response = await api.post('/pacientes', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear paciente:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Actualizar paciente
  update: async (id, patientData) => {
    try {
      // ✅ Formatear datos de la misma manera que en create
      const formattedData = {
        // Solo enviar campos que han cambiado
        ...(patientData.nombre_mascota && { nombre_mascota: patientData.nombre_mascota.trim() }),
        ...(patientData.fecha_nacimiento && { fecha_nacimiento: patientData.fecha_nacimiento }),
        ...(patientData.peso && { peso: parseFloat(patientData.peso) }),
        ...(patientData.id_raza && { id_raza: parseInt(patientData.id_raza) }),
        ...(patientData.foto_url !== undefined && { foto_url: patientData.foto_url }),
        
        // Datos del propietario
        ...(patientData.nombre_propietario && { nombre_propietario: patientData.nombre_propietario.trim() }),
        ...(patientData.apellidos_propietario !== undefined && { apellidos_propietario: patientData.apellidos_propietario.trim() }),
        ...(patientData.email !== undefined && { email: patientData.email?.trim().toLowerCase() || null }),
        ...(patientData.telefono && { telefono: patientData.telefono.replace(/\D/g, '') }),
        ...(patientData.tipo_telefono && { tipo_telefono: patientData.tipo_telefono }),
        
        // Datos de dirección
        ...(patientData.calle !== undefined && { calle: patientData.calle?.trim() || null }),
        ...(patientData.numero_ext !== undefined && { numero_ext: patientData.numero_ext?.trim() || null }),
        ...(patientData.numero_int !== undefined && { numero_int: patientData.numero_int?.trim() || null }),
        ...(patientData.codigo_postal !== undefined && { codigo_postal: patientData.codigo_postal?.trim() || null }),
        ...(patientData.colonia !== undefined && { colonia: patientData.colonia?.trim() || null }),
        ...(patientData.id_municipio && { id_municipio: parseInt(patientData.id_municipio) }),
        ...(patientData.referencias !== undefined && { referencias: patientData.referencias?.trim() || null })
      };

      const response = await api.put(`/pacientes/${id}`, formattedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Eliminar paciente
  delete: async (id) => {
    try {
      const response = await api.delete(`/pacientes/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Buscar pacientes
  search: async (searchTerm) => {
    try {
      const response = await api.get(`/pacientes/search?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener pacientes por propietario
  getByOwner: async (ownerId) => {
    try {
      const response = await api.get(`/pacientes/propietario/${ownerId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Subir foto del paciente
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

  // ✅ Obtener estadísticas de pacientes
  getStats: async () => {
    try {
      const response = await api.get('/pacientes/estadisticas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener pacientes recientes
  getRecent: async (limit = 5) => {
    try {
      const response = await api.get(`/pacientes/recientes?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener razas disponibles (con filtro opcional por especie)
  getRaces: async (especie = null) => {
    try {
      const url = especie ? `/pacientes/razas?especie=${encodeURIComponent(especie)}` : '/pacientes/razas';
      const response = await api.get(url);
      return response.data.data || response.data;
    } catch (error) {
      console.log('⚠️ Endpoint /pacientes/razas no disponible, usando datos mock');
      // Si no existe endpoint, devolver razas mock
      const mockRazas = [
        { id: 1, nombre: 'Mestizo', especie: 'Perro' },
        { id: 2, nombre: 'Golden Retriever', especie: 'Perro' },
        { id: 3, nombre: 'Labrador', especie: 'Perro' },
        { id: 4, nombre: 'Pastor Alemán', especie: 'Perro' },
        { id: 5, nombre: 'Bulldog', especie: 'Perro' },
        { id: 6, nombre: 'Persa', especie: 'Gato' },
        { id: 7, nombre: 'Siamés', especie: 'Gato' },
        { id: 8, nombre: 'Maine Coon', especie: 'Gato' },
        { id: 9, nombre: 'Angora', especie: 'Gato' },
        { id: 10, nombre: 'Común Europeo', especie: 'Gato' },
      ];

      // Filtrar por especie si se proporciona
      return especie ? mockRazas.filter(r => r.especie.toLowerCase() === especie.toLowerCase()) : mockRazas;
    }
  },

  // ✅ Obtener especies disponibles
  getSpecies: async () => {
    try {
      const response = await api.get('/especies');
      return response.data;
    } catch (error) {
      console.log('⚠️ Endpoint /especies no disponible, usando datos mock');
      // Si no existe endpoint, devolver especies mock
      return [
        { id: 1, nombre: 'Perro' },
        { id: 2, nombre: 'Gato' },
        { id: 3, nombre: 'Ave' },
        { id: 4, nombre: 'Conejo' },
      ];
    }
  },

  // ✅ Validar datos del paciente - ACTUALIZADO PARA COINCIDIR CON BACKEND
  validate: (patientData) => {
    const errors = {};

    // Validaciones obligatorias
    if (!patientData.nombre_mascota?.trim()) {
      errors.nombre_mascota = 'El nombre de la mascota es obligatorio';
    }

    if (!patientData.nombre_propietario?.trim()) {
      errors.nombre_propietario = 'El nombre del propietario es obligatorio';
    }

    if (!patientData.apellidos_propietario?.trim()) {
      errors.apellidos_propietario = 'Los apellidos del propietario son obligatorios';
    }

    if (!patientData.telefono?.trim()) {
      errors.telefono = 'El teléfono es obligatorio';
    } else if (patientData.telefono.replace(/\D/g, '').length < 10) {
      errors.telefono = 'El teléfono debe tener al menos 10 dígitos';
    }

    if (!patientData.peso || parseFloat(patientData.peso) <= 0) {
      errors.peso = 'El peso debe ser mayor a 0';
    }

    if (!patientData.id_raza) {
      errors.id_raza = 'Selecciona una raza';
    }

    // Validaciones opcionales
    if (patientData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientData.email)) {
      errors.email = 'Email inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // ✅ Formatear datos del paciente para envío
  formatForSubmission: (patientData) => {
    return {
      // Datos del propietario
      nombre_propietario: patientData.nombre_propietario?.trim(),
      apellidos_propietario: patientData.apellidos_propietario?.trim() || '',
      email: patientData.email?.trim().toLowerCase() || null,
      telefono: patientData.telefono?.replace(/\D/g, ''),
      tipo_telefono: patientData.tipo_telefono || 'celular',
      
      // Datos de dirección
      calle: patientData.calle?.trim() || null,
      numero_ext: patientData.numero_ext?.trim() || '1',
      numero_int: patientData.numero_int?.trim() || null,
      codigo_postal: patientData.codigo_postal?.trim() || null,
      colonia: patientData.colonia?.trim() || null,
      id_municipio: parseInt(patientData.id_municipio) || 1,
      referencias: patientData.referencias?.trim() || null,
      
      // Datos del paciente
      nombre_mascota: patientData.nombre_mascota?.trim(),
      fecha_nacimiento: patientData.fecha_nacimiento || null,
      peso: parseFloat(patientData.peso),
      id_raza: parseInt(patientData.id_raza),
      foto_url: patientData.foto_url || null
    };
  }
};