/**
 * ✅ Obtener información detallada de un paciente específico
 */
const obtenerPaciente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const pacienteId = parseInt(id);
        
        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({ 
                success: false,
                msg: 'ID de paciente no válido' 
            });
        }
        
        connection = await conectarDB();
        
        // Obtener información completa del paciente
        const [pacientes] = await connection.execute(
            `SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                    pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                    pr.email,
                    d.id AS doctor_id, u.id AS doctor_usuario_id,
                    YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) - 
                    (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad
             FROM pacientes p
             INNER JOIN razas r ON p.id_raza = r.id
             INNER JOIN especies e ON r.id_especie = e.id
             INNER JOIN propietarios pr ON p.id_propietario = pr.id
             INNER JOIN doctores d ON p.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE p.id = ? AND p.estado = 'activo'`,
            [pacienteId]
        );
        
        if (pacientes.length === 0) {
            return res.status(404).json({ 
                success: false,
                msg: 'Paciente no encontrado' 
            });
        }
        
        const paciente = pacientes[0];
        
        // ✅ Validar permisos según el rol del usuario
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
            
            if (paciente.doctor_id !== doctores[0].id) {
                return res.status(403).json({ 
                    success: false,
                    msg: 'No tienes permiso para acceder a este paciente' 
                });
            }
        }
        
        // Obtener teléfonos
        const [telefonos] = await connection.execute(
            `SELECT numero, tipo, principal 
             FROM telefonos 
             WHERE id_propietario = ? 
             ORDER BY principal DESC, id ASC`,
            [paciente.id_propietario]
        );
        
        // Obtener dirección completa
        const [direcciones] = await connection.execute(
            `SELECT d.calle, d.numero_ext, d.numero_int, d.referencias,
                    cp.codigo AS codigo_postal, cp.colonia,
                    m.nombre AS municipio, e.nombre AS estado, p.nombre AS pais
            FROM direcciones d
            INNER JOIN codigo_postal cp ON d.id_codigo_postal = cp.id
            INNER JOIN municipios m ON cp.id_municipio = m.id
            INNER JOIN estados e ON m.id_estado = e.id
            INNER JOIN paises p ON e.id_pais = p.id
            WHERE d.id_propietario = ? AND d.tipo = 'casa'
            LIMIT 1`,
            [paciente.id_propietario]
        );
        
        // Estructurar respuesta
        const pacienteCompleto = {
            ...paciente,
            edad: paciente.edad ? `${paciente.edad} años` : 'No especificada',
            telefono_principal: telefonos.find(t => t.principal === 1)?.numero || '',
            telefono_secundario: telefonos.find((t, index) => index === 1)?.numero || '',
            direccion: direcciones.length > 0 ? direcciones[0] : null,
            // Limpiar información interna
            doctor_id: undefined,
            doctor_usuario_id: undefined
        };
        
        res.json({
            success: true,
            data: pacienteCompleto
        });
        
    } catch (error) {
        console.error('❌ Error en obtenerPaciente:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error al obtener el paciente',
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
 * ✅ FLUJO 1: Actualizar SOLO datos del paciente (mascota)
 * NO modifica datos del propietario
 */
const actualizarPaciente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const pacienteId = parseInt(id);

        console.log('🐾 FLUJO 1: Actualizando SOLO datos del paciente ID:', pacienteId);

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();

        // Verificar que el paciente existe
        const [pacientes] = await connection.execute(
            `SELECT p.id, p.id_doctor
             FROM pacientes p
             WHERE p.id = ? AND p.estado = 'activo'`,
            [pacienteId]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Paciente no encontrado'
            });
        }

        const pacienteActual = pacientes[0];

        // Validar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0 || pacienteActual.id_doctor !== doctores[0].id) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para modificar este paciente'
                });
            }
        }

        await connection.beginTransaction();

        try {
            const updates = req.body;
            const fieldsToUpdate = [];
            const values = [];

            // Validar y agregar nombre_mascota
            if (updates.nombre_mascota) {
                validarSoloLetras(updates.nombre_mascota, 'El nombre de la mascota');
                validarLongitud(updates.nombre_mascota, 2, 100, 'El nombre de la mascota');
                fieldsToUpdate.push('nombre_mascota = ?');
                values.push(updates.nombre_mascota.trim());
            }

            // Agregar fecha_nacimiento
            if (updates.fecha_nacimiento) {
                fieldsToUpdate.push('fecha_nacimiento = ?');
                values.push(updates.fecha_nacimiento);
            }

            // Validar y agregar peso
            if (updates.peso) {
                const peso = parseFloat(updates.peso);
                if (peso <= 0) {
                    throw new Error('El peso debe ser mayor a 0');
                }
                fieldsToUpdate.push('peso = ?');
                values.push(peso);
            }

            // Validar y agregar raza
            if (updates.id_raza) {
                const [razas] = await connection.execute(
                    'SELECT id FROM razas WHERE id = ? AND activo = TRUE',
                    [updates.id_raza]
                );

                if (razas.length === 0) {
                    throw new Error('Raza no válida');
                }

                fieldsToUpdate.push('id_raza = ?');
                values.push(parseInt(updates.id_raza));
            }

            // Agregar foto_url
            if (updates.foto_url !== undefined) {
                fieldsToUpdate.push('foto_url = ?');
                values.push(updates.foto_url);
            }

            if (fieldsToUpdate.length === 0) {
                throw new Error('No se proporcionaron datos para actualizar');
            }

            values.push(pacienteId);

            const updateQuery = `UPDATE pacientes SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
            await connection.execute(updateQuery, values);

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (tabla, id_registro, id_usuario, accion, datos_nuevos)
                 VALUES ('pacientes', ?, ?, 'modificar', ?)`,
                [pacienteId, req.usuario.id, JSON.stringify(updates)]
            );

            await connection.commit();

            // Obtener datos actualizados
            const [pacienteActualizado] = await connection.execute(
                `SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                        pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                        pr.email,
                        GROUP_CONCAT(
                            CASE WHEN t.principal = 1 THEN t.numero ELSE NULL END
                        ) AS telefono_principal,
                        YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) -
                        (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad
                 FROM pacientes p
                 INNER JOIN razas r ON p.id_raza = r.id
                 INNER JOIN especies e ON r.id_especie = e.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 LEFT JOIN telefonos t ON t.id_propietario = pr.id
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [pacienteId]
            );

            res.json({
                success: true,
                msg: 'Datos del paciente actualizados correctamente',
                data: {
                    ...pacienteActualizado[0],
                    edad: pacienteActualizado[0].edad ? `${pacienteActualizado[0].edad} años` : 'No especificada'
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en actualizarPaciente:', error);
        res.status(400).json({
            success: false,
            msg: error.message || 'Error al actualizar el paciente'
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
 * ✅ Eliminar un paciente del sistema
 */
const eliminarPaciente = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const pacienteId = parseInt(id);
        
        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({ 
                success: false,
                msg: 'ID de paciente no válido' 
            });
        }
        
        connection = await conectarDB();
        
        // Verificar permisos y obtener información del paciente
        const [pacientes] = await connection.execute(
            `SELECT p.*, d.id AS doctor_id, u.id AS doctor_usuario_id
             FROM pacientes p
             INNER JOIN doctores d ON p.id_doctor = d.id
             INNER JOIN usuarios u ON d.id_usuario = u.id
             WHERE p.id = ? AND p.estado = 'activo'`,
            [pacienteId]
        );
        
        if (pacientes.length === 0) {
            return res.status(404).json({ 
                success: false,
                msg: 'Paciente no encontrado' 
            });
        }
        
        const paciente = pacientes[0];
        
        // Validar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );
            
            if (doctores.length === 0 || paciente.doctor_id !== doctores[0].id) {
                return res.status(403).json({ 
                    success: false,
                    msg: 'No tienes permiso para eliminar este paciente' 
                });
            }
        } else if (!['admin', 'superadmin'].includes(req.usuario.rol)) {
            return res.status(403).json({ 
                success: false,
                msg: 'No tienes permiso para eliminar pacientes' 
            });
        }
        
        await connection.beginTransaction();
        
        try {
            // Registrar eliminación en audit_logs antes de eliminar
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, 
                    accion, datos_antiguos
                ) VALUES ('pacientes', ?, ?, 'eliminar', ?)`,
                [
                    pacienteId,
                    req.usuario.id,
                    JSON.stringify(paciente)
                ]
            );
            
            // Verificar si hay registros asociados
            const [historias] = await connection.execute(
                'SELECT COUNT(*) AS total FROM historias_clinicas WHERE id_paciente = ?',
                [pacienteId]
            );
            
            const [vacunas] = await connection.execute(
                'SELECT COUNT(*) AS total FROM vacunas WHERE id_paciente = ?',
                [pacienteId]
            );
            
            const [desparasitaciones] = await connection.execute(
                'SELECT COUNT(*) AS total FROM desparasitaciones WHERE id_paciente = ?',
                [pacienteId]
            );
            
            // Si hay registros asociados, hacer borrado lógico
            if (historias[0].total > 0 || vacunas[0].total > 0 || desparasitaciones[0].total > 0) {
                await connection.execute(
                    `UPDATE pacientes 
                     SET estado = 'inactivo', 
                         updated_at = NOW() 
                     WHERE id = ?`,
                    [pacienteId]
                );
                
                await connection.commit();
                return res.json({ 
                    success: true,
                    msg: 'Paciente marcado como inactivo porque tiene historias clínicas o tratamientos asociados',
                    borradoLogico: true
                });
            }
            
            // Si no hay registros asociados, eliminar físicamente
            await connection.execute(
                'DELETE FROM citas WHERE id_paciente = ?',
                [pacienteId]
            );
            
            await connection.execute(
                'DELETE FROM pacientes WHERE id = ?',
                [pacienteId]
            );
            
            await connection.commit();
            
            res.json({ 
                success: true,
                msg: 'Paciente eliminado correctamente' 
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        }
        
    } catch (error) {
        console.error('❌ Error en eliminarPaciente:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error al eliminar el paciente',
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
 * ✅ Obtener razas filtradas por especie
 */
const obtenerRazas = async (req, res) => {
    let connection;
    try {
        const { especie } = req.query; // Parámetro opcional para filtrar por especie

        connection = await conectarDB();

        let query = `
            SELECT r.id, r.nombre, e.id AS id_especie, e.nombre AS especie
            FROM razas r
            INNER JOIN especies e ON r.id_especie = e.id
            WHERE r.activo = TRUE
        `;

        const params = [];

        // Filtrar por especie si se proporciona
        if (especie) {
            query += ` AND LOWER(e.nombre) = LOWER(?)`;
            params.push(especie);
        }

        query += ` ORDER BY e.nombre ASC, r.nombre ASC`;

        const [razas] = await connection.execute(query, params);

        res.json({
            success: true,
            data: razas,
            total: razas.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerRazas:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener las razas',
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
 * ✅ Buscar propietarios por nombre, apellidos, teléfono o email
 */
const buscarPropietarios = async (req, res) => {
    let connection;
    try {
        const { q } = req.query; // Término de búsqueda

        if (!q || q.trim().length < 2) {
            return res.status(400).json({
                success: false,
                msg: 'El término de búsqueda debe tener al menos 2 caracteres'
            });
        }

        connection = await conectarDB();

        // Buscar propietarios por nombre, apellidos, teléfono o email
        const searchTerm = `%${q.trim()}%`;

        const [propietarios] = await connection.execute(
            `SELECT DISTINCT
                p.id,
                p.nombre,
                p.apellidos,
                p.email,
                t.numero AS telefono_principal,
                COUNT(DISTINCT pac.id) AS total_mascotas,
                d.calle,
                d.numero_ext,
                d.numero_int,
                cp.codigo AS codigo_postal,
                cp.colonia,
                cp.id_municipio
            FROM propietarios p
            LEFT JOIN telefonos t ON t.id_propietario = p.id AND t.principal = 1
            LEFT JOIN pacientes pac ON pac.id_propietario = p.id AND pac.estado = 'activo'
            LEFT JOIN direcciones d ON d.id_propietario = p.id AND d.tipo = 'casa'
            LEFT JOIN codigo_postal cp ON d.id_codigo_postal = cp.id
            WHERE (
                p.nombre LIKE ? OR
                p.apellidos LIKE ? OR
                p.email LIKE ? OR
                t.numero LIKE ?
            )
            GROUP BY p.id, p.nombre, p.apellidos, p.email, t.numero,
                     d.calle, d.numero_ext, d.numero_int, cp.codigo, cp.colonia, cp.id_municipio
            ORDER BY p.nombre ASC, p.apellidos ASC
            LIMIT 10`,
            [searchTerm, searchTerm, searchTerm, searchTerm]
        );

        // Formatear resultados
        const resultados = propietarios.map(prop => ({
            id: prop.id,
            nombre_completo: `${prop.nombre} ${prop.apellidos || ''}`.trim(),
            nombre: prop.nombre,
            apellidos: prop.apellidos,
            email: prop.email,
            telefono: prop.telefono_principal,
            total_mascotas: prop.total_mascotas || 0,
            direccion: prop.calle ? {
                calle: prop.calle,
                numero_ext: prop.numero_ext,
                numero_int: prop.numero_int,
                codigo_postal: prop.codigo_postal,
                colonia: prop.colonia,
                id_municipio: prop.id_municipio
            } : null
        }));

        res.json({
            success: true,
            data: resultados,
            total: resultados.length
        });

    } catch (error) {
        console.error('❌ Error en buscarPropietarios:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al buscar propietarios',
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
 * ✅ FLUJO 2: Actualizar datos del propietario
 * ⚠️ AFECTA A TODAS LAS MASCOTAS del propietario
 */
const actualizarPropietario = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const propietarioId = parseInt(id);

        console.log('👤 FLUJO 2: Actualizando datos del propietario ID:', propietarioId);

        if (isNaN(propietarioId) || propietarioId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de propietario no válido'
            });
        }

        connection = await conectarDB();

        // Verificar que el propietario existe y contar mascotas
        const [propietarios] = await connection.execute(
            `SELECT p.id, p.nombre, p.apellidos, COUNT(pac.id) AS total_mascotas
             FROM propietarios p
             LEFT JOIN pacientes pac ON pac.id_propietario = p.id AND pac.estado = 'activo'
             WHERE p.id = ?
             GROUP BY p.id`,
            [propietarioId]
        );

        if (propietarios.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Propietario no encontrado'
            });
        }

        const propietario = propietarios[0];
        console.log(`⚠️ Este propietario tiene ${propietario.total_mascotas} mascota(s)`);

        await connection.beginTransaction();

        try {
            const updates = req.body;
            const fieldsToUpdate = [];
            const values = [];

            // Validar y actualizar nombre
            if (updates.nombre) {
                validarSoloLetras(updates.nombre, 'El nombre del propietario');
                validarLongitud(updates.nombre, 2, 100, 'El nombre del propietario');
                fieldsToUpdate.push('nombre = ?');
                values.push(updates.nombre.trim());
            }

            // Validar y actualizar apellidos
            if (updates.apellidos) {
                validarSoloLetras(updates.apellidos, 'Los apellidos del propietario');
                validarLongitud(updates.apellidos, 2, 150, 'Los apellidos del propietario');
                fieldsToUpdate.push('apellidos = ?');
                values.push(updates.apellidos.trim());
            }

            // Validar y actualizar email
            if (updates.email !== undefined) {
                if (updates.email && updates.email.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(updates.email.trim())) {
                        throw new Error('Email no válido');
                    }
                    fieldsToUpdate.push('email = ?');
                    values.push(updates.email.trim().toLowerCase());
                } else {
                    fieldsToUpdate.push('email = NULL');
                }
            }

            if (fieldsToUpdate.length > 0) {
                fieldsToUpdate.push('updated_at = NOW()');
                values.push(propietarioId);

                const updateQuery = `UPDATE propietarios SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
                await connection.execute(updateQuery, values);
            }

            // Actualizar teléfono si se proporciona
            if (updates.telefono) {
                const telefonoLimpio = updates.telefono.replace(/\D/g, '');
                if (telefonoLimpio.length < 10) {
                    throw new Error('El teléfono debe tener al menos 10 dígitos');
                }

                // Actualizar teléfono principal
                await connection.execute(
                    'UPDATE telefonos SET numero = ? WHERE id_propietario = ? AND principal = 1',
                    [telefonoLimpio, propietarioId]
                );
            }

            // Actualizar dirección si se proporciona
            if (updates.calle || updates.codigo_postal || updates.colonia) {
                await actualizarDireccionPropietario(connection, propietarioId, updates);
            }

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (tabla, id_registro, id_usuario, accion, datos_nuevos)
                 VALUES ('propietarios', ?, ?, 'modificar', ?)`,
                [propietarioId, req.usuario.id, JSON.stringify(updates)]
            );

            await connection.commit();

            // Obtener datos actualizados
            const [propietarioActualizado] = await connection.execute(
                `SELECT p.*,
                        t.numero AS telefono_principal,
                        COUNT(DISTINCT pac.id) AS total_mascotas
                 FROM propietarios p
                 LEFT JOIN telefonos t ON t.id_propietario = p.id AND t.principal = 1
                 LEFT JOIN pacientes pac ON pac.id_propietario = p.id AND pac.estado = 'activo'
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [propietarioId]
            );

            res.json({
                success: true,
                msg: `Propietario actualizado correctamente. ${propietarioActualizado[0].total_mascotas} mascota(s) afectada(s).`,
                data: propietarioActualizado[0]
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en actualizarPropietario:', error);
        res.status(400).json({
            success: false,
            msg: error.message || 'Error al actualizar el propietario'
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
 * ✅ FLUJO 3: Transferir mascota a otro propietario
 * Solo mueve UNA mascota, no afecta a otras
 */
const transferirMascota = async (req, res) => {
    let connection;
    try {
        const { id } = req.params;
        const pacienteId = parseInt(id);

        console.log('🔄 FLUJO 3: Transfiriendo mascota ID:', pacienteId);

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();

        // Obtener información completa del paciente y propietario actual
        const [pacientes] = await connection.execute(
            `SELECT p.id, p.nombre_mascota, p.id_propietario, p.id_doctor, p.foto_url,
                    pr.nombre AS propietario_nombre, pr.apellidos AS propietario_apellidos
             FROM pacientes p
             INNER JOIN propietarios pr ON p.id_propietario = pr.id
             WHERE p.id = ? AND p.estado = 'activo'`,
            [pacienteId]
        );

        if (pacientes.length === 0) {
            return res.status(404).json({
                success: false,
                msg: 'Paciente no encontrado'
            });
        }

        const paciente = pacientes[0];
        console.log(`🐾 Transfiriendo: ${paciente.nombre_mascota}`);
        console.log(`👤 Propietario actual: ${paciente.propietario_nombre} ${paciente.propietario_apellidos}`);

        // Validar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0 || paciente.id_doctor !== doctores[0].id) {
                return res.status(403).json({
                    success: false,
                    msg: 'No tienes permiso para transferir este paciente'
                });
            }
        }

        await connection.beginTransaction();

        try {
            const { id_propietario_nuevo, nuevo_propietario } = req.body;
            let nuevoIdPropietario;

            if (id_propietario_nuevo) {
                // Caso 1: Transferir a propietario existente
                console.log('📋 Transfiriendo a propietario existente ID:', id_propietario_nuevo);

                const [propExistente] = await connection.execute(
                    'SELECT id, nombre, apellidos FROM propietarios WHERE id = ?',
                    [parseInt(id_propietario_nuevo)]
                );

                if (propExistente.length === 0) {
                    throw new Error('El propietario seleccionado no existe');
                }

                nuevoIdPropietario = parseInt(id_propietario_nuevo);
                console.log(`✅ Nuevo propietario: ${propExistente[0].nombre} ${propExistente[0].apellidos}`);

            } else if (nuevo_propietario) {
                // Caso 2: Crear nuevo propietario
                console.log('🆕 Creando nuevo propietario');

                const {
                    nombre_propietario,
                    apellidos_propietario,
                    email,
                    telefono,
                    tipo_telefono = 'celular',
                    calle,
                    numero_ext,
                    numero_int,
                    codigo_postal,
                    colonia,
                    id_municipio = 1,
                    referencias
                } = nuevo_propietario;

                // Validaciones obligatorias
                if (!nombre_propietario?.trim() || !apellidos_propietario?.trim() || !telefono?.trim()) {
                    throw new Error('Nombre, apellidos y teléfono son obligatorios para el nuevo propietario');
                }

                // Validar que la dirección completa sea obligatoria para nuevos clientes
                if (!calle?.trim() || !numero_ext?.trim() || !codigo_postal?.trim() || !colonia?.trim()) {
                    throw new Error('La dirección completa (calle, número exterior, código postal y colonia) es obligatoria para nuevos clientes');
                }

                validarSoloLetras(nombre_propietario, 'El nombre del propietario');
                validarSoloLetras(apellidos_propietario, 'Los apellidos del propietario');

                const telefonoLimpio = telefono.replace(/\D/g, '');
                if (telefonoLimpio.length < 10) {
                    throw new Error('El teléfono debe tener al menos 10 dígitos');
                }

                // Crear propietario
                const [resultProp] = await connection.execute(
                    `INSERT INTO propietarios (nombre, apellidos, email, created_at, updated_at)
                     VALUES (?, ?, ?, NOW(), NOW())`,
                    [
                        nombre_propietario.trim(),
                        apellidos_propietario.trim(),
                        email?.trim().toLowerCase() || null
                    ]
                );

                nuevoIdPropietario = resultProp.insertId;
                console.log(`✅ Nuevo propietario creado con ID: ${nuevoIdPropietario}`);

                // Crear teléfono
                await connection.execute(
                    'INSERT INTO telefonos (id_propietario, tipo, numero, principal) VALUES (?, ?, ?, TRUE)',
                    [nuevoIdPropietario, tipo_telefono, telefonoLimpio]
                );

                // Crear dirección si se proporciona
                if (codigo_postal && colonia) {
                    await crearDireccion(connection, nuevoIdPropietario, {
                        calle, numero_ext, numero_int, codigo_postal,
                        colonia, id_municipio, referencias
                    });
                }

            } else {
                throw new Error('Debe proporcionar un propietario existente o datos para crear uno nuevo');
            }

            // Realizar la transferencia
            await connection.execute(
                'UPDATE pacientes SET id_propietario = ? WHERE id = ?',
                [nuevoIdPropietario, pacienteId]
            );

            console.log(`✅ Transferencia completada: ${paciente.nombre_mascota} ahora pertenece al propietario ID ${nuevoIdPropietario}`);

            // Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (tabla, id_registro, id_usuario, accion, datos_antiguos, datos_nuevos)
                 VALUES ('pacientes', ?, ?, 'modificar', ?, ?)`,
                [
                    pacienteId,
                    req.usuario.id,
                    JSON.stringify({ id_propietario_anterior: paciente.id_propietario, accion_realizada: 'transferencia' }),
                    JSON.stringify({ id_propietario_nuevo: nuevoIdPropietario })
                ]
            );

            await connection.commit();

            // Obtener datos completos del paciente transferido
            const [pacienteTransferido] = await connection.execute(
                `SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                        pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                        pr.email,
                        GROUP_CONCAT(
                            CASE WHEN t.principal = 1 THEN t.numero ELSE NULL END
                        ) AS telefono_principal
                 FROM pacientes p
                 INNER JOIN razas r ON p.id_raza = r.id
                 INNER JOIN especies e ON r.id_especie = e.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 LEFT JOIN telefonos t ON t.id_propietario = pr.id
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [pacienteId]
            );

            res.json({
                success: true,
                msg: `${paciente.nombre_mascota} ha sido transferido exitosamente`,
                data: {
                    paciente: pacienteTransferido[0],
                    propietario_anterior: {
                        id: paciente.id_propietario,
                        nombre: paciente.propietario_nombre,
                        apellidos: paciente.propietario_apellidos
                    },
                    propietario_nuevo: {
                        id: nuevoIdPropietario,
                        nombre: pacienteTransferido[0].nombre_propietario,
                        apellidos: pacienteTransferido[0].apellidos_propietario
                    }
                }
            });

        } catch (error) {
            await connection.rollback();
            throw error;
        }

    } catch (error) {
        console.error('❌ Error en transferirMascota:', error);
        res.status(400).json({
            success: false,
            msg: error.message || 'Error al transferir la mascota'
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
 * ✅ Función auxiliar para actualizar dirección del propietario
 */
const actualizarDireccionPropietario = async (connection, id_propietario, datos) => {
    try {
        const { calle, numero_ext, numero_int, codigo_postal, colonia, id_municipio = 1, referencias } = datos;

        // Validaciones
        if (numero_ext) {
            const numeroExtLimpio = numero_ext.toString().trim().toUpperCase();
            if (numeroExtLimpio.length > 10) {
                throw new Error('El número exterior debe tener máximo 10 caracteres');
            }
            if (!/^[a-zA-Z0-9\/\-]+$/.test(numeroExtLimpio)) {
                throw new Error('El número exterior solo puede contener letras, números, diagonales y guiones');
            }
        }

        // Verificar si ya existe una dirección
        const [direcciones] = await connection.execute(
            'SELECT id FROM direcciones WHERE id_propietario = ? AND tipo = "casa"',
            [id_propietario]
        );

        // Buscar o crear código postal si se proporciona
        let id_codigo_postal = null;
        if (codigo_postal && colonia) {
            const [codigosPostales] = await connection.execute(
                'SELECT id FROM codigo_postal WHERE codigo = ? AND colonia = ? AND id_municipio = ?',
                [codigo_postal.trim(), colonia.trim(), id_municipio]
            );

            if (codigosPostales.length > 0) {
                id_codigo_postal = codigosPostales[0].id;
            } else {
                const [resultCP] = await connection.execute(
                    'INSERT INTO codigo_postal (id_municipio, codigo, colonia, tipo_asentamiento) VALUES (?, ?, ?, "Colonia")',
                    [id_municipio, codigo_postal.trim(), colonia.trim()]
                );
                id_codigo_postal = resultCP.insertId;
            }
        }

        if (direcciones.length > 0) {
            // Actualizar dirección existente
            const fieldsToUpdate = [];
            const values = [];

            if (calle) {
                fieldsToUpdate.push('calle = ?');
                values.push(calle.trim());
            }
            if (numero_ext) {
                fieldsToUpdate.push('numero_ext = ?');
                values.push(numero_ext.trim());
            }
            if (numero_int !== undefined) {
                fieldsToUpdate.push('numero_int = ?');
                values.push(numero_int ? numero_int.trim() : null);
            }
            if (referencias !== undefined) {
                fieldsToUpdate.push('referencias = ?');
                values.push(referencias ? referencias.trim() : null);
            }
            if (id_codigo_postal) {
                fieldsToUpdate.push('id_codigo_postal = ?');
                values.push(id_codigo_postal);
            }

            if (fieldsToUpdate.length > 0) {
                values.push(direcciones[0].id);
                await connection.execute(
                    `UPDATE direcciones SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                    values
                );
            }
        } else if (id_codigo_postal) {
            // Crear nueva dirección
            await connection.execute(
                'INSERT INTO direcciones (id_propietario, tipo, calle, numero_ext, numero_int, id_codigo_postal, referencias) VALUES (?, "casa", ?, ?, ?, ?, ?)',
                [
                    id_propietario,
                    calle?.trim() || '',
                    numero_ext?.trim() || '1',
                    numero_int?.trim() || null,
                    id_codigo_postal,
                    referencias?.trim() || null
                ]
            );
        }

        console.log('✅ Dirección actualizada');
    } catch (error) {
        console.error('❌ Error al actualizar dirección:', error);
        throw error;
    }
};

/**
 * ✅ Obtener pacientes con consulta más reciente
 * Para el Dashboard - Muestra últimos pacientes atendidos
 * Query params:
 * - limit: número de pacientes (default: 5)
 * - days: filtrar últimos X días (default: 90)
 */
const obtenerPacientesRecientes = async (req, res) => {
    let connection;
    try {
        const limit = parseInt(req.query.limit) || 5; // Por defecto 5 pacientes
        const days = parseInt(req.query.days) || 90; // Por defecto últimos 90 días

        connection = await conectarDB();

        // ✅ Verificar rol y obtener pacientes con consulta reciente
        let query;
        let params;

        if (req.usuario.rol === 'doctor') {
            // Obtener ID del doctor
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                return res.status(404).json({
                    success: false,
                    msg: 'No se encontró el doctor asociado al usuario'
                });
            }

            const id_doctor = doctores[0].id;

            // Consulta para pacientes del doctor con última consulta
            query = `
                SELECT
                    p.id,
                    p.nombre_mascota,
                    p.foto_url,
                    p.peso,
                    r.nombre AS nombre_raza,
                    e.nombre AS especie,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario,
                    t.numero AS telefono_principal,
                    MAX(hc.fecha_consulta) AS ultima_consulta,
                    (SELECT motivo_consulta
                     FROM historias_clinicas
                     WHERE id_paciente = p.id
                     ORDER BY fecha_consulta DESC
                     LIMIT 1) AS ultimo_motivo,
                    YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) -
                    (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad,
                    DATEDIFF(CURDATE(), MAX(hc.fecha_consulta)) AS dias_desde_consulta
                FROM pacientes p
                INNER JOIN razas r ON p.id_raza = r.id
                INNER JOIN especies e ON r.id_especie = e.id
                INNER JOIN propietarios pr ON p.id_propietario = pr.id
                LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
                INNER JOIN historias_clinicas hc ON p.id = hc.id_paciente
                WHERE p.id_doctor = ? AND p.estado = 'activo'
                  AND hc.fecha_consulta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY p.id
                ORDER BY ultima_consulta DESC
                LIMIT ?`;
            params = [id_doctor, days, limit];

        } else if (['admin', 'superadmin', 'recepcion'].includes(req.usuario.rol)) {
            // Consulta para admin/superadmin/recepción
            query = `
                SELECT
                    p.id,
                    p.nombre_mascota,
                    p.foto_url,
                    p.peso,
                    r.nombre AS nombre_raza,
                    e.nombre AS especie,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario,
                    t.numero AS telefono_principal,
                    CONCAT(u.nombre, ' ', u.apellidos) AS doctor,
                    MAX(hc.fecha_consulta) AS ultima_consulta,
                    (SELECT motivo_consulta
                     FROM historias_clinicas
                     WHERE id_paciente = p.id
                     ORDER BY fecha_consulta DESC
                     LIMIT 1) AS ultimo_motivo,
                    YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) -
                    (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad,
                    DATEDIFF(CURDATE(), MAX(hc.fecha_consulta)) AS dias_desde_consulta
                FROM pacientes p
                INNER JOIN razas r ON p.id_raza = r.id
                INNER JOIN especies e ON r.id_especie = e.id
                INNER JOIN propietarios pr ON p.id_propietario = pr.id
                INNER JOIN doctores doc ON p.id_doctor = doc.id
                INNER JOIN usuarios u ON doc.id_usuario = u.id
                LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
                INNER JOIN historias_clinicas hc ON p.id = hc.id_paciente
                WHERE u.id_licencia_clinica = ? AND p.estado = 'activo'
                  AND hc.fecha_consulta >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY p.id
                ORDER BY ultima_consulta DESC
                LIMIT ?`;
            params = [req.usuario.id_licencia_clinica, days, limit];
        } else {
            return res.status(403).json({
                success: false,
                msg: 'Rol no autorizado para esta operación'
            });
        }

        const [pacientes] = await connection.execute(query, params);

        // Formatear fechas para mejor presentación
        const pacientesFormateados = pacientes.map(p => ({
            ...p,
            edad: p.edad ? `${p.edad} años` : 'No especificada',
            ultima_consulta: p.ultima_consulta || null
        }));

        res.json({
            success: true,
            data: pacientesFormateados,
            total: pacientesFormateados.length
        });

    } catch (error) {
        console.error('❌ Error en obtenerPacientesRecientes:', error);
        res.status(500).json({
            success: false,
            msg: 'Error al obtener pacientes recientes',
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
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente,
    obtenerRazas,
    buscarPropietarios,
    actualizarPropietario,
    transferirMascota,
    obtenerPacientesRecientes
};// backend/controllers/pacienteController.js - VERSIÓN CORREGIDA
import conectarDB from '../config/db.js';

/**
 * 🔒 FUNCIONES DE SANITIZACIÓN Y VALIDACIÓN ROBUSTAS
 * Protección contra SQL Injection, XSS y caracteres especiales peligrosos
 */

// ✅ Sanitizar texto: letras, espacios, acentos, ñ, apóstrofes y guiones
const sanitizarTexto = (texto) => {
    if (!texto) return null;
    // Permitir letras, espacios, acentos, ñ, apóstrofes y guiones (nombres como O'Connor, María-José)
    return texto.toString().trim().replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s'\-]/g, '');
};

// ✅ Sanitizar número alfanumérico: solo letras y números
const sanitizarAlfanumerico = (valor) => {
    if (!valor) return null;
    return valor.toString().trim().replace(/[^a-zA-Z0-9]/g, '');
};

// ✅ Sanitizar solo números
const sanitizarNumeros = (valor) => {
    if (!valor) return null;
    return valor.toString().replace(/\D/g, '');
};

// ✅ Sanitizar dirección: permitir caracteres seguros para direcciones
const sanitizarDireccion = (texto) => {
    if (!texto) return null;
    // Permitir letras, números, espacios, puntos, comas y guiones
    return texto.toString().trim().replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-]/g, '');
};

// ✅ Validar longitud de cadenas
const validarLongitud = (valor, min, max, nombreCampo) => {
    const longitud = valor?.toString().trim().length || 0;
    if (min && longitud < min) {
        throw new Error(`${nombreCampo} debe tener al menos ${min} caracteres`);
    }
    if (max && longitud > max) {
        throw new Error(`${nombreCampo} debe tener máximo ${max} caracteres`);
    }
    return true;
};

// ✅ Validar que solo contenga letras, espacios, acentos, apóstrofes y guiones
const validarSoloLetras = (valor, nombreCampo) => {
    if (!valor) return true;
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'\-]+$/.test(valor.toString().trim())) {
        throw new Error(`${nombreCampo} solo debe contener letras, espacios, apóstrofes y guiones`);
    }
    return true;
};

