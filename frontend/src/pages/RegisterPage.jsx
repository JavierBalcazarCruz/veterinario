// src/pages/RegisterPage.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';

// Esquema de validación
const validationSchema = yup.object({
  nombre: yup
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .required('El nombre es obligatorio'),
  apellidos: yup
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .required('Los apellidos son obligatorios'),
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
  password: yup
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .required('La contraseña es obligatoria'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
  rol: yup
    .string()
    .oneOf(['doctor', 'admin', 'recepcion'], 'Selecciona un rol válido')
    .required('El rol es obligatorio'),
});

const RegisterPage = () => {
  const { register, isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  // Hook de formulario
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting
  } = useForm(
    { 
      nombre: '', 
      apellidos: '', 
      email: '', 
      password: '', 
      confirmPassword: '', 
      rol: 'doctor' 
    },
    validationSchema
  );

  // Si ya está autenticado, redirigir
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Manejar submit del registro
  const onSubmit = async (formData) => {
    try {
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...dataToSend } = formData;
      await register(dataToSend);
      setRegistrationSuccess(true);
    } catch (error) {
      console.error('Error en registro:', error);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const roles = [
    { value: 'doctor', label: 'Doctor Veterinario', icon: '🩺', desc: 'Atención médica y consultas' },
    { value: 'admin', label: 'Administrador', icon: '👨‍💼', desc: 'Gestión general de la clínica' },
    { value: 'recepcion', label: 'Recepcionista', icon: '👩‍💻', desc: 'Atención al cliente y citas' }
  ];

  if (registrationSuccess) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="text-6xl mb-6"
              >
                ✅
              </motion.div>
              
              <h2 className="text-2xl font-bold text-white mb-4">
                ¡Registro Exitoso!
              </h2>
              
              <p className="text-white/70 mb-6">
                Te hemos enviado un correo de verificación. Revisa tu bandeja de entrada y confirma tu cuenta para comenzar.
              </p>
              
              <Link to="/login">
                <GlassButton fullWidth>
                  Ir al Login
                </GlassButton>
              </Link>
            </GlassCard>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

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
                Únete a MollyVet
              </h1>
              <p className="text-white/70">
                Crea tu cuenta gratuita
              </p>
            </motion.div>

            {/* Indicador de pasos */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {[1, 2].map((stepNumber) => (
                  <motion.div
                    key={stepNumber}
                    className={`w-3 h-3 rounded-full ${
                      step >= stepNumber 
                        ? 'bg-primary-500' 
                        : 'bg-white/20'
                    }`}
                    animate={{
                      scale: step === stepNumber ? 1.2 : 1
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Formulario */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {step === 1 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="space-y-4"
                >
                  <GlassInput
                    {...getFieldProps('nombre')}
                    placeholder="Tu nombre"
                    label="Nombre"
                    icon={<User size={20} />}
                  />

                  <GlassInput
                    {...getFieldProps('apellidos')}
                    placeholder="Tus apellidos"
                    label="Apellidos"
                    icon={<UserCheck size={20} />}
                  />

                  <GlassInput
                    {...getFieldProps('email')}
                    type="email"
                    placeholder="tu@email.com"
                    label="Email"
                    icon={<Mail size={20} />}
                  />

                  <GlassButton
                    type="button"
                    onClick={nextStep}
                    fullWidth
                    icon={<ArrowRight size={20} />}
                    disabled={!values.nombre || !values.apellidos || !values.email}
                  >
                    Continuar
                  </GlassButton>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="space-y-4"
                >
                  <GlassInput
                    {...getFieldProps('password')}
                    type="password"
                    placeholder="Tu contraseña"
                    label="Contraseña"
                    icon={<Lock size={20} />}
                  />

                  <GlassInput
                    {...getFieldProps('confirmPassword')}
                    type="password"
                    placeholder="Confirma tu contraseña"
                    label="Confirmar Contraseña"
                    icon={<Lock size={20} />}
                  />

                  {/* Selector de rol */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Selecciona tu rol
                    </label>
                    <div className="space-y-2">
                      {roles.map((role) => (
                        <motion.label
                          key={role.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`block p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            values.rol === role.value
                              ? 'bg-primary-500/20 border-primary-400/50'
                              : 'bg-white/5 border-white/20 hover:bg-white/10'
                          }`}
                        >
                          <input
                            type="radio"
                            name="rol"
                            value={role.value}
                            checked={values.rol === role.value}
                            onChange={getFieldProps('rol').onChange}
                            className="sr-only"
                          />
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{role.icon}</span>
                            <div>
                              <div className="font-medium text-white">{role.label}</div>
                              <div className="text-sm text-white/60">{role.desc}</div>
                            </div>
                          </div>
                        </motion.label>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <GlassButton
                      type="button"
                      onClick={prevStep}
                      variant="ghost"
                      className="flex-1"
                    >
                      Atrás
                    </GlassButton>
                    
                    <GlassButton
                      type="submit"
                      loading={isSubmitting}
                      className="flex-1"
                      icon={!isSubmitting && <UserCheck size={20} />}
                    >
                      {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </GlassButton>
                  </div>
                </motion.div>
              )}
            </motion.form>

            {/* Login Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8"
            >
              <p className="text-white/70">
                ¿Ya tienes una cuenta?{' '}
                <Link 
                  to="/login" 
                  className="text-primary-300 hover:text-primary-200 font-medium transition-colors duration-200"
                >
                  Inicia sesión
                </Link>
              </p>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default RegisterPage;