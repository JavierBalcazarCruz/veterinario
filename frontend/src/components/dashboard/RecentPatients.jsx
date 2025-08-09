// src/components/dashboard/RecentPatients.jsx
import { motion } from 'framer-motion';
import { PawPrint, Eye, MoreHorizontal, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

const RecentPatients = () => {
  const navigate = useNavigate();

  // Datos de ejemplo
  const recentPatients = [
    {
      id: 1,
      nombre: 'Max',
      especie: 'Perro',
      raza: 'Golden Retriever',
      propietario: 'Ana García',
      ultima_visita: '2024-08-09',
      estado: 'activo',
      foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=80'
    },
    {
      id: 2,
      nombre: 'Luna',
      especie: 'Gato',
      raza: 'Persa',
      propietario: 'Carlos Mendoza',
      ultima_visita: '2024-08-08',
      estado: 'activo',
      foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=80'
    },
    {
      id: 3,
      nombre: 'Rocky',
      especie: 'Perro',
      raza: 'Bulldog',
      propietario: 'María Rodríguez',
      ultima_visita: '2024-08-07',
      estado: 'activo',
      foto_url: null
    },
    {
      id: 4,
      nombre: 'Mimi',
      especie: 'Gato',
      raza: 'Siamés',
      propietario: 'Pedro López',
      ultima_visita: '2024-08-06',
      estado: 'activo',
      foto_url: null
    },
    {
      id: 5,
      nombre: 'Bobby',
      especie: 'Perro',
      raza: 'Labrador',
      propietario: 'Laura Martín',
      ultima_visita: '2024-08-05',
      estado: 'activo',
      foto_url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=80'
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

  const getTimeAgo = (date) => {
    const now = new Date();
    const visitDate = new Date(date);
    const diffTime = Math.abs(now - visitDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return `Hace ${Math.ceil(diffDays / 7)} semanas`;
  };

  const handleViewPatient = (patientId) => {
    navigate(`/pacientes/${patientId}`);
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
            className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center"
          >
            <PawPrint size={20} className="text-green-400" />
          </motion.div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              Pacientes Recientes
            </h2>
            <p className="text-white/70 text-sm">
              Últimas visitas registradas
            </p>
          </div>
        </div>

        <motion.button
          onClick={handleViewAll}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="text-primary-300 hover:text-primary-200 text-sm font-medium transition-colors duration-200"
        >
          Ver todos
        </motion.button>
      </div>

      <div className="space-y-3">
        {recentPatients.map((patient, index) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <div className="flex items-center space-x-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {patient.foto_url ? (
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={patient.foto_url}
                    alt={patient.nombre}
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
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white text-sm truncate">
                    {patient.nombre}
                  </h3>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewPatient(patient.id);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <Eye size={14} className="text-white" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      <MoreHorizontal size={14} className="text-white" />
                    </motion.button>
                  </div>
                </div>
                
                <p className="text-white/60 text-xs mb-1">
                  {patient.raza} • {patient.especie}
                </p>
                
                <p className="text-white/50 text-xs truncate">
                  {patient.propietario}
                </p>
              </div>

              {/* Time */}
              <div className="flex flex-col items-end text-right">
                <div className="flex items-center space-x-1 text-white/60">
                  <Calendar size={12} />
                  <span className="text-xs">
                    {getTimeAgo(patient.ultima_visita)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty state */}
      {recentPatients.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="text-4xl mb-4">🐾</div>
          <p className="text-white/60 text-sm">
            No hay pacientes recientes
          </p>
        </motion.div>
      )}

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 pt-4 border-t border-white/10"
      >
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>
            {recentPatients.length} pacientes mostrados
          </span>
          <motion.button
            onClick={handleViewAll}
            whileHover={{ scale: 1.05 }}
            className="text-primary-300 hover:text-primary-200 transition-colors duration-200"
          >
            Ver historial completo →
          </motion.button>
        </div>
      </motion.div>
    </GlassCard>
  );
};

export default RecentPatients;