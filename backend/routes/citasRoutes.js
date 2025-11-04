// backend/routes/citasRoutes.js
import express from 'express';
const router = express.Router();

import {
    crearCita,
    obtenerCitas,
    obtenerCita,
    actualizarCita,
    eliminarCita,
    cambiarEstado,
    confirmarCita,
    cancelarCita,
    completarCita,
    iniciarConsulta,
    obtenerCitasPorFecha,
    obtenerCitasPorRango,
    obtenerProximas,
    obtenerPorPaciente,
    buscarCitas,
    verificarDisponibilidad,
    obtenerHorariosDisponibles,
    obtenerEstadisticas
} from '../controllers/citasController.js';

import checkAuth from '../middleware/authMiddleware.js';

// ============================================================================
// RUTAS ESPECÍFICAS (deben ir antes de '/:id' para evitar conflictos)
// ============================================================================

// Búsqueda y filtros
router.get('/buscar', checkAuth, buscarCitas);
router.get('/proximas', checkAuth, obtenerProximas);
router.get('/estadisticas', checkAuth, obtenerEstadisticas);

// Disponibilidad y horarios
router.get('/disponibilidad', checkAuth, verificarDisponibilidad);
router.get('/horarios-disponibles', checkAuth, obtenerHorariosDisponibles);

// Filtros por fecha
router.get('/fecha/:date', checkAuth, obtenerCitasPorFecha);
router.get('/rango', checkAuth, obtenerCitasPorRango);

// Citas por paciente
router.get('/paciente/:id', checkAuth, obtenerPorPaciente);

// ============================================================================
// RUTAS DE ACCIONES ESPECÍFICAS (/:id/accion)
// ============================================================================

// Cambios de estado
router.patch('/:id/estado', checkAuth, cambiarEstado);
router.patch('/:id/confirmar', checkAuth, confirmarCita);
router.patch('/:id/cancelar', checkAuth, cancelarCita);
router.patch('/:id/completar', checkAuth, completarCita);
router.patch('/:id/iniciar', checkAuth, iniciarConsulta);

// ============================================================================
// RUTAS CRUD BÁSICAS
// ============================================================================

router.route('/')
    .get(checkAuth, obtenerCitas)
    .post(checkAuth, crearCita);

router.route('/:id')
    .get(checkAuth, obtenerCita)
    .put(checkAuth, actualizarCita)
    .delete(checkAuth, eliminarCita);

export default router;
