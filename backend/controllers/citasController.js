// backend/controllers/citasController.js
import conectarDB from '../config/db.js';

/**
 * ============================================================================
 * CONTROLADOR DE CITAS MÉDICAS
 * Gestiona programación, modificación y seguimiento de citas veterinarias
 * ============================================================================
 */

/**
 * ✅ Crear una nueva cita médica
 */
const crearCita = async (req, res) => {
    let connection;
    try {
        const { id_paciente, fecha, hora, tipo_consulta, notas } = req.body;

        // Validaciones
        if (!id_paciente || !fecha || !hora) {
            return res.status(400).json({
                success: false,
                msg: 'Paciente, fecha y hora son obligatorios'
            });
        }

        // Validar que la fecha no sea en el pasado
        const fechaCita = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaCita < hoy) {
            return res.status(400).json({
                success: false,
                msg: 'No se pueden programar citas en fechas pasadas'
            });
        }

        // Validar tipo_consulta
        const tiposValidos = ['primera_vez', 'seguimiento', 'urgencia', 'vacunacion'];
        if (tipo_consulta && !tiposValidos.includes(tipo_consulta)) {
            return res.status(400).json({
                success: false,
                msg: 'Tipo de consulta no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Obtener ID del doctor
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            const id_doctor = doctores[0].id;

            // Verificar que el paciente existe y pertenece al doctor (o es admin)
            const [pacientes] = await connection.execute(
                `SELECT id, id_doctor, nombre_mascota
                 FROM pacientes
                 WHERE id = ? AND estado = 'activo'`,
                [id_paciente]
            );

            if (pacientes.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Paciente no encontrado'
                });
            }

            // Verificar permisos (solo si es doctor)
            if (req.usuario.rol === 'doctor' && pacientes[0].id_doctor !== id_doctor) {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para crear citas para este paciente'
                });
            }

            // Verificar disponibilidad (no doble booking)
            const [citasExistentes] = await connection.execute(
                `SELECT id FROM citas
                 WHERE id_doctor = ?
                 AND fecha = ?
                 AND hora = ?
                 AND estado NOT IN ('cancelada', 'no_asistio')`,
                [id_doctor, fecha, hora]
            );

            if (citasExistentes.length > 0) {
                await connection.rollback();
                return res.status(409).json({
                    success: false,
                    msg: 'Ya existe una cita programada en ese horario'
                });
            }

            // Crear la cita
            const [result] = await connection.execute(
                `INSERT INTO citas (
                    id_paciente, id_doctor, fecha, hora,
                    tipo_consulta, notas, estado,
                    duracion_minutos, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'programada', 30, NOW(), NOW())`,
                [
                    id_paciente,
                    id_doctor,
                    fecha,
                    hora,
                    tipo_consulta || 'seguimiento',
                    notas || null
                ]
            );

            const id_cita = result.insertId;

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas', ?, ?, 'crear', ?, NOW())`,
                [
                    id_cita,
                    req.usuario.id,
                    JSON.stringify({
                        paciente: pacientes[0].nombre_mascota,
                        fecha,
                        hora,
                        tipo_consulta
                    })
                ]
            );

            await connection.commit();

            // Obtener datos completos de la cita creada
            const [citaCompleta] = await connection.execute(
                `SELECT c.*,
                        p.nombre_mascota, p.foto_url,
                        pr.nombre AS nombre_propietario,
                        pr.apellidos AS apellidos_propietario,
                        pr.email AS email_propietario,
                        t.numero AS telefono_propietario,
                        r.nombre AS raza, e.nombre AS especie
                 FROM citas c
                 INNER JOIN pacientes p ON c.id_paciente = p.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
                 LEFT JOIN razas r ON p.id_raza = r.id
                 LEFT JOIN especies e ON r.id_especie = e.id
                 WHERE c.id = ?`,
                [id_cita]
            );

            res.status(201).json({
                success: true,
                msg: 'Cita creada exitosamente',
                data: citaCompleta[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en crearCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al crear la cita',
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
 * ✅ Obtener todas las citas (con filtros opcionales)
 */
const obtenerCitas = async (req, res) => {
    let connection;
    try {
        const { fecha, estado, tipo_consulta } = req.query;

        connection = await conectarDB();

        // Obtener ID del doctor si es rol doctor
        let id_doctor = null;
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                console.log('⚠️  Usuario es doctor pero no tiene registro en tabla doctores. Usuario ID:', req.usuario.id);
                console.log('⚠️  Mostrando todas las citas sin filtro de doctor');
                // No retornamos error, permitimos ver todas las citas
            } else {
                id_doctor = doctores[0].id;
                console.log('✅ Filtrando citas para doctor ID:', id_doctor);
            }
        }

        // Construir query dinámico
        let query = `
            SELECT c.*,
                   p.nombre_mascota, p.foto_url,
                   pr.nombre AS nombre_propietario,
                   pr.apellidos AS apellidos_propietario,
                   pr.email AS email_propietario,
                   t.numero AS telefono_propietario,
                   r.nombre AS raza, e.nombre AS especie
            FROM citas c
            INNER JOIN pacientes p ON c.id_paciente = p.id
            INNER JOIN propietarios pr ON p.id_propietario = pr.id
            LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
            LEFT JOIN razas r ON p.id_raza = r.id
            LEFT JOIN especies e ON r.id_especie = e.id
            WHERE 1=1
        `;

        const params = [];

        // Filtrar por doctor si es necesario
        if (id_doctor) {
            query += ' AND c.id_doctor = ?';
            params.push(id_doctor);
        } else if (['admin', 'superadmin', 'recepcion'].includes(req.usuario.rol)) {
            // Filtrar por clínica
            query += ` AND c.id_doctor IN (
                SELECT d.id FROM doctores d
                INNER JOIN usuarios u ON d.id_usuario = u.id
                WHERE u.id_licencia_clinica = ?
            )`;
            params.push(req.usuario.id_licencia_clinica);
        }

        // Aplicar filtros adicionales
        if (fecha) {
            query += ' AND c.fecha = ?';
            params.push(fecha);
        }

        if (estado) {
            query += ' AND c.estado = ?';
            params.push(estado);
        }

        if (tipo_consulta) {
            query += ' AND c.tipo_consulta = ?';
            params.push(tipo_consulta);
        }

        query += ' ORDER BY c.fecha ASC, c.hora ASC';

        console.log('🔍 obtenerCitas - Filtros:', { fecha, estado, tipo_consulta, id_doctor });
        console.log('📋 Query params:', params);

        const [citas] = await connection.execute(query, params);

        console.log(`✅ Citas encontradas: ${citas.length}`);

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerCitas:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener las citas',
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
 * ✅ Obtener una cita por ID
 */
const obtenerCita = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();

        const [citas] = await connection.execute(
            `SELECT c.*,
                    p.nombre_mascota, p.foto_url, p.peso, p.fecha_nacimiento,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario,
                    pr.email AS email_propietario,
                    t.numero AS telefono_propietario,
                    r.nombre AS raza, e.nombre AS especie,
                    d.id AS doctor_id,
                    u.nombre AS doctor_nombre,
                    u.apellidos AS doctor_apellidos
             FROM citas c
             INNER JOIN pacientes p ON c.id_paciente = p.id
             INNER JOIN propietarios pr ON p.id_propietario = pr.id
             LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
             LEFT JOIN razas r ON p.id_raza = r.id
             LEFT JOIN especies e ON r.id_especie = e.id
             INNER JOIN doctores d ON c.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE c.id = ?`,
            [id]
        );

        if (citas.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Cita no encontrada'
            });
        }

        // Verificar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0 || citas[0].doctor_id !== doctores[0].id) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para ver esta cita'
                });
            }
        }

        res.json({
            success: true,
            data: citas[0]
        });

    } catch (error) {
        console.error('❌ Error en obtenerCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener la cita',
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
 * ✅ Actualizar una cita
 */
const actualizarCita = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { fecha, hora, tipo_consulta, notas } = req.body;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que la cita existe
            const [citas] = await connection.execute(
                'SELECT * FROM citas WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita no encontrada'
                });
            }

            const citaActual = citas[0];

            // Verificar permisos
            if (req.usuario.rol === 'doctor') {
                const [doctores] = await connection.execute(
                    'SELECT id FROM doctores WHERE id_usuario = ?',
                    [req.usuario.id]
                );

                if (doctores.length === 0 || citaActual.id_doctor !== doctores[0].id) {
                    await connection.rollback();
                    return res.status(403).json({
                        success: false,
                        msg: 'No tienes permiso para modificar esta cita'
                    });
                }
            }

            // No permitir modificar citas completadas o canceladas
            if (['completada', 'cancelada'].includes(citaActual.estado)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    msg: `No se puede modificar una cita ${citaActual.estado}`
                });
            }

            // Construir actualización
            const fieldsToUpdate = [];
            const values = [];

            if (fecha) {
                // Validar que la fecha no sea en el pasado
                const fechaCita = new Date(fecha);
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);

                if (fechaCita < hoy) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        msg: 'No se pueden programar citas en fechas pasadas'
                    });
                }

                fieldsToUpdate.push('fecha = ?');
                values.push(fecha);
            }

            if (hora) {
                fieldsToUpdate.push('hora = ?');
                values.push(hora);
            }

            if (tipo_consulta) {
                const tiposValidos = ['primera_vez', 'seguimiento', 'urgencia', 'vacunacion'];
                if (!tiposValidos.includes(tipo_consulta)) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        msg: 'Tipo de consulta no válido'
                    });
                }

                fieldsToUpdate.push('tipo_consulta = ?');
                values.push(tipo_consulta);
            }

            if (notas !== undefined) {
                fieldsToUpdate.push('notas = ?');
                values.push(notas);
            }

            if (fieldsToUpdate.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    msg: 'No se proporcionaron datos para actualizar'
                });
            }

            fieldsToUpdate.push('updated_at = NOW()');
            values.push(id);

            // Si se actualiza fecha u hora, verificar disponibilidad
            if (fecha || hora) {
                const [citasExistentes] = await connection.execute(
                    `SELECT id FROM citas
                     WHERE id_doctor = ?
                     AND fecha = ?
                     AND hora = ?
                     AND id != ?
                     AND estado NOT IN ('cancelada', 'no_asistio')`,
                    [
                        citaActual.id_doctor,
                        fecha || citaActual.fecha,
                        hora || citaActual.hora,
                        id
                    ]
                );

                if (citasExistentes.length > 0) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        msg: 'Ya existe una cita programada en ese horario'
                    });
                }
            }

            // Actualizar
            await connection.execute(
                `UPDATE citas SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                values
            );

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas', ?, ?, 'modificar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify({ fecha, hora, tipo_consulta, notas })]
            );

            await connection.commit();

            // Obtener datos actualizados
            const [citaActualizada] = await connection.execute(
                `SELECT c.*,
                        p.nombre_mascota, p.foto_url,
                        pr.nombre AS nombre_propietario,
                        pr.apellidos AS apellidos_propietario
                 FROM citas c
                 INNER JOIN pacientes p ON c.id_paciente = p.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 WHERE c.id = ?`,
                [id]
            );

            res.json({
                success: true,
                msg: 'Cita actualizada exitosamente',
                data: citaActualizada[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en actualizarCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la cita',
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
 * ✅ Eliminar (cancelar) una cita
 */
const eliminarCita = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que la cita existe
            const [citas] = await connection.execute(
                'SELECT * FROM citas WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita no encontrada'
                });
            }

            const cita = citas[0];

            // Verificar permisos
            if (req.usuario.rol === 'doctor') {
                const [doctores] = await connection.execute(
                    'SELECT id FROM doctores WHERE id_usuario = ?',
                    [req.usuario.id]
                );

                if (doctores.length === 0 || cita.id_doctor !== doctores[0].id) {
                    await connection.rollback();
                    return res.status(403).json({
                        success: false,
                        msg: 'No tienes permiso para eliminar esta cita'
                    });
                }
            }

            // Registrar en audit_logs antes de eliminar
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_antiguos, created_at
                ) VALUES ('citas', ?, ?, 'eliminar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify(cita)]
            );

            // Eliminar la cita
            await connection.execute(
                'DELETE FROM citas WHERE id = ?',
                [id]
            );

            await connection.commit();

            res.json({
                success: true,
                msg: 'Cita eliminada exitosamente'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en eliminarCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar la cita',
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
 * ✅ Cambiar estado de una cita
 */
const cambiarEstado = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['programada', 'confirmada', 'cancelada', 'completada', 'no_asistio', 'en_curso'];

        if (!estado || !estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                msg: 'Estado no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que la cita existe
            const [citas] = await connection.execute(
                'SELECT * FROM citas WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita no encontrada'
                });
            }

            const cita = citas[0];

            // Verificar permisos
            if (req.usuario.rol === 'doctor') {
                const [doctores] = await connection.execute(
                    'SELECT id FROM doctores WHERE id_usuario = ?',
                    [req.usuario.id]
                );

                if (doctores.length === 0 || cita.id_doctor !== doctores[0].id) {
                    await connection.rollback();
                    return res.status(403).json({
                        success: false,
                        msg: 'No tienes permiso para modificar esta cita'
                    });
                }
            }

            // Actualizar estado
            await connection.execute(
                'UPDATE citas SET estado = ?, updated_at = NOW() WHERE id = ?',
                [estado, id]
            );

            // Si se confirma, actualizar campos de confirmación
            if (estado === 'confirmada') {
                await connection.execute(
                    'UPDATE citas SET confirmada_por_cliente = TRUE, fecha_confirmacion = NOW() WHERE id = ?',
                    [id]
                );
            }

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas', ?, ?, 'cambio_estado', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify({ estado_anterior: cita.estado, estado_nuevo: estado })]
            );

            await connection.commit();

            // Obtener datos actualizados
            const [citaActualizada] = await connection.execute(
                `SELECT c.*,
                        p.nombre_mascota,
                        pr.nombre AS nombre_propietario
                 FROM citas c
                 INNER JOIN pacientes p ON c.id_paciente = p.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 WHERE c.id = ?`,
                [id]
            );

            res.json({
                success: true,
                msg: `Cita marcada como ${estado}`,
                data: citaActualizada[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en cambiarEstado:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al cambiar estado de la cita',
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
 * ✅ Confirmar una cita
 */
const confirmarCita = async (req, res) => {
    return cambiarEstado({ ...req, body: { estado: 'confirmada' } }, res);
};

/**
 * ✅ Cancelar una cita
 */
const cancelarCita = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            const [citas] = await connection.execute(
                'SELECT * FROM citas WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita no encontrada'
                });
            }

            // Actualizar estado y motivo
            await connection.execute(
                'UPDATE citas SET estado = "cancelada", motivo_cancelacion = ?, updated_at = NOW() WHERE id = ?',
                [motivo || 'Sin motivo especificado', id]
            );

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas', ?, ?, 'cancelar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify({ motivo })]
            );

            await connection.commit();

            res.json({
                success: true,
                msg: 'Cita cancelada exitosamente'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en cancelarCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al cancelar la cita',
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
 * ✅ Completar una cita
 */
const completarCita = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { observaciones } = req.body;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            const [citas] = await connection.execute(
                'SELECT * FROM citas WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita no encontrada'
                });
            }

            await connection.execute(
                'UPDATE citas SET estado = "completada", observaciones_finales = ?, updated_at = NOW() WHERE id = ?',
                [observaciones || null, id]
            );

            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas', ?, ?, 'completar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify({ observaciones })]
            );

            await connection.commit();

            res.json({
                success: true,
                msg: 'Cita completada exitosamente'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en completarCita:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al completar la cita',
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
 * ✅ Iniciar consulta (cambiar a en_curso)
 */
const iniciarConsulta = async (req, res) => {
    return cambiarEstado({ ...req, body: { estado: 'en_curso' } }, res);
};

/**
 * ✅ Obtener citas por fecha
 */
const obtenerCitasPorFecha = async (req, res) => {
    const { date } = req.params;
    return obtenerCitas({ ...req, query: { ...req.query, fecha: date } }, res);
};

/**
 * ✅ Obtener citas por rango de fechas
 */
const obtenerCitasPorRango = async (req, res) => {
    let connection;
    try {
        const { start, end } = req.query;

        if (!start || !end) {
            return res.status(400).json({
                success: false,
                msg: 'Se requieren fechas de inicio y fin'
            });
        }

        connection = await conectarDB();

        // Obtener ID del doctor si es rol doctor
        let id_doctor = null;
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            id_doctor = doctores[0].id;
        }

        let query = `
            SELECT c.*,
                   p.nombre_mascota, p.foto_url,
                   pr.nombre AS nombre_propietario,
                   pr.apellidos AS apellidos_propietario
            FROM citas c
            INNER JOIN pacientes p ON c.id_paciente = p.id
            INNER JOIN propietarios pr ON p.id_propietario = pr.id
            WHERE c.fecha BETWEEN ? AND ?
        `;

        const params = [start, end];

        if (id_doctor) {
            query += ' AND c.id_doctor = ?';
            params.push(id_doctor);
        }

        query += ' ORDER BY c.fecha ASC, c.hora ASC';

        const [citas] = await connection.execute(query, params);

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerCitasPorRango:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener las citas',
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
 * ✅ Obtener próximas citas
 */
const obtenerProximas = async (req, res) => {
    let connection;
    try {
        const limit = parseInt(req.query.limit) || 5;

        connection = await conectarDB();

        // Obtener ID del doctor si es rol doctor
        let id_doctor = null;
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                console.log('⚠️  Usuario es doctor pero no tiene registro en tabla doctores. Usuario ID:', req.usuario.id);
                // No retornamos error, simplemente no filtramos por doctor
                // para que admins/recepción puedan ver todas las citas
            } else {
                id_doctor = doctores[0].id;
                console.log('✅ Doctor ID encontrado:', id_doctor);
            }
        }

        let query = `
            SELECT c.*,
                   p.nombre_mascota, p.foto_url,
                   pr.nombre AS nombre_propietario,
                   pr.apellidos AS apellidos_propietario,
                   pr.email AS email_propietario,
                   t.numero AS telefono_propietario,
                   r.nombre AS raza, e.nombre AS especie
            FROM citas c
            INNER JOIN pacientes p ON c.id_paciente = p.id
            INNER JOIN propietarios pr ON p.id_propietario = pr.id
            LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
            LEFT JOIN razas r ON p.id_raza = r.id
            LEFT JOIN especies e ON r.id_especie = e.id
            WHERE c.fecha >= CURDATE()
            AND c.estado IN ('programada', 'confirmada')
        `;

        const params = [];

        if (id_doctor) {
            query += ' AND c.id_doctor = ?';
            params.push(id_doctor);
        }

        query += ' ORDER BY c.fecha ASC, c.hora ASC LIMIT ?';
        params.push(limit);

        console.log('🔍 Query próximas citas:', query.replace(/\s+/g, ' ').trim());
        console.log('📋 Params:', params);

        const [citas] = await connection.execute(query, params);

        console.log(`✅ Próximas citas encontradas: ${citas.length}`);
        if (citas.length > 0) {
            console.log('📅 Primera cita:', {
                id: citas[0].id,
                fecha: citas[0].fecha,
                hora: citas[0].hora,
                mascota: citas[0].nombre_mascota
            });
        }

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerProximas:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener próximas citas',
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
 * ✅ Obtener citas de un paciente
 */
const obtenerPorPaciente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();

        const [citas] = await connection.execute(
            `SELECT c.*,
                    u.nombre AS doctor_nombre,
                    u.apellidos AS doctor_apellidos
             FROM citas c
             INNER JOIN doctores d ON c.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE c.id_paciente = ?
             ORDER BY c.fecha DESC, c.hora DESC`,
            [id]
        );

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerPorPaciente:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener citas del paciente',
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
 * ✅ Buscar citas
 */
const buscarCitas = async (req, res) => {
    let connection;
    try {
        const { q } = req.query;

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                msg: 'El término de búsqueda debe tener al menos 2 caracteres'
            });
        }

        connection = await conectarDB();

        const searchTerm = `%${q.trim()}%`;

        const [citas] = await connection.execute(
            `SELECT c.*,
                    p.nombre_mascota, p.foto_url,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario
             FROM citas c
             INNER JOIN pacientes p ON c.id_paciente = p.id
             INNER JOIN propietarios pr ON p.id_propietario = pr.id
             WHERE (
                 p.nombre_mascota LIKE ? OR
                 pr.nombre LIKE ? OR
                 pr.apellidos LIKE ?
             )
             ORDER BY c.fecha DESC, c.hora DESC
             LIMIT 20`,
            [searchTerm, searchTerm, searchTerm]
        );

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en buscarCitas:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al buscar citas',
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
 * ✅ Verificar disponibilidad de un horario
 */
const verificarDisponibilidad = async (req, res) => {
    let connection;
    try {
        const { fecha, hora, doctorId } = req.query;

        if (!fecha || !hora) {
            return res.status(400).json({
                success: false,
                msg: 'Fecha y hora son obligatorios'
            });
        }

        connection = await conectarDB();

        // Determinar ID del doctor
        let id_doctor = doctorId;
        if (!id_doctor) {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            id_doctor = doctores[0].id;
        }

        const [citas] = await connection.execute(
            `SELECT id FROM citas
             WHERE id_doctor = ?
             AND fecha = ?
             AND hora = ?
             AND estado NOT IN ('cancelada', 'no_asistio')`,
            [id_doctor, fecha, hora]
        );

        res.json({
            success: true,
            disponible: citas.length === 0,
            mensaje: citas.length === 0 ? 'Horario disponible' : 'Horario ocupado'
        });

    } catch (error) {
        console.error('❌ Error en verificarDisponibilidad:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al verificar disponibilidad',
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
 * ✅ Obtener horarios disponibles para una fecha
 */
const obtenerHorariosDisponibles = async (req, res) => {
    let connection;
    try {
        const { fecha, doctorId } = req.query;

        if (!fecha) {
            return res.status(400).json({
                success: false,
                msg: 'Fecha es obligatoria'
            });
        }

        connection = await conectarDB();

        // Determinar ID del doctor
        let id_doctor = doctorId;
        if (!id_doctor) {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'Doctor no encontrado'
                });
            }

            id_doctor = doctores[0].id;
        }

        // Obtener citas ocupadas
        const [citasOcupadas] = await connection.execute(
            `SELECT hora FROM citas
             WHERE id_doctor = ?
             AND fecha = ?
             AND estado NOT IN ('cancelada', 'no_asistio')`,
            [id_doctor, fecha]
        );

        // Generar todos los horarios posibles (8:00 - 18:00, intervalos de 30 min)
        const horariosCompletos = [];
        for (let hora = 8; hora < 18; hora++) {
            horariosCompletos.push(`${hora.toString().padStart(2, '0')}:00:00`);
            horariosCompletos.push(`${hora.toString().padStart(2, '0')}:30:00`);
        }

        // Filtrar horarios ocupados
        const horasOcupadas = citasOcupadas.map(c => c.hora);
        const horariosDisponibles = horariosCompletos.filter(h => !horasOcupadas.includes(h));

        res.json({
            success: true,
            data: horariosDisponibles,
            total: horariosDisponibles.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerHorariosDisponibles:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener horarios disponibles',
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
 * ✅ Obtener estadísticas de citas
 */
const obtenerEstadisticas = async (req, res) => {
    let connection;
    try {
        const { periodo } = req.query; // 'dia', 'semana', 'mes', 'año'

        connection = await conectarDB();

        // Determinar rango de fechas según periodo
        let fechaInicio;
        switch (periodo) {
            case 'dia':
                fechaInicio = 'CURDATE()';
                break;
            case 'semana':
                fechaInicio = 'DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
                break;
            case 'mes':
                fechaInicio = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
                break;
            case 'año':
                fechaInicio = 'DATE_SUB(CURDATE(), INTERVAL 365 DAY)';
                break;
            default:
                fechaInicio = 'DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
        }

        // Obtener ID del doctor si es necesario
        let filtroDoctor = '';
        const params = [];

        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                'SELECT id FROM doctores WHERE id_usuario = ?',
                [req.usuario.id]
            );

            if (doctores.length > 0) {
                filtroDoctor = 'AND id_doctor = ?';
                params.push(doctores[0].id);
            }
        }

        const [stats] = await connection.execute(
            `SELECT
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
                SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
                SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN estado = 'no_asistio' THEN 1 ELSE 0 END) as no_asistencias,
                SUM(CASE WHEN tipo_consulta = 'urgencia' THEN 1 ELSE 0 END) as urgencias
             FROM citas
             WHERE fecha >= ${fechaInicio} ${filtroDoctor}`,
            params
        );

        res.json({
            success: true,
            data: stats[0],
            periodo: periodo || 'mes'
        });

    } catch (error) {
        console.error('❌ Error en obtenerEstadisticas:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener estadísticas',
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

export {
    crearCita,
    obtenerCitas,
    obtenerCita,
    actualizarCita,
    eliminarCita,
    cambiarEstado,
    confirmarCita,
    cancelarCita,
    completarCita,
    iniciarConsulta,
    obtenerCitasPorFecha,
    obtenerCitasPorRango,
    obtenerProximas,
    obtenerPorPaciente,
    buscarCitas,
    verificarDisponibilidad,
    obtenerHorariosDisponibles,
    obtenerEstadisticas
};
