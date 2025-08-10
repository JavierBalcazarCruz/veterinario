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
 * ✅ Actualizar información de un paciente existente
 */
const actualizarPaciente = async (req, res) => {
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
        
        // Verificar que el paciente existe
        const [pacientes] = await connection.execute(
            `SELECT p.*, d.id AS doctor_id, pr.id AS propietario_id
             FROM pacientes p
             INNER JOIN doctores d ON p.id_doctor = d.id
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
        
        const pacienteActual = pacientes[0];
        
        // Validar permisos
        if (req.usuario.rol === 'doctor') {
            const [doctores] = await connection.execute(
                `SELECT id FROM doctores WHERE id_usuario = ?`,
                [req.usuario.id]
            );
            
            if (doctores.length === 0 || pacienteActual.doctor_id !== doctores[0].id) {
                return res.status(403).json({ 
                    success: false,
                    msg: 'No tienes permiso para modificar este paciente' 
                });
            }
        }
        
        await connection.beginTransaction();
        
        try {
            const updates = req.body;
            
            // Actualizar datos del paciente si se proporcionaron
            if (updates.nombre_mascota || updates.fecha_nacimiento || updates.peso || updates.id_raza || updates.foto_url !== undefined) {
                const fieldsToUpdate = [];
                const values = [];
                
                if (updates.nombre_mascota) {
                    fieldsToUpdate.push('nombre_mascota = ?');
                    values.push(updates.nombre_mascota.trim());
                }
                
                if (updates.fecha_nacimiento) {
                    fieldsToUpdate.push('fecha_nacimiento = ?');
                    values.push(updates.fecha_nacimiento);
                }
                
                if (updates.peso) {
                    const peso = parseFloat(updates.peso);
                    if (peso <= 0) {
                        throw new Error('El peso debe ser mayor a 0');
                    }
                    fieldsToUpdate.push('peso = ?');
                    values.push(peso);
                }
                
                if (updates.id_raza) {
                    // Verificar que la raza existe
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
                
                if (updates.foto_url !== undefined) {
                    fieldsToUpdate.push('foto_url = ?');
                    values.push(updates.foto_url);
                }
                
                if (fieldsToUpdate.length > 0) {
                    fieldsToUpdate.push('updated_at = NOW()');
                    values.push(pacienteId);
                    
                    await connection.execute(
                        `UPDATE pacientes SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                        values
                    );
                }
            }
            
            // Actualizar datos del propietario si se proporcionaron
            if (updates.nombre_propietario || updates.apellidos_propietario || updates.email !== undefined) {
                const fieldsToUpdate = [];
                const values = [];
                
                if (updates.nombre_propietario) {
                    fieldsToUpdate.push('nombre = ?');
                    values.push(updates.nombre_propietario.trim());
                }
                
                if (updates.apellidos_propietario) {
                    fieldsToUpdate.push('apellidos = ?');
                    values.push(updates.apellidos_propietario.trim());
                }
                
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
                    values.push(pacienteActual.propietario_id);
                    
                    await connection.execute(
                        `UPDATE propietarios SET ${fieldsToUpdate.join(', ')} WHERE id = ?`,
                        values
                    );
                }
            }
            
            // Registrar actualización en audit_logs
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
                        YEAR(CURDATE()) - YEAR(p.fecha_nacimiento) - 
                        (DATE_FORMAT(CURDATE(), '%m%d') < DATE_FORMAT(p.fecha_nacimiento, '%m%d')) AS edad
                 FROM pacientes p
                 INNER JOIN razas r ON p.id_raza = r.id
                 INNER JOIN especies e ON r.id_especie = e.id
                 INNER JOIN propietarios pr ON p.id_propietario = pr.id
                 WHERE p.id = ?`,
                [pacienteId]
            );
            
            res.json({
                success: true,
                msg: 'Paciente actualizado correctamente',
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

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente
};// backend/controllers/pacienteController.js - VERSIÓN CORREGIDA
import conectarDB from '../config/db.js';

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

        // ✅ 3. Validar formato de teléfono
        const telefonoLimpio = telefono.toString().replace(/\D/g, '');
        if (telefonoLimpio.length < 10) {
            return res.status(400).json({
                success: false,
                msg: 'El teléfono debe tener al menos 10 dígitos',
                campo: 'telefono'
            });
        }

        // ✅ 4. Validar email si se proporciona
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

        // ✅ 5. Establecer conexión y iniciar transacción
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

            // ✅ 8. Buscar o crear propietario por teléfono
            let id_propietario;

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
                       d.calle, d.numero_ext, d.numero_int, d.referencias,
                       cp.codigo AS codigo_postal, cp.colonia,
                       m.nombre AS municipio, est.nombre AS estado, pa.nombre AS pais,
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
                       d.calle, d.numero_ext, d.numero_int, d.referencias,
                       cp.codigo AS codigo_postal, cp.colonia,
                       m.nombre AS municipio, est.nombre AS estado, pa.nombre AS pais,
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