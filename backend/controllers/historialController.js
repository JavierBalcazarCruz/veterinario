/**
 * =====================================================
 * CONTROLADOR DE HISTORIAL CLÍNICO VETERINARIO
 * =====================================================
 * Maneja todas las operaciones relacionadas con el historial
 * clínico completo de los pacientes veterinarios
 *
 * Incluye:
 * - Consultas médicas
 * - Vacunas
 * - Desparasitaciones
 * - Medicamentos
 * - Alergias
 * - Cirugías y procedimientos
 * - Exámenes de laboratorio
 */

import conectarDB from '../config/db.js';

// =====================================================
// HISTORIAL COMPLETO
// =====================================================

/**
 * 📋 Obtener el historial clínico completo de un paciente
 * Incluye: consultas, vacunas, desparasitaciones, cirugías, exámenes
 */
const obtenerHistorialCompleto = async (req, res) => {
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

        // ✅ Verificar que el paciente existe y pertenece al doctor (si es rol doctor)
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

        // 📊 Obtener consultas médicas
        const [consultas] = await connection.execute(
            `SELECT hc.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
                    u.email AS email_veterinario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE hc.id_paciente = ?
             ORDER BY hc.fecha_consulta DESC
             LIMIT 50`,
            [pacienteId]
        );

        // 💉 Obtener vacunas
        const [vacunas] = await connection.execute(
            `SELECT * FROM vacunas
             WHERE id_paciente = ?
             ORDER BY fecha_aplicacion DESC
             LIMIT 30`,
            [pacienteId]
        );

        // 🐛 Obtener desparasitaciones
        const [desparasitaciones] = await connection.execute(
            `SELECT * FROM desparasitaciones
             WHERE id_paciente = ?
             ORDER BY fecha_aplicacion DESC
             LIMIT 30`,
            [pacienteId]
        );

        // ⚕️ Obtener alergias activas
        const [alergias] = await connection.execute(
            `SELECT * FROM alergias
             WHERE id_paciente = ? AND activa = 1
             ORDER BY severidad DESC, fecha_deteccion DESC`,
            [pacienteId]
        );

        // 🏥 Obtener cirugías y procedimientos
        const [cirugias] = await connection.execute(
            `SELECT cp.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario
             FROM cirugias_procedimientos cp
             INNER JOIN doctores d ON cp.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE cp.id_paciente = ?
             ORDER BY cp.fecha_realizacion DESC
             LIMIT 30`,
            [pacienteId]
        );

        // 🔬 Obtener exámenes de laboratorio
        const [examenes] = await connection.execute(
            `SELECT * FROM examenes_laboratorio
             WHERE id_paciente = ?
             ORDER BY fecha_solicitud DESC
             LIMIT 30`,
            [pacienteId]
        );

        // 📎 Obtener adjuntos (radiografías, análisis, etc.)
        const [adjuntos] = await connection.execute(
            `SELECT adj.*, hc.fecha_consulta
             FROM adjuntos adj
             INNER JOIN historias_clinicas hc ON adj.id_historia_clinica = hc.id
             WHERE hc.id_paciente = ?
             ORDER BY adj.created_at DESC
             LIMIT 20`,
            [pacienteId]
        );

        // 📈 Calcular estadísticas
        const estadisticas = {
            total_consultas: consultas.length,
            total_vacunas: vacunas.length,
            total_desparasitaciones: desparasitaciones.length,
            alergias_activas: alergias.length,
            cirugias_realizadas: cirugias.length,
            examenes_pendientes: examenes.filter(e => e.estado === 'solicitado' || e.estado === 'en_proceso').length
        };

        res.json({
            success: true,
            data: {
                consultas,
                vacunas,
                desparasitaciones,
                alergias,
                cirugias,
                examenes,
                adjuntos,
                estadisticas
            }
        });

    } catch (error) {
        console.error('❌ Error en obtenerHistorialCompleto:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener el historial clínico',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// CONSULTAS MÉDICAS (HISTORIAS CLÍNICAS)
// =====================================================

/**
 * ➕ Crear nueva consulta médica
 */
const crearConsulta = async (req, res) => {
    let connection;
    try {
        const {
            id_paciente,
            motivo_consulta,
            diagnostico,
            tratamiento,
            peso_actual,
            temperatura,
            frecuencia_cardiaca,
            frecuencia_respiratoria,
            presion_arterial,
            tiempo_llenado_capilar,
            nivel_dolor,
            condicion_corporal,
            estado_hidratacion,
            observaciones
        } = req.body;

        // ✅ Validaciones
        if (!id_paciente || !motivo_consulta) {
            return res.status(400).json({
                success: false,
                msg: 'El paciente y motivo de consulta son obligatorios'
            });
        }

        connection = await conectarDB();

        // Obtener ID del doctor
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

        const id_doctor = doctores[0].id;

        // Verificar permisos sobre el paciente
        if (req.usuario.rol === 'doctor') {
            const [pacientes] = await connection.execute(
                `SELECT id FROM pacientes WHERE id = ? AND id_doctor = ?`,
                [id_paciente, id_doctor]
            );

            if (pacientes.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para agregar consultas a este paciente'
                });
            }
        }

        // Insertar consulta
        const [result] = await connection.execute(
            `INSERT INTO historias_clinicas (
                id_paciente, id_doctor, fecha_consulta,
                motivo_consulta, diagnostico, tratamiento,
                peso_actual, temperatura,
                frecuencia_cardiaca, frecuencia_respiratoria, presion_arterial,
                tiempo_llenado_capilar, nivel_dolor,
                condicion_corporal, estado_hidratacion,
                observaciones
            ) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_paciente, id_doctor,
                motivo_consulta, diagnostico || null, tratamiento || null,
                peso_actual || null, temperatura || null,
                frecuencia_cardiaca || null, frecuencia_respiratoria || null, presion_arterial || null,
                tiempo_llenado_capilar || null, nivel_dolor || null,
                condicion_corporal || null, estado_hidratacion || null,
                observaciones || null
            ]
        );

        // Obtener la consulta recién creada
        const [nuevaConsulta] = await connection.execute(
            `SELECT hc.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE hc.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            msg: 'Consulta médica registrada exitosamente',
            data: nuevaConsulta[0]
        });

    } catch (error) {
        console.error('❌ Error en crearConsulta:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al registrar la consulta',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * 📝 Actualizar consulta médica
 */
const actualizarConsulta = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const consultaId = parseInt(id);

        if (isNaN(consultaId) || consultaId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de consulta no válido'
            });
        }

        connection = await conectarDB();

        // Verificar que la consulta existe y pertenece al doctor
        const [consultas] = await connection.execute(
            `SELECT hc.id, hc.id_doctor, d.id_usuario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             WHERE hc.id = ?`,
            [consultaId]
        );

        if (consultas.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Consulta no encontrada'
            });
        }

        // Solo el doctor que creó la consulta o un admin pueden editarla
        if (req.usuario.rol === 'doctor' && consultas[0].id_usuario !== req.usuario.id) {
            return res.status(403).json({
                success: false,
                msg: 'No tienes permiso para editar esta consulta'
            });
        }

        // Actualizar campos
        const camposActualizar = [];
        const valores = [];

        const camposPermitidos = [
            'motivo_consulta', 'diagnostico', 'tratamiento',
            'peso_actual', 'temperatura',
            'frecuencia_cardiaca', 'frecuencia_respiratoria', 'presion_arterial',
            'tiempo_llenado_capilar', 'nivel_dolor',
            'condicion_corporal', 'estado_hidratacion',
            'observaciones'
        ];

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                camposActualizar.push(`${campo} = ?`);
                valores.push(req.body[campo]);
            }
        }

        if (camposActualizar.length === 0) {
            return res.status(400).json({
                success: false,
                msg: 'No hay campos para actualizar'
            });
        }

        valores.push(consultaId);

        await connection.execute(
            `UPDATE historias_clinicas SET ${camposActualizar.join(', ')} WHERE id = ?`,
            valores
        );

        // Obtener consulta actualizada
        const [consultaActualizada] = await connection.execute(
            `SELECT hc.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario
             FROM historias_clinicas hc
             INNER JOIN doctores d ON hc.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE hc.id = ?`,
            [consultaId]
        );

        res.json({
            success: true,
            msg: 'Consulta actualizada exitosamente',
            data: consultaActualizada[0]
        });

    } catch (error) {
        console.error('❌ Error en actualizarConsulta:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la consulta',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// VACUNAS
// =====================================================

/**
 * 💉 Agregar vacuna
 */
const agregarVacuna = async (req, res) => {
    let connection;
    try {
        const {
            id_paciente,
            id_historia_clinica,
            tipo_vacuna,
            fecha_aplicacion,
            fecha_proxima,
            lote_vacuna
        } = req.body;

        // Validaciones
        if (!id_paciente || !tipo_vacuna || !fecha_aplicacion) {
            return res.status(400).json({
                success: false,
                msg: 'Paciente, tipo de vacuna y fecha son obligatorios'
            });
        }

        connection = await conectarDB();

        // Verificar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            const [pacientes] = await connection.execute(
                `SELECT id FROM pacientes WHERE id = ? AND id_doctor = ?`,
                [id_paciente, doctores[0].id]
            );

            if (pacientes.length === 0) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para agregar vacunas a este paciente'
                });
            }
        }

        // Insertar vacuna
        const [result] = await connection.execute(
            `INSERT INTO vacunas (
                id_paciente, id_historia_clinica,
                tipo_vacuna, fecha_aplicacion, fecha_proxima, lote_vacuna
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id_paciente,
                id_historia_clinica || null,
                tipo_vacuna,
                fecha_aplicacion,
                fecha_proxima || null,
                lote_vacuna || null
            ]
        );

        const [nuevaVacuna] = await connection.execute(
            `SELECT * FROM vacunas WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            msg: 'Vacuna registrada exitosamente',
            data: nuevaVacuna[0]
        });

    } catch (error) {
        console.error('❌ Error en agregarVacuna:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al registrar la vacuna',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * 💉 Actualizar vacuna
 */
const actualizarVacuna = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const vacunaId = parseInt(id);

        if (isNaN(vacunaId) || vacunaId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de vacuna no válido'
            });
        }

        connection = await conectarDB();

        // Verificar que la vacuna existe
        const [vacunas] = await connection.execute(
            `SELECT * FROM vacunas WHERE id = ?`,
            [vacunaId]
        );

        if (vacunas.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Vacuna no encontrada'
            });
        }

        // Actualizar
        const camposActualizar = [];
        const valores = [];

        const camposPermitidos = ['tipo_vacuna', 'fecha_aplicacion', 'fecha_proxima', 'lote_vacuna'];

        for (const campo of camposPermitidos) {
            if (req.body[campo] !== undefined) {
                camposActualizar.push(`${campo} = ?`);
                valores.push(req.body[campo]);
            }
        }

        if (camposActualizar.length === 0) {
            return res.status(400).json({
                success: false,
                msg: 'No hay campos para actualizar'
            });
        }

        valores.push(vacunaId);

        await connection.execute(
            `UPDATE vacunas SET ${camposActualizar.join(', ')} WHERE id = ?`,
            valores
        );

        const [vacunaActualizada] = await connection.execute(
            `SELECT * FROM vacunas WHERE id = ?`,
            [vacunaId]
        );

        res.json({
            success: true,
            msg: 'Vacuna actualizada exitosamente',
            data: vacunaActualizada[0]
        });

    } catch (error) {
        console.error('❌ Error en actualizarVacuna:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la vacuna',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// ALERGIAS
// =====================================================

/**
 * ⚠️ Agregar alergia
 */
const agregarAlergia = async (req, res) => {
    let connection;
    try {
        const {
            id_paciente,
            tipo_alergia,
            nombre_alergeno,
            severidad,
            sintomas,
            fecha_deteccion,
            notas
        } = req.body;

        // Validaciones
        if (!id_paciente || !tipo_alergia || !nombre_alergeno) {
            return res.status(400).json({
                success: false,
                msg: 'Paciente, tipo y nombre del alérgeno son obligatorios'
            });
        }

        connection = await conectarDB();

        // Insertar alergia
        const [result] = await connection.execute(
            `INSERT INTO alergias (
                id_paciente, tipo_alergia, nombre_alergeno,
                severidad, sintomas, fecha_deteccion, notas
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                id_paciente,
                tipo_alergia,
                nombre_alergeno,
                severidad || 'moderada',
                sintomas || null,
                fecha_deteccion || null,
                notas || null
            ]
        );

        const [nuevaAlergia] = await connection.execute(
            `SELECT * FROM alergias WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            msg: 'Alergia registrada exitosamente',
            data: nuevaAlergia[0]
        });

    } catch (error) {
        console.error('❌ Error en agregarAlergia:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al registrar la alergia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * ⚠️ Desactivar alergia
 */
const desactivarAlergia = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const alergiaId = parseInt(id);

        if (isNaN(alergiaId) || alergiaId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de alergia no válido'
            });
        }

        connection = await conectarDB();

        await connection.execute(
            `UPDATE alergias SET activa = 0 WHERE id = ?`,
            [alergiaId]
        );

        res.json({
            success: true,
            msg: 'Alergia desactivada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error en desactivarAlergia:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al desactivar la alergia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// CIRUGÍAS Y PROCEDIMIENTOS
// =====================================================

/**
 * 🏥 Agregar cirugía o procedimiento
 */
const agregarCirugia = async (req, res) => {
    let connection;
    try {
        const {
            id_paciente,
            id_historia_clinica,
            tipo,
            nombre,
            fecha_realizacion,
            duracion_minutos,
            anestesia_utilizada,
            descripcion,
            complicaciones,
            resultado,
            notas_postoperatorias
        } = req.body;

        // Validaciones
        if (!id_paciente || !tipo || !nombre || !fecha_realizacion) {
            return res.status(400).json({
                success: false,
                msg: 'Paciente, tipo, nombre y fecha son obligatorios'
            });
        }

        connection = await conectarDB();

        // Obtener ID del doctor
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

        const id_doctor = doctores[0].id;

        // Insertar
        const [result] = await connection.execute(
            `INSERT INTO cirugias_procedimientos (
                id_paciente, id_doctor, id_historia_clinica,
                tipo, nombre, fecha_realizacion, duracion_minutos,
                anestesia_utilizada, descripcion, complicaciones,
                resultado, notas_postoperatorias
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id_paciente, id_doctor, id_historia_clinica || null,
                tipo, nombre, fecha_realizacion,
                duracion_minutos || null, anestesia_utilizada || null,
                descripcion || null, complicaciones || null,
                resultado || 'exitoso', notas_postoperatorias || null
            ]
        );

        const [nuevaCirugia] = await connection.execute(
            `SELECT cp.*,
                    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario
             FROM cirugias_procedimientos cp
             INNER JOIN doctores d ON cp.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE cp.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            msg: `${tipo === 'cirugia' ? 'Cirugía' : 'Procedimiento'} registrado exitosamente`,
            data: nuevaCirugia[0]
        });

    } catch (error) {
        console.error('❌ Error en agregarCirugia:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al registrar la cirugía/procedimiento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// MEDICAMENTOS
// =====================================================

/**
 * 💊 Agregar medicamento recetado
 */
const agregarMedicamento = async (req, res) => {
    let connection;
    try {
        const {
            id_historia_clinica,
            nombre_medicamento,
            dosis,
            frecuencia,
            duracion,
            notas
        } = req.body;

        // Validaciones
        if (!id_historia_clinica || !nombre_medicamento || !dosis || !frecuencia || !duracion) {
            return res.status(400).json({
                success: false,
                msg: 'Todos los campos del medicamento son obligatorios'
            });
        }

        connection = await conectarDB();

        // Insertar
        const [result] = await connection.execute(
            `INSERT INTO medicamentos_recetados (
                id_historia_clinica, nombre_medicamento,
                dosis, frecuencia, duracion, notas
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                id_historia_clinica,
                nombre_medicamento,
                dosis,
                frecuencia,
                duracion,
                notas || null
            ]
        );

        const [nuevoMedicamento] = await connection.execute(
            `SELECT * FROM medicamentos_recetados WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            msg: 'Medicamento agregado exitosamente',
            data: nuevoMedicamento[0]
        });

    } catch (error) {
        console.error('❌ Error en agregarMedicamento:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al agregar el medicamento',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * 💊 Obtener medicamentos de una consulta
 */
const obtenerMedicamentosConsulta = async (req, res) => {
    let connection;
    try {
        const { id } = req.params; // ID de historia_clinica
        const consultaId = parseInt(id);

        if (isNaN(consultaId) || consultaId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de consulta no válido'
            });
        }

        connection = await conectarDB();

        const [medicamentos] = await connection.execute(
            `SELECT * FROM medicamentos_recetados
             WHERE id_historia_clinica = ?
             ORDER BY created_at DESC`,
            [consultaId]
        );

        res.json({
            success: true,
            data: medicamentos
        });

    } catch (error) {
        console.error('❌ Error en obtenerMedicamentosConsulta:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener los medicamentos',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error);
            }
        }
    }
};

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

export {
    // Historial completo
    obtenerHistorialCompleto,

    // Consultas
    crearConsulta,
    actualizarConsulta,

    // Vacunas
    agregarVacuna,
    actualizarVacuna,

    // Alergias
    agregarAlergia,
    desactivarAlergia,

    // Cirugías
    agregarCirugia,

    // Medicamentos
    agregarMedicamento,
    obtenerMedicamentosConsulta
};
