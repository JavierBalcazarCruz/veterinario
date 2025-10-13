// src/components/ui/Modal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Componente Modal reutilizable con Portal
 *
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback cuando se cierra el modal
 * @param {string} title - Título del modal
 * @param {string} subtitle - Subtítulo opcional
 * @param {ReactNode} children - Contenido del modal
 * @param {ReactNode} footer - Contenido del footer (botones de acción)
 * @param {string} size - Tamaño del modal: 'sm', 'md', 'lg', 'xl', 'full'
 * @param {boolean} closeOnClickOutside - Si permite cerrar al hacer clic fuera (default: true)
 * @param {boolean} closeOnEsc - Si permite cerrar con tecla ESC (default: true)
 * @param {boolean} showCloseButton - Muestra botón X para cerrar (default: true)
 * @param {string} variant - Variante de estilo: 'default', 'danger', 'success', 'warning'
 * @param {ReactNode} icon - Ícono opcional en el header
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnClickOutside = true,
  closeOnEsc = true,
  showCloseButton = true,
  variant = 'default',
  icon
}) => {
  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      // Guardar posición actual del scroll
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      // Restaurar scroll al cerrar
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      // Cleanup: restaurar en caso de desmontaje
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen]);

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, closeOnEsc, onClose]);

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };

  // Colores según variante
  const variantStyles = {
    default: {
      iconBg: 'bg-primary-500/20',
      iconColor: 'text-primary-400'
    },
    danger: {
      iconBg: 'bg-red-500/20',
      iconColor: 'text-red-400'
    },
    success: {
      iconBg: 'bg-green-500/20',
      iconColor: 'text-green-400'
    },
    warning: {
      iconBg: 'bg-yellow-500/20',
      iconColor: 'text-yellow-400'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        className="bg-black/70 backdrop-blur-sm p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && closeOnClickOutside) {
            onClose?.();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={`bg-gray-900/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full ${sizeClasses[size]}`}
          style={{
            maxHeight: '85vh',
            overflowY: 'auto',
            margin: 'auto'
          }}
        >
          {/* Header */}
          {(title || icon || showCloseButton) && (
            <div className="p-5 sm:p-6 border-b border-white/10">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {icon && (
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${currentVariant.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <div className={currentVariant.iconColor}>
                        {icon}
                      </div>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {title}
                      </h3>
                    )}
                    {subtitle && (
                      <p className="text-white/60 text-xs sm:text-sm mt-1">
                        {subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
                  >
                    <X size={20} className="text-white/70" />
                  </motion.button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="p-5 sm:p-6">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-5 sm:p-6 border-t border-white/10">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default Modal;
