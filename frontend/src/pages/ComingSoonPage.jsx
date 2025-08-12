// src/pages/ComingSoonPage.jsx - PÁGINA PARA MÓDULOS FUTUROS
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Pill, 
  BarChart3, 
  CreditCard, 
  Users, 
  ArrowLeft,
  Star,
  Clock,
  Zap
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Header from '../components/layout/Header';
import GlassCard from '../components/ui/GlassCard';
import GlassButton from '../components/ui/GlassButton';

const ComingSoonPage = () => {
  const { module } = useParams();
  const navigate = useNavigate();

  // Configuración de módulos futuros
  const moduleConfig = {
    'historiales': {
      title: 'Historiales Médicos',
      icon: FileText,
      color: 'from-orange-500 to-orange-600',
      description: 'Sistema completo de expedientes médicos digitales',
      features: [
        'Historial médico completo por mascota',
        'Diagnósticos y tratamientos detallados',
        'Archivos multimedia (rayos X, fotos)',
        'Línea de tiempo de procedimientos',
        'Compartir con especialistas',
        'Reportes médicos automatizados'
      ],
      eta: 'Q2 2025'
    },
    'tratamientos': {
      title: 'Tratamientos y Medicamentos',
      icon: Pill,
      color: 'from-pink-500 to-pink-600',
      description: 'Gestión integral de medicamentos y terapias',
      features: [
        'Base de datos de medicamentos veterinarios',
        'Cálculo automático de dosis',
        'Recordatorios de medicación',
        'Seguimiento de efectos secundarios',
        'Interacciones medicamentosas',
        'Protocolos de tratamiento'
      ],
      eta: 'Q3 2025'
    },
    'inventario': {
      title: 'Inventario y Suministros',
      icon: BarChart3,
      color: 'from-indigo-500 to-indigo-600',
      description: 'Control total de stock y suministros médicos',
      features: [
        'Control de stock en tiempo real',
        'Alertas de niveles mínimos',
        'Gestión de proveedores',
        'Códigos de barras y QR',
        'Reportes de consumo',
        'Órdenes de compra automáticas'
      ],
      eta: 'Q4 2025'
    },
    'facturacion': {
      title: 'Facturación y Pagos',
      icon: CreditCard,
      color: 'from-teal-500 to-teal-600',
      description: 'Sistema completo de facturación y cobranza',
      features: [
        'Facturación electrónica (SAT)',
        'Múltiples formas de pago',
        'Planes de financiamiento',
        'Reportes financieros',
        'Control de cartera',
        'Integración con bancos'
      ],
      eta: 'Q1 2026'
    },
    'equipo': {
      title: 'Equipo Médico',
      icon: Users,
      color: 'from-cyan-500 to-cyan-600',
      description: 'Gestión del personal y roles del equipo',
      features: [
        'Perfiles de veterinarios y asistentes',
        'Horarios y turnos',
        'Especialidades y certificaciones',
        'Performance y estadísticas',
        'Sistema de permisos',
        'Comunicación interna'
      ],
      eta: 'Q2 2026'
    },
    'reportes': {
      title: 'Reportes y Análisis',
      icon: BarChart3,
      color: 'from-emerald-500 to-emerald-600',
      description: 'Analytics avanzados y reportes inteligentes',
      features: [
        'Dashboard ejecutivo',
        'Reportes financieros automáticos',
        'Análisis de tendencias',
        'KPIs veterinarios',
        'Exportación a Excel/PDF',
        'Alertas inteligentes'
      ],
      eta: 'Q3 2026'
    }
  };

  const currentModule = moduleConfig[module] || moduleConfig['historiales'];
  const Icon = currentModule.icon;

  return (
    <AppLayout>
      <div className="min-h-screen pb-20 lg:pb-8">
        {/* Header */}
        <Header 
          title={currentModule.title}
          subtitle="Próximamente disponible"
        />

        {/* Contenido principal */}
        <div className="p-4 lg:p-6 pt-0 max-w-4xl mx-auto">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-8 lg:p-12 text-center mb-8">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className={`inline-flex p-6 rounded-2xl bg-gradient-to-r ${currentModule.color} mb-6`}
              >
                <Icon size={48} className="text-white" />
              </motion.div>

              {/* Título */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl lg:text-4xl font-bold text-white mb-4"
              >
                {currentModule.title}
              </motion.h1>

              {/* Descripción */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
              >
                {currentModule.description}
              </motion.p>

              {/* ETA */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-6 py-3 border border-white/20"
              >
                <Clock size={20} className="text-yellow-400" />
                <span className="text-white font-medium">Disponible {currentModule.eta}</span>
              </motion.div>
            </GlassCard>
          </motion.div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard className="p-6 lg:p-8 mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <Star className="text-yellow-400" size={24} />
                <h2 className="text-2xl font-bold text-white">Características Principales</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentModule.features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${currentModule.color}`}>
                      <Zap size={16} className="text-white" />
                    </div>
                    <span className="text-white/90 font-medium">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <GlassCard className="p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                ¿Te interesa este módulo?
              </h3>
              <p className="text-white/70 mb-6 max-w-md mx-auto">
                Regístrate para recibir notificaciones cuando esté disponible y obtén acceso anticipado.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <GlassButton
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-gray-500 to-gray-600"
                >
                  <ArrowLeft size={18} className="mr-2" />
                  Volver al Dashboard
                </GlassButton>
                
                <GlassButton
                  onClick={() => {/* Implementar notificaciones */}}
                  className={`bg-gradient-to-r ${currentModule.color}`}
                >
                  Notificarme cuando esté listo
                </GlassButton>
              </div>
            </GlassCard>
          </motion.div>

          {/* Progress Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <div className="inline-flex items-center space-x-2 text-white/50 text-sm">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full"
              />
              <span>En desarrollo activo...</span>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ComingSoonPage;