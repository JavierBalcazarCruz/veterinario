/**
 * =====================================================
 * COMPONENTE DE COMPARADOR DE PERIODOS
 * =====================================================
 * Compara métricas médicas entre diferentes periodos de tiempo
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Weight,
  Activity,
  FileText,
  Syringe,
  Bug,
  AlertTriangle,
  BarChart3,
  ArrowRight
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import { format, subMonths, subDays, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Componente principal del comparador
 */
const ComparadorPeriodos = ({ historial }) => {
  // Estados para los periodos
  const [periodo1, setPeriodo1] = useState({
    nombre: 'Periodo 1',
    fechaInicio: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
    fechaFin: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    color: 'blue'
  });

  const [periodo2, setPeriodo2] = useState({
    nombre: 'Periodo 2',
    fechaInicio: format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
    fechaFin: format(new Date(), 'yyyy-MM-dd'),
    color: 'purple'
  });

  // Estados para las comparaciones calculadas
  const [comparacion, setComparacion] = useState(null);
  const [loading, setLoading] = useState(false);

  // Periodos predefinidos
  const periodosPredefinidos = [
    {
      label: 'Últimos 30 días',
      getValue: () => ({
        fechaInicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        fechaFin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Últimos 3 meses',
      getValue: () => ({
        fechaInicio: format(subMonths(new Date(), 3), 'yyyy-MM-dd'),
        fechaFin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Últimos 6 meses',
      getValue: () => ({
        fechaInicio: format(subMonths(new Date(), 6), 'yyyy-MM-dd'),
        fechaFin: format(new Date(), 'yyyy-MM-dd')
      })
    },
    {
      label: 'Último año',
      getValue: () => ({
        fechaInicio: format(subMonths(new Date(), 12), 'yyyy-MM-dd'),
        fechaFin: format(new Date(), 'yyyy-MM-dd')
      })
    }
  ];

  /**
   * Calcular comparación entre periodos
   */
  const calcularComparacion = () => {
    if (!historial) return;

    setLoading(true);

    try {
      const p1 = procesarPeriodo(periodo1, historial);
      const p2 = procesarPeriodo(periodo2, historial);

      const comparacionCalculada = {
        periodo1: p1,
        periodo2: p2,
        diferencias: calcularDiferencias(p1, p2)
      };

      setComparacion(comparacionCalculada);
    } catch (error) {
      console.error('Error al calcular comparación:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Procesar datos de un periodo específico
   */
  const procesarPeriodo = (periodo, historial) => {
    const fechaInicio = new Date(periodo.fechaInicio);
    const fechaFin = new Date(periodo.fechaFin);
    fechaFin.setHours(23, 59, 59, 999);

    // Filtrar consultas del periodo
    const consultasPeriodo = (historial.consultas || []).filter(c =>
      isWithinInterval(new Date(c.fecha_consulta), { start: fechaInicio, end: fechaFin })
    );

    // Filtrar vacunas del periodo
    const vacunasPeriodo = (historial.vacunas || []).filter(v =>
      isWithinInterval(new Date(v.fecha_aplicacion), { start: fechaInicio, end: fechaFin })
    );

    // Filtrar desparasitaciones del periodo
    const desparasitacionesPeriodo = (historial.desparasitaciones || []).filter(d =>
      isWithinInterval(new Date(d.fecha_aplicacion), { start: fechaInicio, end: fechaFin })
    );

    // Filtrar cirugías del periodo
    const cirugiasPeriodo = (historial.cirugias || []).filter(c =>
      isWithinInterval(new Date(c.fecha_realizacion), { start: fechaInicio, end: fechaFin })
    );

    // Calcular métricas de peso
    const pesosDelPeriodo = consultasPeriodo
      .filter(c => c.peso_actual)
      .map(c => parseFloat(c.peso_actual));

    const pesoPromedio = pesosDelPeriodo.length > 0
      ? pesosDelPeriodo.reduce((a, b) => a + b, 0) / pesosDelPeriodo.length
      : 0;

    const pesoMinimo = pesosDelPeriodo.length > 0 ? Math.min(...pesosDelPeriodo) : 0;
    const pesoMaximo = pesosDelPeriodo.length > 0 ? Math.max(...pesosDelPeriodo) : 0;

    // Calcular métricas de temperatura
    const temperaturasDelPeriodo = consultasPeriodo
      .filter(c => c.temperatura)
      .map(c => parseFloat(c.temperatura));

    const temperaturaPromedio = temperaturasDelPeriodo.length > 0
      ? temperaturasDelPeriodo.reduce((a, b) => a + b, 0) / temperaturasDelPeriodo.length
      : 0;

    return {
      nombre: periodo.nombre,
      fechaInicio: periodo.fechaInicio,
      fechaFin: periodo.fechaFin,
      color: periodo.color,
      consultas: {
        total: consultasPeriodo.length,
        datos: consultasPeriodo
      },
      vacunas: {
        total: vacunasPeriodo.length,
        datos: vacunasPeriodo
      },
      desparasitaciones: {
        total: desparasitacionesPeriodo.length,
        datos: desparasitacionesPeriodo
      },
      cirugias: {
        total: cirugiasPeriodo.length,
        datos: cirugiasPeriodo
      },
      peso: {
        promedio: pesoPromedio,
        minimo: pesoMinimo,
        maximo: pesoMaximo,
        registros: pesosDelPeriodo.length
      },
      temperatura: {
        promedio: temperaturaPromedio,
        registros: temperaturasDelPeriodo.length
      }
    };
  };

  /**
   * Calcular diferencias entre dos periodos
   */
  const calcularDiferencias = (p1, p2) => {
    return {
      consultas: {
        diferencia: p2.consultas.total - p1.consultas.total,
        porcentaje: p1.consultas.total > 0
          ? ((p2.consultas.total - p1.consultas.total) / p1.consultas.total) * 100
          : 0
      },
      vacunas: {
        diferencia: p2.vacunas.total - p1.vacunas.total,
        porcentaje: p1.vacunas.total > 0
          ? ((p2.vacunas.total - p1.vacunas.total) / p1.vacunas.total) * 100
          : 0
      },
      desparasitaciones: {
        diferencia: p2.desparasitaciones.total - p1.desparasitaciones.total,
        porcentaje: p1.desparasitaciones.total > 0
          ? ((p2.desparasitaciones.total - p1.desparasitaciones.total) / p1.desparasitaciones.total) * 100
          : 0
      },
      cirugias: {
        diferencia: p2.cirugias.total - p1.cirugias.total,
        porcentaje: p1.cirugias.total > 0
          ? ((p2.cirugias.total - p1.cirugias.total) / p1.cirugias.total) * 100
          : 0
      },
      peso: {
        diferencia: p2.peso.promedio - p1.peso.promedio,
        porcentaje: p1.peso.promedio > 0
          ? ((p2.peso.promedio - p1.peso.promedio) / p1.peso.promedio) * 100
          : 0
      },
      temperatura: {
        diferencia: p2.temperatura.promedio - p1.temperatura.promedio,
        porcentaje: p1.temperatura.promedio > 0
          ? ((p2.temperatura.promedio - p1.temperatura.promedio) / p1.temperatura.promedio) * 100
          : 0
      }
    };
  };

  /**
   * Aplicar periodo predefinido
   */
  const aplicarPeriodoPredefinido = (periodo, numeroPeriodo) => {
    const fechas = periodo.getValue();
    if (numeroPeriodo === 1) {
      setPeriodo1({ ...periodo1, ...fechas });
    } else {
      setPeriodo2({ ...periodo2, ...fechas });
    }
  };

  // Calcular automáticamente al cambiar periodos
  useEffect(() => {
    calcularComparacion();
  }, [periodo1.fechaInicio, periodo1.fechaFin, periodo2.fechaInicio, periodo2.fechaFin, historial]);

  if (!historial) {
    return (
      <GlassCard className="p-8 text-center">
        <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          No hay datos disponibles
        </h3>
        <p className="text-white/60">
          Carga el historial del paciente para comparar periodos
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-7 h-7 text-purple-400" />
        <h2 className="text-2xl font-bold text-white">Comparador de Periodos</h2>
      </div>

      {/* Configuración de Periodos */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Periodo 1 */}
        <GlassCard className="p-6 border-2 border-blue-400/30">
          <div className="mb-4">
            <input
              type="text"
              value={periodo1.nombre}
              onChange={(e) => setPeriodo1({ ...periodo1, nombre: e.target.value })}
              className="text-lg font-semibold bg-transparent text-white border-b border-blue-400/30 focus:outline-none focus:border-blue-400 w-full pb-2"
              placeholder="Nombre del periodo"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Fecha Inicio</label>
              <input
                type="date"
                value={periodo1.fechaInicio}
                onChange={(e) => setPeriodo1({ ...periodo1, fechaInicio: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Fecha Fin</label>
              <input
                type="date"
                value={periodo1.fechaFin}
                onChange={(e) => setPeriodo1({ ...periodo1, fechaFin: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-400/50"
              />
            </div>

            {/* Periodos predefinidos */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Periodos rápidos</label>
              <div className="grid grid-cols-2 gap-2">
                {periodosPredefinidos.map((periodo, index) => (
                  <button
                    key={index}
                    onClick={() => aplicarPeriodoPredefinido(periodo, 1)}
                    className="text-xs px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-300 transition-all"
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Periodo 2 */}
        <GlassCard className="p-6 border-2 border-purple-400/30">
          <div className="mb-4">
            <input
              type="text"
              value={periodo2.nombre}
              onChange={(e) => setPeriodo2({ ...periodo2, nombre: e.target.value })}
              className="text-lg font-semibold bg-transparent text-white border-b border-purple-400/30 focus:outline-none focus:border-purple-400 w-full pb-2"
              placeholder="Nombre del periodo"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Fecha Inicio</label>
              <input
                type="date"
                value={periodo2.fechaInicio}
                onChange={(e) => setPeriodo2({ ...periodo2, fechaInicio: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-400/50"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Fecha Fin</label>
              <input
                type="date"
                value={periodo2.fechaFin}
                onChange={(e) => setPeriodo2({ ...periodo2, fechaFin: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-purple-400/50"
              />
            </div>

            {/* Periodos predefinidos */}
            <div>
              <label className="text-white/70 text-sm mb-2 block">Periodos rápidos</label>
              <div className="grid grid-cols-2 gap-2">
                {periodosPredefinidos.map((periodo, index) => (
                  <button
                    key={index}
                    onClick={() => aplicarPeriodoPredefinido(periodo, 2)}
                    className="text-xs px-3 py-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 rounded-lg text-purple-300 transition-all"
                  >
                    {periodo.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Resultados de la Comparación */}
      {comparacion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-green-400" />
            Resultados de la Comparación
          </h3>

          {/* Grid de comparaciones */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Consultas */}
            <ComparisonCard
              icon={FileText}
              label="Consultas"
              periodo1={comparacion.periodo1.consultas.total}
              periodo2={comparacion.periodo2.consultas.total}
              diferencia={comparacion.diferencias.consultas}
              colorP1="blue"
              colorP2="purple"
            />

            {/* Vacunas */}
            <ComparisonCard
              icon={Syringe}
              label="Vacunas"
              periodo1={comparacion.periodo1.vacunas.total}
              periodo2={comparacion.periodo2.vacunas.total}
              diferencia={comparacion.diferencias.vacunas}
              colorP1="blue"
              colorP2="purple"
            />

            {/* Desparasitaciones */}
            <ComparisonCard
              icon={Bug}
              label="Desparasitaciones"
              periodo1={comparacion.periodo1.desparasitaciones.total}
              periodo2={comparacion.periodo2.desparasitaciones.total}
              diferencia={comparacion.diferencias.desparasitaciones}
              colorP1="blue"
              colorP2="purple"
            />

            {/* Cirugías */}
            <ComparisonCard
              icon={AlertTriangle}
              label="Cirugías"
              periodo1={comparacion.periodo1.cirugias.total}
              periodo2={comparacion.periodo2.cirugias.total}
              diferencia={comparacion.diferencias.cirugias}
              colorP1="blue"
              colorP2="purple"
            />

            {/* Peso Promedio */}
            <ComparisonCard
              icon={Weight}
              label="Peso Promedio"
              periodo1={comparacion.periodo1.peso.promedio}
              periodo2={comparacion.periodo2.peso.promedio}
              diferencia={comparacion.diferencias.peso}
              colorP1="blue"
              colorP2="purple"
              unidad="kg"
              decimales={1}
            />

            {/* Temperatura Promedio */}
            <ComparisonCard
              icon={Activity}
              label="Temperatura Promedio"
              periodo1={comparacion.periodo1.temperatura.promedio}
              periodo2={comparacion.periodo2.temperatura.promedio}
              diferencia={comparacion.diferencias.temperatura}
              colorP1="blue"
              colorP2="purple"
              unidad="°C"
              decimales={1}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de comparación
// =====================================================
const ComparisonCard = ({
  icon: Icon,
  label,
  periodo1,
  periodo2,
  diferencia,
  colorP1 = 'blue',
  colorP2 = 'purple',
  unidad = '',
  decimales = 0
}) => {
  const formatValue = (value) => {
    if (value === 0) return '0';
    return decimales > 0 ? value.toFixed(decimales) : Math.round(value);
  };

  const getTendenciaIcon = () => {
    if (diferencia.diferencia > 0) return TrendingUp;
    if (diferencia.diferencia < 0) return TrendingDown;
    return Minus;
  };

  const getTendenciaColor = () => {
    if (diferencia.diferencia > 0) return 'text-green-400';
    if (diferencia.diferencia < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const TendenciaIcon = getTendenciaIcon();

  return (
    <GlassCard className="p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-white/70" />
        </div>
        <h4 className="font-semibold text-white">{label}</h4>
      </div>

      <div className="space-y-3">
        {/* Periodo 1 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Periodo 1</span>
          <span className={`text-lg font-bold text-${colorP1}-400`}>
            {formatValue(periodo1)}{unidad}
          </span>
        </div>

        {/* Periodo 2 */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/60">Periodo 2</span>
          <span className={`text-lg font-bold text-${colorP2}-400`}>
            {formatValue(periodo2)}{unidad}
          </span>
        </div>

        {/* Diferencia */}
        <div className={`flex items-center justify-between pt-3 border-t border-white/10 ${getTendenciaColor()}`}>
          <div className="flex items-center gap-2">
            <TendenciaIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Cambio</span>
          </div>
          <div className="text-right">
            <div className="font-bold">
              {diferencia.diferencia > 0 ? '+' : ''}
              {formatValue(diferencia.diferencia)}{unidad}
            </div>
            <div className="text-xs">
              ({diferencia.porcentaje > 0 ? '+' : ''}
              {diferencia.porcentaje.toFixed(1)}%)
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default ComparadorPeriodos;
