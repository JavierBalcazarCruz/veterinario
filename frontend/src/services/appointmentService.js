// src/services/appointmentService.js
import api from './authService';

export const appointmentService = {
  // Obtener todas las citas
  getAll: async () => {
    const response = await api.get('/citas');
    return response.data;
  },

  // Obtener citas por fecha
  getByDate: async (date) => {
    const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
    const response = await api.get(`/citas/fecha/${dateString}`);
    return response.data;
  },

  // Obtener citas por rango de fechas
  getByDateRange: async (startDate, endDate) => {
    const start = startDate instanceof Date ? startDate.toISOString().split('T')[0] : startDate;
    const end = endDate instanceof Date ? endDate.toISOString().split('T')[0] : endDate;
    const response = await api.get(`/citas/rango?inicio=${start}&fin=${end}`);
    return response.data;
  },

  // Obtener una cita por ID
  getById: async (id) => {
    const response = await api.get(`/citas/${id}`);
    return response.data;
  },

  // Crear nueva cita
  create: async (appointmentData) => {
    const response = await api.post('/citas', appointmentData);
    return response.data;
  },

  // Actualizar cita
  update: async (id, appointmentData) => {
    const response = await api.put(`/citas/${id}`, appointmentData);
    return response.data;
  },

  // Eliminar cita
  delete: async (id) => {
    const response = await api.delete(`/citas/${id}`);
    return response.data;
  },

  // Cambiar estado de la cita
  updateStatus: async (id, newStatus) => {
    const response = await api.patch(`/citas/${id}/estado`, { estado: newStatus });
    return response.data;
  },

  // Confirmar cita
  confirm: async (id) => {
    const response = await api.patch(`/citas/${id}/confirmar`);
    return response.data;
  },

  // Cancelar cita
  cancel: async (id, motivo = '') => {
    const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
    return response.data;
  },

  // Marcar cita como completada
  complete: async (id, observaciones = '') => {
    const response = await api.patch(`/citas/${id}/completar`, { observaciones });
    return response.data;
  },

  // Iniciar consulta (marcar como en curso)
  startConsultation: async (id) => {
    const response = await api.patch(`/citas/${id}/iniciar`);
    return response.data;
  },

  // Obtener citas de hoy
  getToday: async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await api.get(`/citas/fecha/${today}`);
    return response.data;
  },

  // Obtener próximas citas
  getUpcoming: async (limit = 10) => {
    const response = await api.get(`/citas/proximas?limit=${limit}`);
    return response.data;
  },

  // Obtener citas por paciente
  getByPatient: async (patientId) => {
    const response = await api.get(`/citas/paciente/${patientId}`);
    return response.data;
  },

  // Obtener citas por doctor
  getByDoctor: async (doctorId) => {
    const response = await api.get(`/citas/doctor/${doctorId}`);
    return response.data;
  },

  // Buscar citas
  search: async (searchTerm) => {
    const response = await api.get(`/citas/buscar?q=${encodeURIComponent(searchTerm)}`);
    return response.data;
  },

  // Filtrar citas
  filter: async (filters) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/citas/filtrar?${queryParams.toString()}`);
    return response.data;
  },

  // Verificar disponibilidad de horario
  checkAvailability: async (fecha, hora, doctorId = null) => {
    const params = new URLSearchParams({ fecha, hora });
    if (doctorId) params.append('doctorId', doctorId);
    
    const response = await api.get(`/citas/disponibilidad?${params.toString()}`);
    return response.data;
  },

  // Obtener horarios disponibles para una fecha
  getAvailableSlots: async (fecha, doctorId = null) => {
    const params = new URLSearchParams({ fecha });
    if (doctorId) params.append('doctorId', doctorId);
    
    const response = await api.get(`/citas/horarios-disponibles?${params.toString()}`);
    return response.data;
  },

  // Obtener estadísticas de citas
  getStats: async (periodo = 'mes') => {
    const response = await api.get(`/citas/estadisticas?periodo=${periodo}`);
    return response.data;
  },

  // Reprogramar cita
  reschedule: async (id, nuevaFecha, nuevaHora) => {
    const response = await api.patch(`/citas/${id}/reprogramar`, {
      fecha: nuevaFecha,
      hora: nuevaHora
    });
    return response.data;
  },

  // Enviar recordatorio
  sendReminder: async (id, tipo = 'sms') => {
    const response = await api.post(`/citas/${id}/recordatorio`, { tipo });
    return response.data;
  },

  // Obtener historial de una cita
  getHistory: async (id) => {
    const response = await api.get(`/citas/${id}/historial`);
    return response.data;
  },

  // Validar datos de la cita (sin cambios)
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

  // Formatear datos de la cita para envío (sin cambios)
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

  // Obtener tipos de consulta disponibles (sin cambios)
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

  // Obtener estados de cita disponibles (sin cambios)
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

  // Calcular tiempo restante hasta la cita (sin cambios)
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
