// src/components/appointments/AddAppointmentModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { X, Calendar, Clock, User, PawPrint, Save, Search } from 'lucide-react';
import * as yup from 'yup';

import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import GlassInput from '../ui/GlassInput';
import { useForm } from '../../hooks/useForm';
import toast from 'react-hot-toast';

// Esquema de validación
const validationSchema = yup.object({
  id_paciente: yup
    .number()
    .required('Selecciona un paciente'),
  fecha: yup
    .date()
    .required('La fecha es obligatoria')
    .min(new Date(), 'La fecha no puede ser anterior a hoy'),
  hora: yup
    .string()
    .required('La hora es obligatoria'),
  tipo_consulta: yup
    .string()
    .oneOf(['primera_vez', 'seguimiento', 'urgencia', 'vacunacion'], 'Tipo de consulta inválido')
    .required('Selecciona el tipo de consulta'),
});

const AddAppointmentModal = ({ isOpen, onClose, onSuccess, selectedDate = new Date() }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  // Datos de ejemplo de pacientes
  const mockPatients = [
    {
      id: 1,
      nombre_mascota: 'Max',
      especie: 'Perro',
      raza: 'Golden Retriever',
      propietario: 'Ana García López',
      telefono: '5551234567',
      foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=60'
    },
    {
      id: 2,
      nombre_mascota: 'Luna',
      especie: 'Gato',
      raza: 'Persa',
      propietario: 'Carlos Mendoza',
      telefono: '5559876543',
      foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=60'
    },
    {
      id: 3,
      nombre_mascota: 'Rocky',
      especie: 'Perro',
      raza: 'Bulldog',
      propietario: 'María Rodríguez',
      telefono: '5555555555',
      foto_url: null
    }
  ];

  const {
    values,
    handleSubmit,
    getFieldProps,
    isSubmitting,
    reset,
    setValue
  } = useForm(
    {
      id_paciente: '',
      fecha: selectedDate.toISOString().split('T')[0],
      hora: '',
      tipo_consulta: '',
      notas: ''
    },
    validationSchema
  );

  const filteredPatients = mockPatients.filter(patient =>
    patient.nombre_mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.propietario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = mockPatients.find(p => p.id === parseInt(values.id_paciente));

  const tiposConsulta = [
    {
      value: 'primera_vez',
      label: 'Primera Vez',
      desc: 'Primera consulta del paciente',
      icon: '🆕',
      color: 'from-blue-400 to-blue-600'
    },
    {
      value: 'seguimiento',
      label: 'Seguimiento',
      desc: 'Control de tratamiento',
      icon: '📋',
      color: 'from-green-400 to-green-600'
    },
    {
      value: 'urgencia',
      label: 'Urgencia',
      desc: 'Atención inmediata',
      icon: '🚨',
      color: 'from-red-400 to-red-600'
    },
    {
      value: 'vacunacion',
      label: 'Vacunación',
      desc: 'Aplicación de vacunas',
      icon: '💉',
      color: 'from-purple-400 to-purple-600'
    }
  ];

  const horariosDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleClose = () => {
    reset();
    setSearchTerm('');
    setShowPatientSearch(false);
    onClose();
  };

  const handleSelectPatient = (patient) => {
    setValue('id_paciente', patient.id);
    setShowPatientSearch(false);
    setSearchTerm('');
  };

  const onSubmit = async (formData) => {
    try {
      const newAppointment = {
        id: Date.now(),
        ...formData,
        estado: formData.tipo_consulta === 'urgencia' ? 'confirmada' : 'programada',
        paciente: selectedPatient,
        propietario: {
          nombre: selectedPatient.propietario,
          telefono: selectedPatient.telefono
        }
      };

      onSuccess(newAppointment);
      toast.success('Cita programada exitosamente');
      handleClose();
    } catch (error) {
      toast.error('Error al programar la cita');
    }
  };

  const getSpeciesEmoji = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      default: return '🐾';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          <GlassCard className="p-0">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Nueva Cita
                  </h2>
                  <p className="text-white/70">
                    Programar consulta médica
                  </p>
                </div>
                
                <motion.button
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={20} className="text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Selección de paciente */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Paciente
                  </label>
                  
                  {!selectedPatient ? (
                    <div>
                      <div className="relative mb-3">
                        <GlassInput
                          placeholder="Buscar paciente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onFocus={() => setShowPatientSearch(true)}
                          icon={<Search size={20} />}
                        />
                      </div>

                      {showPatientSearch && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl max-h-40 overflow-y-auto"
                        >
                          {filteredPatients.map((patient) => (
                            <motion.button
                              key={patient.id}
                              type="button"
                              onClick={() => handleSelectPatient(patient)}
                              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                              className="w-full p-3 text-left flex items-center space-x-3 hover:bg-white/10 transition-colors first:rounded-t-xl last:rounded-b-xl"
                            >
                              {patient.foto_url ? (
                                <img
                                  src={patient.foto_url}
                                  alt={patient.nombre_mascota}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg">
                                  {getSpeciesEmoji(patient.especie)}
                                </div>
                              )}
                              <div>
                                <p className="text-white font-medium">
                                  {patient.nombre_mascota}
                                </p>
                                <p className="text-white/60 text-sm">
                                  {patient.propietario} • {patient.raza}
                                </p>
                              </div>
                            </motion.button>
                          ))}
                          
                          {filteredPatients.length === 0 && (
                            <div className="p-4 text-center text-white/60">
                              No se encontraron pacientes
                            </div>
                          )}
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-4 bg-white/10 rounded-xl border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {selectedPatient.foto_url ? (
                            <img
                              src={selectedPatient.foto_url}
                              alt={selectedPatient.nombre_mascota}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-lg">
                              {getSpeciesEmoji(selectedPatient.especie)}
                            </div>
                          )}
                          <div>
                            <p className="text-white font-semibold">
                              {selectedPatient.nombre_mascota}
                            </p>
                            <p className="text-white/70 text-sm">
                              {selectedPatient.propietario} • {selectedPatient.raza}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          type="button"
                          onClick={() => {
                            setValue('id_paciente', '');
                            setShowPatientSearch(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-primary-300 hover:text-primary-200 text-sm"
                        >
                          Cambiar
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Fecha y hora */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GlassInput
                    {...getFieldProps('fecha')}
                    type="date"
                    label="Fecha"
                    icon={<Calendar size={20} />}
                  />

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Hora
                    </label>
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                      {horariosDisponibles.map((hora) => (
                        <motion.button
                          key={hora}
                          type="button"
                          onClick={() => setValue('hora', hora)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                            values.hora === hora
                              ? 'bg-primary-500/20 border-primary-400/50 text-white'
                              : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {hora}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tipo de consulta */}
                <div>
                  <label className="block text-sm font-medium text-white mb-3">
                    Tipo de Consulta
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {tiposConsulta.map((tipo) => (
                      <motion.button
                        key={tipo.value}
                        type="button"
                        onClick={() => setValue('tipo_consulta', tipo.value)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`p-4 rounded-xl border transition-all duration-200 ${
                          values.tipo_consulta === tipo.value
                            ? `bg-gradient-to-br ${tipo.color} border-white/30`
                            : 'bg-white/5 border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{tipo.icon}</div>
                          <div className="font-medium text-white text-sm">
                            {tipo.label}
                          </div>
                          <div className="text-white/70 text-xs">
                            {tipo.desc}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Notas (Opcional)
                  </label>
                  <textarea
                    {...getFieldProps('notas')}
                    placeholder="Información adicional sobre la consulta..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-400/50 resize-none"
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10">
              <div className="flex justify-end space-x-3">
                <GlassButton
                  onClick={handleClose}
                  variant="ghost"
                >
                  Cancelar
                </GlassButton>
                
                <GlassButton
                  onClick={handleSubmit(onSubmit)}
                  loading={isSubmitting}
                  icon={!isSubmitting && <Save size={20} />}
                  disabled={!selectedPatient || !values.fecha || !values.hora || !values.tipo_consulta}
                >
                  {isSubmitting ? 'Guardando...' : 'Programar Cita'}
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AddAppointmentModal;