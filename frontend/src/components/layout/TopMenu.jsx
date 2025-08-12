// src/components/layout/TopMenu.jsx - VERSIÓN CORREGIDA
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, LogOut, User, Settings, ChevronDown, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';

const TopMenu = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Ejemplo
  const menuRef = useRef(null);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Cerrar menú al hacer clic fuera - SOLO para el avatar, NO para el overlay
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target)) {
        // Solo cerrar si el clic NO está dentro del overlay
        const overlay = document.querySelector('[data-profile-overlay]');
        if (overlay && !overlay.contains(event.target)) {
          console.log('🚫 Cerrando menú por clic fuera');
          setIsMenuOpen(false);
        }
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

  const handleProfileClick = () => {
    navigate("/perfil");
    setIsMenuOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/configuracion");
    setIsMenuOpen(false);
  };

  const handleNotificationsClick = () => {
    navigate("/notificaciones");
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('🚪 handleLogout ejecutado');
    setIsMenuOpen(false);
    logout();
  };


  // Generar initials para el avatar
  const getInitials = (nombre, apellidos) => {
    const firstInitial = nombre?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const menuItems = [
    {
      icon: User,
      label: 'Ver Perfil',
      action: handleProfileClick,
      color: 'text-blue-400',
      showOn: 'both'
    },
    {
      icon: Settings,
      label: 'Configuración',
      action: handleSettingsClick,
      color: 'text-purple-400',
      showOn: 'both'
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      action: handleNotificationsClick,
      color: 'text-yellow-400',
      showOn: 'mobile',
      badge: notifications
    },
    {
      icon: LogOut,
      label: 'Cerrar Sesión',
      action: handleLogout,
      color: 'text-red-400',
      showOn: 'both',
      separator: true
    }
  ];

  return (
    <div className="relative">
      {/* Desktop: Icons + Avatar */}
      <div className="flex items-center space-x-4">
        {/* Notificaciones - Solo Desktop */}
        <motion.button
          onClick={handleNotificationsClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hidden lg:flex relative p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
        >
          <Bell size={20} />
          {notifications > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
            >
              {notifications > 9 ? '9+' : notifications}
            </motion.div>
          )}
        </motion.button>

        {/* Avatar con menú desplegable */}
        <div className="relative z-50" ref={menuRef}>
          <motion.button
            onClick={() => {
              console.log('🖱️ CLICK EN AVATAR - Estado actual:', isMenuOpen);
              setIsMenuOpen(!isMenuOpen);
              console.log('🖱️ CLICK EN AVATAR - Nuevo estado:', !isMenuOpen);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            {/* Avatar */}
            <div className="relative">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                alt="Avatar"
                className="w-10 h-10 rounded-lg"
              />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white/20"></div>
            </div>

            {/* Info del usuario - Solo Desktop */}
            <div className="hidden lg:block text-left">
              <p className="text-white font-medium text-sm">
                Dr. {user?.nombre}
              </p>
              <p className="text-white/60 text-xs">
                {user?.rol}
              </p>
            </div>

            {/* Chevron */}
            <motion.div
              animate={{ rotate: isMenuOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="hidden lg:block"
            >
              <ChevronDown size={16} className="text-white/70" />
            </motion.div>
          </motion.button>

          {/* Portal Menu - Se renderiza en el body, fuera del Header */}
          {isMenuOpen && createPortal(
            <ProfileMenuOverlay 
              isOpen={isMenuOpen}
              onClose={() => setIsMenuOpen(false)}
              user={user}
              menuItems={menuItems}
              getInitials={getInitials}
              logout={logout}
            />,
            document.body
          )}
        </div>
      </div>
    </div>
  );
};

// Componente separado para el overlay del menú que se renderiza en el body
const ProfileMenuOverlay = ({ isOpen, onClose, user, menuItems, getInitials, logout }) => {
  console.log('📋 ProfileMenuOverlay renderizado - isOpen:', isOpen, 'menuItems:', menuItems?.length);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          data-profile-overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-gradient-to-br from-slate-900/98 via-slate-800/98 to-slate-900/98 backdrop-blur-xl"
          style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999999,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {/* Botón Cerrar - Esquina Superior Derecha */}
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-6 right-6 p-4 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-all duration-200 border border-red-400/30"
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2 }}
          >
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>

          {/* Contenido Principal Centrado */}
          <div className="flex items-center justify-center min-h-screen p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-2xl w-full"
            >
              {/* Header del Menú */}
              <div className="text-center mb-12">
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                >
                  Mi Perfil
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-lg"
                >
                  Gestiona tu cuenta y configuraciones
                </motion.p>
              </div>

              {/* Perfil del Usuario - Centrado */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20"
              >
                <div className="flex flex-col lg:flex-row items-center space-y-6 lg:space-y-0 lg:space-x-8 text-center lg:text-left">
                  <div className="relative">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                      alt="Avatar"
                      className="w-24 h-24 lg:w-32 lg:h-32 rounded-2xl ring-4 ring-primary-500/30 shadow-2xl"
                    />
                    <div className="absolute -bottom-2 -right-2 w-6 h-6 lg:w-8 lg:h-8 bg-green-500 rounded-full border-4 border-slate-900 shadow-lg animate-pulse"></div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      Dr. {user?.nombre} {user?.apellidos}
                    </h2>
                    <p className="text-white/60 text-lg mb-4">{user?.email}</p>
                    <div className="flex flex-wrap justify-center lg:justify-start items-center gap-3">
                      <span className="px-4 py-2 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-300 font-medium">
                        {user?.rol}
                      </span>
                      <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-medium">En línea</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Grid de Opciones del Menú */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                {menuItems.map((item, index) => {
                  const Icon = item.icon;
                  const shouldShow = item.showOn === 'both' || 
                    (item.showOn === 'desktop' && window.innerWidth >= 1024) ||
                    (item.showOn === 'mobile' && window.innerWidth < 1024);

                  if (!shouldShow) return null;

                  return (
                    
                    <button
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log(`🔥 CLICK DETECTADO en: ${item.label}`);
                        if (item.label === 'Cerrar Sesión') {
                          console.log('🚪 EJECUTANDO LOGOUT DIRECTO');
                          logout();
                        } else {
                          item.action();
                        }
                      }}
                      className="relative bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden cursor-pointer"
                      style={{ 
                        opacity: 1,
                        transform: 'translateY(0)',
                        pointerEvents: 'auto',
                        zIndex: 10
                      }}
                    >
                      {/* Background gradient on hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex items-center space-x-4">
                        <div className={`p-4 rounded-xl ${item.color} bg-white/10 group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {item.label}
                          </h3>
                          <p className="text-white/60 text-sm">
                            {item.label === 'Ver Perfil' && 'Gestiona tu información personal'}
                            {item.label === 'Configuración' && 'Ajustes de la aplicación'}
                            {item.label === 'Notificaciones' && 'Revisa tus alertas'}
                            {item.label === 'Cerrar Sesión' && 'Salir de la aplicación'}
                          </p>
                        </div>
                        
                        {/* Badge para notificaciones */}
                        {item.badge && item.badge > 0 && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
                          >
                            {item.badge > 9 ? '9+' : item.badge}
                          </motion.div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </motion.div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-12"
              >
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-green-400 font-medium">Sistema Activo</p>
                </div>
                <p className="text-white/50 text-sm">
                  MollyVet v1.0.0 • © 2025 Sistema Veterinario
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TopMenu;