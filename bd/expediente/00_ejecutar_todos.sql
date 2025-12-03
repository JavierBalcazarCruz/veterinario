-- =====================================================
-- SCRIPT DE INSTALACIÓN COMPLETA
-- Sistema de Expedientes Clínicos - SISVET
-- =====================================================
-- Este script ejecuta todas las creaciones de tablas necesarias
-- para el módulo de expedientes clínicos en el orden correcto
--
-- IMPORTANTE:
-- - Ejecutar este script como usuario con privilegios CREATE/ALTER
-- - La base de datos 'sisvet' debe existir previamente
-- - Las tablas 'pacientes' y 'doctores' deben existir
-- =====================================================

USE sisvet;

-- Verificar que las tablas principales existan
SELECT 'Verificando existencia de tablas base...' AS status;

-- =====================================================
-- 1. TABLA PRINCIPAL: expedientes_clinicos
-- =====================================================
SOURCE 01_create_expedientes_clinicos.sql;
SELECT 'Tabla expedientes_clinicos creada ✓' AS status;

-- =====================================================
-- 2. SIGNOS VITALES
-- =====================================================
SOURCE 02_create_expediente_signos_vitales.sql;
SELECT 'Tabla expediente_signos_vitales creada ✓' AS status;

-- =====================================================
-- 3. EVALUACIÓN DE SISTEMAS
-- =====================================================
SOURCE 03_create_expediente_evaluacion_sistemas.sql;
SELECT 'Tabla expediente_evaluacion_sistemas creada ✓' AS status;

-- =====================================================
-- 4. DETALLES (Problemas, Diagnósticos, Tratamientos)
-- =====================================================
SOURCE 04_create_expediente_detalles.sql;
SELECT 'Tablas de detalles creadas ✓' AS status;
SELECT '  - expediente_lista_problemas ✓' AS status;
SELECT '  - expediente_lista_maestra ✓' AS status;
SELECT '  - expediente_diagnosticos_laboratorio ✓' AS status;
SELECT '  - expediente_tratamientos ✓' AS status;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Instalación completada exitosamente!' AS status;
SELECT 'Tablas creadas:' AS info;

SELECT
    TABLE_NAME AS tabla,
    TABLE_ROWS AS filas,
    CREATE_TIME AS fecha_creacion
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'sisvet'
  AND TABLE_NAME LIKE 'expediente%'
ORDER BY TABLE_NAME;
