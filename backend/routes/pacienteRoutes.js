import express from "express";
const router = express.Router();
import {agregarPaciente
    , obtenerPacientes
    , obtenerPaciente
    , actualizarPaciente
    , eliminarPaciente
    , obtenerRazas
    , buscarPropietarios
    , actualizarPropietario
    , transferirMascota
    , obtenerPacientesRecientes
} from '../controllers/pacienteController.js';
import checkAuth from '../middleware/authMiddleware.js';

// Rutas específicas (deben ir antes de '/:id' para evitar conflictos)
router.get('/recientes', checkAuth, obtenerPacientesRecientes);
router.get('/razas', checkAuth, obtenerRazas);
router.get('/propietarios/buscar', checkAuth, buscarPropietarios);

// ✅ FLUJO 2: Editar propietario (afecta a TODAS sus mascotas)
router.put('/propietarios/:id', checkAuth, actualizarPropietario);

// ✅ FLUJO 3: Transferir mascota a otro propietario (solo afecta a UNA mascota)
router.post('/:id/transferir', checkAuth, transferirMascota);

router.route('/')
    .post(checkAuth, agregarPaciente)
    .get(checkAuth, obtenerPacientes);

router
    .route( '/:id' )
    .get(checkAuth, obtenerPaciente)
    .put(checkAuth, actualizarPaciente)
    .delete(checkAuth, eliminarPaciente);


export default router;