/**
 * =====================================================
 * PÁGINA DE DETALLE DE EXPEDIENTE CLÍNICO
 * =====================================================
 * Vista de solo lectura del expediente clínico completo
 * con opción de editar para agregar notas adicionales
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  FileText,
  Activity,
  AlertCircle,
  FlaskConical,
  Stethoscope,
  Pill,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';

import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import MobileNavigation from '../components/layout/MobileNavigation';
import GlassCard from '../components/ui/GlassCard';
import toast from 'react-hot-toast';

const ExpedienteDetallePage = () => {
  const { pacienteId, expedienteId } = useParams();
  const navigate = useNavigate();

  // Estados principales
  const [expediente, setExpediente] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, [pacienteId, expedienteId]);

  /**
   * 📥 Cargar datos del expediente y paciente
   */
  const cargarDatos = async () => {
    try {
      setLoading(true);

      // TODO: Reemplazar con llamadas reales a la API
      // const [expedienteRes, pacienteRes] = await Promise.all([
      //   expedienteService.getById(pacienteId, expedienteId),
      //   patientService.getById(pacienteId)
      // ]);

      // DUMMY DATA
      setTimeout(() => {
        setPaciente({
          id: pacienteId,
          nombre_mascota: 'Croqueta',
          especie: 'Canino',
          raza: 'Golden Retriever',
          edad: '5 años',
          nombre_propietario: 'Juan Pérez'
        });

        setExpediente({
          id: expedienteId,
          fecha_consulta: '2024-11-20T10:30:00',
          veterinario: 'Dr. Carlos Ramírez',
          cedula_veterinario: '10356233',
          motivo_consulta: 'Expediente Clínico Completo',
          diagnostico: 'Gastritis leve, posible alergia alimentaria',
          tratamiento: 'Omeprazol 20mg cada 12h por 7 días; Dieta blanda',
          observaciones: `EXPEDIENTE CLÍNICO

LISTA DE PROBLEMAS:
1. Vómitos recurrentes (3 días)
2. Pérdida de apetito
3. Letargia moderada

ESTUDIOS DE LABORATORIO:
Hemograma completo: Valores normales
Bioquímica: Leve elevación de enzimas hepáticas

LISTA MAESTRA (Dx Presuntivos):
1. Gastritis aguda
2. Alergia alimentaria
3. Pancreatitis leve

DIAGNÓSTICO DE LABORATORIO:
1. Gastritis confirmada por ecografía
2. Descartada pancreatitis`
        });

        setLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error al cargar expediente:', error);
      toast.error('Error al cargar el expediente');
      setLoading(false);
    }
  };

  /**
   * 💾 Guardar cambios del expediente
   */
  const guardarCambios = async () => {
    try {
      toast.loading('Guardando cambios...');

      // TODO: Implementar llamada a API
      // await expedienteService.update(pacienteId, expedienteId, expediente);

      setTimeout(() => {
        toast.dismiss();
        toast.success('¡Cambios guardados exitosamente!');
        setModoEdicion(false);
      }, 1000);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      toast.error('Error al guardar los cambios');
    }
  };

  /**
   * ❌ Cancelar edición
   */
  const cancelarEdicion = () => {
    setModoEdicion(false);
    cargarDatos(); // Recargar datos originales
  };

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
        title={`📄 Detalle de Expediente - ${paciente?.nombre_mascota || ''}`}
        subtitle={`${paciente?.especie} • ${paciente?.raza} • ${paciente?.edad} • Propietario: ${paciente?.nombre_propietario}`}
        actions={[
          {
            icon: ArrowLeft,
            label: 'Volver',
            action: () => navigate(`/historial/${pacienteId}`),
            color: 'from-gray-500 to-gray-600'
          },
          modoEdicion ? {
            icon: Save,
            label: 'Guardar',
            action: guardarCambios,
            color: 'from-green-500 to-green-600'
          } : {
            icon: Edit,
            label: 'Editar',
            action: () => setModoEdicion(true),
            color: 'from-blue-500 to-blue-600'
          }
        ]}
      />

      <div className="container mx-auto px-3 md:px-4 py-4 md:py-6 max-w-7xl pb-24 md:pb-8">
        {/* Banner de modo edición */}
        {modoEdicion && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-500/20 border-2 border-blue-400/50 rounded-xl px-4 py-3 mb-4 md:mb-6"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-blue-300">
                <Edit className="w-5 h-5" />
                <span className="font-semibold text-sm md:text-base">Modo Edición - Puedes agregar o modificar información</span>
              </div>
              <button
                onClick={cancelarEdicion}
                className="text-blue-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Información del Veterinario y Fecha */}
        <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-white">
              <User className="w-5 h-5 text-orange-400" />
              <div>
                <p className="font-semibold">MVZ {expediente?.veterinario}</p>
                <p className="text-sm text-white/70">DGP: {expediente?.cedula_veterinario}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-white">
              <Clock className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-semibold">Fecha de consulta</p>
                <p className="text-sm text-white/70">
                  {new Date(expediente?.fecha_consulta).toLocaleDateString('es-MX', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Motivo de Consulta */}
        <SeccionDetalle
          titulo="Motivo de Consulta"
          icono={FileText}
          color="text-blue-400"
        >
          <p className="text-white text-sm md:text-base">{expediente?.motivo_consulta}</p>
        </SeccionDetalle>

        {/* Observaciones (contiene lista de problemas, estudios, etc.) */}
        {expediente?.observaciones && (
          <SeccionDetalle
            titulo="Información Detallada"
            icono={Activity}
            color="text-purple-400"
          >
            {modoEdicion ? (
              <textarea
                value={expediente.observaciones}
                onChange={(e) => setExpediente({ ...expediente, observaciones: e.target.value })}
                rows={15}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-purple-400/50 transition-colors resize-none font-mono text-sm"
              />
            ) : (
              <pre className="text-white/80 text-sm md:text-base whitespace-pre-wrap font-sans">
                {expediente.observaciones}
              </pre>
            )}
          </SeccionDetalle>
        )}

        {/* Diagnóstico Final */}
        <SeccionDetalle
          titulo="Diagnóstico Final"
          icono={CheckCircle2}
          color="text-green-400"
        >
          {modoEdicion ? (
            <textarea
              value={expediente.diagnostico}
              onChange={(e) => setExpediente({ ...expediente, diagnostico: e.target.value })}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-green-400/50 transition-colors resize-none"
            />
          ) : (
            <p className="text-white text-sm md:text-base">{expediente?.diagnostico}</p>
          )}
        </SeccionDetalle>

        {/* Tratamiento */}
        <SeccionDetalle
          titulo="Tratamiento"
          icono={Pill}
          color="text-yellow-400"
        >
          {modoEdicion ? (
            <textarea
              value={expediente.tratamiento}
              onChange={(e) => setExpediente({ ...expediente, tratamiento: e.target.value })}
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-yellow-400/50 transition-colors resize-none"
            />
          ) : (
            <p className="text-white text-sm md:text-base">{expediente?.tratamiento}</p>
          )}
        </SeccionDetalle>

        {/* Botones flotantes (móvil) */}
        {modoEdicion && (
          <div className="fixed bottom-20 right-4 md:hidden z-50 flex flex-col gap-3">
            <motion.button
              onClick={guardarCambios}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full shadow-xl flex items-center justify-center text-white"
            >
              <Save size={24} />
            </motion.button>
            <motion.button
              onClick={cancelarEdicion}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-xl flex items-center justify-center text-white"
            >
              <X size={24} />
            </motion.button>
          </div>
        )}
      </div>

      <MobileNavigation />
    </AppLayout>
  );
};

/**
 * 📦 Componente: Sección de Detalle
 */
const SeccionDetalle = ({ titulo, icono: Icono, color, children }) => {
  return (
    <GlassCard className="p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Icono className={`w-6 h-6 ${color}`} />
        <h2 className="text-xl md:text-2xl font-bold text-white">{titulo}</h2>
      </div>
      <div className="pl-0 md:pl-9">
        {children}
      </div>
    </GlassCard>
  );
};

export default ExpedienteDetallePage;
