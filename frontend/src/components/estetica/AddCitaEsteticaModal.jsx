// src/components/estetica/AddCitaEsteticaModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Scissors,
  Sparkles,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  Search,
  Loader
} from 'lucide-react';
import toast from 'react-hot-toast';
import { patientService } from '../../services/patientService';
import { esteticaService } from '../../services/esteticaService';

const AddCitaEsteticaModal = ({ isOpen, onClose, onSuccess, selectedDate = new Date() }) => {
  const [formData, setFormData] = useState({
    id_paciente: '',
    fecha: selectedDate.toISOString().split('T')[0],
    hora: '',
    tipo_servicio: '',
    duracion_estimada: 60,
    precio: '',
    notas: ''
  });

  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPatients, setLoadingPatients] = useState(false);

  // Tipos de servicios de estética (valores deben coincidir con backend)
  const servicios = [
    { value: 'baño', label: 'Baño Completo', icon: '🛁', duracion: 60, precio: 250 },
    { value: 'corte', label: 'Corte de Pelo', icon: '✂️', duracion: 90, precio: 400 },
    { value: 'baño_corte', label: 'Baño y Corte', icon: '✨', duracion: 120, precio: 500 },
    { value: 'uñas', label: 'Corte de Uñas', icon: '💅', duracion: 20, precio: 100 },
    { value: 'limpieza_dental', label: 'Limpieza Dental', icon: '🦷', duracion: 45, precio: 350 },
    { value: 'spa_premium', label: 'Spa Premium', icon: '💆', duracion: 150, precio: 800 },
    { value: 'deslanado', label: 'Deslanado', icon: '🌬️', duracion: 90, precio: 450 },
    { value: 'tratamiento_pulgas', label: 'Tratamiento Anti-pulgas', icon: '🐛', duracion: 45, precio: 300 },
    { value: 'otro', label: 'Otro Servicio', icon: '🌟', duracion: 60, precio: 0 }
  ];

  // Horarios disponibles
  const horariosDisponibles = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  // Cargar pacientes
  useEffect(() => {
    if (isOpen) {
      loadPatients();
    }
  }, [isOpen]);

  // Reset form cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id_paciente: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '',
        tipo_servicio: '',
        duracion_estimada: 60,
        precio: '',
        notas: ''
      });
      setSearchTerm('');
    }
  }, [isOpen]);

  // Bloquear scroll cuando modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await patientService.getAll();

      if (response.success) {
        const formattedPatients = response.data.map(patient => ({
          id: patient.id,
          nombre_mascota: patient.nombre_mascota,
          especie: patient.especie,
          raza: patient.nombre_raza || patient.raza,
          foto_url: patient.foto_url,
          propietario: `${patient.nombre_propietario} ${patient.apellidos_propietario || ''}`
        }));
        setPatients(formattedPatients);
      }
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar pacientes');
    } finally {
      setLoadingPatients(false);
    }
  };

  const handleServicioChange = (tipo) => {
    const servicio = servicios.find(s => s.value === tipo);
    if (servicio) {
      setFormData(prev => ({
        ...prev,
        tipo_servicio: tipo,
        duracion_estimada: servicio.duracion,
        precio: servicio.precio
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.id_paciente) {
      toast.error('Selecciona un paciente');
      return;
    }

    if (!formData.fecha) {
      toast.error('Selecciona una fecha');
      return;
    }

    if (!formData.hora) {
      toast.error('Selecciona una hora');
      return;
    }

    if (!formData.tipo_servicio) {
      toast.error('Selecciona un tipo de servicio');
      return;
    }

    try {
      setLoading(true);

      const citaData = {
        id_paciente: parseInt(formData.id_paciente),
        fecha: formData.fecha,
        hora: formData.hora,
        tipo_servicio: formData.tipo_servicio,
        duracion_estimada: parseInt(formData.duracion_estimada),
        precio: parseFloat(formData.precio) || null,
        notas: formData.notas?.trim() || null
      };

      console.log('📤 Enviando cita de estética:', citaData);

      const response = await esteticaService.create(citaData);

      if (response.success) {
        toast.success('Cita de estética agendada exitosamente');
        onSuccess?.(response.data);
        onClose();
      } else {
        toast.error(response.message || 'Error al crear la cita');
      }
    } catch (error) {
      console.error('Error al crear cita de estética:', error);
      toast.error(error.response?.data?.message || 'Error al crear la cita de estética');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.nombre_mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.especie.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPatient = patients.find(p => p.id === parseInt(formData.id_paciente));

  const getSpeciesEmoji = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      case 'ave': return '🦜';
      case 'conejo': return '🐰';
      default: return '🐾';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-purple-500/20 w-full max-w-3xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 p-6 border-b border-white/10">
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={20} className="text-white" />
            </motion.button>

            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Nueva Cita de Estética</h2>
                <p className="text-white/60 text-sm">Agenda un servicio de grooming</p>
              </div>
            </div>
          </div>

          {/* Body - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            <div className="space-y-6">

              {/* Selección de Paciente */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Paciente *
                </label>

                {/* Buscador */}
                <div className="relative mb-3">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, propietario o especie..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                {/* Lista de pacientes */}
                <div className="max-h-48 overflow-y-auto space-y-2 bg-white/5 rounded-xl p-2 border border-white/10">
                  {loadingPatients ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader className="animate-spin text-purple-400" size={24} />
                    </div>
                  ) : filteredPatients.length === 0 ? (
                    <div className="text-center py-8 text-white/60">
                      No se encontraron pacientes
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <motion.button
                        key={patient.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, id_paciente: patient.id }))}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all ${
                          formData.id_paciente === patient.id
                            ? 'bg-purple-500/20 border-2 border-purple-500/50'
                            : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                        }`}
                      >
                        {patient.foto_url ? (
                          <img
                            src={patient.foto_url}
                            alt={patient.nombre_mascota}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-lg">
                            {getSpeciesEmoji(patient.especie)}
                          </div>
                        )}
                        <div className="flex-1 text-left">
                          <p className="text-white font-medium">{patient.nombre_mascota}</p>
                          <p className="text-white/60 text-xs">{patient.raza} • {patient.propietario}</p>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </div>

              {/* Tipo de Servicio */}
              <div>
                <label className="block text-white font-medium mb-3">
                  Tipo de Servicio *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {servicios.map((servicio) => (
                    <motion.button
                      key={servicio.value}
                      type="button"
                      onClick={() => handleServicioChange(servicio.value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.tipo_servicio === servicio.value
                          ? 'bg-purple-500/20 border-purple-500 text-white'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-2">{servicio.icon}</div>
                      <div className="text-sm font-medium">{servicio.label}</div>
                      <div className="text-xs text-white/60 mt-1">{servicio.duracion} min</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Fecha y Hora */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Hora *
                  </label>
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-2 bg-white/5 border border-white/10 rounded-xl">
                    {horariosDisponibles.map((hora) => (
                      <motion.button
                        key={hora}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, hora: hora }))}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                          formData.hora === hora
                            ? 'bg-purple-500/30 border-purple-400/50 text-white font-semibold'
                            : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        {hora}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Duración y Precio */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">
                    <Clock size={16} className="inline mr-2" />
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.duracion_estimada}
                    onChange={(e) => setFormData(prev => ({ ...prev, duracion_estimada: e.target.value }))}
                    min="10"
                    step="5"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-white font-medium mb-2">
                    <DollarSign size={16} className="inline mr-2" />
                    Precio
                  </label>
                  <input
                    type="number"
                    value={formData.precio}
                    onChange={(e) => setFormData(prev => ({ ...prev, precio: e.target.value }))}
                    min="0"
                    step="50"
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label className="block text-white font-medium mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Notas
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                  rows={3}
                  placeholder="Indicaciones especiales, preferencias del cliente..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors resize-none"
                />
              </div>

            </div>

            {/* Footer con botones */}
            <div className="flex gap-3 mt-6 pt-6 border-t border-white/10">
              <motion.button
                type="button"
                onClick={onClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-colors"
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>Agendando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Agendar Cita</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};

export default AddCitaEsteticaModal;
