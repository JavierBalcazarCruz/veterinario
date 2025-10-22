/**
 * =====================================================
 * COMPONENTE DE TOGGLE DE TEMA
 * =====================================================
 * Botón para cambiar entre tema oscuro y claro
 */

import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        relative w-14 h-7 rounded-full p-1
        ${isDark ? 'bg-blue-600' : 'bg-yellow-400'}
        transition-colors duration-300
        ${className}
      `}
      aria-label="Cambiar tema"
    >
      {/* Círculo deslizante */}
      <motion.div
        className={`
          w-5 h-5 rounded-full bg-white
          flex items-center justify-center
          shadow-lg
        `}
        animate={{
          x: isDark ? 0 : 24
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-blue-600" />
        ) : (
          <Sun className="w-3 h-3 text-yellow-600" />
        )}
      </motion.div>

      {/* Iconos de fondo */}
      <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
        <Moon className={`w-3 h-3 ${isDark ? 'text-white' : 'text-white/30'} transition-colors`} />
        <Sun className={`w-3 h-3 ${isDark ? 'text-white/30' : 'text-white'} transition-colors`} />
      </div>
    </motion.button>
  );
};

export default ThemeToggle;
