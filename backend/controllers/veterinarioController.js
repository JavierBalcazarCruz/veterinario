import conectarDB from '../config/db.js';
import generarId from '../helpers/generarId.js';
import generarJWT from '../helpers/generarJWT.js';
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
import bcrypt from 'bcrypt';


/*Registrar doctor*/
/*Registrar doctor*/
const registrar = async (req, res) => {
    let connection;
    
    try {
        // 1. Extracción y limpieza de datos
        const { 
            email = '', 
            nombre = '', 
            apellidos = '', 
            password, // Cambiado de password_hash a password
            rol
        } = req.body;
 
        // 2. Limpieza de datos
        const emailLimpio = email.trim().toLowerCase();
        const nombreLimpio = nombre.trim();
        const apellidosLimpio = apellidos.trim();
 
        // 3. Validaciones
        if (!emailLimpio || !nombreLimpio || !apellidosLimpio || !password) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }
 
        // Validar longitud mínima del password
        if (password.length < 6) {
            return res.status(400).json({ 
                msg: 'El password debe tener al menos 6 caracteres' 
            });
        }
 
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            return res.status(400).json({ msg: 'Email no válido' });
        }
 
        const rolesPermitidos = ['admin', 'doctor', 'recepcion'];
        if (!rolesPermitidos.includes(rol)) {
            return res.status(400).json({ msg: 'Rol no válido' });
        }
 
        // 4. Hash del password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);
 
        // 5. Conexión a la base de datos
        connection = await conectarDB();
 
        // 6. Verificación de email duplicado
        const [existingUsers] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ?',
            [emailLimpio]
        );
 
        if (existingUsers.length > 0) {
            return res.status(400).json({ msg: 'El email ya está registrado' });
        }
 
        // 7. Asignación de licencia gratuita por defecto
        const id_licencia_clinica = 11; // ID de la licencia gratuita
        
        // 7.1 Verificación de que la licencia gratuita existe y está activa
        const [licenciaExiste] = await connection.execute(
            'SELECT id FROM licencias_clinica WHERE id = ? AND status IN ("free", "activa")',
            [id_licencia_clinica]
        );
 
        if (licenciaExiste.length === 0) {
            return res.status(400).json({ msg: 'La licencia gratuita no está disponible' });
        }
 
        // 8. Inserción del usuario con password hasheado
        const [resultadoUsuario] = await connection.execute(
            `INSERT INTO usuarios (
                nombre, 
                apellidos, 
                email, 
                password_hash, 
                rol, 
                id_licencia_clinica, 
                account_status
            ) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [
                nombreLimpio,
                apellidosLimpio,
                emailLimpio,
                password_hash, // Ahora usamos el password hasheado
                rol,
                id_licencia_clinica
            ]
        );
 
        const idUsuario = resultadoUsuario.insertId;
 
        // 9. Generación y almacenamiento del token de verificación
        const token = generarId();
        const HORAS_EXPIRACION = 24;
        
        await connection.execute(
            `INSERT INTO user_tokens (
                id_usuario, 
                token_type, 
                token_hash, 
                expires_at
            ) VALUES (?, 'verification', ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
            [idUsuario, token, HORAS_EXPIRACION]
        );

        // 10 Enviar email de registro
        await emailRegistro({
            email: emailLimpio,
            nombre: nombreLimpio,
            token: token
        });
 
        // 11. Respuesta al cliente
        res.json({
            msg: 'Usuario registrado correctamente. Revisa tu email para verificar tu cuenta.',
            id: idUsuario,
            nombre: nombreLimpio,
            email: emailLimpio,
            rol
        });
 
    } catch (error) {
        console.log('Error en registro:', error.message);
        res.status(500).json({ msg: 'Error interno del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar la conexión:', error.message);
            }
        }
    }
};
 

const perfil = async (req, res) => {
    try {
        // req.usuario ya contiene los datos básicos del usuario autenticado
        const { id, nombre, apellidos, email, rol } = req.usuario;
        
        res.json({
            id,
            nombre,
            apellidos, 
            email,
            rol
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: 'Error al obtener perfil' });
    }
};

