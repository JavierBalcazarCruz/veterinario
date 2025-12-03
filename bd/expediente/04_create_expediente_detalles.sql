-- =====================================================
-- TABLA: expediente_lista_problemas
-- Descripción: Lista de problemas identificados en el expediente
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_lista_problemas` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',
  `orden` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden del problema (1-5)',
  `descripcion` VARCHAR(500) NULL COMMENT 'Descripción del problema',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`id_expediente`),
  KEY `idx_orden` (`orden`),

  CONSTRAINT `fk_problemas_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lista de problemas identificados en expedientes clínicos';


-- =====================================================
-- TABLA: expediente_lista_maestra
-- Descripción: Diagnósticos presuntivos (Lista Maestra)
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_lista_maestra` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',
  `orden` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden del diagnóstico (1-5)',
  `diagnostico_presuntivo` VARCHAR(500) NULL COMMENT 'Diagnóstico presuntivo',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`id_expediente`),
  KEY `idx_orden` (`orden`),

  CONSTRAINT `fk_lista_maestra_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lista maestra de diagnósticos presuntivos en expedientes clínicos';


-- =====================================================
-- TABLA: expediente_diagnosticos_laboratorio
-- Descripción: Diagnósticos basados en resultados de laboratorio
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_diagnosticos_laboratorio` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',
  `orden` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden del diagnóstico (1-5)',
  `diagnostico` VARCHAR(500) NULL COMMENT 'Diagnóstico de laboratorio',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`id_expediente`),
  KEY `idx_orden` (`orden`),

  CONSTRAINT `fk_dx_laboratorio_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Diagnósticos de laboratorio en expedientes clínicos';


-- =====================================================
-- TABLA: expediente_tratamientos
-- Descripción: Tratamientos en instalaciones y recetas
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_tratamientos` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',
  `orden` TINYINT UNSIGNED NOT NULL DEFAULT 1 COMMENT 'Orden del tratamiento (1-5)',
  `tratamiento` VARCHAR(500) NULL COMMENT 'Medicamento, dosis y ml',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_expediente` (`id_expediente`),
  KEY `idx_orden` (`orden`),

  CONSTRAINT `fk_tratamientos_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tratamientos y recetas en expedientes clínicos';
