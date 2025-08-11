// src/components/layout/Header.jsx - EJEMPLO DE CÓMO INTEGRAR TopMenu
import { motion } from 'framer-motion';
import TopMenu from './TopMenu';
import GlassCard from '../ui/GlassCard';

const Header = ({ title, subtitle, children }) => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 lg:p-6"
    >
      <GlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {/* Título y subtítulo */}
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                {title}
              </h1>
              {subtitle && (
                <p className="text-white/70">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Contenido adicional del header */}
            {children}
          </div>

          {/* ✅ TopMenu - Solo visible en desktop */}
          <div className="hidden lg:block">
            <TopMenu />
          </div>
        </div>
      </GlassCard>
    </motion.header>
  );
};

export default Header;