/* Confirmar Cuenta  del doctor*/
/* Confirmar Cuenta del doctor - VERSIÓN CORREGIDA */
/* Confirmar Cuenta del doctor - VERSIÓN SUGERIDA */
/* Confirmar Cuenta del doctor - VERSIÓN CORREGIDA */
const confirmar = async (req, res) => {
    let connection;
    try {
        const token = req.params.token?.trim();
        console.log('🔍 Token recibido para confirmación:', token);

        // Validaciones del token
        if (!token) {
            console.log('❌ Token no proporcionado');
            return res.status(400).json({ msg: 'Token no proporcionado' });
        }
        
        const tokenRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!tokenRegex.test(token)) {
            console.log('❌ Token con formato inválido');
            return res.status(400).json({ msg: 'Token inválido' });
        }

        connection = await conectarDB();
        console.log('✅ Conexión a BD establecida');

        // Paso 1: Buscar el token en la BD y verificar el estado del usuario asociado
        console.log('🔍 Buscando token y estado de cuenta asociado...');
        const [tokenInfoArray] = await connection.execute(
            `SELECT ut.id, ut.id_usuario, ut.expires_at, ut.used_at, u.account_status, u.nombre, u.email
             FROM user_tokens ut
             INNER JOIN usuarios u ON u.id = ut.id_usuario
             WHERE ut.token_hash = ? AND ut.token_type = 'verification'
             LIMIT 1`,
            [token]
        );

        if (tokenInfoArray.length === 0) {
            console.log('❌ Token no encontrado en la base de datos.');
            return res.status(400).json({ msg: 'Token no válido. Solicita un nuevo enlace de verificación.' });
        }

        const tokenInfo = tokenInfoArray[0];

        // Paso 2: Evaluar si el token ha expirado o ya se usó
        if (new Date(tokenInfo.expires_at) < new Date()) {
            console.log('⏰ Token expirado');
            return res.status(400).json({
                msg: 'El enlace ha expirado. Solicita un nuevo enlace de verificación.'
            });
        }
        
        if (tokenInfo.used_at) {
            console.log('ℹ️ Token ya fue utilizado');
            return res.status(200).json({
                msg: 'Tu cuenta ya está verificada. ¡Puedes iniciar sesión!'
            });
        }
        
        // Paso 3: Evaluar el estado actual de la cuenta
        if (tokenInfo.account_status === 'active') {
            console.log('ℹ️ Cuenta ya está activa:', tokenInfo.email);
            return res.status(200).json({
                msg: 'Tu cuenta ya está verificada. ¡Puedes iniciar sesión!'
            });
        }

        // Si llegamos aquí, el token es válido, no ha expirado, no se ha usado y la cuenta está pendiente.
        console.log('✅ Token válido encontrado para usuario:', tokenInfo.email);

        // Paso 4: Activar la cuenta y marcar el token como usado en una transacción
        await connection.beginTransaction();
        console.log('🔄 Transacción iniciada');

        try {
            // Actualizar cuenta
            await connection.execute(
                `UPDATE usuarios SET account_status = 'active', email_verified_at = NOW()
                 WHERE id = ? AND account_status = 'pending'`,
                [tokenInfo.id_usuario]
            );

            // Marcar token como usado
            await connection.execute(
                `UPDATE user_tokens SET used_at = NOW() WHERE id = ?`,
                [tokenInfo.id]
            );
            
            await connection.commit();
            console.log('✅ Transacción completada exitosamente');

            // Respuesta de éxito
            return res.status(200).json({
                msg: '¡Cuenta verificada exitosamente! Ya puedes iniciar sesión en MollyVet.',
                success: true,
                user: {
                    email: tokenInfo.email,
                    nombre: tokenInfo.nombre
                }
            });

        } catch (error) {
            await connection.rollback();
            console.error('❌ Error en transacción:', error);
            // Re-lanzar el error para que el bloque catch principal lo maneje
            throw error;
        }

    } catch (error) {
        console.error('❌ Error general en confirmación:', error.message);
        res.status(500).json({
            msg: 'Error en el servidor al confirmar la cuenta. Inténtalo más tarde.'
        });
    } finally {
        if (connection) {
            try {
                await connection.end();
                console.log('🔌 Conexión a BD cerrada');
            } catch (error) {
                console.error('❌ Error al cerrar conexión:', error.message);
            }
        }
    }
};





 /* Autentificar veterinario */
