// src/components/dashboard/PatientSpotlight.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Search, X, PawPrint, Calendar, Pill, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';

const PatientSpotlight = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Cargar pacientes cuando se abre el spotlight
  useEffect(() => {
    if (isOpen) {
      loadPatients();
      // Focus en el input después de un pequeño delay para la animación
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      // Reset al cerrar
      setSearchTerm('');
      setFilteredPatients([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Filtrar pacientes cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients.slice(0, 10)); // Mostrar solo los primeros 10 pacientes
    } else {
      const filtered = patients.filter(patient => {
        const searchLower = searchTerm.toLowerCase();
        return (
          patient.nombre_mascota?.toLowerCase().includes(searchLower) ||
          patient.nombre_propietario?.toLowerCase().includes(searchLower) ||
          patient.apellidos_propietario?.toLowerCase().includes(searchLower) ||
          patient.nombre_raza?.toLowerCase().includes(searchLower) ||
          patient.especie?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredPatients(filtered.slice(0, 10)); // Limitar a 10 resultados
    }
    setSelectedIndex(0);
  }, [searchTerm, patients]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();
      console.log('✅ Pacientes cargados desde la base de datos:', response);

      // El servicio devuelve { success: true, pacientes: [...] } o { success: true, data: [...] }
      const pacientesData = response.pacientes || response.data || response || [];

      // Asegurarnos de que tenemos un array
      const pacientesArray = Array.isArray(pacientesData) ? pacientesData : [];

      console.log(`📊 Total de pacientes cargados: ${pacientesArray.length}`);

      setPatients(pacientesArray);
      setFilteredPatients(pacientesArray.slice(0, 10));
    } catch (error) {
      console.error('❌ Error al cargar pacientes desde la base de datos:', error);
      toast.error('Error al cargar pacientes desde la base de datos');

      // Si hay error, mostrar array vacío en lugar de datos mock
      setPatients([]);
      setFilteredPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const getSpeciesEmoji = (especie) => {
    switch (especie?.toLowerCase()) {
      case 'perro': return '🐕';
      case 'gato': return '🐱';
      case 'ave': return '🦜';
      case 'roedor': return '🐹';
      default: return '🐾';
    }
  };

  const handleSelectPatient = (patient) => {
    // Navegar al historial clínico del paciente
    navigate(`/historial/${patient.id}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (!filteredPatients.length) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredPatients.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPatients.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredPatients[selectedIndex]) {
          handleSelectPatient(filteredPatients[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
        onClick={onClose}
      >
        {/* Backdrop con efecto blur */}
        <motion.div
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          className="absolute inset-0 bg-black/60"
        />

        {/* Spotlight Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative z-10 w-full max-w-2xl"
        >
          {/* Contenedor principal con efecto Glass */}
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header - Barra de búsqueda */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Buscar paciente por nombre, propietario o raza..."
                  className="w-full bg-white/5 border-2 border-white/10 rounded-xl pl-14 pr-12 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-white/60" />
                  </button>
                )}
              </div>

              {/* Atajos de teclado */}
              <div className="mt-3 flex items-center gap-4 text-xs text-white/50">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">↑↓</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">Enter</kbd>
                  Seleccionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20">Esc</kbd>
                  Cerrar
                </span>
              </div>
            </div>

            {/* Lista de resultados */}
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="flex items-center justify-center p-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Buscando pacientes...</p>
                  </div>
                </div>
              ) : filteredPatients.length > 0 ? (
                <div className="p-2">
                  {filteredPatients.map((patient, index) => (
                    <motion.button
                      key={patient.id}
                      onClick={() => handleSelectPatient(patient)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`w-full text-left p-4 rounded-xl transition-all duration-200 ease-out ${
                        selectedIndex === index
                          ? 'bg-blue-500/30 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                          : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Foto o Avatar */}
                        {patient.foto_url ? (
                          <img
                            src={patient.foto_url}
                            alt={patient.nombre_mascota}
                            className="w-14 h-14 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-2xl border-2 border-white/20">
                            {getSpeciesEmoji(patient.especie)}
                          </div>
                        )}

                        {/* Información */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-white truncate">
                              {patient.nombre_mascota}
                            </h3>
                            <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-white/70">
                              {patient.especie}
                            </span>
                          </div>
                          <p className="text-white/70 text-sm mb-1">
                            {patient.nombre_raza} • {patient.edad || 'Edad no registrada'}
                          </p>
                          <p className="text-white/60 text-sm">
                            Propietario: {patient.nombre_propietario} {patient.apellidos_propietario}
                          </p>
                        </div>

                        {/* Indicador de selección */}
                        <AnimatePresence mode="wait">
                          {selectedIndex === index && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{
                                scale: 1,
                                opacity: 1,
                                transition: { duration: 0.12, ease: "easeOut" }
                              }}
                              exit={{
                                scale: 0.8,
                                opacity: 0,
                                transition: { duration: 0.1 }
                              }}
                              className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center"
                            >
                              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Información adicional - CSS puro para mejor rendimiento */}
                      <div
                        className={`grid overflow-hidden transition-all duration-150 ease-out ${
                          selectedIndex === index
                            ? 'grid-rows-[1fr] opacity-100'
                            : 'grid-rows-[0fr] opacity-0'
                        }`}
                      >
                        <div className="min-h-0">
                          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2 text-white/60">
                              <PawPrint className="w-4 h-4" />
                              <span>Peso: {patient.peso ? `${patient.peso} kg` : 'No registrado'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/60">
                              <Calendar className="w-4 h-4" />
                              <span>Tel: {patient.telefono_principal || 'No registrado'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-white/40" />
                  </div>
                  <p className="text-white/70 text-lg font-medium mb-2">
                    {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                  </p>
                  <p className="text-white/50 text-sm">
                    {searchTerm
                      ? 'Intenta con otro término de búsqueda'
                      : 'Registra tu primer paciente para comenzar'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* Footer - Información adicional */}
            {filteredPatients.length > 0 && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-white/60">
                    {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'}
                  </span>
                  <span className="text-white/40">
                    Presiona Enter para abrir el historial
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PatientSpotlight;
