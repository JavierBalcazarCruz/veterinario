// src/components/estetica/HistorialEstetica.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  Image,
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  Package
} from 'lucide-react';
import { esteticaService } from '../../services/esteticaService';
import toast from 'react-hot-toast';

const HistorialEstetica = ({ pacienteId, nombreMascota, resumeMode = false }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pacienteId) {
      loadHistorial();
    }
  }, [pacienteId]);

  const loadHistorial = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await esteticaService.getHistory(pacienteId);

      if (response.success) {
        // Limitar a 5 más recientes en modo resumen
        const data = resumeMode ? response.data.slice(0, 5) : response.data;
        setHistorial(data);
      } else {
        setHistorial([]);
      }
    } catch (error) {
      console.error('Error al cargar historial de estética:', error);
      setError('Error al cargar historial de estética');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  const getServicioConfig = (tipo) => {
    const configs = {
      baño: { label: 'Baño Completo', icon: '🛁', color: 'blue' },
      corte: { label: 'Corte de Pelo', icon: '✂️', color: 'purple' },
      baño_corte: { label: 'Baño y Corte', icon: '✨', color: 'pink' },
      uñas: { label: 'Corte de Uñas', icon: '💅', color: 'orange' },
      limpieza_dental: { label: 'Limpieza Dental', icon: '🦷', color: 'cyan' },
      spa_premium: { label: 'Spa Premium', icon: '💆', color: 'purple' },
      deslanado: { label: 'Deslanado', icon: '🌬️', color: 'sky' },
      tratamiento_pulgas: { label: 'Tratamiento Anti-pulgas', icon: '🐛', color: 'red' },
      otro: { label: 'Otro Servicio', icon: '🌟', color: 'gray' }
    };
    return configs[tipo] || configs.otro;
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      programada: { label: 'Programada', color: 'blue', icon: Calendar },
      confirmada: { label: 'Confirmada', color: 'green', icon: CheckCircle },
      en_curso: { label: 'En Curso', color: 'yellow', icon: Clock },
      completada: { label: 'Completada', color: 'purple', icon: CheckCircle },
      cancelada: { label: 'Cancelada', color: 'red', icon: XCircle }
    };
    return configs[estado] || configs.programada;
  };

  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="animate-spin text-purple-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto mb-4 text-red-400" size={48} />
        <p className="text-white/60">{error}</p>
        <button
          onClick={loadHistorial}
          className="mt-4 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-purple-400"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (historial.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
          <Sparkles size={32} className="text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">
          Sin historial de estética
        </h3>
        <p className="text-white/60 max-w-md mx-auto">
          {nombreMascota} no tiene servicios de grooming registrados aún.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical del timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500/50 via-pink-500/50 to-purple-500/50"></div>

        {/* Items del timeline */}
        <div className="space-y-6">
          {historial.map((item, index) => {
            const servicioConfig = getServicioConfig(item.tipo_servicio);
            const estadoConfig = getEstadoConfig(item.estado);
            const EstadoIcon = estadoConfig.icon;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Icono del servicio */}
                <div className={`absolute left-0 w-16 h-16 bg-gradient-to-br from-${servicioConfig.color}-500/20 to-${servicioConfig.color}-600/20 border-2 border-${servicioConfig.color}-500/30 rounded-2xl flex items-center justify-center text-2xl shadow-lg`}>
                  {servicioConfig.icon}
                </div>

                {/* Contenido de la cita */}
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/10 transition-colors">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {servicioConfig.label}
                      </h4>
                      <div className="flex items-center space-x-3 text-sm text-white/60">
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} />
                          <span>{formatDate(item.fecha)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={14} />
                          <span>{item.hora?.substring(0, 5)}</span>
                        </div>
                        {item.duracion_real && (
                          <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{item.duracion_real} min</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge de estado */}
                    <div className={`flex items-center space-x-1 px-3 py-1 bg-${estadoConfig.color}-500/20 border border-${estadoConfig.color}-500/30 rounded-full`}>
                      <EstadoIcon size={14} className={`text-${estadoConfig.color}-400`} />
                      <span className={`text-xs font-medium text-${estadoConfig.color}-400`}>
                        {estadoConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {/* Precio */}
                    {item.precio && (
                      <div className="flex items-center space-x-2">
                        <DollarSign size={16} className="text-green-400" />
                        <div>
                          <p className="text-xs text-white/60">Costo</p>
                          <p className="text-sm font-semibold text-white">
                            {formatCurrency(item.precio)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Productos utilizados */}
                    {item.productos_utilizados && (
                      <div className="flex items-center space-x-2">
                        <Package size={16} className="text-blue-400" />
                        <div>
                          <p className="text-xs text-white/60">Productos</p>
                          <p className="text-sm font-medium text-white truncate">
                            {item.productos_utilizados}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Observaciones */}
                  {item.observaciones && (
                    <div className="flex items-start space-x-2 mb-3 p-3 bg-white/5 rounded-lg">
                      <FileText size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-white/60 mb-1">Observaciones</p>
                        <p className="text-sm text-white/80">{item.observaciones}</p>
                      </div>
                    </div>
                  )}

                  {/* Fotos */}
                  {(item.foto_antes || item.foto_despues) && (
                    <div className="flex items-center space-x-3">
                      {item.foto_antes && (
                        <div className="flex-1">
                          <p className="text-xs text-white/60 mb-2">Antes</p>
                          <img
                            src={item.foto_antes}
                            alt="Antes"
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                        </div>
                      )}
                      {item.foto_despues && (
                        <div className="flex-1">
                          <p className="text-xs text-white/60 mb-2">Después</p>
                          <img
                            src={item.foto_despues}
                            alt="Después"
                            className="w-full h-24 object-cover rounded-lg border border-white/10"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Mostrar más si está en modo resumen */}
      {resumeMode && historial.length >= 5 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center pt-4"
        >
          <p className="text-white/60 text-sm">
            Mostrando los 5 servicios más recientes
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default HistorialEstetica;
