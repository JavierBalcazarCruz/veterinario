/**
 * =====================================================
 * UTILIDADES PARA EXPORTAR HISTORIAL CLÍNICO A EXCEL
 * =====================================================
 * Genera archivos Excel del historial médico con formato profesional
 */

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exportar historial completo a Excel
 * @param {Object} patient - Datos del paciente
 * @param {Object} historial - Historial clínico completo
 */
export const exportarHistorialExcel = (patient, historial) => {
  // Crear un nuevo workbook
  const wb = XLSX.utils.book_new();

  // =====================================================
  // HOJA 1: INFORMACIÓN DEL PACIENTE
  // =====================================================
  const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const infoPaciente = [
    // Header - Espacio para logo
    [''],
    [''],
    [''],
    ['', '', '', '', 'HISTORIAL CLÍNICO VETERINARIO'],
    ['', '', '', '', 'MollyVet - Sistema de Gestión Veterinaria'],
    ['', '', '', '', `Generado: ${fechaGeneracion}`],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],

    // Información del Paciente
    ['📋 INFORMACIÓN DEL PACIENTE'],
    [''],
    ['Campo', 'Valor'],
    ['Nombre del Paciente', patient.nombre_mascota],
    ['Especie', patient.especie],
    ['Raza', patient.nombre_raza],
    ['Edad', patient.edad || 'No especificada'],
    ['Peso Actual', `${patient.peso} kg`],
    ['Género', patient.genero || 'No especificado'],
    ['Color/Señas', patient.color || 'No especificado'],
    ['Estado', patient.estado],
    ['Fecha de Registro', formatExcelDate(patient.created_at)],
    [''],

    // Información del Propietario
    ['👤 DATOS DEL PROPIETARIO'],
    [''],
    ['Campo', 'Valor'],
    ['Nombre Completo', `${patient.nombre_propietario} ${patient.apellidos_propietario}`],
    ['Teléfono Principal', patient.telefono_principal || 'No registrado'],
    ['Teléfono Secundario', patient.telefono_secundario || 'No registrado'],
    ['Email', patient.email || 'No registrado'],
    ['Dirección', patient.direccion || 'No registrada'],
    [''],

    // Resumen del Historial
    ['📊 RESUMEN DEL HISTORIAL'],
    [''],
    ['Total de Consultas', historial.consultas?.length || 0],
    ['Total de Vacunas', historial.vacunas?.length || 0],
    ['Total de Desparasitaciones', historial.desparasitaciones?.length || 0],
    ['Alergias Registradas', historial.alergias?.length || 0],
    ['Cirugías Realizadas', historial.cirugias?.length || 0],
    [''],
    ['━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'],
    [''],
    ['NOTA: Este documento contiene información médica confidencial del paciente.'],
    ['Para más información, consulte las pestañas adicionales de este documento.']
  ];

  const wsInfo = XLSX.utils.aoa_to_sheet(infoPaciente);

  // Configurar anchos de columna
  wsInfo['!cols'] = [
    { wch: 5 },   // A - Espacio para logo/margen
    { wch: 5 },   // B
    { wch: 5 },   // C
    { wch: 5 },   // D
    { wch: 30 },  // E - Campo
    { wch: 40 }   // F - Valor
  ];

  // Configurar alturas de fila para el header
  wsInfo['!rows'] = [
    { hpt: 30 },  // Row 1 - Logo espacio
    { hpt: 30 },  // Row 2 - Logo espacio
    { hpt: 30 },  // Row 3 - Logo espacio
    { hpt: 20 },  // Row 4 - Título
    { hpt: 15 },  // Row 5 - Subtítulo
    { hpt: 15 }   // Row 6 - Fecha
  ];

  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Paciente');

  // =====================================================
  // HOJA 2: CONSULTAS MÉDICAS
  // =====================================================
  if (historial.consultas && historial.consultas.length > 0) {
    const consultasData = [
      [''],
      [''],
      [''],
      ['🏥 CONSULTAS MÉDICAS'],
      [`Paciente: ${patient.nombre_mascota}`],
      [`Total de consultas: ${historial.consultas.length}`],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      // Header de tabla
      ['Fecha', 'Motivo de Consulta', 'Diagnóstico', 'Tratamiento', 'Peso (kg)', 'Temp (°C)', 'FC', 'FR', 'Doctor', 'Observaciones'],
      ['----------', '---------------', '-----------', '-----------', '--------', '---------', '----', '----', '------', '-------------']
    ];

    historial.consultas.forEach((c, index) => {
      consultasData.push([
        formatExcelDate(c.fecha_consulta),
        c.motivo_consulta || 'No especificado',
        c.diagnostico || 'Pendiente',
        c.tratamiento || 'No prescrito',
        c.peso_actual || 'N/A',
        c.temperatura || 'N/A',
        c.frecuencia_cardiaca || 'N/A',
        c.frecuencia_respiratoria || 'N/A',
        c.veterinario || 'No registrado',
        c.observaciones || ''
      ]);
    });

    // Separador final
    consultasData.push(['']);
    consultasData.push(['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════']);
    consultasData.push(['']);
    consultasData.push([`Documento generado el ${fechaGeneracion}`]);

    const wsConsultas = XLSX.utils.aoa_to_sheet(consultasData);

    // Configurar anchos de columna optimizados
    wsConsultas['!cols'] = [
      { wch: 18 },  // Fecha
      { wch: 25 },  // Motivo
      { wch: 25 },  // Diagnóstico
      { wch: 25 },  // Tratamiento
      { wch: 10 },  // Peso
      { wch: 10 },  // Temperatura
      { wch: 8 },   // FC
      { wch: 8 },   // FR
      { wch: 20 },  // Doctor
      { wch: 35 }   // Observaciones
    ];

    XLSX.utils.book_append_sheet(wb, wsConsultas, 'Consultas');
  }

  // =====================================================
  // HOJA 3: VACUNAS
  // =====================================================
  if (historial.vacunas && historial.vacunas.length > 0) {
    const vacunasData = [
      [''],
      [''],
      [''],
      ['💉 REGISTRO DE VACUNACIÓN'],
      [`Paciente: ${patient.nombre_mascota}`],
      [`Total de vacunas: ${historial.vacunas.length}`],
      [''],
      ['═════════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['Fecha Aplicación', 'Tipo de Vacuna', 'Lote/Serie', 'Veterinario', 'Próxima Dosis', 'Estado'],
      ['--------------', '--------------', '-----------', '-----------', '-------------', '------']
    ];

    historial.vacunas.forEach(v => {
      const fechaProxima = v.fecha_proxima ? formatExcelDate(v.fecha_proxima) : 'No programada';
      const estado = v.fecha_proxima && new Date(v.fecha_proxima) < new Date() ? '⚠️ Vencida' : '✓ Al día';

      vacunasData.push([
        formatExcelDate(v.fecha_aplicacion),
        v.tipo_vacuna,
        v.lote_vacuna || 'No registrado',
        v.veterinario || 'No registrado',
        fechaProxima,
        estado
      ]);
    });

    vacunasData.push(['']);
    vacunasData.push(['═════════════════════════════════════════════════════════════════════════════════════════════════']);
    vacunasData.push(['']);
    vacunasData.push([`Documento generado el ${fechaGeneracion}`]);

    const wsVacunas = XLSX.utils.aoa_to_sheet(vacunasData);
    wsVacunas['!cols'] = [
      { wch: 18 },  // Fecha
      { wch: 30 },  // Tipo
      { wch: 18 },  // Lote
      { wch: 20 },  // Veterinario
      { wch: 18 },  // Próxima
      { wch: 12 }   // Estado
    ];
    XLSX.utils.book_append_sheet(wb, wsVacunas, 'Vacunas');
  }

  // =====================================================
  // HOJA 4: DESPARASITACIONES
  // =====================================================
  if (historial.desparasitaciones && historial.desparasitaciones.length > 0) {
    const despData = [
      [''],
      [''],
      [''],
      ['🐛 CONTROL DE PARÁSITOS'],
      [`Paciente: ${patient.nombre_mascota}`],
      [`Total de tratamientos: ${historial.desparasitaciones.length}`],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['Fecha Aplicación', 'Producto Utilizado', 'Dosis Administrada', 'Peso (kg)', 'Veterinario', 'Próxima Dosis'],
      ['--------------', '------------------', '-----------------', '---------', '-----------', '-------------']
    ];

    historial.desparasitaciones.forEach(d => {
      despData.push([
        formatExcelDate(d.fecha_aplicacion),
        d.producto,
        d.dosis,
        d.peso_actual || 'No registrado',
        d.veterinario || 'No registrado',
        d.fecha_proxima ? formatExcelDate(d.fecha_proxima) : 'No programada'
      ]);
    });

    despData.push(['']);
    despData.push(['═══════════════════════════════════════════════════════════════════════════════════════════']);
    despData.push(['']);
    despData.push([`Documento generado el ${fechaGeneracion}`]);

    const wsDesp = XLSX.utils.aoa_to_sheet(despData);
    wsDesp['!cols'] = [
      { wch: 18 },  // Fecha
      { wch: 25 },  // Producto
      { wch: 20 },  // Dosis
      { wch: 12 },  // Peso
      { wch: 20 },  // Veterinario
      { wch: 18 }   // Próxima
    ];
    XLSX.utils.book_append_sheet(wb, wsDesp, 'Desparasitaciones');
  }

  // =====================================================
  // HOJA 5: ALERGIAS
  // =====================================================
  if (historial.alergias && historial.alergias.length > 0) {
    const alergiasData = [
      [''],
      [''],
      [''],
      ['⚠️ REGISTRO DE ALERGIAS - INFORMACIÓN CRÍTICA'],
      [`Paciente: ${patient.nombre_mascota}`],
      [`Total de alergias registradas: ${historial.alergias.length}`],
      ['⚠️ ADVERTENCIA: Consulte este registro antes de administrar medicamentos'],
      [''],
      ['═════════════════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['Alérgeno', 'Tipo de Alergia', 'Severidad', 'Síntomas Observados', 'Fecha Detección', 'Estado'],
      ['--------', '---------------', '---------', '-------------------', '---------------', '------']
    ];

    historial.alergias.forEach(a => {
      const severidadIcon = a.severidad === 'Alta' ? '🔴' : a.severidad === 'Media' ? '🟡' : '🟢';

      alergiasData.push([
        a.nombre_alergeno,
        a.tipo_alergia,
        `${severidadIcon} ${a.severidad}`,
        a.sintomas || 'No especificados',
        a.fecha_deteccion ? formatExcelDate(a.fecha_deteccion) : 'No registrada',
        a.activa ? '✓ ACTIVA' : 'Inactiva'
      ]);
    });

    alergiasData.push(['']);
    alergiasData.push(['═════════════════════════════════════════════════════════════════════════════════════════════════════════']);
    alergiasData.push(['']);
    alergiasData.push(['⚠️ IMPORTANTE: Este paciente presenta alergias registradas. Verifique antes de administrar medicamentos.']);
    alergiasData.push([`Documento generado el ${fechaGeneracion}`]);

    const wsAlergias = XLSX.utils.aoa_to_sheet(alergiasData);
    wsAlergias['!cols'] = [
      { wch: 25 },  // Alérgeno
      { wch: 18 },  // Tipo
      { wch: 15 },  // Severidad
      { wch: 35 },  // Síntomas
      { wch: 18 },  // Fecha
      { wch: 12 }   // Estado
    ];
    XLSX.utils.book_append_sheet(wb, wsAlergias, 'Alergias');
  }

  // =====================================================
  // HOJA 6: CIRUGÍAS Y PROCEDIMIENTOS
  // =====================================================
  if (historial.cirugias && historial.cirugias.length > 0) {
    const cirugiasData = [
      [''],
      [''],
      [''],
      ['🔪 REGISTRO DE CIRUGÍAS Y PROCEDIMIENTOS'],
      [`Paciente: ${patient.nombre_mascota}`],
      [`Total de cirugías: ${historial.cirugias.length}`],
      [''],
      ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
      [''],
      ['Fecha', 'Tipo', 'Procedimiento', 'Cirujano', 'Duración', 'Anestesia', 'Resultado', 'Complicaciones', 'Notas'],
      ['-----', '----', '------------', '--------', '--------', '---------', '---------', '--------------', '-----']
    ];

    historial.cirugias.forEach(c => {
      cirugiasData.push([
        formatExcelDate(c.fecha_realizacion),
        c.tipo,
        c.nombre,
        c.veterinario || 'No registrado',
        c.duracion_minutos ? `${c.duracion_minutos} min` : 'N/A',
        c.anestesia_utilizada || 'No especificada',
        c.resultado,
        c.complicaciones || 'Ninguna',
        c.notas || ''
      ]);
    });

    cirugiasData.push(['']);
    cirugiasData.push(['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════']);
    cirugiasData.push(['']);
    cirugiasData.push([`Documento generado el ${fechaGeneracion}`]);

    const wsCirugias = XLSX.utils.aoa_to_sheet(cirugiasData);
    wsCirugias['!cols'] = [
      { wch: 18 },  // Fecha
      { wch: 15 },  // Tipo
      { wch: 30 },  // Procedimiento
      { wch: 20 },  // Cirujano
      { wch: 12 },  // Duración
      { wch: 18 },  // Anestesia
      { wch: 15 },  // Resultado
      { wch: 30 },  // Complicaciones
      { wch: 35 }   // Notas
    ];
    XLSX.utils.book_append_sheet(wb, wsCirugias, 'Cirugías');
  }

  // =====================================================
  // HOJA 7: RESUMEN ESTADÍSTICO
  // =====================================================
  const statsData = [
    [''],
    [''],
    [''],
    ['📊 RESUMEN ESTADÍSTICO DEL HISTORIAL CLÍNICO'],
    [`Paciente: ${patient.nombre_mascota}`],
    [`Fecha de análisis: ${fechaGeneracion}`],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════════'],
    [''],
    ['INDICADOR', 'CANTIDAD', 'ESTADO'],
    ['---------', '--------', '------'],
    ['Total de Consultas Médicas', historial.consultas?.length || 0, historial.consultas?.length > 0 ? '✓' : '○'],
    ['Total de Vacunas Aplicadas', historial.vacunas?.length || 0, historial.vacunas?.length > 0 ? '✓' : '○'],
    ['Total de Desparasitaciones', historial.desparasitaciones?.length || 0, historial.desparasitaciones?.length > 0 ? '✓' : '○'],
    ['Alergias Registradas', historial.alergias?.length || 0, historial.alergias?.length > 0 ? '⚠️' : '✓'],
    ['Cirugías/Procedimientos', historial.cirugias?.length || 0, historial.cirugias?.length > 0 ? '✓' : '○'],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════════'],
    [''],
    ['ESTADO DEL PACIENTE'],
    [''],
    ['Estado Actual', patient.estado],
    ['Última Actualización', formatExcelDate(patient.updated_at || patient.created_at)],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════════'],
    [''],
    ['NOTAS IMPORTANTES:'],
    ['• Este resumen proporciona una visión general del historial clínico'],
    ['• Consulte las pestañas individuales para información detallada'],
    ['• Mantenga este documento actualizado después de cada consulta'],
    historial.alergias?.length > 0 ? ['• ⚠️ ATENCIÓN: El paciente tiene alergias registradas'] : [''],
    [''],
    [`Documento generado por MollyVet el ${fechaGeneracion}`]
  ];

  const wsStats = XLSX.utils.aoa_to_sheet(statsData);
  wsStats['!cols'] = [
    { wch: 35 },  // Indicador
    { wch: 15 },  // Cantidad
    { wch: 12 }   // Estado
  ];
  XLSX.utils.book_append_sheet(wb, wsStats, 'Resumen');

  // =====================================================
  // GUARDAR ARCHIVO
  // =====================================================
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fileName = `Historial_${patient.nombre_mascota}_${new Date().toISOString().split('T')[0]}.xlsx`;

  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    fileName
  );
};

