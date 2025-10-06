// src/components/ui/GlassCard.jsx
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
    low: 'bg-white/5',      // Más realista: 10% → 5%
    medium: 'bg-white/8',   // Más realista: 20% → 8%
    high: 'bg-white/12'     // Más realista: 30% → 12%
  };

  const baseClasses = `
    ${blurClasses[blur]}
    ${opacityClasses[opacity]}
    ${border ? 'border border-white/15' : ''}
    ${shadow ? 'shadow-glass' : ''}
    rounded-2xl
    overflow-hidden
    relative
  `;

  // Estilos inline para forzar aceleración por hardware
  const optimizationStyles = {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform, opacity',
  };

  const hoverClasses = '';

  return (
    <div
      ref={ref}
      className={`${baseClasses} ${hoverClasses} ${className}`}
      style={optimizationStyles}
      {...props}
    >
      {/* Efecto de shimmer sutil - DESACTIVADO */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-glass-shimmer" /> */}
      
      {/* Borde interno para efecto glass - Gradiente más sutil */}
      {border && (
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      )}

      {children}
    </div>
  );
});

GlassCard.displayName = 'GlassCard';

export default GlassCard;