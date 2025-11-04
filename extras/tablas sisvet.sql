DROP TABLE IF EXISTS `adjuntos`;
CREATE TABLE `adjuntos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_historia_clinica` bigint unsigned NOT NULL,
  `tipo_archivo` enum('radiografia','analisis','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url_archivo` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  CONSTRAINT `adjuntos_ibfk_1` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tabla` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `accion` enum('crear','modificar','eliminar') COLLATE utf8mb4_unicode_ci NOT NULL,
  `datos_antiguos` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_tabla_registro` (`tabla`,`id_registro`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `citas`;
CREATE TABLE `citas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_doctor` bigint unsigned NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `tipo_consulta` enum('primera_vez','seguimiento','urgencia','vacunacion') COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('programada','confirmada','cancelada','completada','no_asistio') COLLATE utf8mb4_unicode_ci DEFAULT 'programada',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  KEY `idx_fecha` (`fecha`,`hora`),
  CONSTRAINT `citas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `citas_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `codigo_postal`;

CREATE TABLE `codigo_postal` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_municipio` int unsigned NOT NULL,
  `codigo` char(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colonia` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_asentamiento` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_municipio` (`id_municipio`),
  KEY `idx_cp` (`codigo`),
  CONSTRAINT `codigo_postal_ibfk_1` FOREIGN KEY (`id_municipio`) REFERENCES `municipios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `desparasitaciones`;

CREATE TABLE `desparasitaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_historia_clinica` bigint unsigned NOT NULL,
  `producto` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `fecha_proxima` date DEFAULT NULL,
  `peso_actual` decimal(5,2) DEFAULT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  CONSTRAINT `desparasitaciones_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `desparasitaciones_ibfk_2` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `direcciones`;

CREATE TABLE `direcciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_propietario` bigint unsigned NOT NULL,
  `tipo` enum('casa','trabajo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `calle` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_ext` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_int` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_codigo_postal` int unsigned NOT NULL,
  `referencias` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_propietario` (`id_propietario`),
  KEY `id_codigo_postal` (`id_codigo_postal`),
  CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `direcciones_ibfk_2` FOREIGN KEY (`id_codigo_postal`) REFERENCES `codigo_postal` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `doctor_especialidades`;

CREATE TABLE `doctor_especialidades` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_doctor` bigint unsigned NOT NULL,
  `id_especialidad` smallint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_doctor_especialidad` (`id_doctor`,`id_especialidad`),
  KEY `id_especialidad` (`id_especialidad`),
  CONSTRAINT `doctor_especialidades_ibfk_1` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`) ON DELETE CASCADE,
  CONSTRAINT `doctor_especialidades_ibfk_2` FOREIGN KEY (`id_especialidad`) REFERENCES `especialidades` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `doctores`;

CREATE TABLE `doctores` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint unsigned NOT NULL,
  `cedula_profesional` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `horario_trabajo` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('activo','inactivo','vacaciones') COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula_profesional` (`cedula_profesional`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `doctores_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `enfermedades_comunes`;

CREATE TABLE `enfermedades_comunes` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `id_especie` smallint unsigned NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `sintomas` text COLLATE utf8mb4_unicode_ci,
  `tratamiento_general` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_especie` (`id_especie`),
  CONSTRAINT `enfermedades_comunes_ibfk_1` FOREIGN KEY (`id_especie`) REFERENCES `especies` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `especialidades`;

CREATE TABLE `especialidades` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `especies`;

CREATE TABLE `especies` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `estados`;

CREATE TABLE `estados` (
  `id` mediumint unsigned NOT NULL AUTO_INCREMENT,
  `id_pais` smallint unsigned NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_estado_pais` (`id_pais`,`codigo`),
  CONSTRAINT `estados_ibfk_1` FOREIGN KEY (`id_pais`) REFERENCES `paises` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `gastos`;

CREATE TABLE `gastos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `categoria` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `monto` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `comprobante_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `historias_clinicas`;

CREATE TABLE `historias_clinicas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_doctor` bigint unsigned NOT NULL,
  `fecha_consulta` datetime NOT NULL,
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnostico` text COLLATE utf8mb4_unicode_ci,
  `tratamiento` text COLLATE utf8mb4_unicode_ci,
  `peso_actual` decimal(5,2) DEFAULT NULL,
  `temperatura` decimal(3,1) DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  CONSTRAINT `historias_clinicas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `historias_clinicas_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `ingresos`;

CREATE TABLE `ingresos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('consulta','servicio','producto') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_referencia` bigint unsigned NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `metodo_pago` enum('efectivo','tarjeta','transferencia') COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha` datetime NOT NULL,
  `id_empleado` bigint unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `ingresos_ibfk_1` FOREIGN KEY (`id_empleado`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `inventario`;

CREATE TABLE `inventario` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `codigo_barras` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `stock` int NOT NULL DEFAULT '0',
  `precio_compra` decimal(10,2) NOT NULL,
  `precio_venta` decimal(10,2) NOT NULL,
  `stock_minimo` int DEFAULT '5',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `licencias_clinica`;

CREATE TABLE `licencias_clinica` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre_clinica` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('activa','suspendida','cancelada') COLLATE utf8mb4_unicode_ci DEFAULT 'activa',
  `fecha_inicio` date NOT NULL,
  `fecha_vencimiento` date NOT NULL,
  `ultimo_pago` date DEFAULT NULL,
  `monto_mensual` decimal(10,2) DEFAULT NULL,
  `dias_gracia` int DEFAULT '5',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `medicamentos_recetados`;

CREATE TABLE `medicamentos_recetados` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_historia_clinica` bigint unsigned NOT NULL,
  `nombre_medicamento` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `frecuencia` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `duracion` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  CONSTRAINT `medicamentos_recetados_ibfk_1` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `movimientos_inventario`;

CREATE TABLE `movimientos_inventario` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_producto` bigint unsigned NOT NULL,
  `tipo` enum('entrada','salida') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `fecha` datetime NOT NULL,
  `motivo` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `movimientos_inventario_ibfk_1` FOREIGN KEY (`id_producto`) REFERENCES `inventario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `municipios`;

CREATE TABLE `municipios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `id_estado` mediumint unsigned NOT NULL,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo` char(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_municipio_estado` (`id_estado`,`codigo`),
  CONSTRAINT `municipios_ibfk_1` FOREIGN KEY (`id_estado`) REFERENCES `estados` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `notificaciones`;

CREATE TABLE `notificaciones` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('cita','vacuna','desparasitacion','sistema') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` enum('pendiente','enviada','leida') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_lectura` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `pacientes`;

CREATE TABLE `pacientes` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_propietario` bigint unsigned NOT NULL,
  `id_doctor` bigint unsigned NOT NULL,
  `id_usuario` bigint unsigned NOT NULL,
  `id_raza` smallint unsigned NOT NULL,
  `nombre_mascota` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `foto_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` enum('activo','fallecido','inactivo') COLLATE utf8mb4_unicode_ci DEFAULT 'activo',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_propietario` (`id_propietario`),
  KEY `id_doctor` (`id_doctor`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_raza` (`id_raza`),
  KEY `idx_nombre_mascota` (`nombre_mascota`),
  CONSTRAINT `pacientes_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id`),
  CONSTRAINT `pacientes_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`),
  CONSTRAINT `pacientes_ibfk_3` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `pacientes_ibfk_4` FOREIGN KEY (`id_raza`) REFERENCES `razas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `paises`;

CREATE TABLE `paises` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `codigo_iso` char(2) COLLATE utf8mb4_unicode_ci NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_iso` (`codigo_iso`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `password_reset_requests`;

CREATE TABLE `password_reset_requests` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint unsigned NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `password_reset_requests_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `propietarios`;

CREATE TABLE `propietarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `razas`;

CREATE TABLE `razas` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `id_especie` smallint unsigned NOT NULL,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_raza_especie` (`id_especie`,`nombre`),
  CONSTRAINT `razas_ibfk_1` FOREIGN KEY (`id_especie`) REFERENCES `especies` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `recordatorios`;

CREATE TABLE `recordatorios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('vacuna','desparasitacion','cita','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_referencia` bigint unsigned NOT NULL,
  `fecha_envio` datetime NOT NULL,
  `estado` enum('pendiente','enviado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'pendiente',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `servicio_realizado`;

CREATE TABLE `servicio_realizado` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_servicio` smallint unsigned NOT NULL,
  `id_paciente` bigint unsigned NOT NULL,
  `id_empleado` bigint unsigned NOT NULL,
  `fecha` datetime NOT NULL,
  `precio_cobrado` decimal(10,2) NOT NULL,
  `notas` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_servicio` (`id_servicio`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_empleado` (`id_empleado`),
  CONSTRAINT `servicio_realizado_ibfk_1` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id`),
  CONSTRAINT `servicio_realizado_ibfk_2` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `servicio_realizado_ibfk_3` FOREIGN KEY (`id_empleado`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `servicios`;

CREATE TABLE `servicios` (
  `id` smallint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `precio_base` decimal(10,2) NOT NULL,
  `duracion_aprox` int DEFAULT NULL,
  `requiere_doctor` tinyint(1) DEFAULT '1',
  `activo` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `system_logs`;

CREATE TABLE `system_logs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tipo` enum('info','warning','error','critical') COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `stack_trace` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `telefonos`;

CREATE TABLE `telefonos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_propietario` bigint unsigned NOT NULL,
  `tipo` enum('celular','casa','trabajo') COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `principal` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_propietario` (`id_propietario`),
  CONSTRAINT `telefonos_ibfk_1` FOREIGN KEY (`id_propietario`) REFERENCES `propietarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_sessions`;

CREATE TABLE `user_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint unsigned NOT NULL,
  `jwt_token_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `device_info` text COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_activity` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_token_id` (`jwt_token_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user_tokens`;

CREATE TABLE `user_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_usuario` bigint unsigned NOT NULL,
  `token_type` enum('verification','reset','2fa') COLLATE utf8mb4_unicode_ci NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `idx_token` (`token_hash`),
  CONSTRAINT `user_tokens_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `usuarios`;

CREATE TABLE `usuarios` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `account_status` enum('active','suspended','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `rol` enum('admin','doctor','recepcion','superadmin') COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_licencia_clinica` bigint unsigned NOT NULL,
  `last_login` timestamp NULL DEFAULT NULL,
  `failed_login_attempts` tinyint unsigned DEFAULT '0',
  `password_reset_required` tinyint(1) DEFAULT '0',
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `id_licencia_clinica` (`id_licencia_clinica`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`id_licencia_clinica`) REFERENCES `licencias_clinica` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `vacunas`;

CREATE TABLE `vacunas` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_historia_clinica` bigint unsigned NOT NULL,
  `tipo_vacuna` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_aplicacion` date NOT NULL,
  `fecha_proxima` date DEFAULT NULL,
  `lote_vacuna` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  CONSTRAINT `vacunas_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `vacunas_ibfk_2` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- MEJORAS AL SISTEMA DE HISTORIAL CLÍNICO VETERINARIO
-- =====================================================
-- Este script agrega tablas y campos necesarios para
-- un historial clínico veterinario completo y profesional

-- =====================================================
-- 1. TABLA DE ALERGIAS
-- =====================================================
DROP TABLE IF EXISTS `alergias`;

CREATE TABLE `alergias` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `tipo_alergia` enum('medicamento','alimento','ambiental','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_alergeno` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `severidad` enum('leve','moderada','severa','critica') COLLATE utf8mb4_unicode_ci DEFAULT 'moderada',
  `sintomas` text COLLATE utf8mb4_unicode_ci,
  `fecha_deteccion` date DEFAULT NULL,
  `activa` tinyint(1) DEFAULT '1',
  `notas` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `idx_activa` (`activa`),
  CONSTRAINT `alergias_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de alergias de los pacientes';

-- =====================================================
-- 2. TABLA DE CIRUGÍAS Y PROCEDIMIENTOS
-- =====================================================
DROP TABLE IF EXISTS `cirugias_procedimientos`;

CREATE TABLE `cirugias_procedimientos` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_doctor` bigint unsigned NOT NULL,
  `id_historia_clinica` bigint unsigned DEFAULT NULL,
  `tipo` enum('cirugia','procedimiento') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_realizacion` datetime NOT NULL,
  `duracion_minutos` int DEFAULT NULL,
  `anestesia_utilizada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `complicaciones` text COLLATE utf8mb4_unicode_ci,
  `resultado` enum('exitoso','complicaciones','fallido') COLLATE utf8mb4_unicode_ci DEFAULT 'exitoso',
  `notas_postoperatorias` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_doctor` (`id_doctor`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  KEY `idx_fecha` (`fecha_realizacion`),
  CONSTRAINT `cirugias_procedimientos_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `cirugias_procedimientos_ibfk_2` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`),
  CONSTRAINT `cirugias_procedimientos_ibfk_3` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de cirugías y procedimientos realizados';

-- =====================================================
-- 3. TABLA DE EXÁMENES DE LABORATORIO
-- =====================================================
DROP TABLE IF EXISTS `examenes_laboratorio`;

CREATE TABLE `examenes_laboratorio` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_paciente` bigint unsigned NOT NULL,
  `id_historia_clinica` bigint unsigned NOT NULL,
  `tipo_examen` enum('hemograma','bioquimica','urinalisis','parasitologia','microbiologia','otro') COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_examen` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_solicitud` date NOT NULL,
  `fecha_resultado` date DEFAULT NULL,
  `laboratorio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resultados` text COLLATE utf8mb4_unicode_ci,
  `interpretacion` text COLLATE utf8mb4_unicode_ci,
  `valores_referencia` text COLLATE utf8mb4_unicode_ci,
  `estado` enum('solicitado','en_proceso','completado','cancelado') COLLATE utf8mb4_unicode_ci DEFAULT 'solicitado',
  `archivo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `id_paciente` (`id_paciente`),
  KEY `id_historia_clinica` (`id_historia_clinica`),
  KEY `idx_tipo` (`tipo_examen`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `examenes_laboratorio_ibfk_1` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`),
  CONSTRAINT `examenes_laboratorio_ibfk_2` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historias_clinicas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de exámenes de laboratorio solicitados y resultados';

-- =====================================================
-- 4. AGREGAR CAMPOS DE SIGNOS VITALES A HISTORIAS_CLINICAS
-- =====================================================
-- Agregar campos para un registro más completo de signos vitales

ALTER TABLE `historias_clinicas`
ADD COLUMN `frecuencia_cardiaca` int DEFAULT NULL COMMENT 'Latidos por minuto' AFTER `temperatura`,
ADD COLUMN `frecuencia_respiratoria` int DEFAULT NULL COMMENT 'Respiraciones por minuto' AFTER `frecuencia_cardiaca`,
ADD COLUMN `presion_arterial` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Ejemplo: 120/80' AFTER `frecuencia_respiratoria`,
ADD COLUMN `tiempo_llenado_capilar` decimal(3,1) DEFAULT NULL COMMENT 'Segundos' AFTER `presion_arterial`,
ADD COLUMN `nivel_dolor` tinyint DEFAULT NULL COMMENT 'Escala 0-10' AFTER `tiempo_llenado_capilar`,
ADD COLUMN `condicion_corporal` enum('muy_delgado','delgado','ideal','sobrepeso','obeso') COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER `nivel_dolor`,
ADD COLUMN `estado_hidratacion` enum('normal','leve','moderada','severa') COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Nivel de deshidratación' AFTER `condicion_corporal`;

-- =====================================================
-- 5. ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
-- Agregar índices para mejorar rendimiento en consultas frecuentes

ALTER TABLE `historias_clinicas`
ADD INDEX `idx_fecha_consulta` (`fecha_consulta`),
ADD INDEX `idx_paciente_fecha` (`id_paciente`, `fecha_consulta`);

ALTER TABLE `vacunas`
ADD INDEX `idx_paciente_fecha` (`id_paciente`, `fecha_aplicacion`),
ADD INDEX `idx_proxima` (`fecha_proxima`);

ALTER TABLE `desparasitaciones`
ADD INDEX `idx_paciente_fecha` (`id_paciente`, `fecha_aplicacion`),
ADD INDEX `idx_proxima` (`fecha_proxima`);

-- =====================================================
-- 6. VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista para historial completo de un paciente
DROP VIEW IF EXISTS `vista_historial_completo`;

CREATE VIEW `vista_historial_completo` AS
SELECT
    p.id AS paciente_id,
    p.nombre_mascota,
    'consulta' AS tipo_registro,
    hc.id AS registro_id,
    hc.fecha_consulta AS fecha,
    hc.motivo_consulta AS descripcion,
    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
    hc.diagnostico,
    hc.tratamiento
FROM pacientes p
INNER JOIN historias_clinicas hc ON p.id = hc.id_paciente
INNER JOIN doctores d ON hc.id_doctor = d.id
INNER JOIN usuarios u ON d.id_usuario = u.id
WHERE p.estado = 'activo'

UNION ALL

SELECT
    p.id AS paciente_id,
    p.nombre_mascota,
    'vacuna' AS tipo_registro,
    v.id AS registro_id,
    v.fecha_aplicacion AS fecha,
    CONCAT('Vacuna: ', v.tipo_vacuna) AS descripcion,
    NULL AS veterinario,
    NULL AS diagnostico,
    CONCAT('Próxima: ', IFNULL(v.fecha_proxima, 'No programada')) AS tratamiento
FROM pacientes p
INNER JOIN vacunas v ON p.id = v.id_paciente
WHERE p.estado = 'activo'

UNION ALL

SELECT
    p.id AS paciente_id,
    p.nombre_mascota,
    'desparasitacion' AS tipo_registro,
    dp.id AS registro_id,
    dp.fecha_aplicacion AS fecha,
    CONCAT('Desparasitación: ', dp.producto) AS descripcion,
    NULL AS veterinario,
    NULL AS diagnostico,
    CONCAT('Próxima: ', IFNULL(dp.fecha_proxima, 'No programada')) AS tratamiento
FROM pacientes p
INNER JOIN desparasitaciones dp ON p.id = dp.id_paciente
WHERE p.estado = 'activo'

UNION ALL

SELECT
    p.id AS paciente_id,
    p.nombre_mascota,
    'cirugia' AS tipo_registro,
    cp.id AS registro_id,
    cp.fecha_realizacion AS fecha,
    CONCAT(
        CASE cp.tipo
            WHEN 'cirugia' THEN 'Cirugía: '
            WHEN 'procedimiento' THEN 'Procedimiento: '
        END,
        cp.nombre
    ) AS descripcion,
    CONCAT(u.nombre, ' ', u.apellidos) AS veterinario,
    cp.resultado AS diagnostico,
    cp.notas_postoperatorias AS tratamiento
FROM pacientes p
INNER JOIN cirugias_procedimientos cp ON p.id = cp.id_paciente
INNER JOIN doctores d ON cp.id_doctor = d.id
INNER JOIN usuarios u ON d.id_usuario = u.id
WHERE p.estado = 'activo'

ORDER BY fecha DESC;

-- Vista para alergias activas
DROP VIEW IF EXISTS `vista_alergias_activas`;

CREATE VIEW `vista_alergias_activas` AS
SELECT
    p.id AS paciente_id,
    p.nombre_mascota,
    a.tipo_alergia,
    a.nombre_alergeno,
    a.severidad,
    a.sintomas,
    a.fecha_deteccion,
    CONCAT(pr.nombre, ' ', pr.apellidos) AS propietario
FROM pacientes p
INNER JOIN alergias a ON p.id = a.id_paciente
INNER JOIN propietarios pr ON p.id_propietario = pr.id
WHERE p.estado = 'activo' AND a.activa = 1
ORDER BY a.severidad DESC, p.nombre_mascota;

-- =====================================================
-- 7. DATOS DE EJEMPLO (OPCIONAL - COMENTADO)
-- =====================================================

-- Descomentar si quieres datos de prueba

/*
-- Ejemplo de alergia
INSERT INTO alergias (id_paciente, tipo_alergia, nombre_alergeno, severidad, sintomas, fecha_deteccion)
VALUES (1, 'medicamento', 'Penicilina', 'severa', 'Reacción cutánea, dificultad respiratoria', '2024-01-15');

-- Ejemplo de cirugía
INSERT INTO cirugias_procedimientos
(id_paciente, id_doctor, tipo, nombre, fecha_realizacion, duracion_minutos, anestesia_utilizada, descripcion, resultado)
VALUES
(1, 1, 'cirugia', 'Esterilización', '2024-03-20 10:00:00', 45, 'Isoflurano', 'Ovariohisterectomía rutinaria', 'exitoso');

-- Ejemplo de examen de laboratorio
INSERT INTO examenes_laboratorio
(id_paciente, id_historia_clinica, tipo_examen, nombre_examen, fecha_solicitud, estado)
VALUES
(1, 1, 'hemograma', 'Hemograma completo', CURDATE(), 'solicitado');
*/

-- =====================================================
-- SCRIPT COMPLETADO
-- =====================================================
-- Ejecuta este script para agregar las mejoras al
-- sistema de historial clínico veterinario
