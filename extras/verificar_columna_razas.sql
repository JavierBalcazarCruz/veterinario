-- Ver todas las columnas de la tabla razas
DESCRIBE razas;

-- Ver estructura completa
SHOW CREATE TABLE razas;

-- Ver si existe una columna similar a tamaño
SELECT COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'sisvet'
AND TABLE_NAME = 'razas'
AND (COLUMN_NAME LIKE '%tama%' OR COLUMN_NAME LIKE '%size%');
