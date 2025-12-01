/**
 * =====================================================
 * CONTROLADOR DE EXPEDIENTE CLÍNICO
 * =====================================================
 * Maneja la captura y gestión completa del expediente
 * clínico veterinario con examen físico, diagnósticos
 * y tratamientos
 *
 * NOTA: Actualmente implementado con estructura dummy.
 * TODO: Integrar con tablas reales de la base de datos
 * una vez diseñado el frontend completo.
 */

import conectarDB from '../config/db.js';

// =====================================================
// OBTENER EXPEDIENTE
// =====================================================

/**
 * 📋 Obtener expediente completo de un paciente
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

        // TODO: Consultar tabla de expedientes cuando se cree
        // const [expedientes] = await connection.execute(
        //     `SELECT * FROM expedientes_clinicos WHERE id_paciente = ?
        //      ORDER BY fecha_creacion DESC LIMIT 1`,
        //     [pacienteId]
        // );

        // DUMMY DATA: Retornar estructura vacía por ahora
        const expedienteDummy = {
            id: null,
            id_paciente: pacienteId,
            fecha_creacion: new Date().toISOString(),
            examen_fisico: {
                temperatura: {},
                alimentacion: {},
                piel: {},
                mucosas: {},
                linfonodos: {},
                cardiovascular: {},
                respiratorio: {},
                digestivo: {},
                urinario: {},
                reproductor: {},
                locomotor: {},
                nervioso: {},
                ojosOido: {}
            },
            lista_problemas: [],
            estudios_laboratorio: '',
            lista_maestra: [],
            diagnostico_final: '',
            diagnostico_laboratorio: [],
            tratamiento: []
        };

        return res.status(200).json({
            success: true,
            data: expedienteDummy,
            msg: 'Expediente cargado (dummy data)'
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
 * 💾 Guardar o actualizar expediente completo
 */
const guardarExpediente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params; // ID del paciente
        const pacienteId = parseInt(id);
        const expedienteData = req.body;

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        // Validar que los datos requeridos existen
        if (!expedienteData) {
            return res.status(400).json({
                success: false,
                msg: 'Datos del expediente son requeridos'
            });
        }

        connection = await conectarDB();

        // ✅ Verificar permisos del doctor
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

        const doctorId = doctores[0].id;

        const [pacientes] = await connection.execute(
            `SELECT * FROM pacientes WHERE id = ? AND id_doctor = ?`,
            [pacienteId, doctorId]
        );

        if (pacientes.length === 0) {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para modificar este paciente'
            });
        }

        // TODO: Implementar INSERT/UPDATE en tabla de expedientes
        // Por ahora, se registrará como una consulta en historias_clinicas
        // hasta que se cree la tabla específica de expedientes

        /* ESTRUCTURA FUTURA DE TABLA:

        CREATE TABLE expedientes_clinicos (
            id INT PRIMARY KEY AUTO_INCREMENT,
            id_paciente INT NOT NULL,
            id_doctor INT NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            examen_fisico JSON,
            lista_problemas JSON,
            estudios_laboratorio TEXT,
            lista_maestra JSON,
            diagnostico_final TEXT,
            diagnostico_laboratorio JSON,
            tratamiento JSON,
            FOREIGN KEY (id_paciente) REFERENCES pacientes(id),
            FOREIGN KEY (id_doctor) REFERENCES doctores(id)
        );

        */

        // IMPLEMENTACIÓN TEMPORAL: Guardar como consulta
        const motivoConsulta = 'Expediente Clínico Completo';
        const diagnostico = expedienteData.diagnosticoFinal || 'Pendiente';
        const tratamiento = expedienteData.tratamiento?.filter(t => t).join('; ') || 'Sin tratamiento especificado';
        const observaciones = `EXPEDIENTE CLÍNICO

LISTA DE PROBLEMAS:
${expedienteData.listaProblemas?.filter(p => p).map((p, i) => `${i + 1}. ${p}`).join('\n') || 'Sin problemas registrados'}

ESTUDIOS DE LABORATORIO:
${expedienteData.estudiosLaboratorio || 'No solicitados'}

LISTA MAESTRA (Dx Presuntivos):
${expedienteData.listaMaestra?.filter(d => d).map((d, i) => `${i + 1}. ${d}`).join('\n') || 'Sin diagnósticos presuntivos'}

DIAGNÓSTICO DE LABORATORIO:
${expedienteData.diagnosticoLaboratorio?.filter(d => d).map((d, i) => `${i + 1}. ${d}`).join('\n') || 'Sin diagnósticos de laboratorio'}`;

        await connection.execute(
            `INSERT INTO historias_clinicas
             (id_paciente, id_doctor, fecha_consulta, motivo_consulta, diagnostico, tratamiento, observaciones)
             VALUES (?, ?, NOW(), ?, ?, ?, ?)`,
            [
                pacienteId,
                doctorId,
                motivoConsulta,
                diagnostico,
                tratamiento,
                observaciones
            ]
        );

        return res.status(201).json({
            success: true,
            msg: 'Expediente guardado exitosamente (guardado temporal como consulta)',
            data: {
                id_paciente: pacienteId,
                fecha: new Date().toISOString()
            }
        });

    } catch (error) {
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

        // TODO: Cuando exista la tabla de expedientes, consultar de ahí
        // Por ahora, buscar consultas que sean expedientes completos
        const [expedientes] = await connection.execute(
            `SELECT hc.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE hc.id_paciente = ?
             AND hc.motivo_consulta = 'Expediente Clínico Completo'
             ORDER BY hc.fecha_consulta DESC`,
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
 * 🔍 Obtener un expediente específico por ID
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

        // TODO: Consultar tabla de expedientes cuando exista
        // Por ahora, buscar en historias_clinicas
        const [expedientes] = await connection.execute(
            `SELECT hc.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
                    u.cedula AS cedula_veterinario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE hc.id = ? AND hc.id_paciente = ?`,
            [expId, pacienteId]
        );

        if (expedientes.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Expediente no encontrado'
            });
        }

        return res.status(200).json({
            success: true,
            data: expedientes[0],
            msg: 'Expediente obtenido'
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
