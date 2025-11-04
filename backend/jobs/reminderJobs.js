// backend/jobs/reminderJobs.js
import cron from 'node-cron';
import conectarDB from '../config/db.js';
import emailRecordatorioCita from '../helpers/emailRecordatorioCita.js';

/**
 * ============================================================================
 * JOBS DE RECORDATORIOS AUTOMÁTICOS
 * Sistema de recordatorios por email para citas médicas y estética
 * ============================================================================
 */

/**
 * Job que se ejecuta diariamente a las 9:00 AM
 * Envía recordatorios para citas del día siguiente
 */
export const reminderJob = cron.schedule(
  '0 9 * * *', // Cron: Cada día a las 9:00 AM
  async () => {
    console.log('📧 [CRON] Iniciando envío de recordatorios de citas...');

    let connection;
    try {
      connection = await conectarDB();

      // Calcular fecha de mañana
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const fechaMañana = mañana.toISOString().split('T')[0];

      console.log(`🔍 Buscando citas para: ${fechaMañana}`);

      // ========================================
      // CITAS MÉDICAS
      // ========================================
      const [citasMedicas] = await connection.execute(
        `SELECT c.id, c.fecha, c.hora, c.tipo_consulta, c.notas, c.recordatorio_enviado,
                p.nombre_mascota, p.foto_url,
                pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                pr.email AS email_propietario,
                u.nombre AS nombre_doctor, u.apellidos AS apellidos_doctor,
                e.nombre AS especie, r.nombre AS raza
         FROM citas c
         INNER JOIN pacientes p ON c.id_paciente = p.id
         INNER JOIN propietarios pr ON p.id_propietario = pr.id
         INNER JOIN doctores d ON c.id_doctor = d.id
         INNER JOIN usuarios u ON d.id_usuario = u.id
         LEFT JOIN razas r ON p.id_raza = r.id
         LEFT JOIN especies e ON r.id_especie = e.id
         WHERE c.fecha = ?
         AND c.estado IN ('programada', 'confirmada')
         AND (c.recordatorio_enviado = FALSE OR c.recordatorio_enviado IS NULL)
         AND pr.email IS NOT NULL
         AND pr.email != ''`,
        [fechaMañana]
      );

      console.log(`✉️  Encontradas ${citasMedicas.length} citas médicas pendientes de recordatorio`);

      // Enviar recordatorios de citas médicas
      let citasMedicasEnviadas = 0;
      for (const cita of citasMedicas) {
        try {
          await emailRecordatorioCita({
            email: cita.email_propietario,
            nombre_propietario: cita.nombre_propietario,
            nombre_mascota: cita.nombre_mascota,
            fecha: cita.fecha,
            hora: cita.hora,
            tipo: 'medica',
            tipo_servicio: cita.tipo_consulta,
            nombre_doctor: `${cita.nombre_doctor} ${cita.apellidos_doctor || ''}`.trim(),
            id_cita: cita.id,
            direccion_clinica: process.env.CLINIC_ADDRESS || 'MollyVet - Clínica Veterinaria'
          });

          // Marcar recordatorio como enviado
          await connection.execute(
            'UPDATE citas SET recordatorio_enviado = TRUE, fecha_recordatorio = NOW() WHERE id = ?',
            [cita.id]
          );

          citasMedicasEnviadas++;
          console.log(`✅ Recordatorio enviado para cita médica #${cita.id} - ${cita.nombre_mascota}`);
        } catch (error) {
          console.error(`❌ Error al enviar recordatorio de cita médica #${cita.id}:`, error.message);
        }
      }

      // ========================================
      // CITAS DE ESTÉTICA
      // ========================================
      const [citasEstetica] = await connection.execute(
        `SELECT ce.id, ce.fecha, ce.hora, ce.tipo_servicio, ce.notas, ce.recordatorio_enviado,
                ce.duracion_estimada,
                p.nombre_mascota, p.foto_url,
                pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                pr.email AS email_propietario,
                e.nombre AS especie, r.nombre AS raza
         FROM citas_estetica ce
         INNER JOIN pacientes p ON ce.id_paciente = p.id
         INNER JOIN propietarios pr ON p.id_propietario = pr.id
         LEFT JOIN razas r ON p.id_raza = r.id
         LEFT JOIN especies e ON r.id_especie = e.id
         WHERE ce.fecha = ?
         AND ce.estado IN ('programada', 'confirmada')
         AND (ce.recordatorio_enviado = FALSE OR ce.recordatorio_enviado IS NULL)
         AND pr.email IS NOT NULL
         AND pr.email != ''`,
        [fechaMañana]
      );

      console.log(`✉️  Encontradas ${citasEstetica.length} citas de estética pendientes de recordatorio`);

      // Enviar recordatorios de citas de estética
      let citasEsteticaEnviadas = 0;
      for (const cita of citasEstetica) {
        try {
          await emailRecordatorioCita({
            email: cita.email_propietario,
            nombre_propietario: cita.nombre_propietario,
            nombre_mascota: cita.nombre_mascota,
            fecha: cita.fecha,
            hora: cita.hora,
            tipo: 'estetica',
            tipo_servicio: cita.tipo_servicio,
            id_cita: cita.id,
            duracion_estimada: cita.duracion_estimada,
            direccion_clinica: process.env.CLINIC_ADDRESS || 'MollyVet - Clínica Veterinaria'
          });

          // Marcar recordatorio como enviado
          await connection.execute(
            'UPDATE citas_estetica SET recordatorio_enviado = TRUE, fecha_recordatorio = NOW() WHERE id = ?',
            [cita.id]
          );

          citasEsteticaEnviadas++;
          console.log(`✅ Recordatorio enviado para cita de estética #${cita.id} - ${cita.nombre_mascota}`);
        } catch (error) {
          console.error(`❌ Error al enviar recordatorio de cita de estética #${cita.id}:`, error.message);
        }
      }

      // ========================================
      // RESUMEN
      // ========================================
      console.log('');
      console.log('📊 ═══════════════════════════════════════════════');
      console.log(`   RESUMEN DE RECORDATORIOS`);
      console.log('   ═══════════════════════════════════════════════');
      console.log(`   📅 Fecha: ${fechaMañana}`);
      console.log(`   🏥 Citas médicas: ${citasMedicasEnviadas}/${citasMedicas.length}`);
      console.log(`   ✨ Citas estética: ${citasEsteticaEnviadas}/${citasEstetica.length}`);
      console.log(`   📧 Total enviados: ${citasMedicasEnviadas + citasEsteticaEnviadas}`);
      console.log('   ═══════════════════════════════════════════════');
      console.log('');

    } catch (error) {
      console.error('❌ Error en job de recordatorios:', error);
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error('❌ Error al cerrar conexión:', error);
        }
      }
    }
  },
  {
    scheduled: false, // No iniciar automáticamente
    timezone: 'America/Mexico_City' // Ajustar según tu zona horaria
  }
);

/**
 * Job de limpieza que se ejecuta diariamente a las 2:00 AM
 * Limpia registros antiguos y mantiene la base de datos optimizada
 */
export const cleanupJob = cron.schedule(
  '0 2 * * *', // Cron: Cada día a las 2:00 AM
  async () => {
    console.log('🧹 [CRON] Iniciando limpieza de registros antiguos...');

    let connection;
    try {
      connection = await conectarDB();

      // Eliminar citas canceladas de hace más de 6 meses
      const [resultCanceladas] = await connection.execute(
        `DELETE FROM citas
         WHERE estado = 'cancelada'
         AND fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`
      );

      // Eliminar citas de no asistencia de hace más de 3 meses
      const [resultNoAsistio] = await connection.execute(
        `DELETE FROM citas
         WHERE estado = 'no_asistio'
         AND fecha < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`
      );

      // Lo mismo para citas de estética
      const [resultEsteticaCanceladas] = await connection.execute(
        `DELETE FROM citas_estetica
         WHERE estado = 'cancelada'
         AND fecha < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)`
      );

      const [resultEsteticaNoAsistio] = await connection.execute(
        `DELETE FROM citas_estetica
         WHERE estado = 'no_asistio'
         AND fecha < DATE_SUB(CURDATE(), INTERVAL 3 MONTH)`
      );

      console.log('📊 ═══════════════════════════════════════════════');
      console.log('   RESUMEN DE LIMPIEZA');
      console.log('   ═══════════════════════════════════════════════');
      console.log(`   🗑️  Citas médicas canceladas eliminadas: ${resultCanceladas.affectedRows}`);
      console.log(`   🗑️  Citas médicas no asistidas eliminadas: ${resultNoAsistio.affectedRows}`);
      console.log(`   🗑️  Citas estética canceladas eliminadas: ${resultEsteticaCanceladas.affectedRows}`);
      console.log(`   🗑️  Citas estética no asistidas eliminadas: ${resultEsteticaNoAsistio.affectedRows}`);
      console.log('   ═══════════════════════════════════════════════');
    } catch (error) {
      console.error('❌ Error en job de limpieza:', error);
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error('❌ Error al cerrar conexión:', error);
        }
      }
    }
  },
  {
    scheduled: false,
    timezone: 'America/Mexico_City'
  }
);

/**
 * Job de estadísticas que se ejecuta semanalmente los lunes a las 8:00 AM
 * Genera reportes semanales de citas
 */
export const statsJob = cron.schedule(
  '0 8 * * 1', // Cron: Cada lunes a las 8:00 AM
  async () => {
    console.log('📈 [CRON] Generando estadísticas semanales...');

    let connection;
    try {
      connection = await conectarDB();

      const fechaHoy = new Date().toISOString().split('T')[0];
      const fechaHaceSemana = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [stats] = await connection.execute(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
          SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
          SUM(CASE WHEN estado = 'no_asistio' THEN 1 ELSE 0 END) as no_asistidas
         FROM citas
         WHERE fecha BETWEEN ? AND ?`,
        [fechaHaceSemana, fechaHoy]
      );

      const tasaAsistencia = stats[0].total > 0
        ? ((stats[0].completadas / stats[0].total) * 100).toFixed(1)
        : 0;

      console.log('📊 ═══════════════════════════════════════════════');
      console.log('   ESTADÍSTICAS SEMANALES');
      console.log('   ═══════════════════════════════════════════════');
      console.log(`   📅 Período: ${fechaHaceSemana} a ${fechaHoy}`);
      console.log(`   📊 Total citas: ${stats[0].total}`);
      console.log(`   ✅ Completadas: ${stats[0].completadas}`);
      console.log(`   ❌ Canceladas: ${stats[0].canceladas}`);
      console.log(`   ⚠️  No asistidas: ${stats[0].no_asistidas}`);
      console.log(`   📈 Tasa de asistencia: ${tasaAsistencia}%`);
      console.log('   ═══════════════════════════════════════════════');
    } catch (error) {
      console.error('❌ Error en job de estadísticas:', error);
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch (error) {
          console.error('❌ Error al cerrar conexión:', error);
        }
      }
    }
  },
  {
    scheduled: false,
    timezone: 'America/Mexico_City'
  }
);

/**
 * Iniciar todos los jobs
 */
export const startAllJobs = () => {
  console.log('');
  console.log('⚙️  ═══════════════════════════════════════════════');
  console.log('   INICIANDO SISTEMA DE JOBS AUTOMÁTICOS');
  console.log('   ═══════════════════════════════════════════════');

  reminderJob.start();
  console.log('   ✅ Job de recordatorios iniciado (9:00 AM diario)');

  cleanupJob.start();
  console.log('   ✅ Job de limpieza iniciado (2:00 AM diario)');

  statsJob.start();
  console.log('   ✅ Job de estadísticas iniciado (8:00 AM lunes)');

  console.log('   ═══════════════════════════════════════════════');
  console.log('');
};

/**
 * Detener todos los jobs
 */
export const stopAllJobs = () => {
  reminderJob.stop();
  cleanupJob.stop();
  statsJob.stop();
  console.log('🛑 Todos los jobs han sido detenidos');
};

export default {
  startAllJobs,
  stopAllJobs,
  reminderJob,
  cleanupJob,
  statsJob
};
