/**
 * =====================================================
 * PÁGINA DE HISTORIAL CLÍNICO COMPLETO
 * =====================================================
 * Vista completa del historial médico con:
 * - Timeline cronológica unificada
 * - Filtros avanzados
 * - Búsqueda
 * - Paginación
 * - Exportar/Imprimir
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Syringe,
  Bug,
  AlertTriangle,
  Scissors,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  Activity,
  Clock,
  ChevronDown,
  X,
  Loader,
  TrendingUp,
  BarChart3,
  Bell,
  Zap,
  Share2
} from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';
import GlassInput from '../components/ui/GlassInput';
import HistorialClinico from '../components/patients/HistorialClinico';
import { historialService } from '../services/historialService';
import { patientService } from '../services/patientService';
import toast from 'react-hot-toast';
import { exportarHistorialPDF } from '../utils/pdfExport';
import { exportarHistorialExcel, exportarTimelineExcel } from '../utils/excelExport';
import GraficasEvolucion from '../components/patients/GraficasEvolucion';
import ComparadorPeriodos from '../components/patients/ComparadorPeriodos';
import NotificacionesPaciente from '../components/patients/NotificacionesPaciente';
import DashboardAnalytics from '../components/patients/DashboardAnalytics';
import TimelineZoomable from '../components/patients/TimelineZoomable';
import CompartirHistorial from '../components/patients/CompartirHistorial';
import ThemeToggle from '../components/ui/ThemeToggle';
import { useReactToPrint } from 'react-to-print';
import { useRef } from 'react';

const HistorialClinicoPage = () => {
  const { pacienteId } = useParams();
  const navigate = useNavigate();
  const printRef = useRef();

  const [patient, setPatient] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de vista
  const [vistaActual, setVistaActual] = useState('timeline'); // 'timeline', 'categorias', 'graficas', 'comparador', 'notificaciones', 'analytics'

  // Estados de filtros
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: 'todos', // 'todos', 'consultas', 'vacunas', 'desparasitaciones', 'alergias', 'cirugias'
    fechaDesde: '',
    fechaHasta: '',
    ordenPor: 'fecha_desc' // 'fecha_desc', 'fecha_asc'
  });

  // Estado de timeline
  const [timelineItems, setTimelineItems] = useState([]);
  const [itemsFiltrados, setItemsFiltrados] = useState([]);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const ITEMS_POR_PAGINA = 20;

  // Estado para modal de compartir
  const [mostrarCompartir, setMostrarCompartir] = useState(false);

  useEffect(() => {
    if (pacienteId) {
      cargarDatos();
    }
  }, [pacienteId]);

  useEffect(() => {
    if (historial) {
      construirTimeline();
    }
  }, [historial]);

  useEffect(() => {
    filtrarItems();
  }, [timelineItems, filtros]);

  /**
   * 📥 Cargar datos del paciente e historial
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar paciente e historial en paralelo
      const [patientResponse, historialResponse] = await Promise.all([
        patientService.getById(pacienteId),
        historialService.getHistorialCompleto(pacienteId)
      ]);

      if (patientResponse.success) {
        setPatient(patientResponse.data);
      }

      if (historialResponse.success) {
        setHistorial(historialResponse.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      toast.error('Error al cargar el historial clínico');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🕒 Construir timeline unificado
   * Combina todas las entradas y las ordena cronológicamente
   */
  const construirTimeline = () => {
    const items = [];

    // Agregar consultas
    historial.consultas?.forEach(consulta => {
      items.push({
        tipo: 'consulta',
        icono: FileText,
        color: 'blue',
        fecha: new Date(consulta.fecha_consulta),
        titulo: consulta.motivo_consulta,
        subtitulo: `Dr. ${consulta.veterinario}`,
        data: consulta
      });
    });

    // Agregar vacunas
    historial.vacunas?.forEach(vacuna => {
      items.push({
        tipo: 'vacuna',
        icono: Syringe,
        color: 'green',
        fecha: new Date(vacuna.fecha_aplicacion),
        titulo: `Vacuna: ${vacuna.tipo_vacuna}`,
        subtitulo: vacuna.lote_vacuna ? `Lote: ${vacuna.lote_vacuna}` : '',
        data: vacuna
      });
    });

    // Agregar desparasitaciones
    historial.desparasitaciones?.forEach(desp => {
      items.push({
        tipo: 'desparasitacion',
        icono: Bug,
        color: 'purple',
        fecha: new Date(desp.fecha_aplicacion),
        titulo: `Desparasitación: ${desp.producto}`,
        subtitulo: `Dosis: ${desp.dosis}`,
        data: desp
      });
    });

    // Agregar alergias
    historial.alergias?.forEach(alergia => {
      items.push({
        tipo: 'alergia',
        icono: AlertTriangle,
        color: 'red',
        fecha: alergia.fecha_deteccion ? new Date(alergia.fecha_deteccion) : new Date(alergia.created_at),
        titulo: `Alergia: ${alergia.nombre_alergeno}`,
        subtitulo: `Severidad: ${alergia.severidad}`,
        data: alergia
      });
    });

    // Agregar cirugías
    historial.cirugias?.forEach(cirugia => {
      items.push({
        tipo: 'cirugia',
        icono: Scissors,
        color: 'indigo',
        fecha: new Date(cirugia.fecha_realizacion),
        titulo: cirugia.nombre,
        subtitulo: `Dr. ${cirugia.veterinario} - ${cirugia.resultado}`,
        data: cirugia
      });
    });

    // Ordenar por fecha (más reciente primero)
    items.sort((a, b) => b.fecha - a.fecha);

    setTimelineItems(items);
  };

  /**
   * 🔍 Filtrar items del timeline
   */
  const filtrarItems = () => {
    let items = [...timelineItems];

    // Filtro por tipo
    if (filtros.tipo !== 'todos') {
      items = items.filter(item => item.tipo === filtros.tipo);
    }

    // Filtro por búsqueda
    if (filtros.busqueda.trim()) {
      const busqueda = filtros.busqueda.toLowerCase();
      items = items.filter(item =>
        item.titulo.toLowerCase().includes(busqueda) ||
        item.subtitulo?.toLowerCase().includes(busqueda)
      );
    }

    // Filtro por rango de fechas
    if (filtros.fechaDesde) {
      const desde = new Date(filtros.fechaDesde);
      items = items.filter(item => item.fecha >= desde);
    }

    if (filtros.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta);
      hasta.setHours(23, 59, 59, 999); // Fin del día
      items = items.filter(item => item.fecha <= hasta);
    }

    // Ordenar
    if (filtros.ordenPor === 'fecha_asc') {
      items.sort((a, b) => a.fecha - b.fecha);
    } else {
      items.sort((a, b) => b.fecha - a.fecha);
    }

    setItemsFiltrados(items);
    setPaginaActual(1); // Reset a primera página cuando cambian filtros
  };

  /**
   * 📄 Paginación
   */
  const indexUltimo = paginaActual * ITEMS_POR_PAGINA;
  const indexPrimero = indexUltimo - ITEMS_POR_PAGINA;
  const itemsPaginados = itemsFiltrados.slice(indexPrimero, indexUltimo);
  const totalPaginas = Math.ceil(itemsFiltrados.length / ITEMS_POR_PAGINA);

  /**
   * 🎨 Limpiar filtros
   */
  const limpiarFiltros = () => {
    setFiltros({
      busqueda: '',
      tipo: 'todos',
      fechaDesde: '',
      fechaHasta: '',
      ordenPor: 'fecha_desc'
    });
  };

  /**
   * 📄 Exportar a PDF
   */
  const handleExportPDF = () => {
    try {
      if (!patient || !historial) {
        toast.error('No hay datos para exportar');
        return;
      }

      toast.loading('Generando PDF...');
      exportarHistorialPDF(patient, historial, timelineItems);
      toast.dismiss();
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error al generar PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  /**
   * 📊 Exportar a Excel
   */
  const handleExportExcel = () => {
    try {
      if (!patient || !historial) {
        toast.error('No hay datos para exportar');
        return;
      }

      if (vistaActual === 'timeline') {
        exportarTimelineExcel(patient, timelineItems);
      } else {
        exportarHistorialExcel(patient, historial);
      }

      toast.success('Excel generado exitosamente');
    } catch (error) {
      console.error('Error al generar Excel:', error);
      toast.error('Error al generar el archivo Excel');
    }
  };

  /**
   * 🖨️ Imprimir
   */
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Historial_${patient?.nombre_mascota || 'Paciente'}`,
    onAfterPrint: () => toast.success('Listo para imprimir')
  });

  const tieneAlergiasActivas = historial?.alergias?.length > 0;

  if (loading) {
    return (
      <AppLayout>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-12 h-12 text-blue-400 animate-spin" />
        </div>
        <MobileNavigation />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Breadcrumb y botón volver */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/pacientes')}
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver a Pacientes</span>
          </button>
        </div>

        {/* Header del paciente */}
        {patient && (
          <GlassCard className="p-6 mb-6">
            <div className="flex items-center gap-4">
              {patient.foto_url ? (
                <img
                  src={patient.foto_url}
                  alt={patient.nombre_mascota}
                  className="w-20 h-20 rounded-full object-cover border-2 border-white/20"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center text-3xl">
                  🐾
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-1">
                  {patient.nombre_mascota}
                </h1>
                <p className="text-white/70">
                  {patient.nombre_raza} • {patient.especie} • {patient.edad}
                </p>
                <p className="text-white/60 text-sm mt-1">
                  Propietario: {patient.nombre_propietario} {patient.apellidos_propietario}
                </p>
              </div>

              {/* Alerta de alergias */}
              {tieneAlergiasActivas && (
                <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-semibold">{historial.alergias.length} Alergia(s) Activa(s)</span>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
        )}

        {/* Barra de herramientas */}
        <GlassCard className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  placeholder="Buscar en historial..."
                  value={filtros.busqueda}
                  onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50"
                />
              </div>
            </div>

            {/* Botón filtros */}
            <GlassButton
              onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
              className={`flex items-center gap-2 ${filtrosAbiertos ? 'bg-blue-500/20' : ''}`}
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${filtrosAbiertos ? 'rotate-180' : ''}`} />
            </GlassButton>

            {/* Cambiar vista */}
            <div className="flex gap-2 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setVistaActual('timeline')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'timeline'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Timeline
              </button>
              <button
                onClick={() => setVistaActual('categorias')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'categorias'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4 inline mr-1" />
                Categorías
              </button>
              <button
                onClick={() => setVistaActual('graficas')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'graficas'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <TrendingUp className="w-4 h-4 inline mr-1" />
                Gráficas
              </button>
              <button
                onClick={() => setVistaActual('comparador')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'comparador'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <BarChart3 className="w-4 h-4 inline mr-1" />
                Comparar
              </button>
              <button
                onClick={() => setVistaActual('notificaciones')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'notificaciones'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4 inline mr-1" />
                Avisos
              </button>
              <button
                onClick={() => setVistaActual('analytics')}
                className={`px-3 py-2 rounded-lg transition-all text-sm ${
                  vistaActual === 'analytics'
                    ? 'bg-blue-500/30 text-white'
                    : 'text-white/60 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-1" />
                Analytics
              </button>
            </div>

            {/* Acciones de exportación */}
            <GlassButton onClick={handleExportPDF} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              PDF
            </GlassButton>

            <GlassButton onClick={handleExportExcel} className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Excel
            </GlassButton>

            <GlassButton onClick={handlePrint} className="flex items-center gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </GlassButton>

            <GlassButton
              onClick={() => setMostrarCompartir(true)}
              className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 border-green-400/30 text-green-400"
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </GlassButton>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>

          {/* Panel de filtros expandible */}
          <AnimatePresence>
            {filtrosAbiertos && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/10 mt-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Tipo */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Tipo</label>
                      <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
                      >
                        <option value="todos">Todos</option>
                        <option value="consulta">Consultas</option>
                        <option value="vacuna">Vacunas</option>
                        <option value="desparasitacion">Desparasitaciones</option>
                        <option value="alergia">Alergias</option>
                        <option value="cirugia">Cirugías</option>
                      </select>
                    </div>

                    {/* Fecha desde */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Desde</label>
                      <input
                        type="date"
                        value={filtros.fechaDesde}
                        onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Hasta</label>
                      <input
                        type="date"
                        value={filtros.fechaHasta}
                        onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
                      />
                    </div>

                    {/* Ordenar */}
                    <div>
                      <label className="text-white/70 text-sm mb-2 block">Ordenar por</label>
                      <select
                        value={filtros.ordenPor}
                        onChange={(e) => setFiltros({ ...filtros, ordenPor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
                      >
                        <option value="fecha_desc">Más recientes primero</option>
                        <option value="fecha_asc">Más antiguos primero</option>
                      </select>
                    </div>
                  </div>

                  {/* Botón limpiar filtros */}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        {/* Contenido principal */}
        <div ref={printRef}>
          <AnimatePresence mode="wait">
            {vistaActual === 'timeline' ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TimelineZoomable
                  items={itemsPaginados}
                  total={itemsFiltrados.length}
                  paginaActual={paginaActual}
                  totalPaginas={totalPaginas}
                  onCambiarPagina={setPaginaActual}
                />
              </motion.div>
            ) : vistaActual === 'categorias' ? (
              <motion.div
                key="categorias"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {patient && (
                  <HistorialClinico
                    pacienteId={pacienteId}
                    nombreMascota={patient.nombre_mascota}
                    resumeMode={false}
                  />
                )}
              </motion.div>
            ) : vistaActual === 'graficas' ? (
              <motion.div
                key="graficas"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {historial && (
                  <GraficasEvolucion consultas={historial.consultas || []} />
                )}
              </motion.div>
            ) : vistaActual === 'comparador' ? (
              <motion.div
                key="comparador"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {historial && (
                  <ComparadorPeriodos historial={historial} />
                )}
              </motion.div>
            ) : vistaActual === 'notificaciones' ? (
              <motion.div
                key="notificaciones"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {patient && historial && (
                  <NotificacionesPaciente paciente={patient} historial={historial} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="analytics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {patient && historial && (
                  <DashboardAnalytics paciente={patient} historial={historial} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <MobileNavigation />

      {/* Modal de compartir */}
      {mostrarCompartir && patient && historial && (
        <CompartirHistorial
          paciente={patient}
          historial={historial}
          onClose={() => setMostrarCompartir(false)}
        />
      )}
    </AppLayout>
  );
};

// =====================================================
// COMPONENTE: Vista Timeline
// =====================================================
const TimelineView = ({ items, total, paginaActual, totalPaginas, onCambiarPagina }) => {
  if (items.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">
          No se encontraron registros
        </h3>
        <p className="text-white/60">
          Intenta ajustar los filtros de búsqueda
        </p>
      </GlassCard>
    );
  }

  const colorClasses = {
    blue: 'bg-blue-500/20 border-blue-400/30 text-blue-400',
    green: 'bg-green-500/20 border-green-400/30 text-green-400',
    purple: 'bg-purple-500/20 border-purple-400/30 text-purple-400',
    red: 'bg-red-500/20 border-red-400/30 text-red-400',
    indigo: 'bg-indigo-500/20 border-indigo-400/30 text-indigo-400'
  };

  return (
    <div className="space-y-6">
      {/* Info */}
      <div className="flex items-center justify-between">
        <p className="text-white/60">
          Mostrando {items.length} de {total} registros
        </p>
        <p className="text-white/60 text-sm">
          Página {paginaActual} de {totalPaginas}
        </p>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />

        {/* Items */}
        <div className="space-y-6">
          {items.map((item, index) => {
            const Icon = item.icono;
            const colorClass = colorClasses[item.color] || colorClasses.blue;

            return (
              <motion.div
                key={`${item.tipo}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative pl-16"
              >
                {/* Icono */}
                <div className={`absolute left-0 w-12 h-12 rounded-xl border-2 ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>

                {/* Contenido */}
                <GlassCard className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {item.titulo}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                          {item.tipo}
                        </span>
                      </div>
                      {item.subtitulo && (
                        <p className="text-white/60 mb-3">{item.subtitulo}</p>
                      )}
                      <div className="flex items-center gap-2 text-white/50 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {item.fecha.toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <GlassButton
            onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))}
            disabled={paginaActual === 1}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </GlassButton>

          <div className="flex gap-2">
            {[...Array(totalPaginas)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onCambiarPagina(i + 1)}
                className={`px-4 py-2 rounded-xl transition-all ${
                  paginaActual === i + 1
                    ? 'bg-blue-500/30 text-white border border-blue-400/50'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <GlassButton
            onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))}
            disabled={paginaActual === totalPaginas}
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </GlassButton>
        </div>
      )}
    </div>
  );
};

export default HistorialClinicoPage;
