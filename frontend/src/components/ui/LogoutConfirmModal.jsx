// src/components/ui/LogoutConfirmModal.jsx - Modal con efecto Liquid Glass
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PawPrint, LogOut } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onLogout, duration = 3, title = "Cerrando Sesión" }) => {
  const [countdown, setCountdown] = useState(duration);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(duration);
      setIsExiting(false);
      return;
    }

    // Countdown automático
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleExit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, duration]);

  const handleExit = () => {
    setIsExiting(true);
    // Esperar a que termine la animación antes de hacer logout
    setTimeout(() => {
      onLogout();
    }, 800); // Duración de la animación de salida
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
        {/* Backdrop con efecto Liquid Glass / Aero */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{
            opacity: 1,
            backdropFilter: 'blur(20px)'
          }}
          exit={{
            opacity: 0,
            backdropFilter: 'blur(0px)'
          }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 bg-gradient-to-br from-black/40 via-blue-900/30 to-purple-900/40"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, rgba(0, 0, 0, 0.6) 100%)'
          }}
        />

        {/* Efecto de cristal líquido adicional */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          exit={{ opacity: 0, scale: 1.2 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 30% 40%, rgba(139, 92, 246, 0.2) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 60%)',
            filter: 'blur(40px)'
          }}
        />

        {/* Modal con zoom out smooth */}
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.5,
            y: 50
          }}
          animate={isExiting ? {
            opacity: 0,
            scale: 0.3,
            y: -100,
            transition: {
              duration: 0.8,
              ease: [0.34, 1.56, 0.64, 1] // Ease out back
            }
          } : {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
              type: 'spring',
              damping: 20,
              stiffness: 300
            }
          }}
          className="relative z-10 w-full max-w-md"
        >
          {/* Card con efecto glass */}
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)',
              backdropFilter: 'blur(30px) saturate(180%)',
              WebkitBackdropFilter: 'blur(30px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              style={{
                width: '50%'
              }}
            />

            <div className="relative p-10">
              <div className="flex flex-col items-center text-center space-y-6">
                {/* Contenedor de huella con efectos */}
                <div className="relative">
                  {/* Anillos pulsantes */}
                  <motion.div
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(249, 115, 22, 0.4) 0%, transparent 70%)',
                      filter: 'blur(20px)'
                    }}
                  />

                  <motion.div
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.4, 0.7, 0.4]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%)',
                      filter: 'blur(25px)'
                    }}
                  />

                  {/* Huella principal girando */}
                  <motion.div
                    animate={{
                      rotate: 360
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                    className="relative p-8 rounded-full"
                    style={{
                      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      boxShadow: '0 8px 32px 0 rgba(249, 115, 22, 0.3), inset 0 2px 8px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <PawPrint size={56} className="text-white drop-shadow-lg" />
                  </motion.div>

                  {/* Partículas flotantes */}
                  {[...Array(6)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{
                        y: [0, -30, 0],
                        x: [0, Math.sin(i) * 20, 0],
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.5,
                        ease: "easeInOut"
                      }}
                      className="absolute w-2 h-2 bg-white/60 rounded-full blur-sm"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `rotate(${i * 60}deg) translateY(-60px)`
                      }}
                    />
                  ))}
                </div>

                {/* Título con efecto shimmer */}
                <div className="space-y-2">
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="text-3xl font-bold text-white drop-shadow-lg"
                    style={{
                      textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}
                  >
                    {title}
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-white/80 text-sm drop-shadow"
                  >
                    Hasta pronto, nos vemos pronto 👋
                  </motion.p>
                </div>

                {/* Countdown con efecto glass */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-full p-5 rounded-2xl relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                  }}
                >
                  {/* Barra de progreso */}
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: 0 }}
                    transition={{ duration: duration, ease: 'linear' }}
                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-blue-500 origin-left"
                  />

                  <div className="flex items-center justify-center space-x-3">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity
                      }}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-primary-400 to-blue-500 shadow-lg"
                    />
                    <span className="text-white/90 text-sm font-medium">
                      Redirigiendo en <span className="text-2xl font-bold text-white mx-2">{countdown}</span> segundo{countdown !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>

                {/* Botón con efecto glass */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{
                    scale: 1.05,
                    boxShadow: '0 10px 40px rgba(249, 115, 22, 0.4)'
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExit}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-white relative overflow-hidden group"
                  style={{
                    background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.9) 0%, rgba(234, 88, 12, 0.9) 100%)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: '0 4px 20px rgba(249, 115, 22, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                  }}
                >
                  {/* Hover shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                  />

                  <span className="relative flex items-center justify-center space-x-2">
                    <LogOut size={18} />
                    <span>Cerrar Sesión Ahora</span>
                  </span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogoutConfirmModal;
