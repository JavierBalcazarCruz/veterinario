/**
 * =====================================================
 * SERVICIO DE NOTIFICACIONES Y RECORDATORIOS
 * =====================================================
 * Maneja la generación y gestión de notificaciones
 * y recordatorios médicos para pacientes
 */

import { differenceInDays, addMonths, addDays, isPast, isFuture } from 'date-fns';

/**
 * Tipos de notificación
 */
export const TIPO_NOTIFICACION = {
  VACUNA_PROXIMA: 'vacuna_proxima',
  VACUNA_ATRASADA: 'vacuna_atrasada',
  DESPARASITACION_PROXIMA: 'desparasitacion_proxima',
  DESPARASITACION_ATRASADA: 'desparasitacion_atrasada',
  CONSULTA_SEGUIMIENTO: 'consulta_seguimiento',
  EXAMEN_PENDIENTE: 'examen_pendiente',
  ALERGIA_ACTIVA: 'alergia_activa',
  PESO_ANORMAL: 'peso_anormal',
  TEMPERATURA_ANORMAL: 'temperatura_anormal'
};

/**
 * Prioridades de notificación
 */
export const PRIORIDAD = {
  ALTA: 'alta',
  MEDIA: 'media',
  BAJA: 'baja'
};

/**
 * Servicio de notificaciones
 */