/**
 * Exportar timeline a Excel
 * @param {Object} patient - Datos del paciente
 * @param {Array} timelineItems - Items del timeline
 */
export const exportarTimelineExcel = (patient, timelineItems) => {
  const wb = XLSX.utils.book_new();

  const fechaGeneracion = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const timelineData = [
    // Header
    [''],
    [''],
    [''],
    ['', '', '', '', '🕐 LÍNEA DE TIEMPO - HISTORIAL CLÍNICO'],
    ['', '', '', '', 'MollyVet - Sistema de Gestión Veterinaria'],
    ['', '', '', '', `Generado: ${fechaGeneracion}`],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
    [''],
    ['INFORMACIÓN DEL PACIENTE'],
    [''],
    ['Nombre', patient.nombre_mascota],
    ['Especie/Raza', `${patient.especie} - ${patient.nombre_raza}`],
    ['Propietario', `${patient.nombre_propietario} ${patient.apellidos_propietario}`],
    [''],
    ['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════'],
    [''],
    [`CRONOLOGÍA DE EVENTOS - Total: ${timelineItems.length} registros`],
    [''],
    // Tabla de timeline
    ['Fecha y Hora', 'Categoría', 'Evento', 'Descripción/Detalles'],
    ['-----------', '---------', '------', '-------------------']
  ];

  // Agregar eventos cronológicos
  timelineItems.forEach(item => {
    const iconoTipo = {
      'consulta': '🏥',
      'vacuna': '💉',
      'desparasitacion': '🐛',
      'alergia': '⚠️',
      'cirugia': '🔪'
    };

    timelineData.push([
      item.fecha.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      `${iconoTipo[item.tipo] || '📋'} ${item.tipo.toUpperCase()}`,
      item.titulo,
      item.subtitulo || 'Sin detalles adicionales'
    ]);
  });

  // Footer
  timelineData.push(['']);
  timelineData.push(['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════']);
  timelineData.push(['']);
  timelineData.push(['RESUMEN POR CATEGORÍA']);
  timelineData.push(['']);

  // Contador de eventos por tipo
  const contadores = timelineItems.reduce((acc, item) => {
    acc[item.tipo] = (acc[item.tipo] || 0) + 1;
    return acc;
  }, {});

  Object.entries(contadores).forEach(([tipo, cantidad]) => {
    timelineData.push([tipo.charAt(0).toUpperCase() + tipo.slice(1), cantidad]);
  });

  timelineData.push(['']);
  timelineData.push(['═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════']);
  timelineData.push(['']);
  timelineData.push([`Documento generado por MollyVet el ${fechaGeneracion}`]);
  timelineData.push(['Este documento presenta una vista cronológica de todos los eventos del historial clínico']);

  const ws = XLSX.utils.aoa_to_sheet(timelineData);

  // Configurar anchos de columna
  ws['!cols'] = [
    { wch: 5 },   // Margen
    { wch: 5 },
    { wch: 5 },
    { wch: 5 },
    { wch: 20 },  // Fecha
    { wch: 18 },  // Categoría
    { wch: 35 },  // Evento
    { wch: 45 }   // Descripción
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Timeline Cronológico');

  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const fileName = `Timeline_${patient.nombre_mascota}_${new Date().toISOString().split('T')[0]}.xlsx`;

  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    fileName
  );
};

/**
 * Formatear fecha para Excel
 */
function formatExcelDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export default {
  exportarHistorialExcel,
  exportarTimelineExcel
};
