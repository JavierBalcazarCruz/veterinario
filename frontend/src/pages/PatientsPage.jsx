// src/pages/PatientsPage.jsx - VERSIÓN CORREGIDA
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Plus, Filter, PawPrint, User, Phone, Calendar } from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import MobileNavigation from '../components/layout/MobileNavigation';
import PatientCard from '../components/patients/PatientCard';
import PatientModal from '../components/ui/PatientModal';
import PerfilPaciente from '../components/patients/PerfilPaciente';
import { patientService } from '../services/patientService'; // ✅ Importar servicio real
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [collapseSidebar, setCollapseSidebar] = useState(false);
  const [showPerfilModal, setShowPerfilModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // ✅ Cargar pacientes reales desde la API
  useEffect(() => {
    loadPatients();
  }, []);

  // ✅ Función para verificar si un paciente es nuevo (últimos 7 días)
  const isNewPatient = (createdAt) => {
    if (!createdAt) return false;
    try {
      const now = new Date();
      const patientDate = new Date(createdAt);

      // Verificar que la fecha es válida
      if (isNaN(patientDate.getTime())) return false;

      // Calcular diferencia en milisegundos
      const diffTime = now - patientDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      // Paciente es nuevo si fue creado en los últimos 7 días
      return diffDays >= 0 && diffDays <= 7;
    } catch (error) {
      console.error('Error al verificar fecha de paciente:', error);
      return false;
    }
  };

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientService.getAll();

      console.log('📦 Respuesta del servidor:', response);
      console.log('🔍 Primer paciente (para debug):', response?.data?.[0] || response?.[0]);

      // ✅ Extraer datos correctamente según la estructura del backend
      let patientsArray = [];

      if (response.success && response.data) {
        // Si viene con estructura { success: true, data: [...] }
        patientsArray = Array.isArray(response.data) ? response.data : [response.data];
      } else if (Array.isArray(response)) {
        // Si viene directamente como array
        patientsArray = response;
      } else if (response.data && Array.isArray(response.data)) {
        // Si viene en response.data
        patientsArray = response.data;
      }

      console.log(`✅ ${patientsArray.length} pacientes cargados para el doctor ${user?.nombre}`);
      setPatients(patientsArray);

      if (patientsArray.length === 0) {
        toast.info('No tienes pacientes registrados aún', {
          duration: 3000,
          icon: '🐾'
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar pacientes:', error);

      // ✅ Manejo de errores más específico
      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente');
      } else if (error.response?.status === 403) {
        toast.error('No tienes permisos para ver los pacientes');
      } else if (error.response?.status === 404) {
        toast.info('No se encontraron pacientes', { icon: '🐾' });
        setPatients([]);
      } else {
        toast.error('Error al cargar los pacientes. Intenta nuevamente');
      }

      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrar pacientes con validación de datos
  const filteredPatients = patients.filter(patient => {
    if (!patient) return false;

    const matchesSearch =
      (patient.nombre_mascota?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (patient.nombre_propietario?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (patient.apellidos_propietario?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesFilter =
      selectedFilter === 'todos' ||
      (selectedFilter === 'perros' && patient.especie === 'Perro') ||
      (selectedFilter === 'gatos' && patient.especie === 'Gato') ||
      (selectedFilter === 'nuevos' && isNewPatient(patient.created_at));

    // Debug para filtro de nuevos
    if (selectedFilter === 'nuevos' && matchesFilter) {
      console.log(`🔍 Filtrado paciente nuevo: ${patient.nombre_mascota}, created_at: ${patient.created_at}, matchesSearch: ${matchesSearch}`);
    }

    return matchesSearch && matchesFilter;
  });

  const filters = [
    { value: 'todos', label: 'Todos', icon: '🐾' },
    { value: 'perros', label: 'Perros', icon: '🐕' },
    { value: 'gatos', label: 'Gatos', icon: '🐱' },
    { value: 'nuevos', label: 'Nuevos', icon: '✨', badge: 'NEW' }
  ];

  // ✅ Abrir modal para agregar paciente
  const handleAddPatient = () => {
    setEditingPatient(null);
    setCollapseSidebar(true);
    setShowModal(true);
  };

  // ✅ Abrir modal para editar paciente
  const handleEditPatient = async (patientId) => {
    try {
      // Obtener datos completos del paciente para edición
      const response = await patientService.getById(patientId);
      console.log('📝 Respuesta completa del servidor:', response);

      // Extraer datos correctamente según la estructura del backend
      const patientData = response.data || response;
      console.log('📝 Datos del paciente para editar:', patientData);

      setEditingPatient(patientData);
      setCollapseSidebar(true);
      setShowModal(true);
    } catch (error) {
      console.error('Error al cargar datos del paciente:', error);
      toast.error('Error al cargar datos del paciente');
    }
  };

  // ✅ Manejar éxito del modal (agregar o editar)
  const handleModalSuccess = (patientData) => {
    console.log('✅ Operación exitosa:', patientData);

    if (editingPatient) {
      // Actualización: actualizar paciente en el estado
      setPatients(prevPatients =>
        prevPatients.map(p => p.id === patientData.id ? patientData : p)
      );
      toast.success(`¡${patientData.nombre_mascota} ha sido actualizado exitosamente!`, {
        duration: 4000,
        icon: '✏️'
      });
    } else {
      // Nuevo: agregar paciente al estado
      setPatients(prevPatients => [patientData, ...prevPatients]);
      toast.success(`¡${patientData.nombre_mascota} ha sido agregado exitosamente!`, {
        duration: 4000,
        icon: '🎉'
      });
    }

    // Recargar en segundo plano para sincronizar con el servidor
    setTimeout(() => loadPatients(), 2000);
  };

  // ✅ Función para refrescar la lista
  const handleRefresh = () => {
    loadPatients();
  };

  // ✅ Función para manejar la eliminación de un paciente
  const handleDeletePatient = (patientId) => {
    // Actualización optimista: remover paciente del estado inmediatamente
    setPatients(prevPatients => prevPatients.filter(p => p.id !== patientId));

    // Recargar en segundo plano para sincronizar con el servidor
    setTimeout(() => loadPatients(), 1000);
  };

  // ✅ Función para abrir el perfil del paciente
  const handleViewDetails = (patientId) => {
    setSelectedPatientId(patientId);
    setShowPerfilModal(true);
  };

  return (
    <AppLayout collapseSidebar={collapseSidebar}>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header Profesional - Fijo */}
        <div className="flex-shrink-0">
          <Header
            title="Pacientes"
            subtitle={`${filteredPatients.length} pacientes registrados`}
            searchPlaceholder="Buscar paciente o propietario..."
            onSearch={(e) => setSearchTerm(e.target.value)}
            actions={[
              {
                icon: Plus,
                label: 'Nuevo Paciente',
                action: handleAddPatient,
                color: 'from-emerald-500 to-green-600',
                className: 'shadow-lg shadow-green-500/30 hover:shadow-green-500/50 font-semibold'
              }
            ]}
          />
        </div>

        {/* Contenido principal - Scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0 pb-24 lg:pb-8">
          <GlassCard className="p-6">
            {/* Filtros - Desktop: Botones horizontales, Mobile: Select estilizado */}

            {/* Versión Mobile - Select Glass */}
            <div className="lg:hidden mb-6">
              <div className="relative">
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white text-base font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 1rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '3rem'
                  }}
                >
                  {filters.map((filter) => {
                    const getCount = () => {
                      if (filter.value === 'todos') return patients.length;
                      if (filter.value === 'perros') return patients.filter(p => p.especie === 'Perro').length;
                      if (filter.value === 'gatos') return patients.filter(p => p.especie === 'Gato').length;
                      if (filter.value === 'nuevos') {
                        return patients.filter(p => isNewPatient(p.created_at)).length;
                      }
                      return 0;
                    };

                    const count = getCount();

                    return (
                      <option
                        key={filter.value}
                        value={filter.value}
                        className="bg-gray-900 text-white py-3"
                      >
                        {filter.icon} {filter.label} ({count})
                      </option>
                    );
                  })}
                </select>

                {/* Badge NEW para nuevos pacientes */}
                {selectedFilter === 'nuevos' && patients.filter(p => isNewPatient(p.created_at)).length > 0 && (
                  <span className="absolute top-2 right-14 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                    NEW
                  </span>
                )}
              </div>
            </div>

            {/* Versión Desktop - Botones horizontales */}
            <div className="hidden lg:flex space-x-3 overflow-x-auto pb-2 mb-6 scrollbar-hide">
              {filters.map((filter) => {
                const getCount = () => {
                  if (filter.value === 'todos') return patients.length;
                  if (filter.value === 'perros') return patients.filter(p => p.especie === 'Perro').length;
                  if (filter.value === 'gatos') return patients.filter(p => p.especie === 'Gato').length;
                  if (filter.value === 'nuevos') {
                    const newPatients = patients.filter(p => {
                      const isNew = isNewPatient(p.created_at);
                      if (isNew) {
                        console.log(`✅ Paciente nuevo detectado: ${p.nombre_mascota}, created_at: ${p.created_at}`);
                      }
                      return isNew;
                    });
                    return newPatients.length;
                  }
                  return 0;
                };

                const count = getCount();

                return (
                  <motion.button
                    key={filter.value}
                    onClick={() => setSelectedFilter(filter.value)}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex items-center space-x-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedFilter === filter.value
                        ? 'bg-gradient-to-r from-primary-500/30 to-primary-600/30 text-white border-2 border-primary-400/60 shadow-lg shadow-primary-500/20'
                        : 'bg-white/8 text-white/70 border-2 border-white/15 hover:bg-white/15 hover:border-white/25'
                    }`}
                  >
                    <span className="text-lg">{filter.icon}</span>
                    <span className="font-semibold">{filter.label}</span>

                    {/* Contador */}
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      selectedFilter === filter.value
                        ? 'bg-white/25 text-white'
                        : 'bg-white/15 text-white/60'
                    }`}>
                      {count}
                    </span>

                    {/* Badge NEW para nuevos pacientes */}
                    {filter.badge && count > 0 && (
                      <span className="absolute -top-2 -right-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse">
                        {filter.badge}
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Lista de pacientes */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <GlassCard key={index} className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/20 rounded w-3/4"></div>
                        <div className="h-3 bg-white/20 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-white/20 rounded"></div>
                      <div className="h-3 bg-white/20 rounded w-5/6"></div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <GlassCard className="p-12 max-w-md mx-auto">
                <div className="text-6xl mb-4">🐾</div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </h3>
                <p className="text-white/70 mb-6">
                  {searchTerm 
                    ? `No hay resultados para "${searchTerm}"`
                    : 'Comienza agregando tu primer paciente'
                  }
                </p>
                {!searchTerm && (
                  <div className="space-y-3">
                    <GlassButton
                      onClick={handleAddPatient}
                      icon={<Plus size={20} />}
                    >
                      Agregar Paciente
                    </GlassButton>
                    <GlassButton
                      onClick={handleRefresh}
                      variant="secondary"
                      disabled={loading}
                    >
                      Refrescar Lista
                    </GlassButton>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPatients.map((patient, index) => {
                // ✅ Validar que el paciente tenga datos válidos
                if (!patient || !patient.id) {
                  console.warn('Paciente con datos inválidos:', patient);
                  return null;
                }

                return (
                  <motion.div
                    key={patient.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PatientCard
                      patient={patient}
                      onEdit={handleEditPatient}
                      onDelete={handleDeletePatient}
                      onViewDetails={handleViewDetails}
                    />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          </GlassCard>
        </div>
      </div>

      {/* Floating Action Button - Mobile */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-24 right-4 lg:hidden z-50"
      >
        <motion.button
          onClick={handleAddPatient}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full shadow-2xl shadow-green-500/50 flex items-center justify-center text-white border-2 border-white/20"
        >
          <Plus size={28} strokeWidth={2.5} />
        </motion.button>
      </motion.div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Patient Modal (Add/Edit) */}
      <PatientModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingPatient(null);
          setCollapseSidebar(false);
        }}
        onSuccess={handleModalSuccess}
        editMode={!!editingPatient}
        initialData={editingPatient}
      />

      {/* Perfil del Paciente Modal */}
      <PerfilPaciente
        isOpen={showPerfilModal}
        onClose={() => {
          setShowPerfilModal(false);
          setSelectedPatientId(null);
        }}
        onSuccess={() => {
          // Recargar la lista de pacientes después de una transferencia
          loadPatients();
        }}
        patientId={selectedPatientId}
      />

      {/* ✅ Debug info (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
          <div>Pacientes: {patients.length}</div>
          <div>Filtrados: {filteredPatients.length}</div>
          <div>Usuario: {user?.nombre}</div>
        </div>
      )}
    </AppLayout>
  );
};

export default PatientsPage;