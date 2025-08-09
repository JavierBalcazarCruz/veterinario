// src/components/layout/AppLayout.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Lista de wallpapers (puedes agregar más)
const wallpapers = [
  '/wallpapers/vet-1.jpg', // Agrega tus wallpapers aquí
  '/wallpapers/vet-2.jpg',
  '/wallpapers/vet-3.jpg',
];

const AppLayout = ({ children }) => {
  const [currentWallpaper, setCurrentWallpaper] = useState(0);
  const location = useLocation();

  // Cambiar wallpaper basado en la ruta (opcional)
  useEffect(() => {
    const routeWallpaperMap = {
      '/': 0,
      '/pacientes': 1,
      '/citas': 2,
    };
    
    const wallpaperIndex = routeWallpaperMap[location.pathname] ?? 0;
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
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-10 bg-gradient-to-br from-primary-900/20 via-transparent to-blue-900/20" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen">
        {children}
      </div>

      {/* Floating Particles Effect (opcional) */}
      <div className="fixed inset-0 z-15 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -100, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 6 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
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