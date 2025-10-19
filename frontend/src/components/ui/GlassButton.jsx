// src/components/ui/GlassButton.jsx
import { forwardRef } from 'react';

const GlassButton = forwardRef(({ 
  children, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  className = '',
  ...props 
}, ref) => {

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-500/80 to-primary-600/80
      text-white
      shadow-lg shadow-primary-500/25
      border border-primary-400/30
    `,
    secondary: `
      bg-white/5
      text-white
      border border-white/15
    `,
    success: `
      bg-gradient-to-r from-green-500/80 to-green-600/80
      text-white
      shadow-lg shadow-green-500/25
      border border-green-400/30
    `,
    danger: `
      bg-gradient-to-r from-red-500/80 to-red-600/80
      text-white
      shadow-lg shadow-red-500/25
      border border-red-400/30
    `,
    ghost: `
      bg-transparent
      text-white
      border border-transparent
    `
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-lg',
    md: 'px-4 py-3 text-base rounded-xl',
    lg: 'px-6 py-4 text-lg rounded-xl',
    xl: 'px-8 py-5 text-xl rounded-2xl'
  };

  const baseClasses = `
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    backdrop-blur-md
    font-medium
    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed
    relative overflow-hidden
    flex items-center justify-center gap-2
  `;

  // Estilos inline para optimización de rendimiento
  const optimizationStyles = {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    willChange: 'transform',
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${className}`}
      style={optimizationStyles}
      disabled={disabled || loading}
      {...props}
    >
      {/* Efecto de brillo al hover - DESACTIVADO */}
      {/* <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" /> */}
      
      {loading && (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {icon && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="relative z-10">
        {children}
      </span>
    </button>
  );
});

GlassButton.displayName = 'GlassButton';

export default GlassButton;