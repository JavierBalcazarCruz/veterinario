// backend/routes/esteticaRoutes.js
import express from 'express';
const router = express.Router();

import {
    crearCitaEstetica,
    obtenerCitasEstetica,
    obtenerCitaEstetica,
    actualizarCitaEstetica,
    eliminarCitaEstetica,
    cambiarEstadoEstetica,
    agregarFoto,
    obtenerGaleria,
    obtenerPerfilEstetica,
    actualizarPerfilEstetica,
    obtenerHistorialEstetica
} from '../controllers/esteticaController.js';

import checkAuth from '../middleware/authMiddleware.js';

// ============================================================================
// RUTAS DE PERFILES DE ESTÉTICA
// ============================================================================

// Obtener y actualizar perfil de estética de un paciente
router.get('/perfil/:id_paciente', checkAuth, obtenerPerfilEstetica);
router.put('/perfil/:id_paciente', checkAuth, actualizarPerfilEstetica);

// Historial de estética de un paciente
router.get('/historial/:id_paciente', checkAuth, obtenerHistorialEstetica);

// ============================================================================
// RUTAS DE GALERÍA DE FOTOS
// ============================================================================

// Agregar foto a una cita
router.post('/:id/fotos', checkAuth, agregarFoto);

// Obtener galería de una cita
router.get('/:id/galeria', checkAuth, obtenerGaleria);

// ============================================================================
// RUTAS DE ACCIONES ESPECÍFICAS
// ============================================================================

// Cambios de estado
router.patch('/:id/estado', checkAuth, cambiarEstadoEstetica);

// ============================================================================
// RUTAS CRUD BÁSICAS
// ============================================================================

router.route('/')
    .get(checkAuth, obtenerCitasEstetica)
    .post(checkAuth, crearCitaEstetica);

router.route('/:id')
    .get(checkAuth, obtenerCitaEstetica)
    .put(checkAuth, actualizarCitaEstetica)
    .delete(checkAuth, eliminarCitaEstetica);

export default router;
