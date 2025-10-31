// src/pages/EsteticaPage.jsx
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  Plus,
  Calendar,
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Scissors,
  DollarSign,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import MobileNavigation from '../components/layout/MobileNavigation';
import AddCitaEsteticaModal from '../components/estetica/AddCitaEsteticaModal';
import { esteticaService } from '../services/esteticaService';

const EsteticaPage = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list'); // 'list' o 'calendar'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadCitas();
  }, [selectedDate, statusFilter]);

  const loadCitas = async () => {
    try {
      setLoading(true);
      const response = await esteticaService.getAll();

      if (response.success) {
        setCitas(response.data);
      } else {
        setCitas([]);
      }
    } catch (error) {
      console.error('Error al cargar citas de estética:', error);
      toast.error('Error al cargar las citas de estética');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCita = () => {
    setShowAddModal(true);
  };

  const handleCitaCreated = () => {
    loadCitas();
    setShowAddModal(false);
  };

  const handleStatusChange = async (citaId, newStatus) => {
    try {
      const response = await esteticaService.updateStatus(citaId, newStatus);
      if (response.success) {
        toast.success('Estado actualizado correctamente');
        loadCitas();
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      toast.error('Error al actualizar el estado');
    }
  };

  // Filtrar citas por búsqueda y estado
  const filteredCitas = citas.filter(cita => {
    const matchesSearch =
      cita.nombre_mascota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.nombre_propietario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cita.tipo_servicio?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todas' || cita.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Filtrar citas del día seleccionado
  const citasDelDia = filteredCitas.filter(cita => {
    const citaDate = new Date(cita.fecha);
    return citaDate.toDateString() === selectedDate.toDateString();
  });

  const getServicioConfig = (tipo) => {
    const configs = {
      baño: { icon: '🛁', color: 'blue', label: 'Baño Completo' },
      corte: { icon: '✂️', color: 'purple', label: 'Corte de Pelo' },
      baño_corte: { icon: '✨', color: 'pink', label: 'Baño y Corte' },
      uñas: { icon: '💅', color: 'orange', label: 'Corte de Uñas' },
      limpieza_dental: { icon: '🦷', color: 'cyan', label: 'Limpieza Dental' },
      spa_premium: { icon: '💆', color: 'purple', label: 'Spa Premium' },
      deslanado: { icon: '🌬️', color: 'sky', label: 'Deslanado' },
      tratamiento_pulgas: { icon: '🐛', color: 'red', label: 'Tratamiento Anti-pulgas' },
      otro: { icon: '🌟', color: 'gray', label: 'Otro Servicio' }
    };
    return configs[tipo] || configs.otro;
  };

  const getEstadoConfig = (estado) => {
    const configs = {
      programada: { label: 'Programada', color: 'blue', icon: Calendar, bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/50', textColor: 'text-blue-400' },
      confirmada: { label: 'Confirmada', color: 'green', icon: CheckCircle, bgColor: 'bg-green-500/20', borderColor: 'border-green-500/50', textColor: 'text-green-400' },
      en_proceso: { label: 'En Proceso', color: 'yellow', icon: Clock, bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/50', textColor: 'text-yellow-400' },
      completada: { label: 'Completada', color: 'purple', icon: CheckCircle, bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/50', textColor: 'text-purple-400' },
      cancelada: { label: 'Cancelada', color: 'red', icon: XCircle, bgColor: 'bg-red-500/20', borderColor: 'border-red-500/50', textColor: 'text-red-400' },
      no_asistio: { label: 'No Asistió', color: 'gray', icon: AlertCircle, bgColor: 'bg-gray-500/20', borderColor: 'border-gray-500/50', textColor: 'text-gray-400' }
    };
    return configs[estado] || configs.programada;
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <AppLayout>
      <div className="min-h-screen pb-20 md:pb-6">
        <Header
          title="Estética y Grooming"
          subtitle={`${citasDelDia.length} servicios programados hoy`}
          icon={Sparkles}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

          {/* Barra de herramientas */}
          <GlassCard>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por mascota, propietario o servicio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-purple-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                >
                  <option value="todas">Todas</option>
                  <option value="programada">Programada</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="en_proceso">En Proceso</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>

                <GlassButton
                  onClick={handleAddCita}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Nueva Cita</span>
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Selector de fecha */}
          <GlassCard>
            <div className="flex items-center justify-between">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeDate(-1)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-white" />
              </motion.button>

              <div className="text-center">
                <h3 className="text-2xl font-bold text-white">
                  {selectedDate.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                </h3>
                <p className="text-white/60 text-sm mt-1">
                  {citasDelDia.length} {citasDelDia.length === 1 ? 'servicio' : 'servicios'}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => changeDate(1)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRight size={20} className="text-white" />
              </motion.button>
            </div>
          </GlassCard>

          {/* Lista de citas */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"
                />
                <p className="text-white/60 mt-4">Cargando servicios...</p>
              </div>
            ) : citasDelDia.length === 0 ? (
              <GlassCard>
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center">
                    <Sparkles size={32} className="text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No hay servicios programados
                  </h3>
                  <p className="text-white/60 mb-6">
                    {searchTerm || statusFilter !== 'todas'
                      ? 'No se encontraron servicios con los filtros seleccionados'
                      : 'Agenda un nuevo servicio de grooming para empezar'
                    }
                  </p>
                  <GlassButton onClick={handleAddCita} variant="primary">
                    <Plus size={20} className="inline mr-2" />
                    Nueva Cita de Estética
                  </GlassButton>
                </div>
              </GlassCard>
            ) : (
              citasDelDia
                .sort((a, b) => a.hora.localeCompare(b.hora))
                .map((cita, index) => {
                  const servicioConfig = getServicioConfig(cita.tipo_servicio);
                  const estadoConfig = getEstadoConfig(cita.estado);
                  const EstadoIcon = estadoConfig.icon;

                  return (
                    <motion.div
                      key={cita.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GlassCard className="hover:bg-white/10 transition-colors">
                        <div className="flex flex-col md:flex-row md:items-center gap-4">

                          {/* Hora */}
                          <div className="flex-shrink-0 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex flex-col items-center justify-center border border-purple-500/30">
                              <Clock size={20} className="text-purple-400 mb-1" />
                              <span className="text-white font-bold text-lg">
                                {cita.hora?.substring(0, 5)}
                              </span>
                            </div>
                          </div>

                          {/* Info de la cita */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-3">
                                <div className="text-3xl">{servicioConfig.icon}</div>
                                <div>
                                  <h3 className="text-lg font-semibold text-white">
                                    {servicioConfig.label}
                                  </h3>
                                  <div className="flex items-center gap-2 text-sm text-white/60">
                                    <User size={14} />
                                    <span>{cita.nombre_mascota}</span>
                                    <span className="text-white/40">•</span>
                                    <span>{cita.nombre_propietario}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Badge de estado */}
                              <div className={`flex items-center gap-1 px-3 py-1 ${estadoConfig.bgColor} border ${estadoConfig.borderColor} rounded-full`}>
                                <EstadoIcon size={14} className={estadoConfig.textColor} />
                                <span className={`text-xs font-medium ${estadoConfig.textColor}`}>
                                  {estadoConfig.label}
                                </span>
                              </div>
                            </div>

                            {/* Detalles */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
                              {cita.duracion_estimada && (
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  <span>{cita.duracion_estimada} min</span>
                                </div>
                              )}

                              {cita.precio && (
                                <div className="flex items-center gap-1 text-green-400">
                                  <DollarSign size={14} />
                                  <span>{formatCurrency(cita.precio)}</span>
                                </div>
                              )}

                              {cita.raza && (
                                <div className="flex items-center gap-1">
                                  <span>{cita.raza}</span>
                                </div>
                              )}
                            </div>

                            {/* Notas */}
                            {cita.notas && (
                              <div className="p-3 bg-white/5 rounded-lg">
                                <p className="text-sm text-white/80">
                                  {cita.notas}
                                </p>
                              </div>
                            )}

                            {/* Acciones rápidas */}
                            {cita.estado !== 'completada' && cita.estado !== 'cancelada' && (
                              <div className="flex gap-2">
                                {cita.estado === 'programada' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusChange(cita.id, 'confirmada')}
                                    className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 rounded-lg text-green-400 text-xs font-medium transition-colors"
                                  >
                                    Confirmar
                                  </motion.button>
                                )}

                                {(cita.estado === 'confirmada' || cita.estado === 'programada') && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusChange(cita.id, 'en_proceso')}
                                    className="px-3 py-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/50 rounded-lg text-yellow-400 text-xs font-medium transition-colors"
                                  >
                                    Iniciar
                                  </motion.button>
                                )}

                                {cita.estado === 'en_proceso' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleStatusChange(cita.id, 'completada')}
                                    className="px-3 py-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-purple-400 text-xs font-medium transition-colors"
                                  >
                                    Completar
                                  </motion.button>
                                )}

                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleStatusChange(cita.id, 'cancelada')}
                                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-lg text-red-400 text-xs font-medium transition-colors"
                                >
                                  Cancelar
                                </motion.button>
                              </div>
                            )}
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })
            )}
          </div>
        </div>

        {/* Modal para agregar cita */}
        <AddCitaEsteticaModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleCitaCreated}
          selectedDate={selectedDate}
        />

        {/* Navegación móvil */}
        <MobileNavigation />
      </div>
    </AppLayout>
  );
};

export default EsteticaPage;
