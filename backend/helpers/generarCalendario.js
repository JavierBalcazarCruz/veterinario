import { createEvent } from 'ics';

/**
 * Genera un archivo .ics (iCalendar) para agregar la cita al calendario
 * Compatible con Google Calendar, Apple Calendar, Outlook, etc.
 * @param {Object} datos - Datos de la cita
 * @returns {Promise<Object>} Objeto con el contenido del archivo .ics
 */
const generarCalendario = async (datos) => {
    const {
        nombre_mascota,
        fecha,
        hora,
        tipo,
        tipo_servicio,
        nombre_doctor,
        duracion_minutos = 30,
        notas,
        direccion_clinica,
        nombre_propietario
    } = datos;

    // Parsear fecha y hora
    const fechaCita = new Date(`${fecha}T${hora}`);

    // Calcular fecha de fin (agregar duración)
    const fechaFin = new Date(fechaCita.getTime() + duracion_minutos * 60000);

    // Preparar datos para el evento
    const año = fechaCita.getFullYear();
    const mes = fechaCita.getMonth() + 1; // getMonth() retorna 0-11
    const dia = fechaCita.getDate();
    const horaCita = fechaCita.getHours();
    const minutos = fechaCita.getMinutes();

    // Año, mes, día, hora fin, minutos fin
    const añoFin = fechaFin.getFullYear();
    const mesFin = fechaFin.getMonth() + 1;
    const diaFin = fechaFin.getDate();
    const horaFin = fechaFin.getHours();
    const minutosFin = fechaFin.getMinutes();

    // Mapear tipos de consulta/servicio
    const tiposConsulta = {
        'primera_vez': 'Primera Consulta',
        'seguimiento': 'Consulta de Seguimiento',
        'urgencia': 'Consulta de Urgencia',
        'vacunacion': 'Vacunación'
    };

    const tiposEstetica = {
        'baño': 'Servicio de Baño',
        'corte': 'Servicio de Corte',
        'baño_corte': 'Baño y Corte',
        'uñas': 'Corte de Uñas',
        'limpieza_dental': 'Limpieza Dental',
        'spa_premium': 'Spa Premium',
        'deslanado': 'Deslanado',
        'tratamiento_pulgas': 'Tratamiento Anti-pulgas',
        'otro': 'Servicio de Estética'
    };

    const esCitaMedica = tipo === 'medica';
    const servicioDescripcion = esCitaMedica
        ? tiposConsulta[tipo_servicio] || 'Consulta Veterinaria'
        : tiposEstetica[tipo_servicio] || 'Servicio de Estética';

    // Título del evento
    const titulo = `${servicioDescripcion} - ${nombre_mascota}`;

    // Descripción detallada
    let descripcion = `Cita ${esCitaMedica ? 'Médica' : 'de Estética'} para ${nombre_mascota}\n\n`;
    descripcion += `Tipo: ${servicioDescripcion}\n`;
    descripcion += `Propietario: ${nombre_propietario}\n`;

    if (nombre_doctor) {
        descripcion += `Doctor: ${nombre_doctor}\n`;
    }

    if (notas) {
        descripcion += `\nNotas: ${notas}\n`;
    }

    descripcion += `\n🏥 MollyVet - Sistema de Gestión Veterinaria`;

    // Ubicación
    const ubicacion = direccion_clinica || 'MollyVet - Clínica Veterinaria';

    // Alarmas (recordatorios)
    const alarmas = [
        {
            action: 'display',
            description: `Recordatorio: Cita de ${nombre_mascota}`,
            trigger: { hours: 24, minutes: 0, before: true }
        },
        {
            action: 'display',
            description: `Recordatorio: Cita de ${nombre_mascota} en 2 horas`,
            trigger: { hours: 2, minutes: 0, before: true }
        }
    ];

    // Crear evento
    const evento = {
        start: [año, mes, dia, horaCita, minutos],
        end: [añoFin, mesFin, diaFin, horaFin, minutosFin],
        title: titulo,
        description: descripcion,
        location: ubicacion,
        status: 'CONFIRMED',
        busyStatus: 'BUSY',
        organizer: { name: 'MollyVet', email: 'citas@mollyvet.com' },
        alarms: alarmas,
        categories: [esCitaMedica ? 'Consulta Veterinaria' : 'Estética Veterinaria'],
        url: `${process.env.FRONTEND_URL}/citas`
    };

    return new Promise((resolve, reject) => {
        createEvent(evento, (error, value) => {
            if (error) {
                console.error('❌ Error al generar archivo .ics:', error);
                reject(error);
                return;
            }

            console.log('✅ Archivo .ics generado exitosamente');
            resolve({
                success: true,
                content: value,
                filename: `cita_${nombre_mascota.replace(/\s/g, '_')}_${fecha}.ics`
            });
        });
    });
};

/**
 * Genera múltiples eventos de calendario (para recordatorios recurrentes)
 * @param {Array} citas - Array de citas
 * @returns {Promise<Object>} Objeto con el contenido del archivo .ics
 */
const generarCalendarioMultiple = async (citas) => {
    const eventos = [];

    for (const cita of citas) {
        const evento = await generarCalendario(cita);
        eventos.push(evento.content);
    }

    return {
        success: true,
        content: eventos.join('\n'),
        filename: `mis_citas_mollyvet.ics`,
        total: citas.length
    };
};

export { generarCalendario, generarCalendarioMultiple };
export default generarCalendario;
