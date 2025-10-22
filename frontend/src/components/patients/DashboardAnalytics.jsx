/**
 * =====================================================
 * DASHBOARD DE ANALYTICS MÉDICO
 * =====================================================
 * Visualiza estadísticas y métricas del historial clínico
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Activity,
  TrendingUp,
  TrendingDown,
  FileText,
  Syringe,
  Bug,
  AlertTriangle,
  Calendar,
  Zap,
  Award
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { differenceInMonths, differenceInDays, subMonths } from 'date-fns';

/**
 * Componente principal del dashboard
 */
const DashboardAnalytics = ({ paciente, historial }) => {
  const [metricas, setMetricas] = useState(null);

  useEffect(() => {
    if (historial) {
      calcularMetricas();
    }
  }, [historial]);

  /**
   * Calcular todas las métricas
   */
  const calcularMetricas = () => {
    const metrics = {
      consultas: analizarConsultas(),
      vacunas: analizarVacunas(),
      desparasitaciones: analizarDesparasitaciones(),
      alergias: analizarAlergias(),
      salud: analizarSaludGeneral(),
      tendencias: analizarTendencias()
    };

    setMetricas(metrics);
  };

  /**
   * Analizar consultas
   */
  const analizarConsultas = () => {
    const consultas = historial.consultas || [];

    if (consultas.length === 0) {
      return {
        total: 0,
        ultimoMes: 0,
        promedioPorMes: 0,
        diagnosticosComunes: []
      };
    }

    const hoy = new Date();
    const ultimos30Dias = consultas.filter(c =>
      differenceInDays(hoy, new Date(c.fecha_consulta)) <= 30
    );

    // Calcular promedio mensual
    const primeraConsulta = new Date(consultas[consultas.length - 1].fecha_consulta);
    const mesesTranscurridos = differenceInMonths(hoy, primeraConsulta) || 1;
    const promedioPorMes = (consultas.length / mesesTranscurridos).toFixed(1);

    // Diagnósticos más comunes
    const diagnosticos = {};
    consultas.forEach(c => {
      if (c.diagnostico) {
        const diag = c.diagnostico.toLowerCase();
        diagnosticos[diag] = (diagnosticos[diag] || 0) + 1;
      }
    });

    const diagnosticosComunes = Object.entries(diagnosticos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, count]) => ({ nombre, count }));

    return {
      total: consultas.length,
      ultimoMes: ultimos30Dias.length,
      promedioPorMes: parseFloat(promedioPorMes),
      diagnosticosComunes
    };
  };

  /**
   * Analizar vacunas
   */
  const analizarVacunas = () => {
    const vacunas = historial.vacunas || [];

    if (vacunas.length === 0) {
      return {
        total: 0,
        alDia: false,
        proximasVacunas: []
      };
    }

    const hoy = new Date();

    // Próximas vacunas
    const proximasVacunas = vacunas
      .filter(v => v.fecha_proxima && new Date(v.fecha_proxima) > hoy)
      .sort((a, b) => new Date(a.fecha_proxima) - new Date(b.fecha_proxima))
      .slice(0, 3);

    // Verificar si está al día
    const vacunasAtrasadas = vacunas.filter(v =>
      v.fecha_proxima && new Date(v.fecha_proxima) < hoy
    ).length;

    return {
      total: vacunas.length,
      alDia: vacunasAtrasadas === 0,
      proximasVacunas,
      atrasadas: vacunasAtrasadas
    };
  };

  /**
   * Analizar desparasitaciones
   */
  const analizarDesparasitaciones = () => {
    const desp = historial.desparasitaciones || [];

    if (desp.length === 0) {
      return {
        total: 0,
        ultimaFecha: null,
        diasDesdeUltima: null
      };
    }

    const ultimaDesp = desp[0];
    const ultimaFecha = new Date(ultimaDesp.fecha_aplicacion);
    const diasDesdeUltima = differenceInDays(new Date(), ultimaFecha);

    return {
      total: desp.length,
      ultimaFecha: ultimaDesp.fecha_aplicacion,
      diasDesdeUltima,
      necesitaDesparasitacion: diasDesdeUltima > 90
    };
  };

  /**
   * Analizar alergias
   */
  const analizarAlergias = () => {
    const alergias = historial.alergias || [];

    const activas = alergias.filter(a => a.activa);
    const criticas = activas.filter(a => a.severidad === 'critica');
    const severas = activas.filter(a => a.severidad === 'severa');

    return {
      total: alergias.length,
      activas: activas.length,
      criticas: criticas.length,
      severas: severas.length,
      tieneAlergiasCriticas: criticas.length > 0
    };
  };

  /**
   * Analizar salud general
   */
  const analizarSaludGeneral = () => {
    const consultas = historial.consultas || [];

    if (consultas.length === 0) {
      return { score: 0, nivel: 'sin-datos' };
    }

    let score = 100;

    // Penalización por alergias críticas
    if (metricas?.alergias?.criticas > 0) score -= 30;
    else if (metricas?.alergias?.severas > 0) score -= 15;

    // Penalización por vacunas atrasadas
    if (metricas?.vacunas?.atrasadas > 0) score -= 20;

    // Penalización por desparasitación atrasada
    if (metricas?.desparasitaciones?.necesitaDesparasitacion) score -= 10;

    // Penalización por consultas frecuentes (puede indicar problemas)
    if (metricas?.consultas?.ultimoMes > 5) score -= 15;

    // Beneficio por estar al día con vacunas
    if (metricas?.vacunas?.alDia) score += 10;

    score = Math.max(0, Math.min(100, score));

    const nivel =
      score >= 80 ? 'excelente' :
      score >= 60 ? 'bueno' :
      score >= 40 ? 'regular' :
      'requiere-atencion';

    return { score, nivel };
  };

  /**
   * Analizar tendencias
   */
  const analizarTendencias = () => {
    const consultas = historial.consultas || [];

    if (consultas.length < 2) {
      return {
        peso: { tendencia: 'estable', cambio: 0 },
        temperatura: { tendencia: 'estable', cambio: 0 },
        frecuenciaConsultas: { tendencia: 'estable' }
      };
    }

    // Tendencia de peso
    const pesosConFecha = consultas
      .filter(c => c.peso_actual)
      .map(c => ({
        peso: parseFloat(c.peso_actual),
        fecha: new Date(c.fecha_consulta)
      }))
      .sort((a, b) => b.fecha - a.fecha);

    let tendenciaPeso = 'estable';
    let cambioPeso = 0;

    if (pesosConFecha.length >= 2) {
      const pesoActual = pesosConFecha[0].peso;
      const pesoAnterior = pesosConFecha[1].peso;
      cambioPeso = ((pesoActual - pesoAnterior) / pesoAnterior) * 100;

      if (Math.abs(cambioPeso) > 5) {
        tendenciaPeso = cambioPeso > 0 ? 'aumentando' : 'disminuyendo';
      }
    }

    // Tendencia de temperatura
    const tempsConFecha = consultas
      .filter(c => c.temperatura)
      .map(c => ({
        temp: parseFloat(c.temperatura),
        fecha: new Date(c.fecha_consulta)
      }))
      .sort((a, b) => b.fecha - a.fecha);

    let tendenciaTemp = 'normal';
    let cambioTemp = 0;

    if (tempsConFecha.length >= 2) {
      const tempActual = tempsConFecha[0].temp;
      const tempAnterior = tempsConFecha[1].temp;
      cambioTemp = tempActual - tempAnterior;

      if (tempActual > 39.5) tendenciaTemp = 'elevada';
      else if (tempActual < 37.5) tendenciaTemp = 'baja';
    }

    // Tendencia de frecuencia de consultas
    const ultimos3Meses = consultas.filter(c =>
      differenceInMonths(new Date(), new Date(c.fecha_consulta)) <= 3
    ).length;

    const meses4a6 = consultas.filter(c => {
      const meses = differenceInMonths(new Date(), new Date(c.fecha_consulta));
      return meses > 3 && meses <= 6;
    }).length;

    let frecuenciaTendencia = 'estable';
    if (ultimos3Meses > meses4a6 * 1.5) frecuenciaTendencia = 'aumentando';
    else if (ultimos3Meses < meses4a6 * 0.5) frecuenciaTendencia = 'disminuyendo';

    return {
      peso: { tendencia: tendenciaPeso, cambio: cambioPeso },
      temperatura: { tendencia: tendenciaTemp, cambio: cambioTemp },
      frecuenciaConsultas: { tendencia: frecuenciaTendencia }
    };
  };

  if (!historial || !paciente) {
    return null;
  }

  if (!metricas) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Dashboard de Analytics</h2>
      </div>

      {/* Puntuación de Salud General */}
      <SaludGeneralCard salud={metricas.salud} />

      {/* Métricas principales */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={FileText}
          label="Consultas Totales"
          value={metricas.consultas.total}
          sublabel={`${metricas.consultas.promedioPorMes}/mes promedio`}
          color="blue"
          trend={metricas.tendencias.frecuenciaConsultas.tendencia}
        />

        <MetricCard
          icon={Syringe}
          label="Vacunas Aplicadas"
          value={metricas.vacunas.total}
          sublabel={metricas.vacunas.alDia ? 'Al día ✓' : `${metricas.vacunas.atrasadas} atrasada(s)`}
          color={metricas.vacunas.alDia ? 'green' : 'red'}
        />

        <MetricCard
          icon={Bug}
          label="Desparasitaciones"
          value={metricas.desparasitaciones.total}
          sublabel={
            metricas.desparasitaciones.diasDesdeUltima !== null
              ? `Hace ${metricas.desparasitaciones.diasDesdeUltima} días`
              : 'Sin registros'
          }
          color={metricas.desparasitaciones.necesitaDesparasitacion ? 'orange' : 'purple'}
        />

        <MetricCard
          icon={AlertTriangle}
          label="Alergias Activas"
          value={metricas.alergias.activas}
          sublabel={
            metricas.alergias.criticas > 0
              ? `${metricas.alergias.criticas} crítica(s)`
              : metricas.alergias.severas > 0
              ? `${metricas.alergias.severas} severa(s)`
              : 'Bajo control'
          }
          color={metricas.alergias.criticas > 0 ? 'red' : metricas.alergias.severas > 0 ? 'orange' : 'green'}
        />
      </div>

      {/* Tendencias */}
      <GlassCard className="p-6">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Tendencias y Evolución
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <TendenciaCard
            label="Peso"
            tendencia={metricas.tendencias.peso.tendencia}
            cambio={metricas.tendencias.peso.cambio}
            unidad="%"
          />
          <TendenciaCard
            label="Temperatura"
            tendencia={metricas.tendencias.temperatura.tendencia}
            cambio={metricas.tendencias.temperatura.cambio}
            unidad="°C"
          />
          <TendenciaCard
            label="Frecuencia Consultas"
            tendencia={metricas.tendencias.frecuenciaConsultas.tendencia}
          />
        </div>
      </GlassCard>

      {/* Diagnósticos Comunes */}
      {metricas.consultas.diagnosticosComunes.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Diagnósticos Más Frecuentes
          </h3>
          <div className="space-y-3">
            {metricas.consultas.diagnosticosComunes.map((diag, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white/80 capitalize">{diag.nombre}</span>
                    <span className="text-white/60 text-sm">{diag.count} veces</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-blue-400 h-2 rounded-full transition-all"
                      style={{
                        width: `${(diag.count / metricas.consultas.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de Salud General
// =====================================================
const SaludGeneralCard = ({ salud }) => {
  const getNivelInfo = () => {
    switch (salud.nivel) {
      case 'excelente':
        return {
          color: 'green',
          label: 'Excelente',
          icon: Award,
          mensaje: 'El paciente está en excelente estado de salud'
        };
      case 'bueno':
        return {
          color: 'blue',
          label: 'Bueno',
          icon: Activity,
          mensaje: 'El paciente presenta buen estado de salud general'
        };
      case 'regular':
        return {
          color: 'yellow',
          label: 'Regular',
          icon: AlertTriangle,
          mensaje: 'Requiere atención a algunos aspectos de salud'
        };
      case 'requiere-atencion':
        return {
          color: 'red',
          label: 'Requiere Atención',
          icon: AlertTriangle,
          mensaje: 'Se recomienda atención veterinaria prioritaria'
        };
      default:
        return {
          color: 'gray',
          label: 'Sin Datos',
          icon: Activity,
          mensaje: 'Insuficientes datos para evaluar'
        };
    }
  };

  const info = getNivelInfo();
  const Icon = info.icon;

  const colorClasses = {
    green: 'border-green-400/30 bg-green-500/10',
    blue: 'border-blue-400/30 bg-blue-500/10',
    yellow: 'border-yellow-400/30 bg-yellow-500/10',
    red: 'border-red-400/30 bg-red-500/10',
    gray: 'border-gray-400/30 bg-gray-500/10'
  };

  return (
    <GlassCard className={`p-6 border-2 ${colorClasses[info.color]}`}>
      <div className="flex items-center gap-6">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${(salud.score / 100) * 251.2} 251.2`}
              className={`text-${info.color}-400`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{salud.score}</span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Icon className={`w-6 h-6 text-${info.color}-400`} />
            <h3 className="text-2xl font-bold text-white">{info.label}</h3>
          </div>
          <p className="text-white/70">{info.mensaje}</p>
          <p className="text-white/50 text-sm mt-2">
            Puntuación de salud general: {salud.score}/100
          </p>
        </div>
      </div>
    </GlassCard>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de métrica
// =====================================================
const MetricCard = ({ icon: Icon, label, value, sublabel, color, trend }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/20',
    green: 'text-green-400 bg-green-500/20',
    red: 'text-red-400 bg-red-500/20',
    orange: 'text-orange-400 bg-orange-500/20',
    purple: 'text-purple-400 bg-purple-500/20'
  };

  const getTrendIcon = () => {
    if (trend === 'aumentando') return <TrendingUp className="w-4 h-4 text-yellow-400" />;
    if (trend === 'disminuyendo') return <TrendingDown className="w-4 h-4 text-blue-400" />;
    return null;
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && getTrendIcon()}
      </div>
      <p className="text-white/60 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorClasses[color].split(' ')[0]}`}>{value}</p>
      <p className="text-white/50 text-xs mt-2">{sublabel}</p>
    </GlassCard>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de tendencia
// =====================================================
const TendenciaCard = ({ label, tendencia, cambio, unidad = '' }) => {
  const getTendenciaInfo = () => {
    switch (tendencia) {
      case 'aumentando':
        return { icon: TrendingUp, color: 'text-yellow-400', label: 'Aumentando' };
      case 'disminuyendo':
        return { icon: TrendingDown, color: 'text-blue-400', label: 'Disminuyendo' };
      case 'elevada':
        return { icon: AlertTriangle, color: 'text-red-400', label: 'Elevada' };
      case 'baja':
        return { icon: AlertTriangle, color: 'text-blue-400', label: 'Baja' };
      case 'normal':
        return { icon: Activity, color: 'text-green-400', label: 'Normal' };
      default:
        return { icon: Activity, color: 'text-gray-400', label: 'Estable' };
    }
  };

  const info = getTendenciaInfo();
  const Icon = info.icon;

  return (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
      <p className="text-white/60 text-sm mb-2">{label}</p>
      <div className="flex items-center gap-2">
        <Icon className={`w-5 h-5 ${info.color}`} />
        <span className={`font-semibold ${info.color}`}>{info.label}</span>
      </div>
      {cambio !== undefined && cambio !== 0 && (
        <p className="text-white/50 text-sm mt-1">
          {cambio > 0 ? '+' : ''}{cambio.toFixed(1)}{unidad}
        </p>
      )}
    </div>
  );
};

export default DashboardAnalytics;
