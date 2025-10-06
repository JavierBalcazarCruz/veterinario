// src/pages/RegisterPage.jsx - VERSIÓN CORREGIDA PARA VALIDACIÓN DE CONTRASEÑAS
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { User, Mail, Lock, UserCheck, ArrowRight, CheckCircle, Send } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../context/AuthContext';
import { useForm } from '../hooks/useForm';
import toast from 'react-hot-toast';

// ✅ CORREGIDO: Esquema de validación mejorado
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
    .required('Confirma tu contraseña')
    // ✅ CORREGIDO: Mejor validación de contraseñas iguales
    .test('passwords-match', 'Las contraseñas no coinciden', function(value) {
      return this.parent.password === value;
    }),
  rol: yup
    .string()
    .oneOf(['doctor', 'admin', 'recepcion'], 'Selecciona un rol válido')
    .required('El rol es obligatorio'),
});

const RegisterPage = () => {
  const { register, isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  // Hook de formulario
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting,
    errors // ✅ Agregar errors para debug
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

  // ✅ AGREGADO: Función para verificar si las contraseñas coinciden
  const passwordsMatch = () => {
    if (!values.password || !values.confirmPassword) return false;
    return values.password === values.confirmPassword;
  };

  // ✅ AGREGADO: Función para validar paso 2 antes de enviar
  const isStep2Valid = () => {
    return (
      values.password && 
      values.password.length >= 6 &&
      values.confirmPassword &&
      passwordsMatch() &&
      values.rol
    );
  };

  // Solo redirigir si ya está autenticado Y no hay registro exitoso
  if (isAuthenticated && !registrationSuccess) {
    return <Navigate to="/dashboard" replace />;
  }

  // ✅ CORREGIDO: Manejar submit del registro con toast de mayor duración
  const onSubmit = async (formData) => {
    try {
      // ✅ Validación adicional antes de enviar
      if (!passwordsMatch()) {
        toast.error('Las contraseñas no coinciden', { duration: 4000 });
        return;
      }

      console.log('📤 Enviando registro:', formData.email);
      
      // Remover confirmPassword antes de enviar
      const { confirmPassword, ...dataToSend } = formData;
      
      // Llamar al servicio de registro
      const response = await register(dataToSend);
      
      // Si llegamos aquí, el registro fue exitoso
      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
      
      // ✅ CORREGIDO: Toast de éxito con mayor duración y mejor estilo
      toast.success(
        '¡Registro exitoso! 🎉\nRevisa tu email para verificar tu cuenta',
        { 
          duration: 8000, // ✅ 8 segundos en lugar de 4
          style: {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
          },
          icon: '📧',
          position: 'top-center'
        }
      );
      
      console.log('✅ Registro exitoso para:', formData.email);
    } catch (error) {
      console.error('❌ Error en registro:', error);
      // Los errores ya se manejan en el context con toast
    }
  };

  const nextStep = () => {
    // Validar datos básicos antes de continuar
    if (!values.nombre?.trim() || !values.apellidos?.trim() || !values.email?.trim()) {
      toast.error('Completa todos los campos antes de continuar', { duration: 4000 });
      return;
    }
    
    // ✅ Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(values.email)) {
      toast.error('Por favor ingresa un email válido', { duration: 4000 });
      return;
    }
    
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

  // PANTALLA DE ÉXITO (igual que antes)
  if (registrationSuccess) {
    return (
      <AppLayout showSidebar={false}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
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
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-6xl mb-4"
                >
                  🎉
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                  ¡Bienvenido a MollyVet!
                </h1>
                <p className="text-white/70">
                  Tu cuenta ha sido creada exitosamente
                </p>
              </motion.div>

              {/* Resto del contenido igual... */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* Icono de éxito animado */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ 
                    delay: 0.5, 
                    type: "spring", 
                    stiffness: 200,
                    damping: 10
                  }}
                  className="flex justify-center"
                >
                  <div className="relative">
                    <CheckCircle size={80} className="text-green-400" />
                    <motion.div
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.8, 0.5]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="absolute -inset-4 bg-green-400/20 rounded-full"
                    />
                  </div>
                </motion.div>
                
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    ¡Cuenta Creada!
                  </h2>
                  <p className="text-white/80 mb-2">
                    Hemos enviado un correo de verificación a:
                  </p>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-primary-300 font-semibold text-lg bg-primary-500/10 border border-primary-400/30 rounded-xl p-3 break-all"
                  >
                    {registeredEmail}
                  </motion.p>
                </div>

                {/* Pasos a seguir */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Send size={24} className="text-blue-400" />
                    <h3 className="text-blue-400 font-semibold">Pasos para activar tu cuenta:</h3>
                  </div>
                  <ol className="space-y-3 text-sm">
                    {[
                      { step: '1', text: 'Revisa tu bandeja de entrada', icon: '📧' },
                      { step: '2', text: 'Busca el correo de MollyVet', icon: '🔍' },
                      { step: '3', text: 'Haz clic en el enlace de verificación', icon: '🔗' },
                      { step: '4', text: '¡Tu cuenta se activará automáticamente!', icon: '✅' }
                    ].map((item, index) => (
                      <motion.li
                        key={item.step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2 + index * 0.1 }}
                        className="flex items-center space-x-3 text-blue-400/80"
                      >
                        <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                          {item.step}
                        </div>
                        <span className="text-lg">{item.icon}</span>
                        <span>{item.text}</span>
                      </motion.li>
                    ))}
                  </ol>
                </motion.div>

                {/* Aviso importante */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 }}
                  className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">⚠️</span>
                    <div>
                      <p className="text-yellow-400 font-medium text-sm">
                        ¡Importante!
                      </p>
                      <p className="text-yellow-400/80 text-sm">
                        Si no ves el correo, revisa tu carpeta de spam o correo no deseado
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Botones de acción */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.6 }}
                  className="space-y-3"
                >
                  <Link to="/login">
                    <GlassButton 
                      fullWidth 
                      icon={<ArrowRight size={20} />}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500"
                    >
                      Ir al Login
                    </GlassButton>
                  </Link>
                  
                  <Link to="/forgot-password">
                    <GlassButton 
                      variant="ghost" 
                      fullWidth
                      icon={<Send size={20} />}
                    >
                      ¿No recibiste el correo?
                    </GlassButton>
                  </Link>
                </motion.div>

                {/* Información adicional */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="text-center pt-4 border-t border-white/10"
                >
                  <p className="text-white/50 text-xs">
                    El enlace de verificación expirará en 24 horas
                  </p>
                  <p className="text-white/50 text-xs mt-1">
                    Una vez verificada, podrás acceder a todas las funciones de MollyVet
                  </p>
                </motion.div>
              </motion.div>
            </GlassCard>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              className="text-center mt-8"
            >
              <p className="text-white/50 text-sm">
                © 2025 MollyVet. Sistema de gestión veterinaria profesional.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  // FORMULARIO DE REGISTRO
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
                    disabled={!values.nombre?.trim() || !values.apellidos?.trim() || !values.email?.trim()}
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
                    // ✅ AGREGADO: Mostrar error específico para contraseñas
                    error={values.confirmPassword && !passwordsMatch() ? 'Las contraseñas no coinciden' : errors.confirmPassword}
                  />

                  {/* ✅ AGREGADO: Indicador visual de validación de contraseñas */}
                  {values.password && values.confirmPassword && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-3 rounded-xl border text-sm ${
                        passwordsMatch() 
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{passwordsMatch() ? '✅' : '❌'}</span>
                        <span>
                          {passwordsMatch() ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                        </span>
                      </div>
                    </motion.div>
                  )}

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
                      disabled={isSubmitting}
                    >
                      Atrás
                    </GlassButton>
                    
                    <GlassButton
                      type="submit"
                      loading={isSubmitting}
                      className="flex-1"
                      icon={!isSubmitting && <UserCheck size={20} />}
                      disabled={!isStep2Valid() || isSubmitting}
                    >
                      {isSubmitting ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </GlassButton>
                  </div>

                  {/* ✅ AGREGADO: Debug info (solo en desarrollo) */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-white/50 p-2 bg-black/20 rounded">
                      <div>Password: {values.password?.length || 0} chars</div>
                      <div>Confirm: {values.confirmPassword?.length || 0} chars</div>
                      <div>Match: {passwordsMatch() ? 'Yes' : 'No'}</div>
                      <div>Valid: {isStep2Valid() ? 'Yes' : 'No'}</div>
                    </div>
                  )}
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