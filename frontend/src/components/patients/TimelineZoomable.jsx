/**
 * =====================================================
 * TIMELINE DE HISTORIAL CLÍNICO
 * =====================================================
 * Vista cronológica del historial médico del paciente
 */

import { motion } from 'framer-motion';
import {
  Activity,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

/**
 * Componente principal de Timeline
 */
const TimelineZoomable = ({ items, total, paginaActual, totalPaginas, onCambiarPagina }) => {
  const navigate = useNavigate();
  const { pacienteId } = useParams();

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
      <GlassCard className="p-3 md:p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Info */}
          <div className="flex items-center gap-2 md:gap-4">
            <p className="text-white/60 text-xs md:text-sm">
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
        <div className="absolute left-4 md:left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Items */}
        <div className="space-y-4 md:space-y-6">
          {items.map((item, index) => {
            const Icon = item.icono;
            const colorClass = colorClasses[item.color] || colorClasses.blue;

            return (
              <motion.div
                key={`${item.tipo}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-11 md:pl-16"
              >
                {/* Icono */}
                <div className={`absolute left-0 w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl border-2 ${colorClass} flex items-center justify-center z-10`}>
                  <Icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>

                {/* Contenido */}
                <GlassCard className="p-3 md:p-4 hover:border-white/20 transition-all">
                  <div className="flex items-start justify-between gap-2 md:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white text-base md:text-lg">
                          {item.titulo}
                        </h3>
                        <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-xs font-medium ${colorClass} w-fit`}>
                          {item.tipo}
                        </span>
                      </div>
                      {item.subtitulo && (
                        <p className="text-white/60 text-sm md:text-base mb-2 md:mb-3">{item.subtitulo}</p>
                      )}
                      <div className="flex items-center gap-2 text-white/50 text-xs md:text-sm">
                        <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                        <span className="break-words">
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
                        <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/10 text-xs md:text-sm text-white/60">
                          {item.tipo === 'consulta' && item.data.diagnostico && (
                            <p className="break-words"><span className="text-white/80 font-medium">Diagnóstico:</span> {item.data.diagnostico}</p>
                          )}
                          {item.tipo === 'vacuna' && item.data.fecha_proxima && (
                            <p><span className="text-white/80 font-medium">Próxima dosis:</span> {new Date(item.data.fecha_proxima).toLocaleDateString('es-MX')}</p>
                          )}
                          {item.tipo === 'alergia' && item.data.sintomas && (
                            <p className="break-words"><span className="text-white/80 font-medium">Síntomas:</span> {item.data.sintomas}</p>
                          )}

                          {/* Botón Ver más para consultas */}
                          {item.tipo === 'consulta' && item.data.id && (
                            <button
                              onClick={() => navigate(`/expediente/${pacienteId}/detalle/${item.data.id}`)}
                              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors group"
                            >
                              <span>Ver más</span>
                              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </button>
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
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 md:mt-8">
          {/* Info de página en móvil */}
          <div className="sm:hidden text-white/60 text-xs">
            Página {paginaActual} de {totalPaginas}
          </div>

          {/* Botones de navegación */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
              disabled={paginaActual === 1}
              className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {/* Números de página - solo visible en pantallas grandes */}
            <div className="hidden md:flex gap-2">
              {totalPaginas <= 7 ? (
                // Si hay 7 o menos páginas, mostrar todas
                [...Array(totalPaginas)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => onCambiarPagina(i + 1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      paginaActual === i + 1
                        ? 'bg-blue-500/30 text-white border border-blue-400/50'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : (
                // Si hay más de 7 páginas, mostrar con puntos suspensivos
                <>
                  {/* Primera página */}
                  <button
                    onClick={() => onCambiarPagina(1)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      paginaActual === 1
                        ? 'bg-blue-500/30 text-white border border-blue-400/50'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    1
                  </button>

                  {/* Puntos suspensivos izquierda */}
                  {paginaActual > 3 && (
                    <span className="px-2 text-white/40">...</span>
                  )}

                  {/* Páginas alrededor de la actual */}
                  {[...Array(totalPaginas)].map((_, i) => {
                    const pageNum = i + 1;
                    if (
                      pageNum === paginaActual ||
                      (pageNum === paginaActual - 1 && pageNum > 1) ||
                      (pageNum === paginaActual + 1 && pageNum < totalPaginas)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => onCambiarPagina(pageNum)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            paginaActual === pageNum
                              ? 'bg-blue-500/30 text-white border border-blue-400/50'
                              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}

                  {/* Puntos suspensivos derecha */}
                  {paginaActual < totalPaginas - 2 && (
                    <span className="px-2 text-white/40">...</span>
                  )}

                  {/* Última página */}
                  <button
                    onClick={() => onCambiarPagina(totalPaginas)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      paginaActual === totalPaginas
                        ? 'bg-blue-500/30 text-white border border-blue-400/50'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {totalPaginas}
                  </button>
                </>
              )}
            </div>

            {/* Selector de página en móvil */}
            <div className="md:hidden">
              <select
                value={paginaActual}
                onChange={(e) => onCambiarPagina(Number(e.target.value))}
                className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50"
              >
                {[...Array(totalPaginas)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
              disabled={paginaActual === totalPaginas}
              className="px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineZoomable;
