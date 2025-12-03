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


  // Estado del formulario
  const [formulario, setFormulario] = useState({
    // Examen Físico General
    examenFisico: {
      temperatura: { dh: '', fc: '', cc: '', fr: '', tllc: '', rt: '', rd: '', ps_pd: '', pam: '' },
      segundaCard: {
        come: '', come_normal: 'N',
        bebe: '', bebe_normal: 'N',
        orina: '', orina_normal: 'N',
        defeca: '', defeca_normal: 'N',
        piel: '', piel_normal: 'N',
        mucosas: '', mucosas_normal: 'N',
        linfonodos: '', linfonodos_normal: 'N',
        circulatorio: '', circulatorio_normal: 'N',
        respiratorio: '', respiratorio_normal: 'N',
        digestivo: '', digestivo_normal: 'N',
        urinario: '', urinario_normal: 'N',
        reproductor: '', reproductor_normal: 'N',
        locomotor: '', locomotor_normal: 'N',
        nervioso: '', nervioso_normal: 'N',
        ojosOido: '', ojosOido_normal: 'N'
      }
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

  // Campos para la segunda card con botones individuales
  const camposSegundaCard = [
    { key: 'come', label: 'Come', placeholder: 'Estado' },
    { key: 'bebe', label: 'Bebe', placeholder: 'Estado' },
    { key: 'orina', label: 'Orina', placeholder: 'Estado' },
    { key: 'defeca', label: 'Defeca', placeholder: 'Estado' },
    { key: 'piel', label: 'Piel', placeholder: 'Estado' },
    { key: 'mucosas', label: 'Mucosas', placeholder: 'Estado' },
    { key: 'linfonodos', label: 'Linfonodos', placeholder: 'Estado' },
    { key: 'circulatorio', label: 'Circulatorio', placeholder: 'Estado' },
    { key: 'respiratorio', label: 'Respiratorio', placeholder: 'Estado' },
    { key: 'digestivo', label: 'Digestivo', placeholder: 'Estado' },
    { key: 'urinario', label: 'Urinario', placeholder: 'Estado' },
    { key: 'reproductor', label: 'Reproductor', placeholder: 'Estado' },
    { key: 'locomotor', label: 'Locomotor', placeholder: 'Estado' },
    { key: 'nervioso', label: 'Nervioso', placeholder: 'Estado' },
    { key: 'ojosOido', label: 'Ojos y Oído', placeholder: 'Estado' }
  ];

  // Definir sistemas del examen físico con iconos
  const sistemasExamen = [
    {
      key: 'temperatura',
      label: '', // Sin título
      icon: null, // Sin icono
      color: 'red',
      hideNormalToggle: true, // Sin botones para Temperatura
      leyendaSuperior: 'Complete los signos vitales y parámetros físicos del paciente. DH: Deshidratación, FC: Frecuencia Cardiaca, CC: Condición Corporal, FR: Frecuencia Respiratoria, TLLC: Tiempo de Llenado Capilar, RT: Reflejo Tusígeno, RD: Respuesta al Dolor, PS/PD: Presión Sistólica/Diastólica, PAM: Presión Arterial Media.'
    },
    {
      key: 'segundaCard',
      label: '', // Sin título
      icon: null,
      color: 'blue',
      customCampos: camposSegundaCard,
      conBotonesIndividuales: true, // Cada campo con su botón
      leyendaSuperior: 'Evalúe cada sistema y marque si presenta condiciones normales (N) o anormales (A). Normal indica funcionamiento saludable sin alteraciones. Anormal indica presencia de síntomas, irregularidades o condiciones que requieren atención.'
    }
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="h-screen flex flex-col overflow-hidden">
          <div className="flex-shrink-0">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
        <MobileNavigation />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen flex flex-col overflow-hidden">
        {/* Header - Fijo */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Contenido principal - Scrolleable */}
        <div className="flex-1 overflow-y-auto px-3 md:px-4 py-4 md:py-6 pb-24 lg:pb-8">
          {/* Animación de entrada smooth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            className="container mx-auto max-w-7xl"
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

            {/* SECCIÓN 1: EXAMEN DIAGNÓSTICO - CARDS COLAPSABLES */}
            <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
              <div className="flex items-center gap-3 mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
                <h2 className="text-xl md:text-2xl font-bold text-white">EXAMEN FÍSICO GENERAL</h2>
              </div>

              {/* SECCIÓN: SIGNOS VITALES */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Thermometer className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">SIGNOS VITALES</h3>
                </div>
                <p className="text-white/60 text-sm mb-6 leading-relaxed text-center md:text-left">
                  Complete los signos vitales y parámetros físicos del paciente. DH: Deshidratación, FC: Frecuencia Cardiaca, CC: Condición Corporal, FR: Frecuencia Respiratoria, TLLC: Tiempo de Llenado Capilar, RT: Reflejo Tusígeno, RD: Respuesta al Dolor, PS/PD: Presión Sistólica/Diastólica, PAM: Presión Arterial Media.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">DH</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.dh}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'dh', e.target.value)}
                      placeholder="Deshidratación"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">FC</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.fc}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'fc', e.target.value)}
                      placeholder="Frecuencia Cardiaca"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">CC</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.cc}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'cc', e.target.value)}
                      placeholder="Condición Corporal"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">FR</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.fr}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'fr', e.target.value)}
                      placeholder="Frecuencia Respiratoria"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">TLLC</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.tllc}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'tllc', e.target.value)}
                      placeholder="Tiempo de Llenado Capilar"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">RT</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.rt}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'rt', e.target.value)}
                      placeholder="Reflejo Tusígeno"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">RD</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.rd}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'rd', e.target.value)}
                      placeholder="Respuesta al Dolor"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">PS/PD</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.ps_pd}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'ps_pd', e.target.value)}
                      placeholder="Presión Sistólica/Diastólica"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm font-medium mb-2">PAM</label>
                    <input
                      type="text"
                      value={formulario.examenFisico.temperatura.pam}
                      onChange={(e) => actualizarExamenFisico('temperatura', 'pam', e.target.value)}
                      placeholder="Presión Arterial Media"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-red-400/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: EVALUACIÓN POR SISTEMAS */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-6 h-6 text-blue-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">EVALUACIÓN POR SISTEMAS</h3>
                </div>
                <p className="text-white/60 text-sm mb-6 leading-relaxed text-center md:text-left">
                  Evalúe cada sistema y marque si presenta condiciones normales (N) o anormales (A). Normal indica funcionamiento saludable sin alteraciones. Anormal indica presencia de síntomas, irregularidades o condiciones que requieren atención.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {camposSegundaCard.map((campo) => (
                    <div key={campo.key} className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-white/70 text-sm font-medium mb-2">{campo.label}</label>
                        <input
                          type="text"
                          value={formulario.examenFisico.segundaCard[campo.key]}
                          onChange={(e) => actualizarExamenFisico('segundaCard', campo.key, e.target.value)}
                          placeholder={campo.placeholder}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-blue-400/50 transition-colors"
                        />
                      </div>
                      <div className="flex gap-2 mt-7">
                        <button
                          type="button"
                          onClick={() => actualizarExamenFisico('segundaCard', `${campo.key}_normal`, 'N')}
                          className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                            formulario.examenFisico.segundaCard[`${campo.key}_normal`] === 'N'
                              ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          N
                        </button>
                        <button
                          type="button"
                          onClick={() => actualizarExamenFisico('segundaCard', `${campo.key}_normal`, 'A')}
                          className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                            formulario.examenFisico.segundaCard[`${campo.key}_normal`] === 'A'
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          A
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: LISTA DE PROBLEMAS */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">LISTA DE PROBLEMAS</h3>
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
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: ESTUDIOS DE LABORATORIO */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <FlaskConical className="w-6 h-6 text-purple-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">ESTUDIOS DE LABORATORIO</h3>
                </div>
                <textarea
                  value={formulario.estudiosLaboratorio}
                  onChange={(e) => setFormulario(prev => ({ ...prev, estudiosLaboratorio: e.target.value }))}
                  placeholder="Ingrese los estudios de laboratorio solicitados o resultados..."
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-colors resize-none"
                />
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: LISTA MAESTRA */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <Stethoscope className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">LISTA MAESTRA (Dx Presuntivos)</h3>
                </div>
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
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: DIAGNÓSTICO FINAL */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">DIAGNÓSTICO FINAL</h3>
                </div>
                <textarea
                  value={formulario.diagnosticoFinal}
                  onChange={(e) => setFormulario(prev => ({ ...prev, diagnosticoFinal: e.target.value }))}
                  placeholder="Ingrese el diagnóstico final del paciente..."
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-400/50 transition-colors resize-none"
                />
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: DIAGNÓSTICO DE LABORATORIO */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <FlaskConical className="w-6 h-6 text-pink-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">DIAGNÓSTICO DE LABORATORIO</h3>
                </div>
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
              </div>

              {/* Divisor visual */}
              <div className="my-8 border-t border-white/10"></div>

              {/* SECCIÓN: TRATAMIENTO */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <Pill className="w-6 h-6 text-yellow-400" />
                  <h3 className="text-xl md:text-2xl font-bold text-white">TRATAMIENTO EN INSTALACIONES Y RECETA (dosis y ml)</h3>
                </div>
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
              </div>
            </GlassCard>

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
        </div>
      </div>

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

export default ExpedienteClinicoPage;
