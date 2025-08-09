// src/components/dashboard/QuickActions.jsx
import { motion } from 'framer-motion';
import { Plus, Calendar, PawPrint, FileText, Users, Stethoscope } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../ui/GlassCard';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'new-patient',
      title: 'Nuevo Paciente',
      subtitle: 'Registrar mascota',
      icon: PawPrint,
      color: 'from-green-400 to-green-600',
      onClick: () => navigate('/pacientes?action=new')
    },
    {
      id: 'new-appointment',
      title: 'Nueva Cita',
      subtitle: 'Programar consulta',
      icon: Calendar,
      color: 'from-blue-400 to-blue-600',
      onClick: () => navigate('/citas?action=new')
    },
    {
      id: 'medical-history',
      title: 'Historia Clínica',
      subtitle: 'Crear registro',
      icon: FileText,
      color: 'from-purple-400 to-purple-600',
      onClick: () => console.log('Nueva historia clínica')
    },
    {
      id: 'emergency',
      title: 'Urgencia',
      subtitle: 'Atención inmediata',
      icon: Stethoscope,
      color: 'from-red-400 to-red-600',
      onClick: () => console.log('Nueva urgencia')
    }
  ];

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-1">
            Acciones Rápidas
          </h2>
          <p className="text-white/70 text-sm">
            Operaciones frecuentes de un solo clic
          </p>
        </div>

        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl"
        >
          ⚡
        </motion.div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <motion.button
              key={action.id}
              onClick={action.onClick}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -5,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden"
            >
              <div className={`
                relative z-10 bg-gradient-to-br ${action.color} 
                rounded-2xl p-6 h-full
                border border-white/20
                backdrop-blur-md
                transition-all duration-300
                group-hover:shadow-xl group-hover:shadow-white/10
              `}>
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white rounded-full translate-y-6 -translate-x-6"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center">
                  <motion.div
                    className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4"
                    whileHover={{ rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon size={24} className="text-white" />
                  </motion.div>

                  <h3 className="font-semibold text-white mb-1 text-sm lg:text-base">
                    {action.title}
                  </h3>
                  
                  <p className="text-white/80 text-xs lg:text-sm">
                    {action.subtitle}
                  </p>
                </div>

                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />

                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
                  initial={false}
                />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-primary-300" />
            </div>
            <div>
              <p className="text-white font-medium text-sm">
                Consultas de hoy
              </p>
              <p className="text-white/60 text-xs">
                8 programadas • 3 completadas
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/citas')}
            className="px-4 py-2 bg-primary-500/20 border border-primary-400/30 rounded-lg text-primary-300 text-sm font-medium hover:bg-primary-500/30 transition-colors duration-200"
          >
            Ver Todas
          </motion.button>
        </div>
      </motion.div>
    </GlassCard>
  );
};

export default QuickActions;