/**
 * =====================================================
 * SERVICIO DE HISTORIAL CLÍNICO - FRONTEND
 * =====================================================
 * Maneja todas las llamadas API relacionadas con el
 * historial clínico de pacientes veterinarios
 */

import api from './apiService';

export const historialService = {
  // =====================================================
  // HISTORIAL COMPLETO
  // =====================================================

  /**
   * 📋 Obtener historial clínico completo de un paciente
   * @param {number} pacienteId - ID del paciente
   * @returns {Promise} Historial completo con consultas, vacunas, alergias, etc.
   */
  getHistorialCompleto: async (pacienteId) => {
    try {
      const response = await api.get(`/historial/${pacienteId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener historial completo:', error);
      throw error;
    }
  },

  // =====================================================
  // CONSULTAS MÉDICAS
  // =====================================================

  /**
   * ➕ Crear nueva consulta médica
   * @param {Object} consultaData - Datos de la consulta
   * @returns {Promise} Consulta creada
   */
  crearConsulta: async (consultaData) => {
    try {
      const response = await api.post('/historial/consultas', consultaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear consulta:', error);
      throw error;
    }
  },

  /**
   * 📝 Actualizar consulta médica
   * @param {number} consultaId - ID de la consulta
   * @param {Object} consultaData - Datos actualizados
   * @returns {Promise} Consulta actualizada
   */
  actualizarConsulta: async (consultaId, consultaData) => {
    try {
      const response = await api.put(`/historial/consultas/${consultaId}`, consultaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar consulta:', error);
      throw error;
    }
  },

  // =====================================================
  // VACUNAS
  // =====================================================

  /**
   * 💉 Agregar vacuna
   * @param {Object} vacunaData - Datos de la vacuna
   * @returns {Promise} Vacuna creada
   */
  agregarVacuna: async (vacunaData) => {
    try {
      const response = await api.post('/historial/vacunas', vacunaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar vacuna:', error);
      throw error;
    }
  },

  /**
   * 📝 Actualizar vacuna
   * @param {number} vacunaId - ID de la vacuna
   * @param {Object} vacunaData - Datos actualizados
   * @returns {Promise} Vacuna actualizada
   */
  actualizarVacuna: async (vacunaId, vacunaData) => {
    try {
      const response = await api.put(`/historial/vacunas/${vacunaId}`, vacunaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar vacuna:', error);
      throw error;
    }
  },

  // =====================================================
  // ALERGIAS
  // =====================================================

  /**
   * ⚠️ Agregar alergia
   * @param {Object} alergiaData - Datos de la alergia
   * @returns {Promise} Alergia creada
   */
  agregarAlergia: async (alergiaData) => {
    try {
      const response = await api.post('/historial/alergias', alergiaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar alergia:', error);
      throw error;
    }
  },

  /**
   * 🚫 Desactivar alergia
   * @param {number} alergiaId - ID de la alergia
   * @returns {Promise} Confirmación
   */
  desactivarAlergia: async (alergiaId) => {
    try {
      const response = await api.patch(`/historial/alergias/${alergiaId}/desactivar`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al desactivar alergia:', error);
      throw error;
    }
  },

  // =====================================================
  // CIRUGÍAS Y PROCEDIMIENTOS
  // =====================================================

  /**
   * 🏥 Agregar cirugía o procedimiento
   * @param {Object} cirugiaData - Datos de la cirugía/procedimiento
   * @returns {Promise} Cirugía/procedimiento creado
   */
  agregarCirugia: async (cirugiaData) => {
    try {
      const response = await api.post('/historial/cirugias', cirugiaData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar cirugía:', error);
      throw error;
    }
  },

  // =====================================================
  // MEDICAMENTOS
  // =====================================================

  /**
   * 💊 Agregar medicamento recetado
   * @param {Object} medicamentoData - Datos del medicamento
   * @returns {Promise} Medicamento creado
   */
  agregarMedicamento: async (medicamentoData) => {
    try {
      const response = await api.post('/historial/medicamentos', medicamentoData);
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar medicamento:', error);
      throw error;
    }
  },

  /**
   * 💊 Obtener medicamentos de una consulta
   * @param {number} consultaId - ID de la consulta
   * @returns {Promise} Lista de medicamentos
   */
  obtenerMedicamentosConsulta: async (consultaId) => {
    try {
      const response = await api.get(`/historial/consultas/${consultaId}/medicamentos`);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener medicamentos:', error);
      throw error;
    }
  },

  // =====================================================
  // VALIDACIONES
  // =====================================================

  /**
   * ✅ Validar datos de consulta médica
   * @param {Object} consultaData - Datos a validar
   * @returns {Object} { isValid: boolean, errors: {} }
   */
  validarConsulta: (consultaData) => {
    const errors = {};

    if (!consultaData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!consultaData.motivo_consulta?.trim()) {
      errors.motivo_consulta = 'El motivo de consulta es obligatorio';
    }

    // Validaciones opcionales de signos vitales
    if (consultaData.peso_actual && parseFloat(consultaData.peso_actual) <= 0) {
      errors.peso_actual = 'El peso debe ser mayor a 0';
    }

    if (consultaData.temperatura && (parseFloat(consultaData.temperatura) < 35 || parseFloat(consultaData.temperatura) > 45)) {
      errors.temperatura = 'La temperatura debe estar entre 35°C y 45°C';
    }

    if (consultaData.frecuencia_cardiaca && (parseInt(consultaData.frecuencia_cardiaca) < 0 || parseInt(consultaData.frecuencia_cardiaca) > 300)) {
      errors.frecuencia_cardiaca = 'La frecuencia cardíaca debe estar entre 0 y 300 lpm';
    }

    if (consultaData.frecuencia_respiratoria && (parseInt(consultaData.frecuencia_respiratoria) < 0 || parseInt(consultaData.frecuencia_respiratoria) > 100)) {
      errors.frecuencia_respiratoria = 'La frecuencia respiratoria debe estar entre 0 y 100 rpm';
    }

    if (consultaData.nivel_dolor && (parseInt(consultaData.nivel_dolor) < 0 || parseInt(consultaData.nivel_dolor) > 10)) {
      errors.nivel_dolor = 'El nivel de dolor debe estar entre 0 y 10';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * ✅ Validar datos de vacuna
   * @param {Object} vacunaData - Datos a validar
   * @returns {Object} { isValid: boolean, errors: {} }
   */
  validarVacuna: (vacunaData) => {
    const errors = {};

    if (!vacunaData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!vacunaData.tipo_vacuna?.trim()) {
      errors.tipo_vacuna = 'El tipo de vacuna es obligatorio';
    }

    if (!vacunaData.fecha_aplicacion) {
      errors.fecha_aplicacion = 'La fecha de aplicación es obligatoria';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * ✅ Validar datos de alergia
   * @param {Object} alergiaData - Datos a validar
   * @returns {Object} { isValid: boolean, errors: {} }
   */
  validarAlergia: (alergiaData) => {
    const errors = {};

    if (!alergiaData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!alergiaData.tipo_alergia) {
      errors.tipo_alergia = 'El tipo de alergia es obligatorio';
    }

    if (!alergiaData.nombre_alergeno?.trim()) {
      errors.nombre_alergeno = 'El nombre del alérgeno es obligatorio';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * ✅ Validar datos de cirugía
   * @param {Object} cirugiaData - Datos a validar
   * @returns {Object} { isValid: boolean, errors: {} }
   */
  validarCirugia: (cirugiaData) => {
    const errors = {};

    if (!cirugiaData.id_paciente) {
      errors.id_paciente = 'El paciente es obligatorio';
    }

    if (!cirugiaData.tipo) {
      errors.tipo = 'El tipo es obligatorio';
    }

    if (!cirugiaData.nombre?.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }

    if (!cirugiaData.fecha_realizacion) {
      errors.fecha_realizacion = 'La fecha de realización es obligatoria';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  /**
   * ✅ Validar datos de medicamento
   * @param {Object} medicamentoData - Datos a validar
   * @returns {Object} { isValid: boolean, errors: {} }
   */
  validarMedicamento: (medicamentoData) => {
    const errors = {};

    if (!medicamentoData.id_historia_clinica) {
      errors.id_historia_clinica = 'La consulta es obligatoria';
    }

    if (!medicamentoData.nombre_medicamento?.trim()) {
      errors.nombre_medicamento = 'El nombre del medicamento es obligatorio';
    }

    if (!medicamentoData.dosis?.trim()) {
      errors.dosis = 'La dosis es obligatoria';
    }

    if (!medicamentoData.frecuencia?.trim()) {
      errors.frecuencia = 'La frecuencia es obligatoria';
    }

    if (!medicamentoData.duracion?.trim()) {
      errors.duracion = 'La duración es obligatoria';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // =====================================================
  // UTILIDADES
  // =====================================================

  /**
   * 📊 Formatear datos de consulta para envío
   * @param {Object} consultaData - Datos sin formatear
   * @returns {Object} Datos formateados
   */
  formatearConsulta: (consultaData) => {
    return {
      id_paciente: parseInt(consultaData.id_paciente),
      motivo_consulta: consultaData.motivo_consulta?.trim(),
      diagnostico: consultaData.diagnostico?.trim() || null,
      tratamiento: consultaData.tratamiento?.trim() || null,
      peso_actual: consultaData.peso_actual ? parseFloat(consultaData.peso_actual) : null,
      temperatura: consultaData.temperatura ? parseFloat(consultaData.temperatura) : null,
      frecuencia_cardiaca: consultaData.frecuencia_cardiaca ? parseInt(consultaData.frecuencia_cardiaca) : null,
      frecuencia_respiratoria: consultaData.frecuencia_respiratoria ? parseInt(consultaData.frecuencia_respiratoria) : null,
      presion_arterial: consultaData.presion_arterial?.trim() || null,
      tiempo_llenado_capilar: consultaData.tiempo_llenado_capilar ? parseFloat(consultaData.tiempo_llenado_capilar) : null,
      nivel_dolor: consultaData.nivel_dolor ? parseInt(consultaData.nivel_dolor) : null,
      condicion_corporal: consultaData.condicion_corporal || null,
      estado_hidratacion: consultaData.estado_hidratacion || null,
      observaciones: consultaData.observaciones?.trim() || null
    };
  },

  /**
   * 📈 Calcular estadísticas rápidas del historial
   * @param {Object} historial - Historial completo
   * @returns {Object} Estadísticas calculadas
   */
  calcularEstadisticas: (historial) => {
    if (!historial || !historial.data) {
      return null;
    }

    const { consultas, vacunas, desparasitaciones, alergias, cirugias } = historial.data;

    return {
      total_consultas: consultas?.length || 0,
      total_vacunas: vacunas?.length || 0,
      total_desparasitaciones: desparasitaciones?.length || 0,
      alergias_activas: alergias?.length || 0,
      cirugias_realizadas: cirugias?.length || 0,
      ultima_consulta: consultas && consultas.length > 0 ? consultas[0].fecha_consulta : null,
      proxima_vacuna: vacunas && vacunas.length > 0
        ? vacunas.find(v => v.fecha_proxima && new Date(v.fecha_proxima) > new Date())?.fecha_proxima
        : null
    };
  }
};

export default historialService;
