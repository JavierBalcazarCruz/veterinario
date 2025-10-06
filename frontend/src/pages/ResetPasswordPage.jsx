// src/pages/ResetPasswordPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import AppLayout from '../components/layout/AppLayout';
import { authService } from '../services/authService';
import { useForm } from '../hooks/useForm';
import toast from 'react-hot-toast';

// Esquema de validación
const validationSchema = yup.object({
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [tokenStatus, setTokenStatus] = useState('verifying'); // 'verifying', 'valid', 'invalid'
  const [resetSuccess, setResetSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Hook de formulario
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting
  } = useForm(
    { password: '', confirmPassword: '' },
    validationSchema
  );

  // Verificar token al cargar
  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await authService.verifyResetToken(token);
      setTokenStatus('valid');
      setUserInfo(response);
    } catch (error) {
      setTokenStatus('invalid');
    }
  };

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    try {
      await authService.resetPassword(token, formData.password);
      setResetSuccess(true);
      toast.success('Contraseña actualizada exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error al actualizar la contraseña');
    }
  };

  // Verificación de token en progreso
  if (tokenStatus === 'verifying') {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6 border-4 border-primary-500 border-t-transparent rounded-full"
              />
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Verificando enlace
              </h2>
              
              <p className="text-white/70">
                Por favor espera mientras validamos tu enlace de recuperación...
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Token inválido
  if (tokenStatus === 'invalid') {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <XCircle size={64} className="text-red-400 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                Enlace Inválido
              </h2>
              
              <p className="text-white/70 mb-8">
                El enlace de recuperación ha expirado o no es válido. 
                Por favor solicita uno nuevo.
              </p>

              <div className="space-y-3">
                <Link to="/forgot-password">
                  <GlassButton fullWidth>
                    Solicitar Nuevo Enlace
                  </GlassButton>
                </Link>
                
                <Link to="/login">
                  <GlassButton variant="ghost" fullWidth>
                    Volver al Login
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Contraseña restablecida exitosamente
  if (resetSuccess) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="mb-6"
              >
                <CheckCircle size={64} className="text-green-400 mx-auto" />
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Contraseña Actualizada!
              </h2>
              
              <p className="text-white/70 mb-8">
                Tu contraseña ha sido restablecida exitosamente. 
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>

              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle size={20} className="text-green-400" />
                  <p className="text-green-400 text-sm">
                    Tu cuenta está segura y lista para usar
                  </p>
                </div>
              </div>

              <Link to="/login">
                <GlassButton 
                  fullWidth 
                  icon={<ArrowRight size={20} />}
                >
                  Iniciar Sesión
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // Formulario para nueva contraseña
  return (
    <AppLayout showSidebar={false}>
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8 shadow-2xl">
            {/* Logo y título */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
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
                🔐
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                Nueva Contraseña
              </h1>
              <p className="text-white/70">
                Crea una contraseña segura
              </p>
            </motion.div>

            {/* Información del usuario */}
            {userInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/5 rounded-xl p-4 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-500/20 rounded-full flex items-center justify-center">
                    <span className="text-primary-300 font-semibold">
                      {userInfo.nombre?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {userInfo.nombre}
                    </p>
                    <p className="text-white/60 text-sm">
                      {userInfo.email}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Requisitos de contraseña */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6"
            >
              <p className="text-blue-400 font-medium mb-2">Requisitos de contraseña:</p>
              <ul className="text-blue-400/70 text-sm space-y-1">
                <li className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    values.password?.length >= 6 ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span>Mínimo 6 caracteres</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    values.password === values.confirmPassword && values.password ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <span>Las contraseñas deben coincidir</span>
                </li>
              </ul>
            </motion.div>

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <GlassInput
                {...getFieldProps('password')}
                type="password"
                placeholder="Nueva contraseña"
                label="Nueva Contraseña"
                icon={<Lock size={20} />}
              />

              <GlassInput
                {...getFieldProps('confirmPassword')}
                type="password"
                placeholder="Confirmar contraseña"
                label="Confirmar Contraseña"
                icon={<Lock size={20} />}
              />

              <GlassButton
                type="submit"
                fullWidth
                loading={isSubmitting}
                icon={!isSubmitting && <CheckCircle size={20} />}
                disabled={values.password !== values.confirmPassword || values.password?.length < 6}
              >
                {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
              </GlassButton>
            </motion.form>

            {/* Enlace de vuelta */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-center mt-8"
            >
              <Link 
                to="/login" 
                className="text-white/60 hover:text-white transition-colors duration-200 text-sm"
              >
                Volver al login
              </Link>
            </motion.div>
          </GlassCard>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
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

export default ResetPasswordPage;