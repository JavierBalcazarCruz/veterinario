/**
 * =====================================================
 * COMPONENTE HISTORIAL CLÍNICO
 * =====================================================
 * Muestra el historial médico completo de un paciente
 * con pestañas organizadas: Consultas, Vacunas,
 * Desparasitaciones, Alergias, Cirugías
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  FileText,
  Syringe,
  Bug,
  AlertTriangle,
  Scissors,
  Plus,
  Calendar,
  Activity,
  TrendingUp,
  Clock,
  Loader
} from 'lucide-react';
import { historialService } from '../../services/historialService';
import toast from 'react-hot-toast';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';

/**
 * Componente principal del historial clínico
 * @param {number} pacienteId - ID del paciente
 * @param {string} nombreMascota - Nombre de la mascota para mostrar
 */
const HistorialClinico = ({ pacienteId, nombreMascota = 'Paciente' }) => {
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consultas');
  const [estadisticas, setEstadisticas] = useState(null);

  // Estados para modales (se implementarán después)
  const [showConsultaModal, setShowConsultaModal] = useState(false);
  const [showVacunaModal, setShowVacunaModal] = useState(false);
  const [showAlergiaModal, setShowAlergiaModal] = useState(false);
  const [showCirugiaModal, setShowCirugiaModal] = useState(false);

  // Cargar historial al montar el componente
  useEffect(() => {
    if (pacienteId) {
      cargarHistorial();
    }
  }, [pacienteId]);

  /**
   * 📥 Cargar historial completo del paciente
   */
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      const response = await historialService.getHistorialCompleto(pacienteId);

      if (response.success) {
        setHistorial(response.data);
        setEstadisticas(response.data.estadisticas);
      }
    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      toast.error('Error al cargar el historial clínico');
    } finally {
      setLoading(false);
    }
  };

  // Configuración de pestañas
  const tabs = [
    { id: 'consultas', label: 'Consultas', icon: FileText, count: estadisticas?.total_consultas || 0 },
    { id: 'vacunas', label: 'Vacunas', icon: Syringe, count: estadisticas?.total_vacunas || 0 },
    { id: 'desparasitaciones', label: 'Desparasitaciones', icon: Bug, count: estadisticas?.total_desparasitaciones || 0 },
    { id: 'alergias', label: 'Alergias', icon: AlertTriangle, count: estadisticas?.alergias_activas || 0 },
    { id: 'cirugias', label: 'Cirugías', icon: Scissors, count: estadisticas?.cirugias_realizadas || 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 text-blue-400 animate-spin" />
        <span className="ml-3 text-white/70">Cargando historial clínico...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado con estadísticas rápidas */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-400" />
            Historial Clínico
          </h2>
          <p className="text-white/60 mt-1">Registro médico completo de {nombreMascota}</p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="flex gap-4">
          <StatCard
            icon={FileText}
            label="Consultas"
            value={estadisticas?.total_consultas || 0}
            color="blue"
          />
          <StatCard
            icon={Syringe}
            label="Vacunas"
            value={estadisticas?.total_vacunas || 0}
            color="green"
          />
          <StatCard
            icon={AlertTriangle}
            label="Alergias"
            value={estadisticas?.alergias_activas || 0}
            color="red"
          />
        </div>
      </div>

      {/* Navegación por pestañas */}
      <GlassCard className="p-1">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              icon={tab.icon}
              label={tab.label}
              count={tab.count}
            />
          ))}
        </div>
      </GlassCard>

      {/* Contenido de las pestañas */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'consultas' && (
            <ConsultasTab
              consultas={historial?.consultas || []}
              onAddNew={() => setShowConsultaModal(true)}
              onReload={cargarHistorial}
            />
          )}

          {activeTab === 'vacunas' && (
            <VacunasTab
              vacunas={historial?.vacunas || []}
              onAddNew={() => setShowVacunaModal(true)}
              onReload={cargarHistorial}
            />
          )}

          {activeTab === 'desparasitaciones' && (
            <DesparasitacionesTab
              desparasitaciones={historial?.desparasitaciones || []}
              onReload={cargarHistorial}
            />
          )}

          {activeTab === 'alergias' && (
            <AlergiasTab
              alergias={historial?.alergias || []}
              onAddNew={() => setShowAlergiaModal(true)}
              onReload={cargarHistorial}
            />
          )}

          {activeTab === 'cirugias' && (
            <CirugiasTab
              cirugias={historial?.cirugias || []}
              onAddNew={() => setShowCirugiaModal(true)}
              onReload={cargarHistorial}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de estadística
// =====================================================
const StatCard = ({ icon: Icon, label, value, color = 'blue' }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10'
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
      <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/60">{label}</p>
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Botón de pestaña
// =====================================================
const TabButton = ({ active, onClick, icon: Icon, label, count }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-4 py-3 rounded-xl font-medium
        transition-all duration-200 whitespace-nowrap
        ${active
          ? 'bg-white/10 text-white shadow-lg'
          : 'text-white/60 hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count > 0 && (
        <span className={`
          px-2 py-0.5 text-xs rounded-full font-semibold
          ${active ? 'bg-blue-500 text-white' : 'bg-white/10 text-white/70'}
        `}>
          {count}
        </span>
      )}
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl -z-10"
          transition={{ type: 'spring', duration: 0.5 }}
        />
      )}
    </button>
  );
};

