// src/pages/PatientsPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, Plus, Filter, PawPrint, User, Phone, Calendar } from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import MobileNavigation from '../components/layout/MobileNavigation';
import PatientCard from '../components/patients/PatientCard';
import AddPatientModal from '../components/patients/AddPatientModal';
import { useAuth } from '../context/AuthContext';

const PatientsPage = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // Datos de ejemplo (reemplazar con API real)
  const mockPatients = [
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
    },
    {
      id: 2,
      nombre_mascota: 'Luna',
      especie: 'Gato',
      nombre_raza: 'Persa',
      edad: '2 años',
      peso: '4.2',
      foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=150',
      nombre_propietario: 'Carlos',
      apellidos_propietario: 'Mendoza',
      telefono_principal: '5559876543',
      email: 'carlos.mendoza@email.com',
      ultima_visita: '2024-01-10',
      estado: 'activo'
    },
    {
      id: 3,
      nombre_mascota: 'Rocky',
      especie: 'Perro',
      nombre_raza: 'Bulldog',
      edad: '5 años',
      peso: '22.0',
      foto_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=150',
      nombre_propietario: 'María',
      apellidos_propietario: 'Rodríguez',
      telefono_principal: '5555555555',
      email: 'maria.rodriguez@email.com',
      ultima_visita: '2024-01-08',
      estado: 'activo'
    }
  ];

  // Simular carga de datos
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      // Simular delay de API
      setTimeout(() => {
        setPatients(mockPatients);
        setLoading(false);
      }, 1000);
    };

    loadPatients();
  }, []);

  // Filtrar pacientes
  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.nombre_mascota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.nombre_propietario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.apellidos_propietario.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleAddPatient = (newPatient) => {
    setPatients(prev => [newPatient, ...prev]);
    setShowAddModal(false);
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-20 lg:pb-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 lg:p-6"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">
                  Pacientes
                </h1>
                <p className="text-white/70">
                  {filteredPatients.length} pacientes registrados
                </p>
              </div>
              
              <GlassButton
                onClick={() => setShowAddModal(true)}
                icon={<Plus size={20} />}
                className="hidden lg:flex"
              >
                Nuevo Paciente
              </GlassButton>
            </div>

            {/* Barra de búsqueda */}
            <div className="relative mb-6">
              <GlassInput
                placeholder="Buscar paciente o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={20} />}
              />
            </div>

            {/* Filtros */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
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
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </motion.header>

        {/* Lista de pacientes */}
        <main className="px-4 lg:px-6">
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
                  <GlassButton
                    onClick={() => setShowAddModal(true)}
                    icon={<Plus size={20} />}
                  >
                    Agregar Paciente
                  </GlassButton>
                )}
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredPatients.map((patient, index) => (
                <motion.div
                  key={patient.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PatientCard patient={patient} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>

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
      </div>
    </AppLayout>
  );
};

export default PatientsPage;