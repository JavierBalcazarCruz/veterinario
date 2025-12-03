/**
 * =====================================================
 * CARD DE EXAMEN FÍSICO POR SISTEMA
 * =====================================================
 * Card individual colapsable para cada sistema corporal
 * con grid responsive de 9 campos
 */

import { motion } from 'framer-motion';
import { useState } from 'react';
import { CheckCircle2, AlertCircle, Stethoscope } from 'lucide-react';

const ExamenFisicoCard = ({
  titulo,
  icono: Icono,
  color = 'blue',
  datos = {},
  onChange,
  defaultOpen = false,
  hideNormalToggle = false, // Prop para ocultar botones Normal/Anormal
  customCampos = null, // Prop para campos personalizados
  conBotonesIndividuales = false, // Prop para botones por campo
  leyendaSuperior = null // Prop para mostrar leyenda en lugar de botones
}) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className={`relative bg-gradient-to-br ${colorClasses[color]} backdrop-blur-md rounded-2xl border-2 border-opacity-100 transition-all duration-300 overflow-hidden`}>
        {/* Header fijo */}
        <div className="w-full px-4 md:px-6 py-4 flex items-center gap-3">
          {/* Icono */}
          {Icono && (
            <div className={`w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center ${colorClasses[color].split(' ')[2]}`}>
              <Icono className="w-5 h-5" />
            </div>
          )}

          {/* Título - Solo si existe */}
          {titulo && (
            <h3 className="font-bold text-white text-base md:text-lg">
              {titulo}
            </h3>
          )}
        </div>

        {/* Contenido siempre visible */}
        <div className="px-4 md:px-6 pb-4 space-y-4">
          {/* Instrucciones superiores con icono */}
          {leyendaSuperior && (
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-base mb-2">
                    {conBotonesIndividuales ? 'Instrucciones de Evaluación' : 'Instrucciones'}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed mb-3">
                    {leyendaSuperior}
                  </p>
                  {conBotonesIndividuales && (
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-green-500/30 border border-green-400/50 text-green-300 font-semibold">N</span>
                        <span className="text-white/60">= Normal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-lg bg-red-500/30 border border-red-400/50 text-red-300 font-semibold">A</span>
                        <span className="text-white/60">= Anormal</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botones Normal/Anormal si no hay leyenda ni está oculto */}
          {!leyendaSuperior && !hideNormalToggle && (
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
          )}

          {/* Grid de campos - Responsive mejorado para tablets */}
          <div className={conBotonesIndividuales ? 'space-y-2.5' : 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3'}>
            {(customCampos || campos).map((campo) => (
              <div key={campo.key}>
                {/* Si tiene botones individuales: label, input y botones en una fila */}
                {conBotonesIndividuales ? (
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                    <label className="text-white/90 text-xs md:text-sm font-semibold w-full md:w-auto md:min-w-[80px] md:max-w-[100px] shrink-0">
                      {campo.label}:
                    </label>
                    <input
                      type="text"
                      value={datos[campo.key] || ''}
                      onChange={(e) => handleFieldChange(campo.key, e.target.value)}
                      placeholder={campo.placeholder}
                      className="flex-1 w-full md:max-w-[200px] lg:max-w-none bg-white/5 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-white text-xs md:text-sm placeholder-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all"
                    />
                    <div className="flex items-center gap-1.5 w-full md:w-auto justify-end shrink-0">
                      <button
                        onClick={() => onChange(`${campo.key}_normal`, 'N')}
                        className={`px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          datos[`${campo.key}_normal`] === 'N'
                            ? 'bg-green-500/30 border-2 border-green-400/50 text-green-300 shadow-lg'
                            : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        N
                      </button>
                      <button
                        onClick={() => onChange(`${campo.key}_normal`, 'A')}
                        className={`px-2.5 md:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          datos[`${campo.key}_normal`] === 'A'
                            ? 'bg-red-500/30 border-2 border-red-400/50 text-red-300 shadow-lg'
                            : 'bg-white/5 border border-white/10 text-white/40 hover:bg-white/10'
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <label className="text-white/80 text-xs md:text-sm font-semibold min-w-[45px] md:min-w-[55px] shrink-0">
                      {campo.label}:
                    </label>
                    <input
                      type="text"
                      value={datos[campo.key] || ''}
                      onChange={(e) => handleFieldChange(campo.key, e.target.value)}
                      placeholder={campo.placeholder}
                      className="flex-1 w-full bg-white/5 border border-white/10 rounded-lg px-2 md:px-3 py-1.5 md:py-2 text-white text-xs md:text-sm placeholder-white/30 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExamenFisicoCard;