// =====================================================
// TAB: Consultas médicas
// =====================================================
const ConsultasTab = ({ consultas, onAddNew, onReload }) => {
  if (consultas.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Sin consultas registradas"
        description="No hay consultas médicas en el historial de este paciente"
        actionLabel="Agregar Primera Consulta"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Consultas Médicas ({consultas.length})
        </h3>
        <GlassButton onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nueva Consulta
        </GlassButton>
      </div>

      <div className="space-y-3">
        {consultas.map((consulta) => (
          <ConsultaCard key={consulta.id} consulta={consulta} />
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de consulta
// =====================================================
const ConsultaCard = ({ consulta }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <GlassCard className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white">{consulta.motivo_consulta}</h4>
                <div className="flex items-center gap-2 text-sm text-white/60 mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(consulta.fecha_consulta)}</span>
                  {consulta.veterinario && (
                    <>
                      <span>•</span>
                      <span>Dr. {consulta.veterinario}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Signos vitales en vista resumida */}
            {(consulta.peso_actual || consulta.temperatura) && (
              <div className="flex gap-4 mt-3 ml-12">
                {consulta.peso_actual && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <TrendingUp className="w-4 h-4" />
                    <span>{consulta.peso_actual} kg</span>
                  </div>
                )}
                {consulta.temperatura && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Activity className="w-4 h-4" />
                    <span>{consulta.temperatura}°C</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-white/40" />
          </motion.div>
        </div>
      </div>

      {/* Detalles expandidos */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-4">
              {/* Diagnóstico */}
              {consulta.diagnostico && (
                <div>
                  <h5 className="text-sm font-semibold text-white/80 mb-2">Diagnóstico</h5>
                  <p className="text-white/70">{consulta.diagnostico}</p>
                </div>
              )}

              {/* Tratamiento */}
              {consulta.tratamiento && (
                <div>
                  <h5 className="text-sm font-semibold text-white/80 mb-2">Tratamiento</h5>
                  <p className="text-white/70">{consulta.tratamiento}</p>
                </div>
              )}

              {/* Signos vitales completos */}
              <div>
                <h5 className="text-sm font-semibold text-white/80 mb-3">Signos Vitales</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {consulta.peso_actual && (
                    <VitalSignBadge label="Peso" value={`${consulta.peso_actual} kg`} />
                  )}
                  {consulta.temperatura && (
                    <VitalSignBadge label="Temperatura" value={`${consulta.temperatura}°C`} />
                  )}
                  {consulta.frecuencia_cardiaca && (
                    <VitalSignBadge label="FC" value={`${consulta.frecuencia_cardiaca} lpm`} />
                  )}
                  {consulta.frecuencia_respiratoria && (
                    <VitalSignBadge label="FR" value={`${consulta.frecuencia_respiratoria} rpm`} />
                  )}
                  {consulta.presion_arterial && (
                    <VitalSignBadge label="PA" value={consulta.presion_arterial} />
                  )}
                  {consulta.nivel_dolor !== null && consulta.nivel_dolor !== undefined && (
                    <VitalSignBadge label="Dolor" value={`${consulta.nivel_dolor}/10`} />
                  )}
                </div>
              </div>

              {/* Observaciones */}
              {consulta.observaciones && (
                <div>
                  <h5 className="text-sm font-semibold text-white/80 mb-2">Observaciones</h5>
                  <p className="text-white/60 text-sm">{consulta.observaciones}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// =====================================================
// COMPONENTE: Badge de signo vital
// =====================================================
const VitalSignBadge = ({ label, value }) => {
  return (
    <div className="bg-white/5 rounded-lg p-2 border border-white/10">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-sm font-semibold text-white">{value}</p>
    </div>
  );
};

// =====================================================
// TAB: Vacunas
// =====================================================
const VacunasTab = ({ vacunas, onAddNew, onReload }) => {
  if (vacunas.length === 0) {
    return (
      <EmptyState
        icon={Syringe}
        title="Sin vacunas registradas"
        description="No hay vacunas aplicadas en el historial de este paciente"
        actionLabel="Registrar Primera Vacuna"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Vacunas Aplicadas ({vacunas.length})
        </h3>
        <GlassButton onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Registrar Vacuna
        </GlassButton>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {vacunas.map((vacuna) => (
          <VacunaCard key={vacuna.id} vacuna={vacuna} />
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de vacuna
// =====================================================
const VacunaCard = ({ vacuna }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No programada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isProximaSoon = () => {
    if (!vacuna.fecha_proxima) return false;
    const proxima = new Date(vacuna.fecha_proxima);
    const hoy = new Date();
    const diffDays = Math.ceil((proxima - hoy) / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 30;
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500/10 rounded-lg">
          <Syringe className="w-5 h-5 text-green-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{vacuna.tipo_vacuna}</h4>
          <div className="space-y-1 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Aplicada: {formatDate(vacuna.fecha_aplicacion)}</span>
            </div>
            {vacuna.fecha_proxima && (
              <div className={`flex items-center gap-2 ${isProximaSoon() ? 'text-yellow-400' : ''}`}>
                <Clock className="w-3 h-3" />
                <span>Próxima: {formatDate(vacuna.fecha_proxima)}</span>
                {isProximaSoon() && <span className="text-xs">(Próxima)</span>}
              </div>
            )}
            {vacuna.lote_vacuna && (
              <p className="text-xs">Lote: {vacuna.lote_vacuna}</p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// =====================================================
// TAB: Desparasitaciones
// =====================================================
const DesparasitacionesTab = ({ desparasitaciones, onReload }) => {
  if (desparasitaciones.length === 0) {
    return (
      <EmptyState
        icon={Bug}
        title="Sin desparasitaciones registradas"
        description="No hay desparasitaciones en el historial de este paciente"
      />
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Desparasitaciones ({desparasitaciones.length})
      </h3>

      <div className="grid gap-3 md:grid-cols-2">
        {desparasitaciones.map((desparasitacion) => (
          <DesparasitacionCard key={desparasitacion.id} desparasitacion={desparasitacion} />
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de desparasitación
// =====================================================
const DesparasitacionCard = ({ desparasitacion }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No programada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-purple-500/10 rounded-lg">
          <Bug className="w-5 h-5 text-purple-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-white mb-1">{desparasitacion.producto}</h4>
          <div className="space-y-1 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3" />
              <span>Aplicada: {formatDate(desparasitacion.fecha_aplicacion)}</span>
            </div>
            <p>Dosis: {desparasitacion.dosis}</p>
            {desparasitacion.peso_actual && (
              <p>Peso: {desparasitacion.peso_actual} kg</p>
            )}
            {desparasitacion.fecha_proxima && (
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Próxima: {formatDate(desparasitacion.fecha_proxima)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// =====================================================
// TAB: Alergias
// =====================================================
const AlergiasTab = ({ alergias, onAddNew, onReload }) => {
  if (alergias.length === 0) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Sin alergias registradas"
        description="No hay alergias conocidas para este paciente"
        actionLabel="Registrar Alergia"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Alergias Activas ({alergias.length})
        </h3>
        <GlassButton onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Registrar Alergia
        </GlassButton>
      </div>

      <div className="space-y-3">
        {alergias.map((alergia) => (
          <AlergiaCard key={alergia.id} alergia={alergia} onReload={onReload} />
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de alergia
// =====================================================
const AlergiaCard = ({ alergia, onReload }) => {
  const severidadConfig = {
    leve: { color: 'yellow', label: 'Leve' },
    moderada: { color: 'orange', label: 'Moderada' },
    severa: { color: 'red', label: 'Severa' },
    critica: { color: 'red', label: 'Crítica' }
  };

  const config = severidadConfig[alergia.severidad] || severidadConfig.moderada;

  return (
    <GlassCard className="p-4 border-l-4 border-red-500">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-red-500/10 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-white">{alergia.nombre_alergeno}</h4>
            <span className={`px-2 py-0.5 text-xs rounded-full bg-${config.color}-500/20 text-${config.color}-400`}>
              {config.label}
            </span>
          </div>
          <div className="space-y-1 text-sm text-white/60">
            <p>Tipo: <span className="capitalize">{alergia.tipo_alergia}</span></p>
            {alergia.sintomas && (
              <p>Síntomas: {alergia.sintomas}</p>
            )}
            {alergia.notas && (
              <p className="text-xs mt-2 text-white/50">{alergia.notas}</p>
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

// =====================================================
// TAB: Cirugías
// =====================================================
const CirugiasTab = ({ cirugias, onAddNew, onReload }) => {
  if (cirugias.length === 0) {
    return (
      <EmptyState
        icon={Scissors}
        title="Sin cirugías registradas"
        description="No hay cirugías o procedimientos en el historial de este paciente"
        actionLabel="Registrar Cirugía/Procedimiento"
        onAction={onAddNew}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">
          Cirugías y Procedimientos ({cirugias.length})
        </h3>
        <GlassButton onClick={onAddNew} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Registrar Cirugía
        </GlassButton>
      </div>

      <div className="space-y-3">
        {cirugias.map((cirugia) => (
          <CirugiaCard key={cirugia.id} cirugia={cirugia} />
        ))}
      </div>
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de cirugía
// =====================================================
const CirugiaCard = ({ cirugia }) => {
  const [expanded, setExpanded] = useState(false);

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const resultadoConfig = {
    exitoso: { color: 'green', label: 'Exitoso' },
    complicaciones: { color: 'yellow', label: 'Con Complicaciones' },
    fallido: { color: 'red', label: 'Fallido' }
  };

  const config = resultadoConfig[cirugia.resultado] || resultadoConfig.exitoso;

  return (
    <GlassCard className="overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex gap-3 flex-1">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Scissors className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-white">{cirugia.nombre}</h4>
                <span className={`px-2 py-0.5 text-xs rounded-full bg-${config.color}-500/20 text-${config.color}-400`}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <Calendar className="w-4 h-4" />
                <span>{formatDateTime(cirugia.fecha_realizacion)}</span>
                {cirugia.veterinario && (
                  <>
                    <span>•</span>
                    <span>Dr. {cirugia.veterinario}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-5 h-5 text-white/40" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-white/10"
          >
            <div className="p-4 space-y-3 text-sm">
              {cirugia.duracion_minutos && (
                <p className="text-white/70">
                  <span className="font-semibold">Duración:</span> {cirugia.duracion_minutos} minutos
                </p>
              )}
              {cirugia.anestesia_utilizada && (
                <p className="text-white/70">
                  <span className="font-semibold">Anestesia:</span> {cirugia.anestesia_utilizada}
                </p>
              )}
              {cirugia.descripcion && (
                <p className="text-white/60">{cirugia.descripcion}</p>
              )}
              {cirugia.complicaciones && (
                <div className="p-2 bg-yellow-500/10 rounded border border-yellow-500/20">
                  <p className="text-yellow-400 text-xs font-semibold mb-1">Complicaciones:</p>
                  <p className="text-white/70">{cirugia.complicaciones}</p>
                </div>
              )}
              {cirugia.notas_postoperatorias && (
                <div>
                  <p className="font-semibold text-white/80 mb-1">Notas Postoperatorias:</p>
                  <p className="text-white/60">{cirugia.notas_postoperatorias}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

// =====================================================
// COMPONENTE: Estado vacío
// =====================================================
const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }) => {
  return (
    <GlassCard className="p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="inline-flex p-4 bg-white/5 rounded-2xl mb-4">
          <Icon className="w-12 h-12 text-white/40" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-white/60 mb-6">{description}</p>
        {actionLabel && onAction && (
          <GlassButton onClick={onAction} className="mx-auto">
            {actionLabel}
          </GlassButton>
        )}
      </div>
    </GlassCard>
  );
};

// Importar componente ChevronRight que falta
import { ChevronRight } from 'lucide-react';

export default HistorialClinico;
