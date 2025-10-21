/**
 * =====================================================
 * RUTAS DE HISTORIAL CLÍNICO
 * =====================================================
 * Define todas las rutas API para el manejo del
 * historial clínico veterinario
 */

import express from 'express';
const router = express.Router();

import {
    // Historial completo
    obtenerHistorialCompleto,

    // Consultas
    crearConsulta,
    actualizarConsulta,

    // Vacunas
    agregarVacuna,
    actualizarVacuna,

    // Alergias
    agregarAlergia,
    desactivarAlergia,

    // Cirugías
    agregarCirugia,

    // Medicamentos
    agregarMedicamento,
    obtenerMedicamentosConsulta
} from '../controllers/historialController.js';

import checkAuth from '../middleware/authMiddleware.js';

// =====================================================
// RUTAS - HISTORIAL COMPLETO
// =====================================================

/**
 * GET /api/historial/:id
 * Obtener historial clínico completo de un paciente
 */
router.get('/:id', checkAuth, obtenerHistorialCompleto);

// =====================================================
// RUTAS - CONSULTAS MÉDICAS
// =====================================================

/**
 * POST /api/historial/consultas
 * Crear nueva consulta médica
 */
router.post('/consultas', checkAuth, crearConsulta);

/**
 * PUT /api/historial/consultas/:id
 * Actualizar consulta médica existente
 */
router.put('/consultas/:id', checkAuth, actualizarConsulta);

// =====================================================
// RUTAS - VACUNAS
// =====================================================

/**
 * POST /api/historial/vacunas
 * Agregar nueva vacuna
 */
router.post('/vacunas', checkAuth, agregarVacuna);

/**
 * PUT /api/historial/vacunas/:id
 * Actualizar vacuna existente
 */
router.put('/vacunas/:id', checkAuth, actualizarVacuna);

// =====================================================
// RUTAS - ALERGIAS
// =====================================================

/**
 * POST /api/historial/alergias
 * Agregar nueva alergia
 */
router.post('/alergias', checkAuth, agregarAlergia);

/**
 * PATCH /api/historial/alergias/:id/desactivar
 * Desactivar una alergia (marcar como inactiva)
 */
router.patch('/alergias/:id/desactivar', checkAuth, desactivarAlergia);

// =====================================================
// RUTAS - CIRUGÍAS Y PROCEDIMIENTOS
// =====================================================

/**
 * POST /api/historial/cirugias
 * Agregar nueva cirugía o procedimiento
 */
router.post('/cirugias', checkAuth, agregarCirugia);

// =====================================================
// RUTAS - MEDICAMENTOS
// =====================================================

/**
 * POST /api/historial/medicamentos
 * Agregar medicamento recetado a una consulta
 */
router.post('/medicamentos', checkAuth, agregarMedicamento);

/**
 * GET /api/historial/consultas/:id/medicamentos
 * Obtener todos los medicamentos de una consulta específica
 */
router.get('/consultas/:id/medicamentos', checkAuth, obtenerMedicamentosConsulta);

// =====================================================
// EXPORTAR ROUTER
// =====================================================

export default router;
