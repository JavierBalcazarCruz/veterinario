-- Script rápido para verificar si las tablas existen
SELECT
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME IN ('citas_estetica', 'perfiles_estetica', 'galeria_estetica', 'horarios_trabajo')
ORDER BY TABLE_NAME;

-- Ver columnas de citas_estetica
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = 'citas_estetica'
ORDER BY ORDINAL_POSITION;
