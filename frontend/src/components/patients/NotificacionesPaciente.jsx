/**
 * =====================================================
 * COMPONENTE DE NOTIFICACIONES DEL PACIENTE
 * =====================================================
 * Muestra notificaciones y recordatorios médicos
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Filter,
  Calendar
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { notificacionesService, PRIORIDAD } from '../../services/notificacionesService';

/**
 * Componente principal de notificaciones
 */
const NotificacionesPaciente = ({ paciente, historial }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('todas'); // 'todas', 'alta', 'media', 'baja'
  const [notificacionesVistas, setNotificacionesVistas] = useState(new Set());

  /**
   * Generar notificaciones cuando cambie el historial
   */
  useEffect(() => {
    if (paciente && historial) {
      const notifs = notificacionesService.generarNotificaciones(paciente, historial);
      setNotificaciones(notifs);
    }
  }, [paciente, historial]);

  /**
   * Marcar notificación como vista
   */
  const marcarComoVista = (notifId) => {
    setNotificacionesVistas(prev => new Set([...prev, notifId]));
  };

  /**
   * Filtrar notificaciones
   */
  const notificacionesFiltradas = filtroActivo === 'todas'
    ? notificaciones
    : notificacionesService.filtrarPorPrioridad(notificaciones, filtroActivo);

  /**
   * Obtener conteo
   */
  const conteo = notificacionesService.obtenerConteo(notificaciones);

  if (!paciente || !historial) {
    return null;
  }

  if (notificaciones.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-white mb-2">
          ¡Todo al día!
        </h3>
        <p className="text-white/60">
          No hay notificaciones o recordatorios pendientes
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header con resumen */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="w-6 h-6 text-orange-400" />
          <div>
            <h2 className="text-xl font-bold text-white">
              Notificaciones y Recordatorios
            </h2>
            <p className="text-sm text-white/60">
              {conteo.total} notificación(es) total(es)
            </p>
          </div>
        </div>

        {/* Badges de conteo */}
        <div className="flex gap-2">
          {conteo.alta > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-400/30">
              {conteo.alta} Alta
            </span>
          )}
          {conteo.media > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-400/30">
              {conteo.media} Media
            </span>
          )}
          {conteo.baja > 0 && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-400/30">
              {conteo.baja} Baja
            </span>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setFiltroActivo('todas')}
          className={`px-4 py-2 rounded-lg transition-all text-sm flex items-center gap-2 ${
            filtroActivo === 'todas'
              ? 'bg-orange-500/30 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Filter className="w-4 h-4" />
          Todas ({conteo.total})
        </button>
        <button
          onClick={() => setFiltroActivo(PRIORIDAD.ALTA)}
          className={`px-4 py-2 rounded-lg transition-all text-sm ${
            filtroActivo === PRIORIDAD.ALTA
              ? 'bg-red-500/30 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Alta ({conteo.alta})
        </button>
        <button
          onClick={() => setFiltroActivo(PRIORIDAD.MEDIA)}
          className={`px-4 py-2 rounded-lg transition-all text-sm ${
            filtroActivo === PRIORIDAD.MEDIA
              ? 'bg-yellow-500/30 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Media ({conteo.media})
        </button>
        <button
          onClick={() => setFiltroActivo(PRIORIDAD.BAJA)}
          className={`px-4 py-2 rounded-lg transition-all text-sm ${
            filtroActivo === PRIORIDAD.BAJA
              ? 'bg-blue-500/30 text-white'
              : 'text-white/60 hover:text-white'
          }`}
        >
          Baja ({conteo.baja})
        </button>
      </div>

      {/* Lista de notificaciones */}
      <div className="space-y-3">
        <AnimatePresence>
          {notificacionesFiltradas.map((notif, index) => {
            const esVista = notificacionesVistas.has(notif.id);

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <NotificacionCard
                  notificacion={notif}
                  esVista={esVista}
                  onMarcarVista={() => marcarComoVista(notif.id)}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de notificación individual
// =====================================================
const NotificacionCard = ({ notificacion, esVista, onMarcarVista }) => {
  const [mostrar, setMostrar] = useState(true);

  const colorClasses = {
    red: {
      border: 'border-red-400/30',
      bg: 'bg-red-500/10',
      text: 'text-red-400',
      icon: 'bg-red-500/20 text-red-400'
    },
    yellow: {
      border: 'border-yellow-400/30',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-400',
      icon: 'bg-yellow-500/20 text-yellow-400'
    },
    orange: {
      border: 'border-orange-400/30',
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      icon: 'bg-orange-500/20 text-orange-400'
    },
    blue: {
      border: 'border-blue-400/30',
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      icon: 'bg-blue-500/20 text-blue-400'
    },
    purple: {
      border: 'border-purple-400/30',
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      icon: 'bg-purple-500/20 text-purple-400'
    }
  };

  const getPrioridadIcon = () => {
    switch (notificacion.prioridad) {
      case PRIORIDAD.ALTA:
        return AlertTriangle;
      case PRIORIDAD.MEDIA:
        return Info;
      default:
        return Bell;
    }
  };

  const colorClass = colorClasses[notificacion.color] || colorClasses.blue;
  const PrioridadIcon = getPrioridadIcon();

  const handleDismiss = () => {
    onMarcarVista();
    setTimeout(() => setMostrar(false), 300);
  };

  if (!mostrar) return null;

  return (
    <GlassCard
      className={`p-4 border-2 ${colorClass.border} ${colorClass.bg} ${
        esVista ? 'opacity-60' : ''
      } transition-all hover:border-opacity-50`}
    >
      <div className="flex items-start gap-4">
        {/* Icono */}
        <div className={`w-10 h-10 rounded-xl ${colorClass.icon} flex items-center justify-center flex-shrink-0`}>
          <span className="text-xl">{notificacion.icono}</span>
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-semibold ${colorClass.text} flex items-center gap-2`}>
              <PrioridadIcon className="w-4 h-4" />
              {notificacion.titulo}
            </h3>

            {/* Botón cerrar */}
            <button
              onClick={handleDismiss}
              className="text-white/40 hover:text-white/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-white/70 text-sm mb-2">
            {notificacion.mensaje}
          </p>

          {/* Fecha */}
          {notificacion.fecha && (
            <div className="flex items-center gap-2 text-white/50 text-xs">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(notificacion.fecha).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default NotificacionesPaciente;
