// src/components/layout/AppLayout.jsx - VERSIÓN CORREGIDA
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Wallpapers desde public folder (URL relativas)
const wallpapers = [
  '/wallpapers/vet-1.jpg',
  '/wallpapers/vet-2.jpg',
  '/wallpapers/vet-3.jpg',
];

const AppLayout = ({ children }) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(0);
  const location = useLocation();

  // Cambiar wallpaper basado en la ruta
  useEffect(() => {
    const routeWallpaperMap = {
      '/dashboard': 0,
      '/pacientes': 1,
      '/citas': 2,
    };
    
    // Buscar coincidencia exacta o parcial
    let wallpaperIndex = 0;
    for (const [route, index] of Object.entries(routeWallpaperMap)) {
      if (location.pathname.startsWith(route)) {
        wallpaperIndex = index;
        break;
      }
    }
    
    setCurrentWallpaper(wallpaperIndex);
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Wallpapers */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentWallpaper}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-0"
        >
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${wallpapers[currentWallpaper]})`,
            }}
          />
          {/* Overlay para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-primary-900/30 via-transparent to-blue-900/30" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen">
        {children}
      </div>

      {/* Floating Particles Effect */}
      <div className="fixed inset-0 z-15 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AppLayout;