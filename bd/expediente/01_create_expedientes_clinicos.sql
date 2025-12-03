-- =====================================================
-- TABLA: expedientes_clinicos
-- Descripción: Tabla principal para el registro de expedientes clínicos
-- Relacionada con: pacientes, doctores
-- =====================================================

CREATE TABLE IF NOT EXISTS `expedientes_clinicos` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_paciente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al paciente',
  `id_doctor` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Veterinario que atiende',
  `fecha_consulta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha y hora de la consulta',
  `motivo_consulta` TEXT NULL COMMENT 'Motivo de la consulta',

  -- Estudios de laboratorio (texto libre)
  `estudios_laboratorio` TEXT NULL COMMENT 'Estudios de laboratorio solicitados o resultados',

  -- Diagnóstico final (texto libre)
  `diagnostico_final` TEXT NULL COMMENT 'Diagnóstico final del paciente',

  -- Observaciones generales
  `observaciones` TEXT NULL COMMENT 'Observaciones adicionales',

  -- Estado del expediente
  `estado` ENUM('borrador', 'completado', 'revisado', 'archivado') DEFAULT 'borrador' COMMENT 'Estado del expediente',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_paciente` (`id_paciente`),
  KEY `idx_doctor` (`id_doctor`),
  KEY `idx_fecha` (`fecha_consulta`),
  KEY `idx_estado` (`estado`),

  CONSTRAINT `fk_expediente_paciente`
    FOREIGN KEY (`id_paciente`)
    REFERENCES `pacientes` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `fk_expediente_doctor`
    FOREIGN KEY (`id_doctor`)
    REFERENCES `doctores` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de expedientes clínicos de pacientes';
