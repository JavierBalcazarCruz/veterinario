import express from "express";
const router = express.Router();
import {agregarPaciente
    , obtenerPacientes
    , obtenerPaciente
    , actualizarPaciente
    , eliminarPaciente
    , obtenerRazas
} from '../controllers/pacienteController.js';
import checkAuth from '../middleware/authMiddleware.js';

// Ruta para obtener razas (debe ir antes de '/:id' para evitar conflictos)
router.get('/razas', checkAuth, obtenerRazas);

router.route('/')
    .post(checkAuth, agregarPaciente)
    .get(checkAuth, obtenerPacientes);

router
    .route( '/:id' )
    .get(checkAuth, obtenerPaciente)
    .put(checkAuth, actualizarPaciente)
    .delete(checkAuth, eliminarPaciente);


export default router;