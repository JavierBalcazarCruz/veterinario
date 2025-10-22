/**
 * =====================================================
 * TIMELINE DE HISTORIAL CLÍNICO
 * =====================================================
 * Vista cronológica del historial médico del paciente
 */

import { motion } from 'framer-motion';
import {
  Activity,
  Calendar
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

/**
 * Componente principal de Timeline
 */
const TimelineZoomable = ({ items, total, paginaActual, totalPaginas, onCambiarPagina }) => {

  if (items.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No se encontraron registros
        </h3>
        <p className="text-white/60">
          Intenta ajustar los filtros de búsqueda
        </p>
      </GlassCard>
    );
  }

  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-400/30 text-blue-400',
    green: 'bg-green-500/20 border-green-400/30 text-green-400',
    purple: 'bg-purple-500/20 border-purple-400/30 text-purple-400',
    red: 'bg-red-500/20 border-red-400/30 text-red-400',
    indigo: 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
  };

  return (
    <div className="space-y-4">
      {/* Barra de información */}
      <GlassCard className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Info */}
          <div className="flex items-center gap-4">
            <p className="text-white/60">
              {items.length === total
                ? `Mostrando las últimas ${total} actividades del paciente`
                : `Mostrando ${items.length} de ${total} actividades`
              }
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Timeline container */}
      <div className="relative min-h-[400px]">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Items */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const Icon = item.icono;
            const colorClass = colorClasses[item.color] || colorClasses.blue;

            return (
              <motion.div
                key={`${item.tipo}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-16"
              >
                {/* Icono */}
                <div className={`absolute left-0 w-12 h-12 rounded-xl border-2 ${colorClass} flex items-center justify-center z-10`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Contenido */}
                <GlassCard className="p-4 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {item.titulo}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {item.tipo}
                        </span>
                      </div>
                      {item.subtitulo && (
                        <p className="text-white/60 mb-3">{item.subtitulo}</p>
                      )}
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {item.fecha.toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      {/* Detalles adicionales según el tipo */}
                      {item.data && (
                        <div className="mt-3 pt-3 border-t border-white/10 text-sm text-white/60">
                          {item.tipo === 'consulta' && item.data.diagnostico && (
                            <p><span className="text-white/80 font-medium">Diagnóstico:</span> {item.data.diagnostico}</p>
                          )}
                          {item.tipo === 'vacuna' && item.data.fecha_proxima && (
                            <p><span className="text-white/80 font-medium">Próxima dosis:</span> {new Date(item.data.fecha_proxima).toLocaleDateString('es-MX')}</p>
                          )}
                          {item.tipo === 'alergia' && item.data.sintomas && (
                            <p><span className="text-white/80 font-medium">Síntomas:</span> {item.data.sintomas}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>

          <div className="flex gap-2">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onCambiarPagina(i + 1)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  paginaActual === i + 1
                    ? 'bg-blue-500/30 text-white border border-blue-400/50'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default TimelineZoomable;
