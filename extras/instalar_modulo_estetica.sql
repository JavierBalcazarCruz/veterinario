-- ============================================================================
-- INSTALACIÓN RÁPIDA - MÓDULO DE ESTÉTICA
-- Ejecuta este script para crear las tablas necesarias
-- ============================================================================

-- 1. CREAR TABLA DE CITAS DE ESTÉTICA
CREATE TABLE IF NOT EXISTS `citas_estetica` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_paciente` BIGINT UNSIGNED NOT NULL,
  `id_estilista` BIGINT UNSIGNED NULL,
  `fecha` DATE NOT NULL,
  `hora` TIME NOT NULL,
  `tipo_servicio` ENUM(
    'baño',
    'corte',
    'baño_corte',
    'uñas',
    'limpieza_dental',
    'spa_premium',
    'deslanado',
    'tratamiento_pulgas',
    'otro'
  ) NOT NULL DEFAULT 'baño',
  `estado` ENUM(
    'programada',
    'confirmada',
    'en_proceso',
    'completada',
    'cancelada',
    'no_asistio'
  ) NOT NULL DEFAULT 'programada',
  `estilo_corte` VARCHAR(100) NULL COMMENT 'Descripción del estilo de corte preferido',
  `productos_usados` TEXT NULL COMMENT 'Lista de productos utilizados en el servicio',
  `raza_especifica` VARCHAR(50) NULL COMMENT 'Raza del paciente para referencia',
  `tamaño` ENUM('pequeño', 'mediano', 'grande', 'gigante') NULL,
  `duracion_estimada` INT DEFAULT 60 COMMENT 'Duración estimada en minutos',
  `duracion_real` INT NULL COMMENT 'Duración real del servicio en minutos',
  `precio` DECIMAL(10,2) NULL,
  `notas` TEXT NULL COMMENT 'Notas generales del cliente o estilista',
  `notas_comportamiento` TEXT NULL COMMENT 'Comportamiento de la mascota durante el servicio',
  `foto_antes` VARCHAR(255) NULL,
  `foto_despues` VARCHAR(255) NULL,
  `motivo_cancelacion` TEXT NULL,
  `confirmada_por_cliente` BOOLEAN DEFAULT FALSE,
  `fecha_confirmacion` TIMESTAMP NULL,
  `recordatorio_enviado` BOOLEAN DEFAULT FALSE,
  `fecha_recordatorio` TIMESTAMP NULL,
  `cliente_notificado_finalizacion` BOOLEAN DEFAULT FALSE COMMENT 'Si se notificó al cliente que terminó el servicio',
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`id_paciente`),
  KEY `idx_estilista` (`id_estilista`),
  KEY `idx_fecha_hora` (`fecha`, `hora`),
  KEY `idx_estado` (`estado`),
  KEY `idx_tipo_servicio` (`tipo_servicio`),
  KEY `idx_fecha_estado` (`fecha`, `estado`),
  CONSTRAINT `fk_citas_estetica_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_citas_estetica_estilista` FOREIGN KEY (`id_estilista`) REFERENCES `doctores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabla para gestionar citas de servicios de estética y grooming';

-- 2. CREAR TABLA DE PERFILES DE ESTILO
CREATE TABLE IF NOT EXISTS `perfiles_estetica` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_paciente` BIGINT UNSIGNED NOT NULL,
  `estilo_preferido` VARCHAR(100) NULL,
  `largo_preferido` ENUM('muy_corto', 'corto', 'medio', 'largo') DEFAULT 'medio',
  `productos_favoritos` TEXT NULL COMMENT 'Productos que le gustan',
  `productos_evitar` TEXT NULL COMMENT 'Productos que causan reacción o no le gustan',
  `sensibilidades` TEXT NULL COMMENT 'Sensibilidades: piel sensible, miedo al secador, etc.',
  `preferencias_especiales` TEXT NULL COMMENT 'Cualquier otra preferencia especial',
  `frecuencia_recomendada_dias` INT DEFAULT 30 COMMENT 'Frecuencia recomendada en días',
  `ultima_actualizacion` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_paciente` (`id_paciente`),
  CONSTRAINT `fk_perfil_estetica_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Perfiles de preferencias de estética para cada mascota';

-- 3. CREAR TABLA DE GALERÍA DE FOTOS
CREATE TABLE IF NOT EXISTS `galeria_estetica` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_cita_estetica` BIGINT UNSIGNED NOT NULL,
  `id_paciente` BIGINT UNSIGNED NOT NULL,
  `tipo_foto` ENUM('antes', 'durante', 'despues') NOT NULL,
  `url_foto` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cita` (`id_cita_estetica`),
  KEY `idx_paciente` (`id_paciente`),
  KEY `idx_tipo` (`tipo_foto`),
  CONSTRAINT `fk_galeria_cita` FOREIGN KEY (`id_cita_estetica`) REFERENCES `citas_estetica` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_galeria_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `pacientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Galería de fotos before/after de servicios de estética';

-- 4. CREAR TABLA DE HORARIOS DE TRABAJO (si no existe)
CREATE TABLE IF NOT EXISTS `horarios_trabajo` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_doctor` BIGINT UNSIGNED NULL COMMENT 'NULL = aplica a todos',
  `dia_semana` ENUM('lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo') NOT NULL,
  `hora_inicio` TIME NOT NULL,
  `hora_fin` TIME NOT NULL,
  `tipo` ENUM('medico', 'estetica', 'ambos') DEFAULT 'ambos',
  `activo` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_doctor` (`id_doctor`),
  KEY `idx_dia` (`dia_semana`),
  CONSTRAINT `fk_horarios_doctor` FOREIGN KEY (`id_doctor`) REFERENCES `doctores` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Horarios de trabajo de doctores/estilistas';

-- 5. INSERTAR HORARIOS DE TRABAJO POR DEFECTO (si la tabla está vacía)
INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'lunes', '08:00:00', '18:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'lunes' AND id_doctor IS NULL);

INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'martes', '08:00:00', '18:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'martes' AND id_doctor IS NULL);

INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'miercoles', '08:00:00', '18:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'miercoles' AND id_doctor IS NULL);

INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'jueves', '08:00:00', '18:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'jueves' AND id_doctor IS NULL);

INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'viernes', '08:00:00', '18:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'viernes' AND id_doctor IS NULL);

INSERT INTO `horarios_trabajo` (`id_doctor`, `dia_semana`, `hora_inicio`, `hora_fin`, `tipo`, `activo`)
SELECT NULL, 'sabado', '09:00:00', '14:00:00', 'ambos', TRUE
WHERE NOT EXISTS (SELECT 1 FROM horarios_trabajo WHERE dia_semana = 'sabado' AND id_doctor IS NULL);

-- 6. VERIFICAR LA INSTALACIÓN
SELECT '✅ Instalación completada exitosamente' AS mensaje;

SELECT
    'citas_estetica' AS tabla,
    COUNT(*) AS registros
FROM citas_estetica

UNION ALL

SELECT
    'perfiles_estetica' AS tabla,
    COUNT(*) AS registros
FROM perfiles_estetica

UNION ALL

SELECT
    'galeria_estetica' AS tabla,
    COUNT(*) AS registros
FROM galeria_estetica

UNION ALL

SELECT
    'horarios_trabajo' AS tabla,
    COUNT(*) AS registros
FROM horarios_trabajo;
