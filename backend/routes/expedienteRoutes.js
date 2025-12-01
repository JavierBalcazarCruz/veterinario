/**
 * =====================================================
 * RUTAS DE EXPEDIENTE CLÍNICO
 * =====================================================
 * Define todas las rutas API para el manejo del
 * expediente clínico completo (captura estructurada)
 */

import express from 'express';
const router = express.Router();

import {
    obtenerExpediente,
    guardarExpediente,
    obtenerHistorialExpedientes,
    obtenerExpedientePorId
} from '../controllers/expedienteController.js';

import checkAuth from '../middleware/authMiddleware.js';

// =====================================================
// RUTAS - EXPEDIENTE CLÍNICO
// =====================================================

/**
 * GET /api/expediente/:id
 * Obtener expediente actual de un paciente (último o nuevo)
 */
router.get('/:id', checkAuth, obtenerExpediente);

/**
 * POST /api/expediente/:id
 * Guardar nuevo expediente clínico completo
 */
router.post('/:id', checkAuth, guardarExpediente);

/**
 * GET /api/expediente/:id/historial
 * Obtener historial de expedientes de un paciente
 */
router.get('/:id/historial', checkAuth, obtenerHistorialExpedientes);

/**
 * GET /api/expediente/:id/detalle/:expedienteId
 * Obtener un expediente específico por ID
 */
router.get('/:id/detalle/:expedienteId', checkAuth, obtenerExpedientePorId);

// =====================================================
// EXPORTAR ROUTER
// =====================================================

export default router;
