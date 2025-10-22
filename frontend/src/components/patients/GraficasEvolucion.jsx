/**
 * =====================================================
 * COMPONENTE DE GRÁFICAS DE EVOLUCIÓN
 * =====================================================
 * Muestra gráficas de peso y temperatura a lo largo del tiempo
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, Weight } from 'lucide-react';
import GlassCard from '../ui/GlassCard';

/**
 * Componente principal de gráficas
 */
const GraficasEvolucion = ({ consultas = [] }) => {
  const [datosPeso, setDatosPeso] = useState([]);
  const [datosTemperatura, setDatosTemperatura] = useState([]);
  const [estadisticasPeso, setEstadisticasPeso] = useState(null);
  const [estadisticasTemp, setEstadisticasTemp] = useState(null);

  useEffect(() => {
    procesarDatos();
  }, [consultas]);

  /**
   * Procesar datos de consultas para las gráficas
   */
  const procesarDatos = () => {
    if (!consultas || consultas.length === 0) return;

    // Ordenar por fecha
    const consultasOrdenadas = [...consultas].sort(
      (a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta)
    );

    // Procesar peso
    const peso = consultasOrdenadas
      .filter(c => c.peso_actual)
      .map(c => ({
        fecha: formatFecha(c.fecha_consulta),
        peso: parseFloat(c.peso_actual),
        fechaCompleta: new Date(c.fecha_consulta)
      }));

    // Procesar temperatura
    const temp = consultasOrdenadas
      .filter(c => c.temperatura)
      .map(c => ({
        fecha: formatFecha(c.fecha_consulta),
        temperatura: parseFloat(c.temperatura),
        fechaCompleta: new Date(c.fecha_consulta)
      }));

    setDatosPeso(peso);
    setDatosTemperatura(temp);

    // Calcular estadísticas
    if (peso.length > 0) {
      calcularEstadisticasPeso(peso);
    }

    if (temp.length > 0) {
      calcularEstadisticasTemp(temp);
    }
  };

  /**
   * Calcular estadísticas de peso
   */
  const calcularEstadisticasPeso = (datos) => {
    const pesos = datos.map(d => d.peso);
    const pesoActual = pesos[pesos.length - 1];
    const pesoAnterior = pesos.length > 1 ? pesos[pesos.length - 2] : pesoActual;
    const pesoMinimo = Math.min(...pesos);
    const pesoMaximo = Math.max(...pesos);
    const pesoPromedio = pesos.reduce((a, b) => a + b, 0) / pesos.length;
    const tendencia = pesoActual - pesoAnterior;

    setEstadisticasPeso({
      actual: pesoActual,
      anterior: pesoAnterior,
      minimo: pesoMinimo,
      maximo: pesoMaximo,
      promedio: pesoPromedio,
      tendencia: tendencia,
      tendenciaTexto: tendencia > 0 ? 'Aumentando' : tendencia < 0 ? 'Disminuyendo' : 'Estable',
      cambio: Math.abs(tendencia).toFixed(2)
    });
  };

  /**
   * Calcular estadísticas de temperatura
   */
  const calcularEstadisticasTemp = (datos) => {
    const temps = datos.map(d => d.temperatura);
    const tempActual = temps[temps.length - 1];
    const tempAnterior = temps.length > 1 ? temps[temps.length - 2] : tempActual;
    const tempMinima = Math.min(...temps);
    const tempMaxima = Math.max(...temps);
    const tempPromedio = temps.reduce((a, b) => a + b, 0) / temps.length;
    const tendencia = tempActual - tempAnterior;

    // Rango normal para perros: 38-39°C, gatos: 38-39.5°C
    const esNormal = tempActual >= 37.5 && tempActual <= 39.5;

    setEstadisticasTemp({
      actual: tempActual,
      anterior: tempAnterior,
      minima: tempMinima,
      maxima: tempMaxima,
      promedio: tempPromedio,
      tendencia: tendencia,
      esNormal: esNormal,
      cambio: Math.abs(tendencia).toFixed(1)
    });
  };

  /**
   * Formatear fecha para las gráficas
   */
  const formatFecha = (fechaString) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    });
  };

  // Si no hay datos
  if (datosPeso.length === 0 && datosTemperatura.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <Activity className="w-16 h-16 text-white/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">
          Sin datos para gráficas
        </h3>
        <p className="text-white/60">
          Registra consultas con peso y temperatura para ver la evolución
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-400" />
        Gráficas de Evolución
      </h2>

      {/* Gráfica de Peso */}
      {datosPeso.length > 0 && (
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Weight className="w-5 h-5 text-green-400" />
              Evolución del Peso
            </h3>

            {/* Estadísticas de Peso */}
            {estadisticasPeso && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard
                  label="Peso Actual"
                  value={`${estadisticasPeso.actual} kg`}
                  icon={Weight}
                  color="green"
                />
                <StatCard
                  label="Tendencia"
                  value={estadisticasPeso.tendenciaTexto}
                  icon={
                    estadisticasPeso.tendencia > 0
                      ? TrendingUp
                      : estadisticasPeso.tendencia < 0
                      ? TrendingDown
                      : Minus
                  }
                  color={
                    estadisticasPeso.tendencia > 0
                      ? 'yellow'
                      : estadisticasPeso.tendencia < 0
                      ? 'blue'
                      : 'gray'
                  }
                  sublabel={`${estadisticasPeso.cambio} kg`}
                />
                <StatCard
                  label="Promedio"
                  value={`${estadisticasPeso.promedio.toFixed(1)} kg`}
                  color="purple"
                />
                <StatCard
                  label="Mínimo"
                  value={`${estadisticasPeso.minimo} kg`}
                  color="blue"
                />
                <StatCard
                  label="Máximo"
                  value={`${estadisticasPeso.maximo} kg`}
                  color="red"
                />
              </div>
            )}
          </div>

          {/* Gráfica */}
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={datosPeso}>
              <defs>
                <linearGradient id="colorPeso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                label={{ value: 'Peso (kg)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              <Area
                type="monotone"
                dataKey="peso"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#colorPeso)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {/* Gráfica de Temperatura */}
      {datosTemperatura.length > 0 && (
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-red-400" />
              Evolución de la Temperatura
            </h3>

            {/* Estadísticas de Temperatura */}
            {estadisticasTemp && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <StatCard
                  label="Temperatura Actual"
                  value={`${estadisticasTemp.actual}°C`}
                  icon={Activity}
                  color={estadisticasTemp.esNormal ? 'green' : 'red'}
                  sublabel={estadisticasTemp.esNormal ? 'Normal' : 'Fuera de rango'}
                />
                <StatCard
                  label="Estado"
                  value={estadisticasTemp.esNormal ? 'Normal' : 'Alerta'}
                  color={estadisticasTemp.esNormal ? 'green' : 'red'}
                />
                <StatCard
                  label="Promedio"
                  value={`${estadisticasTemp.promedio.toFixed(1)}°C`}
                  color="purple"
                />
                <StatCard
                  label="Mínima"
                  value={`${estadisticasTemp.minima}°C`}
                  color="blue"
                />
                <StatCard
                  label="Máxima"
                  value={`${estadisticasTemp.maxima}°C`}
                  color="red"
                />
              </div>
            )}
          </div>

          {/* Gráfica */}
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={datosTemperatura}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="fecha"
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                style={{ fontSize: '12px' }}
                domain={[36, 41]}
                label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: 'rgba(255,255,255,0.7)' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
              {/* Línea de referencia para rango normal */}
              <Line
                type="monotone"
                dataKey={() => 38}
                stroke="rgba(16, 185, 129, 0.3)"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey={() => 39.5}
                stroke="rgba(16, 185, 129, 0.3)"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="temperatura"
                stroke="#EF4444"
                strokeWidth={3}
                dot={{ fill: '#EF4444', r: 5 }}
                activeDot={{ r: 8 }}
              />
              <Legend />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 text-sm text-white/60 text-center">
            Rango normal: 38°C - 39.5°C (líneas punteadas)
          </div>
        </GlassCard>
      )}
    </div>
  );
};

// =====================================================
// COMPONENTE: Tarjeta de estadística
// =====================================================
const StatCard = ({ label, value, icon: Icon, color = 'blue', sublabel }) => {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    gray: 'text-gray-400 bg-gray-500/10'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10"
    >
      {Icon && (
        <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-2`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className={`text-lg font-bold ${colorClasses[color].split(' ')[0]}`}>
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-white/50 mt-1">{sublabel}</p>
      )}
    </motion.div>
  );
};

export default GraficasEvolucion;
