-- =====================================================
-- TABLA: expediente_signos_vitales
-- Descripción: Signos vitales y parámetros físicos del paciente
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_signos_vitales` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',

  -- Signos vitales
  `dh` VARCHAR(100) NULL COMMENT 'Deshidratación - estado o porcentaje',
  `fc` VARCHAR(50) NULL COMMENT 'Frecuencia Cardiaca (latidos/min)',
  `cc` VARCHAR(100) NULL COMMENT 'Condición Corporal (escala 1-9)',
  `fr` VARCHAR(50) NULL COMMENT 'Frecuencia Respiratoria (respiraciones/min)',
  `tllc` VARCHAR(50) NULL COMMENT 'Tiempo de Llenado Capilar (segundos)',
  `rt` VARCHAR(100) NULL COMMENT 'Reflejo Tusígeno (presente/ausente)',
  `rd` VARCHAR(100) NULL COMMENT 'Respuesta al Dolor (escala 0-10)',
  `ps_pd` VARCHAR(50) NULL COMMENT 'Presión Sistólica/Diastólica (mmHg) - Ej: 120/80',
  `pam` VARCHAR(50) NULL COMMENT 'Presión Arterial Media (mmHg)',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_expediente_signos` (`id_expediente`),
  KEY `idx_expediente` (`id_expediente`),

  CONSTRAINT `fk_signos_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Signos vitales y parámetros físicos de expedientes clínicos';
