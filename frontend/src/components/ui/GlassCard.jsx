// src/components/ui/GlassCard.jsx
import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const GlassCard = forwardRef(({ 
  children, 
  className = '', 
  hover = true, 
  blur = 'md',
  opacity = 'low',
  border = true,
  shadow = true,
  ...props 
}, ref) => {
  
  const blurClasses = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl'
  };

  const opacityClasses = {
    low: 'bg-white/10',
    medium: 'bg-white/20',
    high: 'bg-white/30'
  };

  const baseClasses = `
    ${blurClasses[blur]}
    ${opacityClasses[opacity]}
    ${border ? 'border border-white/20' : ''}
    ${shadow ? 'shadow-glass' : ''}
    rounded-2xl
    overflow-hidden
    relative
    transition-all duration-300 ease-in-out
  `;

  const hoverClasses = hover ? `
    hover:bg-white/25
    hover:shadow-xl
    hover:shadow-white/10
    hover:border-white/30
    hover:-translate-y-1
  ` : '';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      {...props}
    >
      {/* Efecto de shimmer sutil - DESACTIVADO */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-glass-shimmer" /> */}
      
      {/* Borde interno para efecto glass */}
      {border && (
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
      )}
      
      {children}
    </motion.div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;