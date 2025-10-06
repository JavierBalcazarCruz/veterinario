// src/components/appointments/AppointmentCard.jsx
import { motion } from 'framer-motion';
import { Clock, User, Phone, MessageSquare, MoreVertical, CheckCircle, XCircle, Play } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

const AppointmentCard = ({ appointment }) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusConfig = (estado) => {
    const configs = {
      programada: {
        color: 'blue',
        bg: 'bg-blue-500/20',
        border: 'border-blue-400/50',
        text: 'text-blue-300',
        label: 'Programada',
        icon: Clock
      },
      confirmada: {
        color: 'green',
        bg: 'bg-green-500/20',
        border: 'border-green-400/50',
        text: 'text-green-300',
        label: 'Confirmada',
        icon: CheckCircle
      },
      en_curso: {
        color: 'yellow',
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-400/50',
        text: 'text-yellow-300',
        label: 'En Curso',
        icon: Play
      },
      completada: {
        color: 'purple',
        bg: 'bg-purple-500/20',
        border: 'border-purple-400/50',
        text: 'text-purple-300',
        label: 'Completada',
        icon: CheckCircle
      },
      cancelada: {
        color: 'red',
        bg: 'bg-red-500/20',
        border: 'border-red-400/50',
        text: 'text-red-300',
        label: 'Cancelada',
        icon: XCircle
      },
      no_asistio: {
        color: 'gray',
        bg: 'bg-gray-500/20',
        border: 'border-gray-400/50',
        text: 'text-gray-300',
        label: 'No Asistió',
        icon: XCircle
      }
    };
    return configs[estado] || configs.programada;
  };

  const getTipoConsultaConfig = (tipo) => {
    const configs = {
      primera_vez: { label: 'Primera Vez', icon: '🆕' },
      seguimiento: { label: 'Seguimiento', icon: '📋' },
      urgencia: { label: 'Urgencia', icon: '🚨' },
      vacunacion: { label: 'Vacunación', icon: '💉' }
    };
    return configs[tipo] || configs.primera_vez;
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

  const statusConfig = getStatusConfig(appointment.estado);
  const tipoConfig = getTipoConsultaConfig(appointment.tipo_consulta);
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = (newStatus) => {
    // Implementar cambio de estado
    console.log('Cambiar estado a:', newStatus);
    setShowMenu(false);
  };

  const handleCall = () => {
    window.open(`tel:${appointment.propietario.telefono}`);
  };

  const handleEdit = () => {
    console.log('Editar cita:', appointment.id);
  };

  const handleDelete = () => {
    console.log('Eliminar cita:', appointment.id);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-6 relative overflow-hidden group">
        {/* Menú de opciones */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreVertical size={16} className="text-white" />
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-glass overflow-hidden"
            >
              <div className="p-2">
                <p className="text-white/60 text-xs font-medium px-3 py-2">
                  Cambiar Estado
                </p>
                {['confirmada', 'en_curso', 'completada', 'cancelada'].map((status) => {
                  const config = getStatusConfig(status);
                  const Icon = config.icon;
                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 flex items-center space-x-3 rounded-lg"
                    >
                      <Icon size={16} className={config.text} />
                      <span>{config.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-white hover:bg-white/10 transition-colors duration-200 rounded-lg"
                  >
                    Editar
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 transition-colors duration-200 rounded-lg"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Header con hora y estado */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-12 h-12 bg-primary-500/20 rounded-xl">
              <Clock size={20} className="text-primary-300" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">
                {appointment.hora}
              </div>
              <div className="text-white/60 text-sm">
                {new Date(appointment.fecha).toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </div>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-full ${statusConfig.bg} ${statusConfig.border} border flex items-center space-x-2`}>
            <StatusIcon size={14} className={statusConfig.text} />
            <span className={`text-sm font-medium ${statusConfig.text}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Información del paciente */}
        <div className="flex items-center space-x-4 mb-4">
          <div className="relative">
            {appointment.paciente.foto_url ? (
              <img
                src={appointment.paciente.foto_url}
                alt={appointment.paciente.nombre}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                {getSpeciesEmoji(appointment.paciente.especie)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white truncate">
              {appointment.paciente.nombre}
            </h3>
            <p className="text-white/70 text-sm">
              {appointment.paciente.raza} • {appointment.paciente.especie}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs">{tipoConfig.icon}</span>
              <span className="text-white/60 text-xs">
                {tipoConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Información del propietario */}
        <div className="bg-white/5 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                <User size={14} className="text-white/70" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {appointment.propietario.nombre}
                </p>
                <p className="text-white/60 text-xs">
                  Propietario
                </p>
              </div>
            </div>

            <motion.button
              onClick={handleCall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors duration-200"
            >
              <Phone size={16} className="text-green-400" />
            </motion.button>
          </div>
        </div>

        {/* Notas */}
        {appointment.notas && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-start space-x-3">
              <MessageSquare size={16} className="text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <p className="text-blue-400 font-medium text-sm mb-1">
                  Notas de la consulta
                </p>
                <p className="text-blue-400/80 text-sm">
                  {appointment.notas}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex space-x-2">
          {appointment.estado === 'programada' && (
            <GlassButton
              onClick={() => handleStatusChange('confirmada')}
              variant="secondary"
              className="flex-1"
              icon={<CheckCircle size={16} />}
            >
              Confirmar
            </GlassButton>
          )}
          
          {appointment.estado === 'confirmada' && (
            <GlassButton
              onClick={() => handleStatusChange('en_curso')}
              className="flex-1"
              icon={<Play size={16} />}
            >
              Iniciar Consulta
            </GlassButton>
          )}

          {appointment.estado === 'en_curso' && (
            <GlassButton
              onClick={() => handleStatusChange('completada')}
              className="flex-1"
              icon={<CheckCircle size={16} />}
            >
              Completar
            </GlassButton>
          )}
        </div>

        {/* Efecto de brillo en hover - DESACTIVADO */}
        {/* <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          initial={false}
        /> */}

        {/* Indicador de urgencia */}
        {appointment.tipo_consulta === 'urgencia' && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-b-[20px] border-l-transparent border-b-red-500">
            <div className="absolute -bottom-[14px] -left-[14px] text-white text-xs">
              🚨
            </div>
          </div>
        )}
      </GlassCard>
    </motion.div>
  );
};

export default AppointmentCard;