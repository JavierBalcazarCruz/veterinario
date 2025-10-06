// src/pages/ForgotPasswordPage.jsx
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
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
  email: yup
    .string()
    .email('Email inválido')
    .required('El email es obligatorio'),
});

const ForgotPasswordPage = () => {
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');

  // Hook de formulario
  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting
  } = useForm(
    { email: '' },
    validationSchema
  );

  // Manejar envío del formulario
  const onSubmit = async (formData) => {
    try {
      await authService.forgotPassword(formData.email);
      setSentToEmail(formData.email);
      setEmailSent(true);
      toast.success('Correo enviado exitosamente');
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Error al enviar el correo');
    }
  };

  // Reenviar correo
  const handleResendEmail = async () => {
    try {
      await authService.forgotPassword(sentToEmail);
      toast.success('Correo reenviado exitosamente');
    } catch (error) {
      toast.error('Error al reenviar el correo');
    }
  };

  if (emailSent) {
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
                  📧
                </motion.div>
                <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                  Correo Enviado
                </h1>
                <p className="text-white/70">
                  Revisa tu bandeja de entrada
                </p>
              </motion.div>

              {/* Contenido principal */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center space-y-6"
              >
                {/* Icono de éxito */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
                </motion.div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-3">
                    ¡Instrucciones enviadas!
                  </h2>
                  <p className="text-white/70 mb-2">
                    Hemos enviado las instrucciones para restablecer tu contraseña a:
                  </p>
                  <p className="text-primary-300 font-medium break-all">
                    {sentToEmail}
                  </p>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <div className="text-left space-y-2">
                    <p className="text-blue-400 font-medium">Pasos a seguir:</p>
                    <ol className="text-blue-400/70 text-sm space-y-1 list-decimal list-inside">
                      <li>Revisa tu bandeja de entrada</li>
                      <li>Busca el correo de MollyVet</li>
                      <li>Haz clic en el enlace del correo</li>
                      <li>Crea tu nueva contraseña</li>
                    </ol>
                  </div>
                </div>

                {/* Aviso sobre spam */}
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Si no ves el correo, revisa tu carpeta de spam
                  </p>
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                  <GlassButton
                    onClick={handleResendEmail}
                    variant="secondary"
                    fullWidth
                    icon={<Send size={20} />}
                  >
                    Reenviar correo
                  </GlassButton>

                  <Link to="/login">
                    <GlassButton 
                      variant="ghost" 
                      fullWidth
                      icon={<ArrowLeft size={20} />}
                    >
                      Volver al login
                    </GlassButton>
                  </Link>
                </div>

                {/* Tiempo de expiración */}
                <p className="text-white/50 text-xs">
                  El enlace expirará en 24 horas
                </p>
              </motion.div>
            </GlassCard>
          </motion.div>
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
                🔐
              </motion.div>
              <h1 className="text-3xl font-bold text-white mb-2 text-shadow-soft">
                ¿Olvidaste tu contraseña?
              </h1>
              <p className="text-white/70">
                Te ayudamos a recuperar el acceso
              </p>
            </motion.div>

            {/* Información */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/5 rounded-xl p-4 mb-6"
            >
              <p className="text-white/80 text-sm leading-relaxed">
                Ingresa tu dirección de correo electrónico y te enviaremos 
                las instrucciones para restablecer tu contraseña.
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
              <GlassInput
                {...getFieldProps('email')}
                type="email"
                placeholder="tu@email.com"
                label="Correo Electrónico"
                icon={<Mail size={20} />}
              />

              <GlassButton
                type="submit"
                fullWidth
                loading={isSubmitting}
                icon={!isSubmitting && <Send size={20} />}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Instrucciones'}
              </GlassButton>
            </motion.form>

            {/* Enlaces de navegación */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 space-y-4"
            >
              <div className="flex items-center">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="px-4 text-white/60 text-sm">o</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/login" className="flex-1">
                  <GlassButton 
                    variant="ghost" 
                    fullWidth
                    icon={<ArrowLeft size={20} />}
                  >
                    Volver al login
                  </GlassButton>
                </Link>

                <Link to="/register" className="flex-1">
                  <GlassButton variant="secondary" fullWidth>
                    Crear cuenta
                  </GlassButton>
                </Link>
              </div>
            </motion.div>

            {/* Ayuda adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-white/50 text-sm">
                ¿Tienes problemas? Contacta al soporte técnico
              </p>
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

export default ForgotPasswordPage;