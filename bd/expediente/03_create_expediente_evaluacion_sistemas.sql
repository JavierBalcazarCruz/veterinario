-- =====================================================
-- TABLA: expediente_evaluacion_sistemas
-- Descripción: Evaluación de sistemas corporales del paciente
-- Relacionada con: expedientes_clinicos
-- =====================================================

CREATE TABLE IF NOT EXISTS `expediente_evaluacion_sistemas` (
  `id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_expediente` BIGINT(20) UNSIGNED NOT NULL COMMENT 'Referencia al expediente',

  -- Sistema: Come
  `come` VARCHAR(255) NULL COMMENT 'Observaciones sobre alimentación',
  `come_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Bebe
  `bebe` VARCHAR(255) NULL COMMENT 'Observaciones sobre hidratación',
  `bebe_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Orina
  `orina` VARCHAR(255) NULL COMMENT 'Observaciones sobre micción',
  `orina_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Defeca
  `defeca` VARCHAR(255) NULL COMMENT 'Observaciones sobre defecación',
  `defeca_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Piel
  `piel` VARCHAR(255) NULL COMMENT 'Observaciones sobre estado de la piel',
  `piel_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Mucosas
  `mucosas` VARCHAR(255) NULL COMMENT 'Observaciones sobre mucosas',
  `mucosas_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Linfonodos
  `linfonodos` VARCHAR(255) NULL COMMENT 'Observaciones sobre linfonodos',
  `linfonodos_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Circulatorio
  `circulatorio` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema circulatorio',
  `circulatorio_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Respiratorio
  `respiratorio` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema respiratorio',
  `respiratorio_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Digestivo
  `digestivo` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema digestivo',
  `digestivo_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Urinario
  `urinario` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema urinario',
  `urinario_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Reproductor
  `reproductor` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema reproductor',
  `reproductor_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Locomotor
  `locomotor` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema locomotor',
  `locomotor_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Nervioso
  `nervioso` VARCHAR(255) NULL COMMENT 'Observaciones sobre sistema nervioso',
  `nervioso_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Sistema: Ojos y Oído
  `ojos_oido` VARCHAR(255) NULL COMMENT 'Observaciones sobre ojos y oídos',
  `ojos_oido_normal` ENUM('N', 'A') DEFAULT 'N' COMMENT 'N=Normal, A=Anormal',

  -- Campos de auditoría
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_expediente_evaluacion` (`id_expediente`),
  KEY `idx_expediente` (`id_expediente`),

  CONSTRAINT `fk_evaluacion_expediente`
    FOREIGN KEY (`id_expediente`)
    REFERENCES `expedientes_clinicos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluación de sistemas corporales en expedientes clínicos';
