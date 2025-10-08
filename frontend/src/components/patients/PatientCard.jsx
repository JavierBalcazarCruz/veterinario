// src/components/patients/PatientCard.jsx
import { motion } from 'framer-motion';
import { Phone, Mail, Calendar, Weight, Eye, Edit, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import GlassCard from '../ui/GlassCard';

const PatientCard = ({ patient }) => {
  const [showMenu, setShowMenu] = useState(false);

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
    if (!date) return 'Sin visitas';

    try {
      const now = new Date();
      const visitDate = new Date(date);
      const diffTime = Math.abs(now - visitDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return 'Hoy';
      if (diffDays === 1) return 'Ayer';
      if (diffDays < 7) return `Hace ${diffDays} días`;
      if (diffDays < 30) return `Hace ${Math.ceil(diffDays / 7)} semanas`;
      return `Hace ${Math.ceil(diffDays / 30)} meses`;
    } catch (error) {
      console.error('Error al calcular fecha:', error);
      return 'Sin fecha';
    }
  };

  const handleViewDetails = () => {
    // Navegar a detalles del paciente
    console.log('Ver detalles:', patient.id);
  };

  const handleEdit = () => {
    // Abrir modal de edición
    console.log('Editar:', patient.id);
  };

  const handleCall = () => {
    window.open(`tel:${patient.telefono_principal}`);
  };

  const handleEmail = () => {
    window.open(`mailto:${patient.email}`);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <GlassCard className="p-6 relative overflow-hidden group">
        {/* Menú de opciones */}
        <div className="absolute top-4 right-4 z-10">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <MoreVertical size={16} className="text-white" />
          </motion.button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute top-full right-0 mt-2 w-48 bg-white/5 backdrop-blur-xl border border-white/15 rounded-xl shadow-glass overflow-hidden"
            >
              <button
                onClick={handleViewDetails}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/8 transition-colors duration-200 flex items-center space-x-3"
              >
                <Eye size={16} />
                <span>Ver detalles</span>
              </button>
              <button
                onClick={handleEdit}
                className="w-full px-4 py-3 text-left text-white hover:bg-white/8 transition-colors duration-200 flex items-center space-x-3"
              >
                <Edit size={16} />
                <span>Editar</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Header con foto y datos básicos */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            {patient.foto_url ? (
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={patient.foto_url}
                alt={patient.nombre_mascota}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-2xl">
                {getSpeciesEmoji(patient.especie)}
              </div>
            )}
            
            {/* Indicador de estado */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <motion.h3
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-white truncate"
            >
              {patient.nombre_mascota || 'Sin nombre'}
            </motion.h3>

            <p className="text-white/70 text-sm">
              {patient.nombre_raza || 'Sin raza'} • {patient.edad || 'Edad no especificada'}
            </p>

            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-1 text-xs text-white/60">
                <Weight size={12} />
                <span>{patient.peso ? `${patient.peso} kg` : 'Sin peso'}</span>
              </div>

              <div className="flex items-center space-x-1 text-xs text-white/60">
                <Calendar size={12} />
                <span>{getTimeAgo(patient.ultima_visita || patient.updated_at || patient.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del propietario */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-white/8 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {patient.nombre_propietario?.charAt(0) || '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                {patient.nombre_propietario || 'Sin nombre'} {patient.apellidos_propietario || ''}
              </p>
              <p className="text-white/60 text-xs truncate">
                Propietario
              </p>
            </div>
          </div>

          {/* Contacto rápido */}
          <div className="flex space-x-2 mt-3">
            <motion.button
              onClick={handleCall}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-2 px-3 flex items-center justify-center space-x-2 transition-colors duration-200"
            >
              <Phone size={14} className="text-green-400" />
              <span className="text-green-400 text-xs font-medium">Llamar</span>
            </motion.button>
            
            {patient.email && (
              <motion.button
                onClick={handleEmail}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg py-2 px-3 flex items-center justify-center space-x-2 transition-colors duration-200"
              >
                <Mail size={14} className="text-blue-400" />
                <span className="text-blue-400 text-xs font-medium">Email</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Footer con acciones principales */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex space-x-2"
        >
          <motion.button
            onClick={handleViewDetails}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg py-3 px-4 flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Eye size={16} className="text-primary-400" />
            <span className="text-primary-400 font-medium">Ver Perfil</span>
          </motion.button>
        </motion.div>

        {/* Efecto de brillo en hover - DESACTIVADO */}
        {/* <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"
          initial={false}
        /> */}

        {/* Decoración */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-primary-500/10 to-transparent rounded-full -translate-y-10 translate-x-10"></div>
      </GlassCard>
    </motion.div>
  );
};

export default PatientCard;