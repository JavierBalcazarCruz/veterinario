/**
 * =====================================================
 * CARD DE EXAMEN FÍSICO POR SISTEMA
 * =====================================================
 * Card individual colapsable para cada sistema corporal
 * con grid responsive de 9 campos
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';

const ExamenFisicoCard = ({
  titulo,
  icono: Icono,
  color = 'blue',
  datos = {},
  onChange,
  defaultOpen = false
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [esNormal, setEsNormal] = useState(datos.normal === 'N');

  // Definir los campos del examen físico
  const campos = [
    { key: 'dh', label: 'DH', placeholder: 'Ej: 37.5°C' },
    { key: 'fc', label: 'FC', placeholder: 'Ej: 80 bpm' },
    { key: 'cc', label: 'CC', placeholder: 'Condición' },
    { key: 'fr', label: 'FR', placeholder: 'Ej: 20 rpm' },
    { key: 'tllc', label: 'TLLC', placeholder: 'Ej: 2 seg' },
    { key: 'rt', label: 'RT', placeholder: 'Reflejo' },
    { key: 'rd', label: 'RD', placeholder: 'Resp. Dolor' },
    { key: 'ps_pd', label: 'PS/PD', placeholder: 'Ej: 120/80' },
    { key: 'pam', label: 'PAM', placeholder: 'Ej: 93' }
  ];

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30 text-blue-400',
    green: 'from-green-500/20 to-green-600/20 border-green-400/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-400/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-400/30 text-orange-400',
    red: 'from-red-500/20 to-red-600/20 border-red-400/30 text-red-400',
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-400/30 text-cyan-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-400/30 text-pink-400'
  };

  const toggleNormal = () => {
    const nuevoEstado = !esNormal;
    setEsNormal(nuevoEstado);
    onChange('normal', nuevoEstado ? 'N' : 'A');
  };

  const handleFieldChange = (key, value) => {
    onChange(key, value);
  };

  // Verificar si tiene datos completados
  const tieneDatos = Object.values(datos).some(val => val && val !== '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className={`relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md rounded-2xl border-2 transition-all duration-300 overflow-hidden ${
        isOpen ? 'border-opacity-100' : 'border-opacity-50'
      }`}>
        {/* Header colapsable */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {/* Icono */}
            <div className={`w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ${colorClasses[color].split(' ')[2]}`}>
              <Icono className="w-5 h-5" />
            </div>

            {/* Título */}
            <div className="text-left">
              <h3 className="font-bold text-white text-base md:text-lg">
                {titulo}
              </h3>
              {tieneDatos && !isOpen && (
                <p className="text-xs text-white/50">Datos completados</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Indicador Normal/Anormal */}
            <div className="flex items-center gap-2">
              {esNormal ? (
                <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 border border-green-400/40 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-green-300">Normal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 bg-red-500/20 border border-red-400/40 rounded-full">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-red-300">Anormal</span>
                </div>
              )}
            </div>

            {/* Icono expandir/colapsar */}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-white/70"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </button>

        {/* Contenido colapsable */}
        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, maxHeight: 0 }}
              animate={{ opacity: 1, maxHeight: 1000 }}
              exit={{ opacity: 0, maxHeight: 0 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="overflow-hidden"
            >
              <div className="px-4 md:px-6 pb-4 space-y-4">
                {/* Toggle rápido Normal/Anormal */}
                <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={toggleNormal}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      esNormal
                        ? 'bg-green-500/30 border-2 border-green-400/50 text-green-300 shadow-lg shadow-green-500/20'
                        : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    ✓ Normal (N)
                  </button>
                  <button
                    onClick={toggleNormal}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      !esNormal
                        ? 'bg-red-500/30 border-2 border-red-400/50 text-red-300 shadow-lg shadow-red-500/20'
                        : 'bg-white/5 border border-white/10 text-white/50 hover:bg-white/10'
                    }`}
                  >
                    ⚠ Anormal (A)
                  </button>
                </div>

                {/* Grid de campos - Responsive: 1 col en móvil, 2 en tablet, 3 en desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {campos.map((campo) => (
                    <div key={campo.key} className="space-y-1.5">
                      <label className="text-white/70 text-xs md:text-sm font-medium block">
                        {campo.label}
                      </label>
                      <input
                        type="text"
                        value={datos[campo.key] || ''}
                        onChange={(e) => handleFieldChange(campo.key, e.target.value)}
                        placeholder={campo.placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ExamenFisicoCard;