export const notificacionesService = {
  /**
   * Generar notificaciones para un paciente
   * @param {Object} paciente - Datos del paciente
   * @param {Object} historial - Historial clínico
   * @returns {Array} Lista de notificaciones
   */
  generarNotificaciones: (paciente, historial) => {
    const notificaciones = [];

    if (!historial) return notificaciones;

    // Notificaciones de vacunas
    notificaciones.push(...notificacionesService.verificarVacunas(historial.vacunas || []));

    // Notificaciones de desparasitaciones
    notificaciones.push(...notificacionesService.verificarDesparasitaciones(historial.desparasitaciones || []));

    // Notificaciones de alergias
    notificaciones.push(...notificacionesService.verificarAlergias(historial.alergias || []));

    // Notificaciones de signos vitales
    if (historial.consultas && historial.consultas.length > 0) {
      notificaciones.push(...notificacionesService.verificarSignosVitales(
        historial.consultas[0],
        paciente
      ));
    }

    // Notificaciones de seguimiento
    if (historial.consultas && historial.consultas.length > 0) {
      notificaciones.push(...notificacionesService.verificarSeguimiento(historial.consultas));
    }

    // Ordenar por prioridad (alta -> baja) y fecha
    return notificaciones.sort((a, b) => {
      const prioridadOrden = { alta: 1, media: 2, baja: 3 };
      if (prioridadOrden[a.prioridad] !== prioridadOrden[b.prioridad]) {
        return prioridadOrden[a.prioridad] - prioridadOrden[b.prioridad];
      }
      return new Date(a.fecha) - new Date(b.fecha);
    });
  },

  /**
   * Verificar vacunas pendientes o atrasadas
   */
  verificarVacunas: (vacunas) => {
    const notificaciones = [];
    const hoy = new Date();

    vacunas.forEach(vacuna => {
      if (vacuna.fecha_proxima) {
        const fechaProxima = new Date(vacuna.fecha_proxima);
        const diasRestantes = differenceInDays(fechaProxima, hoy);

        if (diasRestantes < 0) {
          // Vacuna atrasada
          notificaciones.push({
            id: `vacuna-atrasada-${vacuna.id}`,
            tipo: TIPO_NOTIFICACION.VACUNA_ATRASADA,
            prioridad: Math.abs(diasRestantes) > 30 ? PRIORIDAD.ALTA : PRIORIDAD.MEDIA,
            titulo: `Vacuna ${vacuna.tipo_vacuna} atrasada`,
            mensaje: `Esta vacuna está atrasada ${Math.abs(diasRestantes)} días`,
            fecha: vacuna.fecha_proxima,
            datos: vacuna,
            icono: '⚠️',
            color: 'red'
          });
        } else if (diasRestantes <= 7) {
          // Vacuna próxima (en menos de 7 días)
          notificaciones.push({
            id: `vacuna-proxima-${vacuna.id}`,
            tipo: TIPO_NOTIFICACION.VACUNA_PROXIMA,
            prioridad: diasRestantes <= 3 ? PRIORIDAD.ALTA : PRIORIDAD.MEDIA,
            titulo: `Vacuna ${vacuna.tipo_vacuna} próxima`,
            mensaje: `Faltan ${diasRestantes} día(s) para la próxima dosis`,
            fecha: vacuna.fecha_proxima,
            datos: vacuna,
            icono: '💉',
            color: 'yellow'
          });
        } else if (diasRestantes <= 14) {
          // Vacuna en 2 semanas
          notificaciones.push({
            id: `vacuna-proxima-${vacuna.id}`,
            tipo: TIPO_NOTIFICACION.VACUNA_PROXIMA,
            prioridad: PRIORIDAD.BAJA,
            titulo: `Vacuna ${vacuna.tipo_vacuna} programada`,
            mensaje: `Próxima dosis en ${diasRestantes} días`,
            fecha: vacuna.fecha_proxima,
            datos: vacuna,
            icono: '💉',
            color: 'blue'
          });
        }
      }
    });

    return notificaciones;
  },

  /**
   * Verificar desparasitaciones pendientes
   */
  verificarDesparasitaciones: (desparasitaciones) => {
    const notificaciones = [];
    const hoy = new Date();

    desparasitaciones.forEach(desp => {
      if (desp.fecha_proxima) {
        const fechaProxima = new Date(desp.fecha_proxima);
        const diasRestantes = differenceInDays(fechaProxima, hoy);

        if (diasRestantes < 0) {
          notificaciones.push({
            id: `desp-atrasada-${desp.id}`,
            tipo: TIPO_NOTIFICACION.DESPARASITACION_ATRASADA,
            prioridad: Math.abs(diasRestantes) > 60 ? PRIORIDAD.ALTA : PRIORIDAD.MEDIA,
            titulo: `Desparasitación atrasada`,
            mensaje: `Está atrasada ${Math.abs(diasRestantes)} días`,
            fecha: desp.fecha_proxima,
            datos: desp,
            icono: '🐛',
            color: 'red'
          });
        } else if (diasRestantes <= 7) {
          notificaciones.push({
            id: `desp-proxima-${desp.id}`,
            tipo: TIPO_NOTIFICACION.DESPARASITACION_PROXIMA,
            prioridad: PRIORIDAD.MEDIA,
            titulo: `Desparasitación próxima`,
            mensaje: `Programada en ${diasRestantes} día(s)`,
            fecha: desp.fecha_proxima,
            datos: desp,
            icono: '🐛',
            color: 'purple'
          });
        }
      }
    });

    // Si no hay desparasitación reciente (más de 3 meses)
    if (desparasitaciones.length > 0) {
      const ultimaDesp = desparasitaciones[0];
      const fechaUltima = new Date(ultimaDesp.fecha_aplicacion);
      const diasDesdeUltima = differenceInDays(hoy, fechaUltima);

      if (diasDesdeUltima > 90 && !ultimaDesp.fecha_proxima) {
        notificaciones.push({
          id: `desp-programar`,
          tipo: TIPO_NOTIFICACION.DESPARASITACION_ATRASADA,
          prioridad: PRIORIDAD.MEDIA,
          titulo: 'Programar desparasitación',
          mensaje: `Han pasado ${diasDesdeUltima} días desde la última desparasitación`,
          fecha: hoy,
          icono: '🐛',
          color: 'orange'
        });
      }
    }

    return notificaciones;
  },

  /**
   * Verificar alergias activas
   */
  verificarAlergias: (alergias) => {
    const notificaciones = [];

    alergias.forEach(alergia => {
      if (alergia.activa) {
        const prioridad = alergia.severidad === 'critica' ? PRIORIDAD.ALTA :
                         alergia.severidad === 'severa' ? PRIORIDAD.ALTA :
                         alergia.severidad === 'moderada' ? PRIORIDAD.MEDIA :
                         PRIORIDAD.BAJA;

        notificaciones.push({
          id: `alergia-${alergia.id}`,
          tipo: TIPO_NOTIFICACION.ALERGIA_ACTIVA,
          prioridad: prioridad,
          titulo: `Alergia activa: ${alergia.nombre_alergeno}`,
          mensaje: `Severidad: ${alergia.severidad}. ${alergia.sintomas || ''}`,
          fecha: new Date(),
          datos: alergia,
          icono: '⚠️',
          color: prioridad === PRIORIDAD.ALTA ? 'red' : 'orange'
        });
      }
    });

    return notificaciones;
  },

  /**
   * Verificar signos vitales anormales
   */
  verificarSignosVitales: (ultimaConsulta, paciente) => {
    const notificaciones = [];

    if (!ultimaConsulta) return notificaciones;

    // Verificar peso
    if (ultimaConsulta.peso_actual) {
      const pesoActual = parseFloat(ultimaConsulta.peso_actual);
      const pesoAnterior = parseFloat(paciente.peso);

      if (pesoAnterior > 0) {
        const porcentajeCambio = ((pesoActual - pesoAnterior) / pesoAnterior) * 100;

        if (Math.abs(porcentajeCambio) > 10) {
          notificaciones.push({
            id: 'peso-anormal',
            tipo: TIPO_NOTIFICACION.PESO_ANORMAL,
            prioridad: Math.abs(porcentajeCambio) > 20 ? PRIORIDAD.ALTA : PRIORIDAD.MEDIA,
            titulo: 'Cambio significativo de peso',
            mensaje: `El peso ha ${porcentajeCambio > 0 ? 'aumentado' : 'disminuido'} un ${Math.abs(porcentajeCambio).toFixed(1)}%`,
            fecha: ultimaConsulta.fecha_consulta,
            icono: '⚖️',
            color: 'yellow'
          });
        }
      }
    }

    // Verificar temperatura
    if (ultimaConsulta.temperatura) {
      const temp = parseFloat(ultimaConsulta.temperatura);

      // Rangos normales: 38-39.5°C
      if (temp < 37.5 || temp > 39.5) {
        notificaciones.push({
          id: 'temperatura-anormal',
          tipo: TIPO_NOTIFICACION.TEMPERATURA_ANORMAL,
          prioridad: temp < 36 || temp > 40 ? PRIORIDAD.ALTA : PRIORIDAD.MEDIA,
          titulo: temp < 37.5 ? 'Temperatura baja' : 'Temperatura elevada',
          mensaje: `Temperatura registrada: ${temp}°C (normal: 38-39.5°C)`,
          fecha: ultimaConsulta.fecha_consulta,
          icono: '🌡️',
          color: temp < 36 || temp > 40 ? 'red' : 'orange'
        });
      }
    }

    return notificaciones;
  },

  /**
   * Verificar necesidad de consultas de seguimiento
   */
  verificarSeguimiento: (consultas) => {
    const notificaciones = [];

    if (!consultas || consultas.length === 0) return notificaciones;

    const ultimaConsulta = consultas[0];
    const fechaUltima = new Date(ultimaConsulta.fecha_consulta);
    const hoy = new Date();
    const diasDesdeUltima = differenceInDays(hoy, fechaUltima);

    // Si tiene diagnóstico o tratamiento y han pasado más de 30 días
    if ((ultimaConsulta.diagnostico || ultimaConsulta.tratamiento) && diasDesdeUltima > 30) {
      notificaciones.push({
        id: 'seguimiento',
        tipo: TIPO_NOTIFICACION.CONSULTA_SEGUIMIENTO,
        prioridad: diasDesdeUltima > 60 ? PRIORIDAD.MEDIA : PRIORIDAD.BAJA,
        titulo: 'Consulta de seguimiento sugerida',
        mensaje: `Han pasado ${diasDesdeUltima} días desde el último diagnóstico/tratamiento`,
        fecha: hoy,
        icono: '📋',
        color: 'blue'
      });
    }

    return notificaciones;
  },

  /**
   * Filtrar notificaciones por prioridad
   */
  filtrarPorPrioridad: (notificaciones, prioridad) => {
    return notificaciones.filter(n => n.prioridad === prioridad);
  },

  /**
   * Filtrar notificaciones por tipo
   */
  filtrarPorTipo: (notificaciones, tipo) => {
    return notificaciones.filter(n => n.tipo === tipo);
  },

  /**
   * Obtener conteo de notificaciones por prioridad
   */
  obtenerConteo: (notificaciones) => {
    return {
      alta: notificaciones.filter(n => n.prioridad === PRIORIDAD.ALTA).length,
      media: notificaciones.filter(n => n.prioridad === PRIORIDAD.MEDIA).length,
      baja: notificaciones.filter(n => n.prioridad === PRIORIDAD.BAJA).length,
      total: notificaciones.length
    };
  }
};

export default notificacionesService;
