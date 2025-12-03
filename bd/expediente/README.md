# 📋 Sistema de Expedientes Clínicos - SISVET

## 📁 Estructura de Base de Datos

Este directorio contiene los scripts SQL para la creación del sistema completo de expedientes clínicos veterinarios.

## 🗂️ Archivos SQL

| Archivo | Descripción |
|---------|-------------|
| `00_ejecutar_todos.sql` | Script maestro que ejecuta todos los archivos en orden |
| `01_create_expedientes_clinicos.sql` | Tabla principal de expedientes |
| `02_create_expediente_signos_vitales.sql` | Signos vitales (DH, FC, CC, FR, etc.) |
| `03_create_expediente_evaluacion_sistemas.sql` | Evaluación por sistemas corporales |
| `04_create_expediente_detalles.sql` | Listas de problemas, diagnósticos y tratamientos |

## 📊 Diagrama de Tablas

```
expedientes_clinicos (TABLA PRINCIPAL)
├── id_paciente → pacientes.id
├── id_doctor → doctores.id
│
├── expediente_signos_vitales (1:1)
│   ├── dh (Deshidratación)
│   ├── fc (Frecuencia Cardiaca)
│   ├── cc (Condición Corporal)
│   ├── fr (Frecuencia Respiratoria)
│   ├── tllc (Tiempo Llenado Capilar)
│   ├── rt (Reflejo Tusígeno)
│   ├── rd (Respuesta al Dolor)
│   ├── ps_pd (Presión Sistólica/Diastólica)
│   └── pam (Presión Arterial Media)
│
├── expediente_evaluacion_sistemas (1:1)
│   ├── come / come_normal
│   ├── bebe / bebe_normal
│   ├── orina / orina_normal
│   ├── defeca / defeca_normal
│   ├── piel / piel_normal
│   ├── mucosas / mucosas_normal
│   ├── linfonodos / linfonodos_normal
│   ├── circulatorio / circulatorio_normal
│   ├── respiratorio / respiratorio_normal
│   ├── digestivo / digestivo_normal
│   ├── urinario / urinario_normal
│   ├── reproductor / reproductor_normal
│   ├── locomotor / locomotor_normal
│   ├── nervioso / nervioso_normal
│   └── ojos_oido / ojos_oido_normal
│
├── expediente_lista_problemas (1:N)
│   └── orden, descripcion
│
├── expediente_lista_maestra (1:N)
│   └── orden, diagnostico_presuntivo
│
├── expediente_diagnosticos_laboratorio (1:N)
│   └── orden, diagnostico
│
└── expediente_tratamientos (1:N)
    └── orden, tratamiento
```

## 🚀 Instalación

### Opción 1: Ejecutar todo de una vez
```bash
mysql -u usuario -p sisvet < 00_ejecutar_todos.sql
```

### Opción 2: Ejecutar archivos individuales
```bash
mysql -u usuario -p sisvet < 01_create_expedientes_clinicos.sql
mysql -u usuario -p sisvet < 02_create_expediente_signos_vitales.sql
mysql -u usuario -p sisvet < 03_create_expediente_evaluacion_sistemas.sql
mysql -u usuario -p sisvet < 04_create_expediente_detalles.sql
```

## 📝 Descripción de Tablas

### 1. **expedientes_clinicos** (Tabla Principal)
Almacena la información básica del expediente.

**Campos principales:**
- `id_paciente`: Referencia al paciente
- `id_doctor`: Veterinario que atiende
- `fecha_consulta`: Fecha y hora de la consulta
- `estudios_laboratorio`: Estudios solicitados (texto libre)
- `diagnostico_final`: Diagnóstico final (texto libre)
- `estado`: borrador, completado, revisado, archivado

### 2. **expediente_signos_vitales**
Almacena los signos vitales y parámetros físicos del paciente.

**Relación:** 1:1 con expedientes_clinicos

**Campos:** DH, FC, CC, FR, TLLC, RT, RD, PS/PD, PAM

### 3. **expediente_evaluacion_sistemas**
Evaluación de 15 sistemas corporales con indicador Normal/Anormal.

**Relación:** 1:1 con expedientes_clinicos

**Sistemas evaluados:**
- Come, Bebe, Orina, Defeca
- Piel, Mucosas, Linfonodos
- Circulatorio, Respiratorio, Digestivo
- Urinario, Reproductor, Locomotor
- Nervioso, Ojos y Oído

### 4. **expediente_lista_problemas**
Lista de problemas identificados (hasta 5 por expediente).

**Relación:** 1:N con expedientes_clinicos

### 5. **expediente_lista_maestra**
Diagnósticos presuntivos (hasta 5 por expediente).

**Relación:** 1:N con expedientes_clinicos

### 6. **expediente_diagnosticos_laboratorio**
Diagnósticos basados en resultados de laboratorio (hasta 5).

**Relación:** 1:N con expedientes_clinicos

### 7. **expediente_tratamientos**
Tratamientos en instalaciones y recetas (hasta 5).

**Relación:** 1:N con expedientes_clinicos

## 🔐 Características de Seguridad

- **Foreign Keys:** Todas las tablas tienen restricciones de integridad referencial
- **Cascade Delete:** Al eliminar un expediente, se eliminan automáticamente todos sus datos relacionados
- **Índices:** Optimizados para consultas frecuentes (paciente, doctor, fecha)
- **Charset:** utf8mb4_unicode_ci para soporte completo de caracteres Unicode

## 📋 Ejemplo de Uso en Backend

### Crear Expediente Completo
```javascript
// 1. Insertar expediente principal
const [result] = await connection.execute(
  `INSERT INTO expedientes_clinicos
   (id_paciente, id_doctor, estudios_laboratorio, diagnostico_final)
   VALUES (?, ?, ?, ?)`,
  [pacienteId, doctorId, estudiosLab, diagnosticoFinal]
);

const expedienteId = result.insertId;

// 2. Insertar signos vitales
await connection.execute(
  `INSERT INTO expediente_signos_vitales
   (id_expediente, dh, fc, cc, fr, tllc, rt, rd, ps_pd, pam)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [expedienteId, dh, fc, cc, fr, tllc, rt, rd, ps_pd, pam]
);

// 3. Insertar evaluación de sistemas
await connection.execute(
  `INSERT INTO expediente_evaluacion_sistemas
   (id_expediente, come, come_normal, bebe, bebe_normal, ...)
   VALUES (?, ?, ?, ?, ?, ...)`,
  [expedienteId, come, comeNormal, bebe, bebeNormal, ...]
);

// 4. Insertar listas (problemas, diagnósticos, tratamientos)
for (let i = 0; i < listaProblemas.length; i++) {
  if (listaProblemas[i].trim()) {
    await connection.execute(
      `INSERT INTO expediente_lista_problemas (id_expediente, orden, descripcion)
       VALUES (?, ?, ?)`,
      [expedienteId, i + 1, listaProblemas[i]]
    );
  }
}
```

### Consultar Expediente Completo
```sql
SELECT
  e.*,
  sv.*,
  es.*,
  p.nombre_mascota,
  d.nombre AS nombre_doctor
FROM expedientes_clinicos e
LEFT JOIN expediente_signos_vitales sv ON e.id = sv.id_expediente
LEFT JOIN expediente_evaluacion_sistemas es ON e.id = es.id_expediente
LEFT JOIN pacientes p ON e.id_paciente = p.id
LEFT JOIN doctores d ON e.id_doctor = d.id
WHERE e.id = ?;

-- Obtener listas relacionadas
SELECT * FROM expediente_lista_problemas WHERE id_expediente = ? ORDER BY orden;
SELECT * FROM expediente_lista_maestra WHERE id_expediente = ? ORDER BY orden;
SELECT * FROM expediente_diagnosticos_laboratorio WHERE id_expediente = ? ORDER BY orden;
SELECT * FROM expediente_tratamientos WHERE id_expediente = ? ORDER BY orden;
```

## ⚠️ Notas Importantes

1. **Requisitos previos:** Las tablas `pacientes` y `doctores` deben existir antes de ejecutar estos scripts
2. **Backup:** Siempre hacer backup antes de modificar la estructura de la base de datos
3. **Permisos:** El usuario debe tener privilegios CREATE, ALTER, DROP
4. **Charset:** Asegurar que la base de datos use utf8mb4 para evitar problemas con caracteres especiales

## 📅 Fecha de Creación
Diciembre 3, 2025

## 👨‍💻 Desarrollado para
Sistema de Veterinaria (SISVET)
