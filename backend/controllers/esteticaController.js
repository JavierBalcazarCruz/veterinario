// backend/controllers/esteticaController.js
import conectarDB from '../config/db.js';

/**
 * ============================================================================
 * CONTROLADOR DE CITAS DE ESTÉTICA Y GROOMING
 * Gestiona programación, fotos before/after, perfiles de estilo
 * ============================================================================
 */

/**
 * ✅ Crear una nueva cita de estética
 */
const crearCitaEstetica = async (req, res) => {
    let connection;
    try {
        const {
            id_paciente,
            id_estilista,
            fecha,
            hora,
            tipo_servicio,
            estilo_corte,
            duracion_estimada,
            precio,
            notas
        } = req.body;

        // Validaciones
        if (!id_paciente || !fecha || !hora || !tipo_servicio) {
            return res.status(400).json({
                success: false,
                msg: 'Paciente, fecha, hora y tipo de servicio son obligatorios'
            });
        }

        // Validar que la fecha no sea en el pasado
        const fechaCita = new Date(fecha + 'T00:00:00'); // Asegurar hora local
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        if (fechaCita < hoy) {
            return res.status(400).json({
                success: false,
                msg: 'No se pueden programar citas en fechas pasadas'
            });
        }

        // Validar tipo_servicio
        const tiposValidos = ['baño', 'corte', 'baño_corte', 'uñas', 'limpieza_dental', 'spa_premium', 'deslanado', 'tratamiento_pulgas', 'otro'];
        if (!tiposValidos.includes(tipo_servicio)) {
            return res.status(400).json({
                success: false,
                msg: 'Tipo de servicio no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que el paciente existe
            const [pacientes] = await connection.execute(
                `SELECT id, nombre_mascota, id_raza
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

            const paciente = pacientes[0];

            // Obtener raza para referencia (temporalmente sin tamaño)
            const [razas] = await connection.execute(
                `SELECT r.nombre
                 FROM razas r
                 WHERE r.id = ?`,
                [paciente.id_raza]
            );

            let duracionFinal = duracion_estimada || 60;

            // Duración por defecto según tipo de servicio
            if (!duracion_estimada) {
                if (tipo_servicio === 'baño') duracionFinal = 60;
                else if (tipo_servicio === 'corte') duracionFinal = 90;
                else if (tipo_servicio === 'baño_corte') duracionFinal = 120;
                else if (tipo_servicio === 'uñas') duracionFinal = 20;
                else if (tipo_servicio === 'limpieza_dental') duracionFinal = 45;
                else if (tipo_servicio === 'spa_premium') duracionFinal = 150;
                else if (tipo_servicio === 'deslanado') duracionFinal = 90;
                else if (tipo_servicio === 'tratamiento_pulgas') duracionFinal = 45;
            }

            // Verificar disponibilidad (no doble booking)
            const estilistaId = id_estilista || null;

            if (estilistaId) {
                const [citasExistentes] = await connection.execute(
                    `SELECT id FROM citas_estetica
                     WHERE id_estilista = ?
                     AND fecha = ?
                     AND hora = ?
                     AND estado NOT IN ('cancelada', 'no_asistio')`,
                    [estilistaId, fecha, hora]
                );

                if (citasExistentes.length > 0) {
                    await connection.rollback();
                    return res.status(409).json({
                        success: false,
                        msg: 'Ya existe una cita programada en ese horario para este estilista'
                    });
                }
            }

            // Crear la cita de estética
            const [result] = await connection.execute(
                `INSERT INTO citas_estetica (
                    id_paciente, id_estilista, fecha, hora,
                    tipo_servicio, estilo_corte, raza_especifica, tamaño,
                    duracion_estimada, precio, notas, estado,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'programada', NOW(), NOW())`,
                [
                    id_paciente,
                    estilistaId,
                    fecha,
                    hora,
                    tipo_servicio,
                    estilo_corte || null,
                    razas[0]?.nombre || null,
                    null, // tamaño - temporalmente null hasta verificar columna en tabla razas
                    duracionFinal,
                    precio || null,
                    notas || null
                ]
            );

            const id_cita = result.insertId;

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas_estetica', ?, ?, 'crear', ?, NOW())`,
                [
                    id_cita,
                    req.usuario.id,
                    JSON.stringify({
                        paciente: paciente.nombre_mascota,
                        fecha,
                        hora,
                        tipo_servicio,
                        duracion_estimada: duracionFinal
                    })
                ]
            );

            await connection.commit();

            // Obtener datos completos de la cita creada
            const [citaCompleta] = await connection.execute(
                `SELECT ce.*,
                        p.nombre_mascota, p.foto_url,
                        pr.nombre AS nombre_propietario,
                        pr.apellidos AS apellidos_propietario,
                        pr.email AS email_propietario,
                        t.numero AS telefono_propietario,
                        r.nombre AS raza, e.nombre AS especie
                 FROM citas_estetica ce
                 INNER JOIN pacientes p ON ce.id_paciente = p.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
                 LEFT JOIN razas r ON p.id_raza = r.id
                 LEFT JOIN especies e ON r.id_especie = e.id
                 WHERE ce.id = ?`,
                [id_cita]
            );

            res.status(201).json({
                success: true,
                msg: 'Cita de estética creada exitosamente',
                data: citaCompleta[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en crearCitaEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al crear la cita de estética',
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
 * ✅ Obtener todas las citas de estética (con filtros opcionales)
 */
const obtenerCitasEstetica = async (req, res) => {
    let connection;
    try {
        const { fecha, estado, tipo_servicio } = req.query;

        connection = await conectarDB();

        // Construir query dinámico
        let query = `
            SELECT ce.*,
                   p.nombre_mascota, p.foto_url,
                   pr.nombre AS nombre_propietario,
                   pr.apellidos AS apellidos_propietario,
                   pr.email AS email_propietario,
                   t.numero AS telefono_propietario,
                   r.nombre AS raza, e.nombre AS especie
            FROM citas_estetica ce
            INNER JOIN pacientes p ON ce.id_paciente = p.id
            INNER JOIN propietarios pr ON p.id_propietario = pr.id
            LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
            LEFT JOIN razas r ON p.id_raza = r.id
            LEFT JOIN especies e ON r.id_especie = e.id
            WHERE 1=1
        `;

        const params = [];

        // Aplicar filtros
        if (fecha) {
            query += ' AND ce.fecha = ?';
            params.push(fecha);
        }

        if (estado) {
            query += ' AND ce.estado = ?';
            params.push(estado);
        }

        if (tipo_servicio) {
            query += ' AND ce.tipo_servicio = ?';
            params.push(tipo_servicio);
        }

        query += ' ORDER BY ce.fecha ASC, ce.hora ASC';

        const [citas] = await connection.execute(query, params);

        res.json({
            success: true,
            data: citas,
            total: citas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerCitasEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener las citas de estética',
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
 * ✅ Obtener una cita de estética por ID
 */
const obtenerCitaEstetica = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();

        const [citas] = await connection.execute(
            `SELECT ce.*,
                    p.nombre_mascota, p.foto_url, p.peso, p.fecha_nacimiento,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario,
                    pr.email AS email_propietario,
                    t.numero AS telefono_propietario,
                    r.nombre AS raza, e.nombre AS especie
             FROM citas_estetica ce
             INNER JOIN pacientes p ON ce.id_paciente = p.id
             INNER JOIN propietarios pr ON p.id_propietario = pr.id
             LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
             LEFT JOIN razas r ON p.id_raza = r.id
             LEFT JOIN especies e ON r.id_especie = e.id
             WHERE ce.id = ?`,
            [id]
        );

        if (citas.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Cita de estética no encontrada'
            });
        }

        // Obtener galería de fotos
        const [fotos] = await connection.execute(
            `SELECT * FROM galeria_estetica WHERE id_cita_estetica = ? ORDER BY created_at ASC`,
            [id]
        );

        res.json({
            success: true,
            data: {
                ...citas[0],
                galeria: fotos
            }
        });

    } catch (error) {
        console.error('❌ Error en obtenerCitaEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener la cita de estética',
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
 * ✅ Actualizar una cita de estética
 */
const actualizarCitaEstetica = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const {
            fecha,
            hora,
            tipo_servicio,
            estilo_corte,
            duracion_estimada,
            precio,
            notas,
            productos_usados,
            notas_comportamiento
        } = req.body;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que la cita existe
            const [citas] = await connection.execute(
                'SELECT * FROM citas_estetica WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita de estética no encontrada'
                });
            }

            const citaActual = citas[0];

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
                const fechaCita = new Date(fecha + 'T00:00:00'); // Asegurar hora local
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

            if (tipo_servicio) {
                const tiposValidos = ['baño', 'corte', 'baño_corte', 'uñas', 'limpieza_dental', 'spa_premium', 'deslanado', 'tratamiento_pulgas', 'otro'];
                if (!tiposValidos.includes(tipo_servicio)) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        msg: 'Tipo de servicio no válido'
                    });
                }

                fieldsToUpdate.push('tipo_servicio = ?');
                values.push(tipo_servicio);
            }

            if (estilo_corte !== undefined) {
                fieldsToUpdate.push('estilo_corte = ?');
                values.push(estilo_corte);
            }

            if (duracion_estimada) {
                fieldsToUpdate.push('duracion_estimada = ?');
                values.push(duracion_estimada);
            }

            if (precio !== undefined) {
                fieldsToUpdate.push('precio = ?');
                values.push(precio);
            }

            if (notas !== undefined) {
                fieldsToUpdate.push('notas = ?');
                values.push(notas);
            }

            if (productos_usados !== undefined) {
                fieldsToUpdate.push('productos_usados = ?');
                values.push(productos_usados);
            }

            if (notas_comportamiento !== undefined) {
                fieldsToUpdate.push('notas_comportamiento = ?');
                values.push(notas_comportamiento);
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

            // Actualizar
            await connection.execute(
                `UPDATE citas_estetica SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                values
            );

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas_estetica', ?, ?, 'modificar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify(req.body)]
            );

            await connection.commit();

            // Obtener datos actualizados
            const [citaActualizada] = await connection.execute(
                `SELECT ce.*,
                        p.nombre_mascota, p.foto_url,
                        pr.nombre AS nombre_propietario,
                        pr.apellidos AS apellidos_propietario
                 FROM citas_estetica ce
                 INNER JOIN pacientes p ON ce.id_paciente = p.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 WHERE ce.id = ?`,
                [id]
            );

            res.json({
                success: true,
                msg: 'Cita de estética actualizada exitosamente',
                data: citaActualizada[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en actualizarCitaEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar la cita de estética',
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
 * ✅ Eliminar (cancelar) una cita de estética
 */
const eliminarCitaEstetica = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            const [citas] = await connection.execute(
                'SELECT * FROM citas_estetica WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita de estética no encontrada'
                });
            }

            const cita = citas[0];

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_antiguos, created_at
                ) VALUES ('citas_estetica', ?, ?, 'eliminar', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify(cita)]
            );

            // Eliminar la cita y sus fotos asociadas
            await connection.execute(
                'DELETE FROM galeria_estetica WHERE id_cita_estetica = ?',
                [id]
            );

            await connection.execute(
                'DELETE FROM citas_estetica WHERE id = ?',
                [id]
            );

            await connection.commit();

            res.json({
                success: true,
                msg: 'Cita de estética eliminada exitosamente'
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en eliminarCitaEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al eliminar la cita de estética',
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
 * ✅ Cambiar estado de una cita de estética
 */
const cambiarEstadoEstetica = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { estado } = req.body;

        const estadosValidos = ['programada', 'confirmada', 'en_proceso', 'completada', 'cancelada', 'no_asistio'];

        if (!estado || !estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                msg: 'Estado no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            const [citas] = await connection.execute(
                'SELECT * FROM citas_estetica WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita de estética no encontrada'
                });
            }

            const cita = citas[0];

            // Actualizar estado
            await connection.execute(
                'UPDATE citas_estetica SET estado = ?, updated_at = NOW() WHERE id = ?',
                [estado, id]
            );

            // Si se confirma, actualizar campos de confirmación
            if (estado === 'confirmada') {
                await connection.execute(
                    'UPDATE citas_estetica SET confirmada_por_cliente = TRUE, fecha_confirmacion = NOW() WHERE id = ?',
                    [id]
                );
            }

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('citas_estetica', ?, ?, 'cambio_estado', ?, NOW())`,
                [id, req.usuario.id, JSON.stringify({ estado_anterior: cita.estado, estado_nuevo: estado })]
            );

            await connection.commit();

            res.json({
                success: true,
                msg: `Cita marcada como ${estado}`,
                data: { id, estado }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en cambiarEstadoEstetica:', error);
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
 * ✅ Agregar foto a la galería
 */
const agregarFoto = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const { tipo_foto, url_foto, descripcion } = req.body;

        if (!tipo_foto || !url_foto) {
            return res.status(400).json({
                success: false,
                msg: 'Tipo de foto y URL son obligatorios'
            });
        }

        const tiposValidos = ['antes', 'durante', 'despues'];
        if (!tiposValidos.includes(tipo_foto)) {
            return res.status(400).json({
                success: false,
                msg: 'Tipo de foto no válido'
            });
        }

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que la cita existe
            const [citas] = await connection.execute(
                'SELECT id_paciente FROM citas_estetica WHERE id = ?',
                [id]
            );

            if (citas.length === 0) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    msg: 'Cita de estética no encontrada'
                });
            }

            const id_paciente = citas[0].id_paciente;

            // Agregar foto a galería
            const [result] = await connection.execute(
                `INSERT INTO galeria_estetica (
                    id_cita_estetica, id_paciente, tipo_foto, url_foto, descripcion, created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())`,
                [id, id_paciente, tipo_foto, url_foto, descripcion || null]
            );

            // Actualizar campos foto_antes/foto_despues en citas_estetica
            if (tipo_foto === 'antes') {
                await connection.execute(
                    'UPDATE citas_estetica SET foto_antes = ? WHERE id = ?',
                    [url_foto, id]
                );
            } else if (tipo_foto === 'despues') {
                await connection.execute(
                    'UPDATE citas_estetica SET foto_despues = ? WHERE id = ?',
                    [url_foto, id]
                );
            }

            await connection.commit();

            res.status(201).json({
                success: true,
                msg: 'Foto agregada exitosamente',
                data: {
                    id: result.insertId,
                    tipo_foto,
                    url_foto,
                    descripcion
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en agregarFoto:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al agregar foto',
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
 * ✅ Obtener galería de fotos de una cita
 */
const obtenerGaleria = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;

        connection = await conectarDB();

        const [fotos] = await connection.execute(
            `SELECT * FROM galeria_estetica WHERE id_cita_estetica = ? ORDER BY created_at ASC`,
            [id]
        );

        res.json({
            success: true,
            data: fotos,
            total: fotos.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerGaleria:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener galería',
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
 * ✅ Obtener/Crear perfil de estética de un paciente
 */
const obtenerPerfilEstetica = async (req, res) => {
    let connection;
    try {
        const { id_paciente } = req.params;

        connection = await conectarDB();

        let [perfiles] = await connection.execute(
            `SELECT * FROM perfiles_estetica WHERE id_paciente = ?`,
            [id_paciente]
        );

        if (perfiles.length === 0) {
            // Crear perfil por defecto
            await connection.execute(
                `INSERT INTO perfiles_estetica (id_paciente, created_at) VALUES (?, NOW())`,
                [id_paciente]
            );

            [perfiles] = await connection.execute(
                `SELECT * FROM perfiles_estetica WHERE id_paciente = ?`,
                [id_paciente]
            );
        }

        res.json({
            success: true,
            data: perfiles[0]
        });

    } catch (error) {
        console.error('❌ Error en obtenerPerfilEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener perfil de estética',
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
 * ✅ Actualizar perfil de estética
 */
const actualizarPerfilEstetica = async (req, res) => {
    let connection;
    try {
        const { id_paciente } = req.params;
        const {
            estilo_preferido,
            largo_preferido,
            productos_favoritos,
            productos_evitar,
            sensibilidades,
            preferencias_especiales,
            frecuencia_recomendada_dias
        } = req.body;

        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // Verificar que el perfil existe
            let [perfiles] = await connection.execute(
                `SELECT id FROM perfiles_estetica WHERE id_paciente = ?`,
                [id_paciente]
            );

            if (perfiles.length === 0) {
                // Crear perfil si no existe
                await connection.execute(
                    `INSERT INTO perfiles_estetica (id_paciente, created_at) VALUES (?, NOW())`,
                    [id_paciente]
                );
            }

            // Construir actualización
            const fieldsToUpdate = [];
            const values = [];

            if (estilo_preferido !== undefined) {
                fieldsToUpdate.push('estilo_preferido = ?');
                values.push(estilo_preferido);
            }

            if (largo_preferido !== undefined) {
                fieldsToUpdate.push('largo_preferido = ?');
                values.push(largo_preferido);
            }

            if (productos_favoritos !== undefined) {
                fieldsToUpdate.push('productos_favoritos = ?');
                values.push(productos_favoritos);
            }

            if (productos_evitar !== undefined) {
                fieldsToUpdate.push('productos_evitar = ?');
                values.push(productos_evitar);
            }

            if (sensibilidades !== undefined) {
                fieldsToUpdate.push('sensibilidades = ?');
                values.push(sensibilidades);
            }

            if (preferencias_especiales !== undefined) {
                fieldsToUpdate.push('preferencias_especiales = ?');
                values.push(preferencias_especiales);
            }

            if (frecuencia_recomendada_dias) {
                fieldsToUpdate.push('frecuencia_recomendada_dias = ?');
                values.push(frecuencia_recomendada_dias);
            }

            if (fieldsToUpdate.length > 0) {
                fieldsToUpdate.push('ultima_actualizacion = NOW()');
                values.push(id_paciente);

                await connection.execute(
                    `UPDATE perfiles_estetica SET ${fieldsToUpdate.join(', ')} WHERE id_paciente = ?`,
                    values
                );
            }

            await connection.commit();

            // Obtener perfil actualizado
            [perfiles] = await connection.execute(
                `SELECT * FROM perfiles_estetica WHERE id_paciente = ?`,
                [id_paciente]
            );

            res.json({
                success: true,
                msg: 'Perfil de estética actualizado exitosamente',
                data: perfiles[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en actualizarPerfilEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar perfil de estética',
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
 * ✅ Obtener historial de estética de un paciente
 */
const obtenerHistorialEstetica = async (req, res) => {
    let connection;
    try {
        const { id_paciente } = req.params;

        connection = await conectarDB();

        const [historial] = await connection.execute(
            `SELECT ce.*
             FROM citas_estetica ce
             WHERE ce.id_paciente = ?
             ORDER BY ce.fecha DESC, ce.hora DESC`,
            [id_paciente]
        );

        // Obtener galería para cada cita
        for (let i = 0; i < historial.length; i++) {
            const [fotos] = await connection.execute(
                `SELECT * FROM galeria_estetica WHERE id_cita_estetica = ? ORDER BY created_at ASC`,
                [historial[i].id]
            );
            historial[i].galeria = fotos;
        }

        res.json({
            success: true,
            data: historial,
            total: historial.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerHistorialEstetica:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener historial de estética',
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
    crearCitaEstetica,
    obtenerCitasEstetica,
    obtenerCitaEstetica,
    actualizarCitaEstetica,
    eliminarCitaEstetica,
    cambiarEstadoEstetica,
    agregarFoto,
    obtenerGaleria,
    obtenerPerfilEstetica,
    actualizarPerfilEstetica,
    obtenerHistorialEstetica
};
