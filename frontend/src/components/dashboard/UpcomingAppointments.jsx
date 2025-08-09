// src/components/dashboard/UpcomingAppointments.jsx
import { motion } from 'framer-motion';
import { Clock, Calendar, Phone, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

const UpcomingAppointments = () => {
  const navigate = useNavigate();

  // Datos de ejemplo
  const upcomingAppointments = [
    {
      id: 1,
      hora: '10:30',
      fecha: '2024-08-09',
      paciente: {
        nombre: 'Luna',
        especie: 'Gato',
        foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60'
      },
      propietario: {
        nombre: 'Carlos Mendoza',
        telefono: '5559876543'
      },
      tipo_consulta: 'seguimiento',
      estado: 'confirmada',
      tiempo_restante: 45 // minutos
    },
    {
      id: 2,
      hora: '14:00',
      fecha: '2024-08-09',
      paciente: {
        nombre: 'Rocky',
        especie: 'Perro',
        foto_url: null
      },
      propietario: {
        nombre: 'María Rodríguez',
        telefono: '5555555555'
      },
      tipo_consulta: 'urgencia',
      estado: 'programada',
      tiempo_restante: 225 // minutos
    },
    {
      id: 3,
      hora: '16:30',
      fecha: '2024-08-09',
      paciente: {
        nombre: 'Milo',
        especie: 'Gato',
        foto_url: null
      },
      propietario: {
        nombre: 'Luis Torres',
        telefono: '5553456789'
      },
      tipo_consulta: 'vacunacion',
      estado: 'programada',
      tiempo_restante: 375 // minutos
    }
  ];

  const getSpeciesEmoji = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      case 'ave': return '🦜';
      case 'conejo': return '🐰';
      default: return '🐾';
    }
  };

  const getTipoConfig = (tipo) => {
    const configs = {
      primera_vez: { label: 'Primera Vez', color: 'blue', icon: '🆕' },
      seguimiento: { label: 'Seguimiento', color: 'green', icon: '📋' },
      urgencia: { label: 'Urgencia', color: 'red', icon: '🚨' },
      vacunacion: { label: 'Vacunación', color: 'purple', icon: '💉' }
    };
    return configs[tipo] || configs.primera_vez;
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      programada: { 
        label: 'Programada', 
        color: 'text-blue-400', 
        bg: 'bg-blue-500/20',
        icon: Clock 
      },
      confirmada: { 
        label: 'Confirmada', 
        color: 'text-green-400', 
        bg: 'bg-green-500/20',
        icon: CheckCircle 
      }
    };
    return configs[estado] || configs.programada;
  };

  const formatTiempoRestante = (minutos) => {
    if (minutos < 60) {
      return `${minutos}m`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const handleCallPatient = (telefono) => {
    window.open(`tel:${telefono}`);
  };

  const handleViewAppointment = (appointmentId) => {
    navigate(`/citas/${appointmentId}`);
  };

  const handleViewAll = () => {
    navigate('/citas');
  };

  return (
    <GlassCard className="p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
            }}
            transition={{ 
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center"
          >
            <Calendar size={20} className="text-blue-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Próximas Citas
            </h2>
            <p className="text-white/70 text-sm">
              Consultas de hoy programadas
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleViewAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors duration-200"
        >
          Ver todas
        </motion.button>
      </div>

      <div className="space-y-4">
        {upcomingAppointments.map((appointment, index) => {
          const tipoConfig = getTipoConfig(appointment.tipo_consulta);
          const estadoConfig = getEstadoConfig(appointment.estado);
          const EstadoIcon = estadoConfig.icon;
          
          return (
            <motion.div
              key={appointment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200">
                {/* Tiempo */}
                <div className="flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-white">
                      {appointment.hora}
                    </div>
                    <div className="text-xs text-white/60">
                      en {formatTiempoRestante(appointment.tiempo_restante)}
                    </div>
                  </div>
                </div>

                {/* Avatar y info del paciente */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="relative flex-shrink-0">
                    {appointment.paciente.foto_url ? (
                      <img
                        src={appointment.paciente.foto_url}
                        alt={appointment.paciente.nombre}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg">
                        {getSpeciesEmoji(appointment.paciente.especie)}
                      </div>
                    )}
                    
                    {/* Indicador de urgencia */}
                    {appointment.tipo_consulta === 'urgencia' && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <AlertCircle size={10} className="text-white" />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-white text-sm truncate">
                        {appointment.paciente.nombre}
                      </h3>
                      <div className={`px-2 py-1 rounded-md ${estadoConfig.bg} flex items-center space-x-1`}>
                        <EstadoIcon size={10} className={estadoConfig.color} />
                        <span className={`text-xs ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-white/60">
                      <div className="flex items-center space-x-1">
                        <User size={10} />
                        <span className="truncate">
                          {appointment.propietario.nombre}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <span>{tipoConfig.icon}</span>
                        <span>{tipoConfig.label}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <motion.button
                    onClick={() => handleCallPatient(appointment.propietario.telefono)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg transition-colors duration-200"
                  >
                    <Phone size={14} className="text-green-400" />
                  </motion.button>
                </div>
              </div>

              {/* Progreso hasta la cita */}
              <div className="mt-2 mx-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${Math.max(0, Math.min(100, (480 - appointment.tiempo_restante) / 480 * 100))}%` 
                    }}
                    transition={{
                      duration: 1,
                      delay: index * 0.2
                    }}
                    className={`h-full rounded-full ${
                      appointment.tipo_consulta === 'urgencia' 
                        ? 'bg-gradient-to-r from-red-400 to-red-600' 
                        : 'bg-gradient-to-r from-primary-400 to-primary-600'
                    }`}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {upcomingAppointments.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">📅</div>
          <h3 className="text-white font-medium mb-2">
            No hay citas programadas
          </h3>
          <p className="text-white/60 text-sm mb-6">
            Todas las citas del día han sido completadas
          </p>
          <GlassButton
            onClick={() => navigate('/citas?action=new')}
            variant="secondary"
          >
            Programar Nueva Cita
          </GlassButton>
        </motion.div>
      )}

      {/* Resumen del día */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-4 border-t border-white/10"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">
              {upcomingAppointments.length}
            </div>
            <div className="text-xs text-white/60">
              Pendientes
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {upcomingAppointments.filter(apt => apt.estado === 'confirmada').length}
            </div>
            <div className="text-xs text-white/60">
              Confirmadas
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleViewAll}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-4 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white text-sm transition-all duration-200"
        >
          Ver agenda completa →
        </motion.button>
      </motion.div>
    </GlassCard>
  );
};

export default UpcomingAppointments;