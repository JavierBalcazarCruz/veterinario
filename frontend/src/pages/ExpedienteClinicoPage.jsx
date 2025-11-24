/**
 * =====================================================
 * PÁGINA DE CAPTURA DE EXPEDIENTE CLÍNICO - MEJORADA
 * =====================================================
 * - Animación zoom in smooth al entrar
 * - Botón de selección de paciente en header
 * - Examen físico con cards colapsables (responsive)
 * - Flujo completo: nuevo paciente o registrado
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  FileText,
  Activity,
  AlertCircle,
  FlaskConical,
  Stethoscope,
  Pill,
  ChevronDown,
  User,
  CheckCircle2,
  PawPrint,
  Thermometer,
  Utensils,
  Heart,
  Wind,
  Pizza,
  Droplet,
  Baby,
  Footprints,
  Brain,
  Eye
} from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Componentes nuevos
import ModalSeleccionPaciente from '../components/expediente/ModalSeleccionPaciente';
import ExamenFisicoCard from '../components/expediente/ExamenFisicoCard';
import AddPatientModal from '../components/patients/AddPatientModal';
import PatientSpotlight from '../components/dashboard/PatientSpotlight';
import { patientService } from '../services/patientService';

const ExpedienteClinicoPage = () => {
  const { pacienteId: pacienteIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Estados principales
  const [pacienteId, setPacienteId] = useState(pacienteIdParam || null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de modales
  const [modalSeleccionOpen, setModalSeleccionOpen] = useState(false);
  const [modalNuevoPacienteOpen, setModalNuevoPacienteOpen] = useState(false);
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  // Estados de las secciones colapsables
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({
    estudiosLab: false,
    listaMaestra: false,
    diagnosticoFinal: false,
    diagnosticoLab: false,
    tratamiento: false
  });

  // Estado del formulario
  const [formulario, setFormulario] = useState({
    // Examen Físico General
    examenFisico: {
      temperatura: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      alimentacion: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      piel: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      mucosas: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      linfonodos: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      cardiovascular: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      respiratorio: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      digestivo: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      urinario: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      reproductor: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      locomotor: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      nervioso: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' },
      ojosOido: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '', normal: 'N' }
    },
    listaProblemas: ['', '', '', '', ''],
    estudiosLaboratorio: '',
    listaMaestra: ['', '', '', '', ''],
    diagnosticoFinal: '',
    diagnosticoLaboratorio: ['', '', '', '', ''],
    tratamiento: ['', '', '', '', '']
  });

  // Sincronizar pacienteId del estado con el parámetro de la URL
  useEffect(() => {
    if (pacienteIdParam !== pacienteId) {
      setPacienteId(pacienteIdParam || null);
    }
  }, [pacienteIdParam]);

  // Cargar datos cuando cambia el pacienteId
  useEffect(() => {
    if (pacienteId) {
      cargarDatos();
    } else {
      setLoading(false);
    }
  }, [pacienteId]);

  /**
   * 📥 Cargar datos del paciente
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Verificar si vienen datos del state (desde el spotlight)
      if (location.state?.paciente) {
        console.log('✅ Usando datos del paciente desde state:', location.state.paciente);
        setPaciente(location.state.paciente);
        setLoading(false);
        return;
      }

      // Si no hay datos en el state, cargar desde la API
      console.log('📡 Cargando datos del paciente desde API...');
      const response = await patientService.getById(pacienteId);

      if (response.success) {
        console.log('✅ Paciente cargado desde API:', response.data);
        setPaciente(response.data);
      } else {
        toast.error('No se pudo cargar los datos del paciente');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error al cargar paciente:', error);
      toast.error('Error al cargar los datos del paciente');
      setLoading(false);
    }
  };

  /**
   * 🔄 Manejar selección de paciente nuevo
   */
  const handlePacienteNuevo = () => {
    console.log('🆕 Abriendo modal de paciente nuevo');
    setModalSeleccionOpen(false);
    setModalNuevoPacienteOpen(true);
  };

  /**
   * 🔄 Manejar selección de paciente registrado
   */
  const handlePacienteRegistrado = () => {
    console.log('🔍 Abriendo spotlight de búsqueda');
    setModalSeleccionOpen(false);
    setSpotlightOpen(true);
  };

  /**
   * ✅ Callback cuando se guarda un paciente nuevo
   */
  const handleNuevoPacienteGuardado = (nuevoPaciente) => {
    setPacienteId(nuevoPaciente.id);
    setPaciente(nuevoPaciente);

    // Actualizar URL
    window.history.pushState({}, '', `/expediente/${nuevoPaciente.id}`);

    toast.success(`✅ ${nuevoPaciente.nombre_mascota} registrada - Puedes continuar llenando el expediente`);
    setModalNuevoPacienteOpen(false);
  };

  /**
   * 🔄 Alternar visibilidad de sección
   */
  const toggleSeccion = (seccion) => {
    setSeccionesAbiertas(prev => ({
      ...prev,
      [seccion]: !prev[seccion]
    }));
  };

  /**
   * ✏️ Actualizar campo del examen físico
   */
  const actualizarExamenFisico = (sistema, campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      examenFisico: {
        ...prev.examenFisico,
        [sistema]: {
          ...prev.examenFisico[sistema],
          [campo]: valor
        }
      }
    }));
  };

  /**
   * ✏️ Actualizar item de lista
   */
  const actualizarListaItem = (lista, index, valor) => {
    setFormulario(prev => ({
      ...prev,
      [lista]: prev[lista].map((item, i) => i === index ? valor : item)
    }));
  };

  /**
   * 💾 Guardar expediente
   */
  const guardarExpediente = async () => {
    if (!pacienteId) {
      toast.error('Debes seleccionar un paciente primero');
      return;
    }

    try {
      toast.loading('Guardando expediente...');

      // TODO: Implementar llamada a API
      // const response = await expedienteService.guardar(pacienteId, formulario);

      // DUMMY: Simular guardado
      setTimeout(() => {
        toast.dismiss();
        toast.success('¡Expediente guardado exitosamente!');
      }, 1000);
    } catch (error) {
      console.error('Error al guardar expediente:', error);
      toast.error('Error al guardar el expediente');
    }
  };

  // Definir sistemas del examen físico con iconos
  const sistemasExamen = [
    { key: 'temperatura', label: 'I. Temperatura', icon: Thermometer, color: 'red' },
    { key: 'alimentacion', label: 'Come/Bebe/Orina/Defeca', icon: Utensils, color: 'orange' },
    { key: 'piel', label: 'II - Piel', icon: Activity, color: 'pink' },
    { key: 'mucosas', label: 'III - Mucosas', icon: AlertCircle, color: 'purple' },
    { key: 'linfonodos', label: 'IV - Linfonodos', icon: Activity, color: 'blue' },
    { key: 'cardiovascular', label: 'V - Cardiovascular', icon: Heart, color: 'red' },
    { key: 'respiratorio', label: 'VI - Respiratorio', icon: Wind, color: 'cyan' },
    { key: 'digestivo', label: 'VII - Digestivo', icon: Pizza, color: 'orange' },
    { key: 'urinario', label: 'VIII - Urinario', icon: Droplet, color: 'blue' },
    { key: 'reproductor', label: 'IX - Reproductor', icon: Baby, color: 'pink' },
    { key: 'locomotor', label: 'X - Locomotor', icon: Footprints, color: 'green' },
    { key: 'nervioso', label: 'XI - Nervioso', icon: Brain, color: 'purple' },
    { key: 'ojosOido', label: 'XII - Ojos y Oído', icon: Eye, color: 'cyan' }
  ];

  if (loading) {
    return (
      <AppLayout>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <MobileNavigation />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header
        title={`📋 Expediente Clínico${paciente ? ` - ${paciente.nombre_mascota}` : ''}`}
        subtitle={paciente ? `${paciente.especie} • ${paciente.raza} • ${paciente.edad} • Propietario: ${paciente.nombre_propietario}` : 'Selecciona un paciente para comenzar'}
        actions={[
          {
            icon: ArrowLeft,
            label: 'Volver',
            action: () => navigate(-1),
            color: 'from-gray-500 to-gray-600'
          },
          {
            icon: PawPrint,
            label: 'Seleccionar Paciente',
            action: () => {
              console.log('🐾 Click en botón Seleccionar Paciente del header');
              setModalSeleccionOpen(true);
            },
            color: 'from-orange-500 to-orange-600'
          },
          {
            icon: Save,
            label: 'Guardar',
            action: guardarExpediente,
            color: 'from-green-500 to-green-600'
          }
        ]}
      />

      {/* Animación de entrada smooth */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-7xl pb-24 md:pb-8"
      >
        {/* Mensaje si no hay paciente seleccionado */}
        {!pacienteId && (
          <GlassCard className="p-8 md:p-12 text-center mb-6">
            <PawPrint className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">
              Selecciona un Paciente
            </h2>
            <p className="text-white/60 mb-6">
              Para comenzar a llenar el expediente clínico, primero debes seleccionar una mascota
            </p>
            <button
              onClick={() => {
                console.log('🎯 Click en botón central Seleccionar Paciente');
                setModalSeleccionOpen(true);
              }}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
            >
              Seleccionar Paciente
            </button>
          </GlassCard>
        )}

        {/* Contenido del expediente (solo si hay paciente) */}
        {pacienteId && (
          <>
            {/* Información del Veterinario */}
            <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-3 text-white">
                <User className="w-5 h-5 text-orange-400" />
                <div>
                  <p className="font-semibold">MVZ {user?.nombre} {user?.apellidos}</p>
                  <p className="text-sm text-white/70">DGP: {user?.cedula || '10356233'}</p>
                </div>
              </div>
            </GlassCard>

            {/* SECCIÓN 1: EXAMEN FÍSICO GENERAL - CARDS COLAPSABLES */}
            <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl md:text-2xl font-bold text-white">EXAMEN FÍSICO GENERAL</h2>
              </div>

              <div className="space-y-3">
                {sistemasExamen.map((sistema, index) => (
                  <ExamenFisicoCard
                    key={sistema.key}
                    titulo={sistema.label}
                    icono={sistema.icon}
                    color={sistema.color}
                    datos={formulario.examenFisico[sistema.key]}
                    onChange={(campo, valor) => actualizarExamenFisico(sistema.key, campo, valor)}
                    defaultOpen={index === 0} // Solo el primero abierto por defecto
                  />
                ))}
              </div>
            </GlassCard>

            {/* SECCIÓN 2: LISTA DE PROBLEMAS */}
            <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h2 className="text-xl md:text-2xl font-bold text-white">LISTA DE PROBLEMAS</h2>
              </div>

              <div className="space-y-3">
                {formulario.listaProblemas.map((problema, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-white/70 font-semibold min-w-[30px]">{index + 1}.</span>
                    <input
                      type="text"
                      value={problema}
                      onChange={(e) => actualizarListaItem('listaProblemas', index, e.target.value)}
                      placeholder={`Problema ${index + 1}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-400/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* SECCIONES COLAPSABLES */}

            {/* SECCIÓN 3: ESTUDIOS DE LABORATORIO */}
            <SeccionColapsable
              titulo="ESTUDIOS DE LABORATORIO"
              icono={FlaskConical}
              color="text-purple-400"
              abierta={seccionesAbiertas.estudiosLab}
              onToggle={() => toggleSeccion('estudiosLab')}
            >
              <textarea
                value={formulario.estudiosLaboratorio}
                onChange={(e) => setFormulario(prev => ({ ...prev, estudiosLaboratorio: e.target.value }))}
                placeholder="Ingrese los estudios de laboratorio solicitados o resultados..."
                rows={6}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
              />
            </SeccionColapsable>

            {/* SECCIÓN 4: LISTA MAESTRA */}
            <SeccionColapsable
              titulo="LISTA MAESTRA (Dx Presuntivos)"
              icono={Stethoscope}
              color="text-cyan-400"
              abierta={seccionesAbiertas.listaMaestra}
              onToggle={() => toggleSeccion('listaMaestra')}
            >
              <div className="space-y-3">
                {formulario.listaMaestra.map((dx, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-white/70 font-semibold min-w-[30px]">{index + 1}.</span>
                    <input
                      type="text"
                      value={dx}
                      onChange={(e) => actualizarListaItem('listaMaestra', index, e.target.value)}
                      placeholder={`Diagnóstico presuntivo ${index + 1}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </SeccionColapsable>

            {/* SECCIÓN 5: DIAGNÓSTICO FINAL */}
            <SeccionColapsable
              titulo="DIAGNÓSTICO FINAL"
              icono={CheckCircle2}
              color="text-green-400"
              abierta={seccionesAbiertas.diagnosticoFinal}
              onToggle={() => toggleSeccion('diagnosticoFinal')}
            >
              <textarea
                value={formulario.diagnosticoFinal}
                onChange={(e) => setFormulario(prev => ({ ...prev, diagnosticoFinal: e.target.value }))}
                placeholder="Ingrese el diagnóstico final del paciente..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-400/50 transition-colors resize-none"
              />
            </SeccionColapsable>

            {/* SECCIÓN 6: DIAGNÓSTICO DE LABORATORIO */}
            <SeccionColapsable
              titulo="DIAGNÓSTICO DE LABORATORIO"
              icono={FlaskConical}
              color="text-pink-400"
              abierta={seccionesAbiertas.diagnosticoLab}
              onToggle={() => toggleSeccion('diagnosticoLab')}
            >
              <div className="space-y-3">
                {formulario.diagnosticoLaboratorio.map((dx, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-white/70 font-semibold min-w-[30px]">{index + 1}.</span>
                    <input
                      type="text"
                      value={dx}
                      onChange={(e) => actualizarListaItem('diagnosticoLaboratorio', index, e.target.value)}
                      placeholder={`Diagnóstico de laboratorio ${index + 1}`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-pink-400/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </SeccionColapsable>

            {/* SECCIÓN 7: TRATAMIENTO */}
            <SeccionColapsable
              titulo="TRATAMIENTO EN INSTALACIONES Y RECETA (dosis y ml)"
              icono={Pill}
              color="text-yellow-400"
              abierta={seccionesAbiertas.tratamiento}
              onToggle={() => toggleSeccion('tratamiento')}
            >
              <div className="space-y-3">
                {formulario.tratamiento.map((tx, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-white/70 font-semibold min-w-[30px]">{index + 1}.</span>
                    <input
                      type="text"
                      value={tx}
                      onChange={(e) => actualizarListaItem('tratamiento', index, e.target.value)}
                      placeholder={`Medicamento, dosis y ml - Ej: Amoxicilina 500mg, 5ml cada 12h`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </SeccionColapsable>

            {/* Botón flotante de guardar (móvil) */}
            <div className="fixed bottom-20 right-4 md:hidden z-50">
              <motion.button
                onClick={guardarExpediente}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-xl flex items-center justify-center text-white"
              >
                <Save size={24} />
              </motion.button>
            </div>
          </>
        )}
      </motion.div>

      <MobileNavigation />

      {/* Modales */}
      <ModalSeleccionPaciente
        isOpen={modalSeleccionOpen}
        onClose={() => setModalSeleccionOpen(false)}
        onSelectNuevo={handlePacienteNuevo}
        onSelectRegistrado={handlePacienteRegistrado}
      />

      <AddPatientModal
        isOpen={modalNuevoPacienteOpen}
        onClose={() => setModalNuevoPacienteOpen(false)}
        onSuccess={handleNuevoPacienteGuardado}
      />

      <PatientSpotlight
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        redirectTo="expediente"
      />
    </AppLayout>
  );
};

/**
 * 📦 Componente: Sección Colapsable
 */
const SeccionColapsable = ({ titulo, icono: Icono, color, abierta, onToggle, children }) => {
  return (
    <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <Icono className={`w-6 h-6 ${color}`} />
          <h2 className="text-xl md:text-2xl font-bold text-white group-hover:text-orange-400 transition-colors">
            {titulo}
          </h2>
        </div>
        <motion.div
          animate={{ rotate: abierta ? 180 : 0 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <ChevronDown className="w-6 h-6 text-white/70" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {abierta && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 2000 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="overflow-hidden"
          >
            <div className="mt-6">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};

export default ExpedienteClinicoPage;
