// src/components/layout/AppLayout.jsx - LAYOUT PROFESIONAL CON SIDEBAR
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavigation from './MobileNavigation';
import { useTheme } from '../../context/ThemeContext';
// import DarkModeWallpaper from './DarkModeWallpaper'; // 🌙 Descomenta para usar el componente independiente

// Wallpapers temáticos mejorados
const wallpapers = [
  '/wallpapers/vet-1.jpg',
  '/wallpapers/vet-2.jpg', 
  '/wallpapers/vet-3.jpg',
];

// Temas de color para cada sección
const sectionThemes = {
  '/dashboard': {
    wallpaper: 0,
    gradient: 'from-blue-900/20 via-transparent to-purple-900/20',
    particles: 'from-blue-400/30 to-purple-400/30'
  },
  '/pacientes': {
    wallpaper: 1,
    gradient: 'from-green-900/20 via-transparent to-emerald-900/20', 
    particles: 'from-green-400/30 to-emerald-400/30'
  },
  '/citas': {
    wallpaper: 2,
    gradient: 'from-purple-900/20 via-transparent to-pink-900/20',
    particles: 'from-purple-400/30 to-pink-400/30'
  },
  '/historiales': {
    wallpaper: 0,
    gradient: 'from-orange-900/20 via-transparent to-red-900/20',
    particles: 'from-orange-400/30 to-red-400/30'
  },
  '/inventario': {
    wallpaper: 1,
    gradient: 'from-indigo-900/20 via-transparent to-blue-900/20',
    particles: 'from-indigo-400/30 to-blue-400/30'
  }
};

const AppLayout = ({ children, showSidebar = true, collapseSidebar = false }) => {
  const [currentTheme, setCurrentTheme] = useState(sectionThemes['/dashboard']);
  const location = useLocation();
  const { isDark } = useTheme();

  // Cambiar tema basado en la ruta
  useEffect(() => {
    // Buscar el tema más específico para la ruta actual
    let selectedTheme = sectionThemes['/dashboard']; // default
    
    for (const [route, theme] of Object.entries(sectionThemes)) {
      if (location.pathname.startsWith(route)) {
        selectedTheme = theme;
        break;
      }
    }
    
    setCurrentTheme(selectedTheme);
  }, [location.pathname]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen relative overflow-hidden bg-slate-900"
    >
      {/* Background Wallpaper Dinámico */}
      {/*
        🌙 MODO OSCURO DISPONIBLE:
        ===========================
        Para activar el modo oscuro, tienes 2 opciones:

        OPCIÓN 1 (Actual - Recomendada):
        Ya está implementado con filtro CSS. Solo descomenta el ThemeToggle en las páginas.

        OPCIÓN 2 (Componente Independiente):
        Reemplaza todo este bloque con:

        <AnimatePresence mode="wait">
          <motion.div key={currentTheme.wallpaper} className="fixed inset-0 z-0">
            <DarkModeWallpaper wallpaperUrl={wallpapers[currentTheme.wallpaper]} />
          </motion.div>
        </AnimatePresence>

        Ver: DARK_MODE_ACTIVATION_GUIDE.md para instrucciones completas
      */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTheme.wallpaper}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="fixed inset-0 z-0"
        >
          <div
            className="w-full h-full bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${wallpapers[currentTheme.wallpaper]})`,
              backgroundPosition: '50% 50%',
              backgroundAttachment: 'fixed'
            }}
          />
          {/* Overlay base para mejor legibilidad */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/30 to-black/50 backdrop-blur-[1px]"
          />

          {/* Overlay adicional para modo oscuro - Con transición suave */}
          {/* 🌙 FILTRO MODO OSCURO: Ya implementado y funcional */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isDark ? 1 : 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            style={{ mixBlendMode: 'multiply' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Temático Dinámico */}
      <motion.div
        key={`gradient-${location.pathname}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 z-10 bg-gradient-to-br ${currentTheme.gradient}`}
      />

      {/* Sidebar - Solo Desktop */}
      {showSidebar && <Sidebar forceCollapse={collapseSidebar} />}

      {/* Main Content Area */}
      <div className={`relative z-20 min-h-screen ${showSidebar ? 'lg:ml-80' : ''} transition-all duration-300`}>
        {children}
      </div>

      {/* Mobile Navigation - Solo Mobile */}
      <div className="lg:hidden">
        <MobileNavigation />
      </div>

      {/* Floating Particles - DESACTIVADO para mejor rendimiento */}
      {/* <div className="fixed inset-0 z-15 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            animate={{
              y: [-30, -120, -30],
              x: [-15, 15, -15],
              opacity: [0.1, 0.3, 0.1],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
            className={`absolute w-3 h-3 rounded-full bg-gradient-to-br ${currentTheme.particles} blur-sm`}
            style={{
              left: `${10 + (Math.random() * 80)}%`,
              top: `${10 + (Math.random() * 80)}%`,
            }}
          />
        ))}
      </div> */}

      {/* Ambient Light Effect - DESACTIVADO */}
      {/* <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className={`fixed top-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-radial ${currentTheme.particles} blur-3xl pointer-events-none z-5`}
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.05, 0.15, 0.05]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className={`fixed bottom-1/4 left-1/4 w-80 h-80 rounded-full bg-gradient-radial ${currentTheme.particles} blur-3xl pointer-events-none z-5`}
      /> */}

      {/* Status Indicator - Desktop Only */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-30">
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
          className="flex items-center space-x-2 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 bg-green-500 rounded-full"
          />
          <span className="text-white/60 text-xs font-medium">Sistema Activo</span>
        </motion.div>
      </div>

      {/* Footer Discreto */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="fixed bottom-2 left-1/2 transform -translate-x-1/2 z-5 pointer-events-none"
      >
        <p className="text-white/20 text-xs font-light">
          © 2025 MollyVet. Sistema de gestión veterinaria.
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default AppLayout;