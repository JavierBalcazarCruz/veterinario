// src/pages/LoginPage.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';

// Esquema de validación
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
});

const LoginPage = () => {
  const { login, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  // Hook de formulario
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting
  } = useForm(
    { email: '', password: '' },
    validationSchema
  );

  // Si ya está autenticado, redirigir
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Manejar submit del login
  const onSubmit = async (formData) => {
    await login(formData);
  };

  if (loading) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center">
          <GlassCard className="p-8">
            <div className="flex flex-col items-center space-y-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white border-t-transparent rounded-full"
              />
              <p className="text-white">Cargando...</p>
            </div>
          </GlassCard>
        </div>
      </AppLayout>
    );
  }

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
                🐾
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                MollyVet
              </h1>
              <p className="text-white/70">
                Gestión veterinaria inteligente
              </p>
            </motion.div>

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {/* Email Input */}
              <GlassInput
                {...getFieldProps('email')}
                type="email"
                placeholder="tu@email.com"
                label="Email"
                icon={<Mail size={20} />}
              />

              {/* Password Input */}
              <GlassInput
                {...getFieldProps('password')}
                type="password"
                placeholder="Tu contraseña"
                label="Contraseña"
                icon={<Lock size={20} />}
              />

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-300 hover:text-primary-200 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Login Button */}
              <GlassButton
                type="submit"
                fullWidth
                loading={isSubmitting}
                icon={!isSubmitting && <ArrowRight size={20} />}
                className="group"
              >
                {isSubmitting ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </GlassButton>
            </motion.form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="my-8 flex items-center"
            >
              <div className="flex-1 h-px bg-white/20"></div>
              <span className="px-4 text-white/60 text-sm">o</span>
              <div className="flex-1 h-px bg-white/20"></div>
            </motion.div>

            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <p className="text-white/70 mb-4">
                ¿No tienes una cuenta?
              </p>
              <Link to="/register">
                <GlassButton variant="ghost" fullWidth>
                  Crear cuenta gratuita
                </GlassButton>
              </Link>
            </motion.div>
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

export default LoginPage;