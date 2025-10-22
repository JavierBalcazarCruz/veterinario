/**
 * =====================================================
 * UTILIDADES PARA EXPORTAR HISTORIAL CLÍNICO A EXCEL
 * =====================================================
 * Genera archivos Excel del historial médico
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
  const infoPaciente = [
    ['INFORMACIÓN DEL PACIENTE'],
    [],
    ['Nombre', patient.nombre_mascota],
    ['Especie', patient.especie],
    ['Raza', patient.nombre_raza],
    ['Edad', patient.edad || 'No especificada'],
    ['Peso', `${patient.peso} kg`],
    ['Estado', patient.estado],
    ['Fecha de Registro', new Date(patient.created_at).toLocaleDateString('es-MX')],
    [],
    ['PROPIETARIO'],
    [],
    ['Nombre', `${patient.nombre_propietario} ${patient.apellidos_propietario}`],
    ['Teléfono', patient.telefono_principal || 'No registrado'],
    ['Email', patient.email || 'No registrado']
  ];

  const wsInfo = XLSX.utils.aoa_to_sheet(infoPaciente);
  XLSX.utils.book_append_sheet(wb, wsInfo, 'Info Paciente');

  // =====================================================
  // HOJA 2: CONSULTAS MÉDICAS
  // =====================================================
  if (historial.consultas && historial.consultas.length > 0) {
    const consultasData = [
      ['Fecha', 'Motivo', 'Diagnóstico', 'Tratamiento', 'Peso (kg)', 'Temp (°C)', 'Doctor', 'Observaciones']
    ];

    historial.consultas.forEach(c => {
      consultasData.push([
        formatExcelDate(c.fecha_consulta),
        c.motivo_consulta,
        c.diagnostico || '',
        c.tratamiento || '',
        c.peso_actual || '',
        c.temperatura || '',
        c.veterinario || '',
        c.observaciones || ''
      ]);
    });

    const wsConsultas = XLSX.utils.aoa_to_sheet(consultasData);

    // Auto-width columns
    const maxWidth = consultasData.reduce((w, r) => Math.max(w, r.length), 10);
    wsConsultas['!cols'] = Array(maxWidth).fill({ wch: 15 });

    XLSX.utils.book_append_sheet(wb, wsConsultas, 'Consultas');
  }

  // =====================================================
  // HOJA 3: VACUNAS
  // =====================================================
  if (historial.vacunas && historial.vacunas.length > 0) {
    const vacunasData = [
      ['Fecha Aplicación', 'Tipo de Vacuna', 'Lote', 'Próxima Dosis', 'Notas']
    ];

    historial.vacunas.forEach(v => {
      vacunasData.push([
        formatExcelDate(v.fecha_aplicacion),
        v.tipo_vacuna,
        v.lote_vacuna || 'N/A',
        v.fecha_proxima ? formatExcelDate(v.fecha_proxima) : 'No programada',
        ''
      ]);
    });

    const wsVacunas = XLSX.utils.aoa_to_sheet(vacunasData);
    wsVacunas['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsVacunas, 'Vacunas');
  }

  // =====================================================
  // HOJA 4: DESPARASITACIONES
  // =====================================================
  if (historial.desparasitaciones && historial.desparasitaciones.length > 0) {
    const despData = [
      ['Fecha Aplicación', 'Producto', 'Dosis', 'Peso (kg)', 'Próxima Dosis']
    ];

    historial.desparasitaciones.forEach(d => {
      despData.push([
        formatExcelDate(d.fecha_aplicacion),
        d.producto,
        d.dosis,
        d.peso_actual || 'N/A',
        d.fecha_proxima ? formatExcelDate(d.fecha_proxima) : 'No programada'
      ]);
    });

    const wsDesp = XLSX.utils.aoa_to_sheet(despData);
    wsDesp['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsDesp, 'Desparasitaciones');
  }

  // =====================================================
  // HOJA 5: ALERGIAS
  // =====================================================
  if (historial.alergias && historial.alergias.length > 0) {
    const alergiasData = [
      ['Alérgeno', 'Tipo', 'Severidad', 'Síntomas', 'Fecha Detección', 'Activa']
    ];

    historial.alergias.forEach(a => {
      alergiasData.push([
        a.nombre_alergeno,
        a.tipo_alergia,
        a.severidad,
        a.sintomas || '',
        a.fecha_deteccion ? formatExcelDate(a.fecha_deteccion) : '',
        a.activa ? 'Sí' : 'No'
      ]);
    });

    const wsAlergias = XLSX.utils.aoa_to_sheet(alergiasData);
    wsAlergias['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 8 }];
    XLSX.utils.book_append_sheet(wb, wsAlergias, 'Alergias');
  }

  // =====================================================
  // HOJA 6: CIRUGÍAS
  // =====================================================
  if (historial.cirugias && historial.cirugias.length > 0) {
    const cirugiasData = [
      ['Fecha', 'Tipo', 'Nombre', 'Doctor', 'Duración (min)', 'Anestesia', 'Resultado', 'Complicaciones']
    ];

    historial.cirugias.forEach(c => {
      cirugiasData.push([
        formatExcelDate(c.fecha_realizacion),
        c.tipo,
        c.nombre,
        c.veterinario || '',
        c.duracion_minutos || '',
        c.anestesia_utilizada || '',
        c.resultado,
        c.complicaciones || 'Ninguna'
      ]);
    });

    const wsCirugias = XLSX.utils.aoa_to_sheet(cirugiasData);
    wsCirugias['!cols'] = [{ wch: 15 }, { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsCirugias, 'Cirugías');
  }

  // =====================================================
  // HOJA 7: ESTADÍSTICAS
  // =====================================================
  if (historial.estadisticas) {
    const statsData = [
      ['ESTADÍSTICAS DEL HISTORIAL'],
      [],
      ['Métrica', 'Valor'],
      ['Total Consultas', historial.estadisticas.total_consultas || 0],
      ['Total Vacunas', historial.estadisticas.total_vacunas || 0],
      ['Total Desparasitaciones', historial.estadisticas.total_desparasitaciones || 0],
      ['Alergias Activas', historial.estadisticas.alergias_activas || 0],
      ['Cirugías Realizadas', historial.estadisticas.cirugias_realizadas || 0],
      ['Exámenes Pendientes', historial.estadisticas.examenes_pendientes || 0]
    ];

    const wsStats = XLSX.utils.aoa_to_sheet(statsData);
    wsStats['!cols'] = [{ wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');
  }

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

  const timelineData = [
    ['Fecha', 'Tipo', 'Título', 'Descripción']
  ];

  timelineItems.forEach(item => {
    timelineData.push([
      item.fecha.toLocaleDateString('es-MX'),
      item.tipo,
      item.titulo,
      item.subtitulo || ''
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(timelineData);
  ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 40 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws, 'Timeline');

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
