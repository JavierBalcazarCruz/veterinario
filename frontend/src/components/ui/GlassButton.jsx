// src/components/ui/GlassButton.jsx
import { motion } from 'framer-motion';
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
      hover:from-primary-400/90 hover:to-primary-500/90
      text-white
      shadow-lg shadow-primary-500/25
      border border-primary-400/30
    `,
    secondary: `
      bg-white/10 hover:bg-white/20
      text-white
      border border-white/20 hover:border-white/30
    `,
    danger: `
      bg-gradient-to-r from-red-500/80 to-red-600/80
      hover:from-red-400/90 hover:to-red-500/90
      text-white
      shadow-lg shadow-red-500/25
      border border-red-400/30
    `,
    ghost: `
      bg-transparent hover:bg-white/10
      text-white
      border border-transparent hover:border-white/20
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
    transition-all duration-300 ease-in-out
    transform active:scale-95
    focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    relative overflow-hidden
    flex items-center justify-center gap-2
  `;

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {/* Efecto de brillo al hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
      
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      
      {icon && !loading && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className="relative z-10">
        {children}
      </span>
    </motion.button>
  );
});

GlassButton.displayName = 'GlassButton';

export default GlassButton;