// src/components/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../layout/AppLayout';
import GlassCard from '../ui/GlassCard';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user, hasRole } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
              />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-white text-lg"
              >
                Verificando acceso<span className="loading-dots"></span>
              </motion.p>
            </div>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <GlassCard className="p-8 text-center max-w-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Icono de acceso denegado */}
              <div className="text-6xl mb-4">🚫</div>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Acceso Denegado
                </h2>
                <p className="text-white/70 mb-6">
                  No tienes permisos suficientes para acceder a esta sección.
                </p>
              </div>

              <div className="space-y-2 text-sm text-white/60">
                <p>Tu rol actual: <span className="font-medium text-primary-300">{user?.rol}</span></p>
                <p>Rol requerido: <span className="font-medium text-primary-300">{requiredRole}</span></p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.history.back()}
                className="btn-glass w-full"
              >
                Volver atrás
              </motion.button>
            </motion.div>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

  // Si todo está correcto, mostrar el contenido
  return children;
};

export default ProtectedRoute;