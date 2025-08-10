// src/services/appointmentService.js
import api from './authService';

export const appointmentService = {
  // Obtener todas las citas
  getAll: async () => {
    try {
      const response = await api.get('/citas');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener citas por fecha
  getByDate: async (date) => {
    try {
      const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/citas/fecha/${dateString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener citas por rango de fechas
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

  // Obtener una cita por ID
  getById: async (id) => {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Crear nueva cita
  create: async (appointmentData) => {
    try {
      const response = await api.post('/citas', appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Actualizar cita
  update: async (id, appointmentData) => {
    try {
      const response = await api.put(`/citas/${id}`, appointmentData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Eliminar cita
  delete: async (id) => {
    try {
      const response = await api.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cambiar estado de la cita
  updateStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`/citas/${id}/estado`, { estado: newStatus });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Confirmar cita
  confirm: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/confirmar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Cancelar cita
  cancel: async (id, motivo = '') => {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Marcar cita como completada
  complete: async (id, observaciones = '') => {
    try {
      const response = await api.patch(`/citas/${id}/completar`, { observaciones });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Iniciar consulta (marcar como en curso)
  startConsultation: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/iniciar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener citas de hoy
  getToday: async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/citas/fecha/${today}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener próximas citas
  getUpcoming: async (limit = 10) => {
    try {
      const response = await api.get(`/citas/proximas?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener citas por paciente
  getByPatient: async (patientId) => {
    try {
      const response = await api.get(`/citas/paciente/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener citas por doctor
  getByDoctor: async (doctorId) => {
    try {
      const response = await api.get(`/citas/doctor/${doctorId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Buscar citas
  search: async (searchTerm) => {
    try {
      const response = await api.get(`/citas/buscar?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Filtrar citas
  filter: async (filters) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });

      const response = await api.get(`/citas/filtrar?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Verificar disponibilidad de horario
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

  // Obtener horarios disponibles para una fecha
  getAvailableSlots: async (fecha, doctorId = null) => {
    try {
      const params = new URLSearchParams({ fecha });
      if (doctorId) params.append('doctorId', doctorId);
      
      const response = await api.get(`/citas/horarios-disponibles?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener estadísticas de citas
  getStats: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/citas/estadisticas?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Reprogramar cita
  reschedule: async (id, nuevaFecha, nuevaHora) => {
    try {
      const response = await api.patch(`/citas/${id}/reprogramar`, {
        fecha: nuevaFecha,
        hora: nuevaHora
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Enviar recordatorio
  sendReminder: async (id, tipo = 'sms') => {
    try {
      const response = await api.post(`/citas/${id}/recordatorio`, { tipo });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener historial de una cita
  getHistory: async (id) => {
    try {
      const response = await api.get(`/citas/${id}/historial`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Validar datos de la cita
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

  // Formatear datos de la cita para envío
  formatForSubmission: (appointmentData) => {
    return {
      ...appointmentData,
      id_paciente: parseInt(appointmentData.id_paciente),
      fecha: appointmentData.fecha instanceof Date 
        ? appointmentData.fecha.toISOString().split('T')[0] 
        : appointmentData.fecha,
      notas: appointmentData.notas?.trim() || null,
    };
  },

  // Obtener tipos de consulta disponibles
  getConsultationTypes: () => {
    return [
      {
        value: 'primera_vez',
        label: 'Primera Vez',
        description: 'Primera consulta del paciente',
        icon: '🆕'
      },
      {
        value: 'seguimiento',
        label: 'Seguimiento',
        description: 'Control de tratamiento',
        icon: '📋'
      },
      {
        value: 'urgencia',
        label: 'Urgencia',
        description: 'Atención inmediata',
        icon: '🚨'
      },
      {
        value: 'vacunacion',
        label: 'Vacunación',
        description: 'Aplicación de vacunas',
        icon: '💉'
      }
    ];
  },

  // Obtener estados de cita disponibles
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

  // Calcular tiempo restante hasta la cita
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
  }
};