# 🧪 Guía de Testing - Sistema de Citas MollyVet

## Índice
1. [Preparación Inicial](#preparación-inicial)
2. [Testing Sistema de Citas Médicas](#1-testing-sistema-de-citas-médicas)
3. [Testing Sistema de Estética](#2-testing-sistema-de-estética)
4. [Testing Sistema de Emails](#3-testing-sistema-de-emails)
5. [Testing Integración Calendarios](#4-testing-integración-calendarios)
6. [Testing Cron Jobs](#5-testing-cron-jobs-automatización)
7. [Checklist Final](#checklist-final-de-validación)

---

## Preparación Inicial

### 1. Ejecutar Migración de Base de Datos
```bash
# En MySQL Workbench o tu cliente MySQL preferido
# Ejecutar el archivo: database_migration_citas.sql
```

**Verificar tablas creadas:**
```sql
SHOW TABLES LIKE 'citas%';
SHOW TABLES LIKE '%estetica%';
DESCRIBE citas;
```

### 2. Verificar Backend Corriendo
```bash
cd backend
npm start
```

**Debe mostrar:**
```
✅ Servidor iniciado en puerto 3000
✅ Base de datos conectada
🔄 Cron jobs iniciados:
   - Job de recordatorios programado (9:00 AM diario)
   - Job de limpieza programado (2:00 AM diario)
   - Job de estadísticas programado (Lunes 8:00 AM)
```

### 3. Verificar Frontend Corriendo
```bash
cd frontend
npm run dev
```

**Debe mostrar:**
```
Local: http://localhost:5173/
```

### 4. Abrir Consola del Navegador
`F12` o `Ctrl+Shift+I` → Pestaña Console

---

## 1. Testing Sistema de Citas Médicas

### Test 1.1: Ver Citas en Dashboard ✅

**Pasos:**
1. Inicia sesión en el sistema
2. Ve al Dashboard (página principal)
3. Busca la sección "Próximas Citas"

**✅ Debe mostrar:**
- Las próximas 3 citas del día actual
- Hora de cada cita
- Nombre del paciente con foto/emoji
- Nombre del propietario
- Tipo de consulta con icono (🆕📋🚨💉)
- Estado (Programada/Confirmada)
- Barra de progreso animada
- Contador: "X Pendientes", "X Confirmadas"

**🔍 En consola debe aparecer:**
```javascript
✅ Próximas citas encontradas: 2
📅 Primera cita: { id: 2, fecha: '2025-10-31', hora: '08:00:00', mascota: 'Ambrosio' }
```

**📷 Captura de pantalla:** `test_dashboard_citas.png`

---

### Test 1.2: Ver Página de Citas - Vista Lista ✅

**Pasos:**
1. Click en el menú lateral → "Citas"
2. Verifica que estés en vista "Lista"
3. Observa las citas del día seleccionado

**✅ Debe mostrar:**
- Selector de fecha (día actual por defecto)
- Botones "← →" para navegar días
- Botón "Hoy" para regresar a hoy
- Lista de citas con:
  - Hora y duración
  - Foto del paciente
  - Nombre del paciente
  - Propietario
  - Tipo de consulta
  - Estado con badge de color
  - Botones de acción al hacer hover

**🔍 En consola debe aparecer:**
```javascript
✅ Citas cargadas en frontend: 2
```

**🧪 Pruebas adicionales:**
- Click en "→" para ver día siguiente
- Click en "←" para ver día anterior
- Click en "Hoy" para regresar

**📷 Captura:** `test_citas_lista.png`

---

### Test 1.3: Ver Página de Citas - Vista Calendario ✅

**Pasos:**
1. En la página de Citas
2. Click en botón "Calendario"
3. Observa el calendario mensual

**✅ Debe mostrar:**
- Calendario del mes actual
- Días con citas marcados con indicador visual
- Al hacer click en un día → muestra citas de ese día
- Navegación mes anterior/siguiente

**🧪 Pruebas:**
- Click en diferentes días del calendario
- Navega a mes anterior/siguiente
- Verifica que los indicadores de citas sean correctos

**📷 Captura:** `test_citas_calendario.png`

---

### Test 1.4: Filtros y Búsqueda ✅

**Pasos:**
1. En página de Citas
2. Usa la barra de búsqueda
3. Prueba los filtros de estado

**✅ Tests de búsqueda:**
```
1. Escribe "Ambrosio" → debe filtrar por nombre de paciente
2. Escribe parte del nombre del propietario → debe filtrar
3. Borra búsqueda → debe mostrar todas las citas
```

**✅ Tests de filtros de estado:**
```
1. Click en "Programadas" → solo muestra programadas
2. Click en "Confirmadas" → solo confirmadas
3. Click en "En Curso" → solo en curso
4. Click en "Todas" → muestra todas
```

**📷 Captura:** `test_filtros_busqueda.png`

---

### Test 1.5: Crear Nueva Cita ✅

**Pasos:**
1. Click en botón "Nueva Cita" (header o botón flotante móvil)
2. Se abre modal "Nueva Cita"

**✅ Verificar campos del formulario:**
- Campo "Paciente" con búsqueda
- Campo "Fecha" (no permite fechas pasadas)
- Campo "Hora" (selector)
- Campo "Tipo de consulta" (4 opciones)
- Campo "Notas" (opcional)

**🧪 Crear una cita de prueba:**

```
Paciente: [Selecciona un paciente existente]
Fecha: Mañana (usa el date picker)
Hora: 10:00 AM
Tipo: Primera Vez
Notas: "Prueba de sistema"
```

**✅ Al dar click en "Crear Cita" debe:**
1. Mostrar toast de éxito: ✅ "Cita creada exitosamente"
2. Cerrar el modal
3. Recargar lista de citas
4. Mostrar la nueva cita en la lista

**🔍 En consola del navegador:**
```javascript
Datos de cita enviados al backend: {
  id_paciente: 1,
  fecha: "2025-11-01",
  hora: "10:00",
  tipo_consulta: "primera_vez",
  notas: "Prueba de sistema"
}
✅ Citas recargadas después de agregar: 3
```

**🔍 En consola del backend:**
```javascript
🆕 Creando nueva cita para paciente ID: 1
✅ Cita creada con ID: 3
📧 Enviando email de confirmación...
```

**📷 Capturas:**
- `test_modal_nueva_cita.png`
- `test_cita_creada_exito.png`

---

### Test 1.6: Auto-refresh de Citas ⏱️

**Pasos:**
1. Deja abierta la página de Citas
2. En otra pestaña, abre MySQL Workbench
3. Actualiza manualmente el estado de una cita:
   ```sql
   UPDATE citas SET estado = 'confirmada' WHERE id = 2;
   ```
4. Espera 30 segundos
5. Vuelve a la pestaña de la aplicación

**✅ Debe:**
- Actualizar automáticamente sin recargar página
- Mostrar el nuevo estado de la cita
- En consola: `✅ Citas cargadas en frontend: X`

---

### Test 1.7: Validación de Disponibilidad 🚫

**Pasos:**
1. Crea una cita para mañana a las 10:00 AM
2. Intenta crear OTRA cita para el mismo día y hora

**✅ Debe:**
- Mostrar error: "Ya existe una cita programada en ese horario"
- No crear la cita duplicada
- Toast de error en rojo

**📷 Captura:** `test_validacion_disponibilidad.png`

---

## 2. Testing Sistema de Estética

### Test 2.1: Endpoints de API (Postman/Thunder Client)

**Crear cita estética:**

```http
POST http://localhost:3000/api/estetica
Authorization: Bearer [tu-token-jwt]
Content-Type: application/json

{
  "id_paciente": 1,
  "fecha": "2025-11-02",
  "hora": "14:00",
  "tipo_servicio": "bano_completo",
  "duracion_estimada": 90,
  "observaciones": "Paciente nervioso, usar shampoo hipoalergénico"
}
```

**✅ Respuesta esperada:**
```json
{
  "success": true,
  "message": "Cita de estética creada exitosamente",
  "data": {
    "id_cita": 4,
    "id_cita_estetica": 1,
    "tipo_servicio": "bano_completo",
    "fecha": "2025-11-02",
    "hora": "14:00:00"
  }
}
```

---

### Test 2.2: Crear Perfil de Estilo

**Crear perfil:**

```http
POST http://localhost:3000/api/estetica/perfil
Authorization: Bearer [tu-token-jwt]
Content-Type: application/json

{
  "id_paciente": 1,
  "preferencias_corte": "Corte estilo cachorro, orejas redondeadas",
  "frecuencia_recomendada": "cada 6 semanas",
  "productos_favoritos": "Shampoo orgánico de avena",
  "sensibilidades": "Piel sensible en patas",
  "notas_groomer": "Le gusta que le hablen durante el proceso"
}
```

**✅ Respuesta esperada:**
```json
{
  "success": true,
  "message": "Perfil de estética creado exitosamente",
  "data": {
    "id": 1,
    "id_paciente": 1
  }
}
```

**Verificar en BD:**
```sql
SELECT * FROM perfiles_estetica WHERE id_paciente = 1;
```

---

### Test 2.3: Subir Fotos Antes/Después (Simulado)

**Nota:** Este test requiere implementación completa de upload de archivos.

```http
POST http://localhost:3000/api/estetica/1/fotos
Authorization: Bearer [tu-token-jwt]
Content-Type: application/json

{
  "tipo_foto": "antes",
  "url_foto": "https://ejemplo.com/fotos/antes_grooming.jpg",
  "descripcion": "Estado antes del servicio",
  "es_publica": 1
}
```

**✅ Respuesta esperada:**
```json
{
  "success": true,
  "message": "Foto agregada exitosamente",
  "data": {
    "id": 1,
    "tipo_foto": "antes"
  }
}
```

---

## 3. Testing Sistema de Emails

### Test 3.1: Verificar Configuración de Email

**1. Revisar archivo `.env`:**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu-email@gmail.com
EMAIL_PASSWORD=tu-app-password
EMAIL_FROM=MollyVet <noreply@mollyvet.com>
```

**2. Si usas Gmail, generar App Password:**
- Ve a: https://myaccount.google.com/apppasswords
- Crea una contraseña de aplicación para "Mail"
- Copia el password de 16 caracteres
- Pégalo en `EMAIL_PASSWORD` del `.env`

**3. Reiniciar backend:**
```bash
cd backend
npm start
```

---

### Test 3.2: Email de Confirmación al Crear Cita 📧

**Pasos:**
1. Crea una nueva cita (test 1.5)
2. Usa un email real tuyo en el propietario

**🔍 En consola del backend debe aparecer:**
```javascript
📧 Enviando email de confirmación a: tu-email@gmail.com
✅ Email de confirmación enviado exitosamente
📎 Calendario adjunto: cita-3.ics
```

**✅ Verifica tu bandeja de entrada:**
- Email con asunto: "✓ Confirmación de Cita - MollyVet"
- Remitente: "MollyVet <noreply@mollyvet.com>"
- Diseño HTML profesional con:
  - Header con gradiente azul
  - Datos de la cita
  - Información del paciente
  - Botones de acción (Confirmar/Reagendar/Cancelar)
  - Archivo .ics adjunto
  - Footer con contacto

**🐛 Si no llega el email:**
```bash
# Ver logs del backend
# Buscar errores como:
❌ Error al enviar email: [descripción del error]

# Errores comunes:
1. "Invalid login" → verifica EMAIL_USER y EMAIL_PASSWORD
2. "Connection timeout" → verifica EMAIL_HOST y EMAIL_PORT
3. "Recipient rejected" → verifica que el email del propietario sea válido
```

**📷 Capturas:**
- `test_email_confirmacion_inbox.png`
- `test_email_confirmacion_contenido.png`

---

### Test 3.3: Archivo .ics Adjunto 📅

**Pasos:**
1. Abre el email de confirmación
2. Busca el archivo adjunto: `cita-X.ics`
3. Descárgalo
4. Ábrelo con tu aplicación de calendario

**✅ Al abrir el .ics debe:**
- Mostrar evento con título: "Consulta - [Nombre del paciente]"
- Fecha y hora correctas
- Duración según tipo de consulta
- Ubicación: Dirección de la clínica
- Descripción con datos del paciente
- 2 recordatorios:
  - 24 horas antes
  - 2 horas antes

**✅ Agregar a calendario:**
- Click en "Agregar a calendario"
- Verifica que aparezca en tu Google Calendar / Apple Calendar / Outlook

**📷 Captura:** `test_ics_calendario.png`

---

### Test 3.4: Template HTML Responsivo 📱

**Pasos:**
1. Abre el email en diferentes dispositivos:
   - Desktop (Gmail web)
   - Móvil (app Gmail)
   - Tablet (opcional)

**✅ Debe verse correctamente en todos:**
- Diseño adaptable
- Botones clicables
- Texto legible
- Imágenes sin distorsión

---

## 4. Testing Integración Calendarios

### Test 4.1: Google Calendar 📆

**Pasos:**
1. Descarga el archivo .ics del email
2. Ve a: https://calendar.google.com
3. Click en el botón "+" junto a "Otros calendarios"
4. Selecciona "Importar"
5. Sube el archivo .ics

**✅ Debe:**
- Importar el evento exitosamente
- Mostrar en la fecha correcta
- Incluir todos los detalles
- Mostrar recordatorios configurados

**📷 Captura:** `test_google_calendar.png`

---

### Test 4.2: Apple Calendar (Mac/iPhone) 🍎

**Pasos:**
1. En el email, click en el archivo .ics
2. Selecciona "Agregar a Calendario"
3. Elige el calendario destino
4. Click en "Agregar"

**✅ Debe:**
- Crear evento en Calendar app
- Sincronizar con iCloud
- Mostrar en todos tus dispositivos Apple

---

### Test 4.3: Outlook Calendar 📨

**Pasos:**
1. Descarga el .ics
2. Abre Outlook
3. Arrastra el .ics a la vista de calendario
4. O: File → Open → Calendar → Selecciona el .ics

**✅ Debe:**
- Importar evento
- Mantener todos los detalles
- Activar recordatorios

---

## 5. Testing Cron Jobs (Automatización)

### Test 5.1: Verificar Jobs Activos ✅

**En consola del backend al iniciar debe aparecer:**
```javascript
🔄 Iniciando cron jobs...
✅ Job de recordatorios configurado: 0 9 * * * (Diario 9:00 AM)
✅ Job de limpieza configurado: 0 2 * * * (Diario 2:00 AM)
✅ Job de estadísticas configurado: 0 8 * * 1 (Lunes 8:00 AM)
```

---

### Test 5.2: Testing Manual del Job de Recordatorios 📧

**IMPORTANTE:** No esperar hasta las 9 AM. Vamos a simular.

**Paso 1: Modificar temporalmente el cron schedule**

Abre: `backend/jobs/reminderJobs.js`

```javascript
// TEMPORAL PARA TESTING
// Cambia la línea del reminderJob de:
export const reminderJob = cron.schedule('0 9 * * *', async () => {

// A (ejecutar cada 2 minutos):
export const reminderJob = cron.schedule('*/2 * * * *', async () => {
```

**Paso 2: Crear cita para mañana**
```sql
-- Inserta una cita para mañana a las 10:00 AM
INSERT INTO citas (id_paciente, id_doctor, fecha, hora, tipo_consulta, estado, recordatorio_enviado)
VALUES (1, 1, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00', 'seguimiento', 'confirmada', 0);
```

**Paso 3: Reiniciar backend**
```bash
cd backend
npm start
```

**Paso 4: Esperar 2 minutos**

**✅ En consola debe aparecer:**
```javascript
🔔 Ejecutando job de recordatorios...
📅 Fecha objetivo (mañana): 2025-11-01
🔍 Buscando citas médicas para mañana...
✅ Encontradas 1 citas médicas pendientes de recordatorio
📧 Enviando recordatorio a: email@propietario.com
✅ Recordatorio enviado para cita ID: 4
✅ Marcada como enviada en BD
📊 Job completado: 1 recordatorios enviados
```

**Paso 5: Verificar email recibido**
- Asunto: "🔔 Recordatorio de Cita - Mañana en MollyVet"
- Contenido con countdown visual
- Tips de preparación
- Botón de confirmación

**Paso 6: Verificar en BD que se marcó como enviado**
```sql
SELECT id, recordatorio_enviado, fecha_recordatorio
FROM citas
WHERE id = 4;

-- Debe mostrar:
-- recordatorio_enviado = 1
-- fecha_recordatorio = [timestamp actual]
```

**Paso 7: Restaurar configuración original**
```javascript
// Volver a cambiar a:
export const reminderJob = cron.schedule('0 9 * * *', async () => {
```

**📷 Capturas:**
- `test_cron_console.png`
- `test_email_recordatorio.png`

---

### Test 5.3: Testing del Job de Limpieza 🧹

**Paso 1: Crear datos viejos de prueba**
```sql
-- Cita cancelada de hace 7 meses
INSERT INTO citas (id_paciente, id_doctor, fecha, hora, tipo_consulta, estado, created_at)
VALUES (1, 1, DATE_SUB(CURDATE(), INTERVAL 7 MONTH), '10:00:00', 'seguimiento', 'cancelada', DATE_SUB(NOW(), INTERVAL 7 MONTH));

-- Cita no asistió de hace 4 meses
INSERT INTO citas (id_paciente, id_doctor, fecha, hora, tipo_consulta, estado, created_at)
VALUES (1, 1, DATE_SUB(CURDATE(), INTERVAL 4 MONTH), '11:00:00', 'primera_vez', 'no_asistio', DATE_SUB(NOW(), INTERVAL 4 MONTH));
```

**Paso 2: Modificar temporalmente el schedule**
```javascript
// En reminderJobs.js
export const cleanupJob = cron.schedule('*/2 * * * *', async () => {
```

**Paso 3: Reiniciar backend y esperar 2 minutos**

**✅ En consola debe aparecer:**
```javascript
🧹 Ejecutando job de limpieza...
🗑️ Eliminando citas canceladas > 6 meses: 1 registros
🗑️ Eliminando no-asistencias > 3 meses: 1 registros
✅ Job de limpieza completado
```

**Paso 4: Verificar en BD**
```sql
SELECT COUNT(*) FROM citas WHERE estado = 'cancelada' AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
-- Debe ser 0

SELECT COUNT(*) FROM citas WHERE estado = 'no_asistio' AND created_at < DATE_SUB(NOW(), INTERVAL 3 MONTH);
-- Debe ser 0
```

---

### Test 5.4: Testing del Job de Estadísticas 📊

**Paso 1: Modificar temporalmente**
```javascript
// En reminderJobs.js
export const statsJob = cron.schedule('*/2 * * * *', async () => {
```

**Paso 2: Reiniciar y esperar**

**✅ En consola debe aparecer:**
```javascript
📊 Generando estadísticas semanales...
📈 Citas completadas esta semana: 15
📈 Citas canceladas: 2
📈 Tasa de asistencia: 88.24%
📈 Tipo más común: seguimiento (8 citas)
📈 Horario más popular: 10:00 AM (5 citas)
✅ Estadísticas generadas exitosamente
```

---

## 6. Tests de Integración Completa

### Test 6.1: Flujo Completo de Cita 🔄

**Escenario:** Agendar cita → Recibir confirmación → Recibir recordatorio → Completar cita

**Pasos:**
1. **Día 1 - 3:00 PM:** Crea cita para Día 3 a las 10:00 AM
   - ✅ Recibe email de confirmación inmediato
   - ✅ Descarga .ics y agrégalo a tu calendario
   - ✅ Verifica evento en calendario con recordatorios

2. **Día 2 - 9:00 AM:** (Automático) Job envía recordatorio
   - ✅ Recibe email de recordatorio 24h antes
   - ✅ Verifica que BD marcó como enviado

3. **Día 3 - 10:00 AM:** Cita programada
   - ✅ Recibe recordatorio de calendario (24h antes)
   - ✅ Recibe recordatorio de calendario (2h antes a las 8:00 AM)
   - ✅ En la app, marca cita como "En Curso"
   - ✅ Completa la cita
   - ✅ Marca como "Completada"

**Verificar en BD:**
```sql
SELECT
  id,
  fecha,
  hora,
  estado,
  recordatorio_enviado,
  fecha_recordatorio
FROM citas
WHERE id = [id-de-tu-cita];
```

---

### Test 6.2: Múltiples Citas Simultáneas ⏰

**Escenario:** Sistema manejando múltiples citas el mismo día

**Pasos:**
1. Crea 5 citas para mañana:
   - 08:00 AM - Paciente A - Primera Vez
   - 09:30 AM - Paciente B - Seguimiento
   - 11:00 AM - Paciente C - Vacunación
   - 14:00 PM - Paciente D - Urgencia
   - 16:00 PM - Paciente E - Primera Vez

2. Verifica en Dashboard:
   - ✅ Muestra las próximas 3 (08:00, 09:30, 11:00)
   - ✅ Contador dice "5 citas para hoy"

3. Verifica en Página de Citas:
   - ✅ Vista Lista muestra las 5
   - ✅ Vista Calendario marca el día con indicador

4. Al día siguiente a las 9:00 AM:
   - ✅ Job envía 5 emails de recordatorio
   - ✅ Verifica en consola: "✅ Job completado: 5 recordatorios enviados"

---

## 7. Tests de Rendimiento y UX

### Test 7.1: Tiempo de Carga ⚡

**Medir con DevTools (Network tab):**
1. Recarga página de Citas (Ctrl+R)
2. Observa Network tab
3. Busca llamada a `/api/citas`

**✅ Tiempos aceptables:**
- Carga de citas: < 500ms
- Renderizado: < 200ms
- Total hasta interactive: < 1s

---

### Test 7.2: Auto-refresh No Invasivo ⏱️

**Pasos:**
1. Abre página de Citas
2. Comienza a escribir en barra de búsqueda
3. Espera 30 segundos (auto-refresh)

**✅ Debe:**
- Actualizar datos en segundo plano
- NO borrar lo que estás escribiendo
- NO resetear filtros
- NO hacer scroll involuntario

---

## Checklist Final de Validación

### ✅ Backend API
- [ ] 20 endpoints de citas médicas responden correctamente
- [ ] 11 endpoints de estética responden correctamente
- [ ] Validación de disponibilidad funciona
- [ ] No permite citas duplicadas
- [ ] Autenticación JWT en todas las rutas
- [ ] Logs detallados en consola

### ✅ Frontend - Dashboard
- [ ] Muestra próximas 3 citas
- [ ] Auto-refresh cada 30 segundos
- [ ] Animaciones fluidas
- [ ] Datos desde API real (no mock)

### ✅ Frontend - Página de Citas
- [ ] Vista Lista funciona correctamente
- [ ] Vista Calendario funciona correctamente
- [ ] Navegación entre días
- [ ] Filtros de estado funcionan
- [ ] Búsqueda en tiempo real
- [ ] Auto-refresh no invasivo

### ✅ Frontend - Modal Nueva Cita
- [ ] Carga pacientes desde BD
- [ ] Validación de fecha (no pasadas)
- [ ] Validación de disponibilidad
- [ ] Crea cita exitosamente
- [ ] Recarga lista tras crear

### ✅ Sistema de Emails
- [ ] Configuración SMTP correcta
- [ ] Email de confirmación se envía
- [ ] Email de recordatorio se envía
- [ ] Templates HTML se ven bien
- [ ] Diseño responsivo móvil
- [ ] Archivos .ics adjuntos

### ✅ Integración Calendarios
- [ ] Genera .ics correctamente
- [ ] Compatible con Google Calendar
- [ ] Compatible con Apple Calendar
- [ ] Compatible con Outlook
- [ ] Recordatorios configurados (24h y 2h)

### ✅ Cron Jobs
- [ ] Job de recordatorios ejecuta correctamente
- [ ] Job de limpieza ejecuta correctamente
- [ ] Job de estadísticas ejecuta correctamente
- [ ] Logs detallados en cada ejecución
- [ ] Marcado correcto en BD

### ✅ Base de Datos
- [ ] Migración ejecutada sin errores
- [ ] 4 tablas nuevas creadas
- [ ] Tabla citas actualizada
- [ ] Foreign keys correctas
- [ ] Índices para performance

### ✅ UX/UI
- [ ] Animaciones fluidas
- [ ] Toasts de notificación
- [ ] Estados de carga
- [ ] Diseño responsivo
- [ ] Accesibilidad básica

---

## 🐛 Troubleshooting

### Problema: Citas no aparecen en frontend
**Solución:**
1. Verifica consola backend: ¿dice "✅ Próximas citas encontradas: X"?
2. Verifica consola frontend: ¿dice "✅ Citas cargadas: X"?
3. Ejecuta: `SELECT * FROM citas;` ¿hay datos?
4. Verifica fecha de las citas: ¿son futuras?

### Problema: Emails no se envían
**Solución:**
1. Verifica `.env`:
   ```bash
   echo $EMAIL_USER
   echo $EMAIL_HOST
   ```
2. Si usas Gmail, genera App Password
3. Prueba conexión SMTP:
   ```javascript
   // En backend, crea test_email.js
   import nodemailer from 'nodemailer';
   const transporter = nodemailer.createTransporter({...});
   transporter.verify((error, success) => {
     if (error) console.log(error);
     else console.log('✅ SMTP OK');
   });
   ```

### Problema: Cron jobs no se ejecutan
**Solución:**
1. Verifica que backend está corriendo
2. Checa logs al inicio: ¿dice "✅ Job configurado"?
3. Para testing, cambia a `*/2 * * * *` (cada 2 min)
4. Verifica zona horaria del servidor

---

## 📊 Resultados Esperados

Al completar todos los tests, debes tener:

- ✅ **Sistema 100% funcional** con datos reales
- ✅ **20+ citas de prueba** en diferentes estados
- ✅ **Emails recibidos** en tu bandeja
- ✅ **Eventos en tu calendario** personal
- ✅ **Logs limpios** sin errores
- ✅ **Confianza total** en el sistema para producción

---

**Versión:** 1.0.0
**Fecha:** 31 de Octubre, 2025
**Tiempo estimado de testing completo:** 2-3 horas
