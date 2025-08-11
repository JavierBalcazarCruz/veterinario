// src/components/layout/MobileNavigation.jsx - ACTUALIZADA
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Home, Users, Calendar, Settings, PawPrint, User, LogOut, Bell, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications] = useState(3); // Ejemplo

  const navigationItems = [
    {
      name: 'Inicio',
      icon: Home,
      path: '/dashboard',
      color: 'from-blue-400 to-blue-600'
    },
    {
      name: 'Pacientes',
      icon: PawPrint,
      path: '/pacientes',
      color: 'from-green-400 to-green-600'
    },
    {
      name: 'Citas',
      icon: Calendar,
      path: '/citas',
      color: 'from-purple-400 to-purple-600'
    },
    {
      name: 'Equipo',
      icon: Users,
      path: '/equipo',
      color: 'from-orange-400 to-orange-600'
    }
  ];

  const handleNavigation = (path) => {
    if (path === '/config') {
      // ✅ CORREGIDO: Abrir menú de perfil en lugar de ir a dashboard
      setShowProfileMenu(true);
    } else {
      navigate(path);
      setShowProfileMenu(false);
    }
  };

  const handleProfileMenuAction = (action) => {
    setShowProfileMenu(false);
    action();
  };

  const getInitials = (nombre, apellidos) => {
    const firstInitial = nombre?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  const profileMenuItems = [
    {
      icon: User,
      label: 'Ver Perfil',
      action: () => navigate('/perfil'),
      color: 'text-blue-400'
    },
    {
      icon: Settings,
      label: 'Configuración',
      action: () => navigate('/configuracion'),
      color: 'text-purple-400'
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      action: () => navigate('/notificaciones'),
      color: 'text-yellow-400',
      badge: notifications
    },
    {
      icon: LogOut,
      label: 'Cerrar Sesión',
      action: logout,
      color: 'text-red-400',
      separator: true
    }
  ];

  return (
    <>
      {/* Navegación Móvil */}
      <motion.nav
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="fixed bottom-0 left-0 right-0 lg:hidden z-40"
      >
        {/* Backdrop con glassmorphism */}
        <div className="backdrop-blur-xl bg-white/10 border-t border-white/20 px-4 py-2">
          <div className="flex items-center justify-around">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className="flex flex-col items-center justify-center p-2 min-w-[60px] relative"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {/* Indicador activo */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r ${item.color} rounded-full`}
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}

                  {/* Fondo activo */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-xl opacity-20`}
                    />
                  )}

                  {/* Icono */}
                  <motion.div
                    animate={{
                      scale: isActive ? 1.1 : 1,
                      color: isActive ? '#ffffff' : '#ffffff80'
                    }}
                    transition={{ duration: 0.2 }}
                    className="mb-1 relative z-10"
                  >
                    <Icon size={20} />
                  </motion.div>

                  {/* Label */}
                  <motion.span
                    animate={{
                      color: isActive ? '#ffffff' : '#ffffff60',
                      fontWeight: isActive ? '600' : '400'
                    }}
                    className="text-xs relative z-10"
                  >
                    {item.name}
                  </motion.span>

                  {/* Efecto de ripple al hacer tap */}
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl"
                    initial={{ scale: 0, opacity: 0 }}
                    whileTap={{ scale: 1.2, opacity: 0.3 }}
                    transition={{ duration: 0.1 }}
                  />
                </motion.button>
              );
            })}

            {/* ✅ BOTÓN DE CONFIGURACIÓN/PERFIL */}
            <motion.button
              onClick={() => handleNavigation('/config')}
              className="flex flex-col items-center justify-center p-2 min-w-[60px] relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * navigationItems.length }}
            >
              {/* Avatar en lugar de icono de settings */}
              <div className="relative mb-1">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                  alt="Perfil"
                  className="w-6 h-6 rounded-md"
                />
                {notifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </motion.div>
                )}
              </div>

              <span className="text-xs text-white/60">
                Perfil
              </span>

              {/* Efecto de ripple al hacer tap */}
              <motion.div
                className="absolute inset-0 bg-white/20 rounded-xl"
                initial={{ scale: 0, opacity: 0 }}
                whileTap={{ scale: 1.2, opacity: 0.3 }}
                transition={{ duration: 0.1 }}
              />
            </motion.button>
          </div>
        </div>

        {/* Indicador de home para iPhone */}
        <div className="h-safe-area-inset-bottom bg-black/20 backdrop-blur-xl" />
      </motion.nav>

      {/* ✅ MENÚ DE PERFIL MÓVIL */}
      <AnimatePresence>
        {showProfileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowProfileMenu(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal del menú */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-8"
            >
              <GlassCard className="p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-white">
                    Mi Cuenta
                  </h2>
                  <motion.button
                    onClick={() => setShowProfileMenu(false)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <X size={20} className="text-white" />
                  </motion.button>
                </div>

                {/* Info del usuario */}
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b border-white/10">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                    alt="Avatar"
                    className="w-16 h-16 rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold truncate">
                      Dr. {user?.nombre} {user?.apellidos}
                    </h3>
                    <p className="text-white/60 text-sm truncate">
                      {user?.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className="px-3 py-1 bg-primary-500/20 border border-primary-400/30 rounded-lg">
                        <span className="text-primary-300 text-xs font-medium">
                          {user?.rol}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="space-y-2">
                  {profileMenuItems.map((item, index) => {
                    const Icon = item.icon;
                    
                    return (
                      <div key={index}>
                        {item.separator && (
                          <div className="my-3 border-t border-white/10"></div>
                        )}
                        <motion.button
                          onClick={() => handleProfileMenuAction(item.action)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * index }}
                          className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-white/10 transition-all duration-200"
                        >
                          <div className={`p-3 bg-white/10 rounded-lg ${item.color}`}>
                            <Icon size={20} />
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
                          
                          <motion.div
                            className="text-white/40"
                            whileHover={{ x: 2 }}
                          >
                            →
                          </motion.div>
                        </motion.button>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 text-center">
                  <p className="text-white/50 text-xs">
                    MollyVet v1.0.0 • © 2025
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileNavigation;