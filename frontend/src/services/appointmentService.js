// src/services/appointmentService.js - VERSIÓN CORREGIDA
import api from './apiService'; // ✅ Importar desde el nuevo archivo

export const appointmentService = {
  // ✅ Obtener todas las citas
  getAll: async () => {
    try {
      const response = await api.get('/citas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener citas:', error);
      throw error;
    }
  },

  // ✅ Obtener citas por fecha
  getByDate: async (date) => {
    try {
      const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/citas/fecha/${dateString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener citas por rango de fechas
  getByDateRange: async (startDate, endDate) => {
    try {
      const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
      const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
      const response = await api.get(`/citas/rango?inicio=${start}&fin=${end}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener una cita por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Crear nueva cita - CORREGIDO PARA COINCIDIR CON BACKEND
  create: async (appointmentData) => {
    try {
      // ✅ Formatear datos para coincidir con lo que espera el backend
      const formattedData = {
        id_paciente: parseInt(appointmentData.id_paciente),
        fecha: appointmentData.fecha instanceof Date 
          ? appointmentData.fecha.toISOString().split('T')[0] 
          : appointmentData.fecha,
        hora: appointmentData.hora,
        tipo_consulta: appointmentData.tipo_consulta,
        notas: appointmentData.notas?.trim() || null,
        // El backend asignará automáticamente el doctor basado en el usuario autenticado
      };

      console.log('Datos de cita enviados al backend:', formattedData);

      const response = await api.post('/citas', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error.response?.data || error.message);
      throw error;
    }
  },

  // ✅ Actualizar cita
  update: async (id, appointmentData) => {
    try {
      const formattedData = {
        ...(appointmentData.fecha && { 
          fecha: appointmentData.fecha instanceof Date 
            ? appointmentData.fecha.toISOString().split('T')[0] 
            : appointmentData.fecha 
        }),
        ...(appointmentData.hora && { hora: appointmentData.hora }),
        ...(appointmentData.tipo_consulta && { tipo_consulta: appointmentData.tipo_consulta }),
        ...(appointmentData.notas !== undefined && { notas: appointmentData.notas?.trim() || null }),
        ...(appointmentData.estado && { estado: appointmentData.estado })
      };

      const response = await api.put(`/citas/${id}`, formattedData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Eliminar cita
  delete: async (id) => {
    try {
      const response = await api.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Cambiar estado de la cita
  updateStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`/citas/${id}/estado`, { estado: newStatus });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Confirmar cita
  confirm: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/confirmar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Cancelar cita
  cancel: async (id, motivo = '') => {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Marcar cita como completada
  complete: async (id, observaciones = '') => {
    try {
      const response = await api.patch(`/citas/${id}/completar`, { observaciones });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Iniciar consulta (marcar como en curso)
  startConsultation: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/iniciar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener citas de hoy
  getToday: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/citas/fecha/${today}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener próximas citas
  getUpcoming: async (limit = 10) => {
    try {
      const response = await api.get(`/citas/proximas?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener citas por paciente
  getByPatient: async (patientId) => {
    try {
      const response = await api.get(`/citas/paciente/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Buscar citas
  search: async (searchTerm) => {
    try {
      const response = await api.get(`/citas/buscar?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Verificar disponibilidad de horario
  checkAvailability: async (fecha, hora, doctorId = null) => {
    try {
      const params = new URLSearchParams({ fecha, hora });
      if (doctorId) params.append('doctorId', doctorId);
      
      const response = await api.get(`/citas/disponibilidad?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Obtener horarios disponibles para una fecha
  getAvailableSlots: async (fecha, doctorId = null) => {
    try {
      const params = new URLSearchParams({ fecha });
      if (doctorId) params.append('doctorId', doctorId);
      
      const response = await api.get(`/citas/horarios-disponibles?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.log('⚠️ Endpoint horarios-disponibles no existe, usando horarios por defecto');
      // Si no existe el endpoint, devolver horarios por defecto
      return {
        success: true,
        data: [
          '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
          '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
          '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
        ]
      };
    }
  },

  // ✅ Obtener estadísticas de citas
  getStats: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/citas/estadisticas?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Validar datos de la cita - ACTUALIZADO
  validate: (appointmentData) => {
    const errors = {};

    if (!appointmentData.id_paciente) {
      errors.id_paciente = 'Selecciona un paciente';
    }

    if (!appointmentData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const appointmentDate = new Date(appointmentData.fecha);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (appointmentDate < today) {
        errors.fecha = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!appointmentData.hora) {
      errors.hora = 'La hora es obligatoria';
    } else {
      // Validar formato de hora (HH:MM)
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(appointmentData.hora)) {
        errors.hora = 'Formato de hora inválido (use HH:MM)';
      }
    }

    if (!appointmentData.tipo_consulta) {
      errors.tipo_consulta = 'Selecciona el tipo de consulta';
    } else if (!['primera_vez', 'seguimiento', 'urgencia', 'vacunacion'].includes(appointmentData.tipo_consulta)) {
      errors.tipo_consulta = 'Tipo de consulta inválido';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // ✅ Formatear datos de la cita para envío
  formatForSubmission: (appointmentData) => {
    return {
      id_paciente: parseInt(appointmentData.id_paciente),
      fecha: appointmentData.fecha instanceof Date 
        ? appointmentData.fecha.toISOString().split('T')[0] 
        : appointmentData.fecha,
      hora: appointmentData.hora,
      tipo_consulta: appointmentData.tipo_consulta,
      notas: appointmentData.notas?.trim() || null,
    };
  },

  // ✅ Obtener tipos de consulta disponibles
  getConsultationTypes: () => {
    return [
      {
        value: 'primera_vez',
        label: 'Primera Vez',
        description: 'Primera consulta del paciente',
        icon: '🆕',
        color: 'from-blue-400 to-blue-600'
      },
      {
        value: 'seguimiento',
        label: 'Seguimiento',
        description: 'Control de tratamiento',
        icon: '📋',
        color: 'from-green-400 to-green-600'
      },
      {
        value: 'urgencia',
        label: 'Urgencia',
        description: 'Atención inmediata',
        icon: '🚨',
        color: 'from-red-400 to-red-600'
      },
      {
        value: 'vacunacion',
        label: 'Vacunación',
        description: 'Aplicación de vacunas',
        icon: '💉',
        color: 'from-purple-400 to-purple-600'
      }
    ];
  },

  // ✅ Obtener estados de cita disponibles
  getAppointmentStates: () => {
    return [
      {
        value: 'programada',
        label: 'Programada',
        color: 'blue',
        description: 'Cita programada pendiente de confirmación'
      },
      {
        value: 'confirmada',
        label: 'Confirmada',
        color: 'green',
        description: 'Cita confirmada por el propietario'
      },
      {
        value: 'en_curso',
        label: 'En Curso',
        color: 'yellow',
        description: 'Consulta en progreso'
      },
      {
        value: 'completada',
        label: 'Completada',
        color: 'purple',
        description: 'Consulta finalizada'
      },
      {
        value: 'cancelada',
        label: 'Cancelada',
        color: 'red',
        description: 'Cita cancelada'
      },
      {
        value: 'no_asistio',
        label: 'No Asistió',
        color: 'gray',
        description: 'El paciente no asistió a la cita'
      }
    ];
  },

  // ✅ Calcular tiempo restante hasta la cita
  getTimeUntilAppointment: (fecha, hora) => {
    const appointmentDateTime = new Date(`${fecha}T${hora}`);
    const now = new Date();
    const diffMs = appointmentDateTime - now;
    
    if (diffMs <= 0) {
      return { isPast: true, timeString: 'Hora pasada' };
    }

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;

    if (hours > 0) {
      return { 
        isPast: false, 
        timeString: `${hours}h ${minutes}m`,
        totalMinutes: diffMins
      };
    } else {
      return { 
        isPast: false, 
        timeString: `${minutes}m`,
        totalMinutes: diffMins
      };
    }
  },

  // ✅ Horarios de trabajo por defecto
  getDefaultWorkingHours: () => {
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
      '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];
  },

  // ✅ Filtrar horarios ocupados
  filterAvailableHours: (allHours, occupiedHours) => {
    return allHours.filter(hour => !occupiedHours.includes(hour));
  }