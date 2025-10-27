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
  Share2,
  FileSpreadsheet
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
// import ThemeToggle from '../components/ui/ThemeToggle'; // 🔒 Desactivado temporalmente
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
      <Header
        title={patient ? `🐾 ${patient.nombre_mascota}` : 'Historial Clínico'}
        subtitle={patient ? `${patient.nombre_raza} • ${patient.especie} • ${patient.edad} • Propietario: ${patient.nombre_propietario} ${patient.apellidos_propietario}` : 'Cargando información...'}
        actions={[
          {
            icon: ArrowLeft,
            label: 'Volver a Pacientes',
            action: () => navigate('/pacientes'),
            color: 'from-gray-500 to-gray-600',
            className: 'shadow-lg shadow-gray-500/30 hover:shadow-gray-500/50 font-semibold'
          }
        ]}
      />

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-7xl">

        {/* Alerta de alergias */}
        {tieneAlergiasActivas && (
          <div className="bg-red-500/20 border-2 border-red-400/50 rounded-xl px-4 py-3 mb-4 md:mb-6">
            <div className="flex items-center justify-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-semibold text-sm md:text-base">⚠️ ALERTA: {historial.alergias.length} Alergia(s) Activa(s) - Revisar antes de medicar</span>
            </div>
          </div>
        )}

        {/* Barra de herramientas */}
        <GlassCard className="p-3 md:p-4 mb-4 md:mb-6">
          <div className="space-y-3">
            {/* Fila 1: Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {/* Búsqueda */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar en historial..."
                    value={filtros.busqueda}
                    onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 md:pl-10 pr-4 py-2 md:py-2.5 text-sm md:text-base text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50"
                  />
                </div>
              </div>

              {/* Botón filtros */}
              <button
                onClick={() => setFiltrosAbiertos(!filtrosAbiertos)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white border transition-all duration-200 ${
                  filtrosAbiertos
                    ? 'bg-blue-500/30 border-blue-400/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">Filtros</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${filtrosAbiertos ? 'rotate-180' : ''}`} />
              </button>
            </div>

            {/* Fila 2: Cambiar vista - Select estilizado */}
            <div>
              <select
                value={vistaActual}
                onChange={(e) => setVistaActual(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-xl text-white text-sm md:text-base font-semibold appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 1rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '3rem'
                }}
              >
                <option value="timeline" className="bg-gray-900 text-white py-3">
                  🕐 Timeline
                </option>
                <option value="categorias" className="bg-gray-900 text-white py-3">
                  📋 Categorías
                </option>
                <option value="graficas" className="bg-gray-900 text-white py-3">
                  📈 Gráficas
                </option>
                <option value="comparador" className="bg-gray-900 text-white py-3">
                  📊 Comparar
                </option>
                <option value="notificaciones" className="bg-gray-900 text-white py-3">
                  🔔 Avisos
                </option>
                <option value="analytics" className="bg-gray-900 text-white py-3">
                  ⚡ Analytics
                </option>
              </select>
            </div>

            {/* Fila 3: Acciones de exportación y Theme Toggle */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-red-500/20 border border-red-400/30 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-200"
              >
                <Download className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">PDF</span>
              </button>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-green-500/20 border border-green-400/30 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-200"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Excel</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-purple-500/20 border border-purple-400/30 hover:bg-purple-500/30 hover:border-purple-400/50 transition-all duration-200"
              >
                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Imprimir</span>
              </button>

              <button
                onClick={() => setMostrarCompartir(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs md:text-sm font-medium text-white bg-blue-500/20 border border-blue-400/30 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200"
              >
                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Compartir</span>
              </button>

              {/* Theme Toggle - 🔒 Desactivado temporalmente */}
              {/* <div className="ml-auto">
                <ThemeToggle />
              </div> */}
            </div>
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
                <div className="border-t border-white/10 mt-3 pt-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {/* Tipo */}
                    <div>
                      <label className="text-white/70 text-xs md:text-sm mb-1.5 block">Tipo</label>
                      <select
                        value={filtros.tipo}
                        onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50"
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
                      <label className="text-white/70 text-xs md:text-sm mb-1.5 block">Desde</label>
                      <input
                        type="date"
                        value={filtros.fechaDesde}
                        onChange={(e) => setFiltros({ ...filtros, fechaDesde: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50"
                      />
                    </div>

                    {/* Fecha hasta */}
                    <div>
                      <label className="text-white/70 text-xs md:text-sm mb-1.5 block">Hasta</label>
                      <input
                        type="date"
                        value={filtros.fechaHasta}
                        onChange={(e) => setFiltros({ ...filtros, fechaHasta: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50"
                      />
                    </div>

                    {/* Ordenar */}
                    <div>
                      <label className="text-white/70 text-xs md:text-sm mb-1.5 block">Ordenar por</label>
                      <select
                        value={filtros.ordenPor}
                        onChange={(e) => setFiltros({ ...filtros, ordenPor: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/50"
                      >
                        <option value="fecha_desc">Más recientes primero</option>
                        <option value="fecha_asc">Más antiguos primero</option>
                      </select>
                    </div>
                  </div>

                  {/* Botón limpiar filtros */}
                  <div className="mt-3 flex justify-center sm:justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs md:text-sm"
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

export default HistorialClinicoPage;
