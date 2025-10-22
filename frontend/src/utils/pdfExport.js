/**
 * =====================================================
 * UTILIDADES PARA EXPORTAR HISTORIAL CLÍNICO A PDF
 * =====================================================
 * Genera PDFs profesionales del historial médico
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Genera PDF del historial clínico completo
 * @param {Object} patient - Datos del paciente
 * @param {Object} historial - Historial clínico completo
 * @param {Array} timelineItems - Items del timeline (opcional)
 */
export const exportarHistorialPDF = (patient, historial, timelineItems = []) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 20;

  // =====================================================
  // ENCABEZADO
  // =====================================================
  doc.setFillColor(59, 130, 246); // Azul
  doc.rect(0, 0, pageWidth, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('HISTORIAL CLÍNICO VETERINARIO', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Generado el ${new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, pageWidth / 2, 28, { align: 'center' });

  yPos = 50;

  // =====================================================
  // INFORMACIÓN DEL PACIENTE
  // =====================================================
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('DATOS DEL PACIENTE', 14, yPos);
  yPos += 10;

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');

  const infoPaciente = [
    ['Nombre:', patient.nombre_mascota],
    ['Especie/Raza:', `${patient.especie} - ${patient.nombre_raza}`],
    ['Edad:', patient.edad || 'No especificada'],
    ['Peso:', `${patient.peso} kg`],
    ['Estado:', patient.estado === 'activo' ? 'Activo' : patient.estado],
    ['Propietario:', `${patient.nombre_propietario} ${patient.apellidos_propietario}`],
    ['Teléfono:', patient.telefono_principal || 'No registrado'],
    ['Email:', patient.email || 'No registrado']
  ];

  infoPaciente.forEach(([label, value]) => {
    doc.setFont(undefined, 'bold');
    doc.text(label, 14, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(value, 60, yPos);
    yPos += 7;
  });

  yPos += 5;

  // =====================================================
  // ALERGIAS (SI HAY)
  // =====================================================
  if (historial.alergias && historial.alergias.length > 0) {
    checkPageBreak();

    doc.setFillColor(239, 68, 68); // Rojo
    doc.rect(14, yPos - 5, pageWidth - 28, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('⚠️ ALERGIAS ACTIVAS', 16, yPos);
    yPos += 12;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    historial.alergias.forEach(alergia => {
      checkPageBreak();
      doc.setFont(undefined, 'bold');
      doc.text(`• ${alergia.nombre_alergeno}`, 16, yPos);
      doc.setFont(undefined, 'normal');
      doc.text(`(${alergia.tipo_alergia} - ${alergia.severidad})`, 70, yPos);
      yPos += 6;
      if (alergia.sintomas) {
        doc.setFontSize(9);
        doc.text(`  Síntomas: ${alergia.sintomas}`, 20, yPos);
        yPos += 5;
        doc.setFontSize(10);
      }
    });
    yPos += 5;
  }

  // =====================================================
  // CONSULTAS MÉDICAS
  // =====================================================
  if (historial.consultas && historial.consultas.length > 0) {
    checkPageBreak(20);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('CONSULTAS MÉDICAS', 14, yPos);
    yPos += 8;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    historial.consultas.forEach((consulta, index) => {
      checkPageBreak(40);

      // Caja para cada consulta
      const boxY = yPos;
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, boxY, pageWidth - 28, 35);

      yPos += 5;

      doc.setFont(undefined, 'bold');
      doc.text(`${index + 1}. ${consulta.motivo_consulta}`, 16, yPos);
      yPos += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Fecha: ${formatDate(consulta.fecha_consulta)}`, 16, yPos);
      yPos += 5;
      doc.text(`Doctor: ${consulta.veterinario || 'No especificado'}`, 16, yPos);
      yPos += 5;

      if (consulta.diagnostico) {
        doc.text(`Diagnóstico: ${consulta.diagnostico}`, 16, yPos);
        yPos += 5;
      }

      if (consulta.peso_actual || consulta.temperatura) {
        let signosVitales = 'Signos vitales: ';
        if (consulta.peso_actual) signosVitales += `Peso: ${consulta.peso_actual}kg `;
        if (consulta.temperatura) signosVitales += `Temp: ${consulta.temperatura}°C`;
        doc.text(signosVitales, 16, yPos);
        yPos += 5;
      }

      yPos += 5; // Espacio después de la caja
    });

    yPos += 5;
  }

  // =====================================================
  // VACUNAS
  // =====================================================
  if (historial.vacunas && historial.vacunas.length > 0) {
    checkPageBreak(15);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(16, 185, 129); // Verde
    doc.text('VACUNAS APLICADAS', 14, yPos);
    yPos += 8;

    const vacunasData = historial.vacunas.map(v => [
      formatDate(v.fecha_aplicacion),
      v.tipo_vacuna,
      v.lote_vacuna || 'N/A',
      v.fecha_proxima ? formatDate(v.fecha_proxima) : 'No programada'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Fecha', 'Vacuna', 'Lote', 'Próxima Dosis']],
      body: vacunasData,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // =====================================================
  // DESPARASITACIONES
  // =====================================================
  if (historial.desparasitaciones && historial.desparasitaciones.length > 0) {
    checkPageBreak(15);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(168, 85, 247); // Púrpura
    doc.text('DESPARASITACIONES', 14, yPos);
    yPos += 8;

    const despData = historial.desparasitaciones.map(d => [
      formatDate(d.fecha_aplicacion),
      d.producto,
      d.dosis,
      d.peso_actual ? `${d.peso_actual}kg` : 'N/A'
    ]);

    doc.autoTable({
      startY: yPos,
      head: [['Fecha', 'Producto', 'Dosis', 'Peso']],
      body: despData,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247] },
      styles: { fontSize: 9 }
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // =====================================================
  // CIRUGÍAS
  // =====================================================
  if (historial.cirugias && historial.cirugias.length > 0) {
    checkPageBreak(15);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(99, 102, 241); // Índigo
    doc.text('CIRUGÍAS Y PROCEDIMIENTOS', 14, yPos);
    yPos += 8;

    historial.cirugias.forEach((cirugia, index) => {
      checkPageBreak(25);

      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${cirugia.nombre}`, 16, yPos);
      yPos += 6;

      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      doc.text(`Fecha: ${formatDate(cirugia.fecha_realizacion)}`, 16, yPos);
      yPos += 5;
      doc.text(`Doctor: ${cirugia.veterinario}`, 16, yPos);
      yPos += 5;
      doc.text(`Resultado: ${cirugia.resultado}`, 16, yPos);
      yPos += 7;
    });
  }

  // =====================================================
  // PIE DE PÁGINA
  // =====================================================
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // =====================================================
  // GUARDAR PDF
  // =====================================================
  const fileName = `Historial_${patient.nombre_mascota}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);

  // =====================================================
  // FUNCIONES AUXILIARES
  // =====================================================

  function checkPageBreak(requiredSpace = 30) {
    if (yPos + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPos = 20;
    }
  }

  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
};

/**
 * Genera PDF resumido (solo info básica)
 * @param {Object} patient - Datos del paciente
 * @param {Object} historial - Historial clínico
 */
export const exportarResumenPDF = (patient, historial) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, pageWidth, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.text('RESUMEN MÉDICO', pageWidth / 2, 18, { align: 'center' });

  // Contenido
  let y = 45;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text(`Paciente: ${patient.nombre_mascota}`, 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.text(`Propietario: ${patient.nombre_propietario} ${patient.apellidos_propietario}`, 14, y);
  y += 15;

  // Estadísticas
  doc.setFontSize(12);
  doc.text(`Total Consultas: ${historial.estadisticas?.total_consultas || 0}`, 14, y);
  y += 8;
  doc.text(`Total Vacunas: ${historial.estadisticas?.total_vacunas || 0}`, 14, y);
  y += 8;
  doc.text(`Alergias Activas: ${historial.estadisticas?.alergias_activas || 0}`, 14, y);

  const fileName = `Resumen_${patient.nombre_mascota}.pdf`;
  doc.save(fileName);
};

export default {
  exportarHistorialPDF,
  exportarResumenPDF
};
