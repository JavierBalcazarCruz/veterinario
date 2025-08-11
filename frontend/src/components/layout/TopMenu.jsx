// src/components/layout/TopMenu.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      showOn: 'both' // 'desktop', 'mobile', 'both'
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
      showOn: 'mobile', // Solo mostrar en móvil
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
        <div className="relative" ref={menuRef}>
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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

          {/* Menú Desplegable */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-72 z-50"
              >
                <GlassCard className="p-6 shadow-2xl">
                  {/* Header del menú */}
                  <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
                    <img
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold truncate">
                        Dr. {user?.nombre} {user?.apellidos}
                      </h3>
                      <p className="text-white/60 text-sm">
                        {user?.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="px-2 py-1 bg-primary-500/20 border border-primary-400/30 rounded-md">
                          <span className="text-primary-300 text-xs font-medium">
                            {user?.rol}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-green-400 text-xs">En línea</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items del menú */}
                  <div className="space-y-1">
                    {menuItems.map((item, index) => {
                      const Icon = item.icon;
                      const shouldShow = item.showOn === 'both' || 
                        (item.showOn === 'desktop' && window.innerWidth >= 1024) ||
                        (item.showOn === 'mobile' && window.innerWidth < 1024);

                      if (!shouldShow) return null;

                      return (
                        <div key={index}>
                          {item.separator && (
                            <div className="my-2 border-t border-white/10"></div>
                          )}
                          <motion.button
                            onClick={item.action}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                          >
                            <div className={`p-2 bg-white/10 rounded-lg ${item.color} group-hover:bg-white/20 transition-colors duration-200`}>
                              <Icon size={18} />
                            </div>
                            <span className="text-white font-medium flex-1 text-left">
                              {item.label}
                            </span>
                            
                            {/* Badge para notificaciones */}
                            {item.badge && item.badge > 0 && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              >
                                {item.badge > 9 ? '9+' : item.badge}
                              </motion.div>
                            )}
                            
                            {/* Arrow indicator */}
                            <motion.div
                              className="text-white/40 group-hover:text-white/60 transition-colors duration-200"
                              whileHover={{ x: 2 }}
                            >
                              →
                            </motion.div>
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer del menú */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-center">
                      <p className="text-white/50 text-xs">
                        MollyVet v1.0.0
                      </p>
                      <p className="text-white/40 text-xs">
                        © 2025 Sistema Veterinario
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TopMenu;