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
import AddPatientModal from '../components/patients/AddPatientModal';
import { patientService } from '../services/patientService'; // ✅ Importar servicio real
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // ✅ Cargar pacientes reales desde la API
  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await patientService.getAll();
      
      console.log('Pacientes cargados:', patientsData);
      
      // ✅ Verificar si los datos vienen en un array o en una propiedad específica
      const patientsArray = Array.isArray(patientsData) ? patientsData : patientsData.data || [];
      
      setPatients(patientsArray);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      toast.error('Error al cargar los pacientes');
      
      // ✅ Fallback a datos mock en caso de error
      setPatients([
        {
          id: 1,
          nombre_mascota: 'Max',
          especie: 'Perro',
          nombre_raza: 'Golden Retriever',
          edad: '3 años',
          peso: '28.5',
          foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=150',
          nombre_propietario: 'Ana García',
          apellidos_propietario: 'López',
          telefono_principal: '5551234567',
          email: 'ana.garcia@email.com',
          ultima_visita: '2024-01-15',
          estado: 'activo'
        }
      ]);
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
      (selectedFilter === 'gatos' && patient.especie === 'Gato');

    return matchesSearch && matchesFilter;
  });

  const filters = [
    { value: 'todos', label: 'Todos', icon: '🐾' },
    { value: 'perros', label: 'Perros', icon: '🐕' },
    { value: 'gatos', label: 'Gatos', icon: '🐱' }
  ];

  // ✅ Manejar agregado de paciente con datos reales
  const handleAddPatient = (newPatient) => {
    console.log('Nuevo paciente agregado:', newPatient);
    
    // ✅ Agregar el nuevo paciente al estado
    setPatients(prev => [newPatient, ...prev]);
    setShowAddModal(false);
    
    // ✅ Recargar la lista para obtener datos actualizados
    setTimeout(() => {
      loadPatients();
    }, 1000);
  };

  // ✅ Función para refrescar la lista
  const handleRefresh = () => {
    loadPatients();
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-20 lg:pb-8">
        {/* Header Profesional */}
        <Header 
          title="Pacientes" 
          subtitle={`${filteredPatients.length} pacientes registrados`}
          searchPlaceholder="Buscar paciente o propietario..."
          onSearch={(e) => setSearchTerm(e.target.value)}
          actions={[
            {
              icon: Plus,
              label: 'Nuevo Paciente',
              action: () => setShowAddModal(true),
              color: 'from-green-500 to-green-600'
            }
          ]}
        />

        {/* Contenido principal */}
        <div className="p-4 lg:p-6 pt-0">
          <GlassCard className="p-6">
            {/* Filtros */}
            <div className="flex space-x-2 overflow-x-auto pb-2 mb-6">
              {filters.map((filter) => (
                <motion.button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    selectedFilter === filter.value
                      ? 'bg-primary-500/20 text-white border border-primary-400/50'
                      : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  <span>{filter.icon}</span>
                  <span>{filter.label}</span>
                  {/* ✅ Mostrar contador */}
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {filter.value === 'todos' 
                      ? patients.length 
                      : filter.value === 'perros'
                        ? patients.filter(p => p.especie === 'Perro').length
                        : patients.filter(p => p.especie === 'Gato').length
                    }
                  </span>
                </motion.button>
              ))}
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
                      onClick={() => setShowAddModal(true)}
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
                    <PatientCard patient={patient} />
                  </motion.div>
                );
              })}
            </motion.div>
          )}
          </GlassCard>
        </div>

        {/* Floating Action Button - Mobile */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-24 right-4 lg:hidden z-50"
        >
          <motion.button
            onClick={() => setShowAddModal(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full shadow-xl flex items-center justify-center text-white"
          >
            <Plus size={24} />
          </motion.button>
        </motion.div>

        {/* Mobile Navigation */}
        <MobileNavigation />

        {/* Add Patient Modal */}
        <AddPatientModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAddPatient}
        />

        {/* ✅ Debug info (solo en desarrollo) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs max-w-xs">
            <div>Pacientes: {patients.length}</div>
            <div>Filtrados: {filteredPatients.length}</div>
            <div>Usuario: {user?.nombre}</div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PatientsPage;