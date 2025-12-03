/**
 * =====================================================
 * CONTROLADOR DE EXPEDIENTE CLÍNICO
 * =====================================================
 * Maneja la captura y gestión completa del expediente
 * clínico veterinario con examen físico, diagnósticos
 * y tratamientos
 *
 * TABLAS UTILIZADAS:
 * - expedientes_clinicos
 * - expediente_signos_vitales
 * - expediente_evaluacion_sistemas
 * - expediente_lista_problemas
 * - expediente_lista_maestra
 * - expediente_diagnosticos_laboratorio
 * - expediente_tratamientos
 */

import conectarDB from '../config/db.js';

// =====================================================
// OBTENER EXPEDIENTE
// =====================================================

/**
 * 📋 Obtener expediente completo de un paciente (último o vacío)
 */
const obtenerExpediente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params; // ID del paciente
        const pacienteId = parseInt(id);

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();

        // ✅ Verificar que el paciente existe y pertenece al doctor
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            const [pacientes] = await connection.execute(
                `SELECT * FROM pacientes WHERE id = ? AND id_doctor = ?`,
                [pacienteId, doctores[0].id]
            );

            if (pacientes.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para acceder a este paciente'
                });
            }
        }

        // Buscar el último expediente del paciente
        const [expedientes] = await connection.execute(
            `SELECT * FROM expedientes_clinicos
             WHERE id_paciente = ?
             ORDER BY fecha_consulta DESC
             LIMIT 1`,
            [pacienteId]
        );

        // Si no hay expediente, retornar estructura vacía
        if (expedientes.length === 0) {
            return res.status(200).json({
                success: true,
                data: null,
                msg: 'No hay expedientes previos para este paciente'
            });
        }

        const expediente = expedientes[0];

        // Obtener datos relacionados
        const [signosVitales] = await connection.execute(
            `SELECT * FROM expediente_signos_vitales WHERE id_expediente = ?`,
            [expediente.id]
        );

        const [evaluacionSistemas] = await connection.execute(
            `SELECT * FROM expediente_evaluacion_sistemas WHERE id_expediente = ?`,
            [expediente.id]
        );

        const [listaProblemas] = await connection.execute(
            `SELECT descripcion FROM expediente_lista_problemas
             WHERE id_expediente = ? ORDER BY orden`,
            [expediente.id]
        );

        const [listaMaestra] = await connection.execute(
            `SELECT diagnostico_presuntivo FROM expediente_lista_maestra
             WHERE id_expediente = ? ORDER BY orden`,
            [expediente.id]
        );

        const [diagnosticosLab] = await connection.execute(
            `SELECT diagnostico FROM expediente_diagnosticos_laboratorio
             WHERE id_expediente = ? ORDER BY orden`,
            [expediente.id]
        );

        const [tratamientos] = await connection.execute(
            `SELECT tratamiento FROM expediente_tratamientos
             WHERE id_expediente = ? ORDER BY orden`,
            [expediente.id]
        );

        // Construir respuesta completa
        const expedienteCompleto = {
            id: expediente.id,
            id_paciente: expediente.id_paciente,
            fecha_consulta: expediente.fecha_consulta,
            examenFisico: {
                temperatura: signosVitales[0] || {},
                segundaCard: evaluacionSistemas[0] || {}
            },
            listaProblemas: listaProblemas.map(p => p.descripcion),
            estudiosLaboratorio: expediente.estudios_laboratorio || '',
            listaMaestra: listaMaestra.map(d => d.diagnostico_presuntivo),
            diagnosticoFinal: expediente.diagnostico_final || '',
            diagnosticoLaboratorio: diagnosticosLab.map(d => d.diagnostico),
            tratamiento: tratamientos.map(t => t.tratamiento)
        };

        return res.status(200).json({
            success: true,
            data: expedienteCompleto,
            msg: 'Expediente cargado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al obtener expediente:', error);
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener el expediente clínico',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// =====================================================
// GUARDAR/ACTUALIZAR EXPEDIENTE
// =====================================================

/**
 * 💾 Guardar expediente completo en tablas relacionadas
 */
const guardarExpediente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params; // ID del paciente
        const pacienteId = parseInt(id);
        const {
            examenFisico,
            listaProblemas,
            estudiosLaboratorio,
            listaMaestra,
            diagnosticoFinal,
            diagnosticoLaboratorio,
            tratamiento
        } = req.body;

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        // ✅ Verificar permisos del doctor
        const [doctores] = await connection.execute(
            `SELECT id FROM doctores WHERE id_usuario = ?`,
            [req.usuario.id]
        );

        if (doctores.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                msg: 'Doctor no encontrado'
            });
        }

        const doctorId = doctores[0].id;

        const [pacientes] = await connection.execute(
            `SELECT * FROM pacientes WHERE id = ? AND id_doctor = ?`,
            [pacienteId, doctorId]
        );

        if (pacientes.length === 0) {
            await connection.rollback();
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para modificar este paciente'
            });
        }

        // 1️⃣ INSERTAR EXPEDIENTE PRINCIPAL
        const [resultExpediente] = await connection.execute(
            `INSERT INTO expedientes_clinicos
             (id_paciente, id_doctor, fecha_consulta, estudios_laboratorio, diagnostico_final, estado)
             VALUES (?, ?, NOW(), ?, ?, 'completado')`,
            [pacienteId, doctorId, estudiosLaboratorio || null, diagnosticoFinal || null]
        );

        const expedienteId = resultExpediente.insertId;

        // 2️⃣ INSERTAR SIGNOS VITALES
        if (examenFisico?.temperatura) {
            const temp = examenFisico.temperatura;
            await connection.execute(
                `INSERT INTO expediente_signos_vitales
                 (id_expediente, dh, fc, cc, fr, tllc, rt, rd, ps_pd, pam)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    expedienteId,
                    temp.dh || null,
                    temp.fc || null,
                    temp.cc || null,
                    temp.fr || null,
                    temp.tllc || null,
                    temp.rt || null,
                    temp.rd || null,
                    temp.ps_pd || null,
                    temp.pam || null
                ]
            );
        }

        // 3️⃣ INSERTAR EVALUACIÓN DE SISTEMAS
        if (examenFisico?.segundaCard) {
            const sistemas = examenFisico.segundaCard;
            await connection.execute(
                `INSERT INTO expediente_evaluacion_sistemas
                 (id_expediente,
                  come, come_normal, bebe, bebe_normal, orina, orina_normal, defeca, defeca_normal,
                  piel, piel_normal, mucosas, mucosas_normal, linfonodos, linfonodos_normal,
                  circulatorio, circulatorio_normal, respiratorio, respiratorio_normal,
                  digestivo, digestivo_normal, urinario, urinario_normal, reproductor, reproductor_normal,
                  locomotor, locomotor_normal, nervioso, nervioso_normal, ojos_oido, ojos_oido_normal)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    expedienteId,
                    sistemas.come || null, sistemas.come_normal || 'N',
                    sistemas.bebe || null, sistemas.bebe_normal || 'N',
                    sistemas.orina || null, sistemas.orina_normal || 'N',
                    sistemas.defeca || null, sistemas.defeca_normal || 'N',
                    sistemas.piel || null, sistemas.piel_normal || 'N',
                    sistemas.mucosas || null, sistemas.mucosas_normal || 'N',
                    sistemas.linfonodos || null, sistemas.linfonodos_normal || 'N',
                    sistemas.circulatorio || null, sistemas.circulatorio_normal || 'N',
                    sistemas.respiratorio || null, sistemas.respiratorio_normal || 'N',
                    sistemas.digestivo || null, sistemas.digestivo_normal || 'N',
                    sistemas.urinario || null, sistemas.urinario_normal || 'N',
                    sistemas.reproductor || null, sistemas.reproductor_normal || 'N',
                    sistemas.locomotor || null, sistemas.locomotor_normal || 'N',
                    sistemas.nervioso || null, sistemas.nervioso_normal || 'N',
                    sistemas.ojosOido || null, sistemas.ojosOido_normal || 'N'
                ]
            );
        }

        // 4️⃣ INSERTAR LISTA DE PROBLEMAS
        if (Array.isArray(listaProblemas)) {
            for (let i = 0; i < listaProblemas.length; i++) {
                if (listaProblemas[i]?.trim()) {
                    await connection.execute(
                        `INSERT INTO expediente_lista_problemas (id_expediente, orden, descripcion)
                         VALUES (?, ?, ?)`,
                        [expedienteId, i + 1, listaProblemas[i]]
                    );
                }
            }
        }

        // 5️⃣ INSERTAR LISTA MAESTRA (Diagnósticos Presuntivos)
        if (Array.isArray(listaMaestra)) {
            for (let i = 0; i < listaMaestra.length; i++) {
                if (listaMaestra[i]?.trim()) {
                    await connection.execute(
                        `INSERT INTO expediente_lista_maestra (id_expediente, orden, diagnostico_presuntivo)
                         VALUES (?, ?, ?)`,
                        [expedienteId, i + 1, listaMaestra[i]]
                    );
                }
            }
        }

        // 6️⃣ INSERTAR DIAGNÓSTICOS DE LABORATORIO
        if (Array.isArray(diagnosticoLaboratorio)) {
            for (let i = 0; i < diagnosticoLaboratorio.length; i++) {
                if (diagnosticoLaboratorio[i]?.trim()) {
                    await connection.execute(
                        `INSERT INTO expediente_diagnosticos_laboratorio (id_expediente, orden, diagnostico)
                         VALUES (?, ?, ?)`,
                        [expedienteId, i + 1, diagnosticoLaboratorio[i]]
                    );
                }
            }
        }

        // 7️⃣ INSERTAR TRATAMIENTOS
        if (Array.isArray(tratamiento)) {
            for (let i = 0; i < tratamiento.length; i++) {
                if (tratamiento[i]?.trim()) {
                    await connection.execute(
                        `INSERT INTO expediente_tratamientos (id_expediente, orden, tratamiento)
                         VALUES (?, ?, ?)`,
                        [expedienteId, i + 1, tratamiento[i]]
                    );
                }
            }
        }

        // ✅ CONFIRMAR TRANSACCIÓN
        await connection.commit();

        return res.status(201).json({
            success: true,
            msg: 'Expediente guardado exitosamente',
            data: {
                id_expediente: expedienteId,
                id_paciente: pacienteId,
                fecha: new Date().toISOString()
            }
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('❌ Error al guardar expediente:', error);
        return res.status(500).json({
            success: false,
            msg: 'Error al guardar el expediente clínico',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// =====================================================
// OBTENER HISTORIAL DE EXPEDIENTES
// =====================================================

/**
 * 📚 Obtener historial de expedientes de un paciente
 */
const obtenerHistorialExpedientes = async (req, res) => {
    let connection;
    try {
        const { id } = req.params; // ID del paciente
        const pacienteId = parseInt(id);

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();

        // ✅ Verificar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            const [pacientes] = await connection.execute(
                `SELECT id FROM pacientes WHERE id = ? AND id_doctor = ?`,
                [pacienteId, doctores[0].id]
            );

            if (pacientes.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para acceder a este paciente'
                });
            }
        }

        // Obtener historial de expedientes
        const [expedientes] = await connection.execute(
            `SELECT ec.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
                    u.cedula AS cedula_veterinario
             FROM expedientes_clinicos ec
             INNER JOIN doctores d ON ec.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE ec.id_paciente = ?
             ORDER BY ec.fecha_consulta DESC`,
            [pacienteId]
        );

        return res.status(200).json({
            success: true,
            data: expedientes,
            count: expedientes.length,
            msg: 'Historial de expedientes obtenido'
        });

    } catch (error) {
        console.error('❌ Error al obtener historial de expedientes:', error);
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener el historial de expedientes',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

// =====================================================
// OBTENER EXPEDIENTE POR ID
// =====================================================

/**
 * 🔍 Obtener un expediente específico por ID con todos sus detalles
 */
const obtenerExpedientePorId = async (req, res) => {
    let connection;
    try {
        const { id, expedienteId } = req.params;
        const pacienteId = parseInt(id);
        const expId = parseInt(expedienteId);

        if (isNaN(pacienteId) || pacienteId <= 0 || isNaN(expId) || expId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'IDs no válidos'
            });
        }

        connection = await conectarDB();

        // ✅ Verificar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            const [pacientes] = await connection.execute(
                `SELECT id FROM pacientes WHERE id = ? AND id_doctor = ?`,
                [pacienteId, doctores[0].id]
            );

            if (pacientes.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para acceder a este paciente'
                });
            }
        }

        // Obtener expediente principal
        const [expedientes] = await connection.execute(
            `SELECT ec.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
                    u.cedula AS cedula_veterinario
             FROM expedientes_clinicos ec
             INNER JOIN doctores d ON ec.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE ec.id = ? AND ec.id_paciente = ?`,
            [expId, pacienteId]
        );

        if (expedientes.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Expediente no encontrado'
            });
        }

        const expediente = expedientes[0];

        // Obtener datos relacionados
        const [signosVitales] = await connection.execute(
            `SELECT * FROM expediente_signos_vitales WHERE id_expediente = ?`,
            [expId]
        );

        const [evaluacionSistemas] = await connection.execute(
            `SELECT * FROM expediente_evaluacion_sistemas WHERE id_expediente = ?`,
            [expId]
        );

        const [listaProblemas] = await connection.execute(
            `SELECT descripcion FROM expediente_lista_problemas
             WHERE id_expediente = ? ORDER BY orden`,
            [expId]
        );

        const [listaMaestra] = await connection.execute(
            `SELECT diagnostico_presuntivo FROM expediente_lista_maestra
             WHERE id_expediente = ? ORDER BY orden`,
            [expId]
        );

        const [diagnosticosLab] = await connection.execute(
            `SELECT diagnostico FROM expediente_diagnosticos_laboratorio
             WHERE id_expediente = ? ORDER BY orden`,
            [expId]
        );

        const [tratamientos] = await connection.execute(
            `SELECT tratamiento FROM expediente_tratamientos
             WHERE id_expediente = ? ORDER BY orden`,
            [expId]
        );

        // Construir respuesta completa
        const expedienteCompleto = {
            ...expediente,
            signosVitales: signosVitales[0] || null,
            evaluacionSistemas: evaluacionSistemas[0] || null,
            listaProblemas: listaProblemas.map(p => p.descripcion),
            listaMaestra: listaMaestra.map(d => d.diagnostico_presuntivo),
            diagnosticoLaboratorio: diagnosticosLab.map(d => d.diagnostico),
            tratamientos: tratamientos.map(t => t.tratamiento)
        };

        return res.status(200).json({
            success: true,
            data: expedienteCompleto,
            msg: 'Expediente obtenido exitosamente'
        });

    } catch (error) {
        console.error('❌ Error al obtener expediente:', error);
        return res.status(500).json({
            success: false,
            msg: 'Error al obtener el expediente',
            error: error.message
        });
    } finally {
        if (connection) connection.release();
    }
};

export {
    obtenerExpediente,
    guardarExpediente,
    obtenerHistorialExpedientes,
    obtenerExpedientePorId
};
