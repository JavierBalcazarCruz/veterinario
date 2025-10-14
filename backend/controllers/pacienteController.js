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

        console.log('🔄 Actualizando paciente ID:', pacienteId);
        console.log('📦 Datos recibidos del frontend:', JSON.stringify(req.body, null, 2));

        if (isNaN(pacienteId) || pacienteId <= 0) {
            return res.status(400).json({
                success: false,
                msg: 'ID de paciente no válido'
            });
        }

        connection = await conectarDB();

        // Verificar que el paciente existe (incluir id_usuario para preservarlo)
        const [pacientes] = await connection.execute(
            `SELECT p.id, p.nombre_mascota, p.id_propietario, p.id_doctor, p.id_usuario,
                    p.fecha_nacimiento, p.peso, p.id_raza, p.foto_url, p.estado,
                    d.id AS doctor_id, pr.id AS propietario_id
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
        console.log('📋 Paciente actual en BD:', {
            id: pacienteActual.id,
            nombre: pacienteActual.nombre_mascota,
            propietario_id: pacienteActual.propietario_id,
            id_usuario: pacienteActual.id_usuario
        });

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
            console.log('✍️ Procesando actualizaciones...');

            // ✅ Validaciones robustas de datos ANTES de actualizar
            // Validar nombre_mascota
            if (updates.nombre_mascota) {
                validarSoloLetras(updates.nombre_mascota, 'El nombre de la mascota');
                validarLongitud(updates.nombre_mascota, 2, 100, 'El nombre de la mascota');
            }

            // Validar nombre_propietario
            if (updates.nombre_propietario) {
                validarSoloLetras(updates.nombre_propietario, 'El nombre del propietario');
                validarLongitud(updates.nombre_propietario, 2, 100, 'El nombre del propietario');
            }

            // Validar apellidos_propietario
            if (updates.apellidos_propietario) {
                validarSoloLetras(updates.apellidos_propietario, 'Los apellidos del propietario');
                validarLongitud(updates.apellidos_propietario, 2, 150, 'Los apellidos del propietario');
            }

            // Validar numero_int
            if (updates.numero_int) {
                const numeroIntLimpio = sanitizarNumeros(updates.numero_int);
                if (numeroIntLimpio.length > 3) {
                    throw new Error('El número interior debe tener máximo 3 dígitos');
                }
                if (!/^\d+$/.test(numeroIntLimpio)) {
                    throw new Error('El número interior solo debe contener números');
                }
            }

            // Validar codigo_postal
            if (updates.codigo_postal) {
                const codigoPostalLimpio = sanitizarNumeros(updates.codigo_postal);
                if (codigoPostalLimpio.length !== 5) {
                    throw new Error('El código postal debe tener exactamente 5 dígitos');
                }
                if (!/^\d{5}$/.test(codigoPostalLimpio)) {
                    throw new Error('El código postal solo debe contener números');
                }
            }

            // Validar calle
            if (updates.calle) {
                validarLongitud(updates.calle, 3, 200, 'La calle');
            }

            // Validar colonia
            if (updates.colonia) {
                validarLongitud(updates.colonia, 3, 150, 'La colonia');
                if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-'()\/º°#]+$/.test(updates.colonia.trim())) {
                    throw new Error('La colonia contiene caracteres no permitidos');
                }
            }

            // Validar referencias
            if (updates.referencias) {
                validarLongitud(updates.referencias, 0, 200, 'Las referencias');
                if (!/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,\-'()\/:"#]+$/.test(updates.referencias.trim())) {
                    throw new Error('Las referencias contienen caracteres no permitidos');
                }
            }

            // Actualizar datos del paciente si se proporcionaron
            if (updates.nombre_mascota || updates.fecha_nacimiento || updates.peso || updates.id_raza || updates.foto_url !== undefined) {
                const fieldsToUpdate = [];
                const values = [];

                if (updates.nombre_mascota) {
                    fieldsToUpdate.push('nombre_mascota = ?');
                    values.push(updates.nombre_mascota.trim());
                    console.log('✅ Actualizando nombre_mascota:', updates.nombre_mascota);
                }

                if (updates.fecha_nacimiento) {
                    fieldsToUpdate.push('fecha_nacimiento = ?');
                    values.push(updates.fecha_nacimiento);
                    console.log('✅ Actualizando fecha_nacimiento:', updates.fecha_nacimiento);
                }

                if (updates.peso) {
                    const peso = parseFloat(updates.peso);
                    if (peso <= 0) {
                        throw new Error('El peso debe ser mayor a 0');
                    }
                    fieldsToUpdate.push('peso = ?');
                    values.push(peso);
                    console.log('✅ Actualizando peso:', peso);
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
                    console.log('✅ Actualizando id_raza:', updates.id_raza);
                }

                if (updates.foto_url !== undefined) {
                    fieldsToUpdate.push('foto_url = ?');
                    values.push(updates.foto_url);
                    console.log('✅ Actualizando foto_url:', updates.foto_url);
                }

                if (fieldsToUpdate.length > 0) {
                    // ✅ NO actualizar updated_at ni id_usuario manualmente
                    // updated_at se actualiza automáticamente con ON UPDATE CURRENT_TIMESTAMP
                    // id_usuario no debe cambiar una vez creado el paciente

                    values.push(pacienteId);

                    const updateQuery = `UPDATE pacientes SET ${fieldsToUpdate.join(', ')} WHERE id = ?`;
                    console.log('🔧 Query de actualización de paciente:', updateQuery);
                    console.log('🔧 Valores:', values);

                    await connection.execute(updateQuery, values);
                    console.log('✅ Paciente actualizado en BD');
                }
            }
            
            // ✅ SIEMPRE actualizar datos del propietario (enviar todos los campos)
            console.log('🔄 Actualizando datos del propietario...');
            const fieldsToUpdateProp = [];
            const valuesProp = [];

            // Nombre del propietario
            fieldsToUpdateProp.push('nombre = ?');
            valuesProp.push(updates.nombre_propietario ? updates.nombre_propietario.trim() : pacienteActual.nombre_propietario);
            console.log('✅ Actualizando nombre propietario:', updates.nombre_propietario || 'sin cambios');

            // Apellidos del propietario
            fieldsToUpdateProp.push('apellidos = ?');
            valuesProp.push(updates.apellidos_propietario ? updates.apellidos_propietario.trim() : pacienteActual.apellidos_propietario || '');
            console.log('✅ Actualizando apellidos propietario:', updates.apellidos_propietario || 'sin cambios');

            // Email
            if (updates.email !== undefined) {
                if (updates.email && updates.email.trim()) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(updates.email.trim())) {
                        throw new Error('Email no válido');
                    }
                    fieldsToUpdateProp.push('email = ?');
                    valuesProp.push(updates.email.trim().toLowerCase());
                    console.log('✅ Actualizando email:', updates.email);
                } else {
                    fieldsToUpdateProp.push('email = NULL');
                    console.log('✅ Limpiando email');
                }
            }

            fieldsToUpdateProp.push('updated_at = NOW()');
            valuesProp.push(pacienteActual.propietario_id);

            const updateQueryProp = `UPDATE propietarios SET ${fieldsToUpdateProp.join(', ')} WHERE id = ?`;
            console.log('🔧 Query de actualización de propietario:', updateQueryProp);
            console.log('🔧 Valores:', valuesProp);

            await connection.execute(updateQueryProp, valuesProp);
            console.log('✅ Propietario actualizado en BD');

            // ✅ SIEMPRE actualizar teléfono principal
            console.log('📞 Actualizando teléfono del propietario...');
            if (updates.telefono) {
                const telefonoLimpio = updates.telefono.replace(/\D/g, '');
                if (telefonoLimpio.length < 10) {
                    throw new Error('El teléfono debe tener al menos 10 dígitos');
                }
                // Validar que el teléfono solo contenga números
                if (!/^\d+$/.test(telefonoLimpio)) {
                    throw new Error('El teléfono solo debe contener números, sin caracteres especiales');
                }

                // Verificar si ya existe un teléfono principal
                const [telefonos] = await connection.execute(
                    'SELECT id FROM telefonos WHERE id_propietario = ? AND principal = 1',
                    [pacienteActual.propietario_id]
                );

                if (telefonos.length > 0) {
                    // Actualizar teléfono existente
                    console.log('✅ Actualizando teléfono existente:', telefonoLimpio);
                    await connection.execute(
                        'UPDATE telefonos SET numero = ?, tipo = ? WHERE id_propietario = ? AND principal = 1',
                        [telefonoLimpio, updates.tipo_telefono || 'celular', pacienteActual.propietario_id]
                    );
                } else {
                    // Insertar nuevo teléfono principal
                    console.log('✅ Insertando nuevo teléfono:', telefonoLimpio);
                    await connection.execute(
                        'INSERT INTO telefonos (id_propietario, tipo, numero, principal) VALUES (?, ?, ?, TRUE)',
                        [pacienteActual.propietario_id, updates.tipo_telefono || 'celular', telefonoLimpio]
                    );
                }
                console.log('✅ Teléfono actualizado en BD');
            } else {
                console.log('⚠️ No se proporcionó teléfono para actualizar');
            }

            // ✅ Validar numero_ext antes de actualizar dirección
            if (updates.numero_ext) {
                const numeroExtLimpio = updates.numero_ext.toString().trim().toUpperCase();
                if (numeroExtLimpio.length > 10) {
                    throw new Error('El número exterior debe tener máximo 10 caracteres');
                }
                // Permitir: letras, números, S/N, diagonales, guiones
                if (!/^[a-zA-Z0-9\/\-]+$/.test(numeroExtLimpio)) {
                    throw new Error('El número exterior solo puede contener letras, números, diagonales y guiones');
                }
            }

            // ✅ Actualizar dirección del propietario si se proporcionó
            if (updates.calle || updates.numero_ext || updates.codigo_postal || updates.colonia) {
                // Verificar si ya existe una dirección de tipo 'casa'
                const [direcciones] = await connection.execute(
                    'SELECT id, id_codigo_postal FROM direcciones WHERE id_propietario = ? AND tipo = "casa"',
                    [pacienteActual.propietario_id]
                );

                // Buscar o crear código postal si se proporcionó
                let id_codigo_postal = null;
                if (updates.codigo_postal && updates.colonia) {
                    const [codigosPostales] = await connection.execute(
                        'SELECT id FROM codigo_postal WHERE codigo = ? AND colonia = ? AND id_municipio = ?',
                        [updates.codigo_postal.trim(), updates.colonia.trim(), updates.id_municipio || 1]
                    );

                    if (codigosPostales.length > 0) {
                        id_codigo_postal = codigosPostales[0].id;
                    } else {
                        // Crear nuevo código postal
                        const [resultCP] = await connection.execute(
                            'INSERT INTO codigo_postal (id_municipio, codigo, colonia, tipo_asentamiento) VALUES (?, ?, ?, "Colonia")',
                            [updates.id_municipio || 1, updates.codigo_postal.trim(), updates.colonia.trim()]
                        );
                        id_codigo_postal = resultCP.insertId;
                    }
                }

                if (direcciones.length > 0) {
                    // Actualizar dirección existente
                    const fieldsToUpdate = [];
                    const values = [];

                    if (updates.calle) {
                        fieldsToUpdate.push('calle = ?');
                        values.push(updates.calle.trim());
                    }

                    if (updates.numero_ext) {
                        fieldsToUpdate.push('numero_ext = ?');
                        values.push(updates.numero_ext.trim());
                    }

                    if (updates.numero_int !== undefined) {
                        fieldsToUpdate.push('numero_int = ?');
                        values.push(updates.numero_int ? updates.numero_int.trim() : null);
                    }

                    if (updates.referencias !== undefined) {
                        fieldsToUpdate.push('referencias = ?');
                        values.push(updates.referencias ? updates.referencias.trim() : null);
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
                    // Insertar nueva dirección
                    await connection.execute(
                        'INSERT INTO direcciones (id_propietario, tipo, calle, numero_ext, numero_int, id_codigo_postal, referencias) VALUES (?, "casa", ?, ?, ?, ?, ?)',
                        [
                            pacienteActual.propietario_id,
                            updates.calle?.trim() || '',
                            updates.numero_ext?.trim() || '1',
                            updates.numero_int?.trim() || null,
                            id_codigo_postal,
                            updates.referencias?.trim() || null
                        ]
                    );
                }
            }

            // Registrar actualización en audit_logs
            console.log('📝 Registrando en audit_logs...');
            await connection.execute(
                `INSERT INTO audit_logs (tabla, id_registro, id_usuario, accion, datos_nuevos)
                 VALUES ('pacientes', ?, ?, 'modificar', ?)`,
                [pacienteId, req.usuario.id, JSON.stringify(updates)]
            );
            console.log('✅ Audit log registrado');

            // ✅ COMMIT - Confirmar TODAS las actualizaciones
            console.log('💾 Ejecutando COMMIT de la transacción...');
            await connection.commit();
            console.log('✅✅✅ COMMIT EXITOSO - Todos los cambios guardados en BD ✅✅✅');

            // ✅ Obtener datos actualizados COMPLETOS (igual que obtenerPacientes)
            const [pacienteActualizado] = await connection.execute(
                `SELECT p.*, r.nombre AS nombre_raza, e.nombre AS especie,
                        pr.nombre AS nombre_propietario, pr.apellidos AS apellidos_propietario,
                        pr.email,
                        GROUP_CONCAT(
                            CASE WHEN t.principal = 1 THEN t.numero ELSE NULL END
                        ) AS telefono_principal,
                        MAX(d.calle) AS calle, MAX(d.numero_ext) AS numero_ext,
                        MAX(d.numero_int) AS numero_int, MAX(d.referencias) AS referencias,
                        MAX(cp.codigo) AS codigo_postal, MAX(cp.colonia) AS colonia,
                        MAX(cp.id_municipio) AS id_municipio,
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
                 WHERE p.id = ?
                 GROUP BY p.id`,
                [pacienteId]
            );

            // ✅ Estructurar respuesta igual que obtenerPacientes
            const pacienteData = pacienteActualizado[0];

            console.log('📦 Datos actualizados recuperados de BD:', pacienteData);

            const respuesta = {
                success: true,
                msg: 'Paciente actualizado correctamente',
                data: {
                    ...pacienteData,
                    edad: pacienteData.edad ? `${pacienteData.edad} años` : 'No especificada',
                    direccion: pacienteData.calle ? {
                        calle: pacienteData.calle,
                        numero_ext: pacienteData.numero_ext,
                        numero_int: pacienteData.numero_int,
                        referencias: pacienteData.referencias,
                        codigo_postal: pacienteData.codigo_postal,
                        colonia: pacienteData.colonia,
                        id_municipio: pacienteData.id_municipio,
                        municipio: pacienteData.municipio,
                        estado: pacienteData.estado,
                        pais: pacienteData.pais
                    } : null
                }
            };

            console.log('📨 Enviando respuesta al frontend:', JSON.stringify(respuesta, null, 2));
            res.json(respuesta);
            
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

export {
    agregarPaciente,
    obtenerPacientes,
    obtenerPaciente,
    actualizarPaciente,
    eliminarPaciente,
    obtenerRazas
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