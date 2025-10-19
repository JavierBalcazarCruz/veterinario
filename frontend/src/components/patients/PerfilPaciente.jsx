// src/components/patients/PerfilPaciente.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  PawPrint,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Weight,
  Cake,
  FileText,
  Activity,
  Syringe,
  Pill,
  ClipboardList,
  ChevronRight,
  Heart,
  Edit,
  ArrowRight
} from 'lucide-react';
import { patientService } from '../../services/patientService';
import toast from 'react-hot-toast';
import PatientModal from '../ui/PatientModal';
import EditarPropietario from './EditarPropietario';
import TransferirMascota from './TransferirMascota';

/**
 * Componente PerfilPaciente - Modal de pantalla completa con perfil del paciente
 *
 * @param {boolean} isOpen - Controla si el modal está abierto
 * @param {function} onClose - Callback cuando se cierra el modal
 * @param {number} patientId - ID del paciente a mostrar
 */
const PerfilPaciente = ({ isOpen = false, onClose, patientId }) => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para los 3 flujos de edición
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showEditOwnerModal, setShowEditOwnerModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'scroll';
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflowY = '';
    };
  }, [isOpen]);

  // Cargar datos del paciente cuando se abre el modal
  useEffect(() => {
    if (isOpen && patientId) {
      loadPatientDetails();
    }
  }, [isOpen, patientId]);

  // Cerrar con tecla ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const loadPatientDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await patientService.getById(patientId);
      const patientData = response.data || response;
      setPatient(patientData);
    } catch (error) {
      console.error('Error al cargar detalles del paciente:', error);
      setError('No se pudieron cargar los detalles del paciente');
      toast.error('Error al cargar los detalles del paciente');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (date) => {
    if (!date) return 'No especificada';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
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
      return 'Sin fecha';
    }
  };

  const InfoCard = ({ icon: Icon, label, value, iconColor = 'text-primary-400' }) => (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon size={20} className={iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/60 text-xs mb-0.5">{label}</p>
          <p className="text-white font-medium text-sm truncate">{value || 'No especificado'}</p>
        </div>
      </div>
    </div>
  );

  const ActionButton = ({ icon: Icon, label, onClick, color = 'primary' }) => {
    const colorClasses = {
      primary: 'bg-primary-500/20 hover:bg-primary-500/30 border-primary-500/30 text-primary-400',
      green: 'bg-green-500/20 hover:bg-green-500/30 border-green-500/30 text-green-400',
      blue: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-500/30 text-blue-400',
      purple: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-500/30 text-purple-400'
    };

    return (
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full border rounded-xl p-4 flex items-center justify-between transition-colors duration-200 ${colorClasses[color]}`}
      >
        <div className="flex items-center space-x-3">
          <Icon size={20} />
          <span className="font-medium">{label}</span>
        </div>
        <ChevronRight size={20} />
      </motion.button>
    );
  };

  // Función para recargar datos después de una edición exitosa
  const handleEditSuccess = () => {
    loadPatientDetails(); // Recargar datos del paciente
    toast.success('Cambios guardados exitosamente');
  };

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center'
        }}
        className="bg-black/80 backdrop-blur-sm overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-900/98 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl w-full max-w-7xl m-4 lg:my-6"
          style={{ maxHeight: '92vh' }}
        >
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary-500/20 via-purple-500/10 to-pink-500/20 p-6 sm:p-8 border-b border-white/10">
            {/* Botón cerrar */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={24} className="text-white" />
            </motion.button>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-16 h-16 border-4 border-white/20 border-t-primary-500 rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={loadPatientDetails}
                  className="px-4 py-2 bg-primary-500/20 hover:bg-primary-500/30 rounded-lg text-white"
                >
                  Reintentar
                </button>
              </div>
            ) : patient ? (
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Foto del paciente */}
                <div className="relative flex-shrink-0">
                  {patient.foto_url ? (
                    <img
                      src={patient.foto_url}
                      alt={patient.nombre_mascota}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/20 shadow-xl"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-5xl sm:text-6xl border-4 border-white/20 shadow-xl">
                      {getSpeciesEmoji(patient.especie)}
                    </div>
                  )}

                  {/* Indicador de estado activo */}
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-gray-900">
                    <Heart size={16} className="text-white fill-white" />
                  </div>
                </div>

                {/* Información básica */}
                <div className="flex-1 text-center sm:text-left">
                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {patient.nombre_mascota}
                  </h1>
                  <p className="text-white/80 text-lg mb-3">
                    {patient.nombre_raza} • {patient.especie}
                  </p>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                      {patient.edad}
                    </span>
                    <span className="px-3 py-1 bg-white/10 rounded-full text-white/80 text-sm">
                      {patient.peso} kg
                    </span>
                    <span className="px-3 py-1 bg-green-500/20 rounded-full text-green-400 text-sm">
                      Activo
                    </span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Body - Contenido scrolleable */}
          <div className="p-6 sm:p-8 lg:p-10 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 220px)' }}>
            {!loading && !error && patient && (
              <div className="space-y-8">
                {/* Información del Propietario */}
                <section>
                  <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center space-x-2">
                    <User size={24} className="text-primary-400" />
                    <span>Información del Propietario</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <InfoCard
                      icon={User}
                      label="Nombre completo"
                      value={`${patient.nombre_propietario} ${patient.apellidos_propietario || ''}`}
                      iconColor="text-blue-400"
                    />
                    <InfoCard
                      icon={Phone}
                      label="Teléfono"
                      value={patient.telefono_principal}
                      iconColor="text-green-400"
                    />
                    {patient.email && (
                      <InfoCard
                        icon={Mail}
                        label="Email"
                        value={patient.email}
                        iconColor="text-purple-400"
                      />
                    )}
                    {patient.direccion && (
                      <InfoCard
                        icon={MapPin}
                        label="Dirección"
                        value={`${patient.direccion.calle} ${patient.direccion.numero_ext}, ${patient.direccion.colonia}`}
                        iconColor="text-red-400"
                      />
                    )}
                  </div>
                </section>

                {/* ✅ NUEVA SECCIÓN: 3 Flujos de Edición */}
                <section>
                  <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center space-x-2">
                    <Edit size={24} className="text-primary-400" />
                    <span>Opciones de Edición</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* FLUJO 1: Editar Paciente */}
                    <motion.button
                      onClick={() => setShowEditPatientModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 hover:from-blue-500/30 hover:to-blue-600/30
                        border-2 border-blue-400/30 rounded-xl p-6 transition-all duration-200 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <PawPrint size={24} className="text-blue-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Editar Paciente</h3>
                          <p className="text-blue-200/70 text-sm">
                            Modifica solo los datos de la mascota (nombre, peso, raza, etc.)
                          </p>
                          <p className="text-blue-300/50 text-xs mt-2">
                            No afecta al propietario
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* FLUJO 2: Editar Propietario */}
                    <motion.button
                      onClick={() => setShowEditOwnerModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 hover:from-yellow-500/30 hover:to-orange-500/30
                        border-2 border-yellow-400/30 rounded-xl p-6 transition-all duration-200 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-yellow-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User size={24} className="text-yellow-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Editar Propietario</h3>
                          <p className="text-yellow-200/70 text-sm">
                            Modifica datos del propietario (nombre, teléfono, dirección)
                          </p>
                          <p className="text-yellow-300/50 text-xs mt-2 flex items-center gap-1">
                            <span className="text-yellow-400">⚠️</span> Afecta a todas sus mascotas
                          </p>
                        </div>
                      </div>
                    </motion.button>

                    {/* FLUJO 3: Transferir Mascota */}
                    <motion.button
                      onClick={() => setShowTransferModal(true)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30
                        border-2 border-purple-400/30 rounded-xl p-6 transition-all duration-200 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <ArrowRight size={24} className="text-purple-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white mb-2">Transferir Mascota</h3>
                          <p className="text-purple-200/70 text-sm">
                            Cambia la mascota a otro propietario (adopción, venta, etc.)
                          </p>
                          <p className="text-purple-300/50 text-xs mt-2">
                            Solo afecta a esta mascota
                          </p>
                        </div>
                      </div>
                    </motion.button>

                  </div>
                </section>

                {/* Información del Paciente */}
                <section>
                  <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center space-x-2">
                    <PawPrint size={24} className="text-primary-400" />
                    <span>Detalles del Paciente</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <InfoCard
                      icon={Cake}
                      label="Fecha de nacimiento"
                      value={formatDate(patient.fecha_nacimiento)}
                      iconColor="text-pink-400"
                    />
                    <InfoCard
                      icon={Weight}
                      label="Peso"
                      value={`${patient.peso} kg`}
                      iconColor="text-yellow-400"
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Última visita"
                      value={getTimeAgo(patient.ultima_visita || patient.updated_at)}
                      iconColor="text-indigo-400"
                    />
                    <InfoCard
                      icon={Calendar}
                      label="Registrado el"
                      value={formatDate(patient.created_at)}
                      iconColor="text-cyan-400"
                    />
                  </div>
                </section>

                {/* Resumen de Actividad Reciente */}
                <section>
                  <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center space-x-2">
                    <Activity size={24} className="text-primary-400" />
                    <span>Actividad Reciente</span>
                  </h2>
                  <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                    <div className="text-center py-8">
                      <Activity size={48} className="text-white/30 mx-auto mb-4" />
                      <p className="text-white/60 text-sm">
                        No hay actividad reciente registrada
                      </p>
                      <p className="text-white/40 text-xs mt-2">
                        Las visitas, vacunas y tratamientos aparecerán aquí
                      </p>
                    </div>
                  </div>
                </section>

                {/* Acciones Rápidas */}
                <section>
                  <h2 className="text-xl lg:text-2xl font-semibold text-white mb-4 lg:mb-6 flex items-center space-x-2">
                    <ClipboardList size={24} className="text-primary-400" />
                    <span>Acciones Rápidas</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <ActionButton
                      icon={FileText}
                      label="Ver Historial Clínico Completo"
                      onClick={() => {
                        toast.info('Función en desarrollo');
                        // TODO: Navegar al historial clínico
                      }}
                      color="primary"
                    />
                    <ActionButton
                      icon={Syringe}
                      label="Registrar Vacuna"
                      onClick={() => toast.info('Función en desarrollo')}
                      color="green"
                    />
                    <ActionButton
                      icon={Pill}
                      label="Registrar Desparasitación"
                      onClick={() => toast.info('Función en desarrollo')}
                      color="blue"
                    />
                    <ActionButton
                      icon={Calendar}
                      label="Agendar Cita"
                      onClick={() => toast.info('Función en desarrollo')}
                      color="purple"
                    />
                  </div>
                </section>

                {/* Enlace destacado al historial clínico */}
                <section>
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="bg-gradient-to-r from-primary-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer"
                    onClick={() => {
                      toast.info('Función en desarrollo');
                      // TODO: Navegar al historial clínico completo
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-primary-500/30 rounded-xl flex items-center justify-center">
                          <FileText size={28} className="text-primary-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            Historial Clínico Completo
                          </h3>
                          <p className="text-white/60 text-sm">
                            Ver todas las consultas, tratamientos y seguimientos
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={32} className="text-white/40" />
                    </div>
                  </motion.div>
                </section>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  // Modales de edición
  const editModals = patient ? (
    <>
      {/* ✅ FLUJO 1: Editar solo datos del paciente */}
      <PatientModal
        isOpen={showEditPatientModal}
        onClose={() => setShowEditPatientModal(false)}
        onSuccess={handleEditSuccess}
        editMode={true}
        initialData={patient}
      />

      {/* ✅ FLUJO 2: Editar datos del propietario */}
      <EditarPropietario
        isOpen={showEditOwnerModal}
        onClose={() => setShowEditOwnerModal(false)}
        onSuccess={handleEditSuccess}
        owner={{
          id: patient.id_propietario,
          id_propietario: patient.id_propietario,
          nombre: patient.nombre_propietario,
          apellidos: patient.apellidos_propietario,
          telefono: patient.telefono_principal,
          email: patient.email,
          direccion: patient.direccion,
          tipo_telefono: patient.tipo_telefono
        }}
        petsCount={1} // TODO: Obtener el número real de mascotas del propietario
      />

      {/* ✅ FLUJO 3: Transferir mascota a otro propietario */}
      <TransferirMascota
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        onSuccess={handleEditSuccess}
        patient={{
          id: patient.id,
          nombre_mascota: patient.nombre_mascota,
          nombre_propietario: patient.nombre_propietario,
          apellidos_propietario: patient.apellidos_propietario,
          foto_url: patient.foto_url
        }}
      />
    </>
  ) : null;

  return (
    <>
      {createPortal(modalContent, document.body)}
      {createPortal(editModals, document.body)}
    </>
  );
};

export default PerfilPaciente;
