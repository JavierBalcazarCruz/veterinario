-- ============================================================================
-- SCRIPT DE VERIFICACIÓN - TABLAS DE ESTÉTICA
-- Ejecuta este script para verificar si las tablas existen
-- ============================================================================

-- 1. Verificar si existen las tablas
SELECT
    'citas_estetica' AS tabla,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END AS estado
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name = 'citas_estetica'

UNION ALL

SELECT
    'perfiles_estetica' AS tabla,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END AS estado
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name = 'perfiles_estetica'

UNION ALL

SELECT
    'galeria_estetica' AS tabla,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END AS estado
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name = 'galeria_estetica'

UNION ALL

SELECT
    'horarios_trabajo' AS tabla,
    CASE
        WHEN COUNT(*) > 0 THEN '✅ EXISTE'
        ELSE '❌ NO EXISTE'
    END AS estado
FROM information_schema.tables
WHERE table_schema = DATABASE()
AND table_name = 'horarios_trabajo';

-- 2. Ver estructura de citas_estetica (si existe)
SHOW CREATE TABLE citas_estetica;

-- 3. Ver columnas de citas_estetica (si existe)
DESCRIBE citas_estetica;
