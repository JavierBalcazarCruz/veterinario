// src/components/layout/Sidebar.jsx - SIDEBAR PROFESIONAL Y ESCALABLE
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  PawPrint, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  BarChart3,
  Pill,
  CreditCard,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import GlassCard from '../ui/GlassCard';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showAllItems, setShowAllItems] = useState(false);

  // Módulos principales - organizados por categorías
  const navigationModules = [
    {
      section: 'Principal',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: Home,
          path: '/dashboard',
          color: 'from-blue-500 to-blue-600',
          description: 'Resumen general del sistema'
        },
        {
          id: 'pacientes',
          label: 'Pacientes',
          icon: PawPrint,
          path: '/pacientes',
          color: 'from-green-500 to-green-600',
          description: 'Gestión de mascotas y propietarios',
          badge: '127' // Ejemplo de badge dinámico
        },
        {
          id: 'citas',
          label: 'Citas Médicas',
          icon: Calendar,
          path: '/citas',
          color: 'from-purple-500 to-purple-600',
          description: 'Programación y seguimiento de citas',
          badge: '8' // Citas pendientes hoy
        }
      ]
    },
    {
      section: 'Gestión Clínica',
      items: [
        {
          id: 'historiales',
          label: 'Historiales Médicos',
          icon: FileText,
          path: '/historiales',
          color: 'from-orange-500 to-orange-600',
          description: 'Expedientes médicos completos',
          comingSoon: true
        },
        {
          id: 'tratamientos',
          label: 'Tratamientos',
          icon: Pill,
          path: '/tratamientos',
          color: 'from-pink-500 to-pink-600',
          description: 'Medicamentos y terapias',
          comingSoon: true
        },
        {
          id: 'inventario',
          label: 'Inventario',
          icon: BarChart3,
          path: '/inventario',
          color: 'from-indigo-500 to-indigo-600',
          description: 'Control de medicamentos y suministros',
          comingSoon: true
        }
      ]
    },
    {
      section: 'Administración',
      items: [
        {
          id: 'facturacion',
          label: 'Facturación',
          icon: CreditCard,
          path: '/facturacion',
          color: 'from-teal-500 to-teal-600',
          description: 'Gestión de pagos y facturas',
          comingSoon: true
        },
        {
          id: 'equipo',
          label: 'Equipo Médico',
          icon: Users,
          path: '/equipo',
          color: 'from-cyan-500 to-cyan-600',
          description: 'Personal y roles del equipo',
          comingSoon: true
        },
        {
          id: 'reportes',
          label: 'Reportes',
          icon: BarChart3,
          path: '/reportes',
          color: 'from-emerald-500 to-emerald-600',
          description: 'Estadísticas y análisis',
          comingSoon: true
        }
      ]
    }
  ];

  const utilityItems = [
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: Settings,
      action: () => navigate('/configuracion'),
      color: 'from-gray-500 to-gray-600'
    },
    {
      id: 'perfil',
      label: 'Mi Perfil',
      icon: User,
      action: () => navigate('/perfil'),
      color: 'from-violet-500 to-violet-600'
    }
  ];

  const handleNavigation = (item) => {
    if (item.comingSoon) {
      // Navegar a la página de "Próximamente" con el ID del módulo
      const moduleId = item.path.replace('/', '');
      navigate(`/coming-soon/${moduleId}`);
      return;
    }
    if (item.path) {
      navigate(item.path);
    } else if (item.action) {
      item.action();
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getInitials = (nombre, apellidos) => {
    const firstInitial = nombre?.charAt(0)?.toUpperCase() || '';
    const lastInitial = apellidos?.charAt(0)?.toUpperCase() || '';
    return `${firstInitial}${lastInitial}`;
  };

  return (
    <motion.div
      initial={{ x: -320 }}
      animate={{ x: 0, width: isCollapsed ? 72 : 320 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed left-0 top-0 h-full z-40 hidden lg:block"
    >
      <GlassCard className="h-full rounded-none rounded-r-3xl border-l-0 overflow-hidden">
        <div className={`flex flex-col h-full ${isCollapsed ? 'p-3' : 'p-6'}`}>
          {/* Header del Sidebar */}
          <div className="flex items-center justify-between mb-8">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                    <PawPrint className="text-white" size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-white">MollyVet</h1>
                    <p className="text-xs text-white/60">Sistema Veterinario</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={() => setIsCollapsed(!isCollapsed)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              {isCollapsed ? 
                <ChevronRight className="text-white" size={16} /> : 
                <ChevronLeft className="text-white" size={16} />
              }
            </motion.button>
          </div>

          {/* Profile Quick Access */}
          <motion.div
            className={`mb-6 bg-white/5 rounded-2xl ${isCollapsed ? 'p-2' : 'p-4'}`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center space-x-3">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${getInitials(user?.nombre, user?.apellidos)}&backgroundColor=f97316,ea580c&textColor=ffffff`}
                alt="Avatar"
                className="w-10 h-10 rounded-xl"
              />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <p className="text-white font-medium text-sm">
                      Dr. {user?.nombre}
                    </p>
                    <p className="text-white/60 text-xs">{user?.rol}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Navigation Sections */}
          <div className={`flex-1 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto scrollbar-thin scrollbar-thumb-white/10'}`}>
            {/* Siempre mostrar la sección Principal */}
            <div className="mb-8">
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-2"
                  >
                    {navigationModules[0].section}
                  </motion.h3>
                )}
              </AnimatePresence>
              
              <div className="space-y-1">
                {navigationModules[0].items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  const isHovered = hoveredItem === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavigation(item)}
                      onHoverStart={() => setHoveredItem(item.id)}
                      onHoverEnd={() => setHoveredItem(null)}
                      disabled={item.comingSoon}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                      className={`relative w-full flex items-center ${isCollapsed ? 'justify-center py-4 px-3' : 'space-x-3 p-3'} rounded-xl transition-all duration-300 group ${
                        isActive 
                          ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                          : item.comingSoon
                            ? 'text-white/30 cursor-not-allowed'
                            : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {/* Background gradient on hover */}
                      {!isActive && !item.comingSoon && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: isHovered ? 0.1 : 0 }}
                          className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl`}
                        />
                      )}
                      
                      {/* Icon */}
                      {isCollapsed ? (
                        <Icon size={20} className="relative z-10" />
                      ) : (
                        <div className={`relative z-10 p-2 rounded-lg ${
                          isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                        } flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                      )}
                      
                      {/* Label and Description */}
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="flex-1 text-left relative z-10"
                          >
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm">{item.label}</p>
                              {item.badge && (
                                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                  {item.badge}
                                </span>
                              )}
                              {item.comingSoon && (
                                <span className="bg-white/20 text-white/60 text-xs px-2 py-0.5 rounded-full">
                                  Pronto
                                </span>
                              )}
                            </div>
                            <p className="text-xs opacity-70 mt-0.5">{item.description}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                        />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Resto de secciones - Solo cuando expandido O cuando showAllItems está activo */}
            <AnimatePresence>
              {(!isCollapsed || showAllItems) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={isCollapsed && showAllItems ? 'overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-white/10' : ''}
                >
                  {navigationModules.slice(1).map((section, sectionIndex) => (
                    <div key={section.section} className="mb-8">
                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.h3
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3 px-2"
                          >
                            {section.section}
                          </motion.h3>
                        )}
                      </AnimatePresence>
                      
                      <div className="space-y-1">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          const isActive = location.pathname === item.path;
                          const isHovered = hoveredItem === item.id;
                          
                          return (
                            <motion.button
                              key={item.id}
                              onClick={() => handleNavigation(item)}
                              onHoverStart={() => setHoveredItem(item.id)}
                              onHoverEnd={() => setHoveredItem(null)}
                              disabled={item.comingSoon}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (sectionIndex + 1) * 0.1 + itemIndex * 0.05 }}
                              className={`relative w-full flex items-center ${isCollapsed ? 'justify-center py-4 px-3' : 'space-x-3 p-3'} rounded-xl transition-all duration-300 group ${
                                isActive 
                                  ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                                  : item.comingSoon
                                    ? 'text-white/30 cursor-not-allowed'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                              }`}
                            >
                              {/* Background gradient on hover */}
                              {!isActive && !item.comingSoon && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: isHovered ? 0.1 : 0 }}
                                  className={`absolute inset-0 bg-gradient-to-r ${item.color} rounded-xl`}
                                />
                              )}
                              
                              {/* Icon */}
                              {isCollapsed ? (
                                <Icon size={20} className="relative z-10" />
                              ) : (
                                <div className={`relative z-10 p-2 rounded-lg ${
                                  isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                                } flex items-center justify-center`}>
                                  <Icon size={18} />
                                </div>
                              )}
                              
                              {/* Label and Description */}
                              <AnimatePresence mode="wait">
                                {!isCollapsed && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="flex-1 text-left relative z-10"
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="font-medium text-sm">{item.label}</p>
                                      {item.badge && (
                                        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                                          {item.badge}
                                        </span>
                                      )}
                                      {item.comingSoon && (
                                        <span className="bg-white/20 text-white/60 text-xs px-2 py-0.5 rounded-full">
                                          Pronto
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs opacity-70 mt-0.5">{item.description}</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {/* Active indicator */}
                              {isActive && (
                                <motion.div
                                  layoutId="activeIndicator"
                                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                                />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botón "Ver más" cuando está colapsado */}
            {isCollapsed && !showAllItems && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAllItems(true)}
                className="w-full p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-xs font-medium"
              >
                ⋯ Ver más
              </motion.button>
            )}

            {/* Botón "Ver menos" cuando está expandido en modo colapsado */}
            {isCollapsed && showAllItems && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowAllItems(false)}
                className="w-full p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 text-xs font-medium"
              >
                ⋯ Ver menos
              </motion.button>
            )}
          </div>

          {/* Utility Actions - Siempre visibles */}
          <div className="border-t border-white/10 pt-4 space-y-1">
            {/* Perfil y Configuración - Siempre visibles */}
            {utilityItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={item.action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center py-4 px-3' : 'space-x-3 p-3'} text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200`}
                >
                  {isCollapsed ? (
                    <Icon size={18} />
                  ) : (
                    <div className="p-2 bg-white/5 rounded-lg flex items-center justify-center">
                      <Icon size={16} />
                    </div>
                  )}
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.label}</span>
                          {item.badge && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}

            {/* Logout Button - Siempre visible */}
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'space-x-3 p-3'} text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200 ${isCollapsed ? '' : 'border border-red-500/20'}`}
            >
              {isCollapsed ? (
                <LogOut size={18} />
              ) : (
                <div className="p-2 bg-red-500/10 rounded-lg flex items-center justify-center">
                  <LogOut size={16} />
                </div>
              )}
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium text-sm"
                  >
                    Cerrar Sesión
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default Sidebar;