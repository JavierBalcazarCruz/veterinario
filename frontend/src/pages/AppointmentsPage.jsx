// src/pages/AppointmentsPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, User, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import MobileNavigation from '../components/layout/MobileNavigation';
import AppointmentCard from '../components/appointments/AppointmentCard';
import CalendarView from '../components/appointments/CalendarView';
import AddAppointmentModal from '../components/appointments/AddAppointmentModal';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);

  // Datos de ejemplo
  const mockAppointments = [
    {
      id: 1,
      fecha: '2024-08-09',
      hora: '09:00',
      tipo_consulta: 'primera_vez',
      estado: 'confirmada',
      paciente: {
        nombre: 'Max',
        especie: 'Perro',
        raza: 'Golden Retriever',
        foto_url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100'
      },
      propietario: {
        nombre: 'Ana García',
        telefono: '5551234567'
      },
      notas: 'Revisión general y vacunas'
    },
    {
      id: 2,
      fecha: '2024-08-09',
      hora: '10:30',
      tipo_consulta: 'seguimiento',
      estado: 'programada',
      paciente: {
        nombre: 'Luna',
        especie: 'Gato',
        raza: 'Persa',
        foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=100'
      },
      propietario: {
        nombre: 'Carlos Mendoza',
        telefono: '5559876543'
      },
      notas: 'Control post-operatorio'
    },
    {
      id: 3,
      fecha: '2024-08-09',
      hora: '14:00',
      tipo_consulta: 'urgencia',
      estado: 'en_curso',
      paciente: {
        nombre: 'Rocky',
        especie: 'Perro',
        raza: 'Bulldog',
        foto_url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100'
      },
      propietario: {
        nombre: 'María Rodríguez',
        telefono: '5555555555'
      },
      notas: 'Dificultad respiratoria'
    },
    {
      id: 4,
      fecha: '2024-08-10',
      hora: '11:00',
      tipo_consulta: 'vacunacion',
      estado: 'programada',
      paciente: {
        nombre: 'Milo',
        especie: 'Gato',
        raza: 'Siamés',
        foto_url: null
      },
      propietario: {
        nombre: 'Luis Torres',
        telefono: '5553456789'
      },
      notas: 'Vacuna anual'
    }
  ];

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true);
      setTimeout(() => {
        setAppointments(mockAppointments);
        setLoading(false);
      }, 1000);
    };

    loadAppointments();
  }, []);

  // Filtrar citas
  const filteredAppointments = appointments.filter(appointment => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    const matchesDate = viewMode === 'calendar' || appointment.fecha === selectedDateString;
    
    const matchesSearch = 
      appointment.paciente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.propietario.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'todas' || appointment.estado === statusFilter;

    return matchesDate && matchesSearch && matchesStatus;
  });

  // Obtener citas del día seleccionado
  const todayAppointments = appointments.filter(apt => {
    const selectedDateString = selectedDate.toISOString().split('T')[0];
    return apt.fecha === selectedDateString;
  });

  const statusOptions = [
    { value: 'todas', label: 'Todas', color: 'gray' },
    { value: 'programada', label: 'Programadas', color: 'blue' },
    { value: 'confirmada', label: 'Confirmadas', color: 'green' },
    { value: 'en_curso', label: 'En Curso', color: 'yellow' },
    { value: 'completada', label: 'Completadas', color: 'purple' },
    { value: 'cancelada', label: 'Canceladas', color: 'red' }
  ];

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleAddAppointment = (newAppointment) => {
    setAppointments(prev => [newAppointment, ...prev]);
    setShowAddModal(false);
  };

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header Profesional - Fijo */}
        <div className="flex-shrink-0">
          <Header
            title="Citas Médicas"
            subtitle={`${todayAppointments.length} citas para hoy`}
            actions={[
              {
                icon: Plus,
                label: 'Nueva Cita',
                action: () => setShowAddModal(true),
                color: 'from-purple-500 to-purple-600'
              }
            ]}
          />
        </div>

        {/* Contenido principal - Scrolleable */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 pt-0 pb-24 lg:pb-8">
          <GlassCard className="p-6">
            {/* Controls de Vista */}
            <div className="flex items-center justify-between mb-6">
              {/* Toggle de vista */}
              <div className="flex bg-white/10 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Lista
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${
                    viewMode === 'calendar'
                      ? 'bg-primary-500 text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Calendario
                </button>
              </div>
            </div>

            {/* Selector de fecha */}
            {viewMode === 'list' && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <motion.button
                    onClick={handlePrevDay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </motion.button>

                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-white">
                      {selectedDate.toLocaleDateString('es-ES', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </h2>
                    <p className="text-white/60 text-sm">
                      {todayAppointments.length} citas programadas
                    </p>
                  </div>

                  <motion.button
                    onClick={handleNextDay}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </motion.button>
                </div>

                <motion.button
                  onClick={() => setSelectedDate(new Date())}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-primary-500/20 border border-primary-400/50 rounded-lg text-primary-300 hover:bg-primary-500/30 transition-colors"
                >
                  Hoy
                </motion.button>
              </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="space-y-4">
              <GlassInput
                placeholder="Buscar por paciente o propietario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search size={20} />}
              />

              <div className="flex space-x-2 overflow-x-auto pb-2">
                {statusOptions.map((status) => (
                  <motion.button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      statusFilter === status.value
                        ? 'bg-primary-500/20 text-white border border-primary-400/50'
                        : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full bg-${status.color}-400`}></div>
                    <span>{status.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Contenido principal */}
          {viewMode === 'calendar' ? (
            <CalendarView 
              appointments={appointments}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          ) : (
            <div>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, index) => (
                    <GlassCard key={index} className="p-6">
                      <div className="animate-pulse flex items-center space-x-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-white/20 rounded w-3/4"></div>
                          <div className="h-3 bg-white/20 rounded w-1/2"></div>
                        </div>
                        <div className="w-20 h-8 bg-white/20 rounded"></div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : filteredAppointments.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <GlassCard className="p-12 max-w-md mx-auto">
                    <div className="text-6xl mb-4">📅</div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      No hay citas programadas
                    </h3>
                    <p className="text-white/70 mb-6">
                      {searchTerm 
                        ? `No se encontraron citas para "${searchTerm}"`
                        : 'No hay citas para esta fecha'
                      }
                    </p>
                    <GlassButton
                      onClick={() => setShowAddModal(true)}
                      icon={<Plus size={20} />}
                    >
                      Programar Cita
                    </GlassButton>
                  </GlassCard>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {filteredAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <AppointmentCard appointment={appointment} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
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

      {/* Add Appointment Modal */}
      <AddAppointmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddAppointment}
        selectedDate={selectedDate}
      />
    </AppLayout>
  );
};

export default AppointmentsPage;