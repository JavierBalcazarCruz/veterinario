// backend/index.js - VERSIÓN CORREGIDA
import express from "express";
import conectarDB from './config/db.js';
import veterinarioRoutes from './routes/veterinarioRoutes.js';
import pacienteRoutes from './routes/pacienteRoutes.js';
import historialRoutes from './routes/historialRoutes.js';
import citasRoutes from './routes/citasRoutes.js';
import esteticaRoutes from './routes/esteticaRoutes.js';
import expedienteRoutes from './routes/expedienteRoutes.js';
import { startAllJobs, stopAllJobs } from './jobs/reminderJobs.js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

// ✅ CORREGIDO: Configuración de CORS mejorada
const dominiosPermitidos = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000", // Por si cambias el puerto del frontend
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log('🌐 CORS - Origin:', origin);
        
        // Permitir requests sin origin (como Postman) o desde dominios permitidos
        if (!origin || dominiosPermitidos.indexOf(origin) !== -1) {
            console.log('✅ CORS - Origin permitido');
            callback(null, true);
        } else {
            console.log('❌ CORS - Origin no permitido:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Permite incluir cookies en las peticiones
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200 // Para legacy browsers
};

// ✅ Aplicar CORS antes que todo
app.use(cors(corsOptions));

// ✅ CORREGIDO: Middleware adicional para debugging
app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.path} - Origin: ${req.get('Origin') || 'No origin'}`);
    next();
});

// ✅ Middleware para parsear JSON con límite aumentado
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORREGIDO: Conectar a la base de datos al inicio
const iniciarServidor = async () => {
    try {
        await conectarDB();
        console.log('✅ Base de datos conectada');
    } catch (error) {
        console.error('❌ Error al conectar a la base de datos:', error);
        process.exit(1);
    }
};

// ✅ Rutas
app.use("/api/veterinarios", veterinarioRoutes);
app.use("/api/pacientes", pacienteRoutes);
app.use("/api/historial", historialRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/estetica", esteticaRoutes);
app.use("/api/expediente", expedienteRoutes);

// ✅ AGREGADO: Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ✅ AGREGADO: Manejo de rutas no encontradas
app.use('*', (req, res) => {
    console.log('❌ Ruta no encontrada:', req.originalUrl);
    res.status(404).json({ 
        msg: 'Ruta no encontrada',
        path: req.originalUrl 
    });
});

// ✅ AGREGADO: Manejo global de errores
app.use((error, req, res, next) => {
    console.error('❌ Error global:', error);
    
    if (error.message === 'No permitido por CORS') {
        return res.status(403).json({ 
            msg: 'CORS Error: Origen no permitido',
            origin: req.get('Origin')
        });
    }
    
    res.status(500).json({ 
        msg: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

const PORT = process.env.PORT || 4000;

// ✅ CORREGIDO: Iniciar servidor con manejo de errores
const servidor = app.listen(PORT, '0.0.0.0', async () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Inicializar base de datos después de que el servidor esté listo
    await iniciarServidor();

    // Iniciar jobs automáticos de recordatorios
    startAllJobs();
});

// ✅ AGREGADO: Manejo graceful de cierre del servidor
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM recibido, cerrando servidor...');
    stopAllJobs();
    servidor.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT recibido, cerrando servidor...');
    stopAllJobs();
    servidor.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});