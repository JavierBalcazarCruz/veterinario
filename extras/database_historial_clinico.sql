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