/**
 * ✅ Agrega un nuevo paciente y su propietario al sistema
 * CORREGIDO: Mejor manejo de errores y validaciones
 */
const agregarPaciente = async (req, res) => {
    let connection;
    try {
        console.log('📝 Datos recibidos en el backend:', req.body);

        // ✅ 1. Extraer y validar datos con nombres correctos
        const {
            // ID de propietario existente (si se seleccionó uno)
            id_propietario_existente,

            // Datos del propietario
            nombre_propietario,
            apellidos_propietario,
            email,
            telefono,
            tipo_telefono = 'celular',

            // Datos de dirección (opcionales)
            calle,
            numero_ext,
            numero_int,
            codigo_postal,
            colonia,
            id_municipio = 1,
            referencias,

            // Datos del paciente
            nombre_mascota,
            fecha_nacimiento,
            peso,
            id_raza,
            foto_url = null
        } = req.body;

        // ✅ 2. Validaciones mejoradas con mensajes específicos
        const validationErrors = {};

        if (!nombre_propietario?.trim()) {
            validationErrors.nombre_propietario = 'El nombre del propietario es obligatorio';
        }

        if (!apellidos_propietario?.trim()) {
            validationErrors.apellidos_propietario = 'Los apellidos del propietario son obligatorios';
        }

        if (!nombre_mascota?.trim()) {
            validationErrors.nombre_mascota = 'El nombre de la mascota es obligatorio';
        }

        if (!telefono?.trim()) {
            validationErrors.telefono = 'El teléfono es obligatorio';
        }

        if (!peso || parseFloat(peso) <= 0) {
            validationErrors.peso = 'El peso debe ser mayor a 0';
        }

        if (!id_raza) {
            validationErrors.id_raza = 'Debe seleccionar una raza';
        }

        // ✅ Si hay errores de validación, retornar inmediatamente
        if (Object.keys(validationErrors).length > 0) {
            return res.status(400).json({
                success: false,
                msg: 'Errores de validación',
                errors: validationErrors
            });
        }

        // ✅ 3. Validar formato de teléfono - solo números, sin caracteres especiales
        const telefonoLimpio = telefono.toString().replace(/\D/g, '');
        if (telefonoLimpio.length < 10) {
            return res.status(400).json({
                success: false,
                msg: 'El teléfono debe tener al menos 10 dígitos y solo contener números',
                campo: 'telefono'
            });
        }

        // Validar que el teléfono solo contenga números
        if (!/^\d+$/.test(telefonoLimpio)) {
            return res.status(400).json({
                success: false,
                msg: 'El teléfono solo debe contener números, sin caracteres especiales',
                campo: 'telefono'
            });
        }

        // ✅ 4. Validar numero_ext - permitir alfanuméricos, S/N, diagonales, guiones
        if (numero_ext) {
            const numeroExtLimpio = numero_ext.toString().trim().toUpperCase();
            if (numeroExtLimpio.length > 10) {
                return res.status(400).json({
                    success: false,
                    msg: 'El número exterior debe tener máximo 10 caracteres',
                    campo: 'numero_ext'
                });
            }
            // Permitir: letras, números, S/N, diagonales, guiones (común en México)
            if (!/^[a-zA-Z0-9\/\-]+$/.test(numeroExtLimpio)) {
                return res.status(400).json({
                    success: false,
                    msg: 'El número exterior solo puede contener letras, números, diagonales y guiones',
                    campo: 'numero_ext'
                });
            }
        }

        // ✅ 5. Validar email si se proporciona
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email.trim())) {
                return res.status(400).json({
                    success: false,
                    msg: 'El formato del email no es válido',
                    campo: 'email'
                });
            }
        }

        // ✅ 6. Validar nombre_mascota - solo letras, sin caracteres especiales
        validarSoloLetras(nombre_mascota, 'El nombre de la mascota');
        validarLongitud(nombre_mascota, 2, 100, 'El nombre de la mascota');

        // ✅ 7. Validar nombre_propietario - solo letras, sin caracteres especiales
        validarSoloLetras(nombre_propietario, 'El nombre del propietario');
        validarLongitud(nombre_propietario, 2, 100, 'El nombre del propietario');

        // ✅ 8. Validar apellidos_propietario - solo letras, sin caracteres especiales
        validarSoloLetras(apellidos_propietario, 'Los apellidos del propietario');
        validarLongitud(apellidos_propietario, 2, 150, 'Los apellidos del propietario');

        // ✅ 9. Validar numero_int - máximo 3 dígitos, solo números
        if (numero_int) {
            const numeroIntLimpio = sanitizarNumeros(numero_int);
            if (numeroIntLimpio.length > 3) {
                return res.status(400).json({
                    success: false,
                    msg: 'El número interior debe tener máximo 3 dígitos',
                    campo: 'numero_int'
                });
            }
            if (!/^\d+$/.test(numeroIntLimpio)) {
                return res.status(400).json({
                    success: false,
                    msg: 'El número interior solo debe contener números',
                    campo: 'numero_int'
                });
            }
        }

        // ✅ 10. Validar codigo_postal - exactamente 5 dígitos
        if (codigo_postal) {
            const codigoPostalLimpio = sanitizarNumeros(codigo_postal);
            if (codigoPostalLimpio.length !== 5) {
                return res.status(400).json({
                    success: false,
                    msg: 'El código postal debe tener exactamente 5 dígitos',
                    campo: 'codigo_postal'
                });
            }
            if (!/^\d{5}$/.test(codigoPostalLimpio)) {
                return res.status(400).json({
                    success: false,
                    msg: 'El código postal solo debe contener números',
                    campo: 'codigo_postal'
                });
            }
        }

        // ✅ 11. Validar calle - sin caracteres especiales peligrosos
        if (calle) {
            validarLongitud(calle, 3, 200, 'La calle');
        }

        // ✅ 12. Validar colonia - permitir más caracteres comunes en direcciones
        if (colonia) {
            validarLongitud(colonia, 3, 150, 'La colonia');
            // Permitir letras, números, espacios, puntos, comas, guiones, apóstrofes, paréntesis, diagonales
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-'()\/º°#]+$/.test(colonia.trim())) {
                return res.status(400).json({
                    success: false,
                    msg: 'La colonia contiene caracteres no permitidos',
                    campo: 'colonia'
                });
            }
        }

        // ✅ 13. Validar referencias - permitir más caracteres para descripciones detalladas
        if (referencias) {
            validarLongitud(referencias, 0, 200, 'Las referencias');
            // Permitir caracteres útiles para referencias: paréntesis, diagonales, comillas, etc.
            if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-'()\/:"#]+$/.test(referencias.trim())) {
                return res.status(400).json({
                    success: false,
                    msg: 'Las referencias contienen caracteres no permitidos',
                    campo: 'referencias'
                });
            }
        }

        // ✅ 14. Establecer conexión y iniciar transacción
        connection = await conectarDB();
        await connection.beginTransaction();

        try {
            // ✅ 6. Verificar que el doctor existe y está activo
            const [doctores] = await connection.execute(
                `SELECT d.id FROM doctores d
                 INNER JOIN usuarios u ON u.id = d.id_usuario
                 WHERE d.id_usuario = ? AND d.estado = 'activo'
                 AND u.account_status = 'active'`,
                [req.usuario.id]
            );

            if (doctores.length === 0) {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    msg: 'Doctor no autorizado o inactivo'
                });
            }

            const id_doctor = doctores[0].id;

            // ✅ 7. Verificar que la raza existe
            const [razas] = await connection.execute(
                'SELECT id, nombre, id_especie FROM razas WHERE id = ? AND activo = TRUE',
                [id_raza]
            );

            if (razas.length === 0) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    msg: 'La raza seleccionada no es válida',
                    campo: 'id_raza'
                });
            }

            // ✅ 8. Usar propietario existente o buscar/crear uno nuevo
            let id_propietario;

            // Si se proporcionó un ID de propietario existente, usarlo directamente
            if (id_propietario_existente) {
                const [propExistente] = await connection.execute(
                    'SELECT id FROM propietarios WHERE id = ?',
                    [parseInt(id_propietario_existente)]
                );

                if (propExistente.length === 0) {
                    await connection.rollback();
                    return res.status(400).json({
                        success: false,
                        msg: 'El propietario seleccionado no existe'
                    });
                }

                id_propietario = parseInt(id_propietario_existente);
                console.log('✅ Usando propietario seleccionado con ID:', id_propietario);
            } else {
                // Buscar propietario por teléfono
                const [propietarios] = await connection.execute(
                    `SELECT p.id, p.nombre, p.apellidos, p.email
                     FROM propietarios p
                     INNER JOIN telefonos t ON t.id_propietario = p.id
                     WHERE t.numero = ?`,
                    [telefonoLimpio]
                );

                if (propietarios.length === 0) {
                // ✅ Crear nuevo propietario
                const [resultPropietario] = await connection.execute(
                    `INSERT INTO propietarios (nombre, apellidos, email, created_at, updated_at)
                     VALUES (?, ?, ?, NOW(), NOW())`,
                    [
                        nombre_propietario.trim(),
                        apellidos_propietario?.trim() || '',
                        email?.trim().toLowerCase() || null
                    ]
                );
                id_propietario = resultPropietario.insertId;

                console.log('✅ Nuevo propietario creado con ID:', id_propietario);

                // ✅ Insertar teléfono principal
                await connection.execute(
                    `INSERT INTO telefonos (id_propietario, tipo, numero, principal)
                     VALUES (?, ?, ?, TRUE)`,
                    [id_propietario, tipo_telefono, telefonoLimpio]
                );

                // ✅ Insertar dirección si se proporciona
                if (codigo_postal && colonia) {
                    await crearDireccion(connection, id_propietario, {
                        calle, numero_ext, numero_int, codigo_postal, 
                        colonia, id_municipio, referencias
                    });
                }
            } else {
                // ✅ Usar propietario existente
                const propietarioExistente = propietarios[0];
                id_propietario = propietarioExistente.id;
                
                console.log('✅ Usando propietario existente con ID:', id_propietario);
                
                // ✅ Opcional: Actualizar datos del propietario si son diferentes
                const needsUpdate = 
                    propietarioExistente.nombre.toLowerCase() !== nombre_propietario.trim().toLowerCase() ||
                    (propietarioExistente.apellidos || '').toLowerCase() !== (apellidos_propietario?.trim() || '').toLowerCase() ||
                    (propietarioExistente.email || '').toLowerCase() !== (email?.trim().toLowerCase() || '');

                if (needsUpdate) {
                    await connection.execute(
                        `UPDATE propietarios 
                         SET nombre = ?, apellidos = ?, email = ?, updated_at = NOW()
                         WHERE id = ?`,
                        [
                            nombre_propietario.trim(),
                            apellidos_propietario?.trim() || '',
                            email?.trim().toLowerCase() || null,
                            id_propietario
                        ]
                    );
                    console.log('✅ Datos del propietario actualizados');
                }
            }
        }

            // ✅ 9. Insertar paciente
            const [resultPaciente] = await connection.execute(
                `INSERT INTO pacientes (
                    id_propietario, id_doctor, id_usuario, id_raza, 
                    nombre_mascota, fecha_nacimiento, peso, foto_url, estado,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'activo', NOW(), NOW())`,
                [
                    id_propietario,
                    id_doctor,
                    req.usuario.id,
                    parseInt(id_raza),
                    nombre_mascota.trim(),
                    fecha_nacimiento || null,
                    parseFloat(peso),
                    foto_url
                ]
            );

            const id_paciente = resultPaciente.insertId;
            console.log('✅ Paciente creado con ID:', id_paciente);

            // ✅ 10. Registrar en audit_logs
            await connection.execute(
                `INSERT INTO audit_logs (
                    tabla, id_registro, id_usuario, accion, datos_nuevos, created_at
                ) VALUES ('pacientes', ?, ?, 'crear', ?, NOW())`,
                [
                    id_paciente,
                    req.usuario.id,
                    JSON.stringify({
                        paciente_id: id_paciente,
                        nombre_mascota: nombre_mascota.trim(),
                        propietario: `${nombre_propietario} ${apellidos_propietario || ''}`.trim(),
                        telefono: telefonoLimpio,
                        peso: parseFloat(peso),
                        raza_id: parseInt(id_raza)
                    })
                ]
            );

            // ✅ 11. Confirmar transacción
            await connection.commit();

            // ✅ 12. Obtener datos completos del paciente recién creado
            const [pacienteCompleto] = await connection.execute(
                `SELECT 
                    p.id,
                    p.nombre_mascota,
                    p.fecha_nacimiento,
                    p.peso,
                    p.foto_url,
                    p.estado,
                    p.created_at,
                    r.nombre AS nombre_raza,
                    e.nombre AS especie,
                    pr.nombre AS nombre_propietario,
                    pr.apellidos AS apellidos_propietario,
                    pr.email,
                    t.numero AS telefono_principal,
                    YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) - 
                    (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad
                FROM pacientes p
                LEFT JOIN razas r ON p.id_raza = r.id
                LEFT JOIN especies e ON r.id_especie = e.id
                LEFT JOIN propietarios pr ON p.id_propietario = pr.id
                LEFT JOIN telefonos t ON t.id_propietario = pr.id AND t.principal = 1
                WHERE p.id = ?`,
                [id_paciente]
            );

            // ✅ 13. Respuesta exitosa con datos completos
            const pacienteData = pacienteCompleto[0];
            
            res.status(201).json({
                success: true,
                msg: 'Paciente registrado correctamente',
                data: {
                    ...pacienteData,
                    ultima_visita: pacienteData.created_at.toISOString().split('T')[0]
                }
            });

        } catch (transactionError) {
            // ✅ Rollback en caso de error en la transacción
            await connection.rollback();
            console.error('❌ Error en transacción:', transactionError);
            throw transactionError;
        }

    } catch (error) {
        console.error('❌ Error en agregarPaciente:', error);
        
        // ✅ Respuesta de error más informativa
        let statusCode = 500;
        let mensaje = 'Error interno del servidor';
        
        if (error.code === 'ER_DUP_ENTRY') {
            statusCode = 400;
            mensaje = 'Ya existe un registro con esos datos';
        } else if (error.code === 'ER_DATA_TOO_LONG') {
            statusCode = 400;
            mensaje = 'Algunos datos son demasiado largos';
        } else if (error.message?.includes('obligatorio')) {
            statusCode = 400;
            mensaje = error.message;
        }
        
        res.status(statusCode).json({ 
            success: false,
            msg: mensaje,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
        
    } finally {
        // ✅ Asegurar cierre de conexión
        if (connection) {
            try {
                await connection.end();
            } catch (closeError) {
                console.error('❌ Error al cerrar conexión:', closeError);
            }
        }
    }
};

/**
 * ✅ Función auxiliar para crear dirección
 */
const crearDireccion = async (connection, id_propietario, direccionData) => {
    const { calle, numero_ext, numero_int, codigo_postal, colonia, id_municipio, referencias } = direccionData;
    
    try {
        // Buscar o crear código postal
        let id_codigo_postal;
        
        const [codigosPostales] = await connection.execute(
            `SELECT id FROM codigo_postal 
             WHERE codigo = ? AND colonia = ? AND id_municipio = ?`,
            [codigo_postal, colonia.trim(), id_municipio || 1]
        );

        if (codigosPostales.length === 0) {
            // Crear nuevo código postal
            const [resultCodigoPostal] = await connection.execute(
                `INSERT INTO codigo_postal (id_municipio, codigo, colonia, tipo_asentamiento)
                 VALUES (?, ?, ?, 'Colonia')`,
                [id_municipio || 1, codigo_postal, colonia.trim()]
            );
            id_codigo_postal = resultCodigoPostal.insertId;
        } else {
            id_codigo_postal = codigosPostales[0].id;
        }

        // Insertar dirección
        await connection.execute(
            `INSERT INTO direcciones (id_propietario, tipo, calle, numero_ext, numero_int, id_codigo_postal, referencias)
             VALUES (?, 'casa', ?, ?, ?, ?, ?)`,
            [
                id_propietario,
                calle?.trim() || '',
                numero_ext?.trim() || '1',
                numero_int?.trim() || null,
                id_codigo_postal,
                referencias?.trim() || null
            ]
        );
        
        console.log('✅ Dirección creada exitosamente');
    } catch (error) {
        console.error('❌ Error al crear dirección:', error);
        // No lanzar error para que no falle todo el proceso
    }
};

/**
 * ✅ Obtener pacientes con manejo mejorado de errores
 */
const obtenerPacientes = async (req, res) => {
    let connection;
    try {
        connection = await conectarDB();
        
        // ✅ Verificar rol y obtener pacientes correspondientes
        let query;
        let params;
        
        if (req.usuario.rol === 'doctor') {
            // Obtener ID del doctor
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );
            
            if (doctores.length === 0) {
                return res.status(404).json({ 
                    success: false,
                    msg: 'No se encontró el doctor asociado al usuario' 
                });
            }
            
            const id_doctor = doctores[0].id;
            
            // Consulta para pacientes del doctor
            query = `
                SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                       pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                       pr.email,
                       GROUP_CONCAT(
                           CASE WHEN t.principal = 1 THEN t.numero ELSE NULL END
                       ) AS telefono_principal,
                       MAX(d.calle) AS calle, MAX(d.numero_ext) AS numero_ext,
                       MAX(d.numero_int) AS numero_int, MAX(d.referencias) AS referencias,
                       MAX(cp.codigo) AS codigo_postal, MAX(cp.colonia) AS colonia,
                       MAX(m.nombre) AS municipio, MAX(est.nombre) AS estado, MAX(pa.nombre) AS pais,
                       YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) -
                       (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad,
                       p.updated_at AS ultima_visita
                FROM pacientes p
                INNER JOIN razas r ON p.id_raza = r.id
                INNER JOIN especies e ON r.id_especie = e.id
                INNER JOIN propietarios pr ON p.id_propietario = pr.id
                LEFT JOIN telefonos t ON t.id_propietario = pr.id
                LEFT JOIN direcciones d ON d.id_propietario = pr.id AND d.tipo = 'casa'
                LEFT JOIN codigo_postal cp ON d.id_codigo_postal = cp.id
                LEFT JOIN municipios m ON cp.id_municipio = m.id
                LEFT JOIN estados est ON m.id_estado = est.id
                LEFT JOIN paises pa ON est.id_pais = pa.id
                WHERE p.id_doctor = ? AND p.estado = 'activo'
                GROUP BY p.id
                ORDER BY p.nombre_mascota ASC`;
            params = [id_doctor];
            
        } else if (['admin', 'superadmin', 'recepcion'].includes(req.usuario.rol)) {
            // Consulta para admin/superadmin/recepción
            query = `
                SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                       pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                       pr.email,
                       CONCAT(u.nombre, ' ', u.apellidos) AS doctor,
                       GROUP_CONCAT(
                           CASE WHEN t.principal = 1 THEN t.numero ELSE NULL END
                       ) AS telefono_principal,
                       MAX(d.calle) AS calle, MAX(d.numero_ext) AS numero_ext,
                       MAX(d.numero_int) AS numero_int, MAX(d.referencias) AS referencias,
                       MAX(cp.codigo) AS codigo_postal, MAX(cp.colonia) AS colonia,
                       MAX(m.nombre) AS municipio, MAX(est.nombre) AS estado, MAX(pa.nombre) AS pais,
                       YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) -
                       (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad,
                       p.updated_at AS ultima_visita
                FROM pacientes p
                INNER JOIN razas r ON p.id_raza = r.id
                INNER JOIN especies e ON r.id_especie = e.id
                INNER JOIN propietarios pr ON p.id_propietario = pr.id
                INNER JOIN doctores doc ON p.id_doctor = doc.id
                INNER JOIN usuarios u ON doc.id_usuario = u.id
                LEFT JOIN telefonos t ON t.id_propietario = pr.id
                LEFT JOIN direcciones d ON d.id_propietario = pr.id AND d.tipo = 'casa'
                LEFT JOIN codigo_postal cp ON d.id_codigo_postal = cp.id
                LEFT JOIN municipios m ON cp.id_municipio = m.id
                LEFT JOIN estados est ON m.id_estado = est.id
                LEFT JOIN paises pa ON est.id_pais = pa.id
                WHERE u.id_licencia_clinica = ? AND p.estado = 'activo'
                GROUP BY p.id
                ORDER BY p.nombre_mascota ASC`;
            params = [req.usuario.id_licencia_clinica];
        } else {
            return res.status(403).json({ 
                success: false,
                msg: 'Rol no autorizado para esta operación' 
            });
        }
        
        const [pacientes] = await connection.execute(query, params);
        
        // ✅ Procesar y estructurar datos
        const pacientesProcesados = pacientes.map(paciente => ({
            ...paciente,
            edad: paciente.edad ? `${paciente.edad} años` : 'No especificada',
            direccion: paciente.calle ? {
                calle: paciente.calle,
                numero_ext: paciente.numero_ext,
                numero_int: paciente.numero_int,
                referencias: paciente.referencias,
                codigo_postal: paciente.codigo_postal,
                colonia: paciente.colonia,
                municipio: paciente.municipio,
                estado: paciente.estado,
                pais: paciente.pais
            } : null,
            // Limpiar campos de dirección del objeto principal
            calle: undefined,
            numero_ext: undefined,
            numero_int: undefined,
            referencias: undefined,
            codigo_postal: undefined,
            colonia: undefined,
            municipio: undefined,
            estado: undefined,
            pais: undefined
        }));
        
        res.json({
            success: true,
            data: pacientesProcesados,
            total: pacientesProcesados.length
        });
        
    } catch (error) {
        console.error('❌ Error en obtenerPacientes:', error);
        res.status(500).json({ 
            success: false,
            msg: 'Error al obtener los pacientes',
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