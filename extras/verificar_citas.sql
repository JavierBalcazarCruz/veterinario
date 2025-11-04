-- Script de verificación para diagnosticar problemas con citas

-- 1. Verificar que las tablas existen
SHOW TABLES LIKE 'citas%';

-- 2. Verificar estructura de tabla citas
DESCRIBE citas;

-- 3. Contar citas totales
SELECT COUNT(*) as total_citas FROM citas;

-- 4. Ver citas con detalles
SELECT
    c.id,
    c.fecha,
    c.hora,
    c.estado,
    c.tipo_consulta,
    c.id_doctor,
    c.id_paciente,
    p.nombre_mascota,
    CONCAT(pr.nombre, ' ', COALESCE(pr.apellidos, '')) as propietario
FROM citas c
LEFT JOIN pacientes p ON c.id_paciente = p.id
LEFT JOIN propietarios pr ON p.id_propietario = pr.id
ORDER BY c.fecha DESC, c.hora DESC
LIMIT 10;

-- 5. Verificar fechas de citas
SELECT
    CURDATE() as fecha_hoy,
    MIN(fecha) as fecha_mas_antigua,
    MAX(fecha) as fecha_mas_reciente,
    COUNT(CASE WHEN fecha >= CURDATE() THEN 1 END) as citas_futuras,
    COUNT(CASE WHEN fecha < CURDATE() THEN 1 END) as citas_pasadas
FROM citas;

-- 6. Verificar estados de citas
SELECT estado, COUNT(*) as cantidad
FROM citas
GROUP BY estado;

-- 7. Verificar relación con doctores
SELECT
    c.id_doctor,
    d.id as doctor_exists,
    u.nombre as doctor_nombre,
    COUNT(*) as num_citas
FROM citas c
LEFT JOIN doctores d ON c.id_doctor = d.id
LEFT JOIN usuarios u ON d.id_usuario = u.id
GROUP BY c.id_doctor;

-- 8. Verificar citas próximas (lo que debería ver el frontend)
SELECT
    c.id,
    c.fecha,
    c.hora,
    c.estado,
    p.nombre_mascota
FROM citas c
INNER JOIN pacientes p ON c.id_paciente = p.id
WHERE c.fecha >= CURDATE()
AND c.estado IN ('programada', 'confirmada')
ORDER BY c.fecha ASC, c.hora ASC
LIMIT 5;
