import express from "express";
const router = express.Router();
import {agregarPaciente
    , obtenerPacientes
    , obtenerPaciente
    , actualizarPaciente
    , eliminarPaciente
    , obtenerRazas
    , buscarPropietarios
} from '../controllers/pacienteController.js';
import checkAuth from '../middleware/authMiddleware.js';

// Rutas específicas (deben ir antes de '/:id' para evitar conflictos)
router.get('/razas', checkAuth, obtenerRazas);
router.get('/propietarios/buscar', checkAuth, buscarPropietarios);

router.route('/')
    .post(checkAuth, agregarPaciente)
    .get(checkAuth, obtenerPacientes);

router
    .route( '/:id' )
    .get(checkAuth, obtenerPaciente)
    .put(checkAuth, actualizarPaciente)
    .delete(checkAuth, eliminarPaciente);


export default router;