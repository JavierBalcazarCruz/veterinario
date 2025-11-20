// src/pages/ProfilePage.jsx - VERSIÓN COMPLETA CON CAMBIO DE CONTRASEÑA
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Save, ArrowLeft, X, Edit2, Shield, Calendar, Building, Lock, Eye, EyeOff, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import GlassCard from '../components/ui/GlassCard';
import PasswordStrengthMeter from '../components/ui/PasswordStrengthMeter';
import LogoutModal from '../components/ui/LogoutModal';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    email: ''
  });
  const [originalData, setOriginalData] = useState({});

  // Estados para cambio de contraseña
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    passwordActual: '',
    passwordNuevo: '',
    passwordConfirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    actual: false,
    nuevo: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Estado para el modal de logout
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Cargar datos del usuario al iniciar
  useEffect(() => {
    if (user) {
      const userData = {
        nombre: user.nombre || '',
        apellidos: user.apellidos || '',
        email: user.email || ''
      };
      setFormData(userData);
      setOriginalData(userData);
    }
  }, [user]);

  // Función para generar el avatar DiceBear (circular)
  const getAvatarUrl = (nombre, apellidos) => {
    const seed = `${nombre}${apellidos}`.trim() || 'default';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=f97316,ea580c,fb923c,fdba74,c2410c&textColor=ffffff`;
  };

  // Validación de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Sanitizar input para prevenir XSS
  const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
  };

  // Manejador de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  // Manejador de cambios en contraseñas
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle visibilidad de contraseñas
  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Activar modo edición
  const handleEdit = () => {
    setIsEditing(true);
  };

  // Cancelar edición
  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.nombre.trim() || !formData.apellidos.trim() || !formData.email.trim()) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    if (formData.nombre.length < 2 || formData.nombre.length > 50) {
      toast.error('El nombre debe tener entre 2 y 50 caracteres');
      return;
    }

    if (formData.apellidos.length < 2 || formData.apellidos.length > 50) {
      toast.error('Los apellidos deben tener entre 2 y 50 caracteres');
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Actualizando perfil...');

    try {
      const response = await userService.updateProfile(formData);
      updateUser(response.usuario);
      setOriginalData(formData);
      setIsEditing(false);
      toast.success('¡Perfil actualizado correctamente!', { id: toastId });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const errorMsg = error.response?.data?.msg || 'Error al actualizar el perfil';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // Manejador de cambio de contraseña
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!passwordData.passwordActual || !passwordData.passwordNuevo || !passwordData.passwordConfirm) {
      toast.error('Todos los campos de contraseña son obligatorios');
      return;
    }

    if (passwordData.passwordNuevo.length < 6) {
      toast.error('La contraseña nueva debe tener al menos 6 caracteres');
      return;
    }

    if (passwordData.passwordNuevo !== passwordData.passwordConfirm) {
      toast.error('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.passwordActual === passwordData.passwordNuevo) {
      toast.error('La contraseña nueva debe ser diferente a la actual');
      return;
    }

    // Validar que tenga al menos una mayúscula, una minúscula y un número
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(passwordData.passwordNuevo)) {
      toast.error('La contraseña debe contener al menos una mayúscula, una minúscula y un número');
      return;
    }

    setPasswordLoading(true);
    const toastId = toast.loading('Cambiando contraseña...');

    try {
      await userService.changePassword({
        passwordActual: passwordData.passwordActual,
        passwordNuevo: passwordData.passwordNuevo
      });

      // Limpiar campos
      setPasswordData({
        passwordActual: '',
        passwordNuevo: '',
        passwordConfirm: ''
      });
      setShowPasswordSection(false);

      toast.success('¡Contraseña actualizada correctamente!', { id: toastId });

      // Mostrar modal de logout después de un breve delay
      setTimeout(() => {
        setShowLogoutModal(true);
      }, 500);
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      const errorMsg = error.response?.data?.msg || 'Error al cambiar la contraseña';
      toast.error(errorMsg, { id: toastId });
    } finally {
      setPasswordLoading(false);
    }
  };

  // Manejador de logout
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calcular fecha de registro
  const getRegistrationDate = () => {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-screen flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0">
          <Header
            title="Mi Perfil"
            subtitle="Administra tu información personal y seguridad"
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 pb-24 lg:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Botón de volver */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="text-sm">Volver</span>
            </motion.button>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Tarjeta de Avatar e Info Básica */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col items-center">
                    {/* Avatar Circular */}
                    <div className="relative mb-4">
                      <motion.div
                        key={`${formData.nombre}${formData.apellidos}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: "spring" }}
                        className="relative"
                      >
                        <img
                          src={getAvatarUrl(formData.nombre, formData.apellidos)}
                          alt="Avatar"
                          className="w-32 h-32 rounded-full shadow-2xl ring-4 ring-primary-500/20"
                        />
                        {/* Indicador de estado activo */}
                        <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-gray-900/50 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      </motion.div>
                    </div>

                    {/* Info del usuario */}
                    <motion.h3
                      key={`name-${formData.nombre}${formData.apellidos}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xl font-bold text-white mb-1 text-center"
                    >
                      Dr. {formData.nombre} {formData.apellidos}
                    </motion.h3>
                    <p className="text-white/60 text-sm mb-1">{formData.email}</p>

                    {/* Badge de rol */}
                    <div className="w-full mt-4">
                      <div className="px-4 py-2 bg-gradient-to-r from-primary-500/20 to-primary-600/20 border border-primary-400/30 rounded-xl text-center">
                        <p className="text-primary-300 text-sm font-medium capitalize">
                          {user?.rol || 'Usuario'}
                        </p>
                      </div>
                    </div>

                    {/* Info adicional */}
                    <div className="w-full mt-6 pt-6 border-t border-white/10 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Shield size={14} />
                          <span>ID</span>
                        </div>
                        <span className="text-white font-mono text-xs">#{user?.id}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Calendar size={14} />
                          <span>Registro</span>
                        </div>
                        <span className="text-white text-xs">{getRegistrationDate()}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2 text-white/60">
                          <Building size={14} />
                          <span>Estado</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-400 text-xs font-medium">Activo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Columna de formularios */}
              <div className="lg:col-span-2 space-y-6">
                {/* Formulario de Información Personal */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <GlassCard className="p-6">
                    {/* Header con título y botón editar */}
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-white">
                        Información Personal
                      </h2>

                      {/* Botón de editar - discreto */}
                      <AnimatePresence mode="wait">
                        {!isEditing ? (
                          <motion.button
                            key="edit-btn"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={handleEdit}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-400/30 rounded-lg transition-all duration-200"
                          >
                            <Edit2 size={14} className="text-primary-400" />
                            <span className="text-primary-300 text-xs font-medium">Editar</span>
                          </motion.button>
                        ) : (
                          <motion.div
                            key="editing-badge"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500/20 border border-blue-400/30 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-blue-300 text-xs font-medium">Editando</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      {/* Campo Nombre */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Nombre <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                            <User size={16} />
                          </div>
                          <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            maxLength={50}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="Tu nombre"
                            required
                          />
                        </div>
                      </div>

                      {/* Campo Apellidos */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Apellidos <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                            <User size={16} />
                          </div>
                          <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            maxLength={50}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="Tus apellidos"
                            required
                          />
                        </div>
                      </div>

                      {/* Campo Email */}
                      <div>
                        <label className="block text-white/80 text-sm font-medium mb-2">
                          Correo Electrónico <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                            <Mail size={16} />
                          </div>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={!isEditing || loading}
                            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            placeholder="tu@email.com"
                            required
                          />
                        </div>
                      </div>

                      {/* Información de seguridad - solo cuando está editando */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-blue-500/10 border border-blue-400/20 rounded-lg px-3 py-2.5"
                          >
                            <p className="text-blue-300 text-xs leading-relaxed">
                              <strong>Nota:</strong> Los cambios en tu información se actualizarán inmediatamente. Asegúrate de que los datos sean correctos.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Botones de acción - solo cuando está editando */}
                      <AnimatePresence>
                        {isEditing && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-col sm:flex-row gap-2 pt-4"
                          >
                            <motion.button
                              type="submit"
                              disabled={loading}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
                            >
                              <Save size={16} />
                              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={handleCancel}
                              disabled={loading}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg font-medium text-sm transition-all"
                            >
                              <X size={16} />
                              <span>Cancelar</span>
                            </motion.button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </form>
                  </GlassCard>
                </motion.div>

                {/* Sección de Seguridad - Cambio de Contraseña */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GlassCard className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                          <Lock size={18} className="text-red-400" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">
                            Seguridad
                          </h2>
                          <p className="text-white/50 text-xs">Cambia tu contraseña</p>
                        </div>
                      </div>

                      {/* Botón para mostrar/ocultar sección */}
                      {!showPasswordSection && (
                        <motion.button
                          onClick={() => setShowPasswordSection(true)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition-all duration-200"
                        >
                          <Key size={14} className="text-red-400" />
                          <span className="text-red-300 text-xs font-medium">Cambiar</span>
                        </motion.button>
                      )}
                    </div>

                    {/* Formulario de cambio de contraseña */}
                    <AnimatePresence>
                      {showPasswordSection && (
                        <motion.form
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          onSubmit={handlePasswordSubmit}
                          className="space-y-4"
                        >
                          {/* Contraseña Actual */}
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Contraseña Actual <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                <Lock size={16} />
                              </div>
                              <input
                                type={showPasswords.actual ? 'text' : 'password'}
                                name="passwordActual"
                                value={passwordData.passwordActual}
                                onChange={handlePasswordChange}
                                disabled={passwordLoading}
                                className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Contraseña actual"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('actual')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                              >
                                {showPasswords.actual ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Nueva Contraseña */}
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Nueva Contraseña <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                <Key size={16} />
                              </div>
                              <input
                                type={showPasswords.nuevo ? 'text' : 'password'}
                                name="passwordNuevo"
                                value={passwordData.passwordNuevo}
                                onChange={handlePasswordChange}
                                disabled={passwordLoading}
                                className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Nueva contraseña"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('nuevo')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                              >
                                {showPasswords.nuevo ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>

                            {/* Medidor de fortaleza */}
                            {passwordData.passwordNuevo && (
                              <div className="mt-3">
                                <PasswordStrengthMeter password={passwordData.passwordNuevo} />
                              </div>
                            )}
                          </div>

                          {/* Confirmar Nueva Contraseña */}
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Confirmar Contraseña <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                                <Key size={16} />
                              </div>
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                name="passwordConfirm"
                                value={passwordData.passwordConfirm}
                                onChange={handlePasswordChange}
                                disabled={passwordLoading}
                                className="w-full pl-10 pr-12 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                                placeholder="Confirmar contraseña"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility('confirm')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                              >
                                {showPasswords.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                              </button>
                            </div>
                          </div>

                          {/* Requisitos de contraseña */}
                          <div className="bg-yellow-500/10 border border-yellow-400/20 rounded-lg px-3 py-2.5">
                            <p className="text-yellow-300 text-xs leading-relaxed">
                              <strong>Requisitos:</strong> Mínimo 6 caracteres, debe contener al menos una mayúscula, una minúscula y un número.
                            </p>
                          </div>

                          {/* Botones */}
                          <div className="flex flex-col sm:flex-row gap-2 pt-4">
                            <motion.button
                              type="submit"
                              disabled={passwordLoading}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25"
                            >
                              <Lock size={16} />
                              <span>{passwordLoading ? 'Cambiando...' : 'Cambiar Contraseña'}</span>
                            </motion.button>

                            <motion.button
                              type="button"
                              onClick={() => {
                                setShowPasswordSection(false);
                                setPasswordData({ passwordActual: '', passwordNuevo: '', passwordConfirm: '' });
                              }}
                              disabled={passwordLoading}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 rounded-lg font-medium text-sm transition-all"
                            >
                              <X size={16} />
                              <span>Cancelar</span>
                            </motion.button>
                          </div>
                        </motion.form>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </motion.div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Modal de Logout */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </AppLayout>
  );
};

export default ProfilePage;
