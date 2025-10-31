import api from './apiService';

export const appointmentService = {
  getAll: async () => {
    try {
      const response = await api.get('/citas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener citas:', error);
      throw error;
    }
  },

  getByDate: async (date) => {
    try {
      const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await api.get(`/citas/fecha/${dateString}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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

  getById: async (id) => {
    try {
      const response = await api.get(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  create: async (appointmentData) => {
    try {
      const formattedData = {
        id_paciente: parseInt(appointmentData.id_paciente),
        fecha: appointmentData.fecha instanceof Date
          ? appointmentData.fecha.toISOString().split('T')[0]
          : appointmentData.fecha,
        hora: appointmentData.hora,
        tipo_consulta: appointmentData.tipo_consulta,
        notas: appointmentData.notas?.trim() || null,
      };

      console.log('Datos de cita enviados al backend:', formattedData);

      const response = await api.post('/citas', formattedData);
      return response.data;
    } catch (error) {
      console.error('Error al crear cita:', error.response?.data || error.message);
      throw error;
    }
  },

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

  delete: async (id) => {
    try {
      const response = await api.delete(`/citas/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateStatus: async (id, newStatus) => {
    try {
      const response = await api.patch(`/citas/${id}/estado`, { estado: newStatus });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  confirm: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/confirmar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  cancel: async (id, motivo = '') => {
    try {
      const response = await api.patch(`/citas/${id}/cancelar`, { motivo });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  complete: async (id, observaciones = '') => {
    try {
      const response = await api.patch(`/citas/${id}/completar`, { observaciones });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  startConsultation: async (id) => {
    try {
      const response = await api.patch(`/citas/${id}/iniciar`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getUpcoming: async (limit = 5) => {
    try {
      const response = await api.get(`/citas/proximas?limit=${limit}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getByPatient: async (patientId) => {
    try {
      const response = await api.get(`/citas/paciente/${patientId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  search: async (searchTerm) => {
    try {
      const response = await api.get(`/citas/buscar?q=${encodeURIComponent(searchTerm)}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

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

  getStats: async (periodo = 'mes') => {
    try {
      const response = await api.get(`/citas/estadisticas?periodo=${periodo}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  validate: (appointmentData) => {
    const errors = {};

    if (!appointmentData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!appointmentData.fecha) {
      errors.fecha = 'La fecha es obligatoria';
    } else {
      const fecha = new Date(appointmentData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      if (fecha < hoy) {
        errors.fecha = 'No se pueden agendar citas en fechas pasadas';
      }
    }

    if (!appointmentData.hora) {
      errors.hora = 'La hora es obligatoria';
    }

    if (!appointmentData.tipo_consulta) {
      errors.tipo_consulta = 'El tipo de consulta es obligatorio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  formatForDisplay: (appointment) => {
    return {
      ...appointment,
      fecha_formateada: new Date(appointment.fecha).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora_formateada: appointment.hora.substring(0, 5)
    };
  },

  getConsultationTypes: () => {
    return [
      { value: 'primera_vez', label: 'Primera Vez', icon: '🆕', color: 'blue' },
      { value: 'seguimiento', label: 'Seguimiento', icon: '📋', color: 'green' },
      { value: 'urgencia', label: 'Urgencia', icon: '🚨', color: 'red' },
      { value: 'vacunacion', label: 'Vacunación', icon: '💉', color: 'purple' }
    ];
  },

  getAppointmentStates: () => {
    return [
      { value: 'programada', label: 'Programada', color: 'blue', icon: '📅' },
      { value: 'confirmada', label: 'Confirmada', color: 'green', icon: '✓' },
      { value: 'en_curso', label: 'En Curso', color: 'yellow', icon: '⏳' },
      { value: 'completada', label: 'Completada', color: 'purple', icon: '✓✓' },
      { value: 'cancelada', label: 'Cancelada', color: 'red', icon: '✕' },
      { value: 'no_asistio', label: 'No Asistió', color: 'gray', icon: '⚠' }
    ];
  },

  getTimeUntilAppointment: (fecha, hora) => {
    const appointmentDate = new Date(`${fecha}T${hora}`);
    const now = new Date();
    const diffMs = appointmentDate - now;

    if (diffMs < 0) return 'Pasada';

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `En ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    if (diffHours > 0) return `En ${diffHours} hora${diffHours > 1 ? 's' : ''}`;

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return `En ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
  },

  getDefaultWorkingHours: () => {
    return [
      '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
      '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
      '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
    ];
  },

  filterAvailableHours: (allHours, occupiedHours) => {
    return allHours.filter(hour => !occupiedHours.includes(hour));
  }
};

export default appointmentService;