const autenticar = async (req, res) => {
    let connection;
    try {
        // Extraer datos del request
        const { email, password } = req.body;
 
        // Validación básica de campos
        if (!email || !password) {
            return res.status(400).json({ msg: 'Todos los campos son obligatorios' });
        }
 
        // Limpieza de email
        const emailLimpio = email.trim().toLowerCase();
 
        connection = await conectarDB();
 
        // Buscar usuario con toda su información relevante
        const [users] = await connection.execute(
            `SELECT id, nombre, apellidos, email, password_hash, 
                    account_status, failed_login_attempts, rol,
                    id_licencia_clinica
             FROM usuarios 
             WHERE email = ?`,
            [emailLimpio]
        );
 
        const usuario = users[0];
 
        // Validar existencia del usuario
        if (!usuario) {
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }
 
        // Verificar si la cuenta está bloqueada por intentos fallidos
        if (usuario.failed_login_attempts >= 5) {
            await connection.execute(
                `UPDATE usuarios 
                 SET account_status = 'suspended' 
                 WHERE id = ?`,
                [usuario.id]
            );
            return res.status(400).json({ 
                msg: 'Cuenta bloqueada por seguridad. Contacte al administrador.' 
            });
        }
 
        // Verificar estado de la cuenta
        if (usuario.account_status !== 'active') {
            return res.status(403).json({ 
                msg: 'Cuenta pendiente de confirmar o cuenta suspendida' 
            });
        }
 
        // Verificar licencia activa o free
        const [licencia] = await connection.execute(
            `SELECT status FROM licencias_clinica 
            WHERE id = ? AND status IN ('activa', 'free')`,
            [usuario.id_licencia_clinica]
        );
 
        if (licencia.length === 0) {
            return res.status(400).json({ 
                msg: 'Licencia inactiva o expirada' 
            });
        }
 
        // Verificar password
        const passwordCorrecto = await bcrypt.compare(
            password, 
            usuario.password_hash
        );
 
        if (!passwordCorrecto) {
            // Incrementar intentos fallidos
            await connection.execute(
                `UPDATE usuarios 
                 SET failed_login_attempts = failed_login_attempts + 1,
                     last_login = NOW()
                 WHERE id = ?`,
                [usuario.id]
            );
            return res.status(400).json({ msg: 'Credenciales incorrectas' });
        }
 
        // Login exitoso: resetear intentos y actualizar último acceso
        await connection.execute(
            `UPDATE usuarios 
             SET failed_login_attempts = 0,
                 last_login = NOW()
             WHERE id = ?`,
            [usuario.id]
        );
 
        // Generar JWT utilizando el helper
        const token = generarJWT(usuario.id);
 
        // Respuesta exitosa
        res.json({
            id: usuario.id,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos,
            email: usuario.email,
            rol: usuario.rol,
            token
        });
 
    } catch (error) {
        console.log('Error en autenticación:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};


 /* Olvide mi password */
const olvidePassword = async (req, res) => {
    let connection;
    try {
        const { email } = req.body;
 
        // Validaciones básicas
        if (!email) {
            return res.status(400).json({ msg: 'El email es obligatorio' });
        }
 
        const emailLimpio = email.trim().toLowerCase();
        
        // Validar formato email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            return res.status(400).json({ msg: 'Email no válido' });
        }
 
        connection = await conectarDB();
 
        // Verificar usuario existente y activo
        const [users] = await connection.execute(
            `SELECT id, nombre, email, account_status 
             FROM usuarios 
             WHERE email = ? 
             AND account_status = 'active'`,
            [emailLimpio]
        );
 
        if (!users.length) {
            return res.status(400).json({ msg: 'El email no está registrado' });
        }
 
        const usuario = users[0];
 
        // Verificar si ya existe un token válido
        const [tokenExistente] = await connection.execute(
            `SELECT id FROM user_tokens 
             WHERE id_usuario = ? 
             AND token_type = 'reset' 
             AND expires_at > NOW() 
             AND used_at IS NULL`,
            [usuario.id]
        );
 
        // Si existe token válido, invalidarlo
        if (tokenExistente.length) {
            await connection.execute(
                `UPDATE user_tokens 
                 SET used_at = NOW() 
                 WHERE id = ?`,
                [tokenExistente[0].id]
            );
        }
 
        // Generar nuevo token
        const token = generarId();
        const HORAS_EXPIRACION = 24;
 
        // Guardar token
        await connection.execute(
            `INSERT INTO user_tokens (
                id_usuario, 
                token_type, 
                token_hash, 
                expires_at
            ) VALUES (?, 'reset', ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
            [usuario.id, token, HORAS_EXPIRACION]
        );
 
        // Enviar email
        await emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: token
        });

        res.json({ msg: 'Se ha enviado un correo electrónico con las instrucciones' });
 
    } catch (error) {
        console.log('Error en recuperación de contraseña:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

 /* Comprobar si el token existe cuando se olvido mi password */
const comprobarToken = async (req, res) => {
    let connection;
    try {
        // Extraer y limpiar token
        const token = req.params.token?.trim();
 
        // Validaciones básicas
        if (!token) {
            return res.status(400).json({ msg: 'Token no proporcionado' });
        }
 
        // Validar caracteres permitidos
        const tokenRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!tokenRegex.test(token)) {
            return res.status(400).json({ msg: 'Token inválido' });
        }
 
        connection = await conectarDB();
 
        // Buscar token válido y activo
        const [tokens] = await connection.execute(
            `SELECT ut.id, ut.id_usuario, u.nombre, u.email 
             FROM user_tokens ut
             INNER JOIN usuarios u ON u.id = ut.id_usuario
             WHERE ut.token_hash = ?
             AND ut.token_type = 'reset'
             AND ut.expires_at > NOW()
             AND ut.used_at IS NULL
             AND u.account_status != 'suspended'`,
            [token]
        );
 
        if (!tokens.length) {
            return res.status(400).json({ msg: 'Token no válido o expirado' });
        }
 
        // Retornar información básica del usuario
        res.json({
            msg: 'Token válido',
            nombre: tokens[0].nombre,
            email: tokens[0].email
        });
 
    } catch (error) {
        console.log('Error al validar token:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};

 /* Restablecer nuevo password  */
const nuevoPassword = async (req, res) => {
    let connection;
    try {
        // 1. Validación de datos de entrada
        const token = req.params.token?.trim();
        const { password } = req.body;
 
        // Validaciones básicas
        if (!token || !password) {
            return res.status(400).json({ msg: 'Todos los campos son requeridos' });
        }
 
        // Validar formato de token
        const tokenRegex = /^[a-zA-Z0-9\-_]+$/;
        if (!tokenRegex.test(token)) {
            return res.status(400).json({ msg: 'Token inválido' });
        }
 
        // Validar requisitos del password
        if (password.length < 6) {
            return res.status(400).json({ 
                msg: 'El password debe tener al menos 6 caracteres' 
            });
        }
 
        connection = await conectarDB();
 
        // Iniciar transacción
        await connection.beginTransaction();
 
        try {
            // 2. Verificar token válido
            const [tokens] = await connection.execute(
                `SELECT ut.id, ut.id_usuario, u.account_status
                 FROM user_tokens ut
                 INNER JOIN usuarios u ON u.id = ut.id_usuario
                 WHERE ut.token_hash = ?
                 AND ut.token_type = 'reset'
                 AND ut.expires_at > NOW()
                 AND ut.used_at IS NULL
                 AND u.account_status != 'suspended'`,
                [token]
            );
 
            if (!tokens.length) {
                await connection.rollback();
                return res.status(400).json({ 
                    msg: 'Token no válido o expirado' 
                });
            }
 
            // 3. Generar hash del nuevo password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);
 
            // 4. Actualizar password
            await connection.execute(
                `UPDATE usuarios 
                 SET password_hash = ?,
                     password_reset_required = FALSE,
                     updated_at = NOW()
                 WHERE id = ?`,
                [password_hash, tokens[0].id_usuario]
            );
 
            // 5. Marcar token como usado
            await connection.execute(
                `UPDATE user_tokens 
                 SET used_at = NOW()
                 WHERE id = ?`,
                [tokens[0].id]
            );
 
            // 6. Invalidar otros tokens de reset del usuario
            await connection.execute(
                `UPDATE user_tokens 
                 SET used_at = NOW()
                 WHERE id_usuario = ?
                 AND token_type = 'reset'
                 AND used_at IS NULL`,
                [tokens[0].id_usuario]
            );
 
            // Confirmar transacción
            await connection.commit();
 
            res.json({ msg: 'Contraseña actualizada correctamente' });
 
        } catch (error) {
            await connection.rollback();
            throw error;
        }
 
    } catch (error) {
        console.log('Error al cambiar password:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) await connection.end();
    }
};


 // Función auxiliar para verificar password - usar en login
const comprobarPassword = async (passwordFormulario, passwordHash) => {
    return await bcrypt.compare(passwordFormulario, passwordHash);
};

/**
 * Reenvía un nuevo token de verificación para cuentas pendientes
 * Permite a los usuarios obtener un nuevo token cuando el original ha expirado
 */
const reenviarVerificacion = async (req, res) => {
    let connection;
    try {
        // 1. Extraer el email del cuerpo de la petición
        const { email } = req.body;
        
        // 2. Validar que se proporcionó un email
        if (!email) {
            return res.status(400).json({ msg: 'El email es obligatorio' });
        }
        
        // 3. Limpiar y normalizar el email
        const emailLimpio = email.trim().toLowerCase();
        
        // 4. Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            return res.status(400).json({ msg: 'Email no válido' });
        }
        
        // 5. Conectar a la base de datos
        connection = await conectarDB();
        
        // 6. Verificar que el usuario existe y está pendiente de verificación
        const [users] = await connection.execute(
            `SELECT id, nombre, email 
             FROM usuarios 
             WHERE email = ? 
             AND account_status = 'pending'`,
            [emailLimpio]
        );
        
        // 7. Si no se encuentra un usuario pendiente, retornar error
        if (!users.length) {
            return res.status(400).json({ 
                msg: 'No se encontró una cuenta pendiente con ese email' 
            });
        }
        
        const usuario = users[0];
        
        // 8. Invalidar todos los tokens de verificación anteriores para este usuario
        await connection.execute(
            `UPDATE user_tokens 
             SET used_at = NOW() 
             WHERE id_usuario = ? 
             AND token_type = 'verification' 
             AND used_at IS NULL`,
            [usuario.id]
        );
        
        // 9. Generar un nuevo token único
        const token = generarId();
        const HORAS_EXPIRACION = 24;
        
        // 10. Guardar el nuevo token en la base de datos
        await connection.execute(
            `INSERT INTO user_tokens (
                id_usuario, 
                token_type, 
                token_hash, 
                expires_at
            ) VALUES (?, 'verification', ?, DATE_ADD(NOW(), INTERVAL ? HOUR))`,
            [usuario.id, token, HORAS_EXPIRACION]
        );
        
        // 11. Aquí iría el código para enviar el email con el nuevo token
        // Ejemplo: await enviarEmailVerificacion(usuario.email, usuario.nombre, token);
        
        // 12. Respuesta exitosa
        res.json({ 
            msg: 'Se ha enviado un nuevo correo de verificación'
        });
        
    } catch (error) {
        // 13. Manejo de errores
        console.log('Error en reenvío de verificación:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        // 14. Cerrar la conexión a la base de datos
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * Actualiza el perfil del usuario autenticado
 */
const actualizarPerfil = async (req, res) => {
    let connection;
    try {
        // 1. Obtener ID del usuario autenticado desde el middleware
        const idUsuario = req.usuario.id;

        // 2. Extraer datos del cuerpo de la petición
        const { nombre, apellidos, email } = req.body;

        // 3. Validaciones básicas
        if (!nombre || !apellidos || !email) {
            return res.status(400).json({
                msg: 'Todos los campos son obligatorios'
            });
        }

        // 4. Limpiar y normalizar datos
        const nombreLimpio = nombre.trim();
        const apellidosLimpio = apellidos.trim();
        const emailLimpio = email.trim().toLowerCase();

        // 5. Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailLimpio)) {
            return res.status(400).json({ msg: 'Email no válido' });
        }

        // 6. Conectar a la base de datos
        connection = await conectarDB();

        // 7. Verificar si el email ya está en uso por otro usuario
        const [emailExistente] = await connection.execute(
            'SELECT id FROM usuarios WHERE email = ? AND id != ?',
            [emailLimpio, idUsuario]
        );

        if (emailExistente.length > 0) {
            return res.status(400).json({
                msg: 'El email ya está registrado por otro usuario'
            });
        }

        // 8. Actualizar el perfil del usuario
        await connection.execute(
            `UPDATE usuarios
             SET nombre = ?,
                 apellidos = ?,
                 email = ?,
                 updated_at = NOW()
             WHERE id = ?`,
            [nombreLimpio, apellidosLimpio, emailLimpio, idUsuario]
        );

        // 9. Obtener los datos actualizados del usuario
        const [usuarioActualizado] = await connection.execute(
            'SELECT id, nombre, apellidos, email, rol FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        // 10. Respuesta exitosa con los datos actualizados
        res.json({
            msg: 'Perfil actualizado correctamente',
            usuario: usuarioActualizado[0]
        });

    } catch (error) {
        console.log('Error al actualizar perfil:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar conexión:', error);
            }
        }
    }
};

/**
 * Cambiar contraseña del usuario autenticado
 */
const cambiarPassword = async (req, res) => {
    let connection;
    try {
        // 1. Obtener ID del usuario autenticado
        const idUsuario = req.usuario.id;

        // 2. Extraer datos del cuerpo
        const { passwordActual, passwordNuevo } = req.body;

        // 3. Validaciones básicas
        if (!passwordActual || !passwordNuevo) {
            return res.status(400).json({
                msg: 'La contraseña actual y la nueva son obligatorias'
            });
        }

        // 4. Validar longitud mínima
        if (passwordNuevo.length < 6) {
            return res.status(400).json({
                msg: 'La contraseña nueva debe tener al menos 6 caracteres'
            });
        }

        // 5. Validar que no sean iguales
        if (passwordActual === passwordNuevo) {
            return res.status(400).json({
                msg: 'La contraseña nueva debe ser diferente a la actual'
            });
        }

        // 6. Conectar a la base de datos
        connection = await conectarDB();

        // 7. Obtener usuario con password_hash
        const [usuarios] = await connection.execute(
            'SELECT id, password_hash FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({ msg: 'Usuario no encontrado' });
        }

        const usuario = usuarios[0];

        // 8. Verificar contraseña actual
        const passwordCorrecto = await bcrypt.compare(passwordActual, usuario.password_hash);

        if (!passwordCorrecto) {
            return res.status(400).json({
                msg: 'La contraseña actual es incorrecta'
            });
        }

        // 9. Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const nuevoPasswordHash = await bcrypt.hash(passwordNuevo, salt);

        // 10. Actualizar contraseña
        await connection.execute(
            `UPDATE usuarios
             SET password_hash = ?,
                 password_reset_required = FALSE,
                 updated_at = NOW()
             WHERE id = ?`,
            [nuevoPasswordHash, idUsuario]
        );

        // 11. Respuesta exitosa
        res.json({
            msg: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.log('Error al cambiar contraseña:', error);
        res.status(500).json({ msg: 'Error del servidor' });
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (error) {
                console.log('Error al cerrar conexión:', error);
            }
        }
    }
};

export {
    registrar,
    perfil,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    reenviarVerificacion,
    actualizarPerfil,
    cambiarPassword
};