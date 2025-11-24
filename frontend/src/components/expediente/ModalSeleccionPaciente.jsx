/**
 * =====================================================
 * MODAL DE SELECCIÓN DE PACIENTE
 * =====================================================
 * Modal con efecto liquid glass que permite elegir entre:
 * - Paciente Nuevo (registrar nueva mascota)
 * - Paciente Registrado (buscar mascota existente)
 */

import { motion, AnimatePresence } from 'framer-motion';
import { X, PawPrint, Plus, Search } from 'lucide-react';

const ModalSeleccionPaciente = ({ isOpen, onClose, onSelectNuevo, onSelectRegistrado }) => {
  console.log('🎯 ModalSeleccionPaciente - isOpen:', isOpen);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        onClick={onClose}
      >
        {/* Backdrop con blur */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="absolute inset-0 bg-black/60"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-md"
        >
          {/* Card principal con liquid glass effect */}
          <div className="relative bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
            {/* Efectos de fondo */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 -right-10 w-40 h-40 bg-orange-500/30 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 -left-10 w-40 h-40 bg-blue-500/30 rounded-full blur-3xl"></div>
            </div>

            {/* Contenido */}
            <div className="relative z-10 p-6 md:p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">
                    Seleccionar Paciente
                  </h2>
                  <p className="text-white/60 text-sm">
                    Elige una opción para continuar
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Opciones */}
              <div className="space-y-4">
                {/* Opción 1: Paciente Nuevo */}
                <motion.button
                  onClick={() => {
                    console.log('✅ Click en Paciente Nuevo');
                    onSelectNuevo();
                    onClose();
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group"
                >
                  <div className="relative bg-gradient-to-br from-green-500/20 to-green-600/20 hover:from-green-500/30 hover:to-green-600/30 backdrop-blur-md rounded-2xl border-2 border-green-400/30 hover:border-green-400/50 p-6 transition-all duration-300 overflow-hidden">
                    {/* Efecto shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      {/* Icono */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-500/30 border border-green-400/50 flex items-center justify-center">
                        <div className="relative">
                          <PawPrint className="w-7 h-7 text-green-300" />
                          <Plus className="w-4 h-4 text-green-300 absolute -top-1 -right-1 bg-green-600 rounded-full" />
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-green-300 transition-colors">
                          Paciente Nuevo
                        </h3>
                        <p className="text-white/60 text-sm">
                          Registrar una nueva mascota en el sistema
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                        →
                      </div>
                    </div>
                  </div>
                </motion.button>

                {/* Opción 2: Paciente Registrado */}
                <motion.button
                  onClick={() => {
                    console.log('✅ Click en Paciente Registrado');
                    onSelectRegistrado();
                    onClose();
                  }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full group"
                >
                  <div className="relative bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30 backdrop-blur-md rounded-2xl border-2 border-blue-400/30 hover:border-blue-400/50 p-6 transition-all duration-300 overflow-hidden">
                    {/* Efecto shimmer */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      {/* Icono */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-500/30 border border-blue-400/50 flex items-center justify-center">
                        <div className="relative">
                          <Search className="w-7 h-7 text-blue-300" />
                          <PawPrint className="w-4 h-4 text-blue-300 absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-0.5" />
                        </div>
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 text-left">
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
                          Paciente Registrado
                        </h3>
                        <p className="text-white/60 text-sm">
                          Buscar y seleccionar una mascota existente
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="flex-shrink-0 text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                        →
                      </div>
                    </div>
                  </div>
                </motion.button>
              </div>

              {/* Footer info */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-white/50 text-xs text-center">
                  💡 Tip: Puedes usar <kbd className="px-2 py-0.5 bg-white/10 rounded text-white/70">Esc</kbd> para cerrar
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ModalSeleccionPaciente;
