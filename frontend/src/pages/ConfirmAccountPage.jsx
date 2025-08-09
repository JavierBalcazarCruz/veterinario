// src/pages/ConfirmAccountPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowRight } from 'lucide-react';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import AppLayout from '../components/layout/AppLayout';
import { authService } from '../services/authService';

const ConfirmAccountPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    confirmAccount();
  }, [token]);

  const confirmAccount = async () => {
    try {
      setStatus('loading');
      await authService.confirmAccount(token);
      setStatus('success');
      setMessage('¡Tu cuenta ha sido verificada exitosamente!');
    } catch (error) {
      setStatus('error');
      setMessage(
        error.response?.data?.msg || 
        'Error al verificar la cuenta. El enlace puede haber expirado.'
      );
    }
  };

  const handleRetry = async () => {
    setRetrying(true);
    await confirmAccount();
    setRetrying(false);
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 mx-auto mb-6 border-4 border-primary-500 border-t-transparent rounded-full"
            />
            
            <h2 className="text-2xl font-bold text-white mb-4">
              Verificando tu cuenta
            </h2>
            
            <p className="text-white/70">
              Por favor espera mientras confirmamos tu registro...
            </p>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <CheckCircle size={64} className="text-green-400 mx-auto" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-4"
            >
              ¡Cuenta Verificada!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 mb-8"
            >
              {message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                    <CheckCircle size={16} className="text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-green-400 font-medium">Tu cuenta está activa</p>
                    <p className="text-green-400/70 text-sm">
                      Ya puedes iniciar sesión y comenzar a usar MollyVet
                    </p>
                  </div>
                </div>
              </div>

              <Link to="/login">
                <GlassButton 
                  fullWidth 
                  icon={<ArrowRight size={20} />}
                  className="group"
                >
                  Iniciar Sesión
                </GlassButton>
              </Link>
            </motion.div>
          </motion.div>
        );

      case 'error':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mb-6"
            >
              <XCircle size={64} className="text-red-400 mx-auto" />
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl font-bold text-white mb-4"
            >
              Error de Verificación
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-white/70 mb-8"
            >
              {message}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-4"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                <div className="text-left space-y-2">
                  <p className="text-red-400 font-medium">Posibles causas:</p>
                  <ul className="text-red-400/70 text-sm space-y-1">
                    <li>• El enlace ha expirado (24 horas)</li>
                    <li>• El enlace ya fue utilizado</li>
                    <li>• La cuenta ya está verificada</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <GlassButton
                  onClick={handleRetry}
                  loading={retrying}
                  variant="secondary"
                  icon={!retrying && <RefreshCw size={20} />}
                  className="flex-1"
                >
                  {retrying ? 'Reintentando...' : 'Reintentar'}
                </GlassButton>
                
                <Link to="/login" className="flex-1">
                  <GlassButton 
                    fullWidth 
                    icon={<ArrowRight size={20} />}
                  >
                    Ir al Login
                  </GlassButton>
                </Link>
              </div>

              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm mb-3">
                  ¿Necesitas un nuevo enlace de verificación?
                </p>
                <Link to="/register">
                  <GlassButton variant="ghost" fullWidth>
                    Solicitar nuevo enlace
                  </GlassButton>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 shadow-2xl">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <motion.div
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, -2, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-5xl mb-4"
              >
                🐾
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                MollyVet
              </h1>
              <p className="text-white/70">
                Verificación de cuenta
              </p>
            </motion.div>

            {/* Contenido dinámico */}
            {renderContent()}
          </GlassCard>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-white/50 text-sm">
              © 2025 MollyVet. Sistema de gestión veterinaria.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default ConfirmAccountPage;