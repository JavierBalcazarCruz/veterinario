// src/components/layout/MobileNavigation.jsx
import { motion } from 'framer-motion';
import { Home, Users, Calendar, Settings, PawPrint } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const MobileNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

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
    },
    {
      name: 'Config',
      icon: Settings,
      path: '/configuracion',
      color: 'from-gray-400 to-gray-600'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
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
        </div>
      </div>

      {/* Indicador de home para iPhone */}
      <div className="h-safe-area-inset-bottom bg-black/20 backdrop-blur-xl" />
    </motion.nav>
  );
};

export default MobileNavigation;