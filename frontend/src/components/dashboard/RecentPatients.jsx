// src/components/dashboard/RecentPatients.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { PawPrint, Eye, MoreHorizontal, Calendar, AlertCircle, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';

const RecentPatients = ({ autoRefresh = true, refreshInterval = 60000 }) => {
  const navigate = useNavigate();
  const [recentPatients, setRecentPatients] = useState([]);
  const [previousIds, setPreviousIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [daysFilter, setDaysFilter] = useState(30); // Filtro de días
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshTimerRef = useRef(null);

  // Filtros disponibles
  const filterOptions = [
    { label: 'Últimos 7 días', value: 7 },
    { label: 'Últimos 30 días', value: 30 },
    { label: 'Últimos 90 días', value: 90 }
  ];

  // Cargar pacientes recientes al montar el componente y cuando cambie el filtro
  useEffect(() => {
    loadRecentPatients();
  }, [daysFilter]);

  // Auto-refresh automático
  useEffect(() => {
    if (!autoRefresh) return;

    // Configurar polling
    refreshTimerRef.current = setInterval(() => {
      loadRecentPatients(true); // true = refresh silencioso
    }, refreshInterval);

    // Limpiar al desmontar
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, daysFilter]);

  const loadRecentPatients = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      const response = await patientService.getRecent(5, daysFilter);

      // Extraer datos según la estructura de respuesta
      const pacientesData = response.data || response || [];

      console.log('📊 Pacientes recientes cargados:', pacientesData);

      // Guardar IDs previos para detectar nuevos
      if (recentPatients.length > 0 && silent) {
        setPreviousIds(recentPatients.map(p => p.id));
      }

      setRecentPatients(pacientesData);
    } catch (error) {
      console.error('❌ Error al cargar pacientes recientes:', error);
      setError('No se pudieron cargar los pacientes recientes');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Detectar si un paciente es nuevo
  const isNewPatient = (patientId) => {
    return previousIds.length > 0 && !previousIds.includes(patientId);
  };

  const getSpeciesEmoji = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      case 'ave': return '🦜';
      case 'conejo': return '🐰';
      default: return '🐾';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const visitDate = new Date(date);
    const diffTime = Math.abs(now - visitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const text = (() => {
      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
      return `Hace ${Math.ceil(diffDays / 30)} meses`;
    })();

    return {
      text,
      isToday: diffDays === 0,
      diffDays
    };
  };

  const handleViewAll = () => {
    navigate('/pacientes');
  };

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center relative"
          >
            <PawPrint size={20} className="text-green-400" />
            {/* Indicador de refresh */}
            {isRefreshing && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1 -right-1"
              >
                <RefreshCw className="w-3 h-3 text-blue-400" />
              </motion.div>
            )}
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Pacientes Recientes
            </h2>
            <p className="text-white/70 text-sm">
              Pacientes atendidos recientemente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro de días */}
          <div className="relative group">
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(Number(e.target.value))}
              className="text-xs bg-white/10 border border-white/20 rounded-lg px-3 py-1.5 text-white cursor-pointer hover:bg-white/15 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 appearance-none pr-8"
            >
              {filterOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-gray-900 text-white">
                  {option.label}
                </option>
              ))}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/60 pointer-events-none" />
          </div>

          {/* Botón refresh manual */}
          <motion.button
            onClick={() => loadRecentPatients()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isRefreshing}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors disabled:opacity-50"
            title="Actualizar"
          >
            <RefreshCw className={`w-4 h-4 text-white/70 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          <motion.button
            onClick={handleViewAll}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors duration-200"
          >
            Ver todos
          </motion.button>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        /* Error state */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <p className="text-white/70 text-sm mb-4">{error}</p>
          <motion.button
            onClick={loadRecentPatients}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-primary-500/20 border border-primary-400/30 rounded-lg text-primary-300 text-sm font-medium hover:bg-primary-500/30 transition-colors duration-200"
          >
            Reintentar
          </motion.button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {recentPatients.map((patient, index) => {
              const timeInfo = patient.ultima_consulta ? getTimeAgo(patient.ultima_consulta) : null;
              const esNuevo = isNewPatient(patient.id);

              return (
                <motion.div
                  key={patient.id}
                  layout
                  initial={{ opacity: 0, x: esNuevo ? -50 : -20, scale: esNuevo ? 0.9 : 1 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: {
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      delay: index * 0.05
                    }
                  }}
                  exit={{ opacity: 0, x: -20, scale: 0.9 }}
                  className="group relative"
                  onClick={() => navigate(`/historial/${patient.id}`)}
                >
                  {/* Badge "NUEVO" para pacientes nuevos en la lista */}
                  {esNuevo && (
                    <motion.div
                      initial={{ scale: 0, rotate: -45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="absolute -top-2 -left-2 z-10 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1"
                    >
                      <span className="animate-pulse">✨</span> NUEVO
                    </motion.div>
                  )}

                  <div className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer relative overflow-hidden">
                    {/* Efecto de brillo para pacientes nuevos */}
                    {esNuevo && (
                      <motion.div
                        animate={{
                          x: ['-100%', '200%']
                        }}
                        transition={{
                          duration: 1.5,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    )}
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  {patient.foto_url ? (
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      src={patient.foto_url}
                      alt={patient.nombre_mascota}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                    />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg"
                    >
                      {getSpeciesEmoji(patient.especie)}
                    </motion.div>
                  )}

                  {/* Status indicator */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20">
                    <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 relative group/info">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-white text-sm truncate">
                          {patient.nombre_mascota}
                        </h3>
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/historial/${patient.id}`);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                          >
                            <Eye size={14} className="text-white" />
                          </motion.button>
                        </div>
                      </div>

                      <p className="text-white/60 text-xs mb-1">
                        {patient.nombre_raza} • {patient.especie}
                      </p>

                      <p className="text-white/50 text-xs truncate">
                        {patient.nombre_propietario} {patient.apellidos_propietario}
                      </p>

                      {/* Tooltip con motivo de consulta - aparece en hover */}
                      {patient.ultimo_motivo && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          whileHover={{ opacity: 1, y: 0 }}
                          className="absolute left-0 -top-16 z-20 bg-gray-900 border border-white/20 rounded-lg px-3 py-2 shadow-2xl min-w-[200px] opacity-0 group-hover/info:opacity-100 transition-opacity pointer-events-none"
                        >
                          <p className="text-white/90 text-xs font-medium mb-1">Último motivo:</p>
                          <p className="text-white/70 text-xs leading-relaxed">
                            {patient.ultimo_motivo}
                          </p>
                          {/* Flecha del tooltip */}
                          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 border-r border-b border-white/20 rotate-45"></div>
                        </motion.div>
                      )}
                    </div>

                    {/* Time con Badge "HOY" */}
                    <div className="flex flex-col items-end text-right gap-1">
                      {/* Badge "HOY" */}
                      {timeInfo?.isToday && (
                        <motion.span
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs font-bold rounded-full shadow-lg"
                        >
                          <span className="animate-pulse">🔵</span> HOY
                        </motion.span>
                      )}

                      <div className="flex items-center space-x-1 text-white/60">
                        <Calendar size={12} />
                        <span className="text-xs">
                          {timeInfo ? timeInfo.text : 'Sin consultas'}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state - Solo mostrar si no está cargando y no hay error */}
      {!loading && !error && recentPatients.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">🐾</div>
          <p className="text-white/60 text-sm mb-2">
            No hay pacientes con consultas recientes
          </p>
          <p className="text-white/50 text-xs">
            Registra la primera consulta para ver actividad aquí
          </p>
        </motion.div>
      )}

      {/* Footer - Solo mostrar cuando hay datos */}
      {!loading && !error && recentPatients.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 pt-4 border-t border-white/10"
        >
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>
              {recentPatients.length} {recentPatients.length === 1 ? 'paciente mostrado' : 'pacientes mostrados'}
            </span>
            <motion.button
              onClick={handleViewAll}
              whileHover={{ scale: 1.05 }}
              className="text-primary-300 hover:text-primary-200 transition-colors duration-200"
            >
              Ver todos los pacientes →
            </motion.button>
          </div>
        </motion.div>
      )}
    </GlassCard>
  );
};

export default RecentPatients